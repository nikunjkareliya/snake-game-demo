# Implementation Roadmap — Snake Frenzy
## Strategic Plan for MVP Launch → Endless Survival Mode

**Generated:** November 2025
**Status:** Pre-MVP Planning
**Current Branch:** main (uncommitted changes in difficulty system)

---

## Executive Summary

**Current State:** Core game fully functional with advanced difficulty tier system (12 tiers), economy, skins, and smooth gameplay. Difficulty infrastructure exists but **hazards and boosters are not implemented**.

**Strategic Decision Point:** Three documents propose different scopes:
- **MVP_GOAL.md**: Lean polish + deployment (6-8 weeks)
- **GAME_ENHANCEMENTS.md**: Add Flow/Efficiency/Boosters/Obstacles (10-14 weeks)
- **ENDLESS_SURVIVAL_DESIGN.md**: Full 18-tier phase rotation system (16-24 weeks)

**Recommended Approach:** **Phased delivery** starting with MVP launch, then incremental endless mode features.

---

## 1. Current Implementation Analysis

### ✅ Fully Implemented (Production-Ready)

| System | Status | Files | Notes |
|--------|--------|-------|-------|
| Core Game Loop | ✅ Complete | `main.js`, `game.js` | RAF-based with delta time, smooth interpolation |
| Snake Movement | ✅ Complete | `snake.js`, `input.js` | Keyboard only (WASD/Arrows), 180° prevention |
| Food System | ✅ Complete | `food.js` | Spawns on empty cells, respawn queue with delay |
| Collision Detection | ✅ Complete | `snake.js`, `death.js` | Wall + self collision, fragment particles |
| Economy System | ✅ Complete | `state.js`, `utils.js` | Coins, skin purchasing, persistence |
| Skin System | ✅ Complete | `config.js`, `render.js`, `skinPalette.js` | 9 skins (gradient/pattern/animated/special) with prices |
| Particle System | ✅ Complete | `particles.js` | Burst effects, motion trails, death fragments |
| Visual Polish | ✅ Complete | `render.js` | Eyes blink, mouth animation, smooth grow, hit shake |
| UI System | ✅ Complete | `ui.js`, `transition.js` | Lobby, game over, settings modal, animated title |
| Persistence | ✅ Complete | `utils.js` | localStorage for coins, high score, skins, settings |
| **Difficulty Tier System** | ✅ **Complete** | `difficulty.js`, `debugHUD.js` | **12-tier progression, speed ramps, multipliers** |

### ⚠️ Partially Implemented (Needs Work)

| System | Status | Gap | Priority |
|--------|--------|-----|----------|
| Accessibility | 🟡 Partial | Missing: focus outlines, aria-live, announcements | **P0** |
| Pause Indicator | 🟡 Partial | No visible "PAUSED" overlay/badge | **P0** |
| Purchase Gating | 🟡 Unknown | Need to verify UI enforces skin prices | **P0** |
| Performance Mode | 🟡 Missing | No low-GPU toggle for weak devices | **P1** |
| Deployment Assets | 🟡 Missing | No favicon, meta tags, proper README | **P1** |

### ❌ Designed But Not Implemented

| System | Design Doc | Implementation Status | MVP Scope? |
|--------|------------|----------------------|-----------|
| **Flow System** | GAME_ENHANCEMENTS.md §1A | ❌ Config exists, no logic | **No** (Post-MVP) |
| **Efficiency Tracking** | GAME_ENHANCEMENTS.md §1C | ❌ No implementation | **No** (Post-MVP) |
| **Grazing Mechanics** | GAME_ENHANCEMENTS.md §1B | ❌ No implementation | **No** (Post-MVP) |
| **Boosters** | All 3 docs | ❌ Config + odds calculated, no spawning | **No** (Post-MVP) |
| **Hazards/Obstacles** | All 3 docs | ❌ Counts tracked in difficulty.js, no rendering/collision | **No** (Post-MVP) |
| **Phase Rotation** | ENDLESS_SURVIVAL_DESIGN.md | ❌ No implementation | **No** (Future) |
| **Audio** | MVP_GOAL.md P2 | ❌ Settings toggles exist, no playback | **Stretch** |
| **Mobile Controls** | MVP_GOAL.md P3 | ❌ No touch input | **Defer** |

---

## 2. Gap Analysis: MVP vs Current State

### Critical Gaps (MVP Blockers - P0)

#### 1. **Visible Pause Indicator** ❌
- **Current:** `state.phase = 'paused'` but no visual feedback
- **Required:** Overlay text "PAUSED" or HUD badge when Space/P pressed
- **Effort:** 1 hour (ui.js overlay + render.js call)
- **MVP_GOAL.md:** P0 requirement

