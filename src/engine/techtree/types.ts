// src/engine/techtree/types.ts

import type { AgeId } from "../ages/types";
import type { Prosperity } from "../prosperity/types";
import type { SpecialBuilding } from "../settlements/types";
import type { StandardLevel } from "../settlements/types";

export type TechNodeId = string & { readonly __brand: "TechNodeId" };

export type BuildingEffect =
  | { kind: "PassivePerHour"; amount: number }
  | { kind: "DevelopBonusPer"; amount: number }
  | { kind: "EstablishBonusPer"; amount: number }
  | { kind: "EstablishCostReductionPer"; amount: number }
  | { kind: "DiscoveryBonusPer"; amount: number }
  | { kind: "CapacityPerBuilding"; amount: number }
  | { kind: "PassiveRateMultiplierPer"; amount: number };

export interface TechNode {
  readonly id: TechNodeId;
  readonly name: string;
  readonly description: string;
  readonly tier: number;
  readonly cost: Prosperity;
  readonly unlocksBuilding: SpecialBuilding;
  readonly buildingEffects: readonly BuildingEffect[];
  readonly buildingDescription: string;
  /** Tech node IDs that must be unlocked before this node is available. */
  readonly requires?: readonly TechNodeId[];
  /**
   * Minimum standard settlement level required as the source for
   * developing into this special building. E.g. "Hut" means you need
   * 2 Huts (or higher) to develop into this building.
   */
  readonly minimumSourceLevel: StandardLevel;
  /** The Age from which this tech node becomes available. */
  readonly availableFromAge: AgeId;
}