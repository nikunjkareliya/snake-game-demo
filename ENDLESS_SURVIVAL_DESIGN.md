# Endless Survival Design Plan — Snake Frenzy

---

## ⚠️ IMPLEMENTATION STATUS

**Current Progress: ~35-40% Complete**

This document represents the full design roadmap for the Endless Survival mode. Many features described here are **planned but not yet implemented**.

### ✅ Currently Implemented Features
- **Flow System**: Chain-eating multiplier with 5 tiers (1.0x → 3.0x)
- **Difficulty Progression**: Food-based tier system (0-10 tiers) with speed scaling
- **Coin Economy**: Earn coins during gameplay (+1/food) and on death (score × 0.1)
- **Skin System**: Multiple purchasable skins with unique visual effects
- **Core Gameplay**: Snake movement, food spawning, collision detection, death handling
- **Visual Effects**: Particle system, smooth spline rendering, glow effects
- **UI/UX Enhancements**: Flow progress bar, HUD system, coin flying animation, high score badge

### ❌ Not Yet Implemented
- **ALL Boosters** (0/8 types): Time Crystal, Score Node, Trail Stabilizer, Phase Prism, Phase Distorter, Portal Catalyst, Flow Anchor, Hazard Neutralizer
- **ALL Hazards** (0/11 types): Static hazards, patrol orbs, spiral drones, laser sweeps, portals, crumble cells, shifter zones, ghost snake
- **Tier Script System**: Orchestrated unlock progression per tier
- **Phase Rotation**: Cyclical difficulty phases (Surge/Bloom/Compression)
- **Telegraph System**: Visual/audio warnings for hazards
- **Adaptive Assist**: Death protection and frustration valves
- **Time Multiplier**: Score scaling based on survival duration
- **Advanced Scoring**: Route combos, hazard survival bonuses, booster bonuses

This design document serves as the **north star** for future development. Refer to [README.md](README.md) for accurate documentation of currently implemented features.

---

## Core Premise
Make `difficultyTier` the authoritative pacing dial. Every tier (≈ 60s or milestone-based) adds either:
1. A quantitative ramp (speed, spawn delay, hazard count)
2. A new mechanic variant (booster type, obstacle pattern)
3. An audiovisual escalation (feedback, pressure signaling)

Each addition must: increase strategic tension, raise meaningful decisions, avoid unfair spikes, and reinforce a mastery loop (read → adapt → optimize → anticipate next tier).

**Retention Focus:** A gently compounding web of micro-goals (survive the next tier, collect next booster evolution, master obstruction pattern, chase flow chain, optimize score multiplier) without overwhelming new players at Tier 0–2.

---

## 1. Current Foundations (Gap Analysis)

### Already Have
- Dynamic speed system
- Food respawn pacing
- Future hooks for obstacles/boosters/time multiplier
- HUD tier badge
- Persistent tier start
- Difficulty snapshot with logging

### Missing
- Obstacle scheduler
- Booster taxonomy (currently conceptual)
- Explicit tiered unlock script
- Tension/relief cadence
- Adaptive fairness safeguards
- Score interaction layering
- Escalation telegraphing (sound/VFX/UI pulses)

### Opportunity
Unify Flow, Time Multiplier, Boosters, Hazards under one orchestrated Tier Script so all scaling feels coherent (no "random difficulty soup").

---

## 2. Design Goals

| Goal | Description |
|------|-------------|
| **Clarity** | Player intuitively senses "I advanced" (new color pulse, subtle stinger sound, HUD flash, new hazard telegraph) |
| **Fairness** | Introductions always preceded by a 1–2s soft warning (fade-in shimmer or outline) |
| **Agency** | Boosters offer optional risk (detours through denser zones) but never mandatory for survival |
| **Elastic Replay Value** | Past Tier ~12, system rotates themed "Phase Cycles" (e.g., Hazard Surge → Booster Bloom → Speed Compression) to sustain novelty |
| **Scalable Tuning** | Per-tier definitions data-driven, enabling rapid A/B iteration |

---

## 3. Tier Framework (Baseline Proposal)

**Tier Timing:** Every 60s of `runElapsedSec` (modifiable). Alternate/additive triggers: total food eaten thresholds (e.g., 12, 25, 40) to smooth out low-activity runs.

### Tier Brackets
- **T (0–2):** Onboarding
- **T (3–5):** Expansion (first boosters & static hazards)
- **T (6–8):** Pressure (moving hazards + higher booster depth)
- **T (9–11):** Complex Interactions (pattern hazards, portal targets, "opponent" behaviors)
- **T ≥ 12:** Cyclical Phases (rotating modifier sets every 2 tiers; resets micro-meta)

