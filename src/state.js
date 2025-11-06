import { Direction, COLOR_A, COLOR_B, DEFAULT_SKIN_ID, getSkinById, BLINK_INTERVAL_MIN, BLINK_INTERVAL_MAX } from './config.js';
import { getStoredNumber, getStoredJSON, randomInt } from './utils.js';

const storedOwned = getStoredJSON('neonSnakeOwnedSkins', [DEFAULT_SKIN_ID]);
const storedSelected = getStoredJSON('neonSnakeSelectedSkin', DEFAULT_SKIN_ID);
const initialSkin = getSkinById(storedSelected);

export const state = {
    gameState: 'init', // init | playing | paused | dying | gameover
    score: 0,
    highScore: getStoredNumber('neonSnakeHighScore', '0'),
    currency: getStoredNumber('neonSnakeCurrency', '0'),
    // Skins
    ownedSkins: Array.isArray(storedOwned) ? storedOwned : [DEFAULT_SKIN_ID],
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
