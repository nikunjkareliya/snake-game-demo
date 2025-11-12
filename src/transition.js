/**
 * Play Button Transition Animation
 *
 * Displays an animated snake crawling across the screen when the player
 * clicks the play button. Creates a smooth wipe transition to the game.
 */

import { UI_ANIMATIONS } from './gameConfig.js';

const NEON_GRADIENT = {
    start: '#ff00ff',  // Magenta
    end: '#00eaff'     // Cyan
};

const SEGMENT_COLORS = [
    '#ff00ff', '#ff0080', '#ff0040', '#ff0020',
    '#00eaff', '#00ffaa', '#00ff80', '#00ff40',
    '#00ff00', '#80ff00', '#ffff00', '#ff8000'
];

/**
 * Generate color for a specific segment using gradient interpolation
 * @param {number} index - Segment index (0 = head)
 * @param {number} total - Total segments
 * @returns {string} CSS color for this segment
 */
function getSegmentColor(index, total) {
    // Use predefined colors for smooth gradient effect
    const colorIndex = Math.floor((index / total) * (SEGMENT_COLORS.length - 1));
    return SEGMENT_COLORS[colorIndex];
}

/**
 * Create transition snake container with animated segments
 * @returns {HTMLElement} Container div with snake segments
 */
function createTransitionSnake() {
    const container = document.createElement('div');
    container.id = 'transition-snake-container';
    container.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1001;
        overflow: hidden;
    `;

    const segmentCount = UI_ANIMATIONS.transitionSegmentCount;
    const segmentSize = 32 * UI_ANIMATIONS.transitionSnakeSize;
    const canvasHeight = 768;
    const centerY = canvasHeight / 2;

    // Create snake segments
    for (let i = 0; i < segmentCount; i++) {
        const segment = document.createElement('div');
        const color = getSegmentColor(i, segmentCount);

        segment.className = 'transition-snake-segment';
        segment.style.cssText = `
            position: absolute;
            width: ${segmentSize}px;
            height: ${segmentSize}px;
            border-radius: 50%;
            left: -${segmentSize * 2}px;
            top: ${centerY - segmentSize / 2}px;
            background: radial-gradient(circle at 30% 30%, ${color}, ${color}dd);
            box-shadow: 0 0 ${segmentSize * 0.8}px ${color}, 0 0 ${segmentSize * 1.2}px ${color}99;
            opacity: 0.95;
        `;

        // Stagger the animation delay for each segment
        const delay = i * 0.02;
        segment.style.animation = `transitionSnakeCrawl ${UI_ANIMATIONS.transitionDuration}s ease-in-out ${delay}s forwards`;

        container.appendChild(segment);
    }

    return container;
}

/**
 * Start the transition animation
 * Returns a promise that resolves when animation completes
 * @returns {Promise<void>}
 */
export function startTransition() {
    return new Promise((resolve) => {
        // Get the overlay element
        const overlay = document.getElementById('overlay');
        if (!overlay) {
            resolve();
            return;
        }

        // Create and inject transition snake
        const snakeContainer = createTransitionSnake();
        overlay.appendChild(snakeContainer);

        // Remove after animation completes
        const duration = UI_ANIMATIONS.transitionDuration * 1000;
        const timeout = setTimeout(() => {
            if (snakeContainer.parentNode) {
                snakeContainer.parentNode.removeChild(snakeContainer);
            }
            resolve();
        }, duration + 100); // Small buffer to ensure animation completes

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            clearTimeout(timeout);
        }, { once: true });
    });
}

/**
 * Clean up any active transitions
 * Call this if needed to cancel in-progress transitions
 */
export function cleanupTransition() {
    const container = document.getElementById('transition-snake-container');
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
}
