# Everrealm Architecture

## Purpose

This document describes the software architecture of Everrealm.

Gameplay design belongs in `spec.md`.

This document describes how the codebase should be organized, the domain model,
and the contracts between the engine and the UI.

---

## Design Goals

- Keep the game engine independent from React.
- Favor small, focused modules.
- Keep business logic testable.
- Keep UI logic separate from gameplay logic.
- Prefer composition over inheritance.
- Prefer immutable updates where practical.
- Keep tests deterministic by passing time explicitly rather than reading system
  clocks.

---

## High-Level Architecture

Player ↓ React UI ↓ Commands ↓ Game Engine ↓ Game Events ↓ React UI

The game engine never renders HTML.

The React application never contains gameplay rules.

The engine receives commands and a timestamp.

The engine returns a new state and structured events.

The UI decides how to present events to the player.

---

## Directory Structure

```text
src/
├── engine/
│   ├── state/
│   │   ├── GameState.ts          # Core state shape
│   │   └── initialState.ts        # Factory for new game state
│   ├── settlements/
│   │   ├── types.ts               # SettlementLevel, SettlementStack
│   │   ├── descriptions.ts         # Flavor text for each settlement level
│   │   ├── establish.ts           # Add a new Tent stack
│   │   ├── develop.ts             # Consume 2 from a stack, create next level
│   │   ├── chainReaction.ts        # Cascade: new settlement auto-combines with match
│   │   ├── progression.ts         # Level order, next-level lookup
│   │   ├── stacks.ts              # Immutable stack operations (find, add, remove)
│   │   └── capacity.ts            # Capacity calculation, limits
│   ├── prosperity/
│   │   ├── types.ts               # Prosperity type
│   │   ├── earn.ts                # Award prosperity (active rewards + balance constants)
│   │   ├── spend.ts               # Check affordability, deduct
│   │   └── passive.ts             # Compute elapsed-time-based passive prosperity
│   ├── ages/
│   │   ├── types.ts               # AgeId, Age definition
│   │   ├── advance.ts             # Advance: check 2 Citadels, consume, create Tent
│   │   └── definitions.ts         # The six Ages, unlock conditions
│   ├── improvements/
│   │   ├── types.ts               # ImprovementId, Improvement, ImprovementEffect
│   │   ├── purchase.ts            # purchaseImprovement()
│   │   ├── catalog.ts             # V1 improvements (Stone Roads, Market Charter, Guild Hall, Royal Treasury, Town Watch)
│   │   └── effects.ts             # Summarize improvement effects (capacity, passive, active)
│   ├── story/
│   │   ├── types.ts               # StoryRecord (structured, not prose)
│   │   └── derive.ts              # Derive StoryRecords from GameEvents
│   ├── events/
│   │   ├── GameCommand.ts          # Discriminated union of all commands
│   │   ├── GameEvent.ts            # Discriminated union of all events
│   │   └── GameError.ts            # Discriminated union of all errors
│   ├── commands.ts                 # executeCommand() + reconcileTime() (delegates to per-command handlers)
│   └── reducer.ts                 # Internal dispatch (thin wrapper around executeCommand)
├── ui/
│   ├── components/
│   │   ├── RealmSummary.tsx       # Realm name, age, prosperity, capacity, turn
│   │   ├── SettlementList.tsx      # Settlement stacks with develop buttons
│   │   ├── ImprovementList.tsx     # Available improvements + purchased list
│   │   ├── StoryLog.tsx            # Realm history (most recent first)
│   │   └── ActionBar.tsx           # Establish, Advance Age, New Game + error display
│   ├── screens/
│   │   └── GameScreen.tsx          # Combines all components + LiveRegion
│   └── hooks/
│       ├── useGame.ts              # State management, persistence, command dispatch
│       └── useAnnouncements.ts     # Live region feed from story records
├── accessibility/
│   ├── announcements.ts           # GameEvent → announcement strings
│   └── LiveRegion.tsx            # ARIA live region component
├── storage/
│   └── save.ts                    # Serialize/deserialize GameState to localStorage
├── shared/
│   └── types.ts                   # Result<T, E>
└── tests/
    ├── engine/
    │   ├── commands.test.ts        # Integration tests for executeCommand
    │   ├── initialState.test.ts    # Initial state factory tests
    │   ├── settlements/            # Settlement mechanics tests
    │   └── prosperity/             # Prosperity system tests
    ├── accessibility/
    │   └── announcements.test.ts    # Event-to-text mapping tests
    └── ui/
        └── App.test.tsx            # UI smoke tests
```

