// src/engine/settlements/types.ts

/**
 * Standard settlement levels — the 9-tier progression chain.
 * New settlements are always established at the player's current base tier
 * (determined by research progress). Research upgrades ALL settlements
 * to the next tier simultaneously — no merging.
 */
export type StandardLevel =
  | "Tent"
  | "Hut"
  | "Cottage"
  | "House"
  | "Homestead"
  | "Village"
  | "Town"
  | "City"
  | "Capital";

/**
 * Specialized buildings — a settlement can be specialized into one of these
 * instead of upgrading. It locks at its current tier and produces an ongoing
 * bonus. Each is unlocked through research.
 */
export type SpecialBuilding =
  | "Farm"
  | "Market"
  | "Workshop"
  | "Codex"
  | "Council"
  | "Aqueduct"
  | "Estate"
  | "Treasury"
  | "Observatory"
  | "CraftDistrict"
  | "TradeMission"
  | "Academy"
  | "WarShrine"
  | "AlchemistsLab"
  | "Temple"
  | "Garden"
  | "Oracle"
  | "Pyramid"
  | "Stela"
  | "Sanctum";

/** All possible settlement types. */
export type SettlementLevel = StandardLevel | SpecialBuilding;

/**
 * An individual settlement on a land parcel.
 * Replaces the old SettlementStack (which grouped identical settlements
 * for merging). In v0.3, each settlement is a distinct entity.
 */
export interface Settlement {
  readonly id: string;
  readonly tier: StandardLevel;
  /** If specialized, the building type this settlement has become. */
  readonly specialization: SpecialBuilding | null;
}

/** Returns true if the settlement has been specialized. */
export function isSpecialized(settlement: Settlement): boolean {
  return settlement.specialization !== null;
}