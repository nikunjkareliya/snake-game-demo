import { state } from './state.js';
import { Direction, COLUMNS, ROWS, CELL_SIZE, PARTICLE_COUNT_EAT, PARTICLE_SPEED_EAT_MIN, PARTICLE_SPEED_EAT_MAX, MOTION_TRAIL_INTERVAL, MOTION_TRAIL_PARTICLE_LIFE, MOTION_TRAIL_PARTICLE_SIZE, GROW_ANIMATION_DURATION, PARTICLE_COUNT_DEATH, PARTICLE_SPEED_DEATH_MIN, PARTICLE_SPEED_DEATH_MAX } from './config.js';
import { ECONOMY } from './gameConfig.js';
import { startDeathSequence } from './death.js';
import { spawnFood } from './food.js';
import { createBurst, addParticle } from './particles.js';
import { updateStats } from './ui.js';
import { setStoredValue } from './utils.js';
import { updateDifficultySnapshot } from './difficulty.js';
import { onFoodEaten, getCurrentFlowMultiplier } from './flow.js';

export function stepSnake() {
  const head = state.snake[0];
  const next = { ...head };

  if (state.direction === Direction.Up) next.y -= 1;
  if (state.direction === Direction.Down) next.y += 1;
  if (state.direction === Direction.Left) next.x -= 1;
  if (state.direction === Direction.Right) next.x += 1;

  // Check wall collision
  if (next.x < 0 || next.x >= COLUMNS || next.y < 0 || next.y >= ROWS) {
    startDeathSequence();
    return;
  }

  // Check self collision
  if (state.snake.some(seg => seg.x === next.x && seg.y === next.y)) {
    startDeathSequence();
    return;
  }

  // Move snake
  state.direction = state.nextDirection;
  state.snake.unshift(next);

  // Check food collision
  if (next.x === state.food.x && next.y === state.food.y) {
    // Update progression tracking
    state.foodCollectedTotal++;
    state.foodCollected = state.foodCollectedTotal;  // Keep foodCollected in sync

    // Update difficulty tier and speed (food-based progression)
    updateDifficultySnapshot();

    // Update flow system (chain eating)
    onFoodEaten();

    // Calculate score with flow multiplier
    const baseScore = 10;
    const flowMultiplier = getCurrentFlowMultiplier();
    const scoreGained = Math.floor(baseScore * flowMultiplier);
    state.score += scoreGained;

    // Award currency for eating food
    state.currency += ECONOMY.coinPerFood;
    setStoredValue('neonSnakeCurrency', state.currency);

    // Update HUD to show new currency
    updateStats();
    spawnFood();
    createEatEffect(next);
    // Start grow animation
    state.growTimer = GROW_ANIMATION_DURATION;
  } else {
    state.snake.pop();
  }
}

export function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      state.particles.splice(i, 1);
    }
  }
  
  // Spawn motion trail particles when playing
  if (state.gameState === 'playing' && state.snake.length > 0) {
    state.motionTrailTimer += dt;
    if (state.motionTrailTimer >= MOTION_TRAIL_INTERVAL) {
      state.motionTrailTimer = 0;
      spawnMotionTrail();
    }
  }

  // Update square fragments created by death fragmentation: they now linger
  // and dissolve (fade + shrink) instead of converting into particle bursts.
  if (state.fragments && state.fragments.length) {
    for (let i = state.fragments.length - 1; i >= 0; i--) {
      const f = state.fragments[i];
      f.life -= dt;
      // update rotation
      if (f.angularVelocity) f.angle += f.angularVelocity * dt;
      // update position by slight velocity so pieces scatter
      if (f.vx) f.x += f.vx * dt;
      if (f.vy) f.y += f.vy * dt;
      // optional small gravity/drift could be added here
      // f.y += dt * 6;
      if (f.life <= 0) {
        // fully dissolved, remove fragment
        state.fragments.splice(i, 1);
      }
    }
  }
}

function spawnMotionTrail() {
  if (state.snake.length === 0) return;
  const head = state.snake[0];
  
  // Use interpolated position for smoother trail placement
  let centerX = head.x * CELL_SIZE + CELL_SIZE / 2;
  let centerY = head.y * CELL_SIZE + CELL_SIZE / 2;
  
  if (state.prevSnake && state.prevSnake[0] && state.moveProgress < 1) {
    const prevHead = state.prevSnake[0];
    const prevX = prevHead.x * CELL_SIZE + CELL_SIZE / 2;
    const prevY = prevHead.y * CELL_SIZE + CELL_SIZE / 2;
    const alpha = state.moveProgress;
    centerX = prevX + (centerX - prevX) * alpha;
    centerY = prevY + (centerY - prevY) * alpha;
  }
  
  addParticle({
    x: centerX + (Math.random() - 0.5) * CELL_SIZE * 0.5,
    y: centerY + (Math.random() - 0.5) * CELL_SIZE * 0.5,
    vx: (Math.random() - 0.5) * 20,
    vy: (Math.random() - 0.5) * 20,
    life: MOTION_TRAIL_PARTICLE_LIFE,
    color: Math.random() < 0.5 ? state.currentSkin.head : state.currentSkin.tail,
    shape: 'circle',
    size: MOTION_TRAIL_PARTICLE_SIZE,
  });
}

export function createEatEffect(pos) {
  const centerX = pos.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = pos.y * CELL_SIZE + CELL_SIZE / 2;
  
  // Create main particle burst with varied sizes and speeds
  createBurst(centerX, centerY, PARTICLE_COUNT_EAT, PARTICLE_SPEED_EAT_MIN, PARTICLE_SPEED_EAT_MAX, {
    life: 0.6 + Math.random() * 0.4,
    size: 3 + Math.random() * 3,
  });
  
  // Add a bright flash ring effect
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const speed = PARTICLE_SPEED_EAT_MAX * 1.5;
    createBurst(centerX, centerY, 1, speed, speed, {
      life: 0.3,
      size: 5,
      color: '#ffffff',
      shape: 'circle',
    });
  }
  
  // Trigger mouth open animation
  state.mouthOpenTimer = state.mouthOpenTimer || 0;
  state.mouthOpenTimer = Math.max(state.mouthOpenTimer, 0.45); // MOUTH_ANIM_DURATION from config
}

// Death effect is provided by the death module / particles system.
// The dedicated death logic will create bursts when appropriate.
// Keep snake clearing behavior in the death flow.