---

## 4. Per-Tier Unlock Script (Illustrative)

Exact values tune later; focus on sequencing clarity.

| Tier | New / Change | Rationale |
|------|--------------|-----------|
| 0 | Pure core loop only | Learning baseline |
| 1 | Gentle speed nudge, Food delay minor drop | Increase pace subtly |
| 2 | Flow window shrink begins scaling | Nudge engagement with flow system |
| 3 | Static Hazards (2 cells) intro (telegraphed fade-in) | First spatial threat |
| 4 | Booster Type A (Time Crystal) unlock, odds start | Extend flow mastery |
| 5 | Static Hazards target +1; Score multiplier activation threshold reached | Layer reward pressure |
| 6 | Moving Orb (slow patrol) intro | Timing skill test |
| 7 | Booster Type B (Score Node) unlock; hazard spawn spacing tightening | Risk/reward routing |
| 8 | Portal Pair (teleport cells) occasional spawn | Spatial remix / shortcut risk |
| 9 | Opponent Ghost Snake (mirrors last N head moves delayed) | Predictive path planning |
| 10 | Laser Sweep (predictable lane sweep every 20s) | Pattern recognition pressure |
| 11 | Booster Type C (Stabilizer) + hazardous cluster shaping (L-shapes) | Relief tool vs complexity |
| 12+ | Phase Rotation Cycle A: Hazard Surge (extra static + no portals) | Thematic variation |
| 14+ | Phase Rotation Cycle B: Booster Bloom (higher odds, lower new hazards) | Recovery window |
| 16+ | Phase Rotation Cycle C: Speed Compression (speed floor brief reduction) | High-intensity mastery |
| 18+ | Cycle resets (A→B→C…), small global +1% score scaling each full loop | Long-form retention |

---

## 5. Booster Suite (Revamped)

**Principles:** Each booster maps to one cognitive axis: Tempo, Scoring, Safety, Routing, Flow Sustain. Avoid overlap; make effects transparent in HUD with concise icons.

### Booster Types

#### Time Crystal (Tier 4+)
- **Effect:** +X seconds to Flow window (capped)
- **Tier Scaling:** Later tiers add diminishing returns (anti-runaway)
- **Visual:** Transparent cyan prism with rotation
- **Icon:** Clock crystal

#### Score Node (Tier 7+)
- **Effect:** Burst score (Base × 5 + length bonus × tier factor)
- **Tier Scaling:** Later tiers also grant small coin bonus to reinforce economy loop
- **Visual:** Pulsating hex, magenta → cyan alternating border
- **Icon:** Star burst

#### Trail Stabilizer (Tier 11+)
- **Effect:** Efficiency penalty immunity for next N moves
- **Visual:** Tinted trail as feedback, floating ring locks onto head
- **Icon:** Shield with path

#### Phase Prism (Tier 8+)
- **Effect:** Freezes hazard movement for 3s (static hazards glow pale)
- **Visual:** Prismatic cube with energy field
- **Icon:** Frozen hourglass

#### Phase Distorter (Tier 10+)
- **Effect:** Temporarily slows snake base speed ramp tick accumulation by 50% for 6s
- **Purpose:** Reduces cognitive overload in spike phases
- **Visual:** Purple distortion field around snake
- **Icon:** Spiral slow-mo

#### Portal Catalyst (Tier 9+, synergy)
- **Effect:** Converts active portal pair into score tunnels (passing through gives +combo; limited uses)
- **Purpose:** Strategic optional detours
- **Visual:** Portal edges glow gold when active
- **Icon:** Portal with star

#### Flow Anchor (Tier 12+)
- **Effect:** Prevents flow tier from dropping below 1 for 10s
- **Purpose:** Helps salvage near-miss runs, encourages pushing deeper
- **Visual:** Anchor icon floats near head with timer
- **Icon:** Anchor with flow bars

#### Hazard Neutralizer (Tier 9+, Rare)
- **Effect:** Removes one active static hazard (except protected newly spawned)
- **Spawn Odds:** Extremely low; anti-frustration valve
- **Visual:** Red X with dissolve animation on hazard
- **Icon:** Eraser/X mark

### Drop Logic
- **Weighted Distribution:** Array per tier; sum normalized
- **Anti-Streak Boredom:** If no booster spawned in X seconds while odds >0, guarantee next spawn slot (soft pity timer)
- **Conflict Avoidance:** Never spawn booster on hazard or within 2 cells of head
- **Lifetime:** Despawn after ~12s to encourage decisive action

