// Regenerating file to force cache refresh.
import { state } from './state.js';
import { SKINS, getSkinById, DEFAULT_SKIN_ID } from './config.js';
import { setStoredJSON, setStoredValue, formatNumber } from './utils.js';
import { canvas } from './canvas.js';
import { UI_FOCUS_DELAY, DEBUG } from './config.js';
import { UI_ANIMATIONS, GAMEPLAY, VISUAL } from './gameConfig.js';
import { triggerCoinFlyAnimation } from './coinAnimation.js';

export const overlay = document.getElementById('overlay');
export const scoreEl = document.getElementById('score');
export const highScoreEl = document.getElementById('highScore');
export const hudCurrencyEl = document.getElementById('hudCurrency');
export const foodCollectedEl = document.getElementById('foodCollected');

// lobby overlay no longer renders standalone high-score/currency stat boxes above the title
// (these are displayed in the persistent stage HUD). Keep variables removed to avoid unused warnings.
let currentStartGame, currentHideOverlay;
let lastCurrency = 0;
let _titleNoiseTimer = null;

/**
 * Show a generic overlay with a title, subtitle and a primary button.
 * @param {string} title
 * @param {string} subtitle
 * @param {string} buttonText
 * @param {Function} onButtonClick
 */
export function showOverlay(title, subtitle, buttonText, onButtonClick) {
    overlay.classList.add('visible');
    // Add modifier to stage to hide certain HUD items (e.g., food counter) while overlay is visible
    document.getElementById('stage-wrap')?.classList.add('overlay-open');
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
        // Start title noise for generic overlays as well
        startTitleNoiseIfEnabled();
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
    // Hide non-essential HUD items while lobby overlay is visible
    document.getElementById('stage-wrap')?.classList.add('overlay-open');
    overlay.innerHTML = buildLobbyHTML();

    // Update stats display (HUD values handled by persistent stage HUD)
    updateStats();

    // Update high score badge in lobby
    const lobbyHighScore = document.getElementById('lobbyHighScore');
    if (lobbyHighScore) {
        lobbyHighScore.textContent = formatNumber(state.highScore);
    }

    attachLobbyListeners(startGame, hideOverlay);
    // Start title noise when lobby opens
    startTitleNoiseIfEnabled();
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

        <!-- Settings icon button in top-right corner (visible while overlay shown) -->
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

            <!-- High Score Badge (positioned right-center) -->
            <div class="high-score-badge glass">
                <div class="badge-content">
                    <span class="badge-label">HIGHEST SCORE</span>
                    <span id="lobbyHighScore" class="badge-value">0</span>
                </div>
            </div>

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
 * Left corner: Always shows COINS
 * Right corner: SCORE + FOOD (visible only during gameplay)
 * @returns {void}
 */
export function updateStats() {
    // Update coins (left corner, always visible)
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

    // Update score (right corner, visible during gameplay only)
    const hudScoreEl = document.getElementById('hudScore');
    if (hudScoreEl) {
        hudScoreEl.textContent = formatNumber(state.score);
    }

    // Update food collected counter (right corner, visible during gameplay only)
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
    // Restore HUD visibility
    document.getElementById('stage-wrap')?.classList.remove('overlay-open');
    // Stop title noise if running
    stopTitleNoise();
    setTimeout(() => canvas.focus(), UI_FOCUS_DELAY);
}

/**
 * Build game over screen HTML with structured layout
 * @param {object} detail - Game over event detail object
 * @returns {string} HTML for game over screen
 */
function buildGameOverHTML(detail) {
    const { title, score, foodEaten, coinsEarned, highScore, isNewHighScore } = detail;

    return `
        <!-- Floating background particles -->
        <div class="gameover-bg-particle"></div>
        <div class="gameover-bg-particle"></div>
        <div class="gameover-bg-particle"></div>
        <div class="gameover-bg-particle"></div>

        <!-- Game over container -->
        <div class="gameover-container glass">
            <!-- Title -->
            <h1 class="gameover-title neon ${isNewHighScore ? 'highlight' : ''}">
                ${title}
            </h1>

            <!-- Stats grid -->
            <div class="gameover-stats">
                <div class="stat-card glass" style="animation-delay: 0s;">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value neon">${score}</div>
                    <div class="stat-label">Score</div>
                </div>
                <div class="stat-card glass" style="animation-delay: 0.1s;">
                    <span class="food-sphere-icon stat-icon"></span>
                    <div class="stat-value neon">${foodEaten}</div>
                    <div class="stat-label">Food Eaten</div>
                </div>
                <div class="stat-card glass" style="animation-delay: 0.2s;">
                    <span class="coin-icon stat-icon"></span>
                    <div class="stat-value neon">${coinsEarned}</div>
                    <div class="stat-label">Coins Earned</div>
                </div>
                <div class="stat-card glass" style="animation-delay: 0.3s;">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value neon">${highScore}</div>
                    <div class="stat-label">High Score</div>
                </div>
            </div>

            <!-- Buttons -->
            <div class="gameover-buttons">
                <button id="gameoverPlayAgainBtn" class="btn btn-hero neon">Play Again</button>
                <button id="gameoverBackBtn" class="btn secondary">Back to Lobby</button>
            </div>
        </div>
    `;
}

// Listen for game over events
document.addEventListener('showGameOver', (e) => {
    overlay.classList.add('visible');
    overlay.innerHTML = buildGameOverHTML(e.detail);

    // Wire up button handlers
    const playAgainBtn = document.getElementById('gameoverPlayAgainBtn');
    const backBtn = document.getElementById('gameoverBackBtn');

    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            currentStartGame();
            hideOverlay();
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showLobby(currentStartGame, hideOverlay);
        });
    }

    // Focus on Play Again button for accessibility
    setTimeout(() => playAgainBtn?.focus(), 100);

    // Trigger coin flying animation after stat cards appear
    if (e.detail.coinsEarned > 0) {
        setTimeout(() => {
            // Find the "Coins Earned" stat card (3rd card in grid)
            const coinsEarnedCard = overlay.querySelector('.stat-card:nth-child(3)');
            if (coinsEarnedCard) {
                triggerCoinFlyAnimation(e.detail.coinsEarned, coinsEarnedCard);
            }
        }, 600); // Wait for stat cards to animate in (0.3s last card + 0.3s buffer)
    }
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
 * Update a single skin card without rebuilding entire UI (prevents flickering)
 */
