/**
 * Flow UI - Visual Progress Bar (Horizontal)
 *
 * Displays flow chain status with horizontal progress bar
 * showing timer countdown, tier level, and multiplier.
 */

import { state } from './state.js';
import { ctx } from './canvas.js';
import { FLOW, FLOW_UI } from './gameConfig.js';
import { CSS_WIDTH, CSS_HEIGHT } from './config.js';

/**
 * Render the flow progress bar during gameplay
 * Only renders if FLOW_UI.enabled is true and game is playing/paused
 */
export function renderFlowBar() {
    if (!FLOW_UI.enabled) return;
    if (state.gameState !== 'playing' && state.gameState !== 'paused') return;

    // Only show when flow is active
    if (!state.flowActive) return;

    ctx.save();

    // Calculate position based on settings
    const pos = calculatePosition();
    const centerX = pos.x;
    const centerY = pos.y;

    // Get flow data
    const flowTier = state.flowTier;
    const flowTimer = state.flowTimer;
    const flowWindow = state.difficulty.flowWindow;
    const multiplier = FLOW.scoreMultipliers[flowTier] || 1.0;
    const flowColor = FLOW.flowColors[flowTier] || FLOW.flowColors[0];

    // Calculate progress (1.0 = full, 0.0 = empty)
    const progress = Math.max(0, Math.min(1, flowTimer / flowWindow));

    // Check if in danger (timer < 2s)
    const inDanger = flowTimer < 2.0;

    // Draw horizontal progress bar
    drawProgressBar(centerX, centerY, progress, flowColor, inDanger);

    // Draw tier dots below bar
    if (FLOW_UI.showTierDots) {
        drawTierDots(centerX, centerY, flowTier, flowColor);
    }

    // Draw labels (tier on left, timer and multiplier on right)
    drawLabels(centerX, centerY, flowTier, flowTimer, multiplier, flowColor, inDanger);

    ctx.restore();
}

/**
 * Calculate UI position based on FLOW_UI.position setting
 * @returns {{x: number, y: number}}
 */
function calculatePosition() {
    const { position, offsetX, offsetY, barWidth } = FLOW_UI;
    let x, y;

    switch (position) {
        case 'top-center':
            x = CSS_WIDTH / 2 + offsetX;
            y = offsetY;
            break;
        case 'top-right':
            x = CSS_WIDTH - barWidth / 2 - 20 + offsetX;
            y = offsetY;
            break;
        case 'top-left':
            x = barWidth / 2 + 20 + offsetX;
            y = offsetY;
            break;
        default:
            x = CSS_WIDTH / 2 + offsetX;
            y = offsetY;
    }

    return { x, y };
}

/**
 * Draw the horizontal progress bar with rounded corners
 */
function drawProgressBar(centerX, centerY, progress, color, inDanger) {
    const barWidth = FLOW_UI.barWidth;
    const barHeight = FLOW_UI.barHeight;
    const cornerRadius = FLOW_UI.barCornerRadius;

    const barX = centerX - barWidth / 2;
    const barY = centerY;

    // Draw background bar (dark, rounded rectangle)
    ctx.fillStyle = FLOW_UI.barBackground;
    drawRoundedRect(barX, barY, barWidth, barHeight, cornerRadius);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw progress fill (left to right)
    if (progress > 0) {
        const fillWidth = barWidth * progress;

        // Apply glow effect
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Warning pulse animation when in danger
        let glowIntensity = 1.0;
        let fillColor = color;

        if (inDanger) {
            const pulse = Math.sin(state.elapsedSec * FLOW_UI.warningPulseSpeed * Math.PI * 2) * 0.5 + 0.5;
            glowIntensity = 0.6 + pulse * 0.4;
            fillColor = FLOW_UI.warningColor;
        }

        ctx.shadowColor = fillColor;
        ctx.shadowBlur = FLOW_UI.glowBlur * glowIntensity;
        ctx.fillStyle = fillColor;

        // Draw filled portion with rounded corners
        // Use clip to ensure fill stays within bar bounds
        ctx.save();
        drawRoundedRect(barX, barY, barWidth, barHeight, cornerRadius);
        ctx.clip();
        drawRoundedRect(barX, barY, fillWidth, barHeight, cornerRadius);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }
}

/**
 * Helper: Draw rounded rectangle path
 */
function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * Draw tier indicator dots below the bar
 */
function drawTierDots(centerX, centerY, currentTier, color) {
    const maxTiers = FLOW.maxFlowTier;
    const dotRadius = FLOW_UI.dotRadius;
    const dotSpacing = FLOW_UI.dotSpacing;
    const dotsY = centerY + FLOW_UI.barHeight + FLOW_UI.dotOffsetY;

    // Calculate starting X to center the dots
    const totalWidth = (maxTiers - 1) * dotSpacing;
    const startX = centerX - totalWidth / 2;

    ctx.shadowBlur = 0; // Reset shadow for dots

    for (let i = 0; i < maxTiers; i++) {
        const dotX = startX + i * dotSpacing;
        const isFilled = i < currentTier;

        ctx.beginPath();
        ctx.arc(dotX, dotsY, dotRadius, 0, Math.PI * 2);

        if (isFilled) {
            // Filled dot with glow
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            // Empty dot (outline only)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
}

/**
 * Draw text labels (tier on left, timer and multiplier on right)
 */
function drawLabels(centerX, centerY, tier, timer, multiplier, color, inDanger) {
    const fontSize = FLOW_UI.fontSize;
    const fontFamily = FLOW_UI.fontFamily;
    const barWidth = FLOW_UI.barWidth;
    const barHeight = FLOW_UI.barHeight;
    const spacing = FLOW_UI.labelSpacing;

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';

    const textY = centerY + barHeight / 2;

    // Left label: Tier
    ctx.textAlign = 'right';
    const tierText = `T${tier}`;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillText(tierText, centerX - barWidth / 2 - spacing, textY);

    // Right labels: Timer and Multiplier
    ctx.textAlign = 'left';
    const timerText = `${timer.toFixed(1)}s`;
    const multText = `×${multiplier.toFixed(1)}`;

    // Timer
    ctx.fillStyle = inDanger ? FLOW_UI.warningColor : FLOW_UI.textColor;
    ctx.shadowColor = inDanger ? FLOW_UI.warningColor : color;
    ctx.shadowBlur = inDanger ? 10 : 6;
    ctx.fillText(timerText, centerX + barWidth / 2 + spacing, textY);

    // Multiplier (to the right of timer)
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const timerWidth = ctx.measureText(timerText).width;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillText(multText, centerX + barWidth / 2 + spacing + timerWidth + 8, textY);
}
