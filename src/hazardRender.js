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
        } else if (hazard.type === 'patrol_orb') {
            drawPatrolOrb(hazard);
        }
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

/**
 * Draw a patrol orb (moving hazard) with trail effect
 * @param {Object} hazard - Patrol orb hazard object
 * @returns {void}
 */
function drawPatrolOrb(hazard) {
    const cx = hazard.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = hazard.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = HAZARDS.patrolOrb.radius;

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
        pulse = Math.sin(state.elapsedSec * Math.PI * HAZARDS.patrolOrb.pulseSpeed || 2) * 0.15 + 0.85;
        opacity = pulse;
    }

    ctx.save();
    ctx.globalAlpha = opacity;

    // Draw trail positions (fading circles at historical positions)
    if (hazard.trailPositions && hazard.trailPositions.length > 0) {
        for (let i = 0; i < hazard.trailPositions.length; i++) {
            const trailPos = hazard.trailPositions[i];
            const trailFadeTime = HAZARDS.patrolOrb.trailFadeTime;

            // Trail fades out as it gets older
            const trailProgress = Math.min(1, trailPos.age / trailFadeTime);
            const trailOpacity = opacity * (1 - trailProgress) * 0.4;

            const trailCx = trailPos.x * CELL_SIZE + CELL_SIZE / 2;
            const trailCy = trailPos.y * CELL_SIZE + CELL_SIZE / 2;
            const trailRadius = radius * (1 - trailProgress * 0.5); // Shrink trail dots

            ctx.save();
            ctx.globalAlpha = trailOpacity;

            // Trail glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = HAZARDS.patrolOrb.glowColor;
            ctx.fillStyle = HAZARDS.patrolOrb.glowColor;
            ctx.beginPath();
            ctx.arc(trailCx, trailCy, trailRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    // === EVIL ANIMATED GRADIENT ===
    // Pulsing glow that breathes with evil energy
    const glowPulse = Math.sin(state.elapsedSec * Math.PI * HAZARDS.patrolOrb.pulseSpeed) * 0.5 + 0.5;
    const shadowBlur = HAZARDS.patrolOrb.glowPulseMin +
                       (glowPulse * (HAZARDS.patrolOrb.glowPulseMax - HAZARDS.patrolOrb.glowPulseMin));
    ctx.shadowBlur = shadowBlur;
    ctx.shadowColor = HAZARDS.patrolOrb.glowColor;

    // Animated evil gradient with swirling effect
    const gradientAngle = state.elapsedSec * HAZARDS.patrolOrb.gradientRotationSpeed;
    const glowOffsetX = Math.cos(gradientAngle) * 6;
    const glowOffsetY = Math.sin(gradientAngle) * 6;

    // Create radial gradient for 3D evil sphere
    const gradient = ctx.createRadialGradient(
      cx - 4 + glowOffsetX,
      cy - 4 + glowOffsetY,
      0,
      cx,
      cy,
      radius
    );

    // Evil color stops that animate
    const colorPhase = Math.sin(state.elapsedSec * 0.8) * 0.3 + 0.7;
    const brightRed = `rgb(${Math.floor(255 * colorPhase)}, ${Math.floor(51 * colorPhase)}, ${Math.floor(51 * colorPhase)})`;
    const darkRed = `rgb(${Math.floor(139 * colorPhase)}, 0, 0)`;
    const evilBlack = `rgb(${Math.floor(30 * colorPhase)}, 0, 0)`;

    gradient.addColorStop(0, brightRed);        // Bright center
    gradient.addColorStop(0.5, HAZARDS.patrolOrb.color); // Mid red
    gradient.addColorStop(0.8, darkRed);        // Dark edges
    gradient.addColorStop(1, evilBlack);        // Black void

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // === EVIL VEINS/CRACKS (subtle dark streaks) ===
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI / 2) + gradientAngle;
      const x1 = cx + Math.cos(angle) * radius * 0.3;
      const y1 = cy + Math.sin(angle) * radius * 0.3;
      const x2 = cx + Math.cos(angle) * radius * 0.9;
      const y2 = cy + Math.sin(angle) * radius * 0.9;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw outer ring/border (enhanced glow)
    ctx.strokeStyle = HAZARDS.patrolOrb.glowColor;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = opacity * 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // === EVIL BLINKING EYES (matching snake eye style) ===
    // Calculate direction vectors (normalized)
    let nx = 0, ny = 0; // Forward direction
    let px = 0, py = 0; // Perpendicular (side) direction

    if (hazard.velocity) {
      const velocityMagnitude = Math.sqrt(hazard.velocity.x ** 2 + hazard.velocity.y ** 2);
      if (velocityMagnitude > 0) {
        nx = hazard.velocity.x / velocityMagnitude;
        ny = hazard.velocity.y / velocityMagnitude;
        // Perpendicular: px = -ny, py = nx
        px = -ny;
        py = nx;
      }
    }

    // Eye size matches snake formula: baseEyeRadius = radius * 0.46 * 1.35
    const baseEyeRadius = Math.max(2, Math.round(radius * 0.46 * 1.35));

    // Eye positioning (using same offset logic as snake)
    const eyeOffsetAlong = radius * 0.04;   // Small forward offset
    const eyeOffsetSide = radius * 0.64;    // Side spacing

    const leftEyeX = cx + nx * eyeOffsetAlong + px * eyeOffsetSide;
    const leftEyeY = cy + ny * eyeOffsetAlong + py * eyeOffsetSide;
    const rightEyeX = cx + nx * eyeOffsetAlong - px * eyeOffsetSide;
    const rightEyeY = cy + ny * eyeOffsetAlong - py * eyeOffsetSide;

    ctx.globalAlpha = opacity;

    if (hazard.blinkTimer > 0) {
      // === CLOSED EYES (matching snake style) ===
      // Simple lines with round caps, perpendicular to movement
      const lineLen = baseEyeRadius * 2.4;
      ctx.strokeStyle = '#4a0000'; // Dark evil red
      ctx.lineWidth = Math.max(2, baseEyeRadius * 0.6);
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(leftEyeX - px * lineLen / 2, leftEyeY - py * lineLen / 2);
      ctx.lineTo(leftEyeX + px * lineLen / 2, leftEyeY + py * lineLen / 2);
      ctx.moveTo(rightEyeX - px * lineLen / 2, rightEyeY - py * lineLen / 2);
      ctx.lineTo(rightEyeX + px * lineLen / 2, rightEyeY + py * lineLen / 2);
      ctx.stroke();
    } else {
      // === OPEN EVIL EYES (matching snake style) ===
      // Sclera (eye whites) - evil dark red
      ctx.fillStyle = '#330000'; // Dark evil red instead of white
      ctx.beginPath();
      ctx.arc(leftEyeX, leftEyeY, baseEyeRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rightEyeX, rightEyeY, baseEyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Pupils - simple circles (evil orange instead of black)
      ctx.fillStyle = '#ff6600'; // Glowing orange
      const pupilRadius = baseEyeRadius * 0.5;
      const pupilOffset = baseEyeRadius * 0.2;

      ctx.beginPath();
      ctx.arc(
        leftEyeX + nx * pupilOffset,
        leftEyeY + ny * pupilOffset,
        pupilRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.arc(
        rightEyeX + nx * pupilOffset,
        rightEyeY + ny * pupilOffset,
        pupilRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
}
