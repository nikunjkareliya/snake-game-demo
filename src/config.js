export const CSS_WIDTH = 1024;
export const CSS_HEIGHT = 768;
export const DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));

export const CELL_SIZE = 32;
export const COLUMNS = Math.floor(CSS_WIDTH / CELL_SIZE);
export const ROWS = Math.floor(CSS_HEIGHT / CELL_SIZE);

export const Direction = {
    Up: 'Up',
    Down: 'Down',
    Left: 'Left',
    Right: 'Right',
};

export const COLOR_A = '#00eaff';
export const COLOR_B = '#ff00ff';

export const BODY_RADIUS = Math.round(CELL_SIZE * 0.36);
export const HEAD_RADIUS = Math.round(BODY_RADIUS * 1.15);

export const USE_SPLINE_SMOOTHING = true;
export const MOUTH_ANIM_DURATION = 0.45; // seconds

// Particle system
export const MAX_PARTICLES = 200;
export const PARTICLE_COUNT_EAT = 20; // Increased from 8 for more dramatic effect
export const PARTICLE_COUNT_DEATH = 6;

// Particle speed ranges (px/s)
export const PARTICLE_SPEED_EAT_MIN = 100;
export const PARTICLE_SPEED_EAT_MAX = 200;
export const PARTICLE_SPEED_DEATH_MIN = 150;
export const PARTICLE_SPEED_DEATH_MAX = 250;

// Visual constants
export const HEAD_GLOW_MULTIPLIER = 1.05;
export const EYE_OFFSET_ALONG = 0.04; // fraction of HEAD_RADIUS
export const EYE_OFFSET_SIDE = 0.64; // fraction of HEAD_RADIUS
export const EYE_SIZE_RATIO = 0.46; // fraction of HEAD_RADIUS
export const BODY_SHINE_WIDTH_RATIO = 0.22; // fraction of BODY_RADIUS
export const SPLINE_TENSION = 0.6;

// Food/ambient
export const FOOD_SPARK_INTERVAL = 0.1; // seconds
export const FOOD_PARTICLE_RADIUS_RATIO = 0.45; // fraction of CELL_SIZE

// Motion trail
export const MOTION_TRAIL_INTERVAL = 0.05; // seconds between trail particles
export const MOTION_TRAIL_PARTICLE_LIFE = 0.2; // seconds
export const MOTION_TRAIL_PARTICLE_SIZE = 3;

// Animation durations
export const DEATH_ANIMATION_DURATION = 1.0;
export const HIT_SHAKE_DURATION = 0.5;
export const GROW_ANIMATION_DURATION = 0.2; // seconds for new segment to grow

// UI timing
export const UI_FOCUS_DELAY = 50; // ms
export const CANVAS_FOCUS_DELAY = 100; // ms

// Blink timings
export const BLINK_INTERVAL_MIN = 2.5; // seconds (minimum between blinks)
export const BLINK_INTERVAL_MAX = 6.0; // seconds (maximum between blinks)
export const BLINK_DURATION = 0.12; // seconds duration of a blink (closed)

// Colors
export const COLOR_WHITE = '#ffffff';
export const COLOR_BLACK = '#000000';
export const COLOR_TONGUE = '#ff3366';

// Debug
export const DEBUG = false;
// Particle rendering
export const PARTICLE_CULL_MARGIN = 50; // px beyond viewport to still render

// Skins
// Define available snake skins for the customization system.
// Each skin uses a head/tail gradient pair and a price in coins.
export const DEFAULT_SKIN_ID = 'neon';
export const SKINS = [
    { id: 'neon',     name: 'Neon',      head: COLOR_B,       tail: COLOR_A,       price: 0 },
    { id: 'aqua',     name: 'Aqua',      head: '#00ffd1',     tail: '#0066ff',     price: 50 },
    { id: 'sunset',   name: 'Sunset',    head: '#ff4d88',     tail: '#ffb84d',     price: 75 },
    { id: 'lime',     name: 'Lime',      head: '#ccff33',     tail: '#33ff99',     price: 60 },
    { id: 'violet',   name: 'Violet',    head: '#b366ff',     tail: '#ff66cc',     price: 80 },
    { id: 'ember',    name: 'Ember',     head: '#ff6a00',     tail: '#ffd000',     price: 90 },
];

// Utility to fetch a skin object by id
export function getSkinById(id) {
    return SKINS.find(s => s.id === id) || SKINS[0];
}
