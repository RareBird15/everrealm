// src/ui/components/SettlementList.tsx

import type { Settlement, SpecialBuilding, StandardLevel } from "../../engine/settlements/types";
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

/** A group of settlements sharing the same tier and specialization. */
interface SettlementGroup {
  readonly tier: StandardLevel;
  readonly specialization: SpecialBuilding | null;
  readonly count: number;
}

/**
 * Groups settlements by tier + specialization into compact stacks.
 * Instead of 3,000 individual <li> elements, produces one per unique
 * combination (typically 5-20 entries).
 */
function groupSettlements(settlements: readonly Settlement[]): SettlementGroup[] {
  const map = new Map<string, SettlementGroup>();

  for (const s of settlements) {
    const key = `${s.tier}:${s.specialization ?? "null"}`;
    const existing = map.get(key);
    if (existing) {
      map.set(key, { ...existing, count: existing.count + 1 });
    } else {
      map.set(key, {
        tier: s.tier,
        specialization: s.specialization,
        count: 1,
      });
    }
  }

  // Sort: by tier order (Tent first, Capital last), then by specialization
  const tierOrder: StandardLevel[] = [
    "Tent", "Hut", "Cottage", "House", "Homestead",
    "Village", "Town", "City", "Capital",
  ];

  return Array.from(map.values()).sort((a, b) => {
    const tierDiff = tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
    if (tierDiff !== 0) return tierDiff;
    // Unspecialized first, then alphabetical by specialization name
    if (a.specialization === null && b.specialization === null) return 0;
    if (a.specialization === null) return -1;
    if (b.specialization === null) return 1;
    return a.specialization.localeCompare(b.specialization);
  });
}

function SettlementGroupRow({ group }: { readonly group: SettlementGroup }) {
  const isSpecial = group.specialization !== null;
  const buildingDesc = isSpecial && group.specialization
    ? getBuildingDescription(group.specialization)
    : "";

  return (
    <li>
      <span>
        {group.count} {group.tier}
        {group.count > 1 ? "s" : ""}
        {isSpecial && ` (${group.specialization})`}
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

  const groups = groupSettlements(state.settlements);

  return (
    <section aria-label="Settlements">
      <h2>Settlements ({state.settlements.length})</h2>
      <p>
        All settlements are at {state.baseTier} tier. Research upgrades to
        advance them simultaneously. Use Batch Actions below to specialize or
        unspecialize settlements.
      </p>
      <ol>
        {groups.map((g, i) => (
          <SettlementGroupRow key={i} group={g} />
        ))}
      </ol>
    </section>
  );
}