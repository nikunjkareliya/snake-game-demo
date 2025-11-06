// Regenerating file to force cache refresh.
import { state } from './state.js';
import { SKINS, getSkinById, DEFAULT_SKIN_ID } from './config.js';
import { setStoredJSON, setStoredValue } from './utils.js';
import { canvas } from './canvas.js';
import { UI_FOCUS_DELAY, DEBUG } from './config.js';

export const overlay = document.getElementById('overlay');
export const scoreEl = document.getElementById('score');
export const highScoreEl = document.getElementById('highScore');

let lobbyHighScoreEl, lobbyCurrencyEl;
let currentStartGame, currentHideOverlay;

/**
 * Show a generic overlay with a title, subtitle and a primary button.
 * @param {string} title
 * @param {string} subtitle
 * @param {string} buttonText
 * @param {Function} onButtonClick
 */
export function showOverlay(title, subtitle, buttonText, onButtonClick) {
        overlay.classList.add('visible');
        overlay.innerHTML = `
            <div class="overlay-inner">
                <h1 class="title neon">${title}</h1>
                <p class="subtitle">${subtitle.replace('\n', '<br>')}</p>
                <div class="controls">
                    <div><span class="key">W A S D</span> or <span class="key">Arrow Keys</span> to move</div>
                    <div><span class="key">Space</span> or <span class="key">P</span> to pause</div>
                    <div><span class="key">R</span> to restart</div>
                </div>
                <button id="overlayBtn" class="btn neon">${buttonText}</button>
            </div>
        `;
        const overlayBtn = document.getElementById('overlayBtn');
        if (overlayBtn && typeof onButtonClick === 'function') {
            overlayBtn.addEventListener('click', onButtonClick);
        }
        setTimeout(() => overlay.focus(), UI_FOCUS_DELAY);
}

/**
 * Show the lobby overlay and wire up controls.
 * @param {Function} startGame - callback to start the game
 * @param {Function} hideOverlay - callback to hide the overlay
 */
export function showLobby(startGame, hideOverlay) {
    // Store references for use in event listeners
    currentStartGame = startGame;
    currentHideOverlay = hideOverlay;

    overlay.classList.add('visible');
    overlay.innerHTML = buildLobbyHTML();

    // Update stats display
    lobbyHighScoreEl = document.getElementById('lobbyHighScore');
    lobbyCurrencyEl = document.getElementById('lobbyCurrency');
    updateStats();

    attachLobbyListeners(startGame, hideOverlay);
}

function buildLobbyHTML() {
    return `
        <div class="overlay-inner">
            <h1 class="title neon">NEON SNAKE</h1>

            <div class="lobby-menu">
                <button id="playBtn" class="btn neon">Play</button>
                <button id="customizeBtn" class="btn">Customize</button>
                <button id="settingsBtn" class="btn">Settings</button>
            </div>

            <div class="lobby-stats">
                <div class="stat-box">
                    <div class="stat-label">Highest Score</div>
                    <div id="lobbyHighScore" class="stat-value neon">${state.highScore}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Currency</div>
                    <div id="lobbyCurrency" class="stat-value neon">${state.currency}</div>
                </div>
            </div>

            <div class="controls">
                <div><span class="key">W A S D</span> or <span class="key">Arrow Keys</span> to move</div>
                <div><span class="key">Space</span> or <span class="key">P</span> to pause</div>
                <div><span class="key">R</span> to restart</div>
            </div>

            <button id="howToPlayBtn" class="btn btn-small">How to Play</button>
        </div>
    `;
}

function attachLobbyListeners(startGame, hideOverlay) {
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (state.gameState !== 'playing') {
                startGame();
                hideOverlay();
            }
        });
    }

    const customizeBtn = document.getElementById('customizeBtn');
    if (customizeBtn) {
        customizeBtn.addEventListener('click', () => {
            showCustomize(startGame, hideOverlay);
        });
    }

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (DEBUG) console.log('Settings clicked');
        });
    }

    const howBtn = document.getElementById('howToPlayBtn');
    if (howBtn) {
        howBtn.addEventListener('click', () => {
            showOverlay('How to Play', 'Collect food to grow longer and earn points!\nAvoid hitting walls and yourself.', 'Back', () => showLobby(startGame, hideOverlay));
        });
    }
}