### HUD Feedback
- Booster effect badges with timers (icon + circular decay)
- Active booster glow on snake or HUD corner
- Audio stinger on pickup

---

## 6. Obstacle / Hazard Suite

All hazards must be data-classified for spawn orchestration (type, footprint, lethal policy, movement pattern).

### Static Hazards

#### Basic Hazard Cell (Tier 3+)
- **Type:** Single lethal tile
- **Visual:** Glowing red tile with pulsing border
- **Collision:** Instant death
- **Spawn:** 2–4 cells initially

#### Cluster (Tier 5+)
- **Type:** 2–3 contiguous cells forming L or line
- **Visual:** Connected red blocks with shared glow
- **Collision:** Instant death
- **Spawn:** Gradually increases with tier

#### Crumble Cell (Tier 7+, NEW)
- **Type:** Becomes lethal only after player passes adjacent side twice
- **Visual:** Crack build-up animation (stage 1: hairline, stage 2: deep crack, stage 3: red glow)
- **Purpose:** Adds delayed planning tension
- **Reset:** Never (once lethal, stays lethal)

### Dynamic / Moving Hazards

#### Patrol Orb (Tier 6+)
- **Type:** Moves linear path; reverses at bounds
- **Visual:** Small red orb with trail
- **Speed:** Scales at defined tiers (not per second)
- **Pattern:** Predictable straight line

#### Spiral Drone (Tier 8+, NEW)
- **Type:** Circular motion around a pivot
- **Visual:** Rotating drone with arc trail
- **Pattern:** Predictable orbital path
- **Speed:** Moderate, increases with tier

#### Laser Sweep (Tier 10+)
- **Type:** Telegraph line (1.5s glow) then sweeps
- **Visual:** Red warning line → intense beam during pulse
- **Lethal:** Only during active pulse
- **Pattern:** Predictable lanes (vertical or horizontal)
- **Frequency:** Every 20s

### Spatial Mechanics

#### Portal Pair (Tier 8+)
- **Type:** Enter teleports to exit, preserving direction
- **Visual:** Swirling vortex, matching colors
- **Mechanic:** Minor cooldown after use (0.5s invulnerability)
- **Risk:** Unpredictable exit collisions
- **Spawn:** Occasional (lower odds than boosters)

#### Shifter Zone (Tier 13+, NEW)
- **Type:** Temporarily flickers cells to unsafe state
- **Visual:** Pattern with 1s warning noise/shimmer
- **Lethal:** Only during active pulse
- **Pattern:** Semi-random but low density
- **Purpose:** Anti-complacency without RNG frustration

#### Ghost Snake (Tier 9+)
- **Type:** Semi-transparent path that replicates player input history with latency
- **Visual:** Ghostly trail of player's past ~20 moves
- **Collision:** Lethal
- **Purpose:** Acts as self-created future hazard encouraging route variation
- **Behavior:** Follows exact head positions with 3–5s delay

### Spawn Governance Rules

| Rule | Specification |
|------|---------------|
| **Min Distance from Head** | ≥3 cells for new static; ≥5 for dynamic spawn origin |
| **Max Simultaneous** | Each type scaled by tier script |
| **Despawn Policy** | Highest lifetime hazards pruned first when cap reduces (phase transitions) |
| **Telegraph Requirement** | All new hazard types require 1–2s visual/audio lead time |
| **Fairness Check** | Never spawn in positions that create unavoidable death scenarios |

### Telemetry to Tune
- Average distance between hazards & head at spawn
- Collision causes (which type ends runs most)
- Hazard dodge success rate per type
- Time alive per hazard density tier

---

## 7. Difficulty Curve Mechanics

Use layered curves to avoid synchronous spikes.

### Speed Ramp
- Already time + length hybrid
- **Relief Windows:** Micro-slow relief (~+5ms) just after major hazard unlock tiers to reduce stacked stress (scripted exception)
- **Relief Tiers:** 3, 6, 9, 12 (brief pause before next acceleration)

### Food Delay
- Continue gentle compression
- **Hold Constant:** During Phase B (Booster Bloom) to create a "resource harvest window"

### Hazard Count
- **Stair-Step Growth:** Only on specific tiers (3, 5, 7, 10, 12 with phase gating)
- **Rule:** Never more than one hazard category introduced the same tier as a speed interval drop >5ms

### Time Multiplier
- **Start:** Tier 5
- **Ramp:** Incremental each minute thereafter
- **Cap:** Soft clamp triggers scoreboard messaging ("MAX PRESSURE")
- **Integration:** Ties to tier, not just elapsed time

### Adaptive Assist (Optional)

