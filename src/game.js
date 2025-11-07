import { state } from './state.js';
import { COLUMNS, ROWS, Direction } from './config.js';
import { spawnFood } from './food.js';

export function resetGame() {
  state.score = 0;
  state.particles = [];
  state.foodSparkTimer = 0;
  state.deathTimer = 0;
  state.mouthOpenTimer = 0;
  state.hitShakeTimer = 0;
  state.growTimer = 0;
  
  const startX = Math.floor(COLUMNS / 2);
  const startY = Math.floor(ROWS / 2);
  state.snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY }
  ];
  
  // Initialize previous positions for smooth interpolation
  state.prevSnake = state.snake.map(seg => ({ ...seg }));
  state.moveProgress = 0;
  
  state.direction = Direction.Right;
  state.nextDirection = Direction.Right;
  spawnFood();
}

export function startGame() {
  if (state.gameState === 'playing') return;
  resetGame();
  state.gameState = 'playing';
  state.lastTickAt = performance.now();
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
  const title = newHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER';
  const subtitle = `Score: ${state.score}\nCurrency Earned: ${currencyEarned}`;
  
  document.dispatchEvent(new CustomEvent('showGameOver', {
    detail: { title, subtitle }
  }));
}