import { Direction, COLOR_A, COLOR_B, DEFAULT_SKIN_ID, SKINS, getSkinById, BLINK_INTERVAL_MIN, BLINK_INTERVAL_MAX } from './config.js';
import { getStoredNumber, getStoredJSON, setStoredJSON } from './utils.js';

// Get all skin IDs that are free (price: 0)
const allFreeSkinIds = SKINS.filter(skin => skin.price === 0).map(skin => skin.id);

// Get stored owned skins or default to all free skins
const storedOwned = getStoredJSON('neonSnakeOwnedSkins', allFreeSkinIds);

// Ensure all free skins are owned (merge stored with all free skins)
const mergedOwnedSkins = Array.from(new Set([...storedOwned, ...allFreeSkinIds]));

// Store the updated owned skins list
setStoredJSON('neonSnakeOwnedSkins', mergedOwnedSkins);

const storedSelected = getStoredJSON('neonSnakeSelectedSkin', DEFAULT_SKIN_ID);
const initialSkin = getSkinById(storedSelected);

export const state = {
    gameState: 'init', // init | playing | paused | dying | gameover
    score: 0,
    highScore: getStoredNumber('neonSnakeHighScore', '0'),
    currency: getStoredNumber('neonSnakeCurrency', '0'),
    // Skins - all free skins are automatically owned
    ownedSkins: mergedOwnedSkins,
    selectedSkinId: initialSkin?.id || DEFAULT_SKIN_ID,
    currentSkin: initialSkin || { head: COLOR_B, tail: COLOR_A },
    snake: [],
    direction: Direction.Right,
    nextDirection: Direction.Right,
    food: { x: 10, y: 10 },
    speedMs: 120, // lower is faster
    lastTickAt: 0,
    lastFrameAt: 0,
    elapsedSec: 0,
    mouthOpenTimer: 0, // seconds remaining for eat animation
    hitShakeTimer: 0,  // seconds remaining for hit shake
    particles: [],
    foodSparkTimer: 0, // seconds accumulator
    motionTrailTimer: 0, // seconds accumulator for trail particles
    deathTimer: 0, // seconds remaining in death animation
    growTimer: 0, // seconds remaining for tail grow animation
    // Fragment squares created on death before turning into particles
    fragments: [],
    // Blinking
    blinkTimer: 0, // seconds remaining while eyes are closed
    nextBlinkIn: (function(){
        // random float between BLINK_INTERVAL_MIN and BLINK_INTERVAL_MAX
        return BLINK_INTERVAL_MIN + Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN);
    })(),
    lastSnakePositions: [],
};
