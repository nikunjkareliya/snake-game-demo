# Next Feature Options

Great work getting patrol orbs working! Here are the **top 5 next feature options** based on the current game state:

---

## **Option 1: Time Crystal Booster** ⭐ *Recommended*
**Type:** First Booster Implementation
**Complexity:** Medium (3-4 hours)

Add collectible power-ups that extend the Flow window timer. This introduces the booster system infrastructure and balances the hazard-heavy gameplay with positive rewards.

### What you'll build:
- Booster spawn system with weighted odds
- Pickup collision detection
- Flow timer extension effect (+2 seconds)
- Cyan crystal visual with rotation animation
- HUD badge showing active effect

### Why it's great:
Balances threats (hazards) with rewards (boosters), creates foundation for 7 more booster types, synergizes with existing Flow system.

---

## **Option 2: Sound Effects & Audio Feedback** 🔊
**Type:** Polish & UX Enhancement
**Complexity:** Medium (4-5 hours)

Implement Web Audio API integration with sound effects for key events: eating, hazard warnings, tier changes, flow tier ups, death, and ambient music.

### What you'll build:
- Audio manager module
- Sound integration for food, hazards, flow, death
- Audio telegraph for hazard activation (warning beep)
- Volume controls in settings
- Background ambient music loop

### Why it's great:
Massive improvement to game feel, addresses design doc emphasis on "audio telegraphing" for hazards, enhances accessibility.

---

## **Option 3: Hazard Cluster Formations** 🟥🟥
**Type:** Static Hazard Enhancement
**Complexity:** Simple (1-2 hours)

Extend static hazards to spawn in connected groups (L-shapes, lines, T-shapes) instead of single cells. Adds spatial complexity and area denial.

### What you'll build:
- Cluster shape definitions (3-4 patterns)
- Multi-cell spawn validation logic
- Progressive unlock in TIER_SCRIPT (Tier 5+)
- Existing rendering already works!

### Why it's great:
Quick win, meaningful gameplay impact, tests tier script variant spawning, adds visible polish with minimal code.

---

## **Option 4: Spiral Drone Hazard** 🌀
**Type:** Dynamic Hazard Expansion
**Complexity:** Medium (2-3 hours)

Add a drone that orbits in a circular pattern around a fixed pivot point. Complements patrol orb's linear movement with circular motion.

### What you'll build:
- Circular orbit movement calculation
- Curved trail rendering
- Configuration in TIER_SCRIPT (unlock at Tier 8+)
- Reuses existing hazard infrastructure

### Why it's great:
Builds directly on patrol orb code, adds spatial variety, requires new dodging strategies, logical difficulty progression.

---

## **Option 5: Portal Pair Mechanic** 🌌
**Type:** Spatial Remix Hazard
**Complexity:** Complex (4-6 hours)

Implement teleportation cells that transport the snake from entry to exit while preserving direction. Creates strategic routing decisions.

### What you'll build:
- Portal pair spawning with matching IDs
- Teleportation logic with direction preservation
- Exit position safety validation
- Swirling vortex visual effect
- Cooldown system (0.5s invulnerability)

### Why it's great:
Unique mechanic, high player engagement, creates synergies with future Portal Catalyst booster, fundamentally changes spatial gameplay.

---

## Recommendation Priority

Based on **game design philosophy** (balance threats with rewards) and **momentum**:

1. **Option 1 (Time Crystal Booster)** - Balances hazard work with rewards, creates booster infrastructure
2. **Option 2 (Sound Effects)** - Major UX improvement, enhances hazard telegraphing
3. **Option 3 (Hazard Clusters)** - Quick win, incremental enhancement
4. **Option 4 (Spiral Drone)** - Hazard variety, builds on existing code
5. **Option 5 (Portal Mechanic)** - Complex but high impact

---

## Status Summary

### ✅ Recently Completed
- Static Hazards with telegraph system
- Patrol Orbs (moving hazards with trails)
- Tier-based auto-spawning system
- Hazard collision detection
- Notification system for hazard unlocks

### ✅ Previously Completed
- Flow System (chain-eating multiplier)
- Difficulty Progression (food-based tiers 0-10)
- Coin Economy & Skin System
- HUD System with visual feedback
- Core gameplay mechanics

### ⏳ Not Yet Implemented
- Boosters (0/8 types)
- Additional Hazards (0/9 types): Spiral Drone, Laser Sweep, Portals, Crumble Cells, Shifter Zones, Ghost Snake, Clusters
- Phase Rotation System
- Time Multiplier scoring
- Advanced scoring mechanics
- Adaptive Assist system
