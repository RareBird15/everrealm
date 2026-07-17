// src/ui/components/RealmSummary.tsx

import type { GameState } from "../../engine/state/GameState";
import { getAge } from "../../engine/ages/definitions";

interface Props {
  readonly state: GameState;
  readonly passiveRate: number;
  readonly turnRate: number;
  readonly landUsed: number;
  readonly landTotal: number;
}

export function RealmSummary({ state, passiveRate, turnRate, landUsed, landTotal }: Props) {
  const age = getAge(state.age);

  return (
    <section aria-label="Realm Summary">
      <h2>{state.realmName}</h2>
      <dl>
        <dt>Current Age</dt>
        <dd>{age?.name ?? state.age}</dd>
        {age?.description && (
          <dd className="flavor-text">{age.description}</dd>
        )}

        <dt>Cacao</dt>
        <dd>{state.cacao.toLocaleString()}</dd>

        <dt>Income Per Turn</dt>
        <dd>{turnRate}</dd>

        <dt>Time Away Bonus</dt>
        <dd>{passiveRate} per hour</dd>

        <dt>Land Parcels</dt>
        <dd>
          {landUsed} / {landTotal}
        </dd>

        <dt>Settlement Tier</dt>
        <dd>{state.baseTier}</dd>

        <dt>Turn</dt>
        <dd>{state.turn}</dd>

        {state.prestige.ascensionCount > 0 && (
          <>
            <dt>Ascensions</dt>
            <dd>{state.prestige.ascensionCount}</dd>
            <dt>Legacies</dt>
            <dd>{state.prestige.legacies.join(", ") || "None"}</dd>
          </>
        )}
      </dl>
    </section>
  );
}