/**
 * Flow System (Chain Eating Multiplier)
 *
 * Rewards players for eating food quickly in succession.
 * Maintains a time window - eat within window to continue chain.
 * Build up flow tiers (0-4) for increasing score multipliers.
 */

import { FLOW } from './gameConfig.js';
import { state } from './state.js';

/**
 * Start or continue flow when food is eaten
 * Call this immediately after food collision
 */
export function onFoodEaten() {
    if (!state.flowActive) {
        // Start new flow chain
        startFlow();
    } else {
        // Continue existing chain
        continueFlow();
    }
}

/**
 * Start a new flow chain
 */
function startFlow() {
    state.flowActive = true;
    state.flowTimer = state.difficulty.flowWindow;
    state.flowStreak = 1;
    state.flowTier = 0;  // Start at tier 0, will increase after 3 food

    console.log(`[Flow] Started flow chain (Window: ${state.difficulty.flowWindow.toFixed(1)}s)`);
}

/**
 * Continue existing flow chain
 */
function continueFlow() {
    // Reset timer to full window
    state.flowTimer = state.difficulty.flowWindow;
    state.flowStreak++;

    // Check if we should increase flow tier
    if (state.flowStreak >= FLOW.foodToIncreaseFlow && state.flowTier < FLOW.maxFlowTier) {
        increaseFlowTier();
        state.flowStreak = 0;  // Reset streak counter for next tier
    }

    console.log(`[Flow] Chain continued (Streak: ${state.flowStreak}, Tier: ${state.flowTier}, Timer: ${state.flowTimer.toFixed(1)}s)`);
}

/**
 * Increase flow tier (better multiplier)
 */
function increaseFlowTier() {
    const prevTier = state.flowTier;
    state.flowTier = Math.min(state.flowTier + 1, FLOW.maxFlowTier);
    const multiplier = FLOW.scoreMultipliers[state.flowTier];

    console.log(`[Flow] Tier increased: ${prevTier} → ${state.flowTier} (${multiplier.toFixed(1)}x multiplier)`);

    // TODO: Visual feedback (particle burst, snake glow change, sound effect)
}

/**
 * Update flow timer each frame
 * Call this in the main game loop during 'playing' state
 * @param {number} dt - Delta time in seconds
 */
export function updateFlowTimer(dt) {
    if (!state.flowActive) return;

    state.flowTimer -= dt;

    // Check if window expired
    if (state.flowTimer <= 0) {
        expireFlow();
    }
}

/**
 * Flow window expired - reset flow system
 */
function expireFlow() {
    const prevTier = state.flowTier;

    state.flowTier = 0;
    state.flowStreak = 0;
    state.flowTimer = 0;
    state.flowActive = false;

    if (prevTier > 0) {
        console.log(`[Flow] Flow expired! Chain broken. (Was at tier ${prevTier})`);
        // TODO: Visual feedback (fade out glow, "Flow Lost!" message, sound effect)
    }
}

/**
 * Get current flow multiplier
 * @returns {number} Current score multiplier (1.0 = no bonus)
 */
export function getCurrentFlowMultiplier() {
    return FLOW.scoreMultipliers[state.flowTier] || 1.0;
}

/**
 * Get flow color for current tier
 * @returns {string} Hex color code
 */
export function getFlowColor() {
    return FLOW.flowColors[state.flowTier] || FLOW.flowColors[0];
}

/**
 * Get flow glow intensity for current tier
 * @returns {number} Intensity 0.0 - 1.0
 */
export function getFlowGlowIntensity() {
    return FLOW.flowGlowIntensity[state.flowTier] || 0;
}

/**
 * Reset flow system (call on game reset)
 */
export function resetFlow() {
    state.flowTier = 0;
    state.flowStreak = 0;
    state.flowTimer = 0;
    state.flowActive = false;
    console.log('[Flow] Reset');
}

/**
 * Check if flow is active and player is in danger of losing it
 * @returns {boolean} True if flow active and timer < 2 seconds
 */
export function isFlowInDanger() {
    return state.flowActive && state.flowTimer > 0 && state.flowTimer < 2.0;
}
