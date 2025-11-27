import { state } from './state.js';
import { MAX_PARTICLES } from './config.js';
import { getSkinParticlePalette } from './skinPalette.js';
import { MOBILE_PERFORMANCE } from './gameConfig.js';

/**
 * Get max particles based on device type
 * @returns {number} Maximum particle count for current device
 */
function getMaxParticles() {
  const isMobile = window.innerWidth <= 800 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return isMobile ? MOBILE_PERFORMANCE.maxParticles : MAX_PARTICLES;
}

/**
 * Add a single particle to the shared particle array, enforcing a max cap.
 * @param {object} particle
 */
export function addParticle(particle) {
  const maxParticles = getMaxParticles(); // Dynamic limit based on device
  if (state.particles.length >= maxParticles) {
    // Remove oldest particle to keep array under cap
    state.particles.shift();
  }
  state.particles.push(particle);
}

/**
 * Create a radial burst of particles centered at x,y.
 * @param {number} x
 * @param {number} y
 * @param {number} count
 * @param {number} speedMin
 * @param {number} speedMax
 * @param {object} options - Optional overrides: life, color, shape, size
 */
export function createBurst(x, y, count, speedMin, speedMax, options = {}) {
  const palette = options.palette ?? getSkinParticlePalette(state.currentSkin, state.elapsedSec);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    const colorChoice = options.color
      ? options.color
      : palette[Math.floor(Math.random() * palette.length)];
    const shapeChoice = options.shape ?? (Math.random() < 0.5 ? 'circle' : 'square');
    const p = {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: options.life ?? 0.5 + Math.random() * 0.3,
      color: colorChoice,
      shape: shapeChoice,
      size: options.size ?? 2 + Math.random() * 2
    };

    addParticle(p);
  }
}
