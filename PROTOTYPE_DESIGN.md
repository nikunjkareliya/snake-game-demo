# Prototype Design Document — Snake Frenzy

## 1. PROTOTYPE OVERVIEW
Snake Frenzy is a fast, neon-infused web snake variant focused on making identity, visual expressiveness, and moment-to-moment feel the standout hook—turning a commoditized mechanic into a platform for future layered gameplay (abilities, status effects, modular body parts). This prototype validates that enhanced cosmetic feedback (dynamic skins, animated effects, tongue/blink personality, particle-rich eating/death sequences) meaningfully increases replay desire despite familiar core rules. Goal: produce in 1 week a polished core loop with customization UI proving players care about unlocking/equipping identity, setting a foundation to later justify deeper mechanic extensions.

## 2. CORE MECHANIC (THE HEART)
Player steers a smoothly interpolated neon snake on a grid, collecting pulsing food orbs to grow and score. Each eat triggers a glow burst, tongue animation, particle bloom, and incremental visual evolution of the snake body (scales/trails). Immediate feedback: score rise, coin increment, visual burst, subtle mouth/tongue timing. Fun repeatability comes from snappy directional response, anticipation of threading gaps through the expanding body, and cosmetic progression feedback (chosen skin rendering every segment distinctly).

Core Loop:
Navigate → Eat food (burst + growth) → Score/Coin increment + new food spawn → Risk increases (longer body) → Continue until collision → Death fragmentation → Game Over overlay → Restart with chosen/equipped identity.

Prototype Focus (ONE differentiator):
“Expressive modular skin/VFX system”: robust rendering pipeline where skins can define gradient/pattern/animated/faceted/ghost effects & per-segment overlays. This is the extensibility spine for future mechanics (e.g., elemental segments, status channels).

Success Criteria (qualitative now):
- Players remark on visuals or ask how to unlock more looks.
- Players re-equip different skins voluntarily during short test.
- Eating feels ‘juicy’ (noticed by playtesters without prompting).

## 3. PLAYER CONTROLS
Platform: Desktop keyboard (Phase 1). Inputs:
- WASD / Arrow Keys: direction (disallow instant 180° reversal).
- Space: pause/resume.
- R: restart (during non-playing states).
Learn time < 10 seconds: lobby shows a small “How to Play” control diagram.

## 4. GAME OBJECTIVE & WIN/LOSS
Objective: Survive and grow; maximize score and coins.
Win Condition: None (endless survival / high-score chase).
Loss Condition: Collision with wall or self segment.
Scoring: +10 points per food (subject to future tuning); coins parallel (economy light).
Game Type: Score-based endurance with cosmetic progression.

## 5. PROTOTYPE GAMEPLAY FLOW
1. Load → Lobby overlay (title, Play, Customize, Settings, currency, high score).
2. Player presses Play → Brief dual-intro snakes animation (brand flair) → gameplay starts.
3. Core loop → Move, collect food, grow, accumulate score/coins, visual particle feedback each eat.
4. Death (collision) → Fragmentation + particle bursts → Game Over overlay with stats & replay option.
5. Restart → Back into play quickly; customization optionally before next run.

## 6. MINIMAL UI REQUIREMENTS
Screens:
- Lobby (title, Play, Customize button).
- Gameplay HUD: coins, food eaten (lean).
- Game Over: score, food eaten, coins earned, high score flag, buttons (Play Again / Lobby).
On-Screen Always (during play): Coin count, food eaten.
Keep to ≤3 HUD clusters (already satisfied).

