// Regenerating file to force cache refresh.
import { state } from './state.js';
import { SKINS, getSkinById, DEFAULT_SKIN_ID } from './config.js';
import { setStoredJSON, setStoredValue, formatNumber } from './utils.js';
import { canvas } from './canvas.js';
import { UI_FOCUS_DELAY, DEBUG } from './config.js';
import { UI_ANIMATIONS, GAMEPLAY } from './gameConfig.js';

export const overlay = document.getElementById('overlay');
export const scoreEl = document.getElementById('score');
export const highScoreEl = document.getElementById('highScore');
export const hudCurrencyEl = document.getElementById('hudCurrency');
export const foodCollectedEl = document.getElementById('foodCollected');

let lobbyHighScoreEl, lobbyCurrencyEl;
let currentStartGame, currentHideOverlay;
let lastCurrency = 0;

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
    const titleText = 'SNAKE FRENZY';
    // Create SVG tspans for each character so we can animate them individually
    // but keep a single continuous gradient across the whole title
    const tspans = Array.from(titleText).map((ch, i) => {
        if (ch === ' ') return `<tspan class="title-char spacer" style="--i:${i}">\u00A0</tspan>`;
        return `<tspan class="title-char" style="--i:${i}">${ch}</tspan>`;
    }).join('');

    return `
        <div class="lobby-bg-particle"></div>
        <div class="lobby-bg-particle"></div>
        <div class="lobby-bg-particle"></div>
        <div class="lobby-bg-particle"></div>
        <div class="lobby-bg-particle"></div>
        <div class="lobby-bg-particle"></div>
        <div class="lobby-bg-particle"></div>
        <div class="lobby-bg-particle"></div>

        <!-- Coins stat in top-left corner -->
        <div class="lobby-stats">
            <div class="stat-box stat-left glass">
                <span class="coin-icon"></span>
                <div id="lobbyCurrency" class="stat-value">${state.currency}</div>
            </div>
        </div>

        <!-- Settings icon button in top-right corner -->
        <button id="lobbySettingsBtn" class="settings-icon-btn glass" aria-label="Settings">⚙️</button>

        <div class="overlay-inner">
            <svg class="title neon" viewBox="0 0 800 80" preserveAspectRatio="xMidYMid meet" aria-label="SNAKE FRENZY" role="img">
                <defs>
                    <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#ff00ff;stop-opacity:1">
                            <animate attributeName="stop-color" values="#ff00ff;#ff0080;#ff00ff" dur="${UI_ANIMATIONS.titleGradientSpeed}s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" style="stop-color:#00eaff;stop-opacity:1">
                            <animate attributeName="stop-color" values="#00eaff;#00ffaa;#00eaff" dur="${UI_ANIMATIONS.titleGradientSpeed}s" repeatCount="indefinite" />
                        </stop>
                    </linearGradient>
                </defs>
                <text class="title-text" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="url(#titleGradient)" font-family="Audiowide, cursive" font-size="72" letter-spacing="2" font-weight="400">
                    ${tspans}
                </text>
            </svg>
            <p class="tagline">Collect. Grow. Survive.</p>

            <div class="lobby-menu">
                <button id="playBtn" class="btn btn-hero neon">Play</button>
                <div class="button-separator"></div>
                <div class="secondary-actions">
                    <button id="customizeBtn" class="btn"><span class="btn-icon">✨</span>Customize</button>
                    <button id="howToPlayBtn" class="btn"><span class="btn-icon">❓</span>How to Play</button>
                </div>
            </div>
        </div>
    `;
}

function showHowToPlay() {
    overlay.innerHTML = `
        <div class="how-to-play-dialog glass">
            <h2>How to Play</h2>
            
            <div class="how-to-play-section">
                <h3>MOVE</h3>
                <div class="controls-grid">
                    <div class="key-grid wasd-grid">
                        <div class="key-icon grid-w">W</div>
                        <div class="key-icon grid-a">A</div>
                        <div class="key-icon grid-s">S</div>
                        <div class="key-icon grid-d">D</div>
                    </div>
                    <span class="or-divider">OR</span>
                    <div class="key-grid arrow-grid">
                        <div class="key-icon grid-up">↑</div>
                        <div class="key-icon grid-left">←</div>
                        <div class="key-icon grid-down">↓</div>
                        <div class="key-icon grid-right">→</div>
                    </div>
                </div>
            </div>

            <div class="how-to-play-section">
                <h3>ACTIONS</h3>
                <div class="controls-grid">
                    <div class="key-icon space">SPACE</div>
                    <span style="margin: 0 10px;">Pause / Resume</span>
                </div>
            </div>

            <button id="howToPlayBackBtn" class="btn">Got it!</button>
        </div>
    `;
    overlay.classList.add('visible');
    // We don't add overlay-glass to the main overlay anymore,
    // as the dialog itself has the .glass style.

    document.getElementById('howToPlayBackBtn').addEventListener('click', () => {
        showLobby(currentStartGame, currentHideOverlay);
    });
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

    const lobbySettingsBtn = document.getElementById('lobbySettingsBtn');
    if (lobbySettingsBtn) {
        lobbySettingsBtn.addEventListener('click', () => {
            showSettingsModal();
        });
    }

    const howBtn = document.getElementById('howToPlayBtn');
    if (howBtn) {
        howBtn.addEventListener('click', () => {
            showHowToPlay();
        });
    }
}

