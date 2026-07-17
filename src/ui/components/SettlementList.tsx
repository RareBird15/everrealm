// src/ui/components/SettlementList.tsx

import type { Settlement, SpecialBuilding } from "../../engine/settlements/types";
import type { ResearchId } from "../../engine/research/types";
import { getResearch, ALL_RESEARCH } from "../../engine/research/definitions";
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

/** Returns the buildings the player has unlocked via research, deduplicated. */
function getUnlockedBuildings(
  completedResearch: readonly ResearchId[],
): SpecialBuilding[] {
  const buildings = new Set<SpecialBuilding>();
  for (const id of completedResearch) {
    const node = getResearch(id);
    if (node?.unlocksBuilding) buildings.add(node.unlocksBuilding);
  }
  return Array.from(buildings);
}

function SettlementRow({
  settlement,
  index,
  unlockedBuildings,
  onSpecialize,
  onUnspecialize,
}: {
  readonly settlement: Settlement;
  readonly index: number;
  readonly unlockedBuildings: SpecialBuilding[];
  readonly onSpecialize: (settlementId: string, building: SpecialBuilding) => void;
  readonly onUnspecialize: (settlementId: string) => void;
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
      {!isSpecial && unlockedBuildings.length > 0 && (
        <details>
          <summary>Specialize</summary>
          <ul>
            {unlockedBuildings.map((building) => {
              const node = ALL_RESEARCH.find((r) => r.unlocksBuilding === building);
              return (
                <li key={building}>
                  <button
                    type="button"
                    onClick={() => onSpecialize(settlement.id, building)}
                    aria-label={`Specialize settlement ${index + 1} as ${building}`}
                  >
                    {building}
                  </button>
                  {node?.buildingDescription && (
                    <span className="settlement-description">
                      {node.buildingDescription}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </details>
      )}
      {isSpecial && (
        <>
          <span aria-label="Specialized building — cannot upgrade further">
            (Specialized)
          </span>
          <button
            type="button"
            onClick={() => onUnspecialize(settlement.id)}
            aria-label={`Return settlement ${index + 1} to upgrade ladder`}
          >
            Unspecialize
          </button>
        </>
      )}
    </li>
  );
}

export function SettlementList({ game }: Props) {
  const { state, specializeSettlement, unspecializeSettlement } = game;

  if (state.settlements.length === 0) {
    return (
      <section aria-label="Settlements">
        <h2>Settlements</h2>
        <p>No settlements yet. Press E to establish your first settlement.</p>
      </section>
    );
  }

  const unlockedBuildings = getUnlockedBuildings(state.completedResearch);

  return (
    <section aria-label="Settlements">
      <h2>Settlements ({state.settlements.length})</h2>
      <p>
        All settlements are at {state.baseTier} tier. Research upgrades to
        advance them simultaneously.
      </p>
      <ol>
        {state.settlements.map((s, i) => (
          <SettlementRow
            key={s.id}
            settlement={s}
            index={i}
            unlockedBuildings={unlockedBuildings}
            onSpecialize={specializeSettlement}
            onUnspecialize={unspecializeSettlement}
          />
        ))}
      </ol>
    </section>
  );
}