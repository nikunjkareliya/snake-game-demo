import { COLOR_A, COLOR_B } from './config.js';

function dedupe(colors) {
    return Array.from(new Set(colors.filter(Boolean)));
}

function shadowColor(color, alpha) {
    if (!color) {
        return null;
    }
    if (color.startsWith('rgba(')) {
        return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^\)]+\)/, `rgba($1,$2,$3,${alpha})`);
    }
    if (color.startsWith('rgb(')) {
        return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    if (color.startsWith('#')) {
        const clean = color.replace('#', '');
        const value = parseInt(clean, 16);
        const r = (value >> 16) & 255;
        const g = (value >> 8) & 255;
        const b = value & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
}

export function getSkinParticlePalette(skin, elapsedSec = 0) {
    if (!skin) {
        return [COLOR_A, COLOR_B, '#ffffff'];
    }

    const baseColors = [];

    if (skin.head) baseColors.push(skin.head);
    if (skin.tail) baseColors.push(skin.tail);

    if (skin.colors) {
        for (const value of Object.values(skin.colors)) {
            if (typeof value === 'string') {
                baseColors.push(value);
            }
        }
    }

    if (skin.type === 'animated') {
        if (skin.id === 'electric') {
            const { primary, secondary, accent, glow } = skin.colors;
            baseColors.push(primary, secondary, accent, shadowColor(glow, 0.75));
        } else if (skin.id === 'inferno') {
            const { primary, secondary, accent, core } = skin.colors;
            baseColors.push(primary, secondary, accent, core);
        } else if (skin.id === 'holographic') {
            const hue = (elapsedSec * skin.animation.speed * 60) % 360;
            baseColors.push(`hsl(${hue}, 100%, 60%)`, `hsl(${(hue + 120) % 360}, 100%, 55%)`, `hsl(${(hue + 240) % 360}, 100%, 65%)`);
        }
    }

    if (skin.type === 'pattern') {
        if (skin.id === 'python') {
            const { primary, secondary, accent } = skin.colors;
            baseColors.push(primary, secondary, accent);
        } else if (skin.id === 'cosmic') {
            const { background, nebula1, nebula2, stars } = skin.colors;
            baseColors.push(background, nebula1, nebula2, shadowColor(stars, 0.7));
        } else if (skin.id === 'circuit') {
            const { lines, nodes, glow } = skin.colors;
            baseColors.push(lines, shadowColor(nodes, 0.85), glow);
        }
    }

    if (skin.type === 'special') {
        if (skin.id === 'crystal') {
            const { highlight, sparkle, secondary, primary } = skin.colors;
            baseColors.push(highlight, sparkle, secondary, primary);
        } else if (skin.id === 'phantom') {
            const { glow, inner, primary, secondary } = skin.colors;
            baseColors.push(glow, shadowColor(glow, 0.5), inner, primary, secondary);
        }
    }

    const palette = dedupe(baseColors);
    if (palette.length === 0) {
        palette.push(COLOR_A, COLOR_B, '#ffffff');
    }
    return palette;
}