#### 2. **Accessibility Foundations** ❌
- **Current:** Modal has focus trap, but incomplete
- **Required:**
  - Focus outlines on all buttons (CSS)
  - aria-live region for purchase feedback
  - Keyboard navigation testing
- **Effort:** 4-6 hours (CSS + HTML attributes + testing)
- **MVP_GOAL.md:** P0 requirement

#### 3. **Purchase Enforcement** 🟡 (Needs Verification)
- **Current:** Prices defined in `gameConfig.js ECONOMY.skinPrices`
- **Required:** UI must disable locked skins, deduct coins on purchase
- **Effort:** 2-3 hours if not working (ui.js logic)
- **MVP_GOAL.md:** P0 requirement

#### 4. **Deployment Artifacts** ❌
- **Current:** No favicon, basic README, missing meta tags
- **Required:**
  - Favicon + apple-touch-icon
  - Open Graph meta tags
  - Proper README with screenshots
  - Build instructions
- **Effort:** 3-4 hours
- **MVP_GOAL.md:** P1 requirement

### High Priority Gaps (MVP Polish - P1)

#### 5. **Insufficient Coin Feedback** ❌
- **Current:** Unknown if purchase attempt without coins shows feedback
- **Required:** Button shake + aria-live message "Insufficient coins"
- **Effort:** 2 hours (ui.js)

#### 6. **Low-GPU Performance Mode** ❌
- **Current:** Particle cap exists (500) but no toggle
- **Required:** Settings toggle that reduces:
  - Particle cap to 200
  - Shadow blur values by 50%
  - Motion trail spawn rate
- **Effort:** 3-4 hours (gameConfig.js + settings.js + render.js)

#### 7. **LocalStorage Fallback** 🟡 (Needs Verification)
- **Current:** `utils.js` has localStorage helpers, may not have try/catch
- **Required:** Graceful fallback to in-memory state if localStorage fails
- **Effort:** 1-2 hours (utils.js wrapper)

### Stretch Goals (P2 - Nice to Have)

#### 8. **Audio Implementation**
- **Required:** 3 sounds minimum (eat, death, click)
- **Effort:** 6-8 hours (find assets, implement Web Audio API, test)
- **MVP_GOAL.md:** P2 priority

#### 9. **Difficulty Speed Ramp**
- **Current:** Difficulty system calculates speed but needs verification
- **Required:** Speed reduces every 5 food eaten, HUD flash on milestone
- **Effort:** 2-3 hours (already mostly implemented?)

### Deferred (P3 - Post-MVP)

#### 10. **Mobile Touch Controls**
- **Required:** D-pad or swipe input
- **Effort:** 8-12 hours (new input.js module, prevent scroll, testing)
- **MVP_GOAL.md:** P3 priority - defer until desktop validated

---

## 3. Scope Reconciliation: Three Documents

### Document Comparison

| Feature | MVP_GOAL.md | GAME_ENHANCEMENTS.md | ENDLESS_SURVIVAL_DESIGN.md | Current Code | Recommendation |
|---------|-------------|----------------------|---------------------------|--------------|----------------|
| Core Loop | ✅ Must have | ✅ Exists | ✅ Foundation | ✅ Done | Ship as-is |
| Difficulty Tiers | Not mentioned | §9 (12 tiers) | §3 (18 tiers, phases) | ✅ 12 tiers implemented! | **Keep current, validate** |
| Flow System | Not mentioned | §1A Core mechanic | §5 Booster synergy | ❌ Not implemented | **Phase 1 (Post-MVP)** |
| Efficiency Tracking | Not mentioned | §1C Core mechanic | Not mentioned | ❌ Not implemented | **Phase 1** |
| Grazing | Not mentioned | §1B Core mechanic | Not mentioned | ❌ Not implemented | **Phase 2** (optional) |
| Boosters | Not mentioned | §3 (3 types) | §5 (8 types!) | ❌ Not implemented | **Phase 1: 3 types, Phase 2: rest** |
| Hazards | Not mentioned | §4 (3 types) | §6 (10+ types!) | ❌ Not implemented | **Phase 2: static/moving, Phase 3: advanced** |
| Phase Rotation | Not mentioned | Not mentioned | §3 (T12+ cycles) | ❌ Not implemented | **Phase 3** |
| Audio | P2 Stretch | Not mentioned | Stingers mentioned | ❌ Not implemented | **MVP Stretch or Phase 1** |
| Mobile | P3 Deferred | Not mentioned | Not mentioned | ❌ Not implemented | **Phase 2** |

