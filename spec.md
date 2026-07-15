# Everrealm

## Game Design Specification

**Version:** 0.3 (Draft)

---

## Elevator Pitch

Build a peaceful fantasy realm by establishing settlements, researching upgrades
that transform your civilization, choosing how to specialize your communities,
and guiding your realm through six Ages — then ascended into a permanent legacy
that shapes your next playthrough.

Everrealm is designed from the ground up for screen readers while remaining
enjoyable for everyone. No merging. No clicking 256 times. Decisions, not
repetition.

---

## Part I – Vision

### Vision

Everrealm is a calm kingdom-building strategy game whose core mechanic is
research-based progression. The player makes strategic decisions: what to
research, when to specialize, how to expand, and when to advance to a new Age.

Each Age introduces a new mechanic layer, so the game gets deeper as you go —
but never more complicated all at once. The game is about composing a realm,
not grinding through it.

### Design Principles

1. **Screen-reader first.** Every action has a keyboard shortcut. All
   information is available as text. No visual information is required to play.
2. **Decisions over repetition.** No merge mechanics. No batch clicking. Each
   action is a meaningful choice.
3. **Calm pacing.** No combat, no timers, no fail states. The game proceeds at
   the player's pace.
4. **Layered complexity.** Each Age adds one new mechanic on top of the
   previous ones. The game teaches itself gradually.
5. **Flexible play styles.** Active and passive play are both viable. The
   player can switch between them based on their energy and preferences.
6. **Legacy, not just bigger numbers.** The prestige system gives players a
   specific, strategic bonus that changes how the next playthrough feels — not
   a generic multiplier.

### Accessibility Commitment

- Fully keyboard-driven. Every action has a shortcut.
- Semantic HTML with ARIA live regions for announcements.
- No visual information required to play. No dragging, no spatial reasoning,
  no color-coded information.
- Saves locally in the browser. No account needed.
- Works with NVDA, JAWS, VoiceOver, and Orca.

---

## Part II – Core Systems

### Settlements

Settlements are the foundational game unit. Each settlement occupies one land
parcel and exists at a specific tier. New settlements are always established at
the player's current base tier (determined by their research progress).

**Settlement chain (9 standard levels):**

| Level | Name | Description |
|-------|------|-------------|
| 1 | Tent | Temporary shelter, the starting point |
| 2 | Hut | Simple permanent shelter, basic materials |
| 3 | Cottage | A small house, built with better materials |
| 4 | House | A proper dwelling, the baseline of settled life |
| 5 | Homestead | A self-sufficient property with land |
| 6 | Village | A cluster of homesteads with shared resources |
| 7 | Town | A center of commerce with markets and trades |
| 8 | City | A major population center with walls and institutions |
| 9 | Capital | The seat of your realm, the center of power |

**Capital is the top of the chain.** No settlement upgrades exist beyond
Capital. The Age of Legends and Age of Myths shift the game to specialization
and transformation instead of further settlement progression.

**Specialized settlements:** A settlement can be specialized into a prosperity
building instead of upgrading. It locks at its current tier and produces an
ongoing bonus. The choice is: upgrade this settlement when you research the
next tier, or lock it for income.

### Land Parcels

Land parcels replace the abstract "capacity" system. Each settlement occupies
one parcel. The player starts with a limited number of parcels and can expand
through research, improvements, and Age advancement.

- Starting parcels: 5
- Expanded through: Town Hall specializations, realm improvements, and Age
  advancement bonuses
- Specialized settlements still occupy their parcel

Land parcels make capacity feel physical — your realm has borders, and those
borders grow as your civilization develops.

### Prosperity

Prosperity is the primary game currency, earned passively and through actions.

**Passive income:** Each settlement generates passive income based on its tier.
Higher-tier settlements produce more. Specialized settlements produce bonuses
on top of their base tier income. Realm improvements and special buildings add
multipliers.

**Active income:** Researching upgrades, discovering new building types, and
advancing Ages all award prosperity.

**Spending prosperity:** The player spends prosperity to establish
settlements, research upgrades, buy land, purchase realm improvements, and
advance Ages. Research costs scale up within each Age and across Ages.

### Research

Research is the core progression mechanic. Instead of merging buildings, the
player researches upgrades that transform ALL settlements (existing and new) to
the next tier. Research also unlocks specialization options.

**Two research tracks per Age:**

