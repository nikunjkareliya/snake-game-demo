/**
 * Hazard System Manager
 *
 * Handles hazard spawning, collision detection, and lifecycle management.
 * Hazards are dangerous tiles/objects that kill the snake on contact.
 */

import { state } from './state.js';
import { COLUMNS, ROWS, CELL_SIZE } from './config.js';
import { HAZARDS, TIER_SCRIPT } from './gameConfig.js';
import { createBurst } from './particles.js';

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

    // Create spawn particle burst
    const cx = pos.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = pos.y * CELL_SIZE + CELL_SIZE / 2;
    createBurst(
        cx, cy,
        HAZARDS.spawnParticleCount,
        HAZARDS.spawnParticleSpeedMin,
        HAZARDS.spawnParticleSpeedMax,
        {
            life: HAZARDS.spawnParticleLife,
            color: HAZARDS.static.glowColor,
            shape: HAZARDS.spawnParticleShape,
            size: 3
        }
    );

    // Enhanced logging with count
    if (TIER_SCRIPT.logSpawnEvents) {
        const newCount = getHazardCounts().total;
        console.log(`[Hazards] Spawned static hazard at (${pos.x}, ${pos.y}) - ID: ${hazard.id} (Count: ${newCount})`);
    }
}

/**
 * Spawn a patrol orb (moving hazard) at a safe position
 * @returns {void}
 */
