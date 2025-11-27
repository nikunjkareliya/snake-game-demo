/**
 * Responsive Scaling System for Snake Frenzy
 *
 * Scales the entire game container via CSS transform without affecting game logic.
 * Canvas stays at 1280×720px internally, ensuring all collision detection,
 * scoring, and gameplay mechanics remain completely unchanged.
 */

const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;

/**
 * Calculate optimal scale factor for current viewport
 * @returns {number} Scale factor between 0.3 and 2.0
 */
export function calculateScaleFactor() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate scale to fit both dimensions
  const scaleX = viewportWidth / BASE_WIDTH;
  const scaleY = viewportHeight / BASE_HEIGHT;

  // Use smaller scale to ensure everything fits
  const scale = Math.min(scaleX, scaleY);

  // Clamp to reasonable bounds (prevents too small or too large)
  // 0.3 = minimum for text readability
  // 2.0 = maximum to prevent pixelation
  return Math.max(0.3, Math.min(2.0, scale));
}

/**
 * Apply CSS transform scale to the game container
 * @returns {number} Applied scale factor
 */
export function applyResponsiveScale() {
  const stage = document.getElementById('stage-wrap');
  if (!stage) {
    console.warn('[Responsive] stage-wrap element not found');
    return 1.0;
  }

  const scale = calculateScaleFactor();

  // Apply CSS transform
  stage.style.transform = `scale(${scale})`;
  stage.style.transformOrigin = 'center center';

  console.log(`[Responsive] Applied scale: ${scale.toFixed(3)} (viewport: ${window.innerWidth}×${window.innerHeight})`);

  return scale;
}

/**
 * Detect if user is on a mobile device
 * @returns {boolean} True if mobile device detected
 */
export function isMobileDevice() {
  // Check both user agent and screen width
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const narrowScreen = window.innerWidth <= 800;

  return mobileUserAgent || narrowScreen;
}

/**
 * Initialize responsive system with resize handlers
 */
export function initResponsive() {
  console.log('[Responsive] Initializing responsive scaling system');

  // Apply initial scale
  applyResponsiveScale();

  // Debounced resize handler to prevent performance issues
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      applyResponsiveScale();
    }, 150); // 150ms debounce
  });

  // Handle orientation change on mobile devices
  window.addEventListener('orientationchange', () => {
    // Small delay to ensure viewport dimensions are updated
    setTimeout(() => {
      applyResponsiveScale();
    }, 100);
  });

  // Log mobile detection
  if (isMobileDevice()) {
    console.log('[Responsive] Mobile device detected - mobile optimizations will apply');
  }
}
