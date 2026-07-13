// src/engine/settlements/establish.ts

import type { AgeId } from "../ages/types";
import type { SettlementStack } from "./types";
import type { GameEvent } from "../events/GameEvent";
import { addToStack } from "./stacks";

/**
 * Prosperity cost to establish a new settlement (V1 placeholder).
 *
 * At 10 Prosperity per Tent with 30 starting Prosperity, the player
 * can establish 3 settlements in their first session, leaving enough
 * to feel like they have agency without front-loading too much.
 */
export const ESTABLISH_COST = 10;

export interface EstablishResult {
  readonly settlements: SettlementStack[];
  readonly events: GameEvent[];
}

/**
 * Establishes a new settlement: adds one Tent for the given Age.
 *
 * The caller is responsible for checking capacity and Prosperity before
 * calling this function. This function performs the stack update only.
 */
export function establishSettlement(
  settlements: readonly SettlementStack[],
  age: AgeId,
): EstablishResult {
  const updated = addToStack(settlements, age, "Tent", 1);
  return {
    settlements: updated,
    events: [{ type: "SettlementEstablished", age, level: "Tent" }],
  };
}