/**
 * Update HUD and lobby stats from `state`.
 * @returns {void}
 */
export function updateStats() {
    if (lobbyHighScoreEl) lobbyHighScoreEl.textContent = state.highScore;
    if (lobbyCurrencyEl) lobbyCurrencyEl.textContent = state.currency;
    if (highScoreEl) highScoreEl.textContent = state.highScore;
    if (scoreEl) scoreEl.textContent = state.score;
}

/**
 * Hide the overlay and restore focus to the canvas.
 * @returns {void}
 */
export function hideOverlay() {
    overlay.classList.remove('visible');
    setTimeout(() => canvas.focus(), UI_FOCUS_DELAY);
}

// Listen for game over events
document.addEventListener('showGameOver', (e) => {
    const { title, subtitle } = e.detail;
    showOverlay(title, subtitle, 'Play Again', () => {
        showLobby(currentStartGame, currentHideOverlay);
    });
});

/**
 * Build and show the customization screen.
 * Players can buy skins with coins or equip owned ones.
 */
export function showCustomize(startGame, hideOverlayCb) {
    overlay.classList.add('visible');
    rebuildCustomizeUI(startGame, hideOverlayCb);
}

/**
 * Rebuild the customize UI and reattach all event listeners
 */
function rebuildCustomizeUI(startGame, hideOverlayCb) {
    overlay.innerHTML = buildCustomizeHTML();

    // Update currency display
    const currencyEl = document.getElementById('lobbyCurrency');
    if (currencyEl) currencyEl.textContent = state.currency;

    // Wire back button
    const backBtn = document.getElementById('backToLobbyBtn');
    if (backBtn) backBtn.addEventListener('click', () => showLobby(startGame, hideOverlayCb));

    // Wire skin actions
    overlay.querySelectorAll('[data-skin-id]').forEach(card => {
        const id = card.getAttribute('data-skin-id');
        const buyBtn = card.querySelector('.buyBtn');
        const equipBtn = card.querySelector('.equipBtn');

        if (buyBtn) buyBtn.addEventListener('click', () => tryBuySkin(id, startGame, hideOverlayCb));
        if (equipBtn) equipBtn.addEventListener('click', () => equipSkin(id, startGame, hideOverlayCb));
    });
}

function buildCustomizeHTML() {
    const owned = new Set(state.ownedSkins || []);
    const skinCards = SKINS.map(skin => renderSkinCard(skin, owned)).join('');
    return `
        <div class="overlay-inner">
            <h1 class="title neon">Customize</h1>
            <div class="lobby-stats" style="margin-top:-8px;">
                <div class="stat-box">
                    <div class="stat-label">Currency</div>
                    <div id="lobbyCurrency" class="stat-value neon">${state.currency}</div>
                </div>
            </div>
            <div class="skin-grid">${skinCards}</div>
            <div style="margin-top:24px">
                <button id="backToLobbyBtn" class="btn">Back</button>
            </div>
        </div>
    `;
}

