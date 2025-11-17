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

## 3. Boosters Suite - Juicy, Fun, Player-Hooked Design ⭐

**Design Philosophy:** Every booster creates memorable "wow moments" that make players want to play again. Focus on immediate feedback, power fantasy, visual spectacle, and skill expression.

### TIER 1: Early Game Power Boosters (Tiers 2-6)

#### A. 🔮 Flow Extender (Tier 4 Unlock) ⭐ CORE
- **Spawn:** 3% chance per tier 4+
- **Effect:** +3 seconds to flow window (stacks up to 2x for +6s max)
- **Duration:** Permanent until flow breaks
- **Visual:** Window bar glows cyan with crystalline shimmer; "+3s" floats upward
- **Audio:** Crystalline "ting" on pickup
- **Strategic:** Do you chase a second one? Save for tighter flow windows?
- **Hook:** Direct value players understand instantly; synergizes perfectly with flow system.

#### B. 🎁 Abundance Blessing (Tier 2 Unlock) 🌟 FIRST BOOSTER
- **Spawn:** 4% chance per food at Tier 2
- **Effect:** Food spawn rate +50% for 8 seconds (more opportunities)
- **Visual:** Food glows brighter; golden aura spreads from pickup; abundance particles
- **Audio:** Whoosh of plenty; chiming abundance theme
- **Feel:** Generous, confidence-building early-game booster
- **Hook:** Players experience booster system as REWARDING not punishing.

#### C. ⏱️ Bullet Time (Tier 5 Unlock) ⏰ CONTROL FANTASY
- **Spawn:** 4% chance per tier 5+
- **Effect:** For 8 seconds: All hazards move 30% slower + 1.5x score multiplier
- **Visual:** Blue slow-motion tint; clock particles orbit snake; hazard trails elongate
- **Audio:** Time distortion whoosh on pickup; slow-motion sound effects
- **Strategic:** Time usage for hazard-dense phases. Combine with Shield for ultra-safe runs.
- **Hook:** Feels like controlling time itself. Safe power fantasy for all skill levels.

#### D. 🛡️ Hazard Shield (Tier 6 Unlock) 🛡️ FOCUSED PROTECTION
- **Spawn:** 5% chance per tier 6+
- **Effect:** Blocks 1 hazard collision (any type: static, patrol orb, etc.)
- **Duration:** Lasts until consumed or 15 seconds expire
- **Protection Scope:**
  - ✅ BLOCKS: All hazard types (static cells, patrol orbs, future hazards)
  - ❌ DOES NOT BLOCK: Wall/edge collisions (player must navigate boundaries)
  - ❌ DOES NOT BLOCK: Self-collisions (player must avoid tail)
- **Visual:** Rotating blue hexagonal barrier orbits snake head; shatters with particle burst on hazard impact
- **Audio:** Continuous shield hum; dramatic glass shatter sound on consumption
- **Hook:** Insurance policy for external threats. Encourages pushing boundaries near hazards.

---

### TIER 2: Score Explosion Boosters (Tiers 6-9)

#### E. ⚡ Chain Lightning (Tier 8 Unlock) ⚡ CASCADING SATISFACTION
- **Spawn:** 6% chance per tier 8+
- **Effect:** Eating food zaps to nearest food, auto-collecting it! Chain up to 5x (100% → 75% → 50% → 25% → 10% score).
- **Visual:** Electric arcs jump between food items; each zap creates particle explosion; screen flashes white
- **Audio:** Crackling electricity; satisfying zap sounds per chain
- **Strategic:** Creates satisfying chain reactions across scattered food
- **Hook:** "Watch the lightning show!" Cascading particle feedback = dopamine rush.

#### F. 💎 Score Magnet (Tier 7 Unlock) 🧲 ACTIVE GAMEPLAY
- **Spawn:** 6% chance per tier 7+
- **Effect:** For 6 seconds: Food worth 3x points + auto-attract food from 3 cells away
- **Visual:** Magenta particle streams tractor-beam food toward snake; coin sprites orbit head
- **Audio:** Whoosh attraction; ascending chime per food eaten; coin jingle
- **Challenge:** "How much can I eat in 6 seconds?"
- **Hook:** Active gameplay (not passive). Magnetic effect is visually satisfying.