---

## Domain Model

### Shared primitives

```typescript
// src/shared/types.ts

type Result<T, E = GameError> =
  { success: true; value: T } | { success: false; error: E };
```

### Settlements

Settlements are modeled as grouped stacks, not individual instances.
Identical settlements are interchangeable.

The player manages entries such as "Founding Age Tent ×5", not separate Tent
instances.

```typescript
// src/engine/settlements/types.ts

type SettlementLevel =
  | "Tent"
  | "Hut"
  | "Cottage"
  | "House"
  | "Manor"
  | "Hamlet"
  | "Village"
  | "Town"
  | "City"
  | "Citadel";

interface SettlementStack {
  readonly age: AgeId;
  readonly level: SettlementLevel;
  readonly quantity: number;
}
```

A stack is uniquely identified by the pair `(age, level)`.

### Ages

```typescript
// src/engine/ages/types.ts

type AgeId =
  | "FoundingAge"
  | "AgeOfGrowth"
  | "AgeOfLords"
  | "GoldenAge"
  | "AgeOfLegends"
  | "AgeOfMyths";

interface Age {
  readonly id: AgeId;
  readonly name: string; // "Founding Age", "Age of Growth", etc.
  readonly index: number; // 0-based position in progression
  readonly description: string; // Flavor text shown in RealmSummary
}
```

### Prosperity

```typescript
// src/engine/prosperity/types.ts

type Prosperity = number;
```

### Realm Improvements

Version 1 includes three effect kinds only.
A generic `UnlockSystem` framework is deliberately excluded.

```typescript
// src/engine/improvements/types.ts

type ImprovementId = string & { readonly __brand: "ImprovementId" };

interface Improvement {
  readonly id: ImprovementId;
  readonly name: string;
  readonly description: string; // Flavor text + effect summary shown in UI
  readonly cost: Prosperity;
  readonly effects: readonly ImprovementEffect[];
}

type ImprovementEffect =
  | { kind: "IncreaseCapacity"; amount: number }
  | { kind: "IncreasePassiveProsperity"; amount: number }
  | { kind: "IncreaseActiveReward"; amount: number };
```

### Story

Story records are structured domain data, not English prose.
Presentation text belongs in the UI.

Story records are derived from gameplay events, not emitted as events
themselves.

```typescript
// src/engine/story/types.ts

type StoryRecord =
  | { kind: "SettlementEstablished"; turn: number; level: SettlementLevel }
  | { kind: "SettlementLevelDiscovered"; turn: number; level: SettlementLevel }
  | { kind: "ImprovementPurchased"; turn: number; improvementId: ImprovementId }
  | { kind: "CapacityIncreased"; turn: number; newCapacity: number }
  | { kind: "AgeAdvanced"; turn: number; age: AgeId };
```

---

## Game State

There is a single `GameState` object.

The UI renders `GameState`.

The engine produces a new `GameState` from the previous one.

```typescript
// src/engine/state/GameState.ts

interface GameState {
  readonly version: number; // For save migration
  readonly realmName: string;
  readonly age: AgeId;

  // Settlements grouped as stacks, keyed by (age, level).
  readonly settlements: readonly SettlementStack[];

  readonly improvements: readonly ImprovementId[];
  readonly prosperity: Prosperity;
  readonly capacity: number; // Current max

  // For passive prosperity calculation (elapsed real time).
  readonly lastUpdate: number; // Unix timestamp (ms)

  // Settlement levels discovered globally across the realm.
  // Not per-Age — if a level is discovered in one Age, it is discovered
  // in all Ages. Ages are tracked separately via `age`.
  readonly discoveredLevels: readonly SettlementLevel[];

  // Story records — structured, derived from events, not prose.
  readonly story: readonly StoryRecord[];

  readonly turn: number; // Increments per player action
}
```