### Key Insights

1. **Difficulty system already advanced**: Code has 12-tier system with speed ramps, food delays, multipliers, BUT it's designed to orchestrate hazards/boosters that don't exist yet.

2. **Scope creep evidence**: Difficulty.js tracks `staticHazards`, `movingHazards`, `boosterOdds` but nothing consumes these values (no spawn logic, no rendering, no collision).

3. **ENDLESS_SURVIVAL_DESIGN.md is 3-6 months of work**: 18 tiers, 8 boosters, 10+ hazards, phase rotation, ghost snake, portals, laser sweeps. This is a **post-launch roadmap**, not MVP.

4. **MVP_GOAL.md is correct**: Focus on polish, deployment, accessibility. Ship a polished core game first.

---

## 4. Recommended Phased Implementation

### 🎯 Phase 0: MVP Launch (2-3 Weeks)
**Goal:** Ship polished desktop game with keyboard controls, economy, skins, no new features.

**Scope:** Pure polish + deployment readiness (MVP_GOAL.md P0 + P1 tasks)

#### Week 1: Critical Fixes (P0)
- [ ] **Pause Indicator** (2h)
  - Add "PAUSED" overlay in `ui.js`
  - Semi-transparent backdrop, centered text
  - Show on `state.phase === 'paused'`

- [ ] **Accessibility Foundations** (6h)
  - CSS focus outlines for all buttons (`:focus-visible`)
  - Add `aria-live="polite"` region to HTML
  - Test keyboard navigation (Tab cycle, ESC close)
  - Add aria-labels to icon buttons

- [ ] **Purchase Enforcement Audit** (4h)
  - Verify skin prices enforced in UI
  - Test purchase flow (deduct coins, persist ownership)
  - Add disabled state styling for locked skins
  - Verify localStorage persistence works

- [ ] **Insufficient Coin Feedback** (3h)
  - Button shake animation on failed purchase
  - aria-live announcement "Insufficient coins"
  - Visual tooltip on hover showing required amount

#### Week 2: Polish & Performance (P1)
- [ ] **Low-GPU Mode Toggle** (4h)
  - Add checkbox in settings: "Performance Mode"
  - Reduce particle cap 500→200
  - Reduce shadow blur by 50%
  - Store preference in settings

- [ ] **LocalStorage Fallback** (2h)
  - Wrap all localStorage calls in try/catch
  - Fallback to in-memory state object
  - Show notification if persistence fails

- [ ] **Deployment Assets** (6h)
  - Create favicon + apple-touch-icon (use snake head glyph)
  - Add Open Graph meta tags (og:title, og:image, og:description)
  - Write proper README.md (features, controls, tech stack, deploy instructions)
  - Add screenshot to README
  - License file (MIT?)

- [ ] **Difficulty System Validation** (4h)
  - Test speed ramp triggers correctly
  - Verify food delay scaling works
  - Test time multiplier calculation
  - Ensure HUD shows tier correctly
  - Validate difficulty.js formulas against config

#### Week 3: Testing & Refinement
- [ ] **Cross-Browser Testing** (4h)
  - Chrome, Firefox, Safari, Edge
  - Test keyboard controls
  - Test localStorage persistence
  - Check particle performance

- [ ] **Accessibility Audit** (4h)
  - Screen reader testing (NVDA/JAWS)
  - Keyboard-only playthrough
  - Color contrast validation (WCAG AA)
  - Focus order verification

- [ ] **Final Polish** (8h)
  - Bug fixes from testing
  - Performance profiling
  - Code cleanup (remove console.logs)
  - Git commit hygiene
  - Prepare GitHub Pages deploy

**Exit Criteria:**
- ✅ All P0 tasks complete and tested
- ✅ All P1 tasks complete
- ✅ Runs smoothly on desktop (Chrome, Firefox, Safari)
- ✅ Keyboard navigation works end-to-end
- ✅ Purchase flow validated
- ✅ README complete with screenshot
- ✅ Deployed to GitHub Pages or equivalent

**Deferred to Post-MVP:**
- Audio (P2)
- Mobile controls (P3)
- New gameplay features (Flow, Boosters, Hazards)

---

### 🚀 Phase 1: Enhanced Gameplay (4-6 Weeks Post-MVP)
**Goal:** Add Flow system, 3 core boosters, enhanced scoring breakdown.

**Based on:** GAME_ENHANCEMENTS.md §1A, §2, §3 (simplified)