#### G. 💰 Coin Shower (Tier 6 Unlock) 💥 VISUAL SPECTACLE
- **Spawn:** 5% chance per tier 6+
- **Effect:** Next 3 food explode into 5-10 bonus coins that scatter (must be collected within 4s)
- **Visual:** Gold coin sprites rain down with physics; sparkle particles; cascading collection
- **Audio:** Satisfying "ching" sounds; coin cascade jingles
- **Strategic:** Position near clusters; plan collection routes
- **Hook:** "It's literally raining coins!" Physical satisfaction of collection minigame.

#### H. 👻 Score Echo (Tier 9 Unlock) 👻 DELAYED GRATIFICATION
- **Spawn:** 7% chance per tier 9+
- **Effect:** Every food eaten counts TWICE - once now, once 3 seconds later (ghostly double-scoring)
- **Visual:** Ghost numbers float up slowly; echo ripple effect on HUD; ethereal chime
- **Audio:** Harmonic chime on pickup; reverb sound on delayed score
- **Strategic:** Creates anticipation and sustained satisfaction
- **Hook:** "Watch your score climb twice!" Unique dual-reward mechanic.

#### I. 💥 Combo Detonator (Tier 11 Unlock) 💣 BIG PAYOFF MOMENT
- **Spawn:** 8% chance per tier 11+
- **Effect:** After eating 5+ food, ALL score accumulated during booster duration MULTIPLIES x2 in explosive burst
- **Visual:** Countdown builds tension; final explosion with screen shake; fireworks; massive multiplier popup
- **Audio:** Suspenseful ticking; triumphant explosion fanfare
- **Strategic:** Build tension vs. use early for guaranteed payoff
- **Hook:** "Build it, detonate it, celebrate!" Explosive tension release.

---

### TIER 3: Power Fantasy Boosters (Tiers 7-10)

#### J. 🌀 Gravity Well (Tier 8 Unlock) 🌀 CONTROL EVERYTHING
- **Spawn:** 7% chance per tier 8+
- **Effect:** Snake becomes a black hole - food/coins pulled toward you from 4 cells away, hazards pushed away 2 cells
- **Visual:** Distortion ripple around snake; particle trails curve inward; hazards visibly repelled
- **Audio:** Low frequency whoosh; gravitational effect sound
- **Strategic:** Use to clear dense food clusters safely away from hazards
- **Hook:** "Bend the game world to your will!" God-mode feeling.

#### K. 🔥 Berserker Rage (Tier 10 Unlock) 🔥 UNSTOPPABLE FORCE
- **Spawn:** 8% chance per tier 10+
- **Effect:** For 6 seconds: Move 40% faster + phase through hazards; eating food extends duration +1s each (max 12s)
- **Visual:** Red aura; angry eyes on snake; trailing fire particles; intense visual feedback
- **Audio:** Aggressive metal riff; humming engine sound during effect; final roar on end
- **Risk/Reward:** Speed makes control harder but massive score potential
- **Hook:** "Go absolutely wild!" Peak power fantasy with extension mechanic.

#### L. 🪶 Shrink Ray (Tier 7 Unlock) 🔬 SPATIAL MASTERY
- **Spawn:** 6% chance per tier 7+
- **Effect:** Snake shrinks to 50% size for 8 seconds - fit through 1-cell gaps, ninja mode activated
- **Visual:** Shrink animation with "woosh"; tiny snake with proportional food; proportional hitboxes
- **Audio:** Cute squeaky shrink sound; stealthy whisk when navigating tight spaces
- **Strategic:** Use for routing through dense hazard clusters safely
- **Hook:** "Become the stealth snake!" Novel spatial gameplay change.

#### M. 🪃 Tail Whip (Tier 11 Unlock) 🪃 SKILL-BASED DESTRUCTION
- **Spawn:** 8% chance per tier 11+
- **Effect:** Press opposite direction to swing tail 180° - destroys hazards touched, grants +100 per hazard destroyed
- **Visual:** Tail glows orange; swing arc with motion blur; satisfying impact effects per hazard
- **Audio:** Whoosh swing; crack on impact; destruction sound per hazard
- **Skill Ceiling:** Must time direction to maximize hit count
- **Hook:** "Use your tail as a weapon!" Skill expression through active mechanic.

