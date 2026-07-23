# Everrealm

A calm, screen-reader-first kingdom-building game set in a fictional
Mesoamerican world. Build settlements, research upgrades, specialize your
communities, send pochteca on trade expeditions, and guide your realm through
six Ages — then ascend into a permanent legacy that shapes your next
playthrough.

Everrealm is designed for screen readers from the ground up while remaining
enjoyable for everyone. No merging. No clicking 256 times. Decisions, not
repetition.

## Play

The game runs entirely in the browser. No account required. Your realm is
saved locally.

**[Play Everrealm](https://everrealm.lanie.work)**

## Features

- **Screen-reader first.** Semantic HTML, ARIA live regions, keyboard
  shortcuts for every common action. No visual information is required to play.
  Works with NVDA, JAWS, VoiceOver, and Orca.
- **Calm strategy.** No combat, no timers, no fail states. Every action is
  initiated by the player.
- **Research-based progression.** Research upgrades that transform ALL
  settlements at once. No merge mechanics, no repetitive clicking.
- **Specialization.** Choose to upgrade a settlement or lock it as a
  prosperity building. Each Age introduces new specializations that interact
  with each other.
- **Pochteca Expeditions.** Send long-distance merchants to 8 destinations
  that unlock by Age. Each expedition returns with a reward — production
  bonuses, research discounts, or land parcels. (v1.1.0)
- **Six Ages.** Guide your civilization from the Founding Age through the Age
  of Myths. Each Age adds one new mechanic layer.
- **Prestige system.** Ascend your Capital into one of five legacies that
  carry forward as permanent bonuses to your next playthrough.
- **Realm Chronicles.** At ascension, the game generates a prose narrative of
  your realm's history — shareable, under 500 words. (v1.1.0)
- **Realm history.** A chronological story log records every milestone in your
  realm's history.
- **Offline progression.** Your realm earns Cacao while you're away.
- **Currency: Cacao.** Cacao beans, used as currency throughout Mesoamerica,
  ground the economy in the setting.

## Game Actions

| Action | Description |
|--------|-------------|
| **Establish Settlement** | Spend Cacao, use a land parcel, create a settlement |
| **Research Upgrade** | Spend Cacao, all settlements upgrade to next tier OR unlock a specialization |
| **Specialize Settlement** | Lock a settlement at its current tier as a prosperity building |
| **Buy Land** | Spend Cacao, gain a land parcel |
| **Advance Age** | Requires top-tier tech researched; unlocks new content |
| **Send Pochteca Expedition** | Spend Cacao, send merchants to a destination; returns after N turns with a reward |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `E` | Establish Settlement |
| `A` | Advance to next Age |

All other actions (research, specialize, buy land, send expedition, ascend) are
done via on-screen buttons for clarity.

## Tech Stack

- React 19
- TypeScript
- Vite
- Vitest + Testing Library

The game engine is completely independent from the React UI and can be tested
in isolation.

## Development

```bash
npm install
npm run dev        # Start dev server at localhost:5173
npm run test       # Run tests
npm run build      # Production build
npm run lint       # Lint
npm run typecheck  # Type check
```

## Project Structure

```
src/
  engine/          # Game logic (no React dependencies)
    ages/          # Age definitions and advancement
    cacao/         # Currency — passive and turn-based income
    expeditions/   # Pochteca expedition system (v1.1.0)
    improvements/  # Realm improvement catalog and effects
    land/          # Land parcel system
    prestige/      # Ascension and legacy system
    research/      # Research tree definitions and progression
    settlements/   # Settlement types, progression, specialization
    state/         # Game state and initial state factory
    story/         # Story records, chronicle generation (v1.1.0)
  ui/              # React components and hooks
  accessibility/   # ARIA live regions, announcements
  storage/         # Save/load (localStorage with backward compatibility)
  tests/           # Engine and UI tests
```

## License

MIT

## Acknowledgments

Designed and built by [Lanie Molinar](https://lanie.work) with Hermes Agent.
Everrealm was created to prove that accessible games can be genuinely fun,
not just "accessible enough."