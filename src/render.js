import { state } from './state.js';
import { ctx } from './canvas.js';
import {
  CSS_WIDTH,
  CSS_HEIGHT,
  CELL_SIZE,
  HEAD_RADIUS,
  BODY_RADIUS,
  USE_SPLINE_SMOOTHING,
  MOUTH_ANIM_DURATION,
  HEAD_GLOW_MULTIPLIER,
  EYE_OFFSET_ALONG,
  EYE_OFFSET_SIDE,
  EYE_SIZE_RATIO,
  BODY_SHINE_WIDTH_RATIO,
  SPLINE_TENSION,
  COLOR_WHITE,
  COLOR_BLACK,
  COLOR_TONGUE,
  COLOR_A,
  COLOR_B,
  PARTICLE_CULL_MARGIN,
  GROW_ANIMATION_DURATION,
  SHINE_OVERLAY_OPACITY,
  STAR_GOLDEN_ANGLE,
  STAR_ANGLE_OFFSET,
  CIRCUIT_NODE_SHADOW_BLUR,
  FACET_ALTERNATE_COLOR,
  SPARKLE_SHADOW_BLUR
} from './config.js';

function drawGrid() {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  const spacing = CELL_SIZE;
  for (let y = 0; y < CSS_HEIGHT; y += spacing) {
    ctx.fillRect(0, y, CSS_WIDTH, 1);
  }
  for (let x = 0; x < CSS_WIDTH; x += spacing) {
    ctx.fillRect(x, 0, 1, CSS_HEIGHT);
  }
}

function beginSmoothPath(points, tension = 0.5) {
  if (!USE_SPLINE_SMOOTHING || points.length < 3 || tension <= 0) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

/**
 * Begin a path through points using rounded corners (arcTo).
 * This creates a single smooth rounded corner at each turn instead of
 * the multi-control-point spline which can produce double-bends.
 * @param {Array} points
 * @param {number} radius
 */
function beginRoundedPath(points, radius = 8) {
  if (!points || points.length === 0) return;
  if (points.length === 1) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
    return;
  }

  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const pNext = points[i + 1];
    // arcTo will create a rounded corner between the current drawing
    // position (starts at points[0] or previous arcTo result), p, and pNext
    ctx.arcTo(p.x, p.y, pNext.x, pNext.y, radius);
  }

  // ensure we end exactly at the final point
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
}

