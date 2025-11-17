export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const hypot = (x, y) => Math.sqrt(x * x + y * y);

/**
 * Format large numbers as integers (e.g., 1200 -> 1200)
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  return String(Math.floor(num));
}

export function applyAlphaToColor(color, alpha) {
    if (color.startsWith('rgb(')) {
      // convert rgb(r,g,b) to rgba
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    if (color.startsWith('rgba(')) {
      return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^\)]+\)/, `rgba($1,$2,$3,${alpha})`);
    }
    if (color.startsWith('#')) {
      const { r, g, b } = hexToRgb(color);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }

  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }

/**
 * Safely read a number from localStorage. Returns defaultValue when unavailable.
 * @param {string} key
 * @param {string} defaultValue
 * @returns {number}
 */
export function getStoredNumber(key, defaultValue) {
  try {
    return Number(localStorage.getItem(key) || defaultValue);
  } catch (error) {
    console.warn(`getStoredNumber failed for ${key}:`, error);
    return Number(defaultValue);
  }
}

/**
 * Safely save a value to localStorage. Returns true on success.
 * @param {string} key
 * @param {any} value
 * @returns {boolean}
 */
export function setStoredValue(key, value) {
  try {
    localStorage.setItem(key, value.toString());
    return true;
  } catch (error) {
    console.warn(`setStoredValue failed for ${key}:`, error);
    return false;
  }
}

/**
 * Safely read a JSON value from localStorage. Returns fallback when unavailable.
 * @param {string} key
 * @param {any} fallback
 * @returns {any}
 */
export function getStoredJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`getStoredJSON failed for ${key}:`, error);
    return fallback;
  }
}

/**
 * Safely stringify and store JSON data in localStorage.
 * @param {string} key
 * @param {any} value
 * @returns {boolean}
 */
export function setStoredJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`setStoredJSON failed for ${key}:`, error);
    return false;
  }
}
