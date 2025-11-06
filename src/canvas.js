import { DPR } from './config.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Set up high DPI canvas
ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

// Ensure canvas can receive focus for keyboard events when overlay is hidden
canvas.setAttribute('tabindex', '0');
canvas.addEventListener('click', () => canvas.focus());
// Focus canvas immediately so spacebar works from the start
import { CANVAS_FOCUS_DELAY } from './config.js';

// Focus canvas immediately so spacebar works from the start
setTimeout(() => canvas.focus(), CANVAS_FOCUS_DELAY);
