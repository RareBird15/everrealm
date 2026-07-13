# Everrealm

## Game Design Specification

**Version:** Draft 0.5

---

## Elevator Pitch

Build a peaceful fantasy realm by establishing settlements, developing them into
thriving communities, investing in lasting improvements, and guiding your
civilization through successive Ages.

Everrealm is designed from the ground up for screen readers while remaining
enjoyable for everyone.

---

## Part I – Vision

### Vision

Everrealm is a calm kingdom-building strategy game whose core mechanic is
developing settlements through merge mechanics.

The player is not collecting objects. The player is guiding a realm through
successive Ages. Merge mechanics are simply the way civilization grows, not the
end goal.

The game minimizes spatial reasoning and instead emphasizes thoughtful planning,
meaningful decisions, and satisfying long-term progression.

The game should be equally enjoyable for blind and sighted players.

---

### Design Principles

- Screen-reader first, not screen-reader compatible.
- Minimize spatial memory requirements.
- Every common action should require as few keystrokes as possible.
- Strategy should come from thoughtful decisions rather than remembering object
  locations.
- Information should be concise, predictable, and easy to scan with speech.
- The game should feel calm rather than frantic.
- No action should require time-sensitive input or fast reflexes.
- The mechanics should embrace the strengths of nonvisual interaction rather
  than imitate visual mobile games.
- Every meaningful action is initiated by the player.
- There should rarely be an obviously "wrong" strategic choice.

---

### Guiding Philosophy

Players should always feel like rulers making decisions about their realm rather
than manipulating pieces on a game board.

The game should remain relaxing, welcoming, and rewarding.

Experimentation should be encouraged rather than punished.

Whenever possible:

- Prefer thoughtful decisions over rapid actions.
- Prefer clarity over complexity.
- Prefer accessibility over realism.
- Present meaningful decisions before presenting detailed information.
- Reward curiosity rather than optimization.

---

### Non-Goals

Everrealm is not intended to:

- Simulate dragging objects.
- Require remembering a two-dimensional layout.
- Depend on reaction speed.
- Require precise mouse input.
- Use color as essential information.
- Punish mistakes with permanent setbacks.

---

### Glossary

- **Realm** — The player's persistent civilization.
- **Settlement** — An individual developable settlement.
- **Settlement Capacity** — The maximum number of individual settlements that
  may exist simultaneously.
- **Prosperity** — The primary economic resource.
- **Age** — A major progression milestone representing a new era of the
  civilization.
- **Realm Improvement** — A permanent investment purchased with Prosperity.
- **The Story** — A chronological history of the player's realm.

---

## Part II – Gameplay

### Theme

Everrealm takes place in a hopeful medieval fantasy world.

The player rules a growing realm.

Fantasy exists primarily through atmosphere rather than extensive lore,
emphasizing:

- Ancient magic
- Forgotten ruins
- Legends
- Mythical history
- Peaceful exploration
- Hopeful civilization

The world should feel welcoming rather than dark or gritty.

### Flavor Text

Every settlement level, tech node, realm improvement, and age has a flavor
description that evokes the world without overwhelming the player. Descriptions
are concise (one to two sentences), written in a calm tone, and include the
mechanical effect where relevant so players can make informed decisions without
leaving the game UI.

- **Settlement levels** (`src/engine/settlements/descriptions.ts`): one
  evocative sentence per level (Tent through Citadel, plus Farm, Market,
  Workshop).
- **Tech nodes** (`src/engine/techtree/definitions.ts`): `description` field
  gives narrative context; `buildingDescription` explains the mechanical effect.
- **Realm improvements** (`src/engine/improvements/catalog.ts`):
  `description` field combines flavor with the effect summary.
- **Ages** (`src/engine/ages/definitions.ts`): `description` field sets the
  scene for each era, shown beneath the age name in the Realm Summary.

---

### Core Gameplay Loop

The primary gameplay loop is:

1. Review the current state of the realm.
2. Decide how to spend Prosperity.
3. Choose one of:
   - Establish Settlement
   - Develop Settlement
   - Purchase a Realm Improvement
   - Advance to the next Age (when available)
4. Resolve any chain reactions.
5. Earn Prosperity and permanent progress.
6. Repeat.

The game should reward thoughtful planning rather than fast execution.

---

### The Four Core Systems

The game revolves around four interconnected systems:

- Prosperity
- Settlement Capacity
- Settlements
- Ages

Every major mechanic should strengthen one or more of these systems.

---

### Player Actions

Players may:

- Review the realm.
- Establish a settlement.
- Develop a settlement.
- Purchase Realm Improvements.
- Advance to the next Age.
- Read The Story.
- Review statistics.
- Save and exit.

Every action should feel like a meaningful governing decision.

---

### Settlements

#### Settlement Progression

Each Age contains the same settlement progression.

1. Tent
2. Hut
3. Cottage
4. House
5. Manor
6. Hamlet
7. Village
8. Town
9. City
10. Citadel

Building two Citadels makes the next Age available.

