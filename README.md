# Everrealm

A peaceful kingdom-building game designed from the ground up for screen readers.

Build settlements, develop them through merge mechanics, invest in lasting
improvements, and guide your civilization through successive Ages. Everrealm
is equally enjoyable for blind and sighted players.

## Play

The game runs entirely in the browser. No account required. Your realm is
saved locally.

**[Play Everrealm](https://everrealm.pages.dev)** (deploy link TBD)

## Features

- **Screen-reader first.** Semantic HTML, ARIA live regions, keyboard
  shortcuts for every common action. No visual information is required to play.
- **Calm strategy.** No timers, no reflexes, no fail states. Every action is
  initiated by the player.
- **Merge mechanics.** Develop settlements by combining pairs into higher-level
  ones. Chain reactions cascade automatically (unless you have branching
  options available).
- **Tech tree.** Unlock discoveries that enable special buildings with new
  mechanical effects: Libraries that boost discovery rewards, Town Halls that
  expand capacity, Aqueducts that multiply your passive income.
- **Realm improvements.** Permanent investments that change how your realm
  plays: Stone Roads for passive income, Guild Halls for capacity, Monuments
  for stronger rewards.
- **Six Ages.** Guide your civilization from the Founding Age through the Age
  of Myths.
- **Realm history.** A chronological story log records every milestone in your
  realm's history.
- **Offline progression.** Your realm earns Prosperity while you're away. Come
  back to a "While you were away" summary.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `E` | Establish Settlement |
| `A` | Advance to next Age |
| `T` | Develop Tent |
| `H` | Develop Hut |
| `C` | Develop Cottage |
| `U` | Develop House |
| `N` | Develop Manor |
| `V` | Develop Village |
| `W` | Develop Town |
| `I` | Develop City |
| `F` | Develop into Farm |
| `M` | Develop into Market |
| `O` | Develop into Workshop |
| `L` | Develop into Library |
| `G` | Develop into Town Hall |
| `Q` | Develop into Aqueduct |

Shortcuts develop the first eligible stack. Special building shortcuts use
the first available standard level stack that meets the building's minimum
source level requirement.

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
    improvements/  # Realm improvement catalog and effects
    prosperity/    # Resource earning, spending, passive income
    settlements/   # Settlement types, progression, merging, chain reactions
    techtree/      # Tech tree definitions and prerequisites
    story/         # Story record derivation from game events
  ui/              # React components and hooks
  accessibility/   # ARIA live regions, announcements
  storage/         # Save/load (localStorage with migration)
  tests/           # Engine and UI tests
```

## License

MIT

## Acknowledgments

Designed and built by [Lanie Molinar](https://lanie.work) with Hermes Agent.
Everrealm was created to prove that accessible games can be genuinely fun,
not just "accessible enough."