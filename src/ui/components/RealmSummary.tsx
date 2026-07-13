// src/ui/components/RealmSummary.tsx

import type { GameState } from "../../engine/state/GameState";
import { getAge } from "../../engine/ages/definitions";
import { totalSettlements } from "../../engine/settlements/capacity";

interface Props {
  readonly state: GameState;
  readonly effectiveCapacity: number;
  readonly passiveRatePerHour: number;
}

export function RealmSummary({ state, effectiveCapacity, passiveRatePerHour }: Props) {
  const age = getAge(state.age);
  const used = totalSettlements(state.settlements);

  return (
    <section aria-label="Realm Summary">
      <h2>{state.realmName}</h2>
      <dl>
        <dt>Current Age</dt>
        <dd>{age?.name ?? state.age}</dd>
        {age?.description && (
          <dd className="flavor-text">{age.description}</dd>
        )}

        <dt>Prosperity</dt>
        <dd>{state.prosperity.toLocaleString()}</dd>

        <dt>Passive Income</dt>
        <dd>{passiveRatePerHour} per hour</dd>

        <dt>Settlement Capacity</dt>
        <dd>
          {used} / {effectiveCapacity}
        </dd>

        <dt>Turn</dt>
        <dd>{state.turn}</dd>
      </dl>
    </section>
  );
}