#### Milestone 1.1: Flow System (Week 1-2)
- [ ] **Flow State Tracking** (6h)
  - Add to `state.js`: `flowTier` (0-4), `flowTimer`, `flowWindow`
  - Implement `updateFlow()` in `game.js` (eat resets timer, timeout drops tier)
  - Calculate flow window: `6.5s - (tier * 0.4s)` (min 4.0s)

- [ ] **Flow Visual Feedback** (6h)
  - `render.js`: Add subtle glow/aura based on flowTier
  - HUD: Flow tier indicator (4 bars, fill based on tier)
  - Decay animation when timer expires

- [ ] **Flow Score Integration** (4h)
  - Modify scoring helper: `scoreIncrement *= FLOW_MULT[flowTier]`
  - FLOW_MULT: `[1.0, 1.05, 1.12, 1.20, 1.30]`
  - Track flow contribution in `scoreBreakdown`

#### Milestone 1.2: Core Boosters (Week 3-4)
- [ ] **Booster Spawning System** (8h)
  - Create `boosters.js` module
  - Spawn logic: Check odds every food spawn cycle
  - Types: `{ type, position, lifetime, spawnTime }`
  - Despawn after 12s
  - Never spawn on snake/food (collision check)

- [ ] **Booster Type: Time Crystal** (4h)
  - Effect: +2.5s to flowTimer (cap at window max)
  - Visual: Cyan rotating prism
  - Spawn odds: 5% if flowTier < 4

- [ ] **Booster Type: Score Node** (4h)
  - Effect: Burst score `Base × 5 + length × tier`
  - Visual: Pulsating hex, magenta→cyan border
  - Spawn odds: 2% (rare)

- [ ] **Booster Type: Shield** (4h)
  - Effect: Next collision forgiven (revive once)
  - Visual: Golden shield ring around snake
  - Spawn odds: 1% (very rare)
  - Remove Trail Stabilizer for simplicity

- [ ] **Booster Collision & Effects** (6h)
  - Detect head collision with booster
  - Apply effect based on type
  - Show HUD notification (floating text + icon)
  - Play pickup sound (if audio implemented)

- [ ] **Booster Rendering** (4h)
  - `render.js`: `drawBoosters()` after food
  - Animated rotation/pulsing effects
  - Lifetime indicator (fade out last 3s)

#### Milestone 1.3: Enhanced Scoring (Week 5)
- [ ] **Score Breakdown Tracking** (4h)
  - Extend `state.scoreBreakdown`: base, flow, length, boosters
  - Accumulate contributions throughout run

- [ ] **Game Over Score Recap** (6h)
  - Extend game over overlay
  - Show top 4 score contributors
  - Percentage breakdown
  - Total score with animation

#### Milestone 1.4: Testing & Tuning (Week 6)
- [ ] **Booster Balance Testing** (8h)
  - Tune spawn odds for average 2-3 boosters per run
  - Test flow window feels fair at all tiers
  - Verify boosters never spawn unfairly

- [ ] **Flow System Validation** (4h)
  - Test flow tier progression smooth
  - Verify timer countdown accurate
  - Test decay visual feedback clear

**Exit Criteria:**
- ✅ Flow system works smoothly, feels natural
- ✅ 3 boosters spawn correctly with proper odds
- ✅ Score breakdown accurate and informative
- ✅ No performance regression
- ✅ Boosters visually distinct and telegraphed

---

### 🎮 Phase 2: Endless Survival Core (6-8 Weeks)
**Goal:** Add static hazards, moving obstacles, efficiency tracking, mobile controls.

**Based on:** GAME_ENHANCEMENTS.md §4 + ENDLESS_SURVIVAL_DESIGN.md §6 (simplified)

#### Milestone 2.1: Hazard System Foundation (Week 1-2)
- [ ] **Hazard Manager Module** (8h)
  - Create `hazards.js`
  - Data structure: `{ type, position, active, spawnTime }`
  - Spawn scheduler using `difficulty.js` calculated counts
  - Collision detection with snake head
  - Despawn logic

- [ ] **Static Hazard Cells** (6h)
  - Enable at Tier 3 (90s or ~15 food eaten)
  - Spawn 2 initially, +1 every tier, max 8
  - Visual: Glowing red pulsing tile
  - Telegraph: 1.5s fade-in shimmer before becoming lethal
  - Never spawn within 3 cells of snake head

- [ ] **Hazard Collision Integration** (4h)
  - Check head position against hazard positions
  - Trigger death on collision
  - Track death cause: "hazard" vs "wall" vs "self"

- [ ] **Hazard Rendering** (4h)
  - `render.js`: `drawHazards()` after grid
  - Pulsing glow effect
  - Telegraph animation (shimmer → solid)

