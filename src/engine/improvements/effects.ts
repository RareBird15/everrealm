// src/engine/improvements/effects.ts

import type { ImprovementEffect } from "./types";
import type { Prosperity } from "../prosperity/types";

export interface EffectSummary {
  /** Additional settlement capacity from all effects. */
  readonly capacityBonus: number;
  /** Additional passive prosperity per hour from all effects. */
  readonly passiveBonus: Prosperity;
  /** Multiplier or flat bonus to active rewards from all effects. */
  readonly activeRewardBonus: Prosperity;
  /** Flat bonus to discovery rewards from all effects. */
  readonly discoveryBonus: Prosperity;
  /** Multiplier to the base passive rate (e.g. 0.05 = +5%). Stacks additively. */
  readonly passiveRateMultiplier: number;
}

/**
 * Summarizes a list of improvement effects into aggregate bonuses.
 */
export function summarizeEffects(
  effects: readonly ImprovementEffect[],
): EffectSummary {
  let capacityBonus = 0;
  let passiveBonus: Prosperity = 0;
  let activeRewardBonus: Prosperity = 0;
  let discoveryBonus: Prosperity = 0;
  let passiveRateMultiplier = 0;

  for (const effect of effects) {
    switch (effect.kind) {
      case "IncreaseCapacity":
        capacityBonus += effect.amount;
        break;
      case "IncreasePassiveProsperity":
        passiveBonus += effect.amount;
        break;
      case "IncreaseActiveReward":
        activeRewardBonus += effect.amount;
        break;
      case "IncreaseDiscoveryReward":
        discoveryBonus += effect.amount;
        break;
      case "PassiveRateMultiplier":
        passiveRateMultiplier += effect.amount;
        break;
    }
  }

  return {
    capacityBonus,
    passiveBonus,
    activeRewardBonus,
    discoveryBonus,
    passiveRateMultiplier,
  };
}