/**
 * Update HUD and lobby stats from `state`.
 * @returns {void}
 */
export function updateStats() {
    if (lobbyHighScoreEl) lobbyHighScoreEl.textContent = state.highScore;
    if (lobbyCurrencyEl) lobbyCurrencyEl.textContent = formatNumber(state.currency);
    // HUD no longer displays score/high score
    
    // Update HUD currency with animation on change
    if (hudCurrencyEl) {
        const formatted = formatNumber(state.currency);
        if (state.currency !== lastCurrency) {
            hudCurrencyEl.textContent = formatted;
            // Add pop animation
            hudCurrencyEl.parentElement?.classList.add('coin-pop');
            setTimeout(() => {
                hudCurrencyEl.parentElement?.classList.remove('coin-pop');
            }, 400);
            lastCurrency = state.currency;
        } else {
            hudCurrencyEl.textContent = formatted;
        }
    }
    
    // Update food collected counter
    if (foodCollectedEl) {
        foodCollectedEl.textContent = state.foodCollected || 0;
    }
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
    const { title, score, foodEaten, coinsEarned, highScore, isNewHighScore } = e.detail;

    // Create detailed stats display with icons
    const statsHtml = `
        <div style="text-align: center; font-size: 20px; line-height: 2; color: var(--text);">
            <div>📊 <span style="font-size: 24px; color: var(--neon-yellow);">Score: ${score}</span></div>
            <div><span class="food-sphere-icon" style="margin-right: 6px;"></span><span style="font-size: 24px; color: var(--neon-lime);">Food Eaten: ${foodEaten}</span></div>
            <div>💰 <span style="font-size: 24px; color: var(--neon-cyan);">Coins Earned: ${coinsEarned}</span></div>
            ${isNewHighScore ? '<div style="margin-top: 10px; font-size: 18px; color: var(--neon-orange);">⭐ NEW HIGH SCORE! ⭐</div>' : `<div>🏆 <span style="font-size: 18px;">High Score: ${highScore}</span></div>`}
        </div>
    `;

    showOverlay(title, statsHtml, 'Play Again', () => {
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
    if (currencyEl) currencyEl.textContent = formatNumber(state.currency);

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
    const skinCards = SKINS.map((skin, index) => renderSkinCard(skin, owned, index)).join('');
    return `
        <div class="customize-dialog glass">
            <div class="customize-header">
                <h2 class="customize-heading">Customization</h2>
            </div>
            <div class="skin-grid">${skinCards}</div>
            <div style="margin-top: 24px; text-align: center;">
                <button id="backToLobbyBtn" class="btn">Back to Lobby</button>
            </div>
        </div>
    `;
}

function renderSkinCard(skin, owned, index = 0) {
    const isOwned = owned.has(skin.id);
    const isSelected = state.selectedSkinId === skin.id;
    const canAfford = isOwned || state.currency >= skin.price;
    const action = isOwned ? (isSelected ? 'Equipped' : 'Equip') : `Buy ${skin.price}`;
    const actionClass = isOwned ? (isSelected ? 'btn' : 'btn neon equipBtn') : 'btn neon buyBtn';
    // Only disable already-equipped skins; allow clicking unaffordable skins to show feedback
    const disabled = isSelected ? 'disabled' : '';
    const ariaLabel = !isOwned && !canAfford ? `${skin.name} - Insufficient coins. Need ${skin.price - state.currency} more.` : skin.name;

    // Determine rarity tier based on price
    let rarity = 'common';
    if (skin.price === 0) rarity = 'free';
    else if (skin.price >= 90) rarity = 'epic';
    else if (skin.price >= 60) rarity = 'rare';

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

    // Build status badges HTML
    let statusBadgesHtml = '';
    if (isOwned && isSelected) {
        statusBadgesHtml += '<div class="status-badge equipped-badge" title="Currently equipped">⭐</div>';
    } else if (isOwned) {
        statusBadgesHtml += '<div class="status-badge owned-badge" title="Owned">✓</div>';
    } else if (!canAfford) {
        statusBadgesHtml += '<div class="status-badge locked-badge" title="Locked">🔒</div>';
    }

    // Price badge text
    const priceBadgeText = skin.price === 0 ? 'FREE' : `${skin.price}`;

    return `
      <div class="skin-card glass rarity-${rarity}" data-skin-id="${skin.id}" aria-label="${ariaLabel}" ${isSelected ? 'data-equipped="true"' : ''} ${!canAfford ? 'data-locked="true"' : ''} style="animation-delay: ${index * 0.05}s;">
        <div class="skin-status-badges">${statusBadgesHtml}</div>
        <div class="skin-preview" style="${previewStyle}"></div>
        <div class="skin-price-badge">${priceBadgeText}${!isOwned && skin.price > 0 ? ' <span class="coin-icon" style="width: 12px; height: 12px; display: inline-block; margin-left: 4px;"></span>' : ''}</div>
        <div class="skin-name">${skin.name}</div>
        <div class="skin-actions">
          ${isOwned
            ? `<button class="${actionClass}" ${disabled}>${action}</button>`
            : `<button class="${actionClass}" ${disabled}>${action}</button>`}
        </div>
      </div>
    `;
}

function tryBuySkin(id, startGame, hideOverlayCb, options = {}) {
    const skin = getSkinById(id);
    if (!skin) return;
    const owned = new Set(state.ownedSkins || []);

    // If already owned, just return (don't block free skins here)
    if (owned.has(id)) return;

    // Check if user has enough currency (skip for free skins)
    if (skin.price > 0 && state.currency < skin.price) {
        // Show insufficient funds feedback
        const skinCard = document.querySelector(`.skin-card[data-skin-id="${id}"]`);
        const ariaLive = document.getElementById('ariaLive');
        const needed = skin.price - state.currency;

        if (skinCard) {
            skinCard.classList.add('shake');
            setTimeout(() => skinCard.classList.remove('shake'), 400);
        }

        if (ariaLive) {
            ariaLive.textContent = `Not enough coins. You need ${needed} more coins to purchase ${skin.name}.`;
            // Clear the message after it's been read
            setTimeout(() => ariaLive.textContent = '', 3000);
        }

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

    // Announce purchase success
    const ariaLive = document.getElementById('ariaLive');
    if (ariaLive && skin.price > 0) {
        ariaLive.textContent = `Successfully purchased ${skin.name} for ${skin.price} coins!`;
        setTimeout(() => ariaLive.textContent = '', 3000);
    }

    // Auto-equip on purchase
    equipSkin(id, startGame, hideOverlayCb, { silent: true });

    // Rebuild UI to reflect changes
    if (!options?.silent) {
        rebuildCustomizeUI(startGame, hideOverlayCb);
    }
}

function equipSkin(id, startGame, hideOverlayCb, options = {}) {
    const skin = getSkinById(id);
    if (!skin) return;

    const owned = new Set(state.ownedSkins || []);

    // Allow equipping only if owned
    if (!owned.has(id)) {
        // Not owned, can't equip
        return;
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

// -----------------------
// Settings Modal
// -----------------------

let settingsBackdrop = null;
let lastFocusedEl = null;

function createSettingsModalIfNeeded() {
        if (settingsBackdrop) return settingsBackdrop;
        settingsBackdrop = document.createElement('div');
        settingsBackdrop.className = 'modal-backdrop';
        settingsBackdrop.setAttribute('aria-hidden', 'true');
        settingsBackdrop.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
                <div class="modal-header">
                    <h2 id="settingsTitle">Settings</h2>
                    <button id="settingsCloseBtn" class="btn btn-close" aria-label="Close settings">✕</button>
                </div>
                <div class="modal-body">
                    <label class="row">
                        <input id="toggleSound" type="checkbox" />
                        <span>Sound Effects</span>
                    </label>
                    <label class="row">
                        <input id="toggleMusic" type="checkbox" />
                        <span>Music</span>
                    </label>
                    <div class="row column">
                        <label for="speedRange">Game Speed</label>
                        <input id="speedRange" type="range" min="${GAMEPLAY.speedMin}" max="${GAMEPLAY.speedMax}" step="10" />
                        <div class="hint" id="speedHint"></div>
                    </div>
                    <div class="danger-zone">
                        <div class="row column">
                            <button id="resetProgressBtn" class="btn btn-danger">
                                Reset Progress
                            </button>
                            <div class="hint">Clear all saved data (high score, currency, owned skins)</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer centered">
                    <button id="settingsCancelBtn" class="btn">Cancel</button>
                    <button id="settingsSaveBtn" class="btn neon">Save</button>
                </div>
            </div>
        `;
        const stageWrap = document.getElementById('stage-wrap');
        stageWrap.appendChild(settingsBackdrop);
        return settingsBackdrop;
}

export function showSettingsModal() {
        createSettingsModalIfNeeded();
        lastFocusedEl = document.activeElement;

        // Populate controls
        const soundEl = settingsBackdrop.querySelector('#toggleSound');
        const musicEl = settingsBackdrop.querySelector('#toggleMusic');
        const speedEl = settingsBackdrop.querySelector('#speedRange');
        const speedHint = settingsBackdrop.querySelector('#speedHint');

        soundEl.checked = !!state.settings?.soundOn;
        musicEl.checked = !!state.settings?.musicOn;
        speedEl.value = String(state.speedMs);
        speedHint.textContent = `Tick: ${state.speedMs} ms (lower is faster)`;

        // Wire handlers
        const closeBtn = settingsBackdrop.querySelector('#settingsCloseBtn');
        const saveBtn = settingsBackdrop.querySelector('#settingsSaveBtn');
        const cancelBtn = settingsBackdrop.querySelector('#settingsCancelBtn');
        const resetBtn = settingsBackdrop.querySelector('#resetProgressBtn');

        const onInput = () => {
                speedHint.textContent = `Tick: ${speedEl.value} ms (lower is faster)`;
        };
        speedEl.addEventListener('input', onInput);

        const onResetProgress = () => {
                const confirmed = confirm(
                        'Are you sure you want to reset all progress?\n\n' +
                        'This will clear:\n' +
                        '• High score\n' +
                        '• Currency (coins)\n' +
                        '• Owned skins\n' +
                        '• Selected skin\n\n' +
                        'This action cannot be undone!'
                );

                if (confirmed) {
                        // Clear all game data from localStorage
                        localStorage.removeItem('neonSnakeHighScore');
                        localStorage.removeItem('neonSnakeCurrency');
                        localStorage.removeItem('neonSnakeOwnedSkins');
                        localStorage.removeItem('neonSnakeSelectedSkin');

                        // Announce to screen reader
                        const ariaLive = document.getElementById('ariaLive');
                        if (ariaLive) {
                                ariaLive.textContent = 'Progress reset. Reloading game...';
                        }

                        // Reload the page to reset state
                        setTimeout(() => {
                                window.location.reload();
                        }, 500);
                }
        };
        resetBtn.addEventListener('click', onResetProgress, { once: true });

        const onKeyDown = (e) => {
                if (e.key === 'Escape') {
                        hideSettingsModal();
                }
                if (e.key === 'Tab') {
                        trapFocus(e);
                }
        };
        settingsBackdrop.addEventListener('keydown', onKeyDown);

        const onSave = () => {
                const newSettings = {
                        soundOn: !!soundEl.checked,
                        musicOn: !!musicEl.checked,
                        speedMs: Number(speedEl.value)
                };
                state.settings = newSettings;
                state.speedMs = newSettings.speedMs;
                setStoredJSON('neonSnakeSettings', newSettings);
                hideSettingsModal();
        };
        const onCancel = () => hideSettingsModal();

        saveBtn.addEventListener('click', onSave, { once: true });
        cancelBtn.addEventListener('click', onCancel, { once: true });
        closeBtn.addEventListener('click', onCancel, { once: true });
        settingsBackdrop.addEventListener('click', (e) => {
                if (e.target === settingsBackdrop) onCancel();
        }, { once: true });

        // Show modal and focus first control
        settingsBackdrop.classList.add('show');
        settingsBackdrop.setAttribute('aria-hidden', 'false');
        const firstFocusable = settingsBackdrop.querySelector('#toggleSound');
        setTimeout(() => firstFocusable?.focus(), UI_FOCUS_DELAY);
}

export function hideSettingsModal() {
        if (!settingsBackdrop) return;
        settingsBackdrop.classList.remove('show');
        settingsBackdrop.setAttribute('aria-hidden', 'true');
        // Restore focus
        if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
                lastFocusedEl.focus();
        }
}

function trapFocus(e) {
        const focusable = settingsBackdrop.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const list = Array.from(focusable).filter(el => !el.hasAttribute('disabled'));
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
                last.focus();
                e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
                first.focus();
                e.preventDefault();
        }
}