---

### TIER 4: Visuals & Spectacle (Tiers 5-10)

#### N. 🪩 Party Mode (Tier 5 Unlock) 🪩 PURE JOY
- **Spawn:** 4% chance per tier 5+
- **Effect:** 10 seconds of pure celebration - rainbow trail, disco ball above snake, confetti, upbeat music, no gameplay effect
- **Visual:** Disco ball reflects light; rainbow snake; confetti particles; neon glow
- **Audio:** Upbeat disco music loop; celebration theme
- **Strategic:** Pure fun break, no competitive advantage
- **Hook:** "Just for pure FUN!" Emotional reward for joy's sake.

#### O. 🌈 Neon Afterimage (Tier 6 Unlock) 🎨 SELF-EXPRESSION
- **Spawn:** 5% chance per tier 6+
- **Effect:** Leave glowing light-paint trail for 12 seconds - create beautiful neon art
- **Visual:** Customizable color trail that fades slowly; neon glow effect; screenshot-worthy moments
- **Audio:** Ethereal shimmer sound as trail paints
- **Strategic:** Creates memorable visual moments; encourages sharing
- **Hook:** "Paint your masterpiece!" Self-expression through movement.

#### P. 🎇 Firework Feast (Tier 10 Unlock) 🎆 EXPLOSIVE FINALE
- **Spawn:** 8% chance per tier 10+
- **Effect:** All food on screen simultaneously explodes (collected automatically) with massive celebration
- **Visual:** Simultaneous explosion from all food positions; colors; fireworks; screen shake; smoke trails
- **Audio:** Explosive crescendo; celebratory fanfare; multiple boom sounds
- **Strategic:** Use on screen with many food spawns for maximum spectacle
- **Hook:** "Clear the board spectacularly!" Celebration moment for skill payoff.

---

### TIER 5: Clever Mechanics (Tiers 8-12)

#### Q. ⏮️ Second Chance (Tier 11 Unlock) ⏮️ DRAMATIC SAVE
- **Spawn:** 8% chance per tier 11+
- **Effect:** If you die while holding this, rewind 3 seconds and get one more try (ghost shows where you died)
- **Duration:** Lasts until used or 15 seconds expire
- **Visual:** Time reverses visually; film rewind effect; ghost of dead snake fades in as warning
- **Audio:** Rewind sound effect; dramatic save music sting
- **Strategic:** Save for high-stakes moments or learn from mistakes
- **Hook:** "Rewrite your fate!" Dramatic comeback mechanic.

#### R. 🧬 Food Cloner (Tier 7 Unlock) 🧬 RESOURCE MULTIPLICATION
- **Spawn:** 6% chance per tier 7+
- **Effect:** Next 4 food eaten spawn a second identical food in random safe location
- **Visual:** Food splits with mitosis animation; DNA helix particles; "bloop" cloning sound
- **Audio:** Satisfying cell division sound; multiplication theme
- **Strategic:** Creates abundance; more food = more scoring opportunities
- **Hook:** "Double your harvest!" Resource generation feels clever.

#### S. ✨ Blink Dash (Tier 10 Unlock) ✨ PRECISION TOOL
- **Spawn:** 8% chance per tier 10+
- **Effect:** Store one "blink charge" - instantly teleport 5 cells in current direction (one use only)
- **Visual:** Charge up shimmer; teleport flash with particle burst at both locations; sci-fi sound
- **Audio:** Charge-up beep; teleport whoosh + sci-fi effect
- **Strategic:** Save for escape or aggressive food chase
- **Hook:** "Instant escape button!" Precision tool for clutch plays.

#### T. 👁️ Ghost Food (Tier 8 Unlock) 👁️ STRATEGIC FORESIGHT
- **Spawn:** 7% chance per tier 8+
- **Effect:** See preview of next 3 food spawns (translucent) before they appear - plan routes ahead
- **Visual:** Translucent white food outlines with pulsing glow; countdown timer above each
- **Audio:** Subtle fortune-teller sound; mystical chime
- **Strategic:** Enables complex routing; deeper skill expression
- **Hook:** "See the future!" Strategic depth without complexity.

