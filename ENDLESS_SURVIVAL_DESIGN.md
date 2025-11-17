# Endless Survival Design Plan — Snake Frenzy

---

## ⚠️ IMPLEMENTATION STATUS

**Current Progress: ~45-50% Complete** ⬆️ (Updated with recent implementations)

This document represents the full design roadmap for the Endless Survival mode. Many features described here are **planned but not yet implemented**.

### ✅ Currently Implemented Features
- **Flow System**: Chain-eating multiplier with 5 tiers (1.0x → 3.0x)
- **Difficulty Progression**: Food-based tier system (0-10 tiers) with speed scaling
- **Coin Economy**: Earn coins during gameplay (+1/food) and on death (score × 0.1)
- **Skin System**: Multiple purchasable skins with unique visual effects
- **Core Gameplay**: Snake movement, food spawning, collision detection, death handling
- **Visual Effects**: Particle system, smooth spline rendering, glow effects
- **UI/UX Enhancements**: Flow progress bar, HUD system, coin flying animation, high score badge
- **Tier Script System**: Orchestrated auto-spawning progression (0-10 tiers with hazard scaling) ✨ NEW
- **Telegraph System**: 1.5-second visual warnings before hazards become lethal ✨ NEW
- **Boosters** (2/8 types implemented):
  - ✅ **Coin Shower**: Basket explosion spawning 12 collectible coins (physics-based settlement)
  - ✅ **Shrink Ray**: Removes 50% of snake's tail segments with magenta particle burst
- **Hazards** (2/11 types implemented):
  - ✅ **Static Hazards**: Telegraph warning + grid-based lethal cells with glow aura
  - ✅ **Patrol Orbs**: Moving hazards (2-4 cells/sec) with evil animated gradient and blinking eyes (48px diameter)

### ❌ Not Yet Implemented
- **Boosters** (6/8 remaining): Flow Extender, Overdrive Surge, Shield Barrier, Score Magnet, Stasis Burst, Hazard Vortex, and 2 more juicy variants
- **Hazards** (9/11 remaining): Hazard clusters, crumble cells, spiral drones, laser sweeps, portals, shifter zones, ghost snake, and 2 more variants
- **Phase Rotation**: Cyclical difficulty phases (Surge/Bloom/Compression)
- **Adaptive Assist**: Death protection and frustration valves
- **Time Multiplier**: Score scaling based on survival duration
- **Advanced Scoring**: Route combos, hazard survival bonuses, booster bonuses
- **Booster Pity System**: Guaranteed spawn mechanics after 45s without pickup
- **Weighted Rarity**: Common/Uncommon/Rare/Epic booster distribution

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

## 5. Booster Suite - Enhanced for Player Engagement ⭐

**Core Design Philosophy:** Every booster creates a memorable "WOW moment" that players want to experience again and share. Focus on active power moments, visual spectacle, skill expression, and meaningful choice.

**Principles:** Avoid passive stat boosts. Make every pickup feel powerful. Enable combo gameplay. Provide satisfying feedback.

---

### TIER 1: Early Game Power Boosters (Tiers 4-6)

#### 🔮 Flow Extender (Tier 4 Unlock) ⭐ CORE
- **Effect:** +3 seconds to flow window (stacks up to 2 times for +6s max)
- **Duration:** Permanent until flow breaks
- **Visual:** Window bar glows cyan with crystalline shimmer; "+3s" floats upward
- **Audio:** Crystalline "ting" on pickup
- **Strategic Depth:** Do you chase a second one? Save for higher flow tiers when window tighter?
- **Engagement Hook:** Direct value players instantly understand. Synergizes perfectly with flow system.

#### ⚡ Overdrive Surge (Tier 5 Unlock) 🎮 POWER FANTASY
- **Effect:** For 8 seconds: Move 30% faster + 2.0x score multiplier
- **Skill Ceiling:** Higher for skilled players; risky for beginners
- **Visual:** Orange/yellow lightning trails, snake glows bright, screen edges pulse with energy
- **Audio:** Electric charge-up sound; continuous humming during; discharge fizzle on end
- **Risk/Reward:** Speed makes control harder but massive score potential
- **Strategic Depth:** Time it when food clusters spawn. Combine with high flow tier (6x total multiplier!)
- **Engagement Hook:** POWER FANTASY - feel unstoppable. Creates memorable high-score moments.

