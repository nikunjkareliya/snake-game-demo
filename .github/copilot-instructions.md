# GitHub Copilot Instructions for Snake Game

## Project Context
This is a vanilla JavaScript snake game built with Canvas API, following strict architectural principles and web game best practices.

## Core Principles

### Architecture
- **One responsibility per module** - Each file handles a single domain (e.g., `input.js` only handles input)
- **No circular dependencies** - State flows downward, events flow upward
- **Single Source of Truth** - All game state lives in `state.js`, never duplicate state
- **Clear module boundaries** - Communicate through well-defined imports/exports, never global variables

### Code Organization
- **Keep functions under 30 lines** - Extract complex logic into well-named helper functions
- **Pure functions preferred** - Avoid side effects when possible
- **Guard clauses first** - Check error conditions early and return
- **No magic numbers** - All constants must be defined in `config.js` with UPPER_SNAKE_CASE

### Performance
- **Use requestAnimationFrame only** - Never `setInterval` for game loops
- **Delta time (dt) for animations** - Always multiply by `dt` for frame-rate independence
- **Batch canvas operations** - Group similar rendering operations together
- **Avoid unnecessary save/restore** - Minimize `ctx.save()` and `ctx.restore()` calls
- **Object pooling for particles** - Reuse objects instead of creating/destroying

## Naming Conventions

### Variables
- **camelCase** - `currentScore`, `playerPosition`, `isGameActive`
- **Boolean prefixes** - `is`, `has`, `should`, `can` (e.g., `isAlive`, `hasCollided`)
- **Plural for collections** - `particles`, `snakeSegments`, `foodItems`
- **Descriptive names** - `snakeHeadX` not `x`, `foodSpawnTimer` not `timer`

### Functions
- **Verb-first naming** - `calculateDistance()`, `updateParticles()`, `renderSnake()`
- **Boolean returns** - `checkCollision()`, `isOutOfBounds()`, `canMove()`
- **Event handlers** - Prefix with `on` or `handle`: `onKeyPress()`, `handleGameOver()`

### Constants
- **UPPER_SNAKE_CASE** - `CELL_SIZE`, `MAX_PARTICLES`, `DEATH_ANIMATION_DURATION`
- **Define in config.js** - All game constants must be in the config file

## Module Structure

### Standard Import/Export Pattern
```javascript
// Imports at top
import { state } from './state.js';
import { CONSTANT_NAME } from './config.js';

// Private functions (not exported)
function helperFunction() { }

// Public functions (exported)
export function mainFunction() { }
```

### State Management
- **Never mutate state outside state.js** - Read from state, but don't modify directly
- **Use event dispatching** - For cross-module communication use CustomEvents
- **Immutable updates preferred** - Create new objects: `[...state.snake]`

## Canvas & Rendering

### Rendering Rules
- **Rendering is pure** - Render functions receive state and draw, never mutate state
- **Use integer coordinates** - `Math.round()` positions for better performance
- **Batch similar operations** - Draw all particles in one pass, all segments in one pass
- **Pre-calculate static values** - Calculate dimensions once at module load

### Animation Pattern
```javascript
// Always use delta time (dt)
function updateAnimation(dt) {
  particle.x += particle.velocity * dt;
  timer = Math.max(0, timer - dt); // Clamp to prevent negative
}
```

## Error Handling

### Validation
- **Validate at boundaries** - Check function parameters at entry
- **Guard against null/undefined** - Use optional chaining: `state.snake?.length`
- **Range validation** - Ensure values are within bounds
- **Wrap risky operations** - Try-catch for localStorage, external APIs

### Game-Specific Guards
- **Prevent opposite directions** - Snake can't reverse instantly
- **Boundary checks before movement** - Validate next position first
- **State machine validation** - Actions only in valid states

## Code Quality

### What to Include
- **JSDoc for exported functions** - Document parameters and return types
- **Comments explain "why"** - Not "what" (code should be self-documenting)
- **Descriptive names over comments** - Good naming reduces need for comments

### What to Avoid
- **console.log()** - Remove debug logs before committing
- **Duplicate code** - Extract into shared utilities after 3 uses
- **Generic names** - No `data`, `temp`, `val`, `x` without context
- **Deep nesting** - Max 3-4 levels, extract nested logic into functions
- **Side effects in getters** - Functions named `get*` or `calculate*` shouldn't mutate

## Common Patterns

### Feature Implementation
```javascript
export function spawnNewFeature() {
  // 1. Validation
  if (state.gameState !== 'playing') return;
  
  // 2. Logic
  const position = calculatePosition();
  state.feature = { ...position, active: true };
  
  // 3. Effects (dispatch event, don't call directly)
  document.dispatchEvent(new CustomEvent('featureSpawned', { 
    detail: { position } 
  }));
}
```

### Event Handling
```javascript
// Listen for events from other modules
document.addEventListener('gameEvent', (e) => {
  const { detail } = e;
  handleEvent(detail);
});
```

## Quick Checks Before Suggesting Code

- [ ] Is there a constant that should be in `config.js`?
- [ ] Does this function do only one thing?
- [ ] Am I using `dt` for time-based animations?
- [ ] Are variable/function names descriptive and follow conventions?
- [ ] Is state being modified only through proper channels?
- [ ] Are there any magic numbers that need naming?
- [ ] Is this code DRY (no duplication)?
- [ ] Would this work at different frame rates?

## Examples of Good vs Bad

### ❌ BAD
```javascript
// Magic number, mutates state directly, no dt
function move() {
  state.snake[0].x += 20;
}
```

### ✅ GOOD
```javascript
// Named constant, pure calculation, uses dt
import { CELL_SIZE } from './config.js';

function calculateNextPosition(currentPos, velocity, dt) {
  return currentPos + velocity * CELL_SIZE * dt;
}
```

---

**When suggesting code, always follow these principles and patterns. The goal is maintainable, performant web games that follow best practices.**
