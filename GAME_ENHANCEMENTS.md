# Game Enhancements — Snake Frenzy

This document captures the proposed extensions to the core prototype to increase retention, deepen gameplay, and refine scoring. The ideas here are scoped to the existing vanilla JS + Canvas codebase and prioritize cosmetic, low-risk mechanical depth that can be implemented incrementally.

## 1. Core Gameplay Enhancements (Depth Without Bloat)

Goal: Add layered decision-making and micro-skill expression while keeping input model (direction only) simple.

### A. Momentum & Flow Band
- Mechanic: Maintain a “flow” state by eating within a moving time window (e.g., next food within 6.5s). Streak raises a Flow Tier (T1–T4).
- Effects: Each tier slightly brightens snake glow + subtle trail lengthening (pure cosmetic) and grants small score multiplier (e.g., +5%, +12%, +20%, +30%).
- Risk: Timer pressure forces riskier routing; dropping flow causes visual “fizzle”.
- Implementation: Add `flowTimer`, `flowTier` to `state.js`. Update each eat; decay on timeout. Render accent border in `render.js`.

### B. Grazing (Near-Miss Reward)
- Mechanic: Passing within 1 cell of own body or walls at speed increments a Graze Meter; repeated safe grazes trigger “precision bonus”.
- Effects: +Bonus score chunk (scaled by current length) and a sharp shimmer effect.
- Implementation: During movement step, calculate min distance to nearest non-head segment and boundaries; if within threshold and no collision → increment.

### C. Path Efficiency Multiplier
- Mechanic: Penalize inefficient wandering; reward purposeful routing. Track “waste moves”—moves that don’t reduce Manhattan distance to food. Efficient streak ups a multiplier; inefficiency resets.
- Effect: Encourages planning rather than aimless circling, creating higher ceiling for skill.
- Implementation: At each move, compare (oldDist - newDist); if >=0 treat as efficient. Use small window (last 15 moves) to compute efficiency ratio.

### D. Dynamic Pacing Pulses
- Mechanic: Every N eats (e.g., 10) trigger a short “pulse phase” (8 seconds) where food spawn rate increases by 1.5x but snake speed rises 10%.
- Effect: Controlled intensity spikes keep runs from feeling flat, create mini-peaks.
- Implementation: `pulseActive` boolean + `pulseTimer`; affect spawn logic in `food.js` and movement speed reading in `game.js`.

### E. Procedural Micro-Targets (Run Injection)
- Mechanic: Occasionally spawn “route token” (a subtle ring or arrow marker) that awards bonus if eaten before regular food, but disappears quickly.
- Effect: Adds opportunistic detours; break monotony.
- Implementation: `token` object in state, spawn odds tied to `flowTier`; render faint pulsing ring; expires after 5s.

---

## 2. Score System v2 (Transparent & Motivating)

Current: Flat +10 per food.

Proposed Formula (per eat):
```
Increment = Base
+ LengthBonus
+ FlowBonus
+ EfficiencyBonus
+ GrazeBonus (conditional)
```

Where:
- `Base = FOOD_VALUE` (config)
- `Length Bonus = floor(length / LENGTH_STEP) * LENGTH_STEP_VALUE`
- `Flow Bonus = Base * FLOW_MULT[flowTier]`
- `Efficiency Bonus = Base * (effStreak >= EFF_THRESHOLD ? EFF_PERCENT : 0)`
- `Graze Bonus = GRAZE_VALUE * (1 + length * 0.02)` (if graze triggered)

### Death Recap Breakdown:
- Base Total
- Flow Multiplier Gains
- Grazes (count × average value)
- Efficiency Streak Peak
- Route Tokens Collected

Config snippet for `gameConfig.js`:
```js
SCORING = {
  FOOD_VALUE: 10,
  LENGTH_STEP: 6,
  LENGTH_STEP_VALUE: 4,
  FLOW_MULT: [1.0, 1.05, 1.12, 1.20, 1.30],
  EFF_THRESHOLD: 8,
  EFF_PERCENT: 0.08,
  GRAZE_BASE: 12,
  TOKEN_VALUE: 25
}
```

State additions in `state.js`:
- `flowTier`, `flowTimer`
- `effStreak`
- `grazeCount`
- `tokenActive`
- `scoreBreakdown` object (session-accumulated)

HUD: compact 3-icon band: Flow tier indicator (bars), Efficiency spark (lit when streak active), Graze counter (small star icon briefly flashing on graze).

---

## 3. Boosters (Low-Risk, Clear Telegraphing)

