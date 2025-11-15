import { state } from './state.js';
import { COLUMNS, ROWS, Direction, CELL_SIZE } from './config.js';
import { INTRO_ANIMATION } from './gameConfig.js';
import { spawnFood } from './food.js';
import { canvas } from './canvas.js';
import { resetDifficulty } from './difficulty.js';
import { resetFlow } from './flow.js';
import { updateStats } from './ui.js';

export function stepIntroAnimation(dt) {
    if (!state.introAnimation) return;

    const anim = state.introAnimation;
    anim.progress += dt / INTRO_ANIMATION.DURATION;

    if (anim.progress >= 1.0) {
        finalizeIntro();
        return;
    }

    const p = anim.progress;
    const offset = INTRO_ANIMATION.OFFSET;

    // Snake 1: Bottom-left to top-right (offset down and to the right)
    const s1_startX = -CELL_SIZE * 5 * INTRO_ANIMATION.SCALE;
    const s1_startY = canvas.height + CELL_SIZE * 5 * INTRO_ANIMATION.SCALE;
    const s1_endX = canvas.width + CELL_SIZE * 5 * INTRO_ANIMATION.SCALE;
    const s1_endY = -CELL_SIZE * 5 * INTRO_ANIMATION.SCALE;

    const head1X = s1_startX + (s1_endX - s1_startX) * p + offset;
    const head1Y = s1_startY + (s1_endY - s1_startY) * p + offset;
    anim.snake.unshift({ x: head1X, y: head1Y });
    if (anim.snake.length > anim.length) {
        anim.snake.pop();
    }

    // Snake 2: Top-right to bottom-left (offset up and to the left)
    const s2_startX = canvas.width + CELL_SIZE * 5 * INTRO_ANIMATION.SCALE;
    const s2_startY = -CELL_SIZE * 5 * INTRO_ANIMATION.SCALE;
    const s2_endX = -CELL_SIZE * 5 * INTRO_ANIMATION.SCALE;
    const s2_endY = canvas.height + CELL_SIZE * 5 * INTRO_ANIMATION.SCALE;

    const head2X = s2_startX + (s2_endX - s2_startX) * p - offset;
    const head2Y = s2_startY + (s2_endY - s2_startY) * p - offset;
    anim.snake2.unshift({ x: head2X, y: head2Y });
    if (anim.snake2.length > anim.length) {
        anim.snake2.pop();
    }
}

function finalizeIntro() {
    state.gameState = 'playing';
    state.introAnimation = null;
    resetGame(); // Reset all game elements for a fresh start
    state.lastTickAt = performance.now();
}

function resetSnake() {
    const startX = Math.floor(COLUMNS / 2);
    const startY = Math.floor(ROWS / 2);
    state.snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];
    state.direction = Direction.Right;
    state.nextDirection = Direction.Right;
}

export function resetGame() {
  state.score = 0;
  state.foodCollected = 0;
  state.particles = [];
  state.foodSparkTimer = 0;
  state.deathTimer = 0;
  state.mouthOpenTimer = 0;
  state.hitShakeTimer = 0;
  state.growTimer = 0;

  // Reset progression systems
  resetDifficulty();
  resetFlow();

  resetSnake();

  // Initialize previous positions for smooth interpolation
  state.prevSnake = state.snake.map(seg => ({ ...seg }));
  state.moveProgress = 0;

  spawnFood();
}

export function startGame() {
  if (state.gameState === 'playing' || state.gameState === 'intro') return;

  // Reset core stats
  state.score = 0;
  state.foodCollected = 0;
  state.particles = [];
  state.fragments = [];
  state.snake = []; // Clear main snake

  // Update HUD immediately to show score=0, food=0 from game start
  updateStats();

  // --- Setup Intro Animation ---
  state.gameState = 'intro';
  const introSnakeLength = INTRO_ANIMATION.LENGTH;
  const offset = INTRO_ANIMATION.OFFSET;

  // Snake 1
  const s1_startX = -CELL_SIZE * 5 * INTRO_ANIMATION.SCALE + offset;
  const s1_startY = canvas.height + CELL_SIZE * 5 * INTRO_ANIMATION.SCALE + offset;
  const introSnake1 = [];
  for (let i = 0; i < introSnakeLength; i++) {
      introSnake1.push({ x: s1_startX, y: s1_startY });
  }

  // Snake 2
  const s2_startX = canvas.width + CELL_SIZE * 5 * INTRO_ANIMATION.SCALE - offset;
  const s2_startY = -CELL_SIZE * 5 * INTRO_ANIMATION.SCALE - offset;
  const introSnake2 = [];
  for (let i = 0; i < introSnakeLength; i++) {
      introSnake2.push({ x: s2_startX, y: s2_startY });
  }

  state.introAnimation = {
      progress: 0,
      length: introSnakeLength,
      snake: introSnake1,
      snake2: introSnake2,
      scale: INTRO_ANIMATION.SCALE,
  };
  
  state.lastTickAt = performance.now();
  // Hide the stage title during gameplay
  const titleEl = document.querySelector('.stage-title');
  if (titleEl) titleEl.classList.add('hidden');
}

export function togglePause() {
  if (state.gameState === 'playing') {
    state.gameState = 'paused';
  } else if (state.gameState === 'paused') {
    state.gameState = 'playing';
    state.lastTickAt = performance.now();
  }
}

export function finalizeGameOver() {
  const currencyEarned = Math.floor(state.score / 10);
  const newHighScore = state.score > state.highScore;

  state.gameState = 'gameover';
  // Show the stage title again
  const titleEl = document.querySelector('.stage-title');
  if (titleEl) titleEl.classList.remove('hidden');

  const title = newHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER';

  // Dispatch with detailed stats
  document.dispatchEvent(new CustomEvent('showGameOver', {
    detail: {
      title,
      score: state.score,
      foodEaten: state.foodCollected,
      coinsEarned: currencyEarned,
      highScore: state.highScore,
      isNewHighScore: newHighScore
    }
  }));
}