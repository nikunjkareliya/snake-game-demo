/**
 * Booster System
 *
 * Manages collectible power-ups that grant temporary effects.
 * Currently implements: Coin Shower
 * Future: Shrink Ray, Gravity Well, Mystery Box, Mirror Dimension
 */

import { state } from './state.js';
import { BOOSTERS } from './gameConfig.js';
import { showNotification } from './notifications.js';
import { COLUMNS, ROWS, CELL_SIZE } from './config.js';
import { randomInt } from './utils.js';
import { setStoredValue } from './utils.js';

/**
 * Activate Coin Shower effect
 * Spawns collectible coins that fall over 8 seconds
 * @returns {void}
 */
export function activateCoinShower() {
  if (state.coinShower.active) {
    // Already active - extend duration instead
    state.coinShower.timer = BOOSTERS.coinShower.duration;
    return;
  }

  state.coinShower.active = true;
  state.coinShower.timer = BOOSTERS.coinShower.duration;
  state.coinShower.spawnTimer = 0;
  state.coinShower.coins = [];

  // Notification
  showNotification('COIN SHOWER ACTIVATED!', {
    style: 'success',
    duration: 2000,
    color: '#ffff00'
  });

  console.log('[Boosters] Coin Shower activated - 8 second coin effect');
}

/**
 * Update Coin Shower effect
 * Updates flying coins physics and settles them to grid
 * @param {number} dt - Delta time in seconds
 * @returns {void}
 */
export function updateCoinShower(dt) {
  if (!state.coinShower.active) return;

  // Countdown timer
  state.coinShower.timer -= dt;
  if (state.coinShower.timer <= 0) {
    deactivateCoinShower();
    return;
  }

  // Update flying coins - apply physics and settle to grid
  for (let i = state.coinShower.flyingCoins.length - 1; i >= 0; i--) {
    const coin = state.coinShower.flyingCoins[i];
    coin.age += dt;

    // Apply velocity (pixels per second)
    coin.x += coin.vx * dt;
    coin.y += coin.vy * dt;

    // Apply deceleration (coins slow down over time)
    const deceleration = 0.95; // 95% of velocity each second
    coin.vx *= Math.pow(deceleration, dt);
    coin.vy *= Math.pow(deceleration, dt);

    // When coin finishes flying, settle it to nearest grid cell
    if (coin.age >= coin.life) {
      const settledX = Math.round(coin.x / CELL_SIZE);
      const settledY = Math.round(coin.y / CELL_SIZE);

      // Clamp to grid bounds
      const gridX = Math.max(0, Math.min(COLUMNS - 1, settledX));
      const gridY = Math.max(0, Math.min(ROWS - 1, settledY));

      // Verify grid cell is valid (not on snake, food, hazard, etc)
      const occupied = state.snake.some(seg => seg.x === gridX && seg.y === gridY);
      const onFood = state.food.x === gridX && state.food.y === gridY;
      const onHazard = state.hazards.some(h => h.x === gridX && h.y === gridY);
      const onBooster = state.boosters.some(b => b.x === gridX && b.y === gridY);

      // Only add coin if cell is empty
      if (!occupied && !onFood && !onHazard && !onBooster) {
        state.coinShower.coins.push({
          x: gridX,
          y: gridY,
          age: 0,
          life: BOOSTERS.coinShower.coinLifetime,
        });
      }

      // Remove from flying coins
      state.coinShower.flyingCoins.splice(i, 1);
      continue;
    }
  }

  // Age and remove expired settled coins
  for (let i = state.coinShower.coins.length - 1; i >= 0; i--) {
    const coin = state.coinShower.coins[i];
    coin.age += dt;
    if (coin.age >= coin.life) {
      state.coinShower.coins.splice(i, 1);
    }
  }
}

/**
 * Spawn a single coin at a random safe location
 * @private
 * @returns {void}
 */
function spawnShowerCoin() {
  const emptyCells = [];

  // Build list of valid empty cells
  for (let x = 0; x < COLUMNS; x++) {
    for (let y = 0; y < ROWS; y++) {
      // Skip HUD area
      if (y < 3) continue;

      // Skip if occupied by snake
      const occupied = state.snake.some(seg => seg.x === x && seg.y === y);
      if (occupied) continue;

      // Skip if on food
      if (state.food.x === x && state.food.y === y) continue;

      // Skip if on hazard
      const onHazard = state.hazards.some(h => h.x === x && h.y === y);
      if (onHazard) continue;

      // Skip if on booster
      const onBooster = state.boosters.some(b => b.x === x && b.y === y);
      if (onBooster) continue;

      emptyCells.push({ x, y });
    }
  }

  if (emptyCells.length === 0) return;

  const choice = emptyCells[randomInt(0, emptyCells.length - 1)];
  state.coinShower.coins.push({
    x: choice.x,
    y: choice.y,
    age: 0,
    life: BOOSTERS.coinShower.coinLifetime,
  });
}