- **Settlement upgrades:** Transform all settlements to the next tier. Two per
  Age (Founding through Golden). None in Legends or Myths (Capital is the top).
- **Specialization researches:** Unlock prosperity buildings that settlements
  can be specialized into. Three per Age in Founding through Golden, five in
  Legends, four in Myths.

**Total: 30 researches across 6 Ages.**

Each research changes the game in a visible way. No filler researches. No
"bronze hoes → iron hoes → steel hoes." Every research is a meaningful
decision.

### Specialization

When a player specializes a settlement, it locks at its current tier and
becomes a prosperity building. The bonus is flat regardless of the tier at
which the player specializes — the decision is "upgrade this settlement or
lock it for income," not "what level do I specialize at for max benefit."

**How specialization evolves across Ages:**

- **Founding Age:** Flat bonuses (Farm gives +food, Market gives +income, etc.)
- **Age of Growth:** Realm-wide effects (Library boosts discovery across
  everything, Town Hall expands land for all, Aqueduct multiplies passive rate)
- **Age of Lords:** Specializations interact with each other (Manor scales with
  other specializations, Bank rewards stacking, Observatory makes Libraries
  stronger)
- **Golden Age:** Synergy across Ages (Factory scales with Farms and
  Workshops, Embassy scales with Markets and Town Halls, Academy scales with
  Libraries and Observatories)
- **Age of Legends:** Unique power (each building does something no other
  building does — active income, research cost reduction, realm-wide
  multipliers, specialization scaling, future information)
- **Age of Myths:** Transformation-focused (buildings count toward ascension)

### Ages (6)

Each Age introduces one new mechanic layer on top of the previous ones. The
game gets deeper, but never more complicated all at once.

**Founding Age (Age 0) — The Basics**
Core loop: establish settlements, earn prosperity, research first upgrades,
discover specialization. The game teaches itself here.

**Age of Growth (Age 1) — Specialization**
Specialization unlocks. The player now has a real choice: upgrade or
specialize. The decision space widens. Realm-wide effects begin.

**Age of Lords (Age 2) — Interaction**
Specializations start interacting with each other. A Manor scales with your
other specializations. A Bank rewards stacking. An Observatory makes your
old Libraries stronger. Your choices start building on each other.

**Golden Age (Age 3) — Synergy**
Specializations feed into each other across Ages. A Factory scales with your
Farms and Workshops from the Founding Age. An Embassy scales with your Markets
and Town Halls. An Academy scales with your Libraries and Observatories. The
game becomes about composing your realm, not just building it.

**Age of Legends (Age 4) — Unique Power**
Five mechanically unique buildings, each doing something no previous building
does. Active income, research cost reduction, realm-wide multipliers,
specialization scaling, future information. The game shifts from "bigger
numbers" to "new kinds of power." No settlement upgrades — Capital is the top.

**Age of Myths (Age 5) — Transformation**
The endgame. Build legendary buildings, research the transformation, ascend
your Capital into a permanent legacy, and begin a new playthrough with that
bonus. No settlement upgrades — the game is about transformation, not growth.

### Advancement

To advance to the next Age, the player must research the top-tier technology
for their current Age. This replaces the "2 Citadels" gate from the previous
design.

### Game Actions (5)

| Action | Description |
|--------|-------------|
| **Establish Settlement** | Spend prosperity, use a land parcel, create a settlement at current base tier |
| **Research Upgrade** | Spend prosperity, all settlements upgrade to next tier OR unlock new specialization |
| **Specialize Settlement** | Choose a settlement, lock it at current tier, it becomes a prosperity building |
| **Buy Land** | Spend prosperity, gain a land parcel |
| **Advance Age** | Requires top-tier tech researched; unlocks new content |

### Turn Structure

The game is turn-based. Each action advances the turn counter. Passive
prosperity accrues between turns based on elapsed time and settlement tiers.
Screen reader announcements are prefixed with the turn number for uniqueness.

---

## Part III – Research Tree

### Founding Age (5 researches)

**Settlement upgrades:**

| Research | Effect | Description |
|----------|--------|-------------|
| Woodcutting | Tent → Hut | Your people learn to harvest trees and build simple permanent shelters. |
| Plasterwork | Hut → Cottage | Your people learn to mix mud, clay, and straw to fill gaps in walls and make homes that keep out the weather. |

**Specializations:**