#### Early Death Protection
- If death occurs ≤ Tier 2 three runs in a row → next run starts with Flow Anchor or mild speed buffer (temporary)

#### High-Tier Frustration Valve
- If two deaths within 30s at high tier with no booster collected → force-spawn a Stabilizer at safe distance

#### Toggle
- Optional hardcore mode disables all assists

---

## 8. Score System Synergy

### Formula Enhancement
```
mult = 1 + baseTierScaling + flowBonus + efficiencyBonus (capped)
```

### Integration Points
- **Booster Score Node:** Should amplify post-mult (reward stacking previous mastery)
- **Portal Catalyst:** Tunnel bonus increments a short "route combo" meter (resets on hazard collision or idle >8s)
- **Hazard Survival:** Small additive per hazard tier survived without death

### Breakdown Categories (Game-Over Recap)
1. Base Score
2. Flow Gains
3. Time Multiplier Contribution
4. Booster Bonuses (by subtype)
5. Route Combos
6. Hazard Survival Bonus
7. Efficiency Streaks

---

## 9. Telemetry & Tuning Hooks

### Capture Per Run
- Tier Reached
- Time in Tier (average)
- Death Cause (hazard type / self / wall)
- Booster Pickup Rate (by type)
- Flow Peak Tier + Average Sustain
- Abandon (pause → exit) at which tier (retention pain points)
- Collision Heatmap (optional grid-based frequency for hazard fairness tuning)

### Initial Implementation
- Use existing difficulty logs
- Later route into structured debug overlay toggled by dev flag

### Key Metrics for Balance
- Average tier reached per session
- Death distribution by cause
- Booster utilization rate
- Hazard interaction success rate
- Flow chain average duration

---

## 10. Implementation Roadmap (Engineering Phases)

### Phase A: Foundation
- Add unified `tierScript.js` mapping tier → desired parameters (hazardCounts, boosterWeights, speedReliefFlags, specialFlags)
- Extend `state.difficulty` with: `phaseCycle`, `boosterWeights`, `hazardTargets`
- Create data structures for hazards and boosters

### Phase B: Orchestration
- Implement `updateDifficultySnapshot()` to pull tier script and apply transitions (with single "pending changes" queue for smooth adoption)
- Add hazard manager module: spawn/despawn, pattern assignment, fairness checks, telemetry hooks
- Create booster manager with weighted spawn system

### Phase C: Boosters 1–3 (Core)
- Implement Time Crystal, Score Node, Stabilizer fully (spawn + HUD + resolution events)
- Add booster pity system
- Create booster effect rendering and timer system

### Phase D: Hazards 1–2 (Foundation)
- Static basic + patrol orb with telegraph & collision integration
- Portal pair (safe check & cooldown)
- Telegraph system abstraction

### Phase E: Advanced Mechanics
- Crumble cells, Ghost Snake, Laser Sweep
- Phase rotation logic and relief windows
- Spiral Drone and Shifter Zone

### Phase F: Scoring Integration
- Modify scoring helper to incorporate time multiplier, flow, boosters, portal combos
- Recap panel sections (top 4 contributions)
- Combo meter and efficiency tracking

### Phase G: Polish & Adaptive Assist
- Assist triggers + fairness failsafes
- Visual tier transition cues (HUD pulse, subtle border color shift)
- Performance safeguards (auto-suppress non-critical particles if FPS < threshold)
- Audio stingers for tier transitions and booster pickups

---

## 11. Best Practice Alignment

### Core Principles
1. **Telegraph > Surprise:** All new hazard types require visual/noise lead time
2. **One New Cognitive Load Per Tier:** Avoid coupling multiple novel patterns simultaneously
3. **Predictable Escalation + Optional Diversions:** Boosters as optional; hazards mandatory but learnable
4. **Depth via Interaction, Not Raw Complexity:** Synergies (portals + route efficiency; ghost snake + flow window stress)
5. **Elastic Difficulty:** Relief phases (Booster Bloom) to curtail fatigue and reinforce "one more run" compulsion

### Fairness Guarantees
- No unavoidable death scenarios
- Clear telegraph for all new mechanics
- Consistent hazard behavior (no RNG movement)
- Booster pity system prevents bad luck streaks
- Adaptive assist for struggling players

### Retention Mechanics
- Clear progression visualization (tier badge)
- Micro-goals every 60s (next tier anticipation)
- Relief windows prevent burnout
- Mastery curve (early easy → late challenging)
- Phase rotation provides long-term variety

---

## 12. Additional Fresh Ideas (Optional Later)

### Data Fragments
- Mini-collectibles dropped by despawned hazards
- Grant minor permanent meta-progression cosmetic
- Pure retention mechanic (no gameplay advantage)

