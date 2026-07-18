// src/ui/components/SettlementList.tsx

import type { Settlement, SpecialBuilding } from "../../engine/settlements/types";
import { ALL_RESEARCH } from "../../engine/research/definitions";
import type { GameApi } from "../hooks/useGame";

interface Props {
  readonly game: GameApi;
}

/** Returns the building description for a specialization. */
function getBuildingDescription(building: SpecialBuilding): string {
  for (const node of ALL_RESEARCH) {
    if (node.unlocksBuilding === building && node.buildingDescription) {
      return node.buildingDescription;
    }
  }
  return "";
}

function SettlementRow({
  settlement,
}: {
  readonly settlement: Settlement;
}) {
  const isSpecial = settlement.specialization !== null;
  const buildingDesc = isSpecial && settlement.specialization
    ? getBuildingDescription(settlement.specialization)
    : "";

  return (
    <li>
      <span>
        {settlement.tier}
        {isSpecial && ` (${settlement.specialization})`}
      </span>
      {isSpecial && buildingDesc && (
        <span className="settlement-description">{buildingDesc}</span>
      )}
      {isSpecial && (
        <span aria-label="Specialized building — cannot upgrade further">
          (Specialized)
        </span>
      )}
    </li>
  );
}

export function SettlementList({ game }: Props) {
  const { state } = game;

  if (state.settlements.length === 0) {
    return (
      <section aria-label="Settlements">
        <h2>Settlements</h2>
        <p>No settlements yet. Press E to establish your first settlement.</p>
      </section>
    );
  }

  return (
    <section aria-label="Settlements">
      <h2>Settlements ({state.settlements.length})</h2>
      <p>
        All settlements are at {state.baseTier} tier. Research upgrades to
        advance them simultaneously. Use Batch Actions below to specialize or
        unspecialize settlements.
      </p>
      <ol>
        {state.settlements.map((s) => (
          <SettlementRow
            key={s.id}
            settlement={s}
          />
        ))}
      </ol>
    </section>
  );
}