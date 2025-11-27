import { DPR, CSS_WIDTH, CSS_HEIGHT } from './config.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Set actual canvas size (physical pixels)
canvas.width = CSS_WIDTH * DPR;
canvas.height = CSS_HEIGHT * DPR;

// Set CSS display size
canvas.style.width = `${CSS_WIDTH}px`;
canvas.style.height = `${CSS_HEIGHT}px`;

// Set up high DPI canvas scaling
ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

// Ensure canvas can receive focus for keyboard events when overlay is hidden
canvas.setAttribute('tabindex', '0');
canvas.addEventListener('click', () => canvas.focus());
// Focus canvas immediately so spacebar works from the start
import { CANVAS_FOCUS_DELAY } from './config.js';

// Focus canvas immediately so spacebar works from the start
setTimeout(() => canvas.focus(), CANVAS_FOCUS_DELAY);