#### 🛡️ Shield Barrier (Tier 6 Unlock) 💪 SAFETY NET
- **Effect:** 1-hit invincibility shield (blocks hazard OR self-collision)
- **Duration:** Lasts until consumed or 15 seconds expire
- **Visual:** Rotating hexagonal barrier orbits snake head; when hit: shatters with glass particles
- **Audio:** Shield activate hum; glass shatter on impact
- **Save Mechanic:** Players hold it for "oh shit" moments = encourages risk-taking
- **Strategic Depth:** Use immediately vs. save for dangerous moments?
- **Engagement Hook:** Insurance policy. Lets players push boundaries. Feel-good safety net for new players.

---

### TIER 2: Mid Game Interaction Boosters (Tiers 7-9)

#### 💎 Score Magnet (Tier 7 Unlock) 🧲 ACTIVE GAMEPLAY
- **Effect:** For 6 seconds: Food worth 3x points + auto-attract food from 3 cells away
- **Change from Old:** Instead of passive burst, now ACTIVE gameplay mechanic
- **Visual:** Magenta particle streams tractor-beam food toward snake; coin sprites orbit head
- **Audio:** Whoosh attraction; ascending chime per food eaten; coin jingle
- **Challenge:** "How much can I eat in 6 seconds?"
- **Strategic Depth:** Position near food clusters before activating. Combine with high flow (9x total!)
- **Engagement Hook:** Active not passive. Magnetic effect is visually satisfying. Hunt food during duration.

#### ❄️ Stasis Burst (Tier 8 Unlock) 🥶 POWER FANTASY (Enhanced)
- **Effect:** All hazards freeze for 6 seconds (doubled from 3s for impact)
- **Warning:** 1-second thaw warning before hazards reactivate (frozen hazards pulse)
- **Visual:** Ice particle explosion; frozen hazards encased in ice crystals; blue tint overlays
- **Audio:** Ice crystallize on pickup; cracking sound on thaw warning
- **Fairness:** Thaw warning prevents cheap deaths
- **Strategic Depth:** Save for dense hazard phases. Use to path shortcuts through patrol orbs.
- **Engagement Hook:** Turn danger into safety. Risky pathfinding becomes possible. Power fantasy.

#### 🌪️ Hazard Vortex (Tier 9 Unlock) 💥 SATISFYING DESTRUCTION
- **Effect:** All hazards within 5-cell radius destroyed in swirling vortex animation
- **Score Bonus:** +50 score per hazard destroyed
- **Visual:** Purple swirling vortex; hazards pulled toward center; each explodes in particle burst
- **Audio:** Vortex whoosh on pickup; cascade of explosions; "+50" popups per hazard
- **Screen Shake:** Intensity increases per destruction
- **Strategic Depth:** Path to dense hazard clusters for max value. "Hazard farming" incentive.
- **Engagement Hook:** Big satisfying power moment. Visible destruction with score feedback. Area clearing feels amazing.

---

### TIER 3: Late Game Mastery Boosters (Tiers 10-12)

#### 🔗 Flow Anchor (Tier 10 Unlock) ⚓ INSURANCE
- **Effect:** Flow tier cannot drop below current level for 12 seconds
- **Allows:** Missing multiple food without penalty
- **Visual:** Golden anchor icon chains flow bar; ethereal chain particles drift around snake
- **Audio:** Heavy chain drop on pickup; chain break on expiry
- **Strategic Depth:** Use during hazard-dense phases to maintain flow. Enables risky shortcuts.
- **Engagement Hook:** Lets players PUSH LIMITS. Safety net for risky maneuvers. Late-game recovery tool.

#### 👻 Phase Dash (Tier 11 Unlock) 🌀 SKILL EXPRESSION
- **Effect:** Next 5 direction changes: Phase through hazards AND your own tail
- **Mechanic:** Each phase-through creates ghost afterimage
- **Visual:** Snake semi-transparent with cyan glow; ghost afterimages at each phase position; shimmer ripple
- **Audio:** Dimensional shift on pickup; whoosh + sparkle per phase-through
- **Skill Test:** Must count your moves carefully
- **Strategic Depth:** Thread through your own tail for tight spots. Combine with Overdrive for maximum chaos.
- **Engagement Hook:** Active skill. High skill ceiling. Enables insane pathing. Creates "that was awesome!" moments.