function renderSkinCard(skin, owned) {
    const isOwned = owned.has(skin.id) || skin.price === 0;
    const isSelected = state.selectedSkinId === skin.id;
    const action = isOwned ? (isSelected ? 'Equipped' : 'Equip') : `Buy ${skin.price}`;
    const actionClass = isOwned ? (isSelected ? 'btn' : 'btn neon equipBtn') : 'btn neon buyBtn';
    const disabled = isSelected ? 'disabled' : '';

    // Generate preview style based on skin type
    let previewStyle = '';
    if (skin.type === 'gradient') {
        previewStyle = `background: linear-gradient(90deg, ${skin.head}, ${skin.tail});`;
    } else if (skin.type === 'animated') {
        // Show representative colors for animated skins
        if (skin.id === 'electric') {
            previewStyle = `background: linear-gradient(135deg, ${skin.colors.primary}, ${skin.colors.secondary});`;
        } else if (skin.id === 'inferno') {
            previewStyle = `background: linear-gradient(0deg, ${skin.colors.primary}, ${skin.colors.accent});`;
        } else if (skin.id === 'holographic') {
            previewStyle = `background: linear-gradient(90deg, #ff0080, #ff8c00, #40ff00, #00ffff, #8000ff, #ff0080);`;
        }
    } else if (skin.type === 'pattern') {
        // Show representative pattern colors
        if (skin.id === 'python') {
            previewStyle = `background: repeating-linear-gradient(90deg, ${skin.colors.primary} 0px, ${skin.colors.primary} 20px, ${skin.colors.secondary} 20px, ${skin.colors.secondary} 40px);`;
        } else if (skin.id === 'cosmic') {
            previewStyle = `background: radial-gradient(circle at 30% 50%, ${skin.colors.nebula1}, ${skin.colors.background});`;
        } else if (skin.id === 'circuit') {
            previewStyle = `background: ${skin.colors.primary}; border: 2px solid ${skin.colors.lines};`;
        }
    } else if (skin.type === 'special') {
        // Show representative colors for special skins
        if (skin.id === 'crystal') {
            previewStyle = `background: linear-gradient(135deg, ${skin.colors.primary}, ${skin.colors.secondary}); position: relative;`;
        } else if (skin.id === 'phantom') {
            previewStyle = `background: radial-gradient(circle, ${skin.colors.inner}, ${skin.colors.primary}); opacity: 0.85;`;
        }
    }

    return `
      <div class="skin-card glass" data-skin-id="${skin.id}">
        <div class="skin-preview" style="${previewStyle}"></div>
        <div class="skin-name">${skin.name}</div>
        <div class="skin-actions">
          ${isOwned
            ? `<button class="${actionClass}" ${disabled}>${action}</button>`
            : `<button class="${actionClass}">${action}</button>`}
        </div>
      </div>
    `;
}

function tryBuySkin(id, startGame, hideOverlayCb) {
    const skin = getSkinById(id);
    if (!skin) return;
    const owned = new Set(state.ownedSkins || []);

    // If already owned, just return (don't block free skins here)
    if (owned.has(id)) return;

    // Check if user has enough currency (skip for free skins)
    if (skin.price > 0 && state.currency < skin.price) {
        // Optional: flash not enough currency
        return;
    }

    // Deduct currency and add to owned
    if (skin.price > 0) {
        state.currency -= skin.price;
    }
    owned.add(id);
    state.ownedSkins = Array.from(owned);
    setStoredValue('neonSnakeCurrency', state.currency);
    setStoredJSON('neonSnakeOwnedSkins', state.ownedSkins);

    // Auto-equip on purchase
    equipSkin(id, startGame, hideOverlayCb, { silent: true });

    // Rebuild UI to reflect changes
    if (!arguments[3]?.silent) {
        rebuildCustomizeUI(startGame, hideOverlayCb);
    }
}

function equipSkin(id, startGame, hideOverlayCb, options = {}) {
    const skin = getSkinById(id);
    if (!skin) return;

    const owned = new Set(state.ownedSkins || []);

    // Allow equipping if owned OR if it's free
    if (!owned.has(id) && skin.price > 0) {
        // Not owned and not free, can't equip
        return;
    }

    // For free skins, add to owned if not already there
    if (skin.price === 0 && !owned.has(id)) {
        owned.add(id);
        state.ownedSkins = Array.from(owned);
        setStoredJSON('neonSnakeOwnedSkins', state.ownedSkins);
    }

    // Equip the skin
    state.selectedSkinId = id;
    state.currentSkin = skin; // Store full skin object for advanced rendering
    setStoredJSON('neonSnakeSelectedSkin', id);

    // Rebuild UI unless silent mode
    if (!options.silent) {
        rebuildCustomizeUI(startGame, hideOverlayCb);
    }
}