#### Milestone 2.2: Moving Hazards (Week 3-4)
- [ ] **Patrol Orb** (8h)
  - Enable at Tier 6 (180s)
  - Movement: Linear path (horizontal or vertical), reverses at bounds
  - Speed: 1 cell per 800ms initially, speeds up with tier
  - Visual: Red orb with motion trail
  - Spawn: 1 initially, +1 every 2 tiers, max 3

- [ ] **Moving Hazard Update Loop** (4h)
  - Integrate into main.js tick
  - Update positions based on pattern + speed
  - Collision detection per frame

- [ ] **Advanced Mode Toggle** (4h)
  - Add checkbox in lobby: "Endless Mode"
  - When disabled: No hazards spawn (pure classic snake)
  - When enabled: Full hazard system active
  - Store preference in localStorage

#### Milestone 2.3: Efficiency Tracking (Week 5)
- [ ] **Efficiency System** (6h)
  - Track last 15 moves: efficient (reduced distance to food) vs wasteful
  - Calculate efficiency ratio: efficient / total
  - Threshold: 8+ consecutive efficient moves triggers bonus
  - Effect: +8% score multiplier
  - Visual: Spark icon in HUD when streak active

- [ ] **Integration** (4h)
  - Update move function to track Manhattan distance change
  - Add to score breakdown
  - HUD indicator

#### Milestone 2.4: Mobile Controls (Week 6-7)
- [ ] **Touch Input Module** (10h)
  - Create `touch.js`
  - Swipe detection (threshold: 50px, velocity-based)
  - Virtual D-pad overlay (4 direction buttons)
  - Prevent page scroll during gameplay
  - Responsive positioning

- [ ] **Input Abstraction** (4h)
  - Unify keyboard + touch → single direction queue
  - Test both input methods work simultaneously

- [ ] **Mobile UI Adjustments** (6h)
  - Responsive canvas scaling (portrait support?)
  - HUD repositioning for small screens
  - Touch-friendly button sizing

#### Milestone 2.5: Testing & Polish (Week 8)
- [ ] **Hazard Fairness Validation** (8h)
  - Ensure no unavoidable death scenarios
  - Test spawn distances from head
  - Verify telegraph timing sufficient
  - Balance static vs moving hazard ratio

- [ ] **Mobile Testing** (8h)
  - iOS Safari, Android Chrome
  - Touch input responsiveness
  - Performance on mid-range devices
  - Orientation lock testing

**Exit Criteria:**
- ✅ Static + moving hazards work correctly
- ✅ Endless Mode toggle functional
- ✅ Efficiency system adds strategic depth
- ✅ Mobile controls responsive and reliable
- ✅ No unfair deaths from hazard spawns
- ✅ Performance maintained with full hazard load

---

### 🌟 Phase 3: Advanced Endless Mode (8-12 Weeks)
**Goal:** Implement advanced hazards, 8 booster types, phase rotation, portals.

**Based on:** ENDLESS_SURVIVAL_DESIGN.md (full implementation)

#### Milestone 3.1: Advanced Boosters (Week 1-3)
- [ ] Phase Prism (freeze hazards 3s)
- [ ] Phase Distorter (slow speed accumulation)
- [ ] Portal Catalyst (converts portals to score tunnels)
- [ ] Flow Anchor (prevents flow drop below 1 for 10s)
- [ ] Hazard Neutralizer (removes 1 hazard, rare)
- [ ] Weighted distribution system per tier
- [ ] Booster pity timer (guarantee after 30s)

#### Milestone 3.2: Advanced Hazards (Week 4-6)
- [ ] Crumble Cells (delayed lethal state)
- [ ] Spiral Drone (orbital movement)
- [ ] Laser Sweep (telegraph line + pulse)
- [ ] Shifter Zone (flickering unsafe cells)
- [ ] Ghost Snake (replicates player path with delay)
- [ ] Portal Pair (teleportation with safeguards)

#### Milestone 3.3: Phase Rotation System (Week 7-9)
- [ ] Phase Cycle logic (Hazard Surge, Booster Bloom, Speed Compression)
- [ ] Tier 12+ rotation every 2 tiers
- [ ] Phase transition telegraphing (HUD pulse, sound stinger)
- [ ] Per-phase parameter modifications

#### Milestone 3.4: Grazing & Advanced Score (Week 10-11)
- [ ] Grazing detection (1 cell near-miss)
- [ ] Graze meter + precision bonus
- [ ] Portal combo system
- [ ] Comprehensive score breakdown (7 categories)
- [ ] Game-over recap panel with top contributors

