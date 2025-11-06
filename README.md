# Neon Snake

A neon-styled Snake game for the web. Built with HTML5 Canvas, CSS, and vanilla JavaScript.

## 🎮 Play Online

**Live Demo**: [Play Neon Snake](https://nikunjkareliya.github.io/snake-game-demo/)

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
- Neon visual effects and smooth animations

---

## 🏗️ Architecture & Module Analysis

This project follows a modular architecture with clear separation of concerns. The codebase is organized into 12 distinct modules, each responsible for specific functionality.

### 📁 Module Overview

#### **1. `main.js` - Application Entry Point & Game Loop**
**Responsibilities:**
- Initializes the game by setting up input handlers and UI
- Implements the main game loop using `requestAnimationFrame`
- Manages frame timing with delta time calculations (capped at 33ms)
- Orchestrates all game systems in the correct order:
  - Updates particles and ambient effects
  - Updates timers (mouth animation, hit shake)
  - Steps snake movement when playing
  - Handles death sequence timing
  - Triggers rendering each frame

**Key Functions:**
- `tick(now)` - Main game loop that runs continuously

**Dependencies:** All other modules

---

#### **2. `config.js` - Game Configuration & Constants**
**Responsibilities:**
- Defines all game constants and configuration values
- Canvas dimensions (1024x768) and device pixel ratio
- Grid system (32x32 cells, 32x24 rows/columns)
- Direction enum (Up, Down, Left, Right)
- Visual settings (colors, radii, animations)
- Feature flags (spline smoothing, mouth animation duration)

**Exports:**
- Canvas dimensions: `CSS_WIDTH`, `CSS_HEIGHT`, `DPR`
- Grid: `CELL_SIZE`, `COLUMNS`, `ROWS`
- Direction enum
- Visual constants: `COLOR_A`, `COLOR_B`, `BODY_RADIUS`, `HEAD_RADIUS`
- Feature toggles: `USE_SPLINE_SMOOTHING`, `MOUTH_ANIM_DURATION`

**Dependencies:** None (pure configuration)

---

#### **3. `state.js` - Global Game State Manager**
**Responsibilities:**
- Centralized state management for the entire application
- Manages game state machine (init, playing, paused, dying, gameover)
- Tracks score, high score, and currency (persisted to localStorage)
- Maintains snake position, direction, and food location
- Stores visual state (particles, timers for animations)
- Handles skin customization

**State Properties:**
- Game flow: `gameState`, `speedMs`, timing variables
- Scoring: `score`, `highScore`, `currency`
- Entities: `snake[]`, `food`, `direction`, `nextDirection`
- Visual effects: `particles[]`, `currentSkin`, animation timers
- Performance: `lastTickAt`, `lastFrameAt`, `elapsedSec`

**Dependencies:** `config.js`

---

#### **4. `game.js` - Core Game Logic Controller**
**Responsibilities:**
- Manages game lifecycle (reset, start, pause, game over)
- Initializes snake starting position (center of grid, 3 segments)
- Handles game state transitions
- Calculates currency earned (score / 10)
- Triggers game over modal with appropriate messages

**Key Functions:**
- `resetGame()` - Resets all game state to initial values
- `startGame()` - Starts a new game session
- `togglePause()` - Pauses/resumes gameplay
- `finalizeGameOver()` - Handles end-game logic and UI display

**Dependencies:** `state.js`, `config.js`, `food.js`

---

#### **5. `snake.js` - Snake Entity & Movement Logic**
**Responsibilities:**
- Handles snake movement and physics
- Collision detection (walls, self, food)
- Growth mechanics when eating food
- Particle system management
- Visual effects (eating animation, death explosion)

**Key Functions:**
- `stepSnake()` - Moves snake one step in current direction
- `updateParticles(dt)` - Updates all particle positions and lifetimes
- `createEatEffect(pos)` - Spawns 8 particles when eating food
- `createSnakeDeathEffect()` - Creates explosion effect on death

**Collision Detection:**
- Wall collision: Checks if next position is outside grid bounds
- Self collision: Checks if head collides with body segments
- Food collision: Checks if head reaches food position

**Dependencies:** `state.js`, `config.js`, `death.js`, `food.js`

---

#### **6. `food.js` - Food Entity Management**
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
- Alternating cyan/magenta colors

**Dependencies:** `state.js`, `config.js`, `utils.js`

---

#### **7. `death.js` - Death Sequence Handler**
**Responsibilities:**
- Initiates death animation sequence
- Manages currency rewards calculation
- Updates high score if beaten
- Persists scores to localStorage
- Creates death particle explosion

**Key Functions:**
- `startDeathSequence()` - Triggers 1-second death animation
- `createSnakeDeathEffect()` - Spawns 6 particles per snake segment

**Death Flow:**
1. Sets game state to 'dying'
2. Calculates currency earned (score / 10)
3. Updates and saves high score if necessary
4. Creates particle explosion
5. Clears snake array
6. Sets timers for death animation (1.0s) and screen shake (0.5s)

**Dependencies:** `state.js`, `config.js`

---

#### **8. `render.js` - Canvas Rendering Engine**
**Responsibilities:**
- All canvas drawing operations
- Implements advanced visual effects
- Snake rendering with smooth spline interpolation
- Gradient effects, glows, and neon styling
- Multi-layered rendering (glow → base → shine)

**Key Functions:**
- `drawWorld()` - Main render function (exported)
- `drawGrid()` - Renders subtle background grid
- `drawSnake()` - Complex snake rendering with segments
- `drawSnakeHead(head, nx, ny)` - Detailed head with eyes, pupils, mouth, tongue
- `drawFood()` - Glowing food with radial gradients
- `drawParticles()` - Renders all particles with glow effects
- `drawVignette()` - Adds dark vignette around edges
- `beginSmoothPath(points, tension)` - Catmull-Rom spline smoothing

**Rendering Features:**
- **Spline Smoothing**: Bezier curves for smooth snake body
- **Animated Eyes**: Eyes with pupils that follow movement direction
- **Mouth Animation**: Opens/closes with tongue flicking when eating
- **Multi-layer Body**: Glow layer + gradient base + white shine highlight
- **Particle Effects**: Additive blending for light bloom
- **Directional Head**: Head orientation follows movement

**Dependencies:** `state.js`, `canvas.js`, `config.js`

---

#### **9. `input.js` - Input Handler**
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

#### **10. `ui.js` - User Interface Manager**
**Responsibilities:**
- Manages overlay system (lobby, game over, how-to-play)
- Updates HUD elements (score, high score)
- Handles menu interactions
- Dynamic DOM generation for different screens
- Focus management for keyboard input

**Key Functions:**
- `showLobby(startGame, hideOverlay)` - Displays main menu with stats
- `showOverlay(title, subtitle, buttonText, onButtonClick)` - Generic overlay
- `updateStats()` - Updates all score displays
- `hideOverlay()` - Hides overlay and focuses canvas

**UI Elements:**
- Lobby screen with Play/Customize/Settings buttons
- Stats display (high score, currency)
- Game over modal with currency earned
- Controls reference
- How to Play information screen

**Dependencies:** `state.js`, `canvas.js`

---

#### **11. `canvas.js` - Canvas Initialization**
**Responsibilities:**
- Canvas element acquisition and setup
- High DPI (Retina) display support
- Context configuration
- Focus management for keyboard events

**Exports:**
- `canvas` - The canvas DOM element
- `ctx` - The 2D rendering context

**Setup:**
- Applies device pixel ratio scaling for sharp rendering
- Sets canvas as focusable (tabindex="0")
- Auto-focuses canvas for immediate input

**Dependencies:** `config.js`

---

#### **12. `utils.js` - Utility Functions**
**Responsibilities:**
- Common helper functions
- Math utilities
- Color manipulation

**Exported Functions:**
- `clamp(value, min, max)` - Constrains value to range
- `randomInt(min, max)` - Random integer in range (inclusive)
- `hypot(x, y)` - Pythagorean distance calculation
- `applyAlphaToColor(color, alpha)` - Color transparency helper
- `hexToRgb(hex)` - Hex to RGB conversion (internal)

**Dependencies:** None

---

## 🔄 Data Flow

```
User Input → input.js → state.js
                            ↓
main.js (Game Loop) ← game.js ← snake.js → food.js
        ↓                              ↓
    render.js → canvas.js          death.js
        ↓
    ui.js (HUD Updates)
```

---

## 🎨 Technical Highlights

### **Visual Effects System**
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
1. **🐛 Fix Missing Export Bug**: `render.js` exports `drawWorld()` but `main.js` imports `render()` - needs alias or rename
2. **⚙️ Implement Settings Menu**: Currently logs to console, needs actual functionality
3. **🎨 Implement Customization System**: Snake skins/colors with currency-based unlocks
4. **📱 Mobile Controls**: Touch-based directional controls for mobile devices
5. **🔊 Add Sound Effects**: Eating, collision, background music using Web Audio API

### **Medium Priority**
6. **🏆 Add Leaderboard**: Local or online leaderboard system
7. **⚡ Power-ups**: Speed boost, invincibility, score multiplier
8. **🎯 Level System**: Progressive difficulty with obstacles and level themes
9. **🌈 More Visual Effects**: Trail effects, screen shake on collision, combo animations
10. **📊 Statistics Tracking**: Games played, total score, average score, longest snake

### **Low Priority**
11. **🎮 Game Modes**: Time attack, survival, multiplayer, endless
12. **🏪 Shop System**: Use currency to buy skins, power-ups, themes
13. **🎓 Tutorial System**: Interactive first-time user tutorial
14. **♿ Accessibility**: Keyboard navigation, screen reader support, colorblind modes
15. **🔧 Developer Mode**: Debug overlay with FPS, collision boxes, state inspector

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
    ├── config.js       # Constants
    ├── state.js        # State management
    ├── game.js         # Game logic
    ├── snake.js        # Snake entity
    ├── food.js         # Food entity
    ├── death.js        # Death handling
    ├── render.js       # Rendering engine
    ├── input.js        # Input handling
    ├── ui.js           # UI management
    ├── canvas.js       # Canvas setup
    └── utils.js        # Utilities
```