#### 💫 Combo Crown (Tier 11 Unlock) 👑 ESCALATING REWARD
- **Effect:** For 10 seconds: Each consecutive food eaten increases multiplier (1.5x → 2.0x → 2.5x → 3.0x+)
- **Reset:** If you miss food or timer expires, resets to 1.5x
- **Stacking:** Multiplicative with flow multiplier (3.0x crown × 3.0x flow = 9.0x total!)
- **Visual:** Crown grows larger with each food; multiplier number in crown shows bonus
- **Audio:** Royal fanfare on pickup; ascending chime pitch per food; building tension music
- **Challenge:** "Can I keep the chain going?"
- **Strategic Depth:** Maintain aggressive eating pace. Risk pushing hard vs. play safe.
- **Engagement Hook:** Escalating reward creates tension. Skill expression (good routing = huge payoff). Becomes the score meta.

#### ⚙️ Chrono Dial (Tier 12 Unlock) 🎛️ PLAYER AGENCY
- **Effect:** CHOOSE between two modes at pickup:
  - **FAST** (⚡): 30% speed boost for 10s (high skill, high score)
  - **SLOW** (🐢): 30% slower, easier control for 10s (safety, learning)
- **Choice:** Cannot change once selected
- **Visual:** Two glowing options appear; selected mode triggers particle effect (orange/blue)
- **Audio:** Clock tick on appearance; gear click + theme music on choice
- **Situational:** Adapts to game state (open area = speed, hazard maze = slow)
- **Strategic Depth:** Read the board state before choosing. Decision-making test.
- **Engagement Hook:** Player agency. Meaningful choice. Different playstyles rewarded. Situation awareness test.

---

### ADDITIONAL JUICY BOOSTERS (High Engagement Variants)

**Implementation Order:** One booster at a time, testing with keyboard shortcuts (Keys 1-6)

#### 🌈 Neon Afterimage (Tier 3 Unlock) 🎨 SELF-EXPRESSION [PRIORITY 1]
- **Spawn:** 4% chance per tier 3+
- **Keyboard Shortcut:** Press **Key 2** during gameplay to spawn
- **Effect:** Leave glowing light-paint trail for 12 seconds - create beautiful neon art
- **Visual:** Customizable color trail that fades slowly; neon glow effect; screenshot-worthy moments
- **Audio:** Ethereal shimmer sound as trail paints
- **Strategic Depth:** Creates memorable visual moments; encourages sharing
- **Engagement Hook:** "Paint your masterpiece!" Self-expression through movement.
- **Implementation Complexity:** ⭐ Low (reuses existing particle system)

#### 💰 Coin Shower (Tier 2 Unlock) 💥 VISUAL SPECTACLE [PRIORITY 2]
- **Spawn:** 4% chance per tier 2+
- **Keyboard Shortcut:** Press **Key 1** during gameplay to spawn
- **Effect:** Next 3 food explode into 5-10 bonus coins that scatter (must be collected within 4s)
- **Visual:** Gold coin sprites rain down with physics; sparkle particles; cascading collection
- **Audio:** Satisfying "ching" sounds; coin cascade jingles
- **Strategic Depth:** Position near clusters; plan collection routes
- **Engagement Hook:** "It's literally raining coins!" Physical satisfaction of collection minigame.
- **Implementation Complexity:** ⭐⭐ Medium-Low (physics + collection)

#### 🪶 Shrink Ray (Tier 4 Unlock) 🔬 SPATIAL MASTERY [PRIORITY 3]
- **Spawn:** 5% chance per tier 4+
- **Keyboard Shortcut:** Press **Key 3** during gameplay to spawn
- **Effect:** Snake shrinks to 50% size for 8 seconds - fit through 1-cell gaps, ninja mode activated
- **Visual:** Shrink animation with "woosh"; tiny snake with proportional food; proportional hitboxes
- **Audio:** Cute squeaky shrink sound; stealthy whisk when navigating tight spaces
- **Strategic Depth:** Use for routing through dense hazard clusters safely
- **Engagement Hook:** "Become the stealth snake!" Novel spatial gameplay change.
- **Implementation Complexity:** ⭐⭐⭐ Medium (hitbox manipulation)

