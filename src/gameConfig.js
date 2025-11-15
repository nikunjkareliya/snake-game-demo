/**
 * Game Design Configuration
 *
 * This file contains all tunable game design values for easy adjustment.
 * Game designers can modify these values without touching game logic code.
 */

// ============================================================================
// INTRO ANIMATION SETTINGS
// ============================================================================

export const INTRO_ANIMATION = {
    DURATION: 2.0 / 1.5, // seconds, 1.5x faster
    SCALE: 4,            // 4 times larger
    LENGTH: 30,          // Half of the original scaled length
    OFFSET: 100,         // Pixels of space between the two snakes
};

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
    heroButtonPulseScale: 1.015,     // Scale at pulse peak (reduced for subtlety)

    // Stat boxes
    statsFadeDelay: 0.5,             // Delay before stats appear
    statsFadeDuration: 0.7,          // Duration of fade-in
    // Title noise / blink (occasional subtle glitch on letters)
    titleNoiseEnabled: true,         // Enable subtle noise blink on title letters
    titleNoiseMinIntervalSec: 2,     // Minimum seconds between flicker events
    titleNoiseMaxIntervalSec: 6,     // Maximum seconds between flicker events
    titleNoiseDurationMs: 200,       // Total duration of the flicker sequence in milliseconds
    titleNoisePulses: 20,             // Number of quick pulses per flicker event (4-5 recommended)
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

    // Difficulty HUD
    showDifficultyHUD: true,  // Show difficulty metrics in bottom-left
};

// ============================================================================
// TESTING / QA FLAGS
// ============================================================================

export const TESTING = {
    // When true, all skins will be treated as owned for quick QA / manual testing.
    // Use this flag during development or automated visual tests. Defaults to false
    // to prevent accidental unlocking in production builds.
    unlockAllSkins: true,
};

// ============================================================================
// DIFFICULTY & PROGRESSION SETTINGS
// ============================================================================

export const DIFFICULTY = {
    // === TIER PROGRESSION (Food-Based) ===
    // Each value is the ADDITIONAL food needed to reach next tier
    // Example: [5, 7, 10] means: Tier 0→1 at 5 food, Tier 1→2 at 12 total (5+7), Tier 2→3 at 22 total (5+7+10)
    foodPerTier: [
        5,   // Tier 0→1: 5 food (fast progression)
        7,   // Tier 1→2: 12 food total
        10,  // Tier 2→3: 22 food total
        12,  // Tier 3→4: 34 food total
        15,  // Tier 4→5: 49 food total
        18,  // Tier 5→6: 67 food total
        20,  // Tier 6→7: 87 food total
        23,  // Tier 7→8: 110 food total
        25,  // Tier 8→9: 135 food total
        30,  // Tier 9→10: 165 food total
    ],
    maxTier: 10,

    // === SPEED SCALING (Tier-Based) ===
    // Snake movement interval (milliseconds) per tier
    // Lower = faster snake = harder to control
    speedByTier: [
        120,  // Tier 0: Beginner speed
        110,  // Tier 1
        100,  // Tier 2
        90,   // Tier 3
        82,   // Tier 4
        75,   // Tier 5
        70,   // Tier 6
        67,   // Tier 7
        65,   // Tier 8
        63,   // Tier 9
        60,   // Tier 10: Maximum challenge
    ],
    speedMin: 50,  // Absolute minimum (safety cap)
};

// ============================================================================
// FLOW SYSTEM (Chain Eating Multiplier)
// ============================================================================

export const FLOW = {
    // === FLOW WINDOW (Time to Chain Eats) ===
    windowBaseSec: 6.0,           // Base time window at Tier 0
    windowDecayPerTier: 0.3,      // Window shrinks per difficulty tier
    windowMin: 3.0,               // Minimum window (never below this)

    // === FLOW TIERS (Multiplier Levels) ===
    maxFlowTier: 4,               // Maximum flow level (0-4)

    // === SCORE MULTIPLIERS ===
    // Score multiplier per flow tier
    scoreMultipliers: [
        1.0,   // Flow 0: No chain bonus (missed window)
        1.2,   // Flow 1: +20% bonus
        1.5,   // Flow 2: +50% bonus
        2.0,   // Flow 3: +100% bonus (2x score!)
        3.0,   // Flow 4: +200% bonus (3x score!)
    ],

    // === FLOW PROGRESSION ===
    foodToIncreaseFlow: 3,        // Consecutive food needed to increase flow tier

    // === VISUAL FEEDBACK ===
    // Colors for flow tiers (used for snake glow/particles)
    flowColors: [
        '#888888',  // Flow 0: Gray (no flow)
        '#00ff00',  // Flow 1: Green
        '#00eaff',  // Flow 2: Cyan
        '#ff00ff',  // Flow 3: Magenta
        '#ffaa00',  // Flow 4: Orange/Gold
    ],

    // Glow intensity per flow tier (0.0 - 1.0)
    flowGlowIntensity: [0, 0.3, 0.5, 0.8, 1.0],
};

// ============================================================================
// FLOW UI (Visual Progress Bar)
// ============================================================================

export const FLOW_UI = {
    // === DISPLAY SETTINGS ===
    enabled: true,                // Show flow progress bar during gameplay

    // === POSITION ===
    position: 'top-center',       // 'top-center' | 'top-right' | 'top-left'
    offsetX: 0,                   // Horizontal offset in pixels
    offsetY: 20,                  // Vertical offset from edge in pixels

    // === HORIZONTAL BAR DIMENSIONS ===
    barWidth: 220,                // Width of the progress bar
    barHeight: 14,                // Height of the progress bar
    barCornerRadius: 7,           // Rounded corner radius

    // === LABEL SETTINGS ===
    fontSize: 13,                 // Font size for labels
    fontFamily: 'Orbitron, monospace',
    labelSpacing: 10,             // Space between bar and labels

    // === ANIMATION ===
    glowBlur: 15,                 // Glow effect blur radius
    warningPulseSpeed: 3,         // Pulse speed when timer < 2s (Hz)

    // === TIER DOTS ===
    showTierDots: true,           // Show tier indicator dots
    dotRadius: 3,                 // Radius of tier dots
    dotSpacing: 10,               // Spacing between dots
    dotOffsetY: 8,                // Vertical offset below bar

    // === COLORS (Overrides - falls back to FLOW.flowColors) ===
    barBackground: 'rgba(40, 40, 40, 0.9)',   // Background bar color
    textColor: '#ffffff',                      // Default text color
    warningColor: '#ffaa00',                   // Color when timer < 2s
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