---

#### Establish Settlement

Players may spend Prosperity to establish a new settlement.

Version 1:

- Cost: TBD
- Creates one Tent

New settlements are never created automatically.

Establishing settlements is always a deliberate player decision.

---

#### Develop Settlement

Developing settlements is the primary merge mechanic.

Two identical settlements become a new settlement. When the player has unlocked
tech tree nodes, they may choose what to develop into instead of the default
progression.

Example (no tech unlocked):

Tent + Tent

↓

Hut (only option)

Example (Agriculture unlocked):

Tent + Tent

↓

Hut (standard progression) OR Farm (special building)

Any standard settlement level can be developed into a special building
if the corresponding tech is unlocked, provided the source level meets
the building's minimum requirement. For example, two Huts can be
developed into a Farm, or two Cottages into a Library. This gives the
player meaningful branching choices at every level of the progression
ladder, not just the bottom.

Each special building has a minimum source level:

| Building | Minimum Source | Reason |
|----------|---------------|--------|
| Farm | Hut | Agriculture needs settled land |
| Market | Cottage | Trade needs a village economy |
| Workshop | House | Crafts need established homes |
| Library | Manor | Scholarship needs wealth |
| Town Hall | Village | Governance needs a real community |
| Aqueduct | Town | Engineering needs urban scale |

Special buildings are an alternative to standard progression. They do not
merge or chain react — they trade upward progression for ongoing effects.

Player-facing language refers to **developing settlements** rather than merging.

Internally, the game engine may still use merge terminology.

---

#### Special Buildings

Special buildings are develop alternatives unlocked through the tech tree.
Each has both a passive and an active effect so the player is never locked
into one play style.

| Building | Unlocked By | Passive Effect | Active Effect |
|----------|------------|----------------|---------------|
| Farm | Agriculture | +3 Prosperity/hr per Farm | +1 develop reward per Farm |
| Market | Trade | +2 Prosperity/hr per Market | +2 establish reward per Market |
| Workshop | Crafts | +1 Prosperity/hr per Workshop | -1 establish cost per Workshop (min 1) |

Special buildings:
- Do not participate in chain reactions.
- Cannot be developed further (they are leaf nodes).
- Count toward settlement capacity.
- Can be built in any Age.

---

#### Chain Reactions

Chain reactions occur automatically after developing a settlement.

Only settlements created during the current action participate in the chain
reaction. Special buildings never participate in chain reactions.

Chain reactions should feel satisfying through concise announcements.

Example:

Tent

Tent

Hut

Cottage

↓

Hut

Hut

Cottage

↓

Cottage

Cottage

↓

House

Announcement example:

- Created Hut.
- Chain reaction.
- Created Cottage.
- Chain reaction.
- Created House.

---

### Tech Tree

The tech tree provides meaningful unlocks that change what the player can do.
Tech choices carry forward across all Ages — they are permanent investments
in the civilization's knowledge.

Each tier offers 3 nodes. Nodes are not mutually exclusive — the player may
eventually unlock all of them, but must choose the order.

#### Tier 1 (cost: 50 Prosperity each)

| Node | Unlocks | Description |
|------|---------|-------------|
| Agriculture | Farm | Farm buildings generate passive income and boost develop rewards |
| Trade | Market | Market buildings boost establish rewards and generate passive income |
| Crafts | Workshop | Workshop buildings reduce establish costs and generate passive income |

Future tiers will be added in later versions.

Tech tree nodes are displayed in a "Discoveries" section of the UI.

---

### Settlement Capacity

Settlement Capacity limits the total number of **individual settlements** in the
realm.

Example:

- Tent ×5
- Hut ×3
- Village ×2

Uses **10 Settlement Capacity**.

Rules:

- Capacity is permanent.
- Capacity never decreases.
- Capacity increases only through permanent progression.
- Reaching capacity is a strategic challenge, not a failure state.

Displayed as:

Settlement Capacity: 12 / 20

---

### Ages

Everrealm replaces item rarity with Ages.

Each Age represents another chapter in the history of the civilization.

Current draft:

1. Founding Age
2. Age of Growth
3. Age of Lords
4. Golden Age
5. Age of Legends
6. Age of Myths

Example:

Founding Age Citadel

↓

Age of Growth Tent

Advancing to a new Age represents a major milestone rather than simply
increasing power.

Each Age unlocks new permanent opportunities for the realm.

---

### Prosperity

Prosperity is the primary economic resource.

Prosperity is earned through both:

- Passive realm growth.
- Active player decisions.

Active rewards may include:

- Developing settlements.
- Chain reactions.
- Discovering new settlement levels.
- Entering new Ages.
- Completing Realm Improvements.

Prosperity is spent to:

- Establish settlements.
- Purchase Realm Improvements.
- Advance into new Ages.

Prosperity should always feel meaningful.

---

### Realm Improvements

Realm Improvements are permanent investments in the civilization.

They are never lost.

They represent governing decisions rather than simple numerical upgrades.