#### Milestone 3.5: Audio & Polish (Week 12)
- [ ] Full audio implementation (10+ sounds)
- [ ] Adaptive music system
- [ ] Tier transition stingers
- [ ] Victory condition at Tier 15
- [ ] Leaderboard integration

**Exit Criteria:**
- ✅ All 8 boosters implemented
- ✅ All 10+ hazard types functional
- ✅ Phase rotation provides variety
- ✅ Audio enhances experience
- ✅ Tier 15 victory feels satisfying

---

## 5. Risk Assessment & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Performance degradation with hazards** | High | High | Implement low-GPU mode, hazard cap enforcement, particle budget |
| **Unfair hazard spawns** | Medium | High | Rigorous spawn distance checks, telegraph system, fairness validation tests |
| **Booster spawn desert (bad RNG)** | Medium | Medium | Pity timer system (guarantee after 30-45s) |
| **Mobile performance issues** | High | Medium | Defer mobile to Phase 2, test on mid-range devices, reduce effects on mobile |
| **Audio autoplay blocks** | Medium | Low | Lazy-init audio on first user gesture, graceful fallback |
| **LocalStorage quota exceeded** | Low | Low | Minimal data storage, compression, graceful fallback |

### Scope Creep Risks

| Risk | Mitigation |
|------|------------|
| **Feature creep during MVP** | Strict adherence to Phase 0 scope; defer all new mechanics to Phase 1+ |
| **Endless design too complex** | Start with 3 boosters + 2 hazards in Phase 2; validate fun before adding more |
| **Over-engineering difficulty system** | Use existing difficulty.js as-is; tune values rather than rewriting |
| **Perfectionism blocking launch** | Set hard deadline for MVP (3 weeks); ship with known minor issues |

### Design Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Flow system feels pressuring not fun** | Medium | High | Extensive playtesting, adjustable window, optional disable |
| **Hazards feel unfair** | Medium | High | 1.5s telegraph requirement, spawn distance rules, adaptive assist |
| **Too many booster types (cognitive overload)** | High | Medium | Start with 3 types (Phase 1), add more only if needed (Phase 3) |
| **Phase rotation adds confusion** | Medium | Medium | Defer to Phase 3, clear visual/audio telegraphing, HUD indicators |
| **Early game still boring (T0-2)** | Medium | Medium | Add cosmetic escalation, consider quick-start option for veterans |

---

## 6. Implementation Priorities: What to Build First

### Immediate Actions (This Week)

1. **Verify purchase enforcement** (2h) - Test if skin purchasing actually works
2. **Add pause indicator** (2h) - Quick win, MVP blocker
3. **Accessibility focus outlines** (2h) - CSS-only, low risk

### Week 1 Priority

1. Complete all P0 tasks (pause, accessibility, purchase enforcement)
2. Validate difficulty system works as expected (speed ramps, multipliers)
3. Start deployment assets (favicon, README)

### Post-MVP Priority (Phase 1)

1. **Flow system** - Highest impact for engagement
2. **3 boosters** (Time, Score, Shield) - Core variety without overload
3. **Enhanced scoring** - Motivation and mastery feedback

### Deferred

- Audio (nice-to-have, complex)
- Mobile controls (separate market segment)
- Advanced hazards (requires foundation first)
- Phase rotation (long-term retention, not core loop)

---

## 7. Success Metrics

### MVP Launch Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Desktop Performance** | >60 FPS on modern browsers | Chrome DevTools profiler |
| **Keyboard Navigation** | 100% operable without mouse | Manual testing |
| **Purchase Flow** | 0 errors in 20 test purchases | QA script |
| **Cross-Browser Compatibility** | Works in Chrome, Firefox, Safari, Edge | Manual testing |
| **Accessibility Score** | Lighthouse >85 | Lighthouse audit |
| **Bundle Size** | <200 KB uncompressed | Webpack bundle analyzer |

### Phase 1 Metrics (Enhanced Gameplay)

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Average Flow Tier Reached** | >2.0 | Players engaging with system |
| **Booster Pickup Rate** | >70% when spawned | Boosters are valuable, reachable |
| **Session Length** | +25% vs MVP | More engaging with Flow + boosters |
| **Repeat Play Rate** | +15% vs MVP | Mastery loop working |

### Phase 2 Metrics (Endless Survival)

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Endless Mode Adoption** | >50% enable hazards | Mode is fun, not punishing |
| **Tier 6+ Reached** | >40% of endless runs | Difficulty curve balanced |
| **Hazard Death Rate** | <60% of total deaths | Not too dominant |
| **Mobile DAU** | >20% of total | Mobile version viable |

