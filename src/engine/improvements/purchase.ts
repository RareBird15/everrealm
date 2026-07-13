// src/engine/improvements/purchase.ts

import type { ImprovementId } from "./types";
import type { Prosperity } from "../prosperity/types";
import type { GameEvent } from "../events/GameEvent";
import type { GameError } from "../events/GameError";
import type { Result } from "../../shared/types";
import { getImprovement } from "./catalog";

export interface PurchaseResult {
  readonly improvements: ImprovementId[];
  readonly prosperity: Prosperity;
  readonly events: GameEvent[];
}

/**
 * Purchases a Realm Improvement.
 *
 * Returns a typed error if:
 * - The improvement ID is not in the catalog → `ImprovementNotFound`
 * - The improvement is already purchased → `ImprovementAlreadyPurchased`
 * - The player cannot afford the cost → `InsufficientProsperity`
 */
export function purchaseImprovement(
  improvements: readonly ImprovementId[],
  prosperity: Prosperity,
  improvementId: ImprovementId,
): Result<PurchaseResult, GameError> {
  const improvement = getImprovement(improvementId);
  if (!improvement) {
    return {
      success: false,
      error: { type: "ImprovementNotFound", improvementId },
    };
  }

  if (improvements.includes(improvementId)) {
    return {
      success: false,
      error: { type: "ImprovementAlreadyPurchased", improvementId },
    };
  }

  if (prosperity < improvement.cost) {
    return {
      success: false,
      error: {
        type: "InsufficientProsperity",
        cost: improvement.cost,
        available: prosperity,
      },
    };
  }

  return {
    success: true,
    value: {
      improvements: [...improvements, improvementId],
      prosperity: prosperity - improvement.cost,
      events: [{ type: "ImprovementPurchased", improvementId }],
    },
  };
}