function updateSkinCard(skinId, startGame, hideOverlayCb) {
    const card = overlay.querySelector(`[data-skin-id="${skinId}"]`);
    if (!card) return;

    const skin = getSkinById(skinId);
    if (!skin) return;

    const owned = new Set(state.ownedSkins || []);
    const isOwned = owned.has(skinId);
    const isSelected = state.selectedSkinId === skinId;

    // Update equipped badge
    const statusBadges = card.querySelector('.skin-status-badges');
    if (statusBadges) {
        let badgeHtml = '';
        if (isOwned && isSelected) {
            badgeHtml = '<div class="status-badge equipped-badge" title="Currently equipped">⭐</div>';
        } else if (!isOwned) {
            badgeHtml = '<div class="status-badge locked-badge" title="Locked">🔒</div>';
        }
        statusBadges.innerHTML = badgeHtml;
    }

    // Update action button
    const skinActions = card.querySelector('.skin-actions');
    if (skinActions) {
        let actionHtml = '';
        if (isOwned) {
            if (isSelected) {
                actionHtml = '<button class="btn btn-selected" disabled>Selected</button>';
            } else {
                actionHtml = '<button class="btn btn-select equipBtn">Select</button>';
            }
        } else if (skin.price > 0) {
            actionHtml = `<button class="price-chip buyChip" aria-label="Buy ${skin.name} for ${skin.price} coins"><span class="coin-icon"></span><span class="price-value">${skin.price}</span></button>`;
        }
        skinActions.innerHTML = actionHtml;

        // Rewire event listeners for this card only
        const buyBtn = skinActions.querySelector('.buyChip');
        const equipBtn = skinActions.querySelector('.equipBtn');
        if (buyBtn) buyBtn.addEventListener('click', () => tryBuySkin(skinId, startGame, hideOverlayCb));
        if (equipBtn) equipBtn.addEventListener('click', () => equipSkin(skinId, startGame, hideOverlayCb));
    }

    // Update card attributes
    if (isSelected) {
        card.setAttribute('data-equipped', 'true');
    } else {
        card.removeAttribute('data-equipped');
    }

    enableLockedCardShake(card);

    // Update currency display
    const currencyEl = document.getElementById('lobbyCurrency');
    if (currencyEl) currencyEl.textContent = formatNumber(state.currency);
}

