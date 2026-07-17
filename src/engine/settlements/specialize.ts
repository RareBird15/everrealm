// src/engine/settlements/specialize.ts

import type { GameState } from "../state/GameState";
import type { SpecialBuilding } from "./types";
import { getResearch } from "../research/definitions";
import type { GameEvent } from "../events/GameEvent";

/**
 * Specializes a settlement: locks it at its current tier and turns it
 * into a prosperity building.
 *
 * The bonus is flat regardless of the tier at which the player specializes —
 * the decision is "upgrade this settlement or lock it for income," not
 * "what level for max benefit."
 */
export function specializeSettlement(
  state: GameState,
  settlementId: string,
  building: SpecialBuilding,
): { state: GameState; events: GameEvent[] } {
  const settlement = state.settlements.find((s) => s.id === settlementId);
  if (!settlement) throw new Error("Settlement not found.");
  if (settlement.specialization !== null)
    throw new Error("This settlement is already specialized.");

  // Verify the player has unlocked this building type
  const hasResearch = state.completedResearch.some((r) => {
    const node = getResearch(r);
    return node?.unlocksBuilding === building;
  });
  if (!hasResearch)
    throw new Error(`You have not unlocked ${building} yet. Research it first.`);

  const newSettlements = state.settlements.map((s) =>
    s.id === settlementId ? { ...s, specialization: building } : s,
  );

  return {
    state: {
      ...state,
      settlements: newSettlements,
      turn: state.turn + 1,
    },
    events: [
      {
        type: "SettlementSpecialized",
        turn: state.turn + 1,
        settlementId,
        building,
      },
    ],
  };
}

/** Returns true if a settlement can be specialized as the given building. */
export function canSpecialize(
  state: GameState,
  settlementId: string,
  building: SpecialBuilding,
): boolean {
  const settlement = state.settlements.find((s) => s.id === settlementId);
  if (!settlement) return false;
  if (settlement.specialization !== null) return false;

  return state.completedResearch.some((r) => {
    const node = getResearch(r);
    return node?.unlocksBuilding === building;
  });
}

/**
 * Unspecializes a settlement: returns it to the upgrade ladder at its
 * current tier. The player loses the building's bonuses but gains the
 * ability to upgrade the settlement when the next tier research is done.
 */
export function unspecializeSettlement(
  state: GameState,
  settlementId: string,
): { state: GameState; events: GameEvent[] } {
  const settlement = state.settlements.find((s) => s.id === settlementId);
  if (!settlement) throw new Error("Settlement not found.");
  if (settlement.specialization === null)
    throw new Error("This settlement is not specialized.");

  const newSettlements = state.settlements.map((s) =>
    s.id === settlementId ? { ...s, specialization: null } : s,
  );

  return {
    state: {
      ...state,
      settlements: newSettlements,
      turn: state.turn + 1,
    },
    events: [
      {
        type: "SettlementSpecialized" as const,
        turn: state.turn + 1,
        settlementId,
        building: settlement.specialization,
      },
    ],
  };
}

/**
 * Batch specializes multiple unspecialized settlements as the same building.
 * Only affects unspecialized settlements (at current base tier).
 * Uses a single state transition so all specializations happen atomically.
 */
export function batchSpecialize(
  state: GameState,
  building: SpecialBuilding,
  count: number,
): { state: GameState; events: GameEvent[] } {
  // Verify the player has unlocked this building type
  const hasResearch = state.completedResearch.some((r) => {
    const node = getResearch(r);
    return node?.unlocksBuilding === building;
  });
  if (!hasResearch)
    throw new Error(`You have not unlocked ${building} yet. Research it first.`);

  const targets = state.settlements
    .filter((s) => s.specialization === null)
    .slice(0, count);

  if (targets.length === 0)
    throw new Error("No unspecialized settlements available.");

  const targetIds = new Set(targets.map((s) => s.id));
  const newSettlements = state.settlements.map((s) =>
    targetIds.has(s.id) ? { ...s, specialization: building } : s,
  );

  const events: GameEvent[] = targets.map((s) => ({
    type: "SettlementSpecialized" as const,
    turn: state.turn + 1,
    settlementId: s.id,
    building,
  }));

  return {
    state: {
      ...state,
      settlements: newSettlements,
      turn: state.turn + 1,
    },
    events,
  };
}

/**
 * Batch unspecializes multiple specialized settlements.
 * Returns them to the upgrade ladder at their current tier.
 */
export function batchUnspecialize(
  state: GameState,
  count: number,
): { state: GameState; events: GameEvent[] } {
  const targets = state.settlements
    .filter((s) => s.specialization !== null)
    .slice(0, count);

  if (targets.length === 0)
    throw new Error("No specialized settlements available.");

  const targetIds = new Set(targets.map((s) => s.id));
  const newSettlements = state.settlements.map((s) =>
    targetIds.has(s.id) ? { ...s, specialization: null } : s,
  );

  const events: GameEvent[] = targets.map((s) => ({
    type: "SettlementSpecialized" as const,
    turn: state.turn + 1,
    settlementId: s.id,
    building: s.specialization!,
  }));

  return {
    state: {
      ...state,
      settlements: newSettlements,
      turn: state.turn + 1,
    },
    events,
  };
}