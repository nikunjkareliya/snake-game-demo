/**
 * Game Design Configuration
 *
 * This file contains all tunable game design values for easy adjustment.
 * Game designers can modify these values without touching game logic code.
 */

// ============================================================================
// ECONOMY SETTINGS
// ============================================================================

export const ECONOMY = {
    // Starting currency for new players
    startingCurrency: 0,

    // Currency rewards
    coinPerFood: 1,              // Coins earned per food eaten
    coinPerDeath: 0,             // Base coins on death (before score multiplier)
    coinPerScoreMultiplier: 0.1, // Multiplier: coins = score * this value

    // Skin pricing
    // Note: These override the prices in config.js SKINS array
    // Set a skin price to 0 to make it free
    skinPrices: {
        neon: 0,           // Default/free skin
        python: 30,        // Pattern skin
        cosmic: 50,        // Pattern skin
        circuit: 50,       // Pattern skin
        electric: 60,      // Animated skin
        holographic: 80,   // Animated skin
        inferno: 90,       // Animated skin
        crystal: 100,      // Special skin
        phantom: 120,      // Special skin
    },
};

// ============================================================================
// GAMEPLAY SETTINGS
// ============================================================================

export const GAMEPLAY = {
    // Speed settings (milliseconds between moves - lower = faster)
    speedDefault: 120,
    speedMin: 70,        // Fastest possible speed
    speedMax: 200,       // Slowest possible speed

    // Difficulty progression
    enableDifficultyRamp: false,  // Enable automatic speed increase
    speedRampEveryNFood: 5,       // Increase speed every N food eaten
    speedRampAmount: 5,           // Decrease speedMs by this amount (makes it faster)

    // Snake starting conditions
    startingLength: 3,
    startingDirection: 'Right',   // 'Up', 'Down', 'Left', 'Right'

    // Food
    foodValue: 1,        // Points per food
};

// ============================================================================
// VISUAL SETTINGS
// ============================================================================

export const VISUAL = {
    // Particle effects
    maxParticles: 200,
    particleCountEat: 20,
    particleCountDeath: 6,

    // Animation durations (seconds)
    mouthAnimDuration: 0.45,
    deathAnimDuration: 1.0,
    growAnimDuration: 0.2,
    hitShakeDuration: 0.5,

    // Enable/disable visual features
    enableMotionTrail: true,
    enableFoodSparks: true,
    enableBlinking: true,
    enableDeathFragments: true,
};

// ============================================================================
// UI ANIMATION SETTINGS
// ============================================================================

export const UI_ANIMATIONS = {
    // Title gradient animation (lobby screen)
    titleGradientSpeed: 5,           // Duration in seconds (lower = faster)

    // Title floating wave (continuous idle animation)
    titleWaveAmplitude: 6,           // Pixels (vertical movement)
    titleWaveScale: 1.03,            // Scale at peak (1.0 = no scale)
    titleWaveDuration: 7,            // Duration in seconds per cycle

    // Title entrance bounce animation
    titleEntranceDuration: 0.3,      // Duration in seconds
    titleBounceHeight: 5,            // Pixels of overshoot
    titleBounceScale: 1.05,          // Scale at peak

    // Background glow pulse (title)
    glowPulseMin: 0.15,              // Minimum opacity
    glowPulseMax: 0.35,              // Maximum opacity
    glowPulseDuration: 4,            // Duration in seconds

    // Lobby background particles
    particleCount: 8,                // Number of floating particles
    particleFloatDuration: 8,        // Average duration in seconds

    // Menu animations
    menuSlideDelay: 0.2,             // Delay before menu appears
    menuSlideDuration: 0.7,          // Duration of slide-in

    // Hero Play button animations
    heroButtonPulseSpeed: 2.5,       // Duration of pulse cycle in seconds
    heroButtonPulseScale: 1.02,      // Scale at pulse peak

    // Stat boxes
    statsFadeDelay: 0.5,             // Delay before stats appear
    statsFadeDuration: 0.7,          // Duration of fade-in
};

// ============================================================================
// PERSISTENCE SETTINGS
// ============================================================================

export const PERSISTENCE = {
    // LocalStorage keys (change these to reset all player data)
    storagePrefix: 'neonSnake',

    // What to persist
    persistHighScore: true,
    persistCurrency: true,
    persistOwnedSkins: true,
    persistSettings: true,
};

// ============================================================================
// DEVELOPER / DEBUG SETTINGS
// ============================================================================

export const DEV = {
    // Debug mode
    debugMode: false,

    // Cheats (only active when debugMode = true)
    startWithAllSkins: false,
    startWithCurrency: 0,
    godMode: false,           // No collision death

    // Performance monitoring
    showFPS: false,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the price for a specific skin
 * @param {string} skinId - The skin identifier
 * @returns {number} The price in coins (0 = free)
 */
export function getSkinPrice(skinId) {
    return ECONOMY.skinPrices[skinId] ?? 0;
}

/**
 * Calculate coins earned on death based on score
 * @param {number} score - The player's final score
 * @returns {number} Coins to award
 */
export function calculateDeathReward(score) {
    return ECONOMY.coinPerDeath + Math.floor(score * ECONOMY.coinPerScoreMultiplier);
}

/**
 * Get current speed based on difficulty progression
 * @param {number} foodEaten - Number of food eaten
 * @param {number} baseSpeed - Base speed in ms
 * @returns {number} Adjusted speed in ms
 */
export function getAdjustedSpeed(foodEaten, baseSpeed) {
    if (!GAMEPLAY.enableDifficultyRamp) {
        return baseSpeed;
    }

    const ramps = Math.floor(foodEaten / GAMEPLAY.speedRampEveryNFood);
    const newSpeed = baseSpeed - (ramps * GAMEPLAY.speedRampAmount);

    return Math.max(GAMEPLAY.speedMin, newSpeed);
}