---

## Commands

The engine exposes two public operations.

Neither calls `Date.now()` internally.
The timestamp is always passed in, keeping tests deterministic.

```typescript
// src/engine/commands.ts

interface CommandResult {
  readonly state: GameState;
  readonly events: GameEvent[];
}

// Player actions.
// Passive prosperity is applied automatically before the command is
// dispatched, using the provided `now` timestamp.
function executeCommand(
  state: GameState,
  command: GameCommand,
  now: number,
): Result<CommandResult>;

// Called on load or resume to reconcile elapsed-time passive prosperity.
// Not a player command.
function reconcileTime(state: GameState, now: number): Result<CommandResult>;
```

### GameCommand

```typescript
// src/engine/events/GameCommand.ts

type GameCommand =
  | { type: "EstablishSettlement" }
  | { type: "DevelopSettlement"; age: AgeId; level: SettlementLevel }
  | { type: "PurchaseImprovement"; improvementId: ImprovementId }
  | { type: "AdvanceAge" };
```

### GameError

Invalid actions return a typed error, not an arbitrary string.

```typescript
// src/engine/events/GameError.ts

type GameError =
  | { type: "InsufficientProsperity"; cost: Prosperity; available: Prosperity }
  | { type: "SettlementCapacityFull"; capacity: number; current: number }
  | { type: "NoEligibleSettlements"; age: AgeId; level: SettlementLevel }
  | { type: "ImprovementNotFound"; improvementId: ImprovementId }
  | { type: "ImprovementAlreadyPurchased"; improvementId: ImprovementId }
  | {
      type: "AgeAdvancementNotAvailable";
      currentAge: AgeId;
      citadelCount: number;
    }
  | { type: "InvalidAgeOrLevel"; age: AgeId; level: SettlementLevel };
```

---

## Engine

The engine owns:

- Settlement development
- Chain reactions
- Prosperity (active and passive)
- Ages
- Improvements
- Story derivation
- Game rules

### Command Dispatch

`executeCommand` is a thin dispatcher that applies passive prosperity, then
delegates to per-command handler functions:

- `handleEstablish` — capacity check, prosperity check, establish, discoveries
- `handleDevelop` — develop, chain reactions, prosperity rewards, discoveries
- `handlePurchase` — catalog lookup, affordability, capacity update, story
- `handleAdvanceAge` — Citadel check, prosperity cost, age entry reward, discoveries

Each handler returns a `Result<CommandResult, GameError>`. Shared helpers
(`awardDiscoveries`, `finalizeState`) reduce duplication across handlers.

### Settlement Development

`DevelopSettlement` targets one eligible stack identified by age and level.

The player does not select two individual settlements.

The engine consumes two from that stack and produces one settlement at the next
level.

### Chain Reactions

After the player-initiated development, the newly created settlement may
automatically combine with one existing identical settlement, producing the
next level.

This repeats until the newly created settlement has no match.

Only the settlement created during the current action participates in the chain
reaction.

Unrelated eligible pairs elsewhere do not merge.

### Passive Prosperity

Passive prosperity is based on elapsed real time and calculated on demand.

The engine stores a `lastUpdate` timestamp.

Before each command, `executeCommand` computes accrued prosperity from
`lastUpdate` to `now`, adds it, and updates `lastUpdate`.

`reconcileTime` performs the same calculation when loading or resuming the game.

There is no background gameplay timer.

### Age Advancement

Age advancement is an intentional command.

Two current-Age Citadels make advancement available.

When the player chooses to advance and meets any Prosperity requirement, the two
Citadels are consumed and one Tent from the next Age is created.

