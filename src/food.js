import { COLUMNS, ROWS, CELL_SIZE, FOOD_SPARK_INTERVAL, FOOD_PARTICLE_RADIUS_RATIO } from './config.js';
import { state } from './state.js';
import { randomInt } from './utils.js';
import { addParticle } from './particles.js';

/**
 * Spawn food at a random empty cell on the grid.
 * This implementation precomputes empty cells to avoid infinite recursion
 * when the grid is nearly full.
 * @returns {void}
 */
export function spawnFood() {
  const emptyCells = [];

  for (let x = 0; x < COLUMNS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const occupied = state.snake.some(seg => seg.x === x && seg.y === y);
      if (!occupied) emptyCells.push({ x, y });
    }
  }

  if (emptyCells.length === 0) {
    console.error('spawnFood: grid is full, cannot place food');
    return;
  }

  const choice = emptyCells[randomInt(0, emptyCells.length - 1)];
  state.food = choice;
}

/**
 * Spawn ambient particle effects near the food periodically.
 * @param {number} dt - Delta time in seconds
 * @returns {void}
 */
export function spawnFoodAmbient(dt) {
  state.foodSparkTimer += dt;
  if (state.foodSparkTimer < FOOD_SPARK_INTERVAL) return;
  state.foodSparkTimer = 0;

  // Spawn ambient food particles
  const centerX = state.food.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = state.food.y * CELL_SIZE + CELL_SIZE / 2;
  
  const radius = randomInt(2, Math.floor(CELL_SIZE * FOOD_PARTICLE_RADIUS_RATIO));
  const angle = Math.random() * Math.PI * 2;
  
  addParticle({
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
    vx: 0,
    vy: -15 - Math.random() * 25,
    life: 0.8 + Math.random() * 0.4,
  color: Math.random() < 0.5 ? '#ff00ff' : '#00eaff',
    shape: Math.random() < 0.5 ? 'circle' : 'square',
    size: 1 + Math.random() * 2
  });
}
