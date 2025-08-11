/*
  Neon Snake - HTML5 Canvas Game
  Controls: Arrow Keys / WASD, Space or P to pause, R to restart
*/

(function () {
  'use strict';

  /**
   * Utility helpers
   */
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFloat = (min, max) => Math.random() * (max - min) + min;

  /**
   * Canvas and layout
   */
  const canvas = document.getElementById('gameCanvas');
  const CSS_WIDTH = 1024;
  const CSS_HEIGHT = 768;
  const DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  canvas.style.width = CSS_WIDTH + 'px';
  canvas.style.height = CSS_HEIGHT + 'px';
  canvas.width = CSS_WIDTH * DPR;
  canvas.height = CSS_HEIGHT * DPR;
  const ctx = canvas.getContext('2d');
  // Scale drawing operations to CSS pixels for crisp rendering
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  // Grid settings (32px fits 1024x768 exactly)
  const CELL_SIZE = 32;
  const COLUMNS = Math.floor(CSS_WIDTH / CELL_SIZE);
  const ROWS = Math.floor(CSS_HEIGHT / CELL_SIZE);

  /**
   * Game state
   */
  const Direction = {
    Up: 'Up',
    Down: 'Down',
    Left: 'Left',
    Right: 'Right',
  };

  let gameState = 'init'; // init | playing | paused | dying | gameover
  let score = 0;
  let highScore = Number(localStorage.getItem('neonSnakeHighScore') || '0');

  /**
   * Snake model
   */
  /**
   * @typedef {{x: number, y: number}} Cell
   */
  /** @type {Cell[]} */
  let snake = [];
  /** @type {Direction} */
  let direction = Direction.Right;
  /** @type {Direction} */
  let nextDirection = Direction.Right;

  /** @type {Cell} */
  let food = { x: 10, y: 10 };

  let speedMs = 120; // lower is faster
  let lastTickAt = 0;
  let lastFrameAt = 0;

  // Particles
  /** @typedef {{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number,color:string,shape:'circle'|'square',glow:string,gravity?:number}} Particle */
  /** @type {Particle[]} */
  const particles = [];
  let foodSparkTimer = 0; // seconds accumulator
  let deathTimer = 0; // seconds remaining in death animation

  /**
   * DOM elements
   */
  const overlay = document.getElementById('overlay');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const startBtn = document.getElementById('startBtn');
  highScoreEl.textContent = String(highScore);

  function resetGame() {
    score = 0;
    scoreEl.textContent = '0';
    speedMs = 120;
    // spawn snake centered
    const startX = Math.floor(COLUMNS / 2);
    const startY = Math.floor(ROWS / 2);
    snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    direction = Direction.Right;
    nextDirection = Direction.Right;
    placeFood();
  }

  function placeFood() {
    while (true) {
      const candidate = { x: randomInt(0, COLUMNS - 1), y: randomInt(0, ROWS - 1) };
      const collides = snake.some(seg => seg.x === candidate.x && seg.y === candidate.y);
      if (!collides) {
        food = candidate;
        return;
      }
    }
  }

  function startGame() {
    resetGame();
    gameState = 'playing';
    hideOverlay();
  }

  function startDeathSequence() {
    if (gameState === 'dying' || gameState === 'gameover') return;
    gameState = 'dying';
    deathTimer = 1.1; // seconds

    // Spawn explosion particles from each snake segment
    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];
      const centerX = seg.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = seg.y * CELL_SIZE + CELL_SIZE / 2;
      const baseHue = 200 + (i / Math.max(1, snake.length - 1)) * 160; // cyan->magenta
      for (let k = 0; k < 6; k++) {
        const angle = randomFloat(0, Math.PI * 2);
        const speed = randomFloat(80, 240);
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: randomFloat(0.6, 1.1),
          size: randomFloat(2, 5),
          color: `hsl(${baseHue}, 100%, 60%)`,
          shape: 'square',
          glow: 'rgba(255,255,255,0.6)',
          gravity: 140,
        });
      }
    }
    // Clear the snake immediately to emphasize break effect
    snake = [];
  }

  function finalizeGameOver() {
    gameState = 'gameover';
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('neonSnakeHighScore', String(highScore));
      highScoreEl.textContent = String(highScore);
    }
    showOverlay('Game Over', `Score: ${score} • Best: ${highScore}`, 'Press R to Restart');
  }

  function togglePause() {
    if (gameState === 'playing') {
      gameState = 'paused';
      showOverlay('Paused', 'Take a breather.', 'Press Space to Resume');
    } else if (gameState === 'paused') {
      gameState = 'playing';
      hideOverlay();
    }
  }

  function showOverlay(title, subtitle, buttonText) {
    overlay.classList.add('visible');
    overlay.innerHTML = `
      <div class="overlay-inner">
        <h1 class="title neon">${title}</h1>
        <p class="subtitle">${subtitle}</p>
        <div class="controls">
          <div><span class="key">W A S D</span> or <span class="key">Arrow Keys</span> to move</div>
          <div><span class="key">Space</span> or <span class="key">P</span> to pause</div>
          <div><span class="key">R</span> to restart</div>
        </div>
        <button id="overlayBtn" class="btn neon">${buttonText}</button>
      </div>
    `;
    const btn = document.getElementById('overlayBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (gameState === 'init' || gameState === 'paused') {
          gameState = 'playing';
          hideOverlay();
        } else if (gameState === 'gameover') {
          startGame();
        }
      });
    }
  }

  function hideOverlay() {
    overlay.classList.remove('visible');
  }

  /**
   * Input handling
   */
  const keyToDirection = new Map([
    ['ArrowUp', Direction.Up],
    ['KeyW', Direction.Up],
    ['ArrowDown', Direction.Down],
    ['KeyS', Direction.Down],
    ['ArrowLeft', Direction.Left],
    ['KeyA', Direction.Left],
    ['ArrowRight', Direction.Right],
    ['KeyD', Direction.Right],
  ]);

  function isOpposite(a, b) {
    return (
      (a === Direction.Up && b === Direction.Down) ||
      (a === Direction.Down && b === Direction.Up) ||
      (a === Direction.Left && b === Direction.Right) ||
      (a === Direction.Right && b === Direction.Left)
    );
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'KeyP') {
      e.preventDefault();
      if (gameState === 'init') {
        startGame();
      } else if (gameState === 'playing' || gameState === 'paused') {
        togglePause();
      }
      return;
    }
    if (e.code === 'KeyR') {
      e.preventDefault();
      startGame();
      return;
    }
    const dir = keyToDirection.get(e.code);
    if (dir) {
      e.preventDefault();
      if (!isOpposite(dir, direction)) {
        nextDirection = dir;
      }
    }
  });

  if (startBtn) {
    startBtn.addEventListener('click', () => startGame());
  }

  /**
   * Game loop
   */
  function tick(now) {
    requestAnimationFrame(tick);

    if (!lastFrameAt) lastFrameAt = now;
    const dt = Math.min(0.033, Math.max(0.001, (now - lastFrameAt) / 1000)); // seconds, capped
    lastFrameAt = now;

    // Always update particles and ambient effects
    updateParticles(dt);
    spawnFoodAmbient(dt);

    if (gameState === 'playing') {
      if (now - lastTickAt >= speedMs) {
        lastTickAt = now;
        stepSnake();
      }
    } else if (gameState === 'dying') {
      deathTimer -= dt;
      if (deathTimer <= 0) {
        finalizeGameOver();
      }
    }

    render();
  }

  function stepSnake() {
    direction = nextDirection;
    const head = snake[0];
    const next = { x: head.x, y: head.y };
    if (direction === Direction.Up) next.y -= 1;
    if (direction === Direction.Down) next.y += 1;
    if (direction === Direction.Left) next.x -= 1;
    if (direction === Direction.Right) next.x += 1;

    // Wall collision
    if (next.x < 0 || next.x >= COLUMNS || next.y < 0 || next.y >= ROWS) {
      startDeathSequence();
      return;
    }

    // Determine if we will eat so we can allow moving into the current tail cell when it moves away
    const willEat = next.x === food.x && next.y === food.y;

    // Self collision (ignore tail if it will move this tick)
    const bodyToCheckCount = willEat ? snake.length : Math.max(0, snake.length - 1);
    for (let i = 0; i < bodyToCheckCount; i++) {
      const seg = snake[i];
      if (seg.x === next.x && seg.y === next.y) {
        startDeathSequence();
        return;
      }
    }

    // Move
    snake.unshift(next);

    // Food collision
    if (willEat) {
      score += 10;
      scoreEl.textContent = String(score);
      placeFood();
      // speed up slightly with cap
      speedMs = clamp(speedMs - 3, 55, 120);
    } else {
      snake.pop();
    }
  }

  /**
   * Particles and food effects
   */
  function spawnFoodAmbient(dt) {
    // Emit small sparkles around food at a steady rate
    foodSparkTimer += dt;
    const emitInterval = 0.05; // seconds
    const maxParticles = 140;
    while (foodSparkTimer >= emitInterval && particles.length < maxParticles) {
      foodSparkTimer -= emitInterval;
      const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
      const angle = randomFloat(0, Math.PI * 2);
      const radius = randomFloat(2, CELL_SIZE * 0.45);
      const px = centerX + Math.cos(angle) * radius;
      const py = centerY + Math.sin(angle) * radius;
      const speed = randomFloat(10, 60);
      const outward = angle + randomFloat(-0.7, 0.7);
      particles.push({
        x: px,
        y: py,
        vx: Math.cos(outward) * speed,
        vy: Math.sin(outward) * speed,
        life: 0,
        maxLife: randomFloat(0.6, 1.2),
        size: randomFloat(1.8, 3.2),
        color: 'rgba(255, 232, 0, 1)',
        shape: 'circle',
        glow: 'rgba(255, 122, 0, 0.9)'
      });
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      if (p.gravity) p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Fade out
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
      }
    }
  }

  /**
   * Rendering
   */
  function render() {
    ctx.clearRect(0, 0, CSS_WIDTH, CSS_HEIGHT);

    // Glow backdrop vignette
    const grad = ctx.createRadialGradient(
      CSS_WIDTH * 0.55,
      CSS_HEIGHT * 0.45,
      40,
      CSS_WIDTH * 0.5,
      CSS_HEIGHT * 0.5,
      Math.max(CSS_WIDTH, CSS_HEIGHT) * 0.7
    );
    grad.addColorStop(0, 'rgba(0, 234, 255, 0.06)');
    grad.addColorStop(0.5, 'rgba(255, 0, 255, 0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CSS_WIDTH, CSS_HEIGHT);

    // Draw food (circular neon + particles)
    drawFood();

    // Draw snake segments with tail gradient
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const t = i / Math.max(1, snake.length - 1);
      const colorA = '#00eaff';
      const colorB = '#ff00ff';
      const mix = lerpColor(colorA, colorB, 1 - t * 0.8);
      drawNeonCell(seg.x, seg.y, mix, '#00eaff');
    }

    // Particles on top
    drawParticles();

    // Optional: draw scanlines for extra retro vibe
    drawScanlines();
  }
  function drawFood() {
    const cx = food.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = food.y * CELL_SIZE + CELL_SIZE / 2;
    const r = CELL_SIZE * 0.28;

    // Glow halo
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, r * 3.2);
    glow.addColorStop(0, 'rgba(255, 232, 0, 0.95)');
    glow.addColorStop(0.4, 'rgba(255, 122, 0, 0.65)');
    glow.addColorStop(1, 'rgba(255, 122, 0, 0.0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.6, 0, Math.PI * 2);
    ctx.fill();

    // Core
    const core = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    core.addColorStop(0, '#fffbe6');
    core.addColorStop(1, '#ffe800');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const alpha = 1 - p.life / p.maxLife;
      ctx.shadowColor = p.glow;
      ctx.shadowBlur = 12;
      ctx.fillStyle = applyAlphaToColor(p.color, alpha);
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.restore();
  }

  function applyAlphaToColor(color, alpha) {
    if (color.startsWith('rgb(')) {
      // convert rgb(r,g,b) to rgba
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    if (color.startsWith('rgba(')) {
      return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^\)]+\)/, `rgba($1,$2,$3,${alpha})`);
    }
    if (color.startsWith('#')) {
      const { r, g, b } = hexToRgb(color);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }

  function cellToPixels(x, y) {
    return { px: x * CELL_SIZE, py: y * CELL_SIZE, size: CELL_SIZE };
  }

  function drawNeonCell(x, y, color, glowColor) {
    const { px, py, size } = cellToPixels(x, y);
    const inset = 4;
    const innerX = px + inset;
    const innerY = py + inset;
    const innerSize = size - inset * 2;

    // Outer glow
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(innerX, innerY, innerSize, innerSize);
    ctx.restore();

    // Inner neon body (square)
    const grad = ctx.createLinearGradient(innerX, innerY, innerX + innerSize, innerY + innerSize);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'white');
    ctx.fillStyle = grad;
    ctx.fillRect(innerX, innerY, innerSize, innerSize);
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function lerpColor(a, b, t) {
    const c1 = hexToRgb(a);
    const c2 = hexToRgb(b);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const bl = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }

  function drawScanlines() {
    const spacing = 4;
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#000000';
    for (let y = 0; y < CSS_HEIGHT; y += spacing) {
      ctx.fillRect(0, y, CSS_WIDTH, 1);
    }
    ctx.restore();
  }

  // Initialize
  showOverlay('NEON SNAKE', 'Eat the glowing orbs. Don\'t hit the walls or yourself.', 'Press Space to Start');
  requestAnimationFrame(tick);
})();


