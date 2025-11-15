/**
 * Coin Flying Animation System
 * Creates animated coin particles that fly from source element to HUD
 */

/**
 * Trigger coin flying animation from source element to HUD
 * @param {number} coinAmount - Number of coins earned (determines particle count)
 * @param {HTMLElement} sourceElement - Element to spawn coins from
 */
export function triggerCoinFlyAnimation(coinAmount, sourceElement) {
    const targetHUD = document.querySelector('.corner.left .coin-icon');
    if (!targetHUD || coinAmount <= 0) return;

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetHUD.getBoundingClientRect();

    // Spawn 5-8 coin particles based on amount (more coins = bigger reward feeling)
    const coinCount = Math.min(8, Math.max(5, Math.floor(coinAmount / 3) + 3));

    for (let i = 0; i < coinCount; i++) {
        createCoinParticle(sourceRect, targetRect, i, coinCount);
    }
}

/**
 * Create a single animated coin particle
 * @param {DOMRect} sourceRect - Source position rectangle
 * @param {DOMRect} targetRect - Target position rectangle
 * @param {number} index - Coin index for stagger
 * @param {number} total - Total number of coins
 */
function createCoinParticle(sourceRect, targetRect, index, total) {
    const coin = document.createElement('div');
    coin.className = 'flying-coin';

    // Random offset from source position for spread effect
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 40;

    coin.style.left = `${sourceRect.left + sourceRect.width / 2 + offsetX}px`;
    coin.style.top = `${sourceRect.top + sourceRect.height / 2 + offsetY}px`;

    // Calculate travel distance for CSS variables
    const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);

    // Set CSS custom properties for animation
    coin.style.setProperty('--end-x', `${deltaX}px`);
    coin.style.setProperty('--end-y', `${deltaY}px`);
    coin.style.setProperty('--curve', `${-100 - Math.random() * 50}px`); // Upward arc

    // Stagger animation delay (0.08s between coins)
    coin.style.animationDelay = `${index * 0.08}s`;

    document.body.appendChild(coin);

    // Remove coin after animation completes
    coin.addEventListener('animationend', () => {
        coin.remove();

        // Trigger HUD update on last coin arrival
        if (index === total - 1) {
            triggerHUDUpdate();
        }
    });
}

/**
 * Trigger HUD counter update with pop animation
 */
function triggerHUDUpdate() {
    // Import updateStats dynamically to refresh HUD with animation
    import('./ui.js').then(({ updateStats }) => {
        updateStats();
    });
}
