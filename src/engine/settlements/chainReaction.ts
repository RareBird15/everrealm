// src/engine/settlements/chainReaction.ts

import type { AgeId } from "../ages/types";
import type { SettlementStack, StandardLevel } from "./types";
import type { TechNodeId } from "../techtree/types";
import type { GameEvent } from "../events/GameEvent";
import { findStack, addToStack, removeFromStack } from "./stacks";
import { nextLevel } from "./progression";

export interface ChainReactionResult {
  readonly settlements: SettlementStack[];
  readonly events: GameEvent[];
  readonly chainLength: number;
}

/**
 * Returns true if the player has any special building tech unlocked
 * that can branch from the given standard level.
 */
function hasBranchingOption(unlockedTechs: readonly TechNodeId[]): boolean {
  // Any unlocked tech node means the player can branch from any standard level
  // into that tech's special building. So if any tech is unlocked, branching
  // is possible at every standard level.
  return unlockedTechs.length > 0;
}

/**
 * Runs chain reactions starting from a newly created settlement at
 * (age, level).
 *
 * The newly created settlement auto-combines with one existing identical
 * settlement, producing the next level. This repeats until:
 * - The newly created settlement has no match (no existing settlement at
 *   its current level), or
 * - The next level would consume a stack where the player has a branching
 *   option (any unlocked tech), giving the player a chance to manually
 *   decide whether to cascade or branch into a special building.
 *
 * Only the settlement created during the current action participates.
 * Pre-existing eligible pairs elsewhere do not merge.
 *
 * @param settlements - The settlements array *after* the new settlement
 *   has been added to (age, level).
 * @param age - The Age of the newly created settlement.
 * @param level - The level of the newly created settlement.
 * @param unlockedTechs - Tech nodes the player has unlocked. Chain reactions
 *   stop when branching options exist to preserve player choice.
 */
export function runChainReaction(
  settlements: readonly SettlementStack[],
  age: AgeId,
  level: StandardLevel,
  unlockedTechs: readonly TechNodeId[] = [],
): ChainReactionResult {
  const events: GameEvent[] = [];
  let chainLength = 0;
  let current: SettlementStack[] = [...settlements];
  let currentLevel = level;

  while (true) {
    // The newly created settlement is 1 in this stack.
    // A match exists if the stack has >= 2 (our 1 + at least 1 pre-existing).
    const stack = findStack(current, age, currentLevel);
    if (!stack || stack.quantity < 2) break;

    const next = nextLevel(currentLevel);
    if (!next) break; // Can't chain beyond Citadel

    // Stop cascading if the player has branching options at this level.
    // This preserves the player's choice to manually develop into a special
    // building instead of letting the chain consume the stack automatically.
    if (hasBranchingOption(unlockedTechs)) break;

    current = removeFromStack(current, age, currentLevel, 2);
    current = addToStack(current, age, next, 1);

    events.push({
      type: "SettlementDeveloped",
      age,
      level: currentLevel,
      newLevel: next,
      source: "ChainReaction",
    });

    chainLength++;
    currentLevel = next;
  }

  return { settlements: current, events, chainLength };
}