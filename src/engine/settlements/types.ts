// src/engine/settlements/types.ts

import type { AgeId } from "../ages/types";

/** Standard settlement levels that follow the merge progression. */
export type StandardLevel =
  | "Tent"
  | "Hut"
  | "Cottage"
  | "House"
  | "Manor"
  | "Hamlet"
  | "Village"
  | "Town"
  | "City"
  | "Citadel";

/** Special buildings unlocked via the tech tree. Leaf nodes — no merging. */
export type SpecialBuilding =
  | "Farm"
  | "Market"
  | "Workshop"
  | "Library"
  | "TownHall"
  | "Aqueduct"
  | "Shrine"
  | "Bank"
  | "Apothecary";

/** All possible settlement types. */
export type SettlementLevel = StandardLevel | SpecialBuilding;

export interface SettlementStack {
  readonly age: AgeId;
  readonly level: SettlementLevel;
  readonly quantity: number;
}