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
  const hypot = (x, y) => Math.sqrt(x * x + y * y);

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
  let elapsedSec = 0;
  let mouthOpenTimer = 0; // seconds remaining for eat animation
  let hitShakeTimer = 0;  // seconds remaining for hit shake

  // Particles
  /** @typedef {{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number,color:string,shape:'circle'|'square',glow:string,gravity?:number}} Particle */
  /** @type {Particle[]} */
  const particles = [];
  let foodSparkTimer = 0; // seconds accumulator
  let deathTimer = 0; // seconds remaining in death animation

  // Visual constants
  const COLOR_A = '#00eaff';
  const COLOR_B = '#ff00ff';
  const BODY_RADIUS = Math.round(CELL_SIZE * 0.36);
  const HEAD_RADIUS = Math.round(BODY_RADIUS * 1.15);
  const USE_SPLINE_SMOOTHING = true;
  const MOUTH_ANIM_DURATION = 0.45; // seconds
  // For smooth rendering between ticks
  /** @type {Cell[]} */
  let lastSnakePositions = [];

  /**
   * DOM elements
   */
  const overlay = document.getElementById('overlay');
  // Make overlay focusable for keyboard events
  overlay.setAttribute('tabindex', '0');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const startBtn = document.getElementById('startBtn');
  // Ensure canvas can receive focus for keyboard events when overlay is hidden
  canvas.setAttribute('tabindex', '0');
  canvas.addEventListener('click', () => canvas.focus());
  // Focus canvas immediately so spacebar works from the start
  setTimeout(() => canvas.focus(), 100);
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
    lastSnakePositions = snake.map(s => ({ ...s }));
    lastTickAt = performance.now();
    lastFrameAt = lastTickAt;
    mouthOpenTimer = 0;
    hitShakeTimer = 0;
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
    deathTimer = 0.9; // show overlay after brief reaction
    hitShakeTimer = 0.5; // brief shake on impact
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
    // Focus overlay so it can receive keyboard events immediately
    setTimeout(() => overlay.focus(), 50);
    const btn = document.getElementById('overlayBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (gameState === 'init') {
          startGame();
        } else if (gameState === 'paused') {
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
    // Focus canvas when overlay is hidden so game controls work
    setTimeout(() => canvas.focus(), 50);
  }

  /**
   * Input handling
   */
  const keyToDirection = new Map([
    ['ArrowUp', Direction.Up],
    ['KeyW', Direction.Up],
    ['w', Direction.Up],
    ['W', Direction.Up],
    ['ArrowDown', Direction.Down],
    ['KeyS', Direction.Down],
    ['s', Direction.Down],
    ['S', Direction.Down],
    ['ArrowLeft', Direction.Left],
    ['KeyA', Direction.Left],
    ['a', Direction.Left],
    ['A', Direction.Left],
    ['ArrowRight', Direction.Right],
    ['KeyD', Direction.Right],
    ['d', Direction.Right],
    ['D', Direction.Right],
  ]);

  function isOpposite(a, b) {
    return (
      (a === Direction.Up && b === Direction.Down) ||
      (a === Direction.Down && b === Direction.Up) ||
      (a === Direction.Left && b === Direction.Right) ||
      (a === Direction.Right && b === Direction.Left)
    );
  }

  // Listen on both window and canvas to be safe
  const keydown = (e) => {
    const code = e.code;
    const key = e.key;
    const isSpace = code === 'Space' || key === ' ' || key === 'Spacebar';
    const isP = code === 'KeyP' || key === 'p' || key === 'P';
    const isR = code === 'KeyR' || key === 'r' || key === 'R';

    if (isSpace || isP) {
      e.preventDefault();
      if (gameState === 'init') {
        startGame();
      } else if (gameState === 'playing' || gameState === 'paused') {
        togglePause();
      }
      return;
    }
    if (isR) {
      e.preventDefault();
      startGame();
      return;
    }
    const dir = keyToDirection.get(e.code) || keyToDirection.get(e.key);
    if (dir) {
      e.preventDefault();
      if (!isOpposite(dir, direction)) {
        nextDirection = dir;
      }
    }
  };
  window.addEventListener('keydown', keydown);
  document.addEventListener('keydown', keydown);
  canvas.addEventListener('keydown', keydown);
  // Also listen on overlay since it blocks events when visible
  overlay.addEventListener('keydown', keydown);

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
    elapsedSec += dt;

  // Always update particles and ambient effects
    updateParticles(dt);
    spawnFoodAmbient(dt);
  // update eat pulse lifetimes
  // (eatPulses array declared later; using hoisting is fine for functions but we ensure order by patching declaration soon)
    if (mouthOpenTimer > 0) mouthOpenTimer = Math.max(0, mouthOpenTimer - dt);
    if (hitShakeTimer > 0) hitShakeTimer = Math.max(0, hitShakeTimer - dt);

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

    // Remember previous snake for interpolation
    lastSnakePositions = snake.map(s => ({ ...s }));
    // Move
    snake.unshift(next);

    // Food collision
    if (willEat) {
      score += 10;
      scoreEl.textContent = String(score);
      const eatPx = next.x * CELL_SIZE + CELL_SIZE / 2;
      const eatPy = next.y * CELL_SIZE + CELL_SIZE / 2;
      spawnEatBurstAt(eatPx, eatPy);
      placeFood();
      // speed up slightly with cap
      speedMs = clamp(speedMs - 3, 55, 120);
      mouthOpenTimer = MOUTH_ANIM_DURATION; // trigger chomp animation
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
      const angle = randomInt(0, 360) * Math.PI / 180; // Use randomInt for angle
      const radius = randomInt(2, CELL_SIZE * 0.45);
      const px = centerX + Math.cos(angle) * radius;
      const py = centerY + Math.sin(angle) * radius;
      const speed = randomInt(10, 60);
      const outward = angle + randomInt(-7, 7) * Math.PI / 180; // Use randomInt for outward angle
      particles.push({
        x: px,
        y: py,
        vx: Math.cos(outward) * speed,
        vy: Math.sin(outward) * speed,
        life: 0,
        maxLife: randomInt(600, 1200) / 1000, // Use randomInt for maxLife
        size: randomInt(1.8, 3.2),
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
    // Screen shake on hit
    if (hitShakeTimer > 0) {
      const shakeAmt = 3 * (hitShakeTimer / 0.5);
      const sx = (Math.random() - 0.5) * 2 * shakeAmt;
      const sy = (Math.random() - 0.5) * 2 * shakeAmt;
      ctx.save();
      ctx.translate(sx, sy);
      drawWorld();
      ctx.restore();
      return;
    }
    drawWorld();
  }

  function drawWorld() {
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

    // Draw continuous neon snake body
    drawSnakeContinuous();

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

  function updateEatPulses() { /* removed ring pulses */ }
  function drawEatPulses() { /* removed ring pulses */ }

  function spawnEatBurstAt(px, py) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 160 + Math.random() * 240;
      particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.4,
        size: 2 + Math.random() * 3.5,
        color: 'rgba(255, 232, 0, 1)',
        shape: 'circle',
        glow: 'rgba(255, 122, 0, 1)'
      });
    }
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
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(innerX, innerY, innerSize, innerSize);
    ctx.shadowBlur = 0;
    const grad = ctx.createLinearGradient(innerX, innerY, innerX + innerSize, innerY + innerSize);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'white');
    ctx.fillStyle = grad;
    ctx.fillRect(innerX, innerY, innerSize, innerSize);
    ctx.restore();
  }

  function drawSnakeContinuous() {
    if (snake.length === 0) return;
    // Interpolate between previous and current positions for smooth movement
    const t = gameState === 'playing' ? clamp((performance.now() - lastTickAt) / speedMs, 0, 1) : 0;
    const interpSegments = getInterpolatedSnakeSegments(t); // head->tail
    const points = interpSegments
      .slice()
      .reverse() // tail to head
      .map(seg => ({ x: seg.x * CELL_SIZE + CELL_SIZE / 2, y: seg.y * CELL_SIZE + CELL_SIZE / 2 }));

    const headCenter = points[points.length - 1];
    const tailCenter = points[0];

    // Outer glow stroke
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const gradGlow = ctx.createLinearGradient(tailCenter.x, tailCenter.y, headCenter.x, headCenter.y);
    gradGlow.addColorStop(0, COLOR_A);
    gradGlow.addColorStop(1, COLOR_B);
    ctx.strokeStyle = gradGlow;
    ctx.shadowColor = COLOR_A;
    ctx.shadowBlur = 28;
    ctx.lineWidth = BODY_RADIUS * 2.1;
    beginSmoothPath(points, USE_SPLINE_SMOOTHING ? 0.6 : 0.0);
    ctx.stroke();
    ctx.restore();

    // Core body stroke
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const gradBody = ctx.createLinearGradient(tailCenter.x, tailCenter.y, headCenter.x, headCenter.y);
    gradBody.addColorStop(0, COLOR_A);
    gradBody.addColorStop(1, COLOR_B);
    ctx.strokeStyle = gradBody;
    ctx.lineWidth = BODY_RADIUS * 2;
    beginSmoothPath(points, USE_SPLINE_SMOOTHING ? 0.6 : 0.0);
    ctx.stroke();

    // Thin highlight stroke
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = BODY_RADIUS * 0.22;
    beginSmoothPath(points, USE_SPLINE_SMOOTHING ? 0.6 : 0.0);
    ctx.stroke();
    ctx.restore();

    // Head details on top
    drawSnakeHeadDetails(points);
  }

  function getInterpolatedSnakeSegments(t) {
    const prev = lastSnakePositions && lastSnakePositions.length ? lastSnakePositions : snake;
    const curr = snake;
    const maxLen = Math.max(prev.length, curr.length);
    const out = [];
    for (let i = 0; i < maxLen; i++) {
      const a = prev[i] || prev[prev.length - 1];
      const b = curr[i] || curr[curr.length - 1];
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
    return out;
  }

  function beginSmoothPath(points, tension) {
    if (!USE_SPLINE_SMOOTHING || points.length < 3 || tension <= 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      return;
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const c1x = p1.x + (p2.x - p0.x) / 6 * tension;
      const c1y = p1.y + (p2.y - p0.y) / 6 * tension;
      const c2x = p2.x - (p3.x - p1.x) / 6 * tension;
      const c2y = p2.y - (p3.y - p1.y) / 6 * tension;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y);
    }
  }

  function drawSnakeHeadDetails(points) {
    const head = points[points.length - 1];
    const neck = points[Math.max(0, points.length - 2)];
    const dirX = head.x - neck.x;
    const dirY = head.y - neck.y;
    const len = Math.max(1, hypot(dirX, dirY));
    const nx = dirX / len;
    const ny = dirY / len;
    const px = -ny; // perpendicular
    const py = nx;

    // Head circle
    ctx.save();
    ctx.shadowColor = COLOR_B;
    ctx.shadowBlur = 24;
    const headGrad = ctx.createLinearGradient(head.x - nx * HEAD_RADIUS, head.y - ny * HEAD_RADIUS, head.x + nx * HEAD_RADIUS, head.y + ny * HEAD_RADIUS);
    headGrad.addColorStop(0, COLOR_B);
    headGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(head.x, head.y, HEAD_RADIUS * 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eyes (bigger per request)
    const eyeOffsetAlong = HEAD_RADIUS * 0.04;
    const eyeOffsetSide = HEAD_RADIUS * 0.64;
    const baseEyeRadius = Math.max(2, Math.round(HEAD_RADIUS * 0.46));
    const pupilRadius = Math.max(1, Math.round(baseEyeRadius * 0.42));

    const leftEyeX = head.x - nx * eyeOffsetAlong + px * eyeOffsetSide;
    const leftEyeY = head.y - ny * eyeOffsetAlong + py * eyeOffsetSide;
    const rightEyeX = head.x - nx * eyeOffsetAlong - px * eyeOffsetSide;
    const rightEyeY = head.y - ny * eyeOffsetAlong - py * eyeOffsetSide;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    // Eye gag on hit: one small, one bigger, plus slight blink squeeze
    const blinkPhase = gameState === 'dying' ? (1 - clamp(hitShakeTimer / 0.5, 0, 1)) : 0;
    const squeeze = gameState === 'dying' ? clamp(1 - Math.sin(blinkPhase * Math.PI), 0.2, 1) : 1;
    const leftScale = gameState === 'dying' ? 0.65 : 1;
    const rightScale = gameState === 'dying' ? 1.25 : 1;
    // Left eye
    ctx.save();
    ctx.translate(leftEyeX, leftEyeY);
    ctx.scale(1, squeeze * leftScale);
    ctx.beginPath(); ctx.arc(0, 0, baseEyeRadius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Right eye
    ctx.save();
    ctx.translate(rightEyeX, rightEyeY);
    ctx.scale(1, squeeze * rightScale);
    ctx.beginPath(); ctx.arc(0, 0, baseEyeRadius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    const pupilOffset = Math.min(baseEyeRadius * 0.6, 4.5);
    const pupilXOff = nx * pupilOffset;
    const pupilYOff = ny * pupilOffset;
    ctx.fillStyle = '#111318';
    ctx.beginPath(); ctx.arc(leftEyeX + pupilXOff, leftEyeY + pupilYOff, pupilRadius, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(rightEyeX + pupilXOff, rightEyeY + pupilYOff, pupilRadius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Mouth animation (more pronounced while eating)
    if (mouthOpenTimer > 0) {
      const openness = Math.sin((1 - mouthOpenTimer / MOUTH_ANIM_DURATION) * Math.PI); // 0..1..0
      const spread = Math.max(0.2, 0.9 * openness); // radians factor
      const baseX = head.x + nx * HEAD_RADIUS * 0.2;
      const baseY = head.y + ny * HEAD_RADIUS * 0.2;
      const tipX = head.x + nx * HEAD_RADIUS * 1.2;
      const tipY = head.y + ny * HEAD_RADIUS * 1.2;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#0a0d14';
      ctx.beginPath();
      ctx.moveTo(baseX + px * HEAD_RADIUS * 0.25, baseY + py * HEAD_RADIUS * 0.25);
      ctx.lineTo(tipX + px * HEAD_RADIUS * spread * 0.7, tipY + py * HEAD_RADIUS * spread * 0.7);
      ctx.lineTo(baseX - px * HEAD_RADIUS * 0.25, baseY - py * HEAD_RADIUS * 0.25);
      ctx.lineTo(tipX - px * HEAD_RADIUS * spread * 0.7, tipY - py * HEAD_RADIUS * spread * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Tongue
    const flick = (Math.sin(elapsedSec * 10) + 1) / 2; // 0..1
    const tongueLen = HEAD_RADIUS * (0.7 + 0.5 * flick);
    const tongueWidth = Math.max(1.5, HEAD_RADIUS * 0.25);
    const fork = tongueWidth * 0.6;
    const baseX = head.x + nx * HEAD_RADIUS * 0.8;
    const baseY = head.y + ny * HEAD_RADIUS * 0.8;
    const tipX = baseX + nx * tongueLen;
    const tipY = baseY + ny * tongueLen;
    const forkLeftX = tipX + px * fork;
    const forkLeftY = tipY + py * fork;
    const forkRightX = tipX - px * fork;
    const forkRightY = tipY - py * fork;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#ff3b6b';
    ctx.shadowColor = '#ff99aa';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(baseX + px * (tongueWidth / 2), baseY + py * (tongueWidth / 2));
    ctx.lineTo(forkLeftX, forkLeftY);
    ctx.lineTo(baseX - px * (tongueWidth / 2), baseY - py * (tongueWidth / 2));
    ctx.lineTo(forkRightX, forkRightY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
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


