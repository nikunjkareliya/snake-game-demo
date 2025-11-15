/**
 * Hazard System Manager
 *
 * Handles hazard spawning, collision detection, and lifecycle management.
 * Hazards are dangerous tiles/objects that kill the snake on contact.
 */

import { state } from './state.js';
import { COLUMNS, ROWS } from './config.js';
import { HAZARDS, TIER_SCRIPT } from './gameConfig.js';

/**
 * Spawn a static hazard at a safe position
 * @returns {void}
 */
export function spawnStaticHazard() {
    // Check max limit
    const counts = getHazardCounts();
    if (counts.total >= HAZARDS.maxConcurrentStatic) {
        console.warn(`[Hazards] Max static hazard limit reached (${HAZARDS.maxConcurrentStatic})`);
        return;
    }

    const safeRadius = HAZARDS.spawnSafeRadius;
    const head = state.snake[0];

    if (!head) {
        console.warn('[Hazards] Cannot spawn - snake head not found');
        return;
    }

    const emptyCells = [];

    // Find all valid empty cells
    for (let x = 0; x < COLUMNS; x++) {
        for (let y = 0; y < ROWS; y++) {
            // Check not occupied by snake
            const onSnake = state.snake.some(seg => seg.x === x && seg.y === y);
            if (onSnake) continue;

            // Check not occupied by food
            if (state.food.x === x && state.food.y === y) continue;

            // Check not too close to head (Manhattan distance)
            const distToHead = Math.abs(x - head.x) + Math.abs(y - head.y);
            if (distToHead < safeRadius) continue;

            // Check not too close to food
            const distToFood = Math.abs(x - state.food.x) + Math.abs(y - state.food.y);
            if (distToFood < HAZARDS.minDistanceFromFood) continue;

            // Check not occupied by other hazards
            const onHazard = state.hazards.some(h => h.x === x && h.y === y);
            if (onHazard) continue;

            emptyCells.push({ x, y });
        }
    }

    if (emptyCells.length === 0) {
        console.warn('[Hazards] No safe spawn positions available');
        return;
    }

    // Pick random safe position
    const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // Create hazard object
    const hazard = {
        id: `hazard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'static',
        x: pos.x,
        y: pos.y,
        state: 'telegraph',  // 'telegraph' → 'active'
        age: 0,              // Seconds since spawn
        telegraphDuration: HAZARDS.telegraphDurationSec,
    };

    state.hazards.push(hazard);

    // Enhanced logging with count
    if (TIER_SCRIPT.logSpawnEvents) {
        const newCount = getHazardCounts().total;
        console.log(`[Hazards] Spawned static hazard at (${pos.x}, ${pos.y}) - ID: ${hazard.id} (Count: ${newCount})`);
    }
}

/**
 * Update all hazards (age tracking, state transitions)
 * @param {number} dt - Delta time in seconds
 * @returns {void}
 */
export function updateHazards(dt) {
    for (const hazard of state.hazards) {
        hazard.age += dt;

        // Transition from telegraph to active
        if (hazard.state === 'telegraph' && hazard.age >= hazard.telegraphDuration) {
            hazard.state = 'active';
            console.log(`[Hazards] ${hazard.id} is now ACTIVE (lethal)`);
        }
    }
}

/**
 * Check if a position collides with any active hazard
 * @param {{x: number, y: number}} position - Grid position to check
 * @returns {boolean} True if position collides with active hazard
 */
export function checkHazardCollision(position) {
    return state.hazards.some(h =>
        h.state === 'active' &&
        h.x === position.x &&
        h.y === position.y
    );
}

/**
 * Reset all hazards (called on game start/restart)
 * @returns {void}
 */
export function resetHazards() {
    state.hazards = [];
    console.log('[Hazards] Reset - all hazards cleared');
}

/**
 * Remove a specific hazard by ID
 * @param {string} hazardId - The hazard ID to remove
 * @returns {void}
 */
export function removeHazard(hazardId) {
    const index = state.hazards.findIndex(h => h.id === hazardId);
    if (index !== -1) {
        state.hazards.splice(index, 1);
        console.log(`[Hazards] Removed hazard ${hazardId}`);
    }
}

/**
 * Get count of hazards by state
 * @returns {{telegraph: number, active: number, total: number}}
 */
export function getHazardCounts() {
    const telegraph = state.hazards.filter(h => h.state === 'telegraph').length;
    const active = state.hazards.filter(h => h.state === 'active').length;
    return {
        telegraph,
        active,
        total: state.hazards.length,
    };
}
