import { state } from './state.js';
import { showLobby, hideOverlay } from './ui.js';
import { initInput } from './input.js';
import { startGame, togglePause, finalizeGameOver } from './game.js';
import { render } from './render.js';
import { spawnFoodAmbient } from './food.js';
import { stepSnake, updateParticles } from './snake.js';
import { BLINK_INTERVAL_MIN, BLINK_INTERVAL_MAX, BLINK_DURATION } from './config.js';

/**
 * Game loop
 */
function tick(now) {
  requestAnimationFrame(tick);

  if (!state.lastFrameAt) state.lastFrameAt = now;
  const dt = Math.min(0.033, Math.max(0.001, (now - state.lastFrameAt) / 1000)); // seconds, capped
  state.lastFrameAt = now;
  state.elapsedSec += dt;

// Always update particles and ambient effects
  updateParticles(dt);
  if (state.gameState !== 'init') {
    spawnFoodAmbient(dt);
  }

// update eat pulse lifetimes
  if (state.mouthOpenTimer > 0) state.mouthOpenTimer = Math.max(0, state.mouthOpenTimer - dt);
  if (state.hitShakeTimer > 0) state.hitShakeTimer = Math.max(0, state.hitShakeTimer - dt);
  if (state.growTimer > 0) state.growTimer = Math.max(0, state.growTimer - dt);
  // Blink timers: decrement blink and schedule next blink when playing
  if (state.blinkTimer > 0) state.blinkTimer = Math.max(0, state.blinkTimer - dt);
  if (state.gameState === 'playing') {
    state.nextBlinkIn = Math.max(0, state.nextBlinkIn - dt);
    if (state.nextBlinkIn <= 0 && state.snake.length > 0) {
      // Trigger blink
      state.blinkTimer = BLINK_DURATION;
      // schedule next blink randomly between min/max
      state.nextBlinkIn = BLINK_INTERVAL_MIN + Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN);
    }
  }

  if (state.gameState === 'playing') {
    // Update interpolation progress
    const timeSinceTick = now - state.lastTickAt;
    state.moveProgress = Math.min(1, timeSinceTick / state.speedMs);

    if (timeSinceTick >= state.speedMs) {
      state.lastTickAt = now;
      // Store previous positions before updating
      state.prevSnake = state.snake.map(seg => ({ ...seg }));
      stepSnake();
      state.moveProgress = 0;
    }
  } else if (state.gameState === 'dying') {
    state.deathTimer -= dt;
    if (state.deathTimer <= 0) {
      finalizeGameOver();
    }
  }

  render();
}

// Initialize
initInput(startGame, togglePause);
showLobby(startGame, hideOverlay);

requestAnimationFrame(tick);