---

## 8. Resource Estimates

### Time Estimates (Solo Developer)

| Phase | Duration | Effort | Calendar Time |
|-------|----------|--------|---------------|
| **Phase 0 (MVP)** | 80-100 hours | Full-time | 2-3 weeks |
| **Phase 1 (Enhanced)** | 120-150 hours | Full-time | 4-6 weeks |
| **Phase 2 (Endless Core)** | 180-220 hours | Full-time | 6-8 weeks |
| **Phase 3 (Advanced)** | 240-320 hours | Full-time | 8-12 weeks |
| **Total (MVP → Full Endless)** | 620-790 hours | Full-time | **20-29 weeks** |

### Time Estimates (Small Team: 2-3 Developers)

| Phase | Calendar Time | Parallelizable Tasks |
|-------|--------------|---------------------|
| **Phase 0 (MVP)** | 1-2 weeks | Accessibility, assets, testing split |
| **Phase 1 (Enhanced)** | 3-4 weeks | Flow (dev 1), Boosters (dev 2), Scoring (dev 1) |
| **Phase 2 (Endless Core)** | 4-5 weeks | Hazards (dev 1), Mobile (dev 2), Efficiency (dev 1) |
| **Phase 3 (Advanced)** | 6-8 weeks | Advanced boosters/hazards split, audio (dev 3) |
| **Total** | **14-19 weeks** | With good coordination |

---

## 9. Decision Matrix: What Should We Build?

### Option A: Ship MVP Now ✅ **RECOMMENDED**
**Timeline:** 2-3 weeks
**Pros:**
- Fast launch, validate market interest
- Low risk, high polish
- Existing difficulty system already sophisticated
- Clean foundation for future features
- Can gather user feedback early

**Cons:**
- No endless survival features yet
- Missing audio (minor)
- Desktop-only (limits market)

**Recommendation:** **Best option for indie/solo dev.** Ship polished core, iterate based on user feedback.

---

### Option B: MVP + Flow + 3 Boosters (Phase 1)
**Timeline:** 6-9 weeks
**Pros:**
- Significantly more engaging than pure snake
- Flow system adds strategic depth
- Boosters provide variety
- Still manageable scope

**Cons:**
- Delayed launch by 1-2 months
- Higher risk of scope creep
- No user validation before heavy dev

**Recommendation:** **Consider if you want a stronger "endless" angle at launch.** Only if you're confident in the design without testing.

---

### Option C: Full ENDLESS_SURVIVAL_DESIGN.md Implementation
**Timeline:** 20-29 weeks (5-7 months)
**Pros:**
- Complete vision realized
- Deep, replayable experience
- Phase rotation provides long-term variety

**Cons:**
- **Massive scope** - 8 boosters, 10+ hazards, phase rotation
- High risk of feature bloat
- No market validation for 6+ months
- Likely to encounter design issues late

**Recommendation:** **Not recommended for initial launch.** ENDLESS_SURVIVAL_DESIGN.md should be a **post-launch roadmap** after validating MVP.

---

## 10. Recommended Next Steps

### Immediate (This Sprint)

1. ✅ **Read this roadmap** and decide on phasing strategy
2. 🎯 **Choose Option A (MVP Now)** or Option B (MVP + Flow)
3. 🔍 **Audit current implementation:**
   - Test purchase flow (do skin prices work?)
   - Test difficulty ramps (does speed actually increase?)
   - Profile performance (FPS with 50+ snake segments?)
4. 📋 **Create GitHub Project board** with MVP tasks
5. 🐛 **Fix critical issues** (pause indicator, accessibility focus)

### This Week

- Complete P0 tasks (pause, accessibility, purchase audit)
- Write proper README with screenshots
- Create favicon + meta tags
- Test cross-browser compatibility

### Next Week

- Complete P1 tasks (low-GPU mode, localStorage fallback)
- Final polish pass
- Prepare deployment (GitHub Pages or Vercel)

### Week 3

- Final testing (accessibility, keyboard, performance)
- Deploy to production
- Soft launch, gather feedback

### Post-MVP (After User Feedback)

- Analyze: Are players asking for more challenge? → Prioritize Phase 2 (Endless)
- Analyze: Are players asking for more variety? → Prioritize Phase 1 (Flow + Boosters)
- Analyze: High mobile traffic? → Prioritize mobile controls
- Analyze: Feature requests? → Use to inform Phase 1-3 priorities

---

## 11. Open Questions (Require Decisions)

### Technical Questions

