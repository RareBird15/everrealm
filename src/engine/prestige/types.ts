// src/engine/prestige/types.ts

/**
 * The five legacy options a player can choose when they ascend.
 * Each gives a specific, strategic bonus that changes how the next
 * playthrough feels — not a generic multiplier.
 */
export type LegacyId =
  | "EternalPyramid"
  | "FoundersStela"
  | "JadePalace"
  | "GardenOfEternity"
  | "CodexOfAges";

export interface Legacy {
  readonly id: LegacyId;
  readonly name: string;
  readonly description: string;
  readonly playStyle: string;
}

/**
 * Prestige state — the player's accumulated legacies.
 * Up to 3 legacy bonuses can be held at once. On the 4th ascension,
 * the player chooses: keep current 3, or replace one.
 */
export interface PrestigeState {
  /** The legacies the player currently holds (max 3). */
  readonly legacies: readonly LegacyId[];
  /** Total number of times the player has ascended. */
  readonly ascensionCount: number;
}