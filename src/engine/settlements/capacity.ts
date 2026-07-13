// src/engine/settlements/capacity.ts

import type { SettlementStack } from "./types";

/** Returns the total number of individual settlements across all stacks. */
export function totalSettlements(
  settlements: readonly SettlementStack[],
): number {
  return settlements.reduce((sum, s) => sum + s.quantity, 0);
}

/**
 * Returns true if `count` more settlements would fit within `capacity`.
 *
 * @param count - Number of new settlements to accommodate (default 1).
 */
export function canAccommodate(
  settlements: readonly SettlementStack[],
  capacity: number,
  count = 1,
): boolean {
  return totalSettlements(settlements) + count <= capacity;
}
