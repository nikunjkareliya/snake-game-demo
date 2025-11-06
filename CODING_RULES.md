# Web Game Development - Coding Rules & Best Practices

## 🏗️ Architecture & Design Principles

### Module Organization
- **One responsibility per module** - Each file should handle a single domain (e.g., `input.js` only handles input, `render.js` only renders)
- **Clear module boundaries** - Modules communicate through well-defined imports/exports, never through global variables
- **Dependency flow** - State flows downward, events flow upward. Avoid circular dependencies between modules
- **Feature-based separation** - Group related functionality (e.g., `food.js` handles food spawn, collision, and effects)
- **Shared configuration centralization** - All game constants live in `config.js` as named exports

### Single Responsibility Principle (SRP)
- **One function, one job** - Functions like `stepSnake()` should only advance snake position, not handle rendering or UI updates
- **Separate data from behavior** - Keep game state in `state.js`, keep game logic in separate modules
- **UI and game logic separation** - UI updates (`ui.js`) never manipulate game state directly; use event dispatching
- **Rendering is pure** - Render functions receive state and draw, never mutate state
- **Input handling isolation** - Input module translates user actions to game commands, doesn't execute game logic

### DRY (Don't Repeat Yourself)
- **Extract common calculations** - If you calculate `x * CELL_SIZE + CELL_SIZE / 2` more than once, create a utility function
- **Reusable particle systems** - Use generic particle creation functions with parameters instead of duplicating particle code
- **Shared animation logic** - Extract timing, easing, and interpolation into utility functions
- **Configuration reuse** - Define colors, sizes, and durations once in config, reference everywhere
- **Template particle structures** - Create particle factory functions with default properties