#### U. 🪞 Mirror Dimension (Tier 12 Unlock) 🪞 RISK/REWARD CHAOS
- **Spawn:** 9% chance per tier 12+
- **Effect:** Controls REVERSED for 8 seconds, BUT hazards become +20 coins each!
- **Visual:** Screen inverts colors; hazards turn gold; disorienting but rewarding effect
- **Audio:** Unsettling dimension shift; reversed sound effects; coin chime when hazard-coins collected
- **Strategic:** Risk confusion for massive coin payoff
- **Hook:** "Embrace the delicious chaos!" Unique risk/reward mind-bender.

---

### TIER 6: Meta & Discovery (Tiers 9-12)

#### V. 🐍🐍 Hydra Head (Tier 12 Unlock) 🐍🐍 DUAL POWER
- **Spawn:** 9% chance per tier 12+
- **Effect:** Spawn second ghost head that mirrors your moves - BOTH can eat food (double collection!)
- **Duration:** Lasts 10 seconds
- **Visual:** Second translucent head splits off; synchronized eating animations; double particle effects
- **Audio:** Splitting sound; synchronized eating chimes
- **Strategic:** Doubles resource collection; synergizes with Food Cloner for 4x+ rates
- **Hook:** "Two heads ARE better!" Dual power fantasy.

#### W. 🎰 Mystery Box (Tier 9 Unlock) 🎰 GAMBLING THRILL
- **Spawn:** 7% chance per tier 9+
- **Effect:** Eating triggers slot machine - randomly grants one of 5 bonus effects (chosen from available boosters)
- **Visual:** Spinning slot machine UI; suspenseful ticking; celebratory reveal animation
- **Audio:** Slot machine ticking; satisfying reveal chime
- **Strategic:** Pure luck factor; creates excitement from uncertainty
- **Hook:** "Spin the wheel!" Gambling excitement drives engagement.

#### X. 🦋 Metamorphosis (Tier 10 Unlock) 🦋 PLAYER AGENCY
- **Spawn:** 8% chance per tier 10+
- **Effect:** CHOOSE one permanent upgrade for this run:
  - **⚡ Speed:** +10% snake movement speed
  - **⏱️ Flow:** +1 second to flow window
  - **💰 Score:** +20% base score value
- **Visual:** Three glowing option circles; selection triggers transformation burst; permanent visual change (glow color)
- **Audio:** Meditation chime for selection; transformation fanfare; new playstyle music theme
- **Strategic:** Meaningful choice affects entire playstyle for remainder of run
- **Hook:** "Shape your unique destiny!" Player agency + build variety.

---

### Booster Spawn System & Balance

#### Spawn Rates by Tier
| Tier | Boosters Available | Spawn Chance | Avg. Delay |
|------|-------------------|--------------|-----------|
| 0-1  | None | 0% | N/A |
| 2 | Abundance Blessing | 4% | ~25 food |
| 3 | (none added) | 4% | ~25 food |
| 4 | + Flow Extender | 5% | ~20 food |
| 5 | + Party Mode, Bullet Time | 6% | ~16 food |
| 6 | + Hazard Shield, Neon, Coin Shower | 7% | ~14 food |
| 7 | + Magnet, Shrink Ray, Food Cloner | 8% | ~12 food |
| 8 | + Chain Lightning, Gravity Well, Ghost Food | 9% | ~11 food |
| 9 | + Score Echo, Mystery Box | 10% | ~10 food |
| 10 | + Combo Detonator, Berserker, Blink Dash, Firework, Metamorphosis | 11% | ~9 food |
| 11 | + Second Chance, Tail Whip | 12% | ~8 food |
| 12+ | + Hydra Head, Mirror Dimension | 13% | ~7 food |

#### Weighted Rarity Distribution (Tier 8+)
- **Common (40%):** Flow Extender, Abundance Blessing, Hazard Shield
- **Uncommon (35%):** Bullet Time, Magnet, Stasis, Shrink Ray, Food Cloner, Ghost Food
- **Rare (20%):** Gravity Well, Berserker, Tail Whip, Blink Dash, Second Chance
- **Epic (5%):** Chain Lightning, Combo Detonator, Firework Feast, Hydra Head, Mirror Dimension, Metamorphosis

