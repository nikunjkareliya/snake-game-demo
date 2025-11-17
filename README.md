# Snake Frenzy

A neon-styled Snake game for the web. Built with HTML5 Canvas, CSS, and vanilla JavaScript.

## 🎮 Play Online

**Live Demo**: [Play Snake Frenzy](https://nikunjkareliya.github.io/snake-game-demo/)

## 🎯 How to Play

Open `index.html` in any modern browser, or visit the live demo above.

## 🎮 Controls

- **Arrow Keys / WASD**: Move
- **Space or P**: Pause/Resume
- **R**: Restart

## ⚡ Flow System (Chain Eating Multiplier)

The **Flow System** is a chain-eating mechanic that rewards rapid food consumption with score multipliers.

### How It Works

**1. Flow Starts**
- Eat your first food → Flow bar appears with a 6-second timer
- Timer counts down as you move

**2. Build Your Chain**
- Eat food within the timer window → Timer resets, chain continues
- Each food eaten without missing the window increases your streak

**3. Reach Flow Tiers**
- Every 3 consecutive food eaten → Flow tier increases
- Higher tiers unlock better score multipliers

| Flow Tier | Multiplier | Visual |
|-----------|-----------|--------|
| 0 | 1.0x | Gray (no bonus) |
| 1 | 1.2x | Green (+20%) |
| 2 | 1.5x | Cyan (+50%) |
| 3 | 2.0x | Magenta (2x score!) |
| 4 | 3.0x | Orange (3x score!) |

**4. Chain Breaks**
- Miss the timer window → Flow resets to tier 0
- Timer turns orange when less than 2 seconds remain (danger warning)
- Must eat food to restart your chain

### Example Timeline

```
T=0.0s: Eat Food #1 → Flow starts, Timer=6.0s, Tier=0, Mult=1.0x
T=2.5s: Eat Food #2 → Timer resets to 6.0s, Streak=2
T=3.2s: Eat Food #3 → Timer resets, Streak=3 → TIER UP! (Mult=1.2x)
T=5.8s: Eat Food #4 → Timer resets, Streak=1, Mult=1.2x
T=6.1s: Miss food → Timer expires → Chain broken, Mult=1.0x
```

### Difficulty Scaling

As you progress and increase your difficulty tier, the Flow window shrinks:
- **Tier 0**: 6.0 seconds (plenty of time)
- **Tier 5**: 4.5 seconds (tighter)
- **Tier 10**: 3.0 seconds (very challenging!)

This creates a skill-based progression where aggressive players earn higher multipliers.

### Visual Feedback

The horizontal Flow bar (top center) shows:
```
       T2  [████████████████░░░░░] 4.3s ×2.0
              ● ● ○ ○
```
- **T2**: Current flow tier (0-4)
- **Bar**: Fills left-to-right, drains as timer counts down
- **4.3s**: Time remaining in the window
- **×2.0**: Current score multiplier
- **Dots**: Visual tier indicator (filled = reached, empty = not yet)

## 📊 Game Features

- Score increases by 10 per food
- Speed increases slightly after eating
- Best score is saved to `localStorage`
- Dynamic Intro Animation: Features two large, fast-moving snakes traversing the screen diagonally in opposite, offset paths before gameplay begins.

### 📋 Development Roadmap Note

This project has an extensive design document ([ENDLESS_SURVIVAL_DESIGN.md](ENDLESS_SURVIVAL_DESIGN.md)) outlining planned features for an Endless Survival mode.

**Current Implementation Progress: ~45-50% Complete** ⬆️ (Updated with recent survival mode features)

#### ✅ Recently Implemented (Survival Mode Launch! 🎉)
- **Boosters** (2/8 types implemented):
  - ✅ **Coin Shower**: Basket spawns as 2×2 collectible, explodes into 12 flying coins with physics-based settlement to grid cells (5 coins each, 5s lifetime)
  - ✅ **Shrink Ray**: Potion bottle pickup (2×2), instantly removes 50% of snake's tail segments with magenta particle burst and notification
- **Hazards** (2/11 types implemented):
  - ✅ **Static Hazards**: Grid-based lethal cells with 1.5s telegraph (fade-in animation + pulsing glow), red square (80% cell) with white border
  - ✅ **Patrol Orbs (Dynamic)**: Moving hazards (2-4 cells/sec, path reversal), **48px diameter with evil visual design**:
    - **Evil Animated Gradient**: Swirling radial gradient (1.5 rad/sec rotation), pulsing glow (10-30px shadow blur), bright center → dark edges, 4 evil vein streaks
    - **Blinking Evil Eyes**: Match snake eye style with dark red sclera (#330000), glowing orange pupils (#ff6600), blink every 2.5-6s (0.12s duration)
    - **Motion Trail**: 5 fading position dots showing path history
- **Tier Script System**: Automatic hazard spawning based on tier (0-10 tiers) with progressive difficulty scaling
- **Telegraph System**: Complete 1.5-second visual warning system before hazards become lethal (state machine: telegraph → active)

#### ❌ Still Planned
- **Boosters** (6/8 remaining): Flow Extender, Overdrive Surge, Shield Barrier, Score Magnet, Stasis Burst, Hazard Vortex, Flow Anchor, Phase Dash, Combo Crown, Chrono Dial
- **Hazards** (9/11 remaining): Hazard clusters, spiral drones, laser sweeps, portals, shifter zones, ghost snake, crumble cells, and more
- **Phase Rotation**: Cyclical difficulty phases (Surge/Bloom/Compression)
- **Adaptive Assist**: Death protection and frustration valves
- **Time Multiplier**: Score scaling based on survival duration
- **Advanced Scoring**: Route combos, hazard survival bonuses
- **Booster Pity System**: Guaranteed spawn mechanics
- **Weighted Rarity**: Common/Uncommon/Rare/Epic distribution

The design document serves as a roadmap for future development. This README documents the **currently implemented features**.

---

## 🏗️ Architecture & Module Analysis

This project follows a modular architecture with clear separation of concerns. The codebase is organized into 21 distinct modules, each responsible for specific functionality. The architecture includes core gameplay systems, advanced progression mechanics, visual feedback systems, and UI animations.

### 📁 Module Overview

#### **1. `main.js` - Application Entry Point & Game Loop**
**Responsibilities:**
- Initializes the game by setting up input handlers and UI
- Implements the main game loop using `requestAnimationFrame`
- Manages frame timing with delta time calculations (capped at 33ms)
- Orchestrates all game systems in the correct order:
  - Updates intro animation, particles, and ambient effects
  - Updates timers (mouth animation, hit shake)
  - Steps snake movement when playing
  - Handles death sequence timing
  - Triggers rendering each frame

**Key Functions:**
- `tick(now)` - Main game loop that runs continuously

**Dependencies:** All other modules

---

#### **2. `config.js` - Core Configuration & Constants**
**Responsibilities:**
- Defines core, static game constants and configuration values
- Canvas dimensions (1024x768) and device pixel ratio
- Grid system (32x32 cells, 32x24 rows/columns)
- Direction enum (Up, Down, Left, Right)
- Core visual settings (colors, radii, animations)

**Exports:**
- Canvas dimensions: `CSS_WIDTH`, `CSS_HEIGHT`, `DPR`
- Grid: `CELL_SIZE`, `COLUMNS`, `ROWS`
- Direction enum
- Visual constants: `COLOR_A`, `COLOR_B`, `BODY_RADIUS`, `HEAD_RADIUS`

**Dependencies:** None (pure configuration)

---

#### **3. `gameConfig.js` - Game Design & Tuning Configuration**
**Responsibilities:**
- Externalizes all tunable game design values for easy adjustment by designers.
- Contains settings for economy, gameplay difficulty, visual effects, and UI animations.
- Includes settings for the intro animation (duration, scale, length, offset).

**Exports:**
- `INTRO_ANIMATION`, `ECONOMY`, `GAMEPLAY`, `VISUAL`, `UI_ANIMATIONS`, `PERSISTENCE`, `DEV`
- Helper functions like `getSkinPrice` and `calculateDeathReward`.

**Dependencies:** None (pure configuration)

---

#### **4. `state.js` - Global Game State Manager**
**Responsibilities:**
- Centralized state management for the entire application
- Manages game state machine (init, lobby, intro, playing, paused, dying, gameover)
- Tracks score, high score, and currency (persisted to localStorage)
- Maintains snake position, direction, and food location
- Stores visual state (particles, timers for animations)
- Holds the state for the intro animation, including snake positions and progress.

**State Properties:**
- Game flow: `gameState`, `speedMs`, timing variables
- Scoring: `score`, `highScore`, `currency`
- Entities: `snake[]`, `food`, `direction`, `nextDirection`
- Visual effects: `particles[]`, `currentSkin`, animation timers, `introAnimation`
- Performance: `lastTickAt`, `lastFrameAt`, `elapsedSec`

**Dependencies:** `config.js`

---

#### **5. `game.js` - Core Game Logic Controller**
**Responsibilities:**
- Manages game lifecycle (reset, start, pause, game over)
- Handles the logic for the dual-snake intro animation.
- Initializes snake starting position (center of grid, 3 segments)
- Handles game state transitions
- Calculates currency earned (score / 10)
- Triggers game over modal with appropriate messages

**Key Functions:**
- `stepIntroAnimation(dt)` - Advances the intro animation frame.
- `startGame()` - Starts a new game session, beginning with the intro.
- `resetGame()` - Resets all game state to initial values
- `togglePause()` - Pauses/resumes gameplay
- `finalizeGameOver()` - Handles end-game logic and UI display

**Dependencies:** `state.js`, `config.js`, `gameConfig.js`, `food.js`

---

#### **6. `snake.js` - Snake Entity & Movement Logic**
**Responsibilities:**
- Handles gameplay snake movement and physics
- Collision detection (walls, self, food)
- Growth mechanics when eating food
- Visual effects coordination (eating animation, death explosion)

**Key Functions:**
- `stepSnake()` - Moves snake one step in current direction
- `updateParticles(dt)` - Updates all particle positions and lifetimes
- `createEatEffect(pos)` - Spawns particles when eating food

**Collision Detection:**
- Wall collision: Checks if next position is outside grid bounds
- Self collision: Checks if head collides with body segments
- Food collision: Checks if head reaches food position

**Dependencies:** `state.js`, `config.js`, `death.js`, `food.js`, `particles.js`

---

#### **7. `food.js` - Food Entity Management**
**Responsibilities:**
- Spawns food at random valid positions
- Ensures food doesn't spawn on snake body
- Creates ambient particle effects around food
- Manages food sparkle timer

**Key Functions:**
- `spawnFood()` - Recursively finds valid position for food
- `spawnFoodAmbient(dt)` - Spawns floating particles around food every 0.1s

**Visual Effects:**
- Particles spawn in circular pattern around food
- Upward floating motion with randomized velocity
- Skin-aware particle colors

**Dependencies:** `state.js`, `config.js`, `utils.js`, `particles.js`

---

#### **8. `death.js` - Death Sequence Handler**
**Responsibilities:**
- Initiates death animation sequence
- Manages currency rewards calculation
- Updates high score if beaten
- Persists scores to localStorage
- Creates death particle explosion

**Key Functions:**
- `startDeathSequence()` - Triggers 1-second death animation
- `createSnakeDeathEffect()` - Creates particle burst for each snake segment

**Death Flow:**
1. Sets game state to 'dying'
2. Calculates currency earned (score / 10)
3. Updates and saves high score if necessary
4. Creates particle explosion
5. Clears snake array
6. Sets timers for death animation (1.0s) and screen shake (0.5s)

**Dependencies:** `state.js`, `config.js`, `particles.js`

---

#### **9. `particles.js` - Particle System Manager**
**Responsibilities:**
- Centralized particle creation and management
- Enforces maximum particle count to prevent memory issues
- Provides reusable particle burst creation
- Manages particle lifecycle and capacity limits

**Key Functions:**
- `addParticle(particle)` - Adds particle to state array with capacity management
- `createBurst(x, y, count, speedMin, speedMax, options)` - Creates radial particle burst

**Features:**
- **Capacity Control**: Automatically removes oldest particles when MAX_PARTICLES is reached
- **Burst Patterns**: Creates circular patterns with customizable count and speed
- **Skin Integration**: Uses skin-specific color palettes via skinPalette.js
- **Customizable Options**: Supports overrides for life, color, shape, and size

**Particle Properties:**
- Position (x, y) and velocity (vx, vy)
- Lifetime tracking
- Visual properties (color, shape, size)
- Shape types: circle or square

**Dependencies:** `state.js`, `config.js`, `skinPalette.js`

---

#### **10. `skinPalette.js` - Skin Color Palette Manager**
**Responsibilities:**
- Manages color palettes for different snake skins
- Provides skin-specific particle colors
- Handles animated skin color generation
- Supports various skin types (animated, pattern, special)

**Key Functions:**
- `getSkinParticlePalette(skin, elapsedSec)` - Returns color array based on skin type

**Skin Type Support:**
- **Animated Skins**: Electric, Inferno, Holographic (time-based colors)
- **Pattern Skins**: Python, Cosmic, Circuit (themed colors)
- **Special Skins**: Crystal, Phantom (unique effects)
- **Default Fallback**: Returns cyan/magenta/white for undefined skins

**Features:**
- Color deduplication to avoid redundant palette entries
- Shadow color generation with alpha transparency
- Dynamic color calculation for animated skins
- RGB/RGBA/Hex color format support

**Dependencies:** `config.js`

---

#### **11. `render.js` - Canvas Rendering Engine**
**Responsibilities:**
- All canvas drawing operations
- Implements advanced visual effects for gameplay and intro.
- Renders the dual snakes for the intro animation with scaling.
- Snake rendering with smooth spline interpolation
- Gradient effects, glows, and neon styling
- Multi-layered rendering (glow → base → shine)

**Key Functions:**
- `render()` - Main render function (exported as alias to drawWorld)
- `drawIntroSnake()` - Renders the two snakes for the intro animation.
- `drawSnake()` - Complex snake rendering with segments
- `drawSnakeHead(head, nx, ny, scale)` - Detailed head with eyes, pupils, mouth, tongue
- `drawFood()` - Glowing food with radial gradients
- `drawParticles()` - Renders all particles with glow effects

**Rendering Features:**
- **Spline Smoothing**: Bezier curves for smooth snake body
- **Animated Eyes**: Eyes with pupils that follow movement direction
- **Mouth Animation**: Opens/closes with tongue flicking when eating
- **Multi-layer Body**: Glow layer + gradient base + white shine highlight
- **Particle Effects**: Additive blending for light bloom
- **Skin Support**: Renders various skin types with unique visual effects

**Dependencies:** `state.js`, `canvas.js`, `config.js`

---

#### **12. `input.js` - Input Handler**
**Responsibilities:**
- Keyboard event management
- Key mapping for multiple control schemes
- Prevents opposite direction inputs (can't go back on yourself)
- Handles pause and restart hotkeys

**Supported Keys:**
- Movement: Arrow keys, WASD (8 total keys mapped)
- Pause: Space bar
- Restart: R key

**Key Functions:**
- `initInput(onStartGame, onTogglePause)` - Sets up keyboard listeners
- `areOppositeDirections(a, b)` - Prevents invalid direction changes

**Dependencies:** `state.js`, `config.js`

---

#### **13. `ui.js` - User Interface Manager**
**Responsibilities:**
- Manages overlay system (lobby, game over, customization, settings)
- Updates HUD elements (score, high score, currency, food collected)
- Handles menu interactions and skin selection
- Dynamic DOM generation for different screens
- Focus management for keyboard input

**Key Functions:**
- `showLobby(startGame, hideOverlay)` - Displays main menu with stats
- `showCustomize(startGame, hideOverlay)` - Shows skin selection interface
- `showSettingsModal()` / `hideSettingsModal()` - Settings screen management
- `showOverlay(title, subtitle, buttonText, onButtonClick)` - Generic overlay
- `updateStats()` - Updates all score displays
- `hideOverlay()` - Hides overlay and focuses canvas

**Dependencies:** `state.js`, `canvas.js`

---

#### **14. `transition.js` - Play Button Transition Animation**
**Responsibilities:**
- Displays an animated snake crawling across the screen as a wipe transition.
- Triggered when the player clicks the "Play" button in the lobby.
- Creates a seamless visual transition from the menu to the game.

**Key Functions:**
- `startTransition()` - Creates and animates the DOM-based snake segments.
- `cleanupTransition()` - Removes transition elements after animation completes

**Dependencies:** `gameConfig.js`

---

#### **15. `canvas.js` - Canvas Initialization**
**Responsibilities:**
- Canvas element acquisition and setup
- High DPI (Retina) display support
- Context configuration
- Focus management for keyboard events

**Exports:**
- `canvas` - The canvas DOM element
- `ctx` - The 2D rendering context

**Dependencies:** `config.js`

---

#### **16. `utils.js` - Utility Functions**
**Responsibilities:**
- Common helper functions
- Math utilities
- Color manipulation
- LocalStorage helpers with error handling

**Exported Functions:**
- `clamp(value, min, max)` - Constrains value to range
- `randomInt(min, max)` - Random integer in range (inclusive)
- `hypot(x, y)` - Calculate hypotenuse (distance)
- `formatNumber(num)` - Format number with commas
- `applyAlphaToColor(color, alpha)` - Add transparency to colors
- `getStoredNumber(key, defaultValue)` - Safe localStorage number retrieval
- `setStoredValue(key, value)` - Safe localStorage write
- `getStoredJSON(key, fallback)` - Safe JSON object retrieval
- `setStoredJSON(key, value)` - Safe JSON object storage

**Dependencies:** None

---

#### **17. `difficulty.js` - Difficulty & Progression System**
**Responsibilities:**
- Manages food-based tier progression (0-10 tiers)
- Calculates snake speed based on current tier
- Tracks total food eaten and progress to next tier
- Provides difficulty metrics for HUD and game systems

**Key Functions:**
- `calculateTier(foodCount)` - Returns current tier based on cumulative food
- `getSpeedForTier(tier)` - Returns movement speed (ms) for a tier
- `updateDifficultySnapshot()` - Updates state.difficulty with current metrics
- `calculateFlowWindow(tier)` - Calculates flow timer window based on difficulty
- `resetDifficulty()` - Resets all progression to Tier 0

**Progression Mechanics:**
- Each tier requires progressively more food (10, 15, 20, 25... food per tier)
- Speed increases from 120ms (Tier 0) to 60ms (Tier 10) - harder to control
- Flow window shrinks by 0.3s per tier (6.0s → 3.0s minimum)
- Designer-configurable via `DIFFICULTY` config in gameConfig.js

**Dependencies:** `state.js`, `gameConfig.js`

---

#### **18. `flow.js` - Flow System (Chain Eating Multiplier)**
**Responsibilities:**
- Manages chain-eating state and tier progression
- Handles flow timer countdown and expiration
- Calculates score multipliers based on flow tier
- Integrates with food collision and game loop

**Key Functions:**
- `onFoodEaten()` - Called when food is eaten; starts or continues flow
- `updateFlowTimer(dt)` - Called each frame; counts down timer
- `getCurrentFlowMultiplier()` - Returns score multiplier for current flow tier
- `resetFlow()` - Resets flow state on game start/end

**Flow Mechanics:**
- **Start**: First food eaten → Flow bar appears, tier=0, window=6.0s
- **Chain**: Eat food within window → Reset timer, increment streak
- **Tier Up**: Every 3 consecutive food → Multiplier increases (1.0x → 1.2x → 1.5x → 2.0x → 3.0x)
- **Expire**: Miss window → Reset to tier 0, must eat again to restart
- **Scale**: Window shrinks with difficulty (starts at 6.0s, minimum 3.0s)

**Designer-configurable via `FLOW` config in gameConfig.js**

**Dependencies:** `state.js`, `gameConfig.js`, `difficulty.js`

---

#### **19. `flowUI.js` - Flow Progress Bar Visualization**
**Responsibilities:**
- Renders horizontal flow progress bar during gameplay
- Shows real-time timer, tier, and multiplier
- Provides visual feedback with colors and animations
- Displays warning state when timer < 2s

**Key Functions:**
- `renderFlowBar()` - Main render function; draws entire flow UI
- `drawProgressBar(centerX, centerY, progress, color, inDanger)` - Draws horizontal progress bar
- `drawTierDots(centerX, centerY, currentTier, color)` - Draws tier indicator dots
- `drawLabels(centerX, centerY, tier, timer, multiplier, color, inDanger)` - Draws text labels

**Visual Design:**
```
       T2  [████████████████░░░░░] 4.3s ×2.0
              ● ● ○ ○
```
- Horizontal bar fills left-to-right as timer counts down
- Color-coded by flow tier (Gray → Green → Cyan → Magenta → Orange)
- Warning pulse when timer < 2 seconds
- Tier dots show current progression

**Designer-configurable via `FLOW_UI` config in gameConfig.js**

**Dependencies:** `state.js`, `canvas.js`, `gameConfig.js`, `config.js`

---

#### **20. `debugHUD.js` - Debug Statistics Display**
**Responsibilities:**
- Displays real-time game metrics for testing and debugging
- Shows difficulty tier, speed, flow status, and multiplier
- Provides development/QA visualization of progression systems

**Key Functions:**
- `renderDebugHUD()` - Renders 4-line stats display in bottom-left corner

**Displays:**
- Line 1: Difficulty tier and progress (e.g., "Tier 2/10 (25/45)")
- Line 2: Current snake speed (e.g., "Speed: 100ms")
- Line 3: Flow status with timer (e.g., "Flow T2 (4.3s / 6.0s)")
- Line 4: Score multiplier (e.g., "Multiplier: 1.5x")

**Toggle:** `DEV.showDifficultyHUD` in gameConfig.js (default: true)

**Dependencies:** `state.js`, `canvas.js`, `gameConfig.js`, `config.js`, `difficulty.js`, `flow.js`

---

#### **21. `coinAnimation.js` - Coin Flying Animation System**
**Responsibilities:**
- Creates animated coin particles that fly from source element to HUD
- Triggers on game over when death bonus coins are awarded
- Manages particle spawn timing, curved trajectories, and cleanup
- Provides visual feedback for coin rewards

**Key Functions:**
- `triggerCoinFlyAnimation(coinAmount, sourceElement)` - Spawns 5-8 coin particles with staggered timing
- `createCoinParticle(sourceRect, targetRect, index, total)` - Creates single coin with curved path animation
- `triggerHUDUpdate()` - Refreshes HUD counter with pop animation when coins arrive

**Animation Features:**
- **Dynamic Particle Count**: Spawns 5-8 coins based on reward amount (more coins = bigger visual impact)
- **Curved Trajectories**: Uses CSS custom properties (`--end-x`, `--end-y`, `--curve`) for arc motion
- **Staggered Spawn**: 80ms delay between each coin for smooth visual flow
- **Upward Arc**: Randomized upward curve (-100px to -150px) for natural parabolic motion
- **Rotation**: Each coin rotates 720° during flight for dynamic effect
- **HUD Sync**: Triggers coin counter update only when final coin arrives

**Visual Design:**
- Radial gradient with gold tones (#fff9c4 → #ffd54f → #ffb300 → #ff8f00)
- Glowing shadow effects for neon aesthetic
- Scale animation (1.0 → 1.2 → 0.8 → 0) for depth

**Integration:**
- Called by `ui.js` on `showGameOver` event
- Targets "Coins Earned" stat card (3rd card in game over screen)
- Animates to `.corner.left .coin-icon` HUD element
- 600ms delay after stat cards appear for proper timing

**Dependencies:** `ui.js` (dynamic import)

---

## 🔄 Data Flow

```
User Input → input.js → state.js
                            ↓
main.js (Game Loop) ← game.js ← snake.js → food.js
        ↓                         ↓   ↓        ↓
    render.js → canvas.js        particles.js
        ↓         ↓ ↓ ↓               ↓
    ui.js ← flowUI.js         death.js
      ↓  ↑  debugHUD.js ↑          ↓
coinAnimation.js  |        skinPalette.js
         ↑       |
    transition.js|
               difficulty.js ← flow.js
```

**Module Dependencies & Integration:**

**Progression Systems:**
- **difficulty.js** - Calculates tier based on food eaten; drives speed scaling
- **flow.js** - Manages chain-eating state; triggered by snake.js food collision
- Combined they provide dynamic difficulty scaling with skill-based rewards

**Visualization:**
- **flowUI.js** - Renders horizontal progress bar showing flow status
- **debugHUD.js** - Shows detailed metrics (tier, speed, flow, multiplier)
- Both read from difficulty.js and flow.js for real-time data

**UI Animations:**
- **coinAnimation.js** - Creates flying coin particles from game over screen to HUD
- **transition.js** - Handles play button snake crawl transition animation
- Both provide visual polish and feedback for player actions

**Gameplay Integration:**
- **snake.js** calls `onFoodEaten()` (flow.js) and `updateDifficultySnapshot()` (difficulty.js) on food collision
- **main.js** calls `updateFlowTimer()` (flow.js) each frame to count down timer
- **game.js** calls `resetDifficulty()` and `resetFlow()` on game start/end
- **ui.js** calls `triggerCoinFlyAnimation()` (coinAnimation.js) on game over event

**Shared Utilities:**
- **particles.js** is used by snake.js, food.js, and death.js for all particle effects
- **skinPalette.js** provides color palettes to particles.js for skin-aware particle colors
- **config.js** and **utils.js** are shared utility modules used across the codebase
- **gameConfig.js** centralizes all designer-tunable parameters (DIFFICULTY, FLOW, FLOW_UI, etc.)

---

## 🎨 Technical Highlights

### **Progression & Difficulty System**
- **Food-Based Tiers**: Difficulty tier increases based on cumulative food eaten (not time)
- **Dynamic Speed Scaling**: Snake speed automatically increases from 120ms → 60ms as tier increases
- **Flow Window Scaling**: Chain-eating window shrinks with difficulty (6.0s → 3.0s) for skill-based scaling
- **Designer-Friendly Config**: All values in gameConfig.js for easy tuning without code changes

### **Flow System (Chain Eating Multiplier)**
- **Real-time Score Multipliers**: 1.0x → 1.2x → 1.5x → 2.0x → 3.0x based on chain progress
- **Streak-Based Progression**: Every 3 consecutive food eaten → tier up
- **Timer Management**: Countdown window resets on each food; expires if missed
- **Difficulty Integration**: Window shrinks with game progression for increased challenge

### **Visual Effects System**
- **Dynamic Intro**: Dual-snake intro animation to build excitement
- **Flow UI Progress Bar**: Horizontal bar showing timer, tier, multiplier, and tier dots
- **Particle Engine**: Physics-based particles with gravity and lifetime
- **Spline Smoothing**: Catmull-Rom curves for organic snake movement
- **Composite Blending**: Uses 'lighter' blend mode for neon glow effects
- **Multi-pass Rendering**: Glow → Base → Highlight for depth

### **UI/UX Enhancements**
- **Coin Flying Animation**: Dynamic particle system showing coins flying from game over stat card to HUD
  - 5-8 coins spawn with staggered timing (80ms delay)
  - Curved trajectories using CSS custom properties
  - Rotation animation (720°) with scale effects
  - Triggers HUD update with pop animation on arrival
- **High Score Badge**: Hexagon-shaped badge on lobby screen showing personal best
  - Positioned at right-center for visual balance
  - Custom clip-path polygon for distinctive shape
  - Glass morphism styling with gradient and glow effects
- **Context-Aware HUD**: Different HUD visibility based on game state
  - Lobby: Shows coins + high score badge only
  - Gameplay: Shows coins (left) + score + food (right, separate containers)
  - Each HUD element in separate glass container for clean visual hierarchy
- **Settings Modal**: Accessible only in lobby (gear icon top-right)
  - Removed from gameplay HUD to reduce clutter during play

### **State Management**
- Centralized state object shared across all modules
- Game state machine with clear transitions
- LocalStorage persistence for high score and currency
- Progression snapshot system for HUD updates

### **Performance Optimizations**
- Delta time calculations for frame-independent movement
- Capped delta time to prevent spiral of death
- Efficient particle cleanup (splice from end)
- DPR-aware canvas scaling
- Conditional rendering (only render when flow is active)

### **Game Design Patterns**
- **Module Pattern**: ES6 modules with clear exports
- **State Machine**: Clean game state transitions
- **Observer Pattern**: Event-based UI updates
- **Separation of Concerns**: Distinct responsibilities per module
- **Configuration-Driven Design**: Centralized gameConfig.js for designer control

---

## 🚀 Suggested Next Tasks

### **High Priority**
1. **📱 Mobile Controls**: Touch-based directional controls for mobile devices
2. **🔊 Add Sound Effects**: Eating, collision, background music using Web Audio API
3. **🏆 Add Leaderboard**: Local or online leaderboard system
4. **⚡ Power-ups**: Speed boost, invincibility, score multiplier
5. **🎯 Level System**: Progressive difficulty with obstacles and level themes

### **Medium Priority**
6. **🌈 More Visual Effects**: Trail effects, screen shake on collision, combo animations
7. **📊 Statistics Tracking**: Games played, total score, average score, longest snake
8. **🎮 Game Modes**: Time attack, survival, multiplayer, endless
9. **🏪 Shop System**: Expand shop with more skins, power-ups, themes
10. **🎓 Tutorial System**: Interactive first-time user tutorial

### **Low Priority**
11. **♿ Accessibility**: Enhanced keyboard navigation, screen reader support, colorblind modes
12. **🔧 Developer Mode**: Debug overlay with FPS, collision boxes, state inspector
13. **🌐 Internationalization**: Multi-language support
14. **🎨 Theme System**: Light/dark mode, custom background themes
15. **📈 Achievement System**: Unlock achievements for milestones

### **Code Quality**
16. **✅ Add Unit Tests**: Test collision detection, scoring, state transitions
17. **📖 Add JSDoc Comments**: Document all functions with parameters and return types
18. **🔍 Code Splitting**: Consider bundler for better organization
19. **⚠️ Error Handling**: Add try-catch blocks for localStorage and canvas operations
20. **🎯 TypeScript Migration**: Add type safety and better IDE support

---

## 🛠️ Getting Started for Developers

### Prerequisites
- Modern web browser with ES6 module support
- Local web server (or just open `index.html` directly)

### Development
1. Clone the repository
2. Open `index.html` in a browser
3. Make changes to source files in `src/`
4. Refresh browser to see changes (no build step required!)

### Project Structure
```
snake-game-demo/
├── index.html          # Entry point
├── styles.css          # Neon styling
├── README.md           # This file
└── src/
    ├── main.js         # Game loop
    ├── config.js       # Core constants
    ├── gameConfig.js   # Game design tuning
    ├── state.js        # State management
    ├── game.js         # Game logic
    ├── snake.js        # Snake entity
    ├── food.js         # Food entity
    ├── death.js        # Death handling
    ├── particles.js    # Particle system
    ├── skinPalette.js  # Skin color palettes
    ├── render.js       # Rendering engine
    ├── input.js        # Input handling
    ├── ui.js           # UI management
    ├── transition.js   # UI transition effects
    ├── coinAnimation.js # Coin flying animation
    ├── canvas.js       # Canvas setup
    ├── utils.js        # Utilities
    ├── difficulty.js   # Difficulty & progression system
    ├── flow.js         # Flow system (chain eating)
    ├── flowUI.js       # Flow progress bar visualization
    └── debugHUD.js     # Debug statistics display
```
