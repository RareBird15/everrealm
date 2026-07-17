// src/engine/land/buyLand.ts

import type { GameState } from "../state/GameState";
import type { GameEvent } from "../events/GameEvent";

/**
 * Base cost to buy one land parcel.
 * Scales up with each parcel purchased.
 */
export const BASE_LAND_COST = 60;

/** Cost scaling per parcel already purchased beyond the starting amount. */
export const LAND_COST_SCALING = 30;

/**
 * Returns the cost to buy the next land parcel.
 * Cost increases with each parcel purchased beyond the starting amount.
 */
export function landCost(state: GameState): number {
  const extraParcels = state.landParcels - 5; // 5 is starting amount
  return BASE_LAND_COST + Math.max(0, extraParcels) * LAND_COST_SCALING;
}

/** Returns true if the player can buy land. */
export function canBuyLand(state: GameState): boolean {
  return state.cacao >= landCost(state);
}

/** Buys one land parcel. */
export function buyLand(state: GameState): {
  state: GameState;
  events: GameEvent[];
} {
  const cost = landCost(state);
  if (state.cacao < cost)
    throw new Error(`Not enough cacao. Need ${cost}, have ${state.cacao}.`);

  return {
    state: {
      ...state,
      cacao: state.cacao - cost,
      landParcels: state.landParcels + 1,
      turn: state.turn + 1,
    },
    events: [
      {
        type: "LandPurchased",
        turn: state.turn + 1,
        parcels: 1,
        cost,
      },
    ],
  };
}