1. **Does the purchase enforcement actually work?**
   - Need to manually test: Can you equip locked skins? Are coins deducted?

2. **Is the difficulty system tuned correctly?**
   - Does speed feel like it increases smoothly?
   - Are the tier durations (60s) correct?
   - Is the minimum speed (65ms) too fast?

3. **What's the actual performance profile?**
   - FPS with 500 particles + 50 segment snake?
   - Memory usage after 10-minute session?

4. **LocalStorage resilience?**
   - Does it handle quota exceeded?
   - Does it gracefully fallback if disabled?

### Design Questions

1. **Should MVP include basic speed ramping?**
   - MVP_GOAL.md P2 says "Speed ramps every 5 food"
   - Difficulty.js already has complex ramping
   - Decision: Test current system; if it works, ship it

2. **Should hazards be in MVP?**
   - Probably not (defer to Phase 2)
   - But difficulty.js already tracks hazard counts...
   - Decision: Keep difficulty tier system but disable hazard spawning for MVP

3. **How important is audio for MVP?**
   - MVP_GOAL.md says P2 (stretch)
   - Can launch without it
   - Decision: Ship without audio, add in Phase 1

4. **Mobile: MVP or Phase 2?**
   - MVP_GOAL.md says P3 (low priority)
   - Large market but significant dev time
   - Decision: Defer to Phase 2, validate desktop first

### Strategic Questions

1. **What's the primary success metric?**
   - Session length? Return rate? Social shares?
   - Defines what to optimize for

2. **Is this a portfolio piece or commercial project?**
   - Portfolio: Ship fast, showcase skills
   - Commercial: More thorough, market validation

3. **What's the launch timeline pressure?**
   - Hard deadline? Flexible?
   - Determines MVP vs Phase 1 launch

---

## 12. Conclusion

### Current State
- ✅ Core game is **production-ready**
- ✅ Difficulty tier system is **sophisticated and implemented**
- ⚠️ Endless survival features (boosters, hazards) are **designed but not implemented**
- ❌ MVP polish tasks (accessibility, deployment) are **incomplete**

### Strategic Recommendation
**Ship Phase 0 (MVP) in 2-3 weeks**, then iterate based on user feedback:

1. **Week 1-3:** Complete MVP_GOAL.md P0 + P1 tasks → Launch
2. **Post-launch:** Gather feedback, validate engagement metrics
3. **Month 2-3:** Implement Phase 1 (Flow + 3 Boosters) if users want more depth
4. **Month 4-5:** Implement Phase 2 (Hazards + Mobile) if users want more challenge
5. **Month 6+:** Consider Phase 3 (Advanced Endless) if retention metrics justify it

### Why This Approach?

1. **Fast validation:** Launch in weeks, not months
2. **Low risk:** Ship polished core before complex features
3. **User-driven:** Let feedback guide feature priorities
4. **Incremental:** Each phase adds value without breaking existing game
5. **Flexible:** Can pivot based on what users actually want

### The Big Picture

You have **three documents proposing different games**:
- MVP_GOAL.md wants a **polished neon snake game** (2-3 weeks)
- GAME_ENHANCEMENTS.md wants **snake with flow/boosters** (6-9 weeks)
- ENDLESS_SURVIVAL_DESIGN.md wants **roguelike survival snake** (20-29 weeks)

**All three are valid**, but they're **sequential phases, not parallel options**.

Ship the polished core, see if people play it, then decide how deep to go. Don't spend 6 months building endless survival features if nobody wants to play basic snake.

---

## 13. Final Checklist

### Before Starting Implementation

- [ ] Read this entire roadmap
- [ ] Choose phasing strategy (MVP → Phase 1 → Phase 2 → Phase 3)
- [ ] Audit current implementation (purchase flow, difficulty ramps, performance)
- [ ] Create GitHub Project board with tasks
- [ ] Set hard deadline for MVP (recommend: 3 weeks from today)

### MVP Launch Readiness

- [ ] All P0 tasks complete (pause, accessibility, purchase enforcement)
- [ ] All P1 tasks complete (assets, performance mode, localStorage)
- [ ] Cross-browser testing passed
- [ ] Performance >60 FPS
- [ ] README with screenshots
- [ ] Deployed to public URL

### Post-MVP

- [ ] User feedback collected (surveys, analytics)
- [ ] Engagement metrics analyzed
- [ ] Decision made on Phase 1 priorities
- [ ] Roadmap updated based on learnings

---

**Document Version:** 1.0
**Last Updated:** November 2025
**Status:** Planning Complete → Ready for Implementation

**Next Action:** Review with team, choose phasing strategy, start MVP P0 tasks.
