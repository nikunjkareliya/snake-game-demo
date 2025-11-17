/**
 * Booster Visual Rendering
 *
 * Handles rendering of all active booster visual effects.
 * Currently implements: Coin Shower with large woven basket, Booster pickups
 */

import { state } from './state.js';
import { ctx } from './canvas.js';
import { BOOSTERS } from './gameConfig.js';
import { CELL_SIZE } from './config.js';

/**
 * Draw a single coin with consistent styling
 * Used for basket coins, flying coins, and settled coins
 * @private
 * @param {number} x - Center pixel X
 * @param {number} y - Center pixel Y
 * @param {number} size - Coin radius in pixels
 * @param {number} alpha - Opacity (0-1)
 * @param {boolean} withGlow - Include shadow glow effect
 * @returns {void}
 */
function drawCoin(x, y, size, alpha, withGlow = true) {
  // Outer glow
  if (withGlow) {
    ctx.shadowBlur = size * 1.8;
    ctx.shadowColor = '#ffff00';
  } else {
    ctx.shadowBlur = 0;
  }
  ctx.fillStyle = '#ffff00';
  ctx.globalAlpha = alpha * 0.6;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // Core (darker golden yellow)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffdd00';
  ctx.globalAlpha = alpha * 0.95;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Shine highlight (white)
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = alpha * 0.7;
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y - size * 0.35, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw Coin Shower effects
 * Renders flying coins with trails and settled coins with pulsing glow
 * @returns {void}
 */
export function drawCoinShower() {
  if (!state.coinShower.active && state.coinShower.coins.length === 0 && state.coinShower.flyingCoins.length === 0) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Draw flying coins with motion trails
  for (const coin of state.coinShower.flyingCoins) {
    const lifeRatio = coin.age / coin.life;
    const alpha = 1 - lifeRatio; // Fade out at end of flight

    // Draw motion trail behind coin
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    ctx.globalAlpha = alpha * 0.3;
    ctx.beginPath();
    ctx.moveTo(coin.x, coin.y);
    ctx.lineTo(coin.x - coin.vx * 0.02, coin.y - coin.vy * 0.02); // Trail in opposite direction of motion
    ctx.stroke();

    // Draw flying coin using standardized style
    drawCoin(coin.x, coin.y, CELL_SIZE * 0.25, alpha, true);
  }

  // Draw settled coins on grid
  for (const coin of state.coinShower.coins) {
    const centerX = coin.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = coin.y * CELL_SIZE + CELL_SIZE / 2;

    // Calculate lifecycle progress
    const lifeRatio = coin.age / coin.life;
    const isExpiring = lifeRatio > 0.75; // Last 25% - warning state

    // Pulsing animation
    const pulsePhase = state.elapsedSec * 4; // 4 Hz pulse
    const basePulse = Math.sin(pulsePhase) * 0.3 + 0.7;
    const pulse = isExpiring ? Math.sin(pulsePhase * 3) * 0.4 + 0.6 : basePulse;

    // Fade in/out at start and end
    const fadeAlpha = lifeRatio < 0.1 ? lifeRatio * 10 : (1 - lifeRatio) > 0.1 ? 1 : (1 - lifeRatio) * 10;

    // Draw settled coin with pulsing effect
    ctx.save();
    ctx.globalAlpha = fadeAlpha * pulse;
    drawCoin(centerX, centerY, CELL_SIZE * 0.28 * pulse, 1, true);
    ctx.restore();

    // Warning pulse when expiring
    if (isExpiring) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = (Math.sin(state.elapsedSec * 8) + 1) * 0.2 * fadeAlpha;
      ctx.beginPath();
      ctx.arc(centerX, centerY, CELL_SIZE * 0.45, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Draw booster pickups on grid
 * Renders large woven coin basket for coinShower, simple circles for others
 * @returns {void}
 */
export function drawBoosterPickups() {
  if (state.boosters.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (const booster of state.boosters) {
    const centerX = booster.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = booster.y * CELL_SIZE + CELL_SIZE / 2;

    // Calculate time remaining (warning state)
    const timeLeft = BOOSTERS.pickupLifetimeSec - booster.age;
    const isWarning = timeLeft < BOOSTERS.pickupWarningAtSec;

    // Pulsing animation
    const pulsePhase = state.elapsedSec * 3; // 3 Hz pulse
    const basePulse = Math.sin(pulsePhase) * 0.2 + 0.9; // Range: 0.7 to 1.1
    const pulse = isWarning ? Math.sin(pulsePhase * 3) * 0.3 + 0.85 : basePulse;

    // Get booster color based on type
    const color = getBoosterColor(booster.type);

    // Special rendering for coin shower basket
    if (booster.type === 'coinShower') {
      drawCoinBasket(centerX, centerY, pulse, isWarning, color);
    } else if (booster.type === 'shrinkRay') {
      drawPotionBottle(centerX, centerY, pulse, isWarning, color);
    } else {
      // Default circle rendering for other boosters
      ctx.shadowBlur = 20 * pulse;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.globalAlpha = pulse * 0.6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, CELL_SIZE * 0.4 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Draw core
      ctx.shadowBlur = 0;
      ctx.globalAlpha = pulse * 0.9;
      ctx.beginPath();
      ctx.arc(centerX, centerY, CELL_SIZE * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warning pulse effect (extra ring when about to expire)
    if (isWarning) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = (Math.sin(state.elapsedSec * 8) + 1) * 0.25;
      ctx.beginPath();
      ctx.arc(centerX, centerY, CELL_SIZE * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Draw large woven coin basket visual
 * Occupies ~2x2 cells with rich detail
 * @private
 * @param {number} centerX - Center pixel X
 * @param {number} centerY - Center pixel Y
 * @param {number} pulse - Pulsing animation factor (0.7-1.1)
 * @param {boolean} isWarning - Is basket about to expire
 * @param {string} color - Golden color
 * @returns {void}
 */
function drawCoinBasket(centerX, centerY, pulse, isWarning, color) {
  const basketWidth = CELL_SIZE * 1.75 * pulse; // Width: ~35px at 1.0 pulse
  const basketHeight = CELL_SIZE * 1.5 * pulse; // Height: ~30px
  const basketDepth = CELL_SIZE * 0.6 * pulse; // Perspective depth

  // Draw shadow/depth effect behind basket
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.globalAlpha = 0.5 * pulse;
  ctx.beginPath();
  ctx.moveTo(centerX - basketWidth * 0.5 - 2, centerY - basketDepth + 2); // Top-left
  ctx.lineTo(centerX + basketWidth * 0.5 - 2, centerY - basketDepth + 2); // Top-right
  ctx.lineTo(centerX + basketWidth * 0.35 - 2, centerY + basketDepth + 2); // Bottom-right
  ctx.lineTo(centerX - basketWidth * 0.35 - 2, centerY + basketDepth + 2); // Bottom-left
  ctx.closePath();
  ctx.fill();

  // Draw main basket container (trapezoid - wider at top)
  ctx.shadowBlur = 25 * pulse;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = pulse * 0.75;
  ctx.beginPath();
  ctx.moveTo(centerX - basketWidth * 0.5, centerY - basketDepth); // Top-left
  ctx.lineTo(centerX + basketWidth * 0.5, centerY - basketDepth); // Top-right
  ctx.lineTo(centerX + basketWidth * 0.35, centerY + basketDepth); // Bottom-right
  ctx.lineTo(centerX - basketWidth * 0.35, centerY + basketDepth); // Bottom-left
  ctx.closePath();
  ctx.fill();

  // Draw woven texture (horizontal bands)
  ctx.strokeStyle = '#cc9900';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3 * pulse;
  for (let i = 1; i < 3; i++) {
    const yPos = centerY - basketDepth + (basketHeight / 3) * i;
    const xLeft = centerX - basketWidth * 0.5 + (basketWidth * 0.15 * i / 3);
    const xRight = centerX + basketWidth * 0.5 - (basketWidth * 0.15 * i / 3);
    ctx.beginPath();
    ctx.moveTo(xLeft, yPos);
    ctx.lineTo(xRight, yPos);
    ctx.stroke();
  }

  // Draw basket rim (top edge highlight)
  ctx.strokeStyle = '#ffff99';
  ctx.lineWidth = 2;
  ctx.globalAlpha = pulse * 0.6;
  ctx.beginPath();
  ctx.moveTo(centerX - basketWidth * 0.5, centerY - basketDepth);
  ctx.lineTo(centerX + basketWidth * 0.5, centerY - basketDepth);
  ctx.stroke();

  // Draw basket handle (arc above)
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = pulse * 0.7;
  ctx.beginPath();
  ctx.arc(centerX, centerY - CELL_SIZE * 0.5, basketWidth * 0.45, Math.PI, 0, false);
  ctx.stroke();

  // Draw handle shine
  ctx.strokeStyle = '#ffff99';
  ctx.lineWidth = 1;
  ctx.globalAlpha = pulse * 0.4;
  ctx.beginPath();
  ctx.arc(centerX - 2, centerY - CELL_SIZE * 0.5, basketWidth * 0.45, Math.PI, 0, false);
  ctx.stroke();

  // Draw coins inside basket (5-6 coins, various sizes for depth)
  ctx.globalAlpha = 1.0;
  const coinPositions = [
    { x: -0.4, y: -0.1, size: 0.3 }, // Left back
    { x: 0.0, y: 0.0, size: 0.35 },  // Center middle
    { x: 0.4, y: -0.15, size: 0.28 }, // Right back
    { x: -0.15, y: 0.25, size: 0.32 }, // Left front
    { x: 0.25, y: 0.2, size: 0.33 },  // Right front
  ];

  for (const coin of coinPositions) {
    const coinX = centerX + coin.x * basketWidth * 0.5;
    const coinY = centerY + coin.y * basketHeight;
    const coinSize = CELL_SIZE * coin.size;
    drawCoin(coinX, coinY, coinSize, pulse * 0.9, true);
  }

  // Golden glow aura around entire basket
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = pulse * 0.3;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, basketWidth * 0.65, basketHeight * 0.75, 0, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Draw magic potion bottle for shrink ray booster
 * @private
 * @param {number} centerX - Center pixel X
 * @param {number} centerY - Center pixel Y
 * @param {number} pulse - Pulsing animation factor
 * @param {boolean} isWarning - Is booster about to expire
 * @param {string} color - Magenta color
 * @returns {void}
 */
function drawPotionBottle(centerX, centerY, pulse, isWarning, color) {
  const bottleWidth = CELL_SIZE * 1.4;
  const bottleHeight = CELL_SIZE * 1.3;
  const neckWidth = CELL_SIZE * 0.5;
  const neckHeight = CELL_SIZE * 0.25;

  // === MAGICAL SPARKLES (orbiting particles) ===
  const sparkleCount = 8;
  for (let i = 0; i < sparkleCount; i++) {
    const angle = (state.elapsedSec * 2 + i * (Math.PI * 2 / sparkleCount));
    const radius = CELL_SIZE * 1.1;
    const sparkleX = centerX + Math.cos(angle) * radius;
    const sparkleY = centerY + Math.sin(angle) * radius;

    ctx.fillStyle = '#ffaaff';
    ctx.globalAlpha = (Math.sin(state.elapsedSec * 5 + i) + 1) * 0.3; // Twinkle
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // === BOTTLE GLOW AURA ===
  ctx.shadowBlur = 40 * pulse;
  ctx.shadowColor = color;
  ctx.globalAlpha = pulse * 0.6;
  ctx.fillStyle = color;
  ctx.fillRect(
    centerX - bottleWidth/2,
    centerY - bottleHeight/2,
    bottleWidth,
    bottleHeight
  );

  // === GLASS BOTTLE OUTLINE ===
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ff99ff'; // Light magenta
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.9;

  // Bottle body (trapezoid)
  ctx.beginPath();
  ctx.moveTo(centerX - bottleWidth * 0.5, centerY + bottleHeight * 0.5); // Bottom-left
  ctx.lineTo(centerX - bottleWidth * 0.35, centerY - bottleHeight * 0.2); // Top-left
  ctx.lineTo(centerX + bottleWidth * 0.35, centerY - bottleHeight * 0.2); // Top-right
  ctx.lineTo(centerX + bottleWidth * 0.5, centerY + bottleHeight * 0.5); // Bottom-right
  ctx.closePath();
  ctx.stroke();

  // Bottle neck
  ctx.strokeRect(
    centerX - neckWidth/2,
    centerY - bottleHeight/2 - neckHeight,
    neckWidth,
    neckHeight
  );

  // === MAGENTA LIQUID (gradient fill) ===
  const gradient = ctx.createLinearGradient(
    centerX, centerY - bottleHeight/2,
    centerX, centerY + bottleHeight/2
  );
  gradient.addColorStop(0, '#ff66ff'); // Lighter at top
  gradient.addColorStop(1, '#cc00cc'); // Darker at bottom

  ctx.fillStyle = gradient;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(
    centerX - bottleWidth * 0.35 + 2,
    centerY - bottleHeight * 0.15,
    bottleWidth * 0.7 - 4,
    bottleHeight * 0.6
  );

  // === RISING BUBBLES ===
  const bubbleOffsets = [
    { x: -0.2, y: 0.1, phase: 0 },
    { x: 0.0, y: 0.2, phase: 1 },
    { x: 0.15, y: 0.05, phase: 2 }
  ];

  for (const bubble of bubbleOffsets) {
    const bubbleY = centerY + bubble.y * bottleHeight -
                    ((state.elapsedSec * 30 + bubble.phase * 20) % bottleHeight);
    const bubbleX = centerX + bubble.x * bottleWidth;

    ctx.fillStyle = '#ffaaff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // === CORK/STOPPER ===
  ctx.fillStyle = '#4a3c28'; // Dark brown
  ctx.globalAlpha = 1.0;
  ctx.fillRect(
    centerX - neckWidth/2 - 1,
    centerY - bottleHeight/2 - neckHeight - 5,
    neckWidth + 2,
    6
  );

  // === GLASS SHINE (reflection) ===
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(
    centerX - bottleWidth * 0.25,
    centerY - bottleHeight * 0.1,
    bottleWidth * 0.2,
    0, Math.PI * 2
  );
  ctx.fill();
}

/**
 * Get color for booster type
 * @param {string} type - Booster type identifier
 * @returns {string} Color hex code
 */
function getBoosterColor(type) {
  switch (type) {
    case 'coinShower':
      return '#ffff00'; // Yellow
    case 'shrinkRay':
      return '#ff00ff'; // Magenta (already there!)
    case 'gravityWell':
      return '#00ff00'; // Green
    case 'mysteryBox':
      return '#ff6600'; // Orange
    case 'mirrorDimension':
      return '#ff0099'; // Pink
    default:
      return '#ffff00'; // Default yellow (coin shower)
  }
}
