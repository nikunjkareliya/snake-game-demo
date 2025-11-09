# MVP Goal — Snake Frenzy (Web)

## 🎯 Goal
Ship a polished, performant neon snake game for the web with smooth animation, keyboard-first controls, basic progression (score + coins), a replay loop, and skin customization — ready to host as a static site.

---

## ✅ Current Feature Inventory (implemented)
- Core loop with requestAnimationFrame + tick gating (`src/main.js`).
- Smooth movement interpolation (prevSnake + moveProgress).
- Snake movement, growth, wall & self collision (`src/snake.js`).
- Food spawning + ambient particles (`src/food.js`).
- Particle system + motion trails + death fragmentation (`src/particles.js`, `src/death.js`).
- Multiple skins (gradient/pattern/animated/special) and customization UI (`src/config.js`, `src/ui.js`).
- HUD with coin & food counters; persistence of currency & high score (`src/utils.js`, `src/state.js`).
- Settings modal (sound/music toggles, speed slider) with focus trap (`src/ui.js`).
- Tongue + blink animations and many visual polish elements (`src/render.js`).
- Keyboard input (WASD/Arrows, Space pause, R restart) (`src/input.js`).
- Modular single-source-of-truth state (`src/state.js`).

---

## 🚫 Key Gaps (pre-MVP)
- No implemented audio (settings toggles are placeholders).
- No touch or on-screen controls for mobile.
- Accessibility audit incomplete (ARIA and focus states partial).
- No deployment artifacts (favicon, README, meta tags).
- Economy is minimal: all skins free; shop logic present but pricing absent.
- No achievements, powerups, or daily rewards (out-of-scope for MVP).

---

## 🧱 MVP Scope (Lean)
**Must have:**
- Smooth, reliable gameplay with growth and death loop.
- Score & coin accumulation with persistence across sessions.
- Food spawning reliably on empty cells.
- Pause/resume with visual feedback.
- Skin customization and at least 3 visibly different skins.
- Playable on desktop + responsive to tablet widths.
- Accessibility basics: keyboard playability, focusable canvas, modal focus trap.
- Static deployable build (GitHub Pages or similar).

**Nice-to-have (stretch):**
- One purchasable skin to validate economy flow.
- Minimal audio for eat/death/click.
- Basic touch D-pad or swipe input for mobile.

---

## 🗂️ MVP Milestones
Prioritized with UX emphasis; mobile deferred.

| Priority | Area | Task | Acceptance Snapshot |
|----------|------|------|---------------------|
| P0 | Core Gameplay | Confirm interpolation + growth stable at variable `speedMs` | No head jump, tail grow anim always finishes |
| P0 | UX/Feedback | Add visible pause indicator (overlay text or HUD badge) | Press Space shows PAUSED, resumes cleanly |
| P0 | Economy | Assign prices to 3 skins (`python` 30, `electric` 60, `inferno` 90) + enforce purchase | Buy deducts coins, persists reload |
| P0 | Accessibility | Keyboard focus outline on all buttons + aria-live for purchase feedback | Tab cycle works, screen reader announces purchase |
| P1 | Economy UX | Disabled style + tooltip/aria for insufficient coins | Attempt buy -> brief shake + aria-live message |
| P1 | Persistence | Graceful fallback if localStorage fails (try/catch wrappers) | Game still runs, shows non-persistent session |
| P1 | Performance | Optional low-GPU mode toggle (reduce shadows/particle cap) | Toggle lowers particle count & blur values |
| P1 | Deployment | README quick start + favicon + meta theme-color | Repo ready for static host |
| P2 | Audio | Add 3 sounds (eat/death/click) respecting settings toggles | Toggling soundOn disables SFX instantly |
| P2 | Difficulty Curve | Speed ramps every 5 food (floor 70ms) + small HUD flash | Food milestone reduces `speedMs` step |
| P3 (Low) | Mobile Controls | Add simple D-pad OR swipe; prevent scroll | Touch input moves snake reliably |

### Condensed Implementation Order
1. P0 batch (core stability, pause feedback, pricing, accessibility foundations).
2. P1 batch (economy polish, persistence fallback, performance toggle, deployment artifacts).
3. P2 batch (audio + difficulty ramp).
4. P3 batch (mobile controls) — only after desktop polish validated.

### Exit Criteria for MVP Ship
All P0 & P1 tasks completed and verified; P2 optional but nice; P3 excluded unless trivial.

---