## 7. VISUAL & AUDIO STYLE
Visual: Neon cyber-arcade with layered glows, per-skin theming, particle bursts (eat, death), subtle head eye blink + tongue animation.
Palette (core 5): Magenta (#ff00ff), Cyan (#00eaff), Accent White (#ffffff), Deep Navy BG (#0b0f1a), Electric Yellow/Orange (#ffcc33 / #ff7a00 for highlights).
Audio (Prototype): Omitted (future nice-to-have); placeholder hooks can be stubbed.
Animation:
- requestAnimationFrame loop with interpolation.
- Eat burst (particles + mouth open).
- Head blink (random interval).
- Death fragmentation linger.
Keep particle cap enforced.

## 8. WEB PLATFORM SPECIFICATIONS
Browser Support: Latest Chrome, Firefox, Edge; Safari (test once).
Screen: Desktop first (1024×768 fixed canvas); responsive polish out-of-scope.
Orientation: Landscape.
Performance Target: 60fps (≥30fps acceptable under stress).
Bundle Size: < 2MB current (well under 5MB limit).
Offline: Fully static (no server needed).
Load Time: Aim < 2.5s on broadband (preload fonts; consider font-display: swap).
Input: Keyboard; mouse used only for UI clicks.
Fullscreen: Not required (optional later).
Shareability: Manual (copy link) for prototype; no social integration yet.

## 9. PROTOTYPE SCOPE & TIMELINE
Phase 1 (Days 1–2): Confirm core loop, death, growth, interpolation & visual bursts stable. Ensure skin rendering registry clean and extensible.
Phase 2 (Days 3–4): Integrate skin customization (already mostly implemented) as must-have; finalize game over stats; refine lobby + accessibility (focus traps, aria-live).
Phase 3 (Days 5–7): Polish visuals (optimize particle lifetimes, blink timing), light balancing (food value constant), playtest (5–10 users), capture qualitative feedback.
Total Timeline: 1 week.

## 10. SUCCESS METRICS (INITIAL PLACEHOLDERS)
Qualitative:
- Testers describe visuals/skins as “cool” or “satisfying.”
- Immediate comprehension of controls without instruction.
- At least one voluntary replay after first death.
Quantitative (provisional targets—adjust once data available):
- Median first-session length: ~2–3 minutes.
- ≥60% of testers replay immediately at least twice.
- ≥50% interact with Customize before or after 2nd run.
Validation Questions:
1. Does visual identity increase desire to replay?
2. Do players feel juice/feedback is satisfying?
3. Do they express curiosity for more skin types or functional variants?

## 11. WHAT'S NOT IN PROTOTYPE
Explicit Exclusions (to stay lean):
- ❌ Economy design & balancing (beyond static coin awards & skin prices)
- ❌ Power-ups / abilities / boosters
- ❌ Procedural arenas / multiple maps
- ❌ Leaderboards / online services
- ❌ Analytics instrumentation
- ❌ Mobile touch controls
- ❌ Audio implementation (SFX/music)
- ❌ Advanced difficulty scaling (speed ramp disabled for now)

## 12. POST-PROTOTYPE: IF IT WORKS
If validated (players value skins & feel):
- Add functional “affix skins” (e.g., flame skin leaves damaging trail, circuit skin charges segments → next expansion mechanic).
- Introduce light tiered difficulty (speed ramps, hazard cells, roaming obstacles).
- Add simple challenge modes (timed run, survival waves).
- Expand economy: rarities, progressive unlocks, daily coin bonuses.
- Add swipe / on-screen controls for mobile & responsive scaling (letterboxing fallback).
- Integrate lightweight SFX (eat, death, equip) + subtle music loop with dynamic filters.
If invalidated (visual identity not enough):
- Pivot toward mechanical twist: modular segment abilities (shield, magnet, dash), shrinking arena pressure, or multiplayer short rounds.
- Reassess skin system investment—maybe reduce complexity and shift to novel core mechanic (e.g., snake fusion, territory painting).

## 13. TECH STACK RECOMMENDATION
Chosen: Vanilla JS + Canvas (already implemented) for speed and full rendering control.
Hosting: GitHub Pages (simple static deployment).
Asset Tools: Continue using inline gradients & procedural effects (no heavy art pipeline needed yet).
Rationale: Rapid iteration, zero build tooling complexity, direct measurement of rendering path for optimization.

## 14. DISTRIBUTION & TESTING PLAN
Distribution: Publish on GitHub Pages (public link).
Sharing: Manual link to small tester group (friends/community Discord).
Feedback Collection: Simple Google Form (questions mapping to Validation Questions) + optional free-text.
Playtesting Wave:
- Wave 1 (5 users): UX clarity & control comprehension.
- Wave 2 (10–15 users): Replay motivation, skin engagement.
Record: #restarts, #skin changes (manually observed or lightweight console logging during tests—without permanent analytics infra).

## 15. RISK SNAPSHOT & MITIGATIONS
- Visual Overhead (glow & particles) → Provide quick tuning constants (MAX_PARTICLES, shadowBlur) toggleable via debug flag.
- Repetitive Loop Fatigue → Early injection of variety through skin equip mid-session (future) or subtle trail evolution after thresholds.
- Feature Creep → Locked exclusions list; treat any economy or power-up request as post-validation task.
- Lack of Distinctiveness → Ensure doc positions skin/VFX pipeline explicitly as scaffolding for future gameplay differentiation; gather perception feedback early.

## 16. IMPLEMENTATION CHECKLIST (ACTIONABLE)
Core (existing, verify polish):
- [ ] Movement interpolation stable at varying `speedMs`.
- [ ] Death fragmentation performance OK under max length.
- [ ] Particle cap never exceeded.
Customization (must-have):
- [ ] All free + priced skins appear with price badges.
- [ ] Equip state persists via localStorage.
- [ ] Locked skin feedback (shake + aria-live) works.
Accessibility:
- [ ] Canvas focus after overlay close.
- [ ] Modal focus trap & ESC close.
- [ ] Aria-live purchase / insufficient funds messages.
Polish:
- [ ] Blink intervals feel organic (2.5–6s).
- [ ] Eat and death animations feel “weighty” (tweak lifetimes if needed).
- [ ] Performance test on Safari baseline.

## 17. ASSUMPTIONS & OPEN ITEMS
Assumptions:
- Coins per food remain flat for prototype (no scaling).
- No device pixel ratio scaling changes beyond current DPR handling.
- Testing group informal; no automated telemetry.
Open Items (can decide later without blocking):
- Whether to enable difficulty ramp (currently off).
- Whether to add a temporary “Low Effects” toggle in settings for testers with low-end hardware.
- Final visual tone for Game Over screen (already styled, just ensure contrast AA compliance).

---

If you want any edits, a shorter summary, or want this placed in a different path/name (for example `docs/PROTOTYPE_DESIGN.md`), tell me and I will update it.
