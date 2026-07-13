// src/engine/ages/advance.ts

import type { AgeId } from "./types";
import type { SettlementStack } from "../settlements/types";
import type { Prosperity } from "../prosperity/types";
import type { GameEvent } from "../events/GameEvent";
import type { GameError } from "../events/GameError";
import type { Result } from "../../shared/types";
import { findStack, addToStack, removeFromStack } from "../settlements/stacks";
import { nextAge, isFinalAge } from "./definitions";

/**
 * Prosperity cost to advance to the next Age (V1 placeholder).
 *
 * Advancing is a major milestone — the cost should be significant
 * but achievable with active play.
 */
export const AGE_ADVANCE_COST: Prosperity = 200;

export interface AdvanceAgeResult {
  readonly age: AgeId;
  readonly settlements: SettlementStack[];
  readonly events: GameEvent[];
}

/**
 * Advances the realm to the next Age.
 *
 * Requirements:
 * - Two Citadels of the current Age must exist (consumed on advancement).
 * - The player must have enough Prosperity.
 * - The realm must not already be in the final Age.
 *
 * On advancement:
 * - The two Citadels are consumed.
 * - One Tent of the new Age is created.
 * - The current Age is updated.
 */
export function advanceAge(
  settlements: readonly SettlementStack[],
  currentAge: AgeId,
  prosperity: Prosperity,
): Result<AdvanceAgeResult, GameError> {
  // Can't advance from the final Age
  if (isFinalAge(currentAge)) {
    return {
      success: false,
      error: {
        type: "AgeAdvancementNotAvailable",
        currentAge,
        citadelCount: 0,
      },
    };
  }

  // Need at least 2 Citadels of the current Age
  const citadelStack = findStack(settlements, currentAge, "Citadel");
  const citadelCount = citadelStack?.quantity ?? 0;
  if (!citadelStack || citadelCount < 2) {
    return {
      success: false,
      error: {
        type: "AgeAdvancementNotAvailable",
        currentAge,
        citadelCount,
      },
    };
  }

  // Check Prosperity
  if (prosperity < AGE_ADVANCE_COST) {
    return {
      success: false,
      error: {
        type: "InsufficientProsperity",
        cost: AGE_ADVANCE_COST,
        available: prosperity,
      },
    };
  }

  const next = nextAge(currentAge)!; // Safe: isFinalAge checked above

  // Consume 2 Citadels, create 1 Tent of the new Age
  let updated = removeFromStack(settlements, currentAge, "Citadel", 2);
  updated = addToStack(updated, next.id, "Tent", 1);

  const events: GameEvent[] = [
    { type: "AgeAdvanced", fromAge: currentAge, toAge: next.id },
  ];

  return {
    success: true,
    value: {
      age: next.id,
      settlements: updated,
      events,
    },
  };
}