export function spawnPatrolOrb() {
    const safeRadius = HAZARDS.dynamicSpawnSafeRadius;
    const head = state.snake[0];

    if (!head) {
        console.warn('[Hazards] Cannot spawn patrol orb - snake head not found');
        return;
    }

    // Check max limit
    const counts = getHazardCounts();
    if (counts.dynamic >= HAZARDS.maxConcurrentDynamic) {
        console.warn(`[Hazards] Max dynamic hazard limit reached (${HAZARDS.maxConcurrentDynamic})`);
        return;
    }

    const emptyCells = [];

    // Find all valid empty cells for dynamic hazards
    for (let x = 0; x < COLUMNS; x++) {
        for (let y = 3; y < ROWS; y++) { // Skip top 3 rows
            // Check not occupied by snake
            const onSnake = state.snake.some(seg => seg.x === x && seg.y === y);
            if (onSnake) continue;

            // Check not occupied by food
            if (state.food.x === x && state.food.y === y) continue;

            // Check not too close to head (larger radius for dynamic)
            const distToHead = Math.abs(x - head.x) + Math.abs(y - head.y);
            if (distToHead < safeRadius) continue;

            // Check not occupied by other hazards
            const onHazard = state.hazards.some(h => h.x === x && h.y === y);
            if (onHazard) continue;

            emptyCells.push({ x, y });
        }
    }

    if (emptyCells.length === 0) {
        console.warn('[Hazards] No safe spawn positions for patrol orb');
        return;
    }

    // Pick random safe position
    const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // Random patrol direction (horizontal or vertical)
    const isHorizontal = Math.random() < 0.5;
    const direction = Math.random() < 0.5 ? 1 : -1;

    // Calculate patrol bounds
    const patrolLength = HAZARDS.patrolOrb.patrolMinLength +
        Math.floor(Math.random() * (HAZARDS.patrolOrb.patrolMaxLength - HAZARDS.patrolOrb.patrolMinLength + 1));

    let bounds;
    if (isHorizontal) {
        const minX = Math.max(0, pos.x - Math.floor(patrolLength / 2));
        const maxX = Math.min(COLUMNS - 1, pos.x + Math.floor(patrolLength / 2));
        bounds = { minX, maxX, minY: pos.y, maxY: pos.y };
    } else {
        const minY = Math.max(3, pos.y - Math.floor(patrolLength / 2)); // Keep out of HUD area
        const maxY = Math.min(ROWS - 1, pos.y + Math.floor(patrolLength / 2));
        bounds = { minX: pos.x, maxX: pos.x, minY, maxY };
    }

    // Get speed based on difficulty tier
    const baseSpeed = HAZARDS.patrolOrb.speed;
    const scaling = HAZARDS.patrolOrb.speedTierScaling || 0.2;
    const speed = Math.min(baseSpeed + (state.difficultyTier * scaling), HAZARDS.patrolOrb.maxSpeed);

    // Create patrol orb object
    const hazard = {
        id: `patrol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'patrol_orb',
        x: pos.x,
        y: pos.y,
        state: 'telegraph',
        age: 0,
        telegraphDuration: HAZARDS.telegraphDurationSec,

        // Movement properties
        velocity: {
            x: isHorizontal ? direction : 0,
            y: isHorizontal ? 0 : direction
        },
        patrolBounds: bounds,
        speedCellsPerSec: speed,
        lastMoveTime: 0,
        trailPositions: [],

        // === EVIL EYE BLINKING ===
        blinkTimer: 0,  // Seconds remaining while eyes are closed
        nextBlinkIn: 2.5 + Math.random() * 3.5  // Random between 2.5-6.0 seconds
    };

    state.hazards.push(hazard);

    // Create spawn particle burst
    const cx = pos.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = pos.y * CELL_SIZE + CELL_SIZE / 2;
    createBurst(
        cx, cy,
        HAZARDS.spawnParticleCount,
        HAZARDS.spawnParticleSpeedMin,
        HAZARDS.spawnParticleSpeedMax,
        {
            life: HAZARDS.spawnParticleLife,
            color: HAZARDS.patrolOrb.glowColor,
            shape: HAZARDS.spawnParticleShape,
            size: 3
        }
    );

    if (TIER_SCRIPT.logSpawnEvents) {
        const newCount = getHazardCounts().total;
        console.log(`[Hazards] Spawned patrol orb at (${pos.x}, ${pos.y}) - ID: ${hazard.id} (Speed: ${speed.toFixed(2)}) (Count: ${newCount})`);
    }
}

/**
 * Update all hazards (age tracking, state transitions, movement)
 * @param {number} dt - Delta time in seconds
 * @returns {void}
 */
export function updateHazards(dt) {
    for (const hazard of state.hazards) {
        hazard.age += dt;

        // Update patrol orb movement
        if (hazard.type === 'patrol_orb') {
            updatePatrolOrbMovement(hazard, dt);
        }

        // Transition from telegraph to active
        if (hazard.state === 'telegraph' && hazard.age >= hazard.telegraphDuration) {
            hazard.state = 'active';
            console.log(`[Hazards] ${hazard.id} is now ACTIVE (lethal)`);

            // Create activation particle burst
            const cx = hazard.x * CELL_SIZE + CELL_SIZE / 2;
            const cy = hazard.y * CELL_SIZE + CELL_SIZE / 2;
            createBurst(
                cx, cy,
                HAZARDS.activateParticleCount,
                HAZARDS.activateParticleSpeedMin,
                HAZARDS.activateParticleSpeedMax,
                {
                    life: HAZARDS.activateParticleLife,
                    color: HAZARDS.patrolOrb.color,
                    shape: HAZARDS.activateParticleShape,
                    size: 4
                }
            );
        }
    }
}

/**
 * Update patrol orb position and handle boundary reversal
 * @param {Object} hazard - Patrol orb hazard object
 * @param {number} dt - Delta time in seconds
 * @returns {void}
 */
function updatePatrolOrbMovement(hazard, dt) {
    // Record trail position before moving
    hazard.trailPositions.unshift({ x: hazard.x, y: hazard.y, age: 0 });
    if (hazard.trailPositions.length > HAZARDS.patrolOrb.trailLength) {
        hazard.trailPositions.pop();
    }

    // Age trail positions
    for (const pos of hazard.trailPositions) {
        pos.age += dt;
    }

    // === UPDATE EVIL EYE BLINKING ===
    if (hazard.blinkTimer > 0) {
        hazard.blinkTimer = Math.max(0, hazard.blinkTimer - dt);
    }

    // Schedule next blink
    hazard.nextBlinkIn = Math.max(0, hazard.nextBlinkIn - dt);
    if (hazard.nextBlinkIn <= 0) {
        // Trigger blink (0.12 second duration, same as snake)
        hazard.blinkTimer = 0.12;
        // Schedule next blink: random between 2.5-6.0 seconds
        hazard.nextBlinkIn = 2.5 + Math.random() * 3.5;
    }

    // Update hazard position based on speed
    hazard.lastMoveTime += dt;
    const moveDistance = hazard.speedCellsPerSec * dt;
    const newX = hazard.x + hazard.velocity.x * moveDistance;
    const newY = hazard.y + hazard.velocity.y * moveDistance;

    // Check bounds and reverse direction if needed
    let finalX = newX;
    let finalY = newY;

    // Horizontal movement
    if (hazard.velocity.x !== 0) {
        if (newX <= hazard.patrolBounds.minX) {
            finalX = hazard.patrolBounds.minX;
            hazard.velocity.x = 1; // Reverse to positive
        } else if (newX >= hazard.patrolBounds.maxX) {
            finalX = hazard.patrolBounds.maxX;
            hazard.velocity.x = -1; // Reverse to negative
        }
    }

    // Vertical movement
    if (hazard.velocity.y !== 0) {
        if (newY <= hazard.patrolBounds.minY) {
            finalY = hazard.patrolBounds.minY;
            hazard.velocity.y = 1; // Reverse to positive
        } else if (newY >= hazard.patrolBounds.maxY) {
            finalY = hazard.patrolBounds.maxY;
            hazard.velocity.y = -1; // Reverse to negative
        }
    }

    hazard.x = finalX;
    hazard.y = finalY;
}

/**
 * Check if a position collides with any active hazard
 * @param {{x: number, y: number}} position - Grid position to check
 * @returns {boolean} True if position collides with active hazard
 */
export function checkHazardCollision(position) {
    return state.hazards.some(h => {
        if (h.state !== 'active') return false;

        if (h.type === 'static') {
            // Static hazards use grid-based collision (exact cell match)
            return h.x === position.x && h.y === position.y;
        } else if (h.type === 'patrol_orb') {
            // Patrol orbs use circular collision detection
            // Calculate Manhattan distance from hazard center to snake segment center
            const dx = h.x - position.x;
            const dy = h.y - position.y;
            const distanceSquared = dx * dx + dy * dy;

            // Collision radius is 0.7 cells, so collision occurs within ~0.49 cells squared
            const collisionRadiusSquared = 0.49;
            return distanceSquared < collisionRadiusSquared;
        }

        return false;
    });
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
