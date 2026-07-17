// src/engine/settlements/establish.ts

import type { GameState } from "../state/GameState";
import type { Settlement } from "./types";
import type { GameEvent } from "../events/GameEvent";
import { effectiveLandParcels } from "../state/initialState";

/** Cost to establish a new settlement, before reductions. */
export const BASE_ESTABLISH_COST = 10;

/** Cacao earned for establishing a settlement. */
export const ESTABLISH_REWARD = 5;

/**
 * Returns the current cost to establish a settlement,
 * accounting for Workshop reductions.
 */
export function establishCost(state: GameState): number {
  let cost = BASE_ESTABLISH_COST;
  // Each Workshop reduces cost by 1 (minimum 1)
  const workshops = countSpecialization(state, "Workshop");
  cost -= workshops * 1;
  return Math.max(1, cost);
}

/** Returns the cacao reward for establishing a settlement, with bonuses. */
export function establishReward(state: GameState): number {
  let reward = ESTABLISH_REWARD;
  // Each Market adds +2
  const markets = countSpecialization(state, "Market");
  reward += markets * 2;
  // Each Farm adds +1
  const farms = countSpecialization(state, "Farm");
  reward += farms * 1;
  return reward;
}

/** Returns true if the player can establish a new settlement. */
export function canEstablish(state: GameState): boolean {
  return (
    state.cacao >= establishCost(state) &&
    state.settlements.length < effectiveLandParcels(state)
  );
}

/** Creates a new settlement at the player's current base tier. */
export function establishSettlement(state: GameState): {
  state: GameState;
  events: GameEvent[];
} {
  if (!canEstablish(state)) {
    throw new Error(
      state.cacao < establishCost(state)
        ? `Not enough cacao. Need ${establishCost(state)}, have ${state.cacao}.`
        : `No available land parcels. All ${effectiveLandParcels(state)} parcels are in use. Buy more land or specialize settlements.`,
    );
  }

  const cost = establishCost(state);
  const reward = establishReward(state);
  const settlement: Settlement = {
    id: `settlement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tier: state.baseTier,
    specialization: null,
  };

  return {
    state: {
      ...state,
      settlements: [...state.settlements, settlement],
      cacao: state.cacao - cost + reward,
      turn: state.turn + 1,
    },
    events: [
      {
        type: "SettlementEstablished",
        turn: state.turn + 1,
        settlementTier: state.baseTier,
        cost,
        reward,
      },
    ],
  };
}

/** Counts how many settlements have been specialized as the given building. */
export function countSpecialization(
  state: GameState,
  building: import("./types").SpecialBuilding,
): number {
  return state.settlements.filter((s) => s.specialization === building).length;
}

/** Counts total specialized settlements. */
export function countSpecialized(state: GameState): number {
  return state.settlements.filter((s) => s.specialization !== null).length;
}

/** Counts total unspecialized settlements (still on the upgrade ladder). */
export function countUnspecialized(state: GameState): number {
  return state.settlements.filter((s) => s.specialization === null).length;
}