function drawSnakeHead(head, nx, ny) {
  // Add subtle pulsing glow effect (breathing animation)
  const pulse = Math.sin(state.elapsedSec * 2) * 0.05 + 1; // oscillates 0.95 to 1.05
  const glowRadius = HEAD_RADIUS * HEAD_GLOW_MULTIPLIER * pulse;

  // Get head color based on skin type
  const skin = state.currentSkin;
  let headColor, tailColor, glowColor;

  if (skin.type === 'gradient') {
    headColor = skin.head || COLOR_B;
    tailColor = skin.tail || COLOR_A;
    glowColor = headColor;
  } else if (skin.type === 'animated') {
    if (skin.id === 'electric') {
      headColor = skin.colors.primary;
      tailColor = skin.colors.secondary;
      glowColor = skin.colors.glow;
    } else if (skin.id === 'inferno') {
      headColor = skin.colors.accent;
      tailColor = skin.colors.primary;
      glowColor = skin.colors.secondary;
    } else if (skin.id === 'holographic') {
      const hue = (state.elapsedSec * skin.animation.speed * 60) % 360;
      headColor = `hsl(${hue}, 100%, 60%)`;
      tailColor = `hsl(${(hue + 180) % 360}, 100%, 60%)`;
      glowColor = headColor;
    }
  } else if (skin.type === 'pattern') {
    headColor = skin.colors.primary;
    tailColor = skin.colors.secondary || skin.colors.primary;
    glowColor = skin.colors.accent || headColor;
  } else if (skin.type === 'special') {
    if (skin.id === 'crystal') {
      headColor = skin.colors.highlight;
      tailColor = skin.colors.secondary;
      glowColor = skin.colors.sparkle;
    } else if (skin.id === 'phantom') {
      headColor = skin.colors.inner;
      tailColor = skin.colors.primary;
      glowColor = skin.colors.glow;
    }
  }

  // Draw head glow
  const headGrad = ctx.createLinearGradient(
    head.x - nx * HEAD_RADIUS,
    head.y - ny * HEAD_RADIUS,
    head.x + nx * HEAD_RADIUS,
    head.y + ny * HEAD_RADIUS
  );
  headGrad.addColorStop(0, headColor);
  headGrad.addColorStop(1, tailColor);

  ctx.fillStyle = headGrad;
  ctx.beginPath();
  // add layered fills with shadow to create a stronger bloom
  ctx.save();
  ctx.shadowBlur = Math.round(HEAD_RADIUS * 2.8);
  ctx.shadowColor = glowColor;
  ctx.beginPath();
  ctx.arc(head.x, head.y, glowRadius * 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = Math.round(HEAD_RADIUS * 1.2);
  ctx.beginPath();
  ctx.arc(head.x, head.y, glowRadius * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw eyes and mouth via helpers
  const px = -ny; // perpendicular to movement direction
  const py = nx;
  drawEyes(head, nx, ny, px, py);
  drawMouthAndTongue(head, nx, ny, px, py);
}

function drawEyes(head, nx, ny, px, py) {
  const eyeOffsetAlong = HEAD_RADIUS * EYE_OFFSET_ALONG;
  const eyeOffsetSide = HEAD_RADIUS * EYE_OFFSET_SIDE;
  // Increase eye size slightly for a more toony look (scale factor 1.35)
  const baseEyeRadius = Math.max(2, Math.round(HEAD_RADIUS * EYE_SIZE_RATIO * 1.35));
  // Eye positions
  const leftEye = {
    x: head.x + nx * eyeOffsetAlong + px * eyeOffsetSide,
    y: head.y + ny * eyeOffsetAlong + py * eyeOffsetSide
  };
  const rightEye = {
    x: head.x + nx * eyeOffsetAlong - px * eyeOffsetSide,
    y: head.y + ny * eyeOffsetAlong - py * eyeOffsetSide
  };

  // If blinking, draw closed eyes as short lines with round caps
  if (state.blinkTimer > 0) {
    const lineLen = baseEyeRadius * 2.4;
    ctx.strokeStyle = COLOR_BLACK;
    ctx.lineWidth = Math.max(2, baseEyeRadius * 0.6);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(leftEye.x - px * lineLen / 2, leftEye.y - py * lineLen / 2);
    ctx.lineTo(leftEye.x + px * lineLen / 2, leftEye.y + py * lineLen / 2);
    ctx.moveTo(rightEye.x - px * lineLen / 2, rightEye.y - py * lineLen / 2);
    ctx.lineTo(rightEye.x + px * lineLen / 2, rightEye.y + py * lineLen / 2);
    ctx.stroke();
    return;
  }

  // Open eyes (normal)
  ctx.fillStyle = COLOR_WHITE;
  ctx.beginPath();
  ctx.arc(leftEye.x, leftEye.y, baseEyeRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(rightEye.x, rightEye.y, baseEyeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = COLOR_BLACK;
  const pupilRadius = baseEyeRadius * 0.5;
  const pupilOffset = baseEyeRadius * 0.2;

  ctx.beginPath();
  ctx.arc(
    head.x + nx * (eyeOffsetAlong + pupilOffset) + px * eyeOffsetSide,
    head.y + ny * (eyeOffsetAlong + pupilOffset) + py * eyeOffsetSide,
    pupilRadius,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    head.x + nx * (eyeOffsetAlong + pupilOffset) - px * eyeOffsetSide,
    head.y + ny * (eyeOffsetAlong + pupilOffset) - py * eyeOffsetSide,
    pupilRadius,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawMouthAndTongue(head, nx, ny, px, py) {
  if (state.mouthOpenTimer <= 0) return;
  // mouthOpenTimer counts down from MOUTH_ANIM_DURATION to 0
  const t = 1 - Math.max(0, Math.min(1, state.mouthOpenTimer / MOUTH_ANIM_DURATION)); // 0..1
  // smooth ease in/out
  const openness = Math.sin(Math.PI * t); // 0 -> 1 -> 0 like before but driven by normalized t

  // Reverse tongue direction: use the inverse of the movement vector so the tongue
  // extends to the opposite side of the head.
  const tx = -nx;
  const ty = -ny;

  // base positions (mouth opening) moved to the reversed side as well
  const baseX = head.x + tx * HEAD_RADIUS * 0.2;
  const baseY = head.y + ty * HEAD_RADIUS * 0.2;

  // Tongue parameters
  const flick = Math.sin(state.elapsedSec * 30) * 0.25 + 0.75; // subtle flick
  const maxTongueLen = HEAD_RADIUS * (0.9 + 0.6 * flick);
  const tongueLen = maxTongueLen * openness; // animate length by openness
  const tongueWidth = Math.max(1.5, HEAD_RADIUS * 0.22 * (0.5 + 0.5 * openness));

  // Positions along reversed axis
  const tongueTipX = head.x + tx * (HEAD_RADIUS * 0.8 + tongueLen);
  const tongueTipY = head.y + ty * (HEAD_RADIUS * 0.8 + tongueLen);

  // Fork point slightly before tip to create forked tongue
  const forkX = head.x + tx * (HEAD_RADIUS * 0.8 + tongueLen * 0.66);
  const forkY = head.y + ty * (HEAD_RADIUS * 0.8 + tongueLen * 0.66);

  // lateral offset for fork tips
  const lateral = Math.max(1, HEAD_RADIUS * 0.18) * (0.6 + 0.4 * openness);

  // Draw mouth opening (black outline) as two lines forming the mouth gap
  const mouthLeftX = baseX + px * HEAD_RADIUS * 0.25;
  const mouthLeftY = baseY + py * HEAD_RADIUS * 0.25;
  const mouthRightX = baseX - px * HEAD_RADIUS * 0.25;
  const mouthRightY = baseY - py * HEAD_RADIUS * 0.25;

  const mouthTipLeftX = forkX + px * lateral * 0.8;
  const mouthTipLeftY = forkY + py * lateral * 0.8;
  const mouthTipRightX = forkX - px * lateral * 0.8;
  const mouthTipRightY = forkY - py * lateral * 0.8;

  ctx.strokeStyle = COLOR_BLACK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mouthLeftX, mouthLeftY);
  ctx.quadraticCurveTo(head.x + tx * HEAD_RADIUS * 0.5, head.y + ty * HEAD_RADIUS * 0.5, mouthTipLeftX, mouthTipLeftY);
  ctx.moveTo(mouthRightX, mouthRightY);
  ctx.quadraticCurveTo(head.x + tx * HEAD_RADIUS * 0.5, head.y + ty * HEAD_RADIUS * 0.5, mouthTipRightX, mouthTipRightY);
  ctx.stroke();

  // Draw filled forked tongue as a tapered polygon for a smoother sliding animation
  ctx.fillStyle = COLOR_TONGUE;
  ctx.beginPath();
  // left fork
  ctx.moveTo(head.x + tx * HEAD_RADIUS * 0.8, head.y + ty * HEAD_RADIUS * 0.8);
  ctx.lineTo(forkX + px * lateral, forkY + py * lateral);
  ctx.lineTo(tongueTipX + px * (tongueWidth * 0.5), tongueTipY + py * (tongueWidth * 0.5));
  // right fork
  ctx.lineTo(forkX - px * lateral, forkY - py * lateral);
  ctx.closePath();
  ctx.globalAlpha = 0.95;
  ctx.fill();
  ctx.globalAlpha = 1;

  // small highlight on tongue tip
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(tongueTipX, tongueTipY, Math.max(1, tongueWidth * 0.35), 0, Math.PI * 2);
  ctx.fill();
}

// Skin renderer registry
const SKIN_RENDERERS = new Map([
  ['neon', drawGradientSkin],
  ['electric', drawElectricSkin],
  ['inferno', drawInfernoSkin],
  ['holographic', drawHolographicSkin],
  ['python', drawPythonSkin],
  ['cosmic', drawCosmicSkin],
  ['circuit', drawCircuitSkin],
  ['crystal', drawCrystalSkin],
  ['phantom', drawPhantomSkin]
]);

function drawSnake() {
  // Convert grid positions to pixel coordinates with interpolation
  const points = state.snake.map((seg, i) => {
    let x = seg.x * CELL_SIZE + CELL_SIZE / 2;
    let y = seg.y * CELL_SIZE + CELL_SIZE / 2;

    // Interpolate between previous and current position
    if (state.prevSnake && state.prevSnake[i] && state.moveProgress < 1) {
      const prev = state.prevSnake[i];
      const prevX = prev.x * CELL_SIZE + CELL_SIZE / 2;
      const prevY = prev.y * CELL_SIZE + CELL_SIZE / 2;
      const alpha = state.moveProgress;
      x = prevX + (x - prevX) * alpha;
      y = prevY + (y - prevY) * alpha;
    }

    return { x, y };
  });

  if (points.length === 0) return;

  // Calculate grow animation scale for tail segment
  const growProgress = state.growTimer > 0
    ? 1 - (state.growTimer / GROW_ANIMATION_DURATION) // 0 to 1
    : 1;

  // Get movement direction for head orientation
  const head = points[0];
  let nx = 0;
  let ny = 0;
  if (points.length > 1) {
    const next = points[1];
    const dx = next.x - head.x;
    const dy = next.y - head.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    nx = dx / len;
    ny = dy / len;
  }

  // Dispatch to appropriate skin renderer using registry
  const skin = state.currentSkin;
  const renderer = skin ? SKIN_RENDERERS.get(skin.id) : null;
  const skinRenderer = renderer || drawGradientSkin;
  skinRenderer(points, growProgress, skin);

  drawSnakeHead(head, nx, ny);
}

// Original gradient skin renderer (for 'neon' and fallback)
function drawGradientSkin(points, growProgress, skin) {
  const headColor = skin.head || skin.colors?.primary || COLOR_B;
  const tailColor = skin.tail || skin.colors?.secondary || COLOR_A;

  // Use lighter blend mode for neon glow effect
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = Math.round(BODY_RADIUS * 1.8);
  ctx.shadowColor = tailColor;

  // Draw body glow (thicker, blurred stroke)
  ctx.strokeStyle = tailColor;
  ctx.lineWidth = BODY_RADIUS * 2.6;
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
  ctx.restore();

  // Draw body base with gradient
  const bodyGrad = ctx.createLinearGradient(0, 0, CSS_WIDTH, CSS_HEIGHT);
  bodyGrad.addColorStop(0, headColor);
  bodyGrad.addColorStop(1, tailColor);
  ctx.strokeStyle = bodyGrad;
  ctx.lineWidth = BODY_RADIUS * 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();

  // Draw body shine
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = BODY_RADIUS * 0.22;
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();

  // Draw rounded caps at every segment
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = bodyGrad;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, BODY_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Draw segment details (scales)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 1; i < points.length; i += 2) {
    const p = points[i];
    const scale = (i === points.length - 1 && state.growTimer > 0) ? growProgress : 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, BODY_RADIUS * 0.6 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Helper: Draw lightning bolts between segments for electric skin
function drawLightningBolts(points, skin) {
  const { accent } = skin.colors;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  
  for (let i = 0; i < points.length - 1; i++) {
    const boltPhase = (state.elapsedSec * skin.animation.speed + i * 0.7) % 1;
    if (boltPhase < 0.3) { // Show bolt 30% of the time
      const p1 = points[i];
      const p2 = points[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      // Time-based pseudo-random offset for lightning effect
      const timeOffset = state.elapsedSec * 5 + i * 1.3;
      const offsetX = (Math.sin(timeOffset * 2.7) * 0.5) * BODY_RADIUS * 0.8;
      const offsetY = (Math.cos(timeOffset * 3.1) * 0.5) * BODY_RADIUS * 0.8;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(midX + offsetX, midY + offsetY);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ⚡ Electric Skin - Crackling lightning bolts
function drawElectricSkin(points, growProgress, skin) {
  const { primary, secondary, accent, glow } = skin.colors;

  // Draw body with electric blue gradient
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = Math.round(BODY_RADIUS * 2.5);
  ctx.shadowColor = glow;

  // Outer glow
  ctx.strokeStyle = primary;
  ctx.lineWidth = BODY_RADIUS * 2.8;
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
  ctx.restore();

  // Main body
  const bodyGrad = ctx.createLinearGradient(0, 0, CSS_WIDTH, CSS_HEIGHT);
  bodyGrad.addColorStop(0, accent);
  bodyGrad.addColorStop(0.5, primary);
  bodyGrad.addColorStop(1, secondary);
  ctx.strokeStyle = bodyGrad;
  ctx.lineWidth = BODY_RADIUS * 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();

  // Lightning bolts between segments (animated)
  drawLightningBolts(points, skin);

  // Energy core
  ctx.strokeStyle = accent;
  ctx.lineWidth = BODY_RADIUS * 0.3;
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
}

// Helper: Draw flame particles for inferno skin
function drawFlameParticles(points, skin) {
  const { accent, secondary } = skin.colors;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  
  for (let i = 0; i < points.length; i += 2) {
    const p = points[i];
    const wave = Math.sin(state.elapsedSec * 3 + i * 0.5) * BODY_RADIUS * 0.6;
    ctx.fillStyle = i % 4 === 0 ? accent : secondary;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(p.x, p.y + wave, BODY_RADIUS * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 🔥 Inferno Skin - Animated flames
function drawInfernoSkin(points, growProgress, skin) {
  const { primary, secondary, accent, core } = skin.colors;

  // Draw flame glow
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = Math.round(BODY_RADIUS * 3);
  ctx.shadowColor = accent;

  // Outer flame glow
  ctx.strokeStyle = primary;
  ctx.lineWidth = BODY_RADIUS * 3.2;
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
  ctx.restore();

  // Middle flame layer
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = secondary;
  ctx.lineWidth = BODY_RADIUS * 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
  ctx.restore();

  // Inner hot core
  ctx.strokeStyle = accent;
  ctx.lineWidth = BODY_RADIUS * 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();

  // Flickering core (animated)
  const flicker = Math.sin(state.elapsedSec * skin.animation.flickerSpeed) * 0.3 + 0.7;
  ctx.save();
  ctx.globalAlpha = flicker;
  ctx.strokeStyle = core;
  ctx.lineWidth = BODY_RADIUS * 0.8;
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
  ctx.restore();

  // Flame particles on segments
  drawFlameParticles(points, skin);
}

// 🌈 Holographic Skin - Rainbow color-shifting
function drawHolographicSkin(points, growProgress, skin) {
  // Calculate shifting hue based on time
  const hue = (state.elapsedSec * skin.animation.speed * 60) % 360;

  // Draw with shifting rainbow colors
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Multiple layers with different hue offsets for iridescent effect
  for (let layer = 0; layer < 3; layer++) {
    const layerHue = (hue + layer * 30) % 360;
    const color = `hsl(${layerHue}, 100%, 60%)`;
    const blur = (3 - layer) * BODY_RADIUS * 0.8;

    ctx.shadowBlur = blur;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = BODY_RADIUS * (2.8 - layer * 0.4);
    ctx.globalAlpha = 0.6 - layer * 0.1;

    beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
    ctx.stroke();
  }
  ctx.restore();

  // Shimmer effect on segments
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const segmentHue = (hue + i * 20) % 360;
    const shimmer = Math.sin(state.elapsedSec * skin.animation.shimmerSpeed + i * 0.8) * 0.5 + 0.5;

    ctx.fillStyle = `hsl(${segmentHue}, 100%, 70%)`;
    ctx.globalAlpha = shimmer * 0.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, BODY_RADIUS * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 🐍 Python Skin - Striped pattern
function drawPythonSkin(points, growProgress, skin) {
  const { primary, secondary, accent } = skin.colors;

  // Draw base black body
  ctx.strokeStyle = primary;
  ctx.lineWidth = BODY_RADIUS * 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();

  // Draw segment caps with alternating colors (stripes)
  const stripeWidth = skin.pattern.stripeWidth;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const scale = (i === points.length - 1 && state.growTimer > 0) ? growProgress : 1;
    const stripeIndex = Math.floor(i / stripeWidth) % 2;

    ctx.fillStyle = stripeIndex === 0 ? secondary : primary;
    ctx.beginPath();
    ctx.arc(p.x, p.y, BODY_RADIUS * scale, 0, Math.PI * 2);
    ctx.fill();

    // Add red accent border to yellow stripes
    if (stripeIndex === 0 && skin.pattern.border) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, BODY_RADIUS * scale * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Add shine
  ctx.strokeStyle = `rgba(255, 255, 255, ${SHINE_OVERLAY_OPACITY})`;
  ctx.lineWidth = BODY_RADIUS * 0.15;
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
}

// 🌌 Cosmic Skin - Galaxy/starfield texture
function drawCosmicSkin(points, growProgress, skin) {
  const { background, nebula1, nebula2, stars } = skin.colors;

  // Draw deep space background
  ctx.strokeStyle = background;
  ctx.lineWidth = BODY_RADIUS * 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();

  // Draw nebula clouds with soft glow
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowBlur = Math.round(BODY_RADIUS * 2);

  // Nebula layer 1
  ctx.shadowColor = nebula1;
  ctx.strokeStyle = nebula1;
  ctx.lineWidth = BODY_RADIUS * 1.8;
  ctx.globalAlpha = 0.4;
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();

  // Nebula layer 2
  ctx.shadowColor = nebula2;
  ctx.strokeStyle = nebula2;
  ctx.lineWidth = BODY_RADIUS * 1.4;
  ctx.globalAlpha = 0.3;
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
  ctx.restore();

  // Draw twinkling stars on segments
  drawTwinklingStars(points, skin);
}

// Helper: Draw twinkling stars for cosmic skin
function drawTwinklingStars(points, skin) {
  const { stars } = skin.colors;
  
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    // Generate pseudo-random star positions based on segment index
    for (let j = 0; j < 3; j++) {
      const angle = (i * STAR_GOLDEN_ANGLE + j * STAR_ANGLE_OFFSET) * Math.PI / 180;
      const dist = (BODY_RADIUS * 0.6) * ((i * 7 + j * 13) % 10) / 10;
      const sx = p.x + Math.cos(angle) * dist;
      const sy = p.y + Math.sin(angle) * dist;

      // Twinkle animation
      const twinkle = skin.pattern.twinkle
        ? Math.sin(state.elapsedSec * 4 + i * 0.5 + j) * 0.5 + 0.5
        : 1;

      ctx.fillStyle = stars;
      ctx.globalAlpha = twinkle * 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ⚙️ Circuit Skin - Cyberpunk tech pattern
function drawCircuitSkin(points, growProgress, skin) {
  const { primary, lines, nodes, glow } = skin.colors;

  // Draw dark circuit board base
  ctx.strokeStyle = primary;
  ctx.lineWidth = BODY_RADIUS * 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();

  // Draw segment caps
  ctx.fillStyle = primary;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const scale = (i === points.length - 1 && state.growTimer > 0) ? growProgress : 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, BODY_RADIUS * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw glowing circuit lines
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowBlur = Math.round(BODY_RADIUS * 1.5);
  ctx.shadowColor = glow;

  // Pulsing effect
  const pulse = Math.sin(state.elapsedSec * skin.pattern.pulseSpeed) * 0.3 + 0.7;
  ctx.globalAlpha = pulse;

  ctx.strokeStyle = lines;
  ctx.lineWidth = skin.pattern.lineWidth;
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
  ctx.restore();

  // Draw circuit nodes at segments
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const nodePulse = Math.sin(state.elapsedSec * skin.pattern.pulseSpeed + i * 0.3) * 0.5 + 0.5;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = CIRCUIT_NODE_SHADOW_BLUR;
    ctx.shadowColor = nodes;
    ctx.fillStyle = nodes;
    ctx.globalAlpha = nodePulse;
    ctx.beginPath();
    ctx.arc(p.x, p.y, skin.pattern.nodeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 💎 Crystal Skin - Faceted gem look
function drawCrystalSkin(points, growProgress, skin) {
  const { primary, secondary, highlight, sparkle } = skin.colors;

  // Draw crystal glow
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowBlur = Math.round(BODY_RADIUS * 2);
  ctx.shadowColor = sparkle;
  ctx.strokeStyle = secondary;
  ctx.lineWidth = BODY_RADIUS * 2.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
  ctx.restore();

  // Draw main crystal body with gradient
  const bodyGrad = ctx.createLinearGradient(0, 0, CSS_WIDTH, CSS_HEIGHT);
  bodyGrad.addColorStop(0, highlight);
  bodyGrad.addColorStop(0.5, primary);
  bodyGrad.addColorStop(1, secondary);
  ctx.strokeStyle = bodyGrad;
  ctx.lineWidth = BODY_RADIUS * 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();

  // Draw facets on segments
  drawCrystalFacets(points, growProgress, skin);

  // Sparkle effects
  drawCrystalSparkles(points, skin);
}

// Helper: Draw facets for crystal skin
function drawCrystalFacets(points, growProgress, skin) {
  const { highlight } = skin.colors;
  
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const scale = (i === points.length - 1 && state.growTimer > 0) ? growProgress : 1;

    for (let f = 0; f < skin.effect.facetCount; f++) {
      const angle = (f / skin.effect.facetCount) * Math.PI * 2;
      const facetDist = BODY_RADIUS * 0.5 * scale;
      const fx = p.x + Math.cos(angle) * facetDist * 0.3;
      const fy = p.y + Math.sin(angle) * facetDist * 0.3;

      ctx.fillStyle = f % 2 === 0 ? highlight : FACET_ALTERNATE_COLOR;
      ctx.beginPath();
      ctx.arc(fx, fy, BODY_RADIUS * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Helper: Draw sparkles for crystal skin
function drawCrystalSparkles(points, skin) {
  const { sparkle } = skin.colors;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  
  for (let i = 0; i < points.length; i++) {
    const sparklePhase = (state.elapsedSec * 2 + i * 0.7) % 1;
    if (sparklePhase < skin.effect.sparkleRate) {
      const p = points[i];
      ctx.fillStyle = sparkle;
      ctx.shadowBlur = SPARKLE_SHADOW_BLUR;
      ctx.shadowColor = sparkle;
      ctx.globalAlpha = 1 - (sparklePhase / skin.effect.sparkleRate);
      ctx.beginPath();
      ctx.arc(p.x, p.y, BODY_RADIUS * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// 👻 Phantom Skin - Ghostly transparent
function drawPhantomSkin(points, growProgress, skin) {
  const { primary, secondary, glow, inner } = skin.colors;

  // Draw ethereal glow
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowBlur = Math.round(BODY_RADIUS * 3.5);
  ctx.shadowColor = glow;
  ctx.strokeStyle = glow;
  ctx.lineWidth = BODY_RADIUS * 3;
  ctx.globalAlpha = 0.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
  ctx.restore();

  // Draw ghostly translucent body
  const bodyGrad = ctx.createRadialGradient(
    points[0].x, points[0].y, 0,
    points[0].x, points[0].y, BODY_RADIUS * points.length * 0.3
  );
  bodyGrad.addColorStop(0, inner);
  bodyGrad.addColorStop(0.5, primary);
  bodyGrad.addColorStop(1, secondary);

  ctx.globalAlpha = skin.effect.opacity;
  ctx.strokeStyle = bodyGrad;
  ctx.lineWidth = BODY_RADIUS * 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Draw inner glow
  if (skin.effect.innerGlow) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = inner;
    ctx.lineWidth = BODY_RADIUS * 0.8;
    beginRoundedPath(points, Math.round(BODY_RADIUS * 0.9));
    ctx.stroke();
    ctx.restore();
  }

  // Floating wispy effects
  drawPhantomWispyEffects(points, skin);
}

// Helper: Draw wispy effects for phantom skin
function drawPhantomWispyEffects(points, skin) {
  const { glow } = skin.colors;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  
  for (let i = 0; i < points.length; i += 2) {
    const p = points[i];
    const wave = Math.sin(state.elapsedSec * 2 + i * 0.7) * BODY_RADIUS * 0.5;
    const fade = Math.sin(state.elapsedSec * 3 + i) * 0.5 + 0.5;

    ctx.fillStyle = glow;
    ctx.globalAlpha = fade * 0.4;
    ctx.beginPath();
    ctx.arc(p.x + wave * 0.5, p.y + wave, BODY_RADIUS * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawParticles() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Draw any square fragments (pre-dissolve) created on death.
  if (state.fragments && state.fragments.length) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    for (const f of state.fragments) {
      // normalized life 0..1 (1 = fresh, 0 = gone)
      const norm = Math.max(0, Math.min(1, f.life / (f.maxLife || 1)));
      // fade out and slightly shrink as life decreases
      const alpha = norm;
      const sizeScale = 0.3 + 0.7 * norm; // never fully vanish in size until alpha hits 0
      const drawSize = f.size * sizeScale;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = f.color;
      // draw rotated square using translate/rotate
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.angle || 0);
      ctx.fillRect(-drawSize / 2, -drawSize / 2, drawSize, drawSize);
      ctx.restore();

      // subtle soft glow based on remaining life (unrotated glow for speed)
      ctx.globalAlpha = alpha * 0.45;
      ctx.fillRect(f.x - drawSize, f.y - drawSize, drawSize * 2, drawSize * 2);
    }
    ctx.restore();
  }

  for (const p of state.particles) {
    // Cull particles that are far off-screen to avoid wasted rendering
    if (
      p.x < -PARTICLE_CULL_MARGIN ||
      p.x > CSS_WIDTH + PARTICLE_CULL_MARGIN ||
      p.y < -PARTICLE_CULL_MARGIN ||
      p.y > CSS_HEIGHT + PARTICLE_CULL_MARGIN
    ) {
      continue;
    }
    const alpha = Math.min(1, p.life);
    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Add glow
      ctx.globalAlpha = alpha * 0.5;
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life * Math.PI);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      
      // Add glow
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
      ctx.restore();
    }
  }

  ctx.restore();
}

function drawFood() {
  const cx = state.food.x * CELL_SIZE + CELL_SIZE / 2;
  const cy = state.food.y * CELL_SIZE + CELL_SIZE / 2;
  const r = CELL_SIZE * 0.28;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Inner glow
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  grad.addColorStop(0.1, 'rgba(255, 0, 255, 0.5)');
  grad.addColorStop(0.4, 'rgba(0, 255, 255, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2, 0, Math.PI * 2);
  ctx.fill();

  // Core
  ctx.fillStyle = COLOR_WHITE;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawVignette() {
  const grad = ctx.createRadialGradient(
    CSS_WIDTH * 0.55,
    CSS_HEIGHT * 0.45,
    0,
    CSS_WIDTH * 0.5,
    CSS_HEIGHT * 0.5,
    Math.max(CSS_WIDTH, CSS_HEIGHT) * 0.7
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.4)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CSS_WIDTH, CSS_HEIGHT);
}

export function drawWorld() {
  ctx.clearRect(0, 0, CSS_WIDTH, CSS_HEIGHT);
  drawGrid();
  drawParticles();
  drawFood();
  drawSnake();
  drawVignette();
}

export const render = drawWorld;
