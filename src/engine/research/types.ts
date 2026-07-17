// src/engine/research/types.ts

import type { AgeId } from "../ages/types";
import type { CacaoAmount } from "../cacao/types";
import type { StandardLevel } from "../settlements/types";
import type { SpecialBuilding } from "../settlements/types";

export type ResearchId = string & { readonly __brand: "ResearchId" };

/**
 * The two categories of research:
 *
 * - SettlementUpgrade: Transforms ALL settlements to the next tier.
 *   Two per Age (Founding through Golden). None in Legends or Myths.
 *
 * - Specialization: Unlocks a prosperity building that settlements
 *   can be specialized into. Three per Age (Founding through Golden),
 *   five in Legends, four in Myths.
 */
export type ResearchCategory = "SettlementUpgrade" | "Specialization";

/**
 * Effect a specialized building produces.
 * Design principle: the bonus is flat regardless of the tier at which
 * the player specializes — the decision is "upgrade or specialize,"
 * not "what level for max benefit."
 */
export type BuildingEffect =
  | { kind: "PassiveIncomePerHour"; amount: number }
  | { kind: "EstablishBonusPer"; amount: number }
  | { kind: "EstablishCostReductionPer"; amount: number }
  | { kind: "DiscoveryBonusPer"; amount: number }
  | { kind: "LandParcelPerBuilding"; amount: number }
  | { kind: "PassiveRateMultiplierPer"; amount: number }
  | { kind: "ActiveIncomePerTurn"; amount: number }
  | { kind: "ResearchCostReductionPer"; amount: number }
  | { kind: "RealmPassiveMultiplier"; amount: number }
  | { kind: "IncomePerSpecialization"; amount: number }
  | { kind: "ScalesWithBuildings"; buildings: SpecialBuilding[]; amountPerBuilding: number }
  | { kind: "RevealsNextAgeResearch"; amount: 1 };

export interface ResearchNode {
  readonly id: ResearchId;
  readonly name: string;
  readonly description: string;
  readonly category: ResearchCategory;
  readonly age: AgeId;
  readonly cost: CacaoAmount;

  // For SettlementUpgrade research:
  /** The tier all settlements upgrade FROM. */
  readonly fromTier?: StandardLevel;
  /** The tier all settlements upgrade TO. */
  readonly toTier?: StandardLevel;

  // For Specialization research:
  /** The building this research unlocks for specialization. */
  readonly unlocksBuilding?: SpecialBuilding;
  /** Effects the specialized building produces. */
  readonly buildingEffects?: readonly BuildingEffect[];
  /** Human-readable description of what the building does. */
  readonly buildingDescription?: string;

  /** Research IDs that must be completed before this one is available. */
  readonly requires?: readonly ResearchId[];
}