| Research | Building | Effect | Description |
|----------|----------|--------|-------------|
| Agriculture | Farm | +passive income, food bonus | Your people learn to cultivate the land instead of foraging. |
| Trade | Market | +passive income, commerce bonus | Your people learn to exchange goods between settlements. |
| Crafts | Workshop | +passive income, establish cost reduction | Your people learn to make tools and goods by hand. |

### Age of Growth (5 researches)

**Settlement upgrades:**

| Research | Effect | Description |
|----------|--------|-------------|
| Masonry | Cottage → House | Your people learn to cut and stack stone. Walls become solid and permanent. |
| Metalworking | House → Homestead | Your people learn to smelt ore and forge tools. Homesteads are self-sufficient properties built with iron tools. |

**Specializations:**

| Research | Building | Effect | Description |
|----------|----------|--------|-------------|
| Scholarship | Library | +discovery reward (realm-wide) | Your people learn to record knowledge and pass it between settlements. |
| Governance | Town Hall | +land parcels | Your people learn to organize beyond individual households and manage territory. |
| Engineering | Aqueduct | +passive rate multiplier (realm-wide) | Your people learn to move water, build roads, and connect settlements. |

### Age of Lords (5 researches)

**Settlement upgrades:**

| Research | Effect | Description |
|----------|--------|-------------|
| Glassmaking | Homestead → Village | Your people learn to melt sand into glass. Windows, lenses, light. A village is a place where people can see inside their homes. |
| Gemcutting | Village → Town | Your people learn that the shiny rocks from the mine have value. Gems become currency, status, trade goods. A town is a center of commerce. |

**Specializations:**

| Research | Building | Effect | Description |
|----------|----------|--------|-------------|
| Estate Management | Manor | +passive income, scales with total specializations | Your people learn to run large, organized estates. The more your realm is organized, the more efficient each estate becomes. |
| Banking | Bank | +passive rate multiplier, scales per Bank built | Your people learn to store and lend wealth. Banks reward commitment — one gives a small boost, three give a much bigger one. |
| Astronomy | Observatory | +discovery reward, scales with Libraries | Your people learn to study the stars. Each Observatory makes your old Libraries more valuable. |

### Golden Age (5 researches)

**Settlement upgrades:**

| Research | Effect | Description |
|----------|--------|-------------|
| Architecture | Town → City | Your people learn to design and build on a grand scale. A city is planned, organized, with districts and infrastructure. |
| Urban Planning | City → Capital | Your people learn to build a seat of power. A capital organizes everything else around it. |

**Specializations (synergy — each scales with buildings from previous Ages):**

| Research | Building | Scales With | Description |
|----------|----------|-------------|-------------|
| Industry | Factory | Farms + Workshops | Your early-game specializations feed into mid-game power. Each Farm and Workshop makes your Factory stronger. |
| Diplomacy | Embassy | Markets + Town Halls | Trade and governance infrastructure makes diplomacy more effective. Each Market and Town Hall expands your Embassy's land bonus. |
| Philosophy | Academy | Libraries + Observatories | Knowledge buildings feed each other. Each Library and Observatory makes your Academy's discovery bonus stronger. |

### Age of Legends (5 researches — all specializations, no settlement upgrades)

Each building does something mechanically unique. No "bigger numbers."

| Research | Building | Effect | Description |
|----------|----------|--------|-------------|
| Heroism | Hero's Hall | Active income per turn (flat, unique) | A legendary figure whose deeds generate wealth directly. No other building produces active income. |
| Alchemy | Laboratory | Reduces all future research costs (permanent, unique) | Each Laboratory makes everything cheaper — not just the next research, all of them. |
| Sacred Geometry | Temple | Realm-wide passive multiplier (unique scale) | One Temple multiplies all passive income across your entire realm. |
| Garden Cultivation | Garden | Prosperity per turn per specialization (unique scaling) | Each Garden generates income for every specialized settlement you have. Rewards commitment to specialization. |
| Prophecy | Oracle | Reveals next Age's researches before advancing (unique information) | Strategic advantage — plan your realm for what's coming instead of advancing blind. |

### Age of Myths (4 researches — transformation focus, no settlement upgrades)

| Research | Effect | Description |
|----------|--------|-------------|
| Mythology | Unlocks Temple building (counts toward ascension) | Your civilization begins to build things of legendary significance. |
| Divinity | Unlocks Oracle's Sanctum (realm-wide multiplier, counts toward ascension) | The biggest passive multiplier in the game. The more sanctums, the closer to ascension. |
| Eternity | Unlocks the transformation action | Your civilization can now ascend. |
| Ascension | Unlocks the prestige system | Transform your Capital into a permanent legacy and begin a new playthrough. |

