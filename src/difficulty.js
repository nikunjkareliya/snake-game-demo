/**
 * Difficulty & Progression System
 *
 * Designer-friendly modular system for tier progression and speed scaling.
 * All progression is driven by food collected, not time.
 */

import { DIFFICULTY, FLOW } from './gameConfig.js';
import { state } from './state.js';

/**
 * Calculate difficulty tier based on total food collected
 * @param {number} foodCount - Total food eaten this run
 * @returns {number} Current tier (0 to DIFFICULTY.maxTier)
 */
export function calculateTier(foodCount) {
    let tier = 0;
    let cumulative = 0;

    for (let i = 0; i < DIFFICULTY.foodPerTier.length; i++) {
        cumulative += DIFFICULTY.foodPerTier[i];
        if (foodCount >= cumulative) {
            tier = i + 1;
        } else {
            break;
        }
    }

    return Math.min(tier, DIFFICULTY.maxTier);
}

/**
 * Get snake movement speed for a given tier
 * @param {number} tier - Current difficulty tier
 * @returns {number} Speed in milliseconds per move
 */
export function getSpeedForTier(tier) {
    const speed = DIFFICULTY.speedByTier[tier];
    if (speed !== undefined) {
        return Math.max(speed, DIFFICULTY.speedMin);
    }
    // Fallback: use last defined speed
    const lastSpeed = DIFFICULTY.speedByTier[DIFFICULTY.speedByTier.length - 1];
    return Math.max(lastSpeed || 60, DIFFICULTY.speedMin);
}

/**
 * Calculate flow window duration for current tier
 * Window shrinks at higher tiers for increased challenge
 * @param {number} tier - Current difficulty tier
 * @returns {number} Flow window in seconds
 */
export function calculateFlowWindow(tier) {
    const window = FLOW.windowBaseSec - (tier * FLOW.windowDecayPerTier);
    return Math.max(FLOW.windowMin, window);
}

/**
 * Get score multiplier for current flow tier
 * @param {number} flowTier - Current flow level (0-4)
 * @returns {number} Score multiplier (1.0 = no bonus)
 */
export function getFlowMultiplier(flowTier) {
    return FLOW.scoreMultipliers[flowTier] || 1.0;
}

/**
 * Calculate food needed to reach next tier
 * @param {number} currentTier - Current tier
 * @returns {number} Total food needed for next tier
 */
export function getFoodForNextTier(currentTier) {
    let cumulative = 0;
    const targetTier = Math.min(currentTier + 1, DIFFICULTY.maxTier);

    for (let i = 0; i < targetTier && i < DIFFICULTY.foodPerTier.length; i++) {
        cumulative += DIFFICULTY.foodPerTier[i];
    }

    return cumulative;
}

/**
 * Update difficulty snapshot after eating food
 * Call this whenever food is eaten to recalculate tier and speed
 */
export function updateDifficultySnapshot() {
    const prevTier = state.difficultyTier;
    const tier = calculateTier(state.foodCollectedTotal);
    const speedMs = getSpeedForTier(tier);
    const flowWindow = calculateFlowWindow(tier);
    const nextTierAt = getFoodForNextTier(tier);

    // Update state
    state.difficultyTier = tier;
    state.speedMs = speedMs;
    state.difficulty = {
        tier,
        speedMs,
        flowWindow,
        nextTierAt,
    };

    // Log tier changes
    if (tier !== prevTier) {
        console.log(`[Difficulty] Tier increased: ${prevTier} → ${tier} (Speed: ${speedMs}ms, Next tier at: ${nextTierAt} food)`);
    }
}

/**
 * Reset difficulty to initial state
 * Call this on game reset
 */
export function resetDifficulty() {
    state.difficultyTier = 0;
    state.foodCollectedTotal = 0;
    state.speedMs = DIFFICULTY.speedByTier[0] || 120;
    state.difficulty = {
        tier: 0,
        speedMs: state.speedMs,
        flowWindow: FLOW.windowBaseSec,
        nextTierAt: DIFFICULTY.foodPerTier[0] || 10,
    };
    console.log('[Difficulty] Reset to Tier 0');
}
