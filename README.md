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

## 📊 Game Features

- Score increases by 10 per food
- Speed increases slightly after eating
- Best score is saved to `localStorage`
- Dynamic Intro Animation: Features two large, fast-moving snakes traversing the screen diagonally in opposite, offset paths before gameplay begins.

---

## 🏗️ Architecture & Module Analysis

This project follows a modular architecture with clear separation of concerns. The codebase is organized into 16 distinct modules, each responsible for specific functionality.

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

## 🔄 Data Flow

```
User Input → input.js → state.js
                            ↓
main.js (Game Loop) ← game.js ← snake.js → food.js
        ↓                         ↓   ↓        ↓
    render.js → canvas.js        particles.js
        ↓                              ↓
    ui.js (HUD Updates)            death.js
        ↓                              ↓
    transition.js                 skinPalette.js
```

**Module Dependencies:**
- **particles.js** is used by snake.js, food.js, and death.js for all particle effects
- **skinPalette.js** provides color palettes to particles.js for skin-aware particle colors
- **config.js** and **utils.js** are shared utility modules used across the codebase

---

## 🎨 Technical Highlights

### **Visual Effects System**
- **Dynamic Intro**: Dual-snake intro animation to build excitement.
- **Particle Engine**: Physics-based particles with gravity and lifetime
- **Spline Smoothing**: Catmull-Rom curves for organic snake movement
- **Composite Blending**: Uses 'lighter' blend mode for neon glow effects
- **Multi-pass Rendering**: Glow → Base → Highlight for depth

### **State Management**
- Centralized state object shared across all modules
- Game state machine with clear transitions
- LocalStorage persistence for high score and currency

### **Performance Optimizations**
- Delta time calculations for frame-independent movement
- Capped delta time to prevent spiral of death
- Efficient particle cleanup (splice from end)
- DPR-aware canvas scaling

### **Game Design Patterns**
- **Module Pattern**: ES6 modules with clear exports
- **State Machine**: Clean game state transitions
- **Observer Pattern**: Event-based UI updates
- **Separation of Concerns**: Distinct responsibilities per module

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
    ├── canvas.js       # Canvas setup
    └── utils.js        # Utilities
```
