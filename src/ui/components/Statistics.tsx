// src/ui/components/Statistics.tsx

import type { GameState } from "../../engine/state/GameState";
import { totalSettlements } from "../../engine/settlements/capacity";
import { AGES } from "../../engine/ages/definitions";
import { TECH_NODES } from "../../engine/techtree/definitions";
import { IMPROVEMENTS } from "../../engine/improvements/catalog";

interface Props {
  readonly state: GameState;
}

export function Statistics({ state }: Props) {
  const totalSettlementCount = totalSettlements(state.settlements);
  const ageIndex = AGES.findIndex((a) => a.id === state.age);
  const highestLevel = state.discoveredLevels.length > 0
    ? state.discoveredLevels[state.discoveredLevels.length - 1]
    : "None yet";
  const techUnlocked = state.unlockedTechs.length;
  const techTotal = TECH_NODES.length;
  const improvementsPurchased = state.improvements.length;
  const improvementsTotal = IMPROVEMENTS.length;
  const citadelCount = state.settlements
    .filter((s) => s.level === "Citadel")
    .reduce((sum, s) => sum + s.quantity, 0);
  const storyEntries = state.story.length;

  return (
    <details>
      <summary>Statistics</summary>
      <dl>
        <dt>Realm Name</dt>
        <dd>{state.realmName}</dd>

        <dt>Current Age</dt>
        <dd>{ageIndex + 1} of {AGES.length}</dd>

        <dt>Turns Played</dt>
        <dd>{state.turn}</dd>

        <dt>Settlements</dt>
        <dd>{totalSettlementCount} / {state.capacity}</dd>

        <dt>Highest Settlement Discovered</dt>
        <dd>{highestLevel}</dd>

        <dt>Citadels Built</dt>
        <dd>{citadelCount}</dd>

        <dt>Discoveries Unlocked</dt>
        <dd>{techUnlocked} / {techTotal}</dd>

        <dt>Realm Improvements</dt>
        <dd>{improvementsPurchased} / {improvementsTotal}</dd>

        <dt>Story Entries</dt>
        <dd>{storyEntries}</dd>
      </dl>
    </details>
  );
}