A. Time Crystal (Extends Flow)
- Spawn: 5% chance instead of food every 20–40s if `flowTier < max`.
- Effect: Adds +2.5s to `flowTimer` (cannot exceed cap).
- Visual: Transparent cyan prism with rotation.

B. Score Node
- Spawn: Rare (1 per 60–90s), appears as pulsating hex. Grants `Base × 5 + length bonus` when eaten.
- Visual: Magenta → cyan alternating border.

C. Trail Stabilizer (Temporary efficiency forgiveness)
- Effect: Next 5 moves ignore efficiency penalty.
- Visual: Floating ring that locks onto snake head when collected; HUD badge countdown.

All boosters despawn after ~12s to encourage decisive action.

---

## 4. Obstacles (Progressive, Optional Mode First)

A. Static Hazard Cells
- Spawn after length > threshold (e.g., >25 segments). 2–4 glowing red tiles; colliding ends run.
- Variation: After pulse phase ends, one hazard cell fades in — telegraph with pre-warn shimmer for 1.5s.

B. Moving Orb (Slow Patrol)
- Small orb travels along predefined short path (horizontal or vertical). Collision = death.
- Encourages timing and route prediction.

C. Shrinking Safe Window (Advanced mode only)
- Periodically highlight outer ring; after countdown, border becomes lethal for 10s, then resets.

Implementation order (risk-ranked):
1. Static hazard cells
2. Moving orb
3. Shrinking window

---

## 5. Technical Integration Plan (Incremental)

Step 1: Data & Config Scaffolding
- Extend `gameConfig.js` with SCORING, FLOW, BOOSTERS, OBSTACLES sections.
- Add new state fields in `state.js`; initialize to defaults.

Step 2: Scoring Hook Refactor
- Replace direct score increment in eat logic with `calculateScoreIncrement(state)` pure helper in `utils.js`.
- Maintain breakdown accumulators.

Step 3: Flow & Efficiency Update
- In movement tick: update efficiency streak.
- On eat: flowTier adjust, length bonus compute, pulse trigger logic.

Step 4: Rendering Cosmetic Feedback
- `render.js`: add `drawFlowAura(flowTier)` applying subtle additive glow proportional to tier.
- Graze shimmer: single-frame overlay near head.

Step 5: HUD Additions
- `ui.js`: extend HUD to include: flow bars (tier count), efficiency spark icon, graze flash.
- Use CSS transitions rather than canvas for HUD components.

Step 6: Booster Spawning
- `food.js`: adapt spawn routine to occasionally queue booster objects into `state.boosters`.
- Rendering: `renderBoosters()` after food draw.
- Collision: integrate into head position check; differentiate by type.

Step 7: Obstacles (Optional Mode Flag)
- Mode toggle in lobby (“Advanced Mode” checkbox).
- If active, obstacle spawn scheduler runs after thresholds.

Step 8: Recap Panel
- Extend Game Over overlay with breakdown top contributors (limit to 3–5 lines).

Step 9: Persistence (Optional)
- Save `bestFlowTier`, `bestEffStreak` in localStorage for mastery nudges.

---

## 6. Acceptance Criteria (Sample)
- Flow System: Tier increases only on successful chained eats within window. Timer decreases to 0 triggers tier reset + visual fade within 300ms.
- Efficiency: Displays spark only when `effStreak ≥ EFF_THRESHOLD`.
- Grazing: Count increments only when distance < threshold and not colliding; shimmer visible ≤180ms.
- Boosters: Never overlap with food; despawn correctly; picking one yields correct effect and HUD feedback.
- Obstacles: Always spawn away from head immediate area (≥3 cells).
- Recap: Numeric sums match in-run cumulative values (unit test with mocked sequence).

---

## 7. Balancing Notes (Initial Values)
- Flow window: 6.5s base; shorten slightly at higher tiers (e.g., tier scaling -0.4s per tier).
- Efficiency threshold: start at 8 consecutive efficient moves.
- Graze distance detection: 1 cell Manhattan.
- Booster odds: tuned so average run sees ~2–3 boosters.

---

## 8. KPI Rationale
- Depth without cognitive overload keeps new players engaged and advanced players with clear improvement goals.
- Skillful play (routing, grazes, efficiency) provides a visible skill ceiling and room to chase better scores.
- Cosmetic-forward rewards (mastery, aura tiers) align with your USP and reduce need for aggressive monetization.

---

### Next steps
- If you want, I can wire the configuration and state scaffolding now (`gameConfig.js`, `state.js`), then implement the scoring helper and HUD placeholders in small, testable increments.