---

## Part IV – Prestige System

### Ascension

When the player researches Ascension and has enough legendary buildings, they
transform their Capital into one of five legacies. The realm resets, but the
legacy carries forward as a permanent bonus to the next playthrough.

### Legacy Options (5)

| Legacy | Bonus | Play Style |
|--------|-------|-----------|
| Eternal Spire | +10% passive income across all future playthroughs | Wealth-focused |
| Founders' Monument | Start each new game with one Founding Age tech already researched | Skip early game |
| Crystal Palace | Specializations are 25% stronger in future games | Specialization-focused |
| Garden of Eternity | Start with 2 extra land parcels in every future game | Expansion-focused |
| Library of Ages | See the next Age's researches before advancing in every future game | Planning-focused |

### Legacy Slots

The player can hold up to **3 legacy bonuses** at once. When prestiging for the
4th time, the player chooses: keep their current 3, or replace one with the new
legacy.

- After 1 prestige: 1 bonus. Noticeable but not trivial.
- After 2 prestiges: 2 bonuses. Synergies begin to emerge.
- After 3 prestiges: 3 bonuses. This is your "build" — a combination that
  defines how you play.
- After 4+ prestiges: Swap. Keep your build or try something new.

This gives the game replayability without power creep. Different combinations
of 3 bonuses create different play styles and strategic decisions.

---

## Part V – Age Layering Summary

Each Age adds one new mechanic layer:

| Age | New Mechanic |
|-----|-------------|
| Founding | Basics — establish, research, earn |
| Growth | Specialization — upgrade or lock for income |
| Lords | Interaction — specializations affect each other |
| Golden | Synergy — specializations scale across Ages |
| Legends | Unique power — mechanically distinct buildings |
| Myths | Transformation — ascension and legacy |

The game never dumps complexity on the player. Each layer builds on what came
before. By the Age of Myths, the player has been playing for a while and the
complexity feels earned.

---

## Part VI – Realm Improvements

Realm improvements are realm-wide bonuses purchased with prosperity. They
exist alongside the specialization system and provide another way to spend
prosperity.

The improvement system from previous versions can largely carry forward, with
adjustments for the new land parcel system and the removal of merging. Exact
improvement definitions will be finalized during implementation.

---

## Part VII – Open Questions

The following will be finalized during implementation:

- Exact research costs and balance constants
- Starting prosperity and passive income rates
- Land parcel counts and expansion costs
- Exact specialization bonus values
- How many legendary buildings are needed for ascension
- What realm improvements look like in the new system
- Save migration from 0.2.x saves (likely a new-game reset)
- Whether existing saves can migrate at all or require a fresh start

---

## Part VIII – Comparison to Previous Design (0.1–0.2.x)

### What changed

- **Removed:** Merge mechanic, chain reactions, settlement stacks, 256-tent
  grinding, "cookie clicker" late game
- **Added:** Research-based upgrades, land parcels, specialization locks,
  Age-layered mechanics, synergy system, unique power buildings, prestige
  system with legacy slots
- **Changed:** Advancement gate (top-tier tech instead of 2 Citadels),
  capacity (land parcels instead of abstract number), passive income (scales
  with settlement tier instead of flat rate)

### What stayed

- Screen-reader-first accessibility
- Turn-based structure
- 6 Ages
- Calm, peaceful tone
- No combat, no timers, no fail states
- Settlement chain (9 levels, renamed)
- Specialization concept (now central instead of optional)
- Realm improvements
- Local browser saves

---

## Part IX – Inspiration and Differentiation

### Inspired by Evolve Incremental

- Deep tech trees with meaningful choices
- Age-based progression
- Prestige system that changes the next playthrough

### Different from Evolve

- No repetitive clicking or resource gathering
- No "same techs with bigger numbers" filler
- Each Age adds a new mechanic, not just new cosmetics
- Prestige gives specific strategic bonuses, not generic multipliers
- Designed for screen readers from the ground up
- Fewer researches (30 vs hundreds), but each one matters

### Core identity

Everrealm is a game about **decisions, not repetition**. Every action is a
choice. Every research transforms your realm. Every specialization is a
commitment. Every Age adds something new. And every ascension leaves a legacy
that changes how you play next time.