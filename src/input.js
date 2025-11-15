import { state } from './state.js';
import { Direction } from './config.js';
import { spawnStaticHazard } from './hazards.js';

const keyMap = new Map([
  ['ArrowUp', Direction.Up],
  ['KeyW', Direction.Up],
  ['w', Direction.Up],
  ['W', Direction.Up],
  ['ArrowDown', Direction.Down],
  ['KeyS', Direction.Down],
  ['s', Direction.Down],
  ['S', Direction.Down],
  ['ArrowLeft', Direction.Left],
  ['KeyA', Direction.Left],
  ['a', Direction.Left],
  ['A', Direction.Left],
  ['ArrowRight', Direction.Right],
  ['KeyD', Direction.Right],
  ['d', Direction.Right],
  ['D', Direction.Right],
]);

function areOppositeDirections(a, b) {
  return (
    (a === Direction.Up && b === Direction.Down) ||
    (a === Direction.Down && b === Direction.Up) ||
    (a === Direction.Left && b === Direction.Right) ||
    (a === Direction.Right && b === Direction.Left)
  );
}

export function initInput(onStartGame, onTogglePause) {
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      onTogglePause();
      e.preventDefault();
      return;
    }

    if (e.code === 'KeyR') {
      onStartGame();
      e.preventDefault();
      return;
    }

    // Testing hotkey: H to spawn hazard (only during gameplay)
    if (e.code === 'KeyH' && state.gameState === 'playing') {
      spawnStaticHazard();
      e.preventDefault();
      return;
    }

    const newDir = keyMap.get(e.code);
    if (!newDir) return;

    if (!areOppositeDirections(state.direction, newDir)) {
      state.nextDirection = newDir;
    }
    e.preventDefault();
  });
}