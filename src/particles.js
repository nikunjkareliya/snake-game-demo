import { state } from './state.js';
import { MAX_PARTICLES } from './config.js';

/**
 * Add a single particle to the shared particle array, enforcing a max cap.
 * @param {object} particle
 */
export function addParticle(particle) {
  if (state.particles.length >= MAX_PARTICLES) {
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
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    const p = {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: options.life ?? 0.5 + Math.random() * 0.3,
      color: options.color ?? (Math.random() < 0.5 ? state.currentSkin.head : state.currentSkin.tail),
      shape: options.shape ?? (Math.random() < 0.5 ? 'circle' : 'square'),
      size: options.size ?? 2 + Math.random() * 2
    };

    addParticle(p);
  }
}