Example improvements:

- Stone Roads
- Market Charter
- Guild Hall
- Royal Treasury
- Town Watch
Possible effects include:

- Increased Settlement Capacity.
- Improved Prosperity generation.
- Better chain reaction rewards.
- Unlocking entirely new gameplay systems.

Different improvements should encourage different play styles rather than a
single optimal strategy.

---

### Bonus Philosophy

Bonuses should make the realm feel like it is growing and changing over time.

Whenever possible:

- Prefer new capabilities over larger numbers.
- Prefer meaningful strategic choices over passive bonuses.
- Prefer memorable improvements over numerous small percentage increases.
- Express bonuses as developments within the civilization rather than abstract
  mechanics.

Players should remember **what they built**, not simply **what percentage
increased**.

Bonuses should be exciting because of the decisions they enable, not because of
the size of the numbers they increase.

---

### Types of Bonuses

#### Realm Improvement Bonuses

Purchased using Prosperity.

These represent deliberate investments made by the ruler.

#### Settlement Discoveries

Awarded automatically the first time a settlement level is discovered.

Possible rewards include:

- Additional Settlement Capacity.
- New Realm Improvements.
- Prosperity.
- New gameplay features.

#### Age Bonuses

Awarded when entering a new Age.

Age Bonuses represent major milestones in the civilization's history.

They should feel significant and may unlock entirely new mechanics.

---

### Realm Progression

The player always develops a single realm.

Players may choose a name for their realm.

Example:

Realm: Elderglen

Current Age: Golden Age

Settlement Capacity: 12 / 20

Highest Settlement: Village

Prosperity: 4,850

The player should feel like they are writing the history of one civilization
across many Ages.

---

### The Story

The Story is a chronological history of the player's realm.

Major accomplishments are automatically recorded, including:

- Establishing settlements.
- Discovering settlement levels.
- Purchasing Realm Improvements.
- Increasing Settlement Capacity.
- Entering new Ages.
- Participating in special events.
- Other significant milestones.

The Story should read like the history of the civilization rather than a
traditional achievement log.

Entries should be:

- Short.
- Thematic.
- Based entirely on player actions.

---

### Failure

Everrealm has no traditional fail state.

Players never lose progress.

If Settlement Capacity is full:

- New settlements cannot be established.
- Existing settlements may still be developed.
- Capacity may be increased through Realm Improvements.

Running out of Prosperity is not failure.

It is simply another strategic state.

---

## Part III – Technical Design

### Frontend

- React
- TypeScript

---

### Architecture

The game engine is completely independent from the React user interface.

#### Game Engine

Responsibilities:

- Contains gameplay rules.
- Contains progression logic.
- Produces game events.
- Can be tested independently.

The engine should not know anything about React or HTML.

#### React Application

Responsibilities:

- Render the interface.
- Handle player interaction.
- Manage keyboard focus.
- Present game events.
- Announce important events.

---

### Accessibility

Accessibility is a core design goal rather than an optional feature.

The game should:

- Use semantic HTML whenever possible.
- Be fully playable using only a keyboard.
- Avoid unnecessary ARIA where native HTML is sufficient.
- Keep announcements concise and predictable.
- Minimize unnecessary speech.

Example announcements:

- Created House.
- Chain reaction.
- Welcome to the Golden Age.
- Realm Improvement completed.
- Settlement Capacity reached.

---

### Saving

The game is fully playable without creating an account.

Local saves are the default.

Accounts are optional.

Accounts may provide:

- Cloud save synchronization.
- Cross-device play.
- Player statistics.
- Seasonal events.
- Future online features.

Online features should enhance the experience rather than define it.

---

### Initial Balance (Version 1)

These values are expected to change during playtesting.

- Starting Settlement Capacity: 20
- Starting Prosperity: 30
- Establish Settlement Cost: 10
- Establish Reward: 5
- Initial Passive Prosperity Rate: 120 per hour (2 per minute)
- Develop Reward: 5
- Chain Reaction Reward: 3
- Discovery Reward: 25
- Age Entry Reward: 100
- Age Advancement Cost: 200
- Tech Tree Tier 1 Cost: 50 per node
- Farm Passive: +3/hr, Active: +1 develop reward per Farm
- Market Passive: +2/hr, Active: +2 establish reward per Market
- Workshop Passive: +1/hr, Active: -1 establish cost per Workshop (min 1)

---

### Version 1 Scope

Version 1 intentionally excludes:

- Multiplayer
- Combat
- Crafting
- Procedurally generated maps
- Extensive lore
- Cloud-only functionality

The focus is creating a polished, accessible core gameplay experience.

---

## Future Ideas

- Flavor text for each Age.
- Realm history timeline.
- Achievements.
- Statistics.
- Daily challenges.
- Seasonal events.
- Offline progression.
- Optional music and sound effects.
- Multiple announcement verbosity levels.
- Accessibility verbosity settings.
- Additional Ages.
- Additional Realm Improvements.
- Realm events.
- Cosmetic customization.
