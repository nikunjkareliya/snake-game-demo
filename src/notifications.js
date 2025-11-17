/**
 * Notification System
 *
 * Displays temporary notifications/banners to the player.
 * Used for tier unlocks, hazard alerts, and other important messages.
 */

let currentNotification = null;
let notificationTimeout = null;

/**
 * Show a notification banner
 * @param {string} text - The message text
 * @param {Object} options - Display options
 * @param {string} options.style - 'warning' | 'info' (default: 'info')
 * @param {string} options.color - Override text color (hex or named color)
 * @param {number} options.duration - Display time in milliseconds (default: 3000)
 * @returns {void}
 */
export function showNotification(text, options = {}) {
    const style = options.style || 'info';
    const color = options.color || (style === 'warning' ? '#ff0033' : '#00eaff');
    const duration = options.duration || 3000;

    // Remove existing notification if any
    hideNotification();

    // Create notification element
    const banner = document.createElement('div');
    banner.className = `notification-banner notification-${style}`;
    banner.textContent = text;
    banner.style.color = color;

    // Add to DOM
    document.body.appendChild(banner);
    currentNotification = banner;

    // Trigger animation
    requestAnimationFrame(() => {
        banner.classList.add('show');
    });

    // Auto-remove after duration
    notificationTimeout = setTimeout(() => {
        hideNotification();
    }, duration);
}

/**
 * Hide the current notification
 * @returns {void}
 */
export function hideNotification() {
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }

    if (currentNotification) {
        currentNotification.classList.remove('show');

        // Remove from DOM after animation completes
        setTimeout(() => {
            if (currentNotification && currentNotification.parentNode) {
                currentNotification.parentNode.removeChild(currentNotification);
            }
            currentNotification = null;
        }, 600); // Match animation duration in CSS
    }
}