#### Anti-Frustration Systems
- **Pity Timer:** If no booster spawned in 45s (and odds >0) → Force spawn Common-tier booster
- **Smart Spawning:** Never within 3 cells of hazards; never within 2 cells of snake head
- **Extended Lifetime:** Boosters last 18s (player has time to decide)
- **Visual Warning:** Pulsing urgency at 5s remaining before despawn
- **Combo Prevention:** Active booster prevents SAME TYPE from spawning; different types can overlap

#### HUD Active Booster Display
```
[⚡ Overdrive] 6.2s
[🛡️ Shield] Ready
[⚙️ Chrono] 3.1s
```
- Icon + name + circular timer decay
- Stacks vertically (max 3 visible)

---

### Powerful Synergy Combos Players Will Discover 🔥

**"Chain Lightning Reaction":** Chain Lightning + Score Echo + High Flow
→ Chain zaps auto-collect doubled-scoring food = 9x+ multipliers possible

**"Black Hole Cleaner":** Gravity Well + Firework Feast
→ Pull everything toward you then detonate = ultimate area clearing

**"Immortal Speed Demon":** Berserker Rage + Second Chance + Hazard Shield
→ Go insane speeds with triple safety net = highest skill expression

**"The Quadruple Collector":** Hydra Head + Food Cloner + Abundance Blessing
→ 2 heads × 2 cloned food × 1.5x spawn = 6x+ collection rate

**"Future Master":** Ghost Food + Blink Dash + Metamorphosis (Speed)
→ See spawns, teleport to them, boosted speed = perfect routing optimization

**"Score Explosion":** Combo Detonator + Score Magnet + Combo Crown (from ENDLESS_SURVIVAL_DESIGN.md)
→ Up to 27x multiplier potential (if all active!)

---

### Visual/Audio Design Summary

**Pickup Sounds** (unique per booster for instant recognition):
- Flow Extender: Crystal chime (harmonic)
- Abundance: Whoosh of plenty
- Bullet Time: Time distortion
- Shield: Shield activate hum
- Chain Lightning: Electric crackle
- Score Magnet: Whoosh + coin jingle
- Coin Shower: Raining coin cascade
- And so on... (see above per booster)

**Screen Effects by Booster:**
| Booster | Effect |
|---------|--------|
| Bullet Time | Blue slow-motion tint |
| Berserker | Red aura + fire particles |
| Party Mode | Disco ball + rainbow glow |
| Gravity Well | Distortion ripples |
| Mirror Dimension | Inverted colors |
| Firework | Screen shake + explosions |

---

### Implementation Notes

**State Tracking:** Add to `state.js`:
```javascript
state.activeBoosters = [];  // Array of { type, startTime, duration, data }
state.boosterConfig = { ... }  // Copy of BOOSTERS config
```

**Booster Manager (`src/boosters.js`):**
- `spawnBooster(type, position)` - Creates booster object
- `applyBoosterEffect(type, duration)` - Applies gameplay changes
- `removeBoosterEffect(type)` - Cleans up on expiry
- `getActiveBooster(type)` - Queries current state

**Spawn System (`src/food.js`):**
- Add weighted random selection from available tier boosters
- Respect spawn safety rules (distance from hazards/head)
- Handle multiple boosters on field at once

---

### Balance & Tuning Notes

- **No Speed-Only Boosters:** Bullet Time slows hazards (safer) not speeds snake (punishing)
- **Shield Focused:** Only blocks hazards, not walls/self (maintains skill requirements)
- **Early Access:** Tier 2 gets Abundance (confidence builder) + Tier 4 Flow (natural progression)
- **High-Skill Meta:** Late-game combos (27x multipliers) require understanding 3+ booster interactions
- **Accessibility:** Common boosters (Abundance, Flow, Shield, Magnet) are straightforward
- **Excitement Curve:** New booster every 1-2 tiers keeps discovery fresh
- **All Boosters Feel Good:** No "trap" boosters that punish players

All boosters despawn after 18s to encourage decisive action.

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