/**
 * Explode coin basket - launches coins outward in all directions
 * Called when player collects the basket booster pickup
 * @param {number} gridX - Grid X coordinate of basket
 * @param {number} gridY - Grid Y coordinate of basket
 * @returns {void}
 */
export function explodeBasket(gridX, gridY) {
  // Activate coin shower effect
  activateCoinShower();

  // Store basket center position (for physics origin)
  state.coinShower.basketX = gridX * CELL_SIZE + CELL_SIZE / 2;
  state.coinShower.basketY = gridY * CELL_SIZE + CELL_SIZE / 2;

  // Create flying coins in all directions
  for (let i = 0; i < BOOSTERS.coinShower.coinCount; i++) {
    // Calculate angle (full 360 degree spread)
    const angle = (i / BOOSTERS.coinShower.coinCount) * Math.PI * 2;
    // Add some randomness to angle
    const angleVariance = (Math.random() - 0.5) * (Math.PI * 0.3);
    const finalAngle = angle + angleVariance;

    // Calculate velocity (radial outward)
    const speed = BOOSTERS.coinShower.explosionSpeed * (0.8 + Math.random() * 0.4); // Speed variance
    const vx = Math.cos(finalAngle) * speed;
    const vy = Math.sin(finalAngle) * speed;

    // Create flying coin
    state.coinShower.flyingCoins.push({
      x: state.coinShower.basketX,
      y: state.coinShower.basketY,
      vx: vx,
      vy: vy,
      age: 0,
      life: BOOSTERS.coinShower.flightDuration,
    });
  }

  console.log(`[Boosters] Basket exploded at (${gridX}, ${gridY}) - ${BOOSTERS.coinShower.coinCount} coins launched!`);
}

/**
 * Collect a shower coin and award currency
 * @param {number} x - Grid X coordinate
 * @param {number} y - Grid Y coordinate
 * @returns {boolean} True if coin was collected
 */
export function collectShowerCoin(x, y) {
  for (let i = state.coinShower.coins.length - 1; i >= 0; i--) {
    const coin = state.coinShower.coins[i];
    if (coin.x === x && coin.y === y) {
      // Award currency
      state.currency += BOOSTERS.coinShower.coinValue;
      setStoredValue('neonSnakeCurrency', state.currency);

      // Remove coin
      state.coinShower.coins.splice(i, 1);
      console.log(`[Boosters] Collected coin! Currency: ${state.currency}`);
      return true;
    }
  }
  return false;
}

/**
 * Deactivate Coin Shower effect
 * @private
 * @returns {void}
 */
function deactivateCoinShower() {
  state.coinShower.active = false;
  state.coinShower.timer = 0;
  state.coinShower.spawnTimer = 0;
  // Clear remaining coins
  state.coinShower.coins = [];
  console.log('[Boosters] Coin Shower deactivated');
}

/**
 * Spawn a booster pickup on the grid at a safe location
 * @param {string} type - Booster type ('neonAfterimage', 'coinShower', etc.)
 * @returns {void}
 */
export function spawnBoosterPickup(type = 'neonAfterimage') {
  const emptyCells = [];
  const isShrinkRay = type === 'shrinkRay';
  const boosterWidth = isShrinkRay ? 2 : 1;
  const boosterHeight = isShrinkRay ? 2 : 1;

  // Build list of valid empty cells
  for (let x = 0; x < COLUMNS; x++) {
    for (let y = 0; y < ROWS; y++) {
      // Skip HUD area (top 3 rows)
      if (y < 3) continue;

      // For 2x2 boosters, ensure space at right and bottom edges
      if (isShrinkRay) {
        if (x >= COLUMNS - 1 || y >= ROWS - 1) continue;
      }

      // Skip if too close to snake head
      if (state.snake.length > 0) {
        const head = state.snake[0];
        const dist = Math.abs(head.x - x) + Math.abs(head.y - y);
        if (dist < BOOSTERS.spawnSafeRadius) continue;
      }

      // Check if booster area is clear
      let areaOccupied = false;
      for (let bx = x; bx < x + boosterWidth; bx++) {
        for (let by = y; by < y + boosterHeight; by++) {
          // Skip if occupied by snake
          if (state.snake.some(seg => seg.x === bx && seg.y === by)) {
            areaOccupied = true;
            break;
          }
          // Skip if on food
          if (state.food.x === bx && state.food.y === by) {
            areaOccupied = true;
            break;
          }
          // Skip if on hazard
          if (state.hazards.some(h => h.x === bx && h.y === by)) {
            areaOccupied = true;
            break;
          }
        }
        if (areaOccupied) break;
      }

      if (!areaOccupied) {
        emptyCells.push({ x, y });
      }
    }
  }

  // No valid spawn location available
  if (emptyCells.length === 0) {
    console.log(`[Boosters] Could not spawn booster ${type} - no safe location`);
    return;
  }

  // Pick random empty cell
  const choice = emptyCells[randomInt(0, emptyCells.length - 1)];
  state.boosters.push({
    id: Date.now() + Math.random(),
    type: type,
    x: choice.x,
    y: choice.y,
    age: 0,
    spawnTime: state.elapsedSec,
  });

  console.log(`[Boosters] Spawned ${type} (${boosterWidth}x${boosterHeight}) at (${choice.x}, ${choice.y})`);
}

