/**
 * Touch Input System for Mobile Devices
 *
 * Converts swipe gestures to directional input for snake game.
 * Uses relative swipe deltas, so no coordinate transformation needed.
 * Works perfectly with CSS transform scaling.
 */

import { state } from './state.js';
import { Direction } from './config.js';

const SWIPE_THRESHOLD = 30;  // Minimum swipe distance in pixels
const SWIPE_TIMEOUT = 300;   // Maximum swipe duration in milliseconds

let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

/**
 * Check if two directions are opposite (invalid move in snake game)
 * @param {string} a - First direction
 * @param {string} b - Second direction
 * @returns {boolean} True if directions are opposite
 */
function areOppositeDirections(a, b) {
  return (
    (a === Direction.Up && b === Direction.Down) ||
    (a === Direction.Down && b === Direction.Up) ||
    (a === Direction.Left && b === Direction.Right) ||
    (a === Direction.Right && b === Direction.Left)
  );
}

/**
 * Handle touch start - record starting position and time
 * @param {TouchEvent} e - Touch event
 */
function handleTouchStart(e) {
  // Only intercept during gameplay
  if (state.gameState !== 'playing') return;

  const touch = e.touches[0];
  if (!touch) return;

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchStartTime = Date.now();

  // Prevent scrolling during gameplay
  e.preventDefault();
}

/**
 * Handle touch end - calculate swipe direction and update game state
 * @param {TouchEvent} e - Touch event
 */
function handleTouchEnd(e) {
  // Only intercept during gameplay
  if (state.gameState !== 'playing') return;

  const touch = e.changedTouches[0];
  if (!touch) return;

  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;
  const touchEndTime = Date.now();

  // Calculate swipe distance and duration
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const duration = touchEndTime - touchStartTime;

  // Ignore if too slow (probably not a swipe)
  if (duration > SWIPE_TIMEOUT) return;

  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  // Determine direction based on dominant axis
  let newDir = null;

  if (absX > absY && absX > SWIPE_THRESHOLD) {
    // Horizontal swipe
    newDir = deltaX > 0 ? Direction.Right : Direction.Left;
  } else if (absY > absX && absY > SWIPE_THRESHOLD) {
    // Vertical swipe
    newDir = deltaY > 0 ? Direction.Down : Direction.Up;
  }

  // Apply direction if valid (not opposite to current direction)
  if (newDir && !areOppositeDirections(state.direction, newDir)) {
    state.nextDirection = newDir;
    console.log(`[Touch] Swipe detected: ${newDir} (delta: ${deltaX.toFixed(0)}, ${deltaY.toFixed(0)})`);
  }

  // Prevent default to stop any browser gesture
  e.preventDefault();
}

/**
 * Initialize touch input listeners
 */
export function initTouchInput() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.warn('[Touch] gameCanvas element not found');
    return;
  }

  // Use passive: false to allow preventDefault
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Prevent scrolling on game container during gameplay
  const stageWrap = document.getElementById('stage-wrap');
  if (stageWrap) {
    stageWrap.addEventListener('touchmove', (e) => {
      if (state.gameState === 'playing') {
        e.preventDefault();
      }
    }, { passive: false });
  }

  console.log('[Touch] Touch input system initialized');
}
