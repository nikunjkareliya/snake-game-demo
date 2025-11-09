import { state } from './state.js';
import { CELL_SIZE, PARTICLE_COUNT_DEATH, PARTICLE_SPEED_DEATH_MIN, PARTICLE_SPEED_DEATH_MAX } from './config.js';
import { calculateDeathReward } from './gameConfig.js';
import { createBurst } from './particles.js';
import { setStoredValue } from './utils.js';

/**
 * Create particle effects for each snake segment and clear the snake.
 * @returns {void}
 */
export function createSnakeDeathEffect() {
  // Create small square fragments for each snake segment. Each fragment
  // will live briefly and then convert into a particle burst in the
  // update loop (so we get a two-stage break -> explode effect).
  const grid = 3; // fragments per axis inside a cell (3x3 grid)
  const fragCell = CELL_SIZE / grid;

  for (const seg of state.snake) {
    const baseX = seg.x * CELL_SIZE;
    const baseY = seg.y * CELL_SIZE;

    for (let gx = 0; gx < grid; gx++) {
      for (let gy = 0; gy < grid; gy++) {
        // scatter fragments randomly inside the cell area instead of fixed grid centers
        const rx = Math.random() * CELL_SIZE;
        const ry = Math.random() * CELL_SIZE;
        const fx = baseX + rx;
        const fy = baseY + ry;
        // random size between 35% and 95% of fragCell
        const size = Math.max(2, Math.round(fragCell * (0.35 + Math.random() * 0.6)));
        // make fragments live longer so they linger on-screen
        const life = 1.2 + Math.random() * 1.2; // seconds before fully dissolved
        const color = Math.random() < 0.5 ? state.currentSkin.head : state.currentSkin.tail;
        // random rotation and angular velocity for spinning effect
        const angle = Math.random() * Math.PI * 2;
        const angularVelocity = (Math.random() - 0.5) * 6; // radians per second
        // slight scatter velocity so pieces move outward a bit
        const speed = 8 + Math.random() * 32;
        const dir = Math.random() * Math.PI * 2;
        const vx = Math.cos(dir) * speed;
        const vy = Math.sin(dir) * speed;

        // store both remaining life and the original max life for normalized fading
        state.fragments.push({ x: fx, y: fy, size, life, maxLife: life, color, angle, angularVelocity, vx, vy });
      }
    }
  }

  // Clear snake immediately so player sees fragmentation
  state.snake = [];
}

/**
 * Begin the death sequence: set timers, award currency, update high score and spawn death effects.
 * @returns {void}
 */
export function startDeathSequence() {
  state.gameState = 'dying';
  state.deathTimer = 1.0;
  state.hitShakeTimer = 0.5;

  // Calculate currency earned using ECONOMY settings
  const currencyEarned = calculateDeathReward(state.score);
  state.currency += currencyEarned;
  setStoredValue('neonSnakeCurrency', state.currency);
  
  // Update high score if needed
  const newHighScore = state.score > state.highScore;
  if (newHighScore) {
    state.highScore = state.score;
    setStoredValue('neonSnakeHighScore', state.highScore);
  }
  
  createSnakeDeathEffect();
}