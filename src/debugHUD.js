/**
 * Debug HUD - Progression Metrics Display
 *
 * Shows difficulty tier, speed, flow system, and progression info
 * in bottom-left corner during gameplay
 */

import { state } from './state.js';
import { ctx } from './canvas.js';
import { DEV, DIFFICULTY, FLOW } from './gameConfig.js';
import { CSS_WIDTH, CSS_HEIGHT } from './config.js';

const HUD_PADDING = 12;
const HUD_FONT_SIZE = 14;
const HUD_LINE_HEIGHT = 22;
const HUD_BADGE_RADIUS = 8;
const HUD_BG_COLOR = 'rgba(0, 0, 0, 0.7)';
const HUD_TEXT_COLOR = '#00ff00';
const HUD_ACCENT_COLOR = '#00ff99';
const HUD_WARNING_COLOR = '#ffaa00';

/**
 * Render difficulty HUD badge in bottom-left corner showing tier and key metrics.
 * Only renders if DEV.showDifficultyHUD is true.
 */
export function renderDebugHUD() {
  if (!DEV.showDifficultyHUD) return;
  if (state.gameState !== 'playing' && state.gameState !== 'paused') return;

  // Compute badge dimensions
  const maxLines = 4; // tier+progress, speed, flow, multiplier
  const badgeWidth = 220;
  const badgeHeight = HUD_PADDING + (maxLines * HUD_LINE_HEIGHT) + HUD_PADDING;

  // Position at bottom-left corner
  const x = HUD_PADDING;
  const y = CSS_HEIGHT - badgeHeight - HUD_PADDING;

  // Draw rounded rectangle background
  ctx.save();
  ctx.fillStyle = HUD_BG_COLOR;
  ctx.beginPath();
  ctx.moveTo(x + HUD_BADGE_RADIUS, y);
  ctx.lineTo(x + badgeWidth - HUD_BADGE_RADIUS, y);
  ctx.quadraticCurveTo(x + badgeWidth, y, x + badgeWidth, y + HUD_BADGE_RADIUS);
  ctx.lineTo(x + badgeWidth, y + badgeHeight - HUD_BADGE_RADIUS);
  ctx.quadraticCurveTo(x + badgeWidth, y + badgeHeight, x + badgeWidth - HUD_BADGE_RADIUS, y + badgeHeight);
  ctx.lineTo(x + HUD_BADGE_RADIUS, y + badgeHeight);
  ctx.quadraticCurveTo(x, y + badgeHeight, x, y + badgeHeight - HUD_BADGE_RADIUS);
  ctx.lineTo(x, y + HUD_BADGE_RADIUS);
  ctx.quadraticCurveTo(x, y, x + HUD_BADGE_RADIUS, y);
  ctx.fill();

  // Draw border
  ctx.strokeStyle = HUD_ACCENT_COLOR;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Set up text rendering
  ctx.font = `${HUD_FONT_SIZE}px monospace`;
  ctx.textBaseline = 'top';

  let lineY = y + HUD_PADDING;

  // Line 1: Tier + Progress
  const tier = state.difficultyTier;
  const currentFood = state.foodCollectedTotal;
  const nextTierAt = state.difficulty.nextTierAt;
  const tierLabel = `Tier ${tier}/${DIFFICULTY.maxTier} (${currentFood}/${nextTierAt})`;
  ctx.fillStyle = HUD_TEXT_COLOR;
  ctx.fillText(tierLabel, x + HUD_PADDING, lineY);
  lineY += HUD_LINE_HEIGHT;

  // Line 2: Speed
  const speed = state.speedMs;
  const speedLabel = `Speed: ${Math.round(speed)}ms`;
  ctx.fillStyle = HUD_TEXT_COLOR;
  ctx.fillText(speedLabel, x + HUD_PADDING, lineY);
  lineY += HUD_LINE_HEIGHT;

  // Line 3: Flow Status
  const flowTier = state.flowTier;
  const flowActive = state.flowActive;
  const flowTimer = state.flowTimer;
  const flowWindow = state.difficulty.flowWindow;

  let flowLabel;
  if (flowActive) {
    const timerDisplay = flowTimer.toFixed(1);
    flowLabel = `Flow T${flowTier} (${timerDisplay}s / ${flowWindow.toFixed(1)}s)`;
    // Change color if flow is in danger
    ctx.fillStyle = flowTimer < 2.0 ? HUD_WARNING_COLOR : FLOW.flowColors[flowTier];
  } else {
    flowLabel = `Flow: None (${flowWindow.toFixed(1)}s window)`;
    ctx.fillStyle = '#888888';
  }
  ctx.fillText(flowLabel, x + HUD_PADDING, lineY);
  lineY += HUD_LINE_HEIGHT;

  // Line 4: Score Multiplier
  const mult = FLOW.scoreMultipliers[flowTier] || 1.0;
  const multLabel = `Multiplier: ${mult.toFixed(1)}x`;
  ctx.fillStyle = mult > 1.0 ? HUD_ACCENT_COLOR : HUD_TEXT_COLOR;
  ctx.fillText(multLabel, x + HUD_PADDING, lineY);

  ctx.restore();
}