/**
 * Update booster pickups - age them and remove expired ones
 * @param {number} dt - Delta time in seconds
 * @returns {void}
 */
export function updateBoosters(dt) {
  // Age and remove expired pickups
  for (let i = state.boosters.length - 1; i >= 0; i--) {
    const booster = state.boosters[i];
    booster.age += dt;

    // Remove expired pickups
    if (booster.age >= BOOSTERS.pickupLifetimeSec) {
      console.log(`[Boosters] Booster expired: ${booster.type}`);
      state.boosters.splice(i, 1);
    }
  }
}

/**
 * Activate Shrink Ray effect
 * Removes 50% of snake's tail segments instantly
 * @returns {void}
 */
export function activateShrinkRay() {
  const currentLength = state.snake.length;
  const minLength = 3; // Always keep at least 3 segments

  // Calculate 50% reduction
  const segmentsToRemove = Math.floor(currentLength * 0.5);
  const newLength = Math.max(minLength, currentLength - segmentsToRemove);
  const actualRemoved = currentLength - newLength;

  if (actualRemoved > 0) {
    // Get tail position before removing (for particle effect)
    const tailSegment = state.snake[currentLength - 1];
    const tailX = tailSegment.x * CELL_SIZE + CELL_SIZE / 2;
    const tailY = tailSegment.y * CELL_SIZE + CELL_SIZE / 2;

    // Remove segments from tail
    state.snake.splice(newLength);

    // Also update prevSnake to match (for smooth interpolation)
    if (state.prevSnake && state.prevSnake.length > newLength) {
      state.prevSnake.splice(newLength);
    }

    // Create shrink burst particles at tail position
    createShrinkBurstParticles(tailX, tailY);

    // Notification
    showNotification(`SHRUNK! -${actualRemoved} SEGMENTS`, {
      style: 'warning',
      duration: 2000,
      color: '#ff00ff'
    });

    console.log(`[Boosters] Shrink Ray: Removed ${actualRemoved} segments (${currentLength} → ${newLength})`);
  } else {
    // Snake too short to shrink
    showNotification('SNAKE TOO SHORT!', {
      style: 'warning',
      duration: 1500,
      color: '#ff00ff'
    });
    console.log('[Boosters] Shrink Ray: Snake too short to shrink further');
  }
}

/**
 * Update shrink ray particles (one-time burst effect)
 * @param {number} dt - Delta time in seconds
 * @returns {void}
 */
export function updateShrinkRay(dt) {
  // Age and remove shrink particles
  for (let i = state.shrinkRay.particles.length - 1; i >= 0; i--) {
    const particle = state.shrinkRay.particles[i];

    // Update position
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;

    // Apply deceleration
    particle.vx *= 0.95;
    particle.vy *= 0.95;

    // Age particle
    particle.age += dt;
    if (particle.age >= particle.life) {
      state.shrinkRay.particles.splice(i, 1);
    }
  }
}

/**
 * Create particle burst effect when segments are removed
 * @private
 * @param {number} x - Center pixel X
 * @param {number} y - Center pixel Y
 * @returns {void}
 */
function createShrinkBurstParticles(x, y) {
  // Radial burst particles
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const speed = 150 + Math.random() * 100;
    state.shrinkRay.particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: 0.6,
      color: '#ff00ff',
      size: 3 + Math.random() * 3,
    });
  }
}

/**
 * Reset all booster effects (called on game reset/death)
 * @returns {void}
 */
export function resetBoosters() {
  state.coinShower.active = false;
  state.coinShower.timer = 0;
  state.coinShower.spawnTimer = 0;
  state.coinShower.coins = [];
  state.coinShower.flyingCoins = [];

  state.shrinkRay.particles = [];

  state.boosters = [];
  state.activeBoosterEffects = [];
  console.log('[Boosters] Reset - all effects cleared');
}
