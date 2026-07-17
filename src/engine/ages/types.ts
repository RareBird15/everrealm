// src/engine/ages/types.ts

export type AgeId =
  | "FoundingAge"
  | "AgeOfGrowth"
  | "AgeOfCityStates"
  | "AgeOfSplendor"
  | "AgeOfLegends"
  | "AgeOfMyths";

export interface Age {
  readonly id: AgeId;
  readonly name: string;
  readonly index: number;
  readonly description: string;
  /** The new mechanic layer introduced by this Age. */
  readonly newMechanic: string;
}