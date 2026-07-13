// src/engine/settlements/develop.ts

import type { AgeId } from "../ages/types";
import type { SettlementStack, SettlementLevel, StandardLevel } from "./types";
import type { GameEvent } from "../events/GameEvent";
import type { GameError } from "../events/GameError";
import type { Result } from "../../shared/types";
import { findStack, addToStack, removeFromStack } from "./stacks";
import { nextLevel, isMaxLevel, isSpecialBuilding, levelIndex } from "./progression";
import { runChainReaction } from "./chainReaction";
import type { TechNodeId } from "../techtree/types";
import { getTechForBuilding } from "../techtree/definitions";

export interface DevelopResult {
  readonly settlements: SettlementStack[];
  readonly events: GameEvent[];
}

/**
 * Develops a settlement: consumes 2 from the (age, level) stack and creates
 * 1 at the target level. Chain reactions cascade automatically if the newly
 * created settlement matches an existing one.
 *
 * If `target` is not specified, defaults to `nextLevel(level)` — the standard
 * progression. If `target` is a special building (Farm, Market, Workshop),
 * no chain reaction occurs (special buildings are leaf nodes).
 *
 * The caller identifies a stack by (age, level). The engine consumes two
 * from that stack — the player does not select individual settlements.
 *
 * Returns a typed error if:
 * - `level` is Citadel or a special building (cannot develop further) → `InvalidAgeOrLevel`
 * - `target` is a special building that hasn't been unlocked → `BuildingNotUnlocked`
 * - No stack exists for (age, level) or quantity < 2 → `NoEligibleSettlements`
 */
export function developSettlement(
  settlements: readonly SettlementStack[],
  age: AgeId,
  level: SettlementLevel,
  target?: SettlementLevel,
  unlockedTechs: readonly TechNodeId[] = [],
): Result<DevelopResult, GameError> {
  // Can't develop special buildings or the maximum level
  if (isSpecialBuilding(level) || isMaxLevel(level)) {
    return {
      success: false,
      error: { type: "InvalidAgeOrLevel", age, level },
    };
  }

  // Determine the target level
  let targetLevel: SettlementLevel;
  if (target !== undefined) {
    targetLevel = target;
  } else {
    const next = nextLevel(level as StandardLevel);
    if (!next) {
      return { success: false, error: { type: "InvalidAgeOrLevel", age, level } };
    }
    targetLevel = next;
  }

  // If developing into a special building, check minimum source level
  if (isSpecialBuilding(targetLevel)) {
    const tech = getTechForBuilding(targetLevel);
    if (tech) {
      const sourceIdx = levelIndex(level as StandardLevel);
      const minIdx = levelIndex(tech.minimumSourceLevel);
      if (sourceIdx < minIdx) {
        return {
          success: false,
          error: {
            type: "SourceLevelTooLow",
            building: targetLevel,
            sourceLevel: level,
            minimumLevel: tech.minimumSourceLevel,
          },
        };
      }
    }
  }

  // Need at least 2 settlements of this type
  const stack = findStack(settlements, age, level);
  if (!stack || stack.quantity < 2) {
    return {
      success: false,
      error: { type: "NoEligibleSettlements", age, level },
    };
  }

  // Consume 2 from the source stack, create 1 at target level
  let current = removeFromStack(settlements, age, level, 2);
  current = addToStack(current, age, targetLevel, 1);

  const events: GameEvent[] = [
    {
      type: "SettlementDeveloped",
      age,
      level,
      newLevel: targetLevel,
      source: "Player",
    },
  ];

  // Only run chain reactions for standard levels, not special buildings
  if (!isSpecialBuilding(targetLevel)) {
    const chain = runChainReaction(current, age, targetLevel as StandardLevel, unlockedTechs);

    if (chain.chainLength > 0) {
      events.push({ type: "ChainReactionStarted" });
      events.push(...chain.events);
      events.push({
        type: "ChainReactionCompleted",
        chainLength: chain.chainLength,
      });
      current = chain.settlements;
    }
  }

  return {
    success: true,
    value: { settlements: current, events },
  };
}