### Overclock Mode
- Player-triggered at high flow
- Intentionally compress future tiers for higher multiplier
- Risk: acceleration of all difficulty curves

### Seasonal Variant Cycles
- Swap hazard skin palettes per month
- Same mechanics, new theme
- Cosmetic-only to avoid splitting playerbase

### Challenge Modifiers (Post-MVP)
- Daily runs with preset seed + modifiers
- Leaderboard for specific tier challenges
- "No boosters" mode for purists

---

## 13. Risk Mitigation

### Screen Clutter
- Enforce max concurrent visual effect layers
- Degrade gracefully under low FPS
- Priority rendering system (core gameplay > particles)

### RNG Booster Desert
- Pity system with cooldown
- Guaranteed spawn after threshold
- Telemetry to tune spawn rates

### Unfair Teleports
- Portal exit cell guarantee check
- Re-roll if lethal
- Brief invulnerability window

### Player Overwhelm
- Dynamic assist triggers early
- Optional toggle off for hardcore mode
- Clear visual hierarchy (threats > rewards > decorations)

### Performance Degradation
- Hazard cap enforcement
- Particle budget limits
- Auto-quality reduction at low FPS

---

## 14. Key Tuning Levers to Expose (Config)

### Tier System
```js
DIFFICULTY: {
  tierIntervalSec: 60,
  tierMax: 20,
  tierScript: [], // Array of tier definitions
  foodMilestoneTiers: [12, 25, 40, 60, 85], // Alternative triggers
}
```

### Booster System
```js
BOOSTERS: {
  baseOdds: 0.04,
  pityTimerSec: 45,
  lifetimeSec: 12,
  typeWeights: {}, // Per-tier distribution
  safeSpawnRadius: 2,
}
```

### Hazard System
```js
HAZARDS: {
  spawnSafeRadius: 3,
  dynamicSpawnSafeRadius: 5,
  telegraphDurationSec: 1.5,
  maxConcurrentStatic: 8,
  maxConcurrentDynamic: 4,
}
```

### Phase Rotation
```js
PHASES: {
  rotationTiers: [12, 14, 16, 18],
  cycles: ['surge', 'bloom', 'compression'],
}
```

### Adaptive Assist
```js
ASSIST: {
  enabled: true,
  earlyDeathThreshold: 3,
  earlyTierCap: 2,
  frustrationWindowSec: 30,
  forcedBoosterDelay: 5,
}
```

### Speed Relief
```js
SPEED_RELIEF: {
  tiers: [3, 6, 9, 12],
  reliefAmountMs: 5,
  durationSec: 10,
}
```

---

## 15. Next Immediate Deliverables

### Current Implementation Progress

#### ✅ Completed Foundation Systems
- [x] **Difficulty Progression System**: Food-based tier system (0-10 tiers)
- [x] **Flow System**: Chain-eating multiplier with timer management
- [x] **Coin Economy**: Currency earning and persistence
- [x] **HUD System**: Context-aware display with score/food/coins tracking
- [x] **Visual Feedback**: Flow progress bar, particle effects, coin flying animation
- [x] **Skin System**: Multiple purchasable skins with visual variety

#### 🚧 Next Priority Items (Not Yet Started)
1. **Tier Script Data Structure:** JSON-like object mapping tiers to unlock/change events
2. **Hazard Manager Module:** Core spawn/despawn/collision system
3. **Booster Manager Module:** Weighted spawn + effect resolution
4. **Telegraph System:** Reusable visual warning abstraction
5. **First Implementations:**
   - Static Hazard Cell (Tier 3)
   - Time Crystal Booster (Tier 4)
   - Patrol Orb (Tier 6)

### Validation Criteria (For Future Implementations)
- Tier transitions logged and visible in HUD ✅ (Currently working)
- Hazards spawn with proper telegraph ❌ (Not implemented)
- Boosters appear at configured odds ❌ (Not implemented)
- No unfair death scenarios ✅ (Current collision system prevents this)
- Performance stays >30 FPS with full hazard load ⏳ (To be tested)

---

## 16. Success Metrics (Post-Launch)

### Engagement
- Average session length >5 minutes
- Tier 6+ reached in >60% of runs
- Return rate within 24h >40%

### Balance
- Death cause distribution no single type >50%
- Booster pickup rate >70% when spawned
- Assist trigger rate <15% of total runs

### Retention
- Day 7 retention >30%
- Tier 12+ reached by >20% of engaged players
- Phase rotation experienced by >15% of playerbase

---

*Design document prepared November 2025 — Snake Frenzy Endless Survival Mode*
