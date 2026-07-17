// src/ui/components/BatchActions.tsx

import { useState } from "react";
import type { SpecialBuilding } from "../../engine/settlements/types";
import type { ResearchId } from "../../engine/research/types";
import { getResearch, ALL_RESEARCH } from "../../engine/research/definitions";
import type { GameApi } from "../hooks/useGame";

interface Props {
  readonly game: GameApi;
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

/** Returns building descriptions for display. */
function getBuildingDescription(building: SpecialBuilding): string {
  for (const node of ALL_RESEARCH) {
    if (node.unlocksBuilding === building && node.buildingDescription) {
      return node.buildingDescription;
    }
  }
  return "";
}

export function BatchActions({ game }: Props) {
  const { state, specializeSettlement, unspecializeSettlement } = game;
  const [mode, setMode] = useState<"none" | "specialize" | "unspecialize">("none");
  const [selectedBuilding, setSelectedBuilding] = useState<SpecialBuilding | null>(null);
  const [quantity, setQuantity] = useState(1);

  const unlockedBuildings = getUnlockedBuildings(state.completedResearch);
  const unspecialized = state.settlements.filter((s) => s.specialization === null);
  const specialized = state.settlements.filter((s) => s.specialization !== null);

  if (unspecialized.length === 0 && specialized.length === 0) return null;
  if (unlockedBuildings.length === 0 && specialized.length === 0) return null;

  const maxSpecialize = Math.min(quantity, unspecialized.length);
  const maxUnspecialize = Math.min(quantity, specialized.length);

  function doBatchSpecialize() {
    if (!selectedBuilding) return;
    const targets = state.settlements
      .filter((s) => s.specialization === null)
      .slice(0, maxSpecialize);
    for (const s of targets) {
      specializeSettlement(s.id, selectedBuilding);
    }
    setMode("none");
    setSelectedBuilding(null);
    setQuantity(1);
  }

  function doBatchUnspecialize() {
    const targets = state.settlements
      .filter((s) => s.specialization !== null)
      .slice(0, maxUnspecialize);
    for (const s of targets) {
      unspecializeSettlement(s.id);
    }
    setMode("none");
    setQuantity(1);
  }

  return (
    <section aria-label="Batch Actions">
      <h2>Batch Actions</h2>

      {mode === "none" && (
        <div>
          {unspecialized.length > 0 && unlockedBuildings.length > 0 && (
            <button
              type="button"
              onClick={() => setMode("specialize")}
              disabled={unspecialized.length === 0}
            >
              Batch Specialize ({unspecialized.length} available)
            </button>
          )}
          {specialized.length > 0 && (
            <button
              type="button"
              onClick={() => setMode("unspecialize")}
            >
              Batch Unspecialize ({specialized.length} available)
            </button>
          )}
        </div>
      )}

      {mode === "specialize" && (
        <div className="batch-form">
          <h3>Batch Specialize</h3>
          <p>
            Specialize multiple unspecialized settlements at once. All
            settlements will be locked at their current tier ({state.baseTier}).
          </p>
          <p className="form-help">
            {unspecialized.length} unspecialized settlements available.
          </p>

          <label htmlFor="batch-building">Building Type</label>
          <select
            id="batch-building"
            value={selectedBuilding ?? ""}
            onChange={(e) => setSelectedBuilding(e.target.value as SpecialBuilding)}
          >
            <option value="" disabled>Select a building...</option>
            {unlockedBuildings.map((building) => (
              <option key={building} value={building}>
                {building} — {getBuildingDescription(building).substring(0, 60)}...
              </option>
            ))}
          </select>

          <label htmlFor="batch-quantity">Quantity (max {unspecialized.length})</label>
          <input
            id="batch-quantity"
            type="number"
            min={1}
            max={unspecialized.length}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, unspecialized.length)))}
          />

          <div>
            <button
              type="button"
              onClick={doBatchSpecialize}
              disabled={!selectedBuilding}
              aria-label={`Specialize ${maxSpecialize} settlements as ${selectedBuilding ?? "selected building"}`}
            >
              Specialize {maxSpecialize} as {selectedBuilding ?? "..."}
            </button>
            <button type="button" onClick={() => setMode("none")}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === "unspecialize" && (
        <div className="batch-form">
          <h3>Batch Unspecialize</h3>
          <p>
            Return multiple specialized settlements to the upgrade ladder.
            They will keep their current tier but lose their building bonuses.
          </p>
          <p className="form-help">
            {specialized.length} specialized settlements available.
          </p>

          <label htmlFor="batch-unspec-quantity">Quantity (max {specialized.length})</label>
          <input
            id="batch-unspec-quantity"
            type="number"
            min={1}
            max={specialized.length}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, specialized.length)))}
          />

          <div>
            <button
              type="button"
              onClick={doBatchUnspecialize}
              aria-label={`Return ${maxUnspecialize} settlements to upgrade ladder`}
            >
              Unspecialize {maxUnspecialize}
            </button>
            <button type="button" onClick={() => setMode("none")}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}