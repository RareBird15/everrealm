// src/engine/prosperity/spend.ts

import type { Prosperity } from "./types";
import type { GameError } from "../events/GameError";
import type { Result } from "../../shared/types";

/**
 * Returns true if `prosperity` is at least `cost`.
 */
export function canAfford(prosperity: Prosperity, cost: Prosperity): boolean {
  return prosperity >= cost;
}

/**
 * Deducts `cost` from `prosperity`.
 *
 * Returns `InsufficientProsperity` if the player cannot afford the cost.
 * Never throws — the caller decides how to present the error.
 */
export function spendProsperity(
  prosperity: Prosperity,
  cost: Prosperity,
): Result<Prosperity, GameError> {
  if (!canAfford(prosperity, cost)) {
    return {
      success: false,
      error: { type: "InsufficientProsperity", cost, available: prosperity },
    };
  }
  return { success: true, value: prosperity - cost };
}