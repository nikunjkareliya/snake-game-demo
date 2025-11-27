import { getSkinPrice } from './gameConfig.js';

export const CSS_WIDTH = 1280;
export const CSS_HEIGHT = 720;
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

// Skin rendering constants
export const SHINE_OVERLAY_OPACITY = 0.3;
export const STAR_GOLDEN_ANGLE = 137.5; // degrees
export const STAR_ANGLE_OFFSET = 60; // degrees
export const CIRCUIT_NODE_SHADOW_BLUR = 8; // px
export const FACET_ALTERNATE_COLOR = 'rgba(255, 255, 255, 0.6)';
export const SPARKLE_SHADOW_BLUR = 10; // px

// Debug
export const DEBUG = false;
// Particle rendering
export const PARTICLE_CULL_MARGIN = 50; // px beyond viewport to still render

// Skins
// Define available snake skins for the customization system.
// Skin types: 'gradient' | 'pattern' | 'animated' | 'special'
// Tiers for future pricing: 'basic' (0-90) | 'pattern' (100-150) | 'special' (150-250)
export const DEFAULT_SKIN_ID = 'neon';
export const SKINS = [
    // Basic gradient (default, free)
    {
        id: 'neon',
        name: 'Neon',
        type: 'gradient',
        tier: 'basic',
        get price() { return getSkinPrice('neon'); },
        head: COLOR_B,
        tail: COLOR_A
    },
    // Animated skins
    {
        id: 'electric',
        name: 'Electric',
        type: 'animated',
        tier: 'special',
        get price() { return getSkinPrice('electric'); },
        colors: {
            primary: '#00ffff',
            secondary: '#0099ff',
            accent: '#ffffff',
            glow: '#00ddff'
        },
        animation: {
            speed: 3.0,
            boltFrequency: 0.15, // seconds between lightning bolts
            boltDuration: 0.08    // seconds bolt stays visible
        }
    },
    {
        id: 'inferno',
        name: 'Inferno',
        type: 'animated',
        tier: 'special',
        get price() { return getSkinPrice('inferno'); },
        colors: {
            primary: '#ff4500',
            secondary: '#ff8c00',
            accent: '#ffd700',
            core: '#ffff00'
        },
        animation: {
            speed: 2.5,
            flameHeight: 0.6,
            flickerSpeed: 15
        }
    },
    {
        id: 'holographic',
        name: 'Holographic',
        type: 'animated',
        tier: 'special',
        get price() { return getSkinPrice('holographic'); },
        colors: {
            // HSL-based rainbow shift
            hueShift: true,
            saturation: 1.0,
            lightness: 0.6
        },
        animation: {
            speed: 1.0, // hue rotation speed
            shimmerSpeed: 8.0
        }
    },
    // Pattern skins
    {
        id: 'python',
        name: 'Python',
        type: 'pattern',
        tier: 'pattern',
        get price() { return getSkinPrice('python'); },
        colors: {
            primary: '#000000',
            secondary: '#ffff00',
            accent: '#ff0000'
        },
        pattern: {
            type: 'stripes',
            stripeWidth: 2, // segments per stripe
            border: true
        }
    },
    {
        id: 'cosmic',
        name: 'Cosmic',
        type: 'pattern',
        tier: 'special',
        get price() { return getSkinPrice('cosmic'); },
        colors: {
            background: '#0a0a2e',
            nebula1: '#7b2cbf',
            nebula2: '#240046',
            stars: '#ffffff'
        },
        pattern: {
            type: 'starfield',
            starCount: 40,
            twinkle: true
        }
    },
    {
        id: 'circuit',
        name: 'Circuit',
        type: 'pattern',
        tier: 'special',
        get price() { return getSkinPrice('circuit'); },
        colors: {
            primary: '#0d1117',
            lines: '#00ff41',
            nodes: '#00ffff',
            glow: '#00ff41'
        },
        pattern: {
            type: 'circuit',
            lineWidth: 2,
            nodeSize: 3,
            pulseSpeed: 2.0
        }
    },
    // Special skins
    {
        id: 'crystal',
        name: 'Crystal',
        type: 'special',
        tier: 'special',
        get price() { return getSkinPrice('crystal'); },
        colors: {
            primary: '#e0f7ff',
            secondary: '#a8e6ff',
            highlight: '#ffffff',
            sparkle: '#00ffff'
        },
        effect: {
            type: 'faceted',
            facetCount: 6,
            sparkleRate: 0.2
        }
    },
    {
        id: 'phantom',
        name: 'Phantom',
        type: 'special',
        tier: 'special',
        get price() { return getSkinPrice('phantom'); },
        colors: {
            primary: '#b19cd9',
            secondary: '#7b68ee',
            glow: '#da70d6',
            inner: '#e6e6fa'
        },
        effect: {
            type: 'ghost',
            opacity: 0.6,
            innerGlow: true,
            smokeTrail: true
        }
    }
];

// Utility to fetch a skin object by id
export function getSkinById(id) {
    return SKINS.find(s => s.id === id) || SKINS[0];
}