### Settlement Discoveries

Settlement-level discoveries are global across the realm.

If the player discovers Cottage in the Founding Age, it is discovered in all
Ages.

Ages are recorded separately via `discoveredLevels` and the current `age`.

---

## Events

The engine returns structured events instead of UI strings.

The UI decides how to present those events.

```typescript
// src/engine/events/GameEvent.ts

type GameEvent =
  | { type: "SettlementEstablished"; age: AgeId; level: SettlementLevel }
  | { type: "ChainReactionStarted" }
  | {
      type: "SettlementDeveloped";
      age: AgeId;
      level: SettlementLevel;
      newLevel: SettlementLevel;
      source: DevelopSource;
    }
  | { type: "ChainReactionCompleted"; chainLength: number }
  | { type: "SettlementLevelDiscovered"; level: SettlementLevel }
  | { type: "ProsperityEarned"; amount: Prosperity; source: ProsperitySource }
  | { type: "ImprovementPurchased"; improvementId: ImprovementId }
  | { type: "AgeAdvanced"; fromAge: AgeId; toAge: AgeId }
  | { type: "CapacityReached" }
  | { type: "PassiveProsperityApplied"; amount: Prosperity };

type DevelopSource = "Player" | "ChainReaction";

type ProsperitySource =
  | "Passive"
  | "Develop"
  | "ChainReaction"
  | "Discovery"
  | "AgeEntry"
  | "Improvement";
```

### Chain Reaction Event Ordering

For a development that triggers two automatic cascade steps, events are emitted
in this order:

1. `SettlementDeveloped { source: "Player" }` — the initial development
2. `ChainReactionStarted` — only emitted after the initial development produces
   an eligible automatic match
3. `SettlementDeveloped { source: "ChainReaction" }` — first cascade
4. `SettlementDeveloped { source: "ChainReaction" }` — second cascade
5. `ChainReactionCompleted { chainLength: 2 }` — chain ends

`chainLength` counts only automatic chain-reaction steps, not the initial
player-initiated development.

If no cascade occurs (the newly created settlement has no match), there is no
`ChainReactionStarted` event — just a single `SettlementDeveloped` with
`source: "Player"`.

The UI can use the `source` field to reproduce the announcement pattern from the
specification: announce the first creation normally, then announce "Chain
reaction." before each chain-sourced creation.

---

## UI

The UI owns:

- Rendering
- Focus management
- Keyboard shortcuts
- Dialogs
- Menus
- Live region announcements
- Save/load (localStorage)

The UI should never calculate gameplay.

The UI converts structured `GameEvent`s into announcements for assistive
technologies.

### Components

- `GameScreen` — top-level screen combining all components
- `RealmSummary` — realm name, age, prosperity, capacity, turn
- `SettlementList` — settlement stacks with Develop buttons
- `ImprovementList` — available improvements with Purchase buttons + purchased list
- `StoryLog` — realm history (most recent first)
- `ActionBar` — Establish, Advance Age, New Game + error display

### Hooks

- `useGame` — state management, localStorage persistence, command dispatch,
  passive time reconciliation, derived state (canEstablish, canAdvanceAge)
- `useAnnouncements` — derives live region text from story records on turn change

---

## Accessibility

Accessibility is implemented as part of the UI layer.

The engine should not contain ARIA logic or screen-reader announcements.

Instead, it returns structured events that the UI converts into announcements.

---

## Testing

Gameplay tests should not require React.

React components should be tested separately.

The engine never calls `Date.now()` internally.

Tests pass timestamps explicitly, making time-dependent logic deterministic.

---

## Future Expansion

Future systems should plug into the engine without changing existing
architecture whenever possible.

New `GameCommand` variants, `GameEvent` variants, and `StoryRecord` variants can
be added without breaking existing handlers.

Examples:

- Achievements
- Cloud saves
- Statistics
- Additional Ages
- Additional Realm Improvements
- Unlock system effects (post-V1)
