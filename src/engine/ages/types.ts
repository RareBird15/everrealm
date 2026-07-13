// src/engine/ages/types.ts

export type AgeId =
  | "FoundingAge"
  | "AgeOfGrowth"
  | "AgeOfLords"
  | "GoldenAge"
  | "AgeOfLegends"
  | "AgeOfMyths";

export interface Age {
  readonly id: AgeId;
  readonly name: string;
  readonly index: number;
  readonly description: string;
}