---

*File generated by the design assistant.*

---

## 9. Dynamic Difficulty & Progression (Endless Survival)

Goal: Keep runs engaging over time with smooth, predictable ramps across speed, spawns, obstacles, and scoring pressure—without abrupt spikes. All ramps are capped and telegraphed.

### A. Difficulty Axes
- Snake speed (movement interval shrinks over time and with length)
- Food respawn delay (slightly decreases over time)
- Booster odds (rarity increases over time with a grace period)
- Obstacle density and type (enable after thresholds, then ramp)
- Time-based score multiplier (macro pressure that rewards longevity)
- Optional adaptive assistance (small early-game help if needed)

### B. Config (gameConfig.js)
```js
export const DIFFICULTY = {
  // Speed progression
  speedBaseMs: 120,
  speedMinMs: 65,
  timeSpeedRampStartSec: 45,
  timeSpeedRampIntervalSec: 30,
  timeSpeedRampAmountMs: 3,

  // Length-based secondary ramp
  lengthRampEvery: 10,
  lengthRampAmountMs: 2,
  lengthRampSoftCap: 70,

  // Food spawn pacing
  baseFoodRespawnDelaySec: 0.6,
  minFoodRespawnDelaySec: 0.35,
  foodDelayRampPerMin: -0.04,

  // Booster tuning
  boosterBaseOdds: 0.04,
  boosterMaxOdds: 0.12,
  boosterOddsRampPerMin: 0.01,
  boosterGracePeriodSec: 60,

  // Obstacle schedule
  obstaclesEnableAtSec: 90,
  obstacleFirstHazardCount: 2,
  obstacleHazardRampEverySec: 60,
  obstacleHazardMax: 8,

  // Moving hazards
  movingObEnableAtSec: 180,
  movingObCountStart: 1,
  movingObCountMax: 3,
  movingObRampEverySec: 120,

  // Time-based score multiplier
  timeScoreMultStartSec: 120,
  timeScoreMultMax: 1.35,
  timeScoreMultRampPerMin: 0.05,

  // Flow window (ties into Section 1A)
  flowDecayBaseSec: 6.5,
  flowDecayMinSec: 4.0,
  flowDecayRampPerTier: -0.4,

  // Safety assistance (optional)
  earlyAssistEnableUntilSec: 80,
  assistMinDistanceBuffer: 0
};
```

### C. Formulas (Pure Functions)
- Speed by time/length:
  - If t < start → speed = base
  - ramps = floor((t - start) / interval)
  - lengthBonus = floor(length / lengthRampEvery) * lengthRampAmountMs
  - If length > softCap → lengthBonus *= 0.5
  - speed = max(min, base - ramps * amount - lengthBonus)
- Food delay: delay = max(minDelay, baseDelay + foodDelayRampPerMin * minutes)
- Booster odds: odds = min(maxOdds, baseOdds + rampPerMin * minutes); respect grace period
- Obstacle counts:
  - static = min(max, first + floor((t - enable) / every)) if t ≥ enable else 0
  - moving similar using its thresholds
- Time score multiplier:
  - mult = 1.0 if t < start else min(max, 1.0 + rampPerMin * minutesAfterStart)
- Flow window: clamp(min, base + tier * rampPerTier, base)

### D. State & Hooks
- State additions:
  - `difficulty: { hazardCount, movingObCount, timeScoreMultiplier }`
  - Optional `sessionStats` for telemetry (peaks, totals).
- Update points:
  - On each tick, recompute dynamic speed and multiplier.
  - Food spawn logic uses dynamic delay.
  - Obstacle scheduler consults counts to spawn/despawn safely.

### E. Integration Order
1) Add DIFFICULTY config + helper module (`difficulty.js`).
2) Switch speed and food delay to helpers (no behavior change at first).
3) Enable ramps and caps gradually (playtest values).
4) Add obstacle scheduler gated by “Advanced Mode”.
5) Wire time-based multiplier into scoring helper (Section 2).
6) Telegraph tiers via subtle HUD/border pulses.

### F. Acceptance Notes
- Ramps must feel smooth; verify no frame-to-frame jumps.
- Hazard spawn never near head (≥3 cells).
- Time multiplier capped ≤ 1.35 to prevent runaway scores.

### G. Telemetry (Optional)
- Track `longestRunSec`, `peakTimeMultiplier`, `obstaclesSpawned`, `boostersTaken`.
- Show light mastery nudges post-run.