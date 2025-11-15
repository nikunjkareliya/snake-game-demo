/**
 * Hazard Rendering System
 *
 * Handles rendering of all hazard types with visual effects.
 */

import { state } from './state.js';
import { ctx } from './canvas.js';
import { CELL_SIZE } from './config.js';
import { HAZARDS } from './gameConfig.js';

/**
 * Render all hazards
 * @returns {void}
 */
export function drawHazards() {
    for (const hazard of state.hazards) {
        if (hazard.type === 'static') {
            drawStaticHazard(hazard);
        }
        // Future: Add other hazard types here
        // else if (hazard.type === 'patrol_orb') { drawPatrolOrb(hazard); }
    }
}

/**
 * Draw a static hazard cell
 * @param {Object} hazard - Hazard object
 * @returns {void}
 */
function drawStaticHazard(hazard) {
    const cx = hazard.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = hazard.y * CELL_SIZE + CELL_SIZE / 2;
    const size = CELL_SIZE * HAZARDS.static.size;

    // Calculate opacity based on state
    let opacity = 1.0;
    let pulse = 1.0;

    if (hazard.state === 'telegraph') {
        // Telegraph phase: fade in with pulsing
        const progress = Math.min(1, hazard.age / hazard.telegraphDuration);
        opacity = HAZARDS.telegraphOpacityMin + (progress * (1 - HAZARDS.telegraphOpacityMin));

        // Pulsing effect during telegraph
        pulse = Math.sin(hazard.age * Math.PI * HAZARDS.telegraphPulseSpeed) * 0.3 + 0.7;
        opacity *= pulse;
    } else if (hazard.state === 'active') {
        // Active phase: gentle pulse
        pulse = Math.sin(state.elapsedSec * Math.PI * HAZARDS.static.pulseSpeed) * 0.15 + 0.85;
        opacity = pulse;
    }

    ctx.save();
    ctx.globalAlpha = opacity;

    // Draw glow layer
    ctx.save();
    ctx.shadowBlur = HAZARDS.static.glowIntensity;
    ctx.shadowColor = HAZARDS.static.glowColor;
    ctx.fillStyle = HAZARDS.static.color;
    ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
    ctx.restore();

    // Draw solid base (stronger glow for active hazards)
    if (hazard.state === 'active') {
        ctx.shadowBlur = HAZARDS.static.glowIntensity * 0.6;
        ctx.shadowColor = HAZARDS.static.glowColor;
    }
    ctx.fillStyle = hazard.state === 'telegraph' ? HAZARDS.static.glowColor : HAZARDS.static.color;
    ctx.fillRect(cx - size / 2, cy - size / 2, size, size);

    // Draw border outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = opacity * 0.4;
    ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);

    ctx.restore();
}
