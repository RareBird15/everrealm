// src/engine/improvements/types.ts

import type { Prosperity } from "../prosperity/types";
import type { AgeId } from "../ages/types";

export type ImprovementId = string & { readonly __brand: "ImprovementId" };

export interface Improvement {
  readonly id: ImprovementId;
  readonly name: string;
  readonly description: string;
  readonly cost: Prosperity;
  readonly effects: readonly ImprovementEffect[];
  readonly availableFromAge: AgeId;
}

export type ImprovementEffect =
  | { kind: "IncreaseCapacity"; amount: number }
  | { kind: "IncreasePassiveProsperity"; amount: number }
  | { kind: "IncreaseActiveReward"; amount: number }
  | { kind: "IncreaseDiscoveryReward"; amount: number }
  | { kind: "PassiveRateMultiplier"; amount: number };