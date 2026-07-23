# Changelog

All notable changes to Everrealm will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-07-22

### Added
- **Pochteca Expeditions.** A new action — Send Pochteca Expedition — lets players spend Cacao to send long-distance merchants to 8 destinations that unlock progressively by Age. Each expedition has a cost, a travel time in turns, and two possible rewards (50/50). Rewards include production bonuses, research cost reductions, lump-sum Cacao, and land parcels. Maximum 2 concurrent expeditions. Expedition bonuses integrate directly into the economy: production multipliers boost Cacao per turn, research discounts reduce all research costs, and flat income adds per turn. This is the sixth game action, directly addressing player feedback that the game needed more to do after completion.
- **Realm Chronicles.** When the player ascends, the game now generates a prose narrative of their realm's history. The chronicle weaves together research completed, settlements built, specializations chosen, expeditions sent, and turns taken into a shareable story under 500 words. The chronicle appears on a new screen after ascension with Copy, View Past Chronicles, and Begin New Realm buttons. Chronicles are saved in `prestige.chronicles` and persist across playthroughs.
- **ExpeditionPanel UI component.** New section in the game screen with a destination dropdown, detail view showing cost/turns/possible rewards, pending expeditions list, and active bonuses list. Appears starting from the Age of Growth.
- **ChronicleScreen UI.** New post-ascension screen displaying the generated chronicle with clipboard copy support.
- **CSS styles** for expedition panel, chronicle screen, select dropdowns, and legacy selection.
- **Tests** for expedition sending, resolution, ticking, destination availability, story records, and chronicle generation (15 new tests, 104 total).

### Changed
- **Spec updated.** Game Actions section updated from 5 to 6 actions. New Part V (Pochteca Expeditions) and Part VI (Realm Chronicles) added to the design spec. All subsequent parts renumbered.
- **Save backward compatibility.** Older saves from v1.0.x are automatically backfilled with empty expedition arrays and chronicles. No save migration required — existing saves load without issues.

---

## [1.0.2] — 2026-07-19

### Fixed
- **Research cost scaling.** Research costs now scale with settlement count to prevent blitzing. First 10 settlements: base cost. 50 settlements: 2.2x. 100: 3.7x. 1000+: 30x+. A focused realm progresses faster than one that expands recklessly.
- **Batch specialize combo box descriptions.** Building type dropdown was truncating descriptions to 60 characters. Now shows just the building name in the dropdown, with full description below when selected.

---

## [1.0.1] — 2026-07-19

### Fixed
- **Settlement list accessibility.** Late-game settlement lists with thousands of entries were rendering one line per settlement. Settlements are now grouped by tier and specialization with a count, reducing 3,000+ lines to about 15.

---

## [1.0.0] — 2026-07-19

### Added
- **Complete v0.3 redesign.** Removed merge mechanic, chain reactions, and settlement stacks. Added research-based upgrades, land parcels, specialization locks, Age-layered mechanics, synergy system, unique power buildings, and prestige system with legacy slots.
- **Sound effects.** Web Audio API tones for key events, off by default.
- **Theme and text size settings.** Dark/light theme toggle and normal/large/extra-large text sizes, saved to localStorage.
- **About page** with game info and credits.

---

## [0.2.0] — 2026-07-14

### Added
- **Age-gated content system.** Technologies, improvements, and special buildings now unlock based on your current Age. Tier 2 content requires the Age of Growth; Tier 3 content requires the Age of Lords; and so on through all six Ages.
- **Tier 3 tech tree (Age of Lords).** Three new discoveries — Masonry, Banking, and Medicine — each unlocking a new special building:
  - **Shrine** — boosts discovery rewards (+50 per Shrine)
  - **Bank** — increases passive income rate (+8% per Bank)
  - **Apothecary** — expands settlement capacity (+2 per Apothecary)
- **Tier 3 improvements (Age of Lords).** Three new realm improvements: Great Walls (+100/hr passive), Cathedral (+150 discovery rewards), and Trading Company (+5 active rewards).
- **Framework for Tiers 4–6.** Tech nodes, improvements, and special buildings are defined for the Golden Age, Age of Legends, and Age of Myths. Each Age will introduce 3 new techs, 3 new improvements, and 3 new special buildings. These use existing effect types for now; unique mechanics are planned for future versions.
- **Onboarding tips.** The first three turns now display contextual hints teaching the core loop: establish settlements, develop by merging, and build toward Citadels to advance.
- **Age transition narrative.** When you advance to a new Age, the story log now tells you what new discoveries and improvements have become available.
- **New keyboard shortcuts.** Shrine (S), Bank (B), Apothecary (P), Cathedral (R), Embassy (J), Observatory (K), Garden (X), Laboratory (Y), and Hero's Hall (Z).
- **New error messages.** Age-gated content attempts now produce user-friendly messages instead of generic errors.
- **Save migration.** Save version bumped to 2. Old saves from 0.1 load without issues; missing fields are filled with defaults.
- **Migration tests.** Automated tests verify that v1 saves load correctly under the new schema.

### Changed
- **Generalized bonus calculations.** Special building bonus helpers in the engine now check by effect kind rather than hardcoded building names, making it easier to add new buildings without modifying engine logic.
- **UI lists filtered by Age.** The Discoveries and Improvements panels only show content available for your current Age, reducing clutter and giving players a clearer sense of progression.

### Fixed
- **Age gating enforcement.** In 0.1, all techs and improvements were available from the Founding Age regardless of intended tier. The engine now rejects unlock and purchase attempts for content that hasn't been reached yet.

---

## [0.1.0] — 2026-07-13

### Added
- **Core game loop.** Establish settlements, develop them by merging pairs into higher-level buildings, and guide your realm through six Ages.
- **Six Ages.** Founding Age, Age of Growth, Age of Lords, Golden Age, Age of Legends, and Age of Myths. Advancing requires 2 Citadels and 200 Prosperity.
- **Ten-level settlement progression.** Tent → Hut → Cottage → House → Manor → Hamlet → Village → Town → City → Citadel.
- **Tech tree (Tiers 1–2).** Six discoveries across two tiers:
  - Tier 1 (50 Prosperity each): Agriculture (Farm), Trade (Market), Crafts (Workshop)
  - Tier 2 (200 Prosperity each): Scholarship (Library), Governance (Town Hall), Engineering (Aqueduct)
- **Six special buildings.** Farm, Market, Workshop, Library, Town Hall, and Aqueduct — each unlocked via the tech tree with minimum source level requirements.
- **Ten realm improvements.** Stone Roads, Market Charter, Guild Hall, Town Watch, Royal Treasury, Grand Library, Colonnade, Royal Mint, Ancient Ruins, and Monument.
- **Chain reaction mechanic.** Early-game merges cascade automatically. Once any technology is unlocked, chains stop so the player can choose whether to merge or branch into special buildings.
- **Passive income.** Base rate of 120 Prosperity per hour, boosted by improvements and special buildings. Accrues while away and reconciles on load.
- **Local save system.** Game state persists in browser localStorage. No account required.
- **Screen-reader-first accessibility.** Fully keyboard-driven with shortcuts for every action. Semantic HTML, ARIA live regions for announcements, no visual information required to play. No dragging, no spatial reasoning, no color-coded anything.
- **Cross-platform screen reader support.** Confirmed working with NVDA/Chrome, Orca/Firefox/Linux, VoiceOver/iOS Safari, and JAWS/Chrome.
- **Downloadable offline version.** Available as a .zip release on GitHub.