## 🔍 Acceptance Criteria
**Gameplay**
- Movement stays smooth; no teleportation artifacts.
- Eating always spawns new food on an empty cell.
- Death triggers particles + game-over overlay reliably.

**Economy (MVP)**
- Three priced skins visible with cost badges; purchase only enabled when balance >= price.
- Buying persists across reloads.

**UI/UX & Accessibility**
- Canvas regains focus after overlays close.
- Pause state displays clear visual status (center text or HUD badge).
- Modal traps focus (Tab cycles inside) and allows ESC to close.
- All interactive elements show a visible focus outline (WCAG 2.4.7 compliant).
- aria-live region announces purchases & insufficient coin attempts.

**Persistence**
- High score & currency & owned skins persist via localStorage with graceful fallback.

**Performance**
- Game runs smoothly on modern browsers; particle cap enforced.

---

## 🧪 Test Scenarios
1. Eat 10 food: food counter increments; optional speed ramp triggers if enabled.
2. Buy each priced skin: coin deduction correct; reload retains ownership; equip works.
3. Attempt purchase without coins: button disabled OR feedback (shake + aria-live message).
4. Pause mid-interpolation: resume causes no positional snap.
5. Self-collision vs wall death both produce death particles and overlay; currency added once.
6. Rapid direction spam never produces 180° reversal; `nextDirection` sanitizes input.
7. Toggle speed slider during game: next tick uses new `speedMs` (interpolation stays smooth).
8. Low-GPU mode reduces particle count (visual inspection + dev log).
9. Focus order: Tab cycles lobby buttons -> settings modal controls -> returns to canvas.
10. Audio off: no sound events fired (console log or silent playback) after toggle.

---

## ⚠️ Risks & Mitigations
- Visual heavy effects may drop FPS on weak devices — add a low-GPU mode to reduce shadowBlur and particle counts.
- Audio autoplay blocks — lazy-init audio on first user gesture.
- LocalStorage errors — use try/catch and fall back to in-memory state.

---

## 📊 Example Skin Pricing (MVP)
Only the default skin (`neon`) is free in MVP; all other skins are unlocked with coins. This validates the purchase flow and ensures players can meaningfully spend currency from early play.

### Current Skins (9) — MVP pricing
| ID | Name | Type | Tier | Price (Coins) | MVP Status |
|----|------|------|------|---------------:|------------|
| neon | Neon | gradient | basic | 0 | Free (default owned) |
| python | Python | pattern | pattern | 30 | Unlockable |
| cosmic | Cosmic | pattern | special | 50 | Unlockable |
| circuit | Circuit | pattern | special | 50 | Unlockable |
| electric | Electric | animated | special | 60 | Unlockable |
| holographic | Holographic | animated | special | 80 | Unlockable |
| inferno | Inferno | animated | special | 90 | Unlockable |
| crystal | Crystal | special | special | 100 | Unlockable |
| phantom | Phantom | special | special | 120 | Unlockable |

Post-MVP plan: consider tiered/dynamic pricing or dual-currency options later (e.g., food OR coins for some pattern skins).

(Prices chosen for MVP are conservative to encourage early purchases while leaving room for tuning post-launch.)

---

## 🛠️ Minimal Data Model Extensions (if implementing pricing)
- Add `price` to selected skin entries in `src/config.js`.
- `state.ownedSkins` already exists; use it to determine locked/unlocked.
- Persist purchases with existing storage utilities.

---

## 🛣️ Lean Implementation Order
Phase 0 (Foundations): pricing (3 skins), pause indicator, accessibility baseline (focus outlines, aria-live), purchase gating.

Phase 1 (Polish): insufficient coin feedback, low-GPU toggle, persistence resilience, deployment assets.

Phase 2 (Enhance): audio hooks, difficulty ramp, economy messaging improvements.

Phase 3 (Deferred): mobile touch controls (D-pad or swipe) after desktop QA.

### Skin Pricing Evolution (Post-MVP Outline)
- Phase A: Assign prices to remaining animated/pattern/special skins (holographic, cosmic, circuit, crystal, phantom).
- Phase B: Introduce dual-currency options (coins OR food) for pattern skins.
- Phase C: Add rarity badges & dynamic pricing adjustments based on usage stats.

---

## ✅ Next Steps (pick one)
- Implement Phase 1 (price & shop flow) 
- Do an accessibility pass & fixes.
- Add minimal touch controls for mobile.


*Document created from project code inspection (Nov 2025).* 
