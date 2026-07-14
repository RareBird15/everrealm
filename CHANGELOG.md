# Changelog

All notable changes to Everrealm will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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