/**
 * Update all skin cards (used when multiple cards need updates, like after purchase + equip)
 */
function updateAllSkinCards(startGame, hideOverlayCb) {
    SKINS.forEach(skin => updateSkinCard(skin.id, startGame, hideOverlayCb));
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
        const buyBtn = card.querySelector('.buyChip');
        const equipBtn = card.querySelector('.equipBtn');

        enableLockedCardShake(card);

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
    } else if (!isOwned) {
        // Show locked badge for all not-owned skins
        statusBadgesHtml += '<div class="status-badge locked-badge" title="Locked">🔒</div>';
    }

    return `
      <div class="skin-card glass rarity-${rarity}" data-skin-id="${skin.id}" aria-label="${ariaLabel}" ${isSelected ? 'data-equipped="true"' : ''} ${!canAfford ? 'data-locked="true"' : ''} style="animation-delay: ${index * 0.05}s;">
        <div class="skin-status-badges">${statusBadgesHtml}</div>
        <div class="skin-preview" style="${previewStyle}"></div>
        <div class="skin-name">${skin.name}</div>
        <div class="skin-actions">
                    ${
                        isOwned
                            ? (
                                    isSelected
                                        ? `<button class="btn btn-selected" disabled>Selected</button>`
                                        : `<button class="btn btn-select equipBtn">Select</button>`
                                )
                            : (
                                    skin.price > 0
                                        ? `<button class="price-chip buyChip" aria-label="Buy ${skin.name} for ${skin.price} coins"><span class="coin-icon"></span><span class="price-value">${skin.price}</span></button>`
                                        : ''
                                )
                    }
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
            triggerLockedCardShake(skinCard);
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

    // Auto-equip on purchase (will update all cards)
    const previousSkinId = state.selectedSkinId;
    equipSkin(id, startGame, hideOverlayCb, { silent: true });

    // Update UI to reflect changes - update all cards since purchase affects multiple:
    // 1. The purchased skin (lock -> select button)
    // 2. The previously equipped skin (selected -> select)
    // 3. The newly equipped skin (select -> selected)
    if (!options?.silent) {
        updateAllSkinCards(startGame, hideOverlayCb);
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

    const previousSkinId = state.selectedSkinId;

    // Equip the skin
    state.selectedSkinId = id;
    state.currentSkin = skin; // Store full skin object for advanced rendering
    setStoredJSON('neonSnakeSelectedSkin', id);

    // Update UI unless silent mode - update both old and new equipped skins
    if (!options.silent) {
        // Update previously equipped skin (if different)
        if (previousSkinId && previousSkinId !== id) {
            updateSkinCard(previousSkinId, startGame, hideOverlayCb);
        }
        // Update newly equipped skin
        updateSkinCard(id, startGame, hideOverlayCb);
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

        soundEl.checked = !!state.settings?.soundOn;
        musicEl.checked = !!state.settings?.musicOn;

        // Wire handlers
        const closeBtn = settingsBackdrop.querySelector('#settingsCloseBtn');
        const saveBtn = settingsBackdrop.querySelector('#settingsSaveBtn');
        const cancelBtn = settingsBackdrop.querySelector('#settingsCancelBtn');
        const resetBtn = settingsBackdrop.querySelector('#resetProgressBtn');

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
                        musicOn: !!musicEl.checked
                };
                state.settings = newSettings;
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

function startTitleNoiseIfEnabled() {
    // Respect overall visual toggles and game config
    if (!VISUAL?.enableBlinking || !UI_ANIMATIONS?.titleNoiseEnabled) return;
    // Respect user/system reduced motion
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    stopTitleNoise();

    const runNoiseCycle = async () => {
        const min = Math.max(2, UI_ANIMATIONS.titleNoiseMinIntervalSec || 6);
        const max = Math.max(min + 1, UI_ANIMATIONS.titleNoiseMaxIntervalSec || 18);
        const waitSec = Math.random() * (max - min) + min;
        await new Promise(r => _titleNoiseTimer = setTimeout(r, waitSec * 1000));

        // Find current title chars in overlay (non-spacer)
        const chars = Array.from(overlay.querySelectorAll('.title-text .title-char:not(.spacer)'));
        if (chars.length === 0) return runNoiseCycle();

        const idx = Math.floor(Math.random() * chars.length);
        const el = chars[idx];
        if (!el) return runNoiseCycle();

    const duration = UI_ANIMATIONS.titleNoiseDurationMs || 300;
    el.classList.add('flicker');
    // Remove class after animation completes to avoid snapping
    const onAnimEnd = (e) => {
        if (e.target === el) {
            el.classList.remove('flicker');
            el.removeEventListener('animationend', onAnimEnd);
        }
    };
    el.addEventListener('animationend', onAnimEnd);
    // Safety fallback
    setTimeout(() => {
        el.classList.remove('flicker');
        el.removeEventListener('animationend', onAnimEnd);
    }, duration + 80);

        // Continue cycle while overlay is still visible
        if (overlay.classList.contains('visible')) {
            runNoiseCycle();
        }
    };

    runNoiseCycle();
}

function stopTitleNoise() {
    if (_titleNoiseTimer) {
        clearTimeout(_titleNoiseTimer);
        _titleNoiseTimer = null;
    }
    // Remove any leftover class
    overlay.querySelectorAll('.title-char.flicker').forEach(el => el.classList.remove('flicker'));
}

const LOCKED_SHAKE_DURATION_MS = 500;

function triggerLockedCardShake(card) {
    if (!card || !card.hasAttribute('data-locked')) return;

    // Apply consistent glow feedback
    card.classList.add('shake');
    if (card.__shakeGlowTimeout) {
        clearTimeout(card.__shakeGlowTimeout);
    }
    card.__shakeGlowTimeout = setTimeout(() => {
        card.classList.remove('shake');
        card.__shakeGlowTimeout = null;
    }, LOCKED_SHAKE_DURATION_MS);

    // Cancel any in-progress shake animation so the new one restarts cleanly
    if (card.__shakeAnimation) {
        card.__shakeAnimation.cancel();
    }

    const shakeKeyframes = [
        { transform: 'translateX(0px)', offset: 0 },
        { transform: 'translateX(-8px)', offset: 0.1 },
        { transform: 'translateX(8px)', offset: 0.2 },
        { transform: 'translateX(-6px)', offset: 0.35 },
        { transform: 'translateX(6px)', offset: 0.5 },
        { transform: 'translateX(-4px)', offset: 0.7 },
        { transform: 'translateX(4px)', offset: 0.85 },
        { transform: 'translateX(0px)', offset: 1 }
    ];

    const animation = card.animate(shakeKeyframes, {
        duration: LOCKED_SHAKE_DURATION_MS,
        easing: 'ease-in-out',
        iterations: 1,
        composite: 'add'
    });

    card.__shakeAnimation = animation;
    const clearAnimationRef = () => {
        if (card.__shakeAnimation === animation) {
            card.__shakeAnimation = null;
        }
    };
    animation.addEventListener('finish', clearAnimationRef, { once: true });
    animation.addEventListener('cancel', clearAnimationRef, { once: true });
}

function enableLockedCardShake(card) {
    if (!card) return;
    if (card.__lockedShakeHandler) return;

    const handler = (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        if (!card.hasAttribute('data-locked')) return;
        triggerLockedCardShake(card);
    };

    card.addEventListener('pointerdown', handler);
    card.__lockedShakeHandler = handler;
}