#### 🌀 Gravity Well (Tier 6 Unlock) 🌀 CONTROL EVERYTHING [PRIORITY 4]
- **Spawn:** 6% chance per tier 6+
- **Keyboard Shortcut:** Press **Key 4** during gameplay to spawn
- **Effect:** Snake becomes a black hole - food/coins pulled toward you from 4 cells away, hazards pushed away 2 cells
- **Visual:** Distortion ripple around snake; particle trails curve inward; hazards visibly repelled
- **Audio:** Low frequency whoosh; gravitational effect sound
- **Strategic Depth:** Use to clear dense food clusters safely away from hazards
- **Engagement Hook:** "Bend the game world to your will!" God-mode feeling.
- **Implementation Complexity:** ⭐⭐⭐⭐ Medium-High (physics simulation)

#### 🎰 Mystery Box (Tier 8 Unlock) 🎰 GAMBLING THRILL [PRIORITY 5]
- **Spawn:** 7% chance per tier 8+
- **Keyboard Shortcut:** Press **Key 5** during gameplay to spawn
- **Effect:** Eating triggers slot machine - randomly grants one of 5 bonus effects (chosen from available boosters)
- **Visual:** Spinning slot machine UI; suspenseful ticking; celebratory reveal animation
- **Audio:** Slot machine ticking; satisfying reveal chime
- **Strategic Depth:** Pure luck factor; creates excitement from uncertainty
- **Engagement Hook:** "Spin the wheel!" Gambling excitement drives engagement.
- **Implementation Complexity:** ⭐⭐⭐⭐ High (UI + random effects)
- **Note:** Only selects from unlocked boosters based on current tier

#### 🪞 Mirror Dimension (Tier 10 Unlock) 🪞 RISK/REWARD CHAOS [PRIORITY 6]
- **Spawn:** 8% chance per tier 10+
- **Keyboard Shortcut:** Press **Key 6** during gameplay to spawn
- **Effect:** Controls REVERSED for 8 seconds, BUT hazards become +20 coins each!
- **Visual:** Screen inverts colors; hazards turn gold; disorienting but rewarding effect
- **Audio:** Unsettling dimension shift; reversed sound effects; coin chime when hazard-coins collected
- **Strategic Depth:** Risk confusion for massive coin payoff
- **Engagement Hook:** "Embrace the delicious chaos!" Unique risk/reward mind-bender.
- **Implementation Complexity:** ⭐⭐⭐⭐⭐ Very High (control inversion + hazard transformation)
- **Warning:** Test extensively for fairness - high frustration risk if duration too long

---

### REMOVED BOOSTERS (And Why)

❌ **Tail Whip** - REMOVED
*Reason:* Requires active input mechanics (opposite direction swing) - too complex for core implementation phase. Can revisit as Post-MVP feature.

---

### Removed Boosters (And Why)

❌ **Trail Stabilizer** - REMOVED
*Reason:* "Efficiency penalty" doesn't exist in current game. Concept is unclear to players.

❌ **Portal Catalyst** - REMOVED
*Reason:* Too situational (requires portals to exist). Dead pickup if no portals = frustration.

❌ **Phase Distorter** - REPLACED with Phase Dash
*Reason:* Passive/defensive ("slow speed ramp accumulation"). Phase Dash is active and empowering.

❌ **Hazard Neutralizer** - MERGED into Hazard Vortex
*Reason:* Removing ONE hazard felt weak. Clearing an AREA feels powerful.

---

### Booster Spawn System & Progression

#### Spawn Rates by Tier
| Tier | Boosters Available | Spawn Chance | Avg. Delay |
|------|-------------------|--------------|-----------|
| 0-3  | None | 0% | N/A |
| 4 | Flow Extender | 3% | ~33 food |
| 5 | + Overdrive | 4% | ~25 food |
| 6 | + Shield | 5% | ~20 food |
| 7 | + Magnet | 6% | ~16 food |
| 8 | + Stasis | 7% | ~14 food |
| 9 | + Vortex | 8% | ~12 food |
| 10 | + Flow Anchor | 9% | ~11 food |
| 11 | + Phase Dash, Crown | 10% | ~10 food |
| 12+ | + Chrono | 12% | ~8 food |