### SSOT (Single Source of Truth)
- **One state object** - All game state lives in the exported `state` object from `state.js`
- **No duplicate state** - Never store the same value in multiple places (e.g., don't cache score in UI and state)
- **LocalStorage sync** - Persistent data like high score and currency only read on init, written on changes
- **Computed values** - Derive values like snake length from `state.snake.length`, don't store separately
- **Canvas as render target only** - Canvas never stores game state, only displays it

---

## ⚡ Web Game Performance Optimization

### Canvas Performance
- **Single canvas when possible** - Avoid multiple layered canvases unless absolutely necessary for performance
- **Batch draw calls** - Group similar rendering operations (all particles in one pass, all snake segments in one pass)
- **Avoid save/restore overhead** - Minimize `ctx.save()` and `ctx.restore()` calls; reset transforms manually if faster
- **Pre-calculate static values** - Calculate `CELL_SIZE`, `DPR`, grid dimensions once at module load, not per frame
- **Use integer coordinates** - Canvas performs better with whole pixel coordinates; use `Math.round()` for positions

### Memory Management
- **Object pooling for particles** - Reuse particle objects instead of creating/destroying constantly
- **Limit array operations** - Use array methods wisely; `splice()` in loops can be expensive, iterate backwards when removing
- **Clear unused listeners** - Remove event listeners when no longer needed (game over, pause, etc.)
- **Manage particle lifetime** - Cap max particles (e.g., 200) to prevent memory bloat
- **Avoid memory leaks** - Clear intervals, remove event listeners, cancel animation frames on cleanup

### Frame Rate Optimization
- **requestAnimationFrame only** - Never use `setInterval` for game loops; use `requestAnimationFrame` for 60fps sync
- **Delta time (dt) based updates** - Always multiply velocities and animations by `dt` for frame-rate independence
- **Tick rate separation** - Separate logic updates (fixed tick rate) from rendering (variable frame rate)
- **Cap delta time** - Prevent spiral of death: `Math.min(0.033, dt)` prevents huge jumps when tab unfocused
- **Early exit rendering** - Skip expensive effects when not visible or far off-screen

### Asset Optimization
- **Lazy load assets** - Load fonts, images only when needed, not all at page load
- **Use web fonts sparingly** - Limit custom font usage; `font-display: swap` to prevent render blocking
- **SVG for UI, Canvas for game** - Use DOM/SVG for static UI elements, Canvas only for animated game content
- **Preload critical assets** - Use `<link rel="preconnect">` for external resources like Google Fonts
- **Minimize HTTP requests** - Bundle game code, inline small assets

---

## 🎨 Clean Code Best Practices

### Code Readability
- **Descriptive names over comments** - `calculateSnakeHeadPosition()` is better than `calc() // gets head pos`
- **Avoid magic numbers** - Use named constants: `DEATH_ANIMATION_DURATION` instead of `0.8`
- **Short functions** - Keep functions under 30 lines; if longer, extract helper functions
- **Guard clauses first** - Check error conditions early and return/exit: `if (!isValid) return;`
- **Consistent formatting** - Use Prettier or consistent spacing; 2-space indentation for JS

### Function Design
- **Pure functions preferred** - Functions that don't modify external state are easier to test and reason about
- **Limit parameters** - Max 3-4 parameters; if more needed, use an options object
- **Return early** - Avoid deep nesting; use early returns for error cases
- **Single exit point when clear** - For simple calculations, single return at end is cleaner
- **Avoid side effects in getters** - Functions named `get*` or `calculate*` should not mutate state

### Code Organization
- **Group related code** - Keep initialization, update, and cleanup logic together
- **Logical ordering** - Put public functions before private helpers, exports at bottom
- **Consistent module structure** - Imports → Constants → Functions → Exports
- **Extract complex conditions** - `const isColliding = checkWallCollision() || checkSelfCollision()`
- **Avoid deep nesting** - Max 3-4 levels; extract nested logic into named functions

---

## 📝 Naming Convention Best Practices

### Variables
- **camelCase for variables** - `currentScore`, `playerPosition`, `isGameActive`
- **Descriptive and specific** - `snakeHeadX` not `x`, `foodSpawnTimer` not `timer`
- **Boolean prefixes** - Use `is`, `has`, `should`, `can`: `isAlive`, `hasCollided`, `shouldRender`
- **Plural for collections** - `particles`, `snakeSegments`, `foodItems`
- **Avoid abbreviations** - `velocity` not `vel`, `direction` not `dir` (unless widely accepted like `ctx`, `dt`)

### Functions
- **Verb-first naming** - `calculateDistance()`, `updateParticles()`, `renderSnake()`
- **Action verbs** - `create`, `update`, `render`, `spawn`, `check`, `handle`, `toggle`
- **Specific actions** - `spawnFood()` not `makeFood()`, `stepSnake()` not `moveSnake()`
- **Boolean returns** - `checkCollision()`, `isOutOfBounds()`, `canMove()`
- **Event handlers** - Prefix with `on` or `handle`: `onKeyPress()`, `handleGameOver()`

### Constants
- **UPPER_SNAKE_CASE for config** - `CELL_SIZE`, `MAX_PARTICLES`, `DEATH_ANIMATION_DURATION`
- **PascalCase for enums** - `Direction.Up`, `GameState.Playing`, `ParticleShape.Circle`
- **Descriptive constant names** - `CANVAS_WIDTH` not `W`, `GRID_COLUMNS` not `COLS`
- **Group related constants** - Use objects for namespacing: `Direction.Up` vs `UP_DIRECTION`
- **CSS constants** - Prefix UI-related constants: `CSS_WIDTH`, `UI_ANIMATION_DURATION`

### Files & Modules
- **Lowercase with hyphens** - `snake-game.js`, `particle-system.js` (or camelCase: `snakeGame.js`)
- **Feature-based names** - `food.js`, `death.js`, `render.js` describe what they do
- **Avoid generic names** - `helpers.js` is bad, `collision-helpers.js` is better
- **Singular for single entity** - `snake.js` not `snakes.js` (unless managing multiple)
- **Keep names short** - `render.js` not `rendering-engine.js`

### Classes & Objects
- **PascalCase for classes** - `ParticleEmitter`, `SnakeController`, `GameLoop`
- **Meaningful names** - `FoodSpawner` not `FoodThing`, `CollisionDetector` not `CollisionChecker`
- **Avoid generic suffixes** - Don't end everything with `Manager` or `Handler` unless truly managing/handling
- **State objects** - Use descriptive names: `gameState`, `playerState`, not just `data`

---

## 🛡️ Error Handling Best Practices

### Validation
- **Validate at boundaries** - Check function parameters at entry point before processing
- **Type checking** - Use `typeof` checks for critical parameters in vanilla JS
- **Range validation** - Ensure values are within expected bounds: `if (x < 0 || x >= COLUMNS) return;`
- **Null/undefined checks** - Guard against missing data: `if (!state.snake?.length) return;`
- **Array bounds** - Check array lengths before accessing: `if (particles.length > 0)`

### Error Recovery
- **Graceful degradation** - If high-DPI fails, fall back to standard resolution
- **Default values** - Use logical defaults: `localStorage.getItem('score') || '0'`
- **Reset on critical error** - If game state corrupts, offer "Reset Game" rather than crashing
- **Try-catch for risky operations** - Wrap localStorage, external API calls in try-catch
- **User-friendly messages** - Show "Oops! Something went wrong" not raw error messages

### Debugging & Logging
- **Console methods strategically** - Use `console.warn()` for non-critical issues, `console.error()` for failures
- **Remove debug logs** - Strip `console.log()` from production code or use a debug flag
- **Descriptive error messages** - Include context: `console.error('Failed to spawn food: grid full')`
- **Assert critical assumptions** - Check preconditions in development: `if (DEBUG && !state.food) throw Error(...)`
- **State inspection tools** - Add debug mode to visualize collision boxes, grid cells

### Edge Cases
- **Handle tab blur** - Pause game or cap delta time when user switches tabs
- **Window resize** - Recalculate canvas dimensions if window size changes (or disable resize)
- **Empty states** - Handle zero-length snake, no food, empty particle arrays
- **Rapid input** - Debounce or queue inputs to prevent opposite direction in same tick
- **LocalStorage limits** - Check if localStorage is available and not full

### Game-Specific Guards
- **Prevent opposite directions** - Snake can't go from Up to Down in one move
- **Boundary checks before movement** - Validate next position before moving snake
- **Collision detection ordering** - Check walls first, then self-collision, then food
- **State machine validation** - Ensure actions only happen in valid states (can't pause from 'init')
- **Animation timer guards** - Clamp timers to prevent negative values: `Math.max(0, timer - dt)`

---

## 🎮 Web-Specific Game Development

### Browser APIs
- **Use Web APIs directly** - No need for Unity-style wrappers; use Canvas, requestAnimationFrame directly
- **Leverage DOM for UI** - Use HTML/CSS for menus, overlays, HUD; Canvas only for game world
- **LocalStorage for persistence** - Save high scores, settings locally; no need for cloud unless multiplayer
- **Custom events for communication** - Use `dispatchEvent` for decoupled module communication
- **Viewport meta tag** - Set `viewport` for proper mobile scaling

### Mobile Considerations
- **Touch input support** - Implement touch/swipe alongside keyboard (not in this codebase yet)
- **Responsive canvas sizing** - Use CSS to scale canvas, adjust game grid based on screen size
- **Performance budgets** - Mobile devices have less power; test on target devices
- **Battery considerations** - Provide "low performance mode" or pause when battery low
- **Prevent scroll** - `preventDefault()` on arrow keys/swipe to prevent page scroll

### Progressive Enhancement
- **Core gameplay first** - Ensure game works without advanced features, add polish incrementally
- **Fallback rendering** - If WebGL unavailable, fall back to Canvas 2D
- **Feature detection** - Check for localStorage, requestAnimationFrame support before using
- **Accessibility basics** - Keyboard controls, high contrast mode, screen reader labels where possible
- **No hard dependencies** - Game should run without external CDN resources if fonts don't load

### State Management
- **Immutable updates preferred** - Create new objects instead of mutating: `[...state.snake]`
- **Clear state transitions** - Use state machine pattern: `init → playing → dying → gameover`
- **Event-driven architecture** - Components listen for events rather than polling state
- **Undo/replay capability** - Store state history for debugging or replay features
- **Serialize state** - Ensure state can be JSON.stringify'd for save/load

---

## 🔧 Code Quality Maintenance

### Testing
- **Unit test pure functions** - Test utility functions, collision detection, calculations
- **Integration test game loop** - Ensure game states transition correctly
- **Visual regression tests** - Screenshot comparison for rendering changes
- **Performance benchmarks** - Track FPS, memory usage over time
- **Edge case tests** - Test boundary conditions: snake at wall, grid full, rapid input

### Documentation
- **JSDoc for public APIs** - Document exported functions with parameters and return types
- **README for setup** - Clear instructions to run game locally
- **Architecture diagram** - Simple diagram showing module relationships
- **Inline comments for complex logic** - Explain why, not what: "Clamp dt to prevent physics explosion"
- **Changelog for features** - Track major changes, especially breaking ones

### Code Reviews
- **Check state mutations** - Ensure state only modified in appropriate places
- **Performance impact** - Flag expensive operations in hot paths (game loop)
- **Naming consistency** - Verify naming follows conventions
- **Module boundaries** - Ensure no circular dependencies or tight coupling
- **Error handling** - Verify edge cases covered

### Refactoring Triggers
- **Duplication across 3+ places** - Extract into shared utility
- **Function over 30 lines** - Break into smaller pieces
- **File over 300 lines** - Split into focused modules
- **Hard-coded values** - Move to configuration
- **Complex conditional** - Extract into well-named function

---

## 🚀 Performance Profiling

### Monitoring
- **FPS counter in debug mode** - Display current FPS to catch performance drops
- **Chrome DevTools Performance tab** - Profile game loop to find bottlenecks
- **Memory snapshots** - Check for leaks using heap snapshots
- **Timeline recording** - Record full gameplay session to analyze frame times
- **Slow-motion mode** - Add debug mode to run game at 0.1x speed for analysis

### Optimization Priorities
1. **Game loop** - Most critical; every millisecond counts
2. **Rendering** - Second most important; optimize draw calls
3. **Input handling** - Must be responsive; debounce/throttle if needed
4. **Particle systems** - Can be expensive; implement culling and pooling
5. **UI updates** - Lowest priority; update only when values change

---

## 📋 Pre-Commit Checklist

- [ ] No `console.log()` statements left in code
- [ ] All constants moved to `config.js`
- [ ] No magic numbers or undocumented abbreviations
- [ ] Functions under 30 lines with single responsibility
- [ ] State only modified through designated functions
- [ ] Error handling for edge cases added
- [ ] Canvas performance: no unnecessary save/restore calls
- [ ] Delta time (dt) used for all animations
- [ ] Module imports/exports properly defined
- [ ] No global variables created
- [ ] LocalStorage updates wrapped in try-catch
- [ ] Naming conventions followed consistently
- [ ] Comments explain "why" not "what"
- [ ] No duplicate code across 3+ locations

---

## 🎯 Quick Reference: Common Patterns

### Creating New Features
```javascript
// ✅ GOOD: Feature module with clear exports
export function spawnPowerUp() {
  // Validation
  if (state.gameState !== 'playing') return;
  
  // Logic
  const pos = findEmptyCell();
  state.powerUp = { ...pos, type: 'speed' };
  
  // Effects
  createSpawnEffect(pos);
}
```

### State Updates
```javascript
// ✅ GOOD: Single source of truth
state.score += points;
updateUI(); // UI reads from state

// ❌ BAD: Duplicate state
state.score += points;
scoreDisplay.textContent = state.score; // UI stores value
```

### Event Handling
```javascript
// ✅ GOOD: Decoupled event dispatch
document.dispatchEvent(new CustomEvent('foodEaten', { 
  detail: { position, points } 
}));

// ❌ BAD: Direct function calls across modules
ui.showFoodEatenEffect(position); // Tight coupling
```

### Animation
```javascript
// ✅ GOOD: Delta time based
particle.x += particle.velocity * dt;

// ❌ BAD: Frame-dependent
particle.x += particle.velocity; // Broken at different frame rates
```

---

**Remember:** These rules are guidelines, not laws. Use judgment. When breaking a rule, document why with a comment. The goal is maintainable, performant web games that are fun to build and play.