#### Weighted Rarity Distribution (Tier 11+)
- **Common (40%):** Flow Extender, Shield Barrier
- **Uncommon (35%):** Overdrive, Score Magnet, Stasis
- **Rare (20%):** Hazard Vortex, Flow Anchor, Phase Dash
- **Epic (5%):** Combo Crown, Chrono Dial

#### Anti-Frustration Systems
- **Pity Timer:** If no booster spawned in 45s → Force spawn Common-tier booster
- **Smart Spawning:** Never within 3 cells of hazards; never within 2 cells of head
- **Extended Lifetime:** Boosters last 18s (up from 12s) - time to plan routes
- **Visual Warning:** Pulsing urgency at 5s remaining
- **Combo Prevention:** Active booster prevents SAME TYPE from spawning; different types can overlap

#### HUD Active Booster Display (Top-Right)
```
[⚡ Overdrive] 6.2s
[🛡️ Shield] Ready
[⚙️ Chrono] 3.1s
```
- Icon + name + circular timer decay
- Stacks vertically (max 3 visible)

---

### Synergy Matrix - Powerful Combos 🔥

**"Speed Demon":** Overdrive + Shield
→ Safe high-speed scoring through danger zones

**"Vacuum Cleaner":** Score Magnet + High Flow Tier
→ 9x multiplier food collection (3x magnet × 3x flow)

**"Untouchable":** Phase Dash + Stasis Burst
→ Navigate frozen hazards with ghost mode for shortcuts

**"Score Explosion":** Combo Crown + Overdrive + Score Magnet
→ Up to 27x multiplier potential (3.0x × 3.0x × 3.0x!) - THE META COMBO

**"Immortal Run":** Flow Anchor + Shield + Flow Extender
→ Maintain high flow with layered safety nets

**"Clearance Sale":** Hazard Vortex + Overdrive
→ Quickly clear zones and speed through for massive score

**"Master Pilot":** Phase Dash + Overdrive
→ Insane control at high speed - ultra-skilled play

---

### Player Engagement Hooks

#### "First Time" Moments (New Player Retention)
- **First Shield Save:** "Wow, that saved me!" (emotional relief)
- **First Overdrive:** "This is INSANE!" (power fantasy)
- **First Vortex:** "That was SO satisfying!" (destruction fantasy)
- **First 9x Multiplier:** "LOOK AT MY SCORE!" (achievement moment)

#### Progression Anticipation (Long-term Retention)
- **Tier 4:** "Ooh, boosters are here!" (new system unlocked)
- **Tier 7:** "I can get EVEN MORE score?" (economy expansion)
- **Tier 11:** "This combo system is broken!" (mastery discovery)
- **Tier 12:** "I can CHOOSE my power?!" (agency moment)

#### Mastery Curves (Skill Expression)
- Learning optimal Overdrive timing
- Counting Phase Dash moves perfectly
- Building massive Combo Crown chains
- Choosing correct Chrono Dial mode for situation

#### Social Sharing Hooks ("Did you see..." moments)
- "I got a 9x multiplier combo!"
- "My Overdrive run scored 2000 points!"
- "I phase-dashed through my ENTIRE tail!"
- "Watch this Vortex clear 8 hazards at once!"

---

### Audio Design by Booster

**Pickup Sounds** (unique feedback):
- Flow Extender: Crystal chime (harmonic)
- Overdrive: Electric charge build-up (rising pitch)
- Shield: Shield activate hum (protective)
- Magnet: Whoosh + coin jingle (satisfying)
- Stasis: Ice freeze crackle (cold)
- Vortex: Whirlpool suction (intense)
- Flow Anchor: Heavy chain drop (weighty)
- Phase Dash: Dimensional warp (sci-fi)
- Combo Crown: Royal fanfare (majestic)
- Chrono Dial: Clock tick (mechanical)

**Active Sounds** (looping during effect):
- Overdrive: Humming engine (sustained energy)
- Magnet: Whooshing attraction (active pulling)
- Combo Crown: Tension buildup music (escalating stakes)

### HUD Feedback
- Booster effect badges with timers (icon + circular decay)
- Active booster glow on snake when multiple active
- Screen-edge color tinting per booster type
- Audio stinger on pickup (unique per booster)
- Score popup adjustments (+X% larger with multipliers)

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
