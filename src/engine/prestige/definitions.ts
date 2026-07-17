// src/engine/prestige/definitions.ts

import type { LegacyId, Legacy } from "./types";

/**
 * The five legacy options a player can choose when they ascend.
 * Each gives a specific, strategic bonus that changes how the next
 * playthrough feels — not a generic multiplier.
 *
 * Up to 3 legacies can be held at once. On the 4th ascension, the player
 * chooses: keep current 3, or replace one with the new legacy.
 */
export const LEGACIES: readonly Legacy[] = [
  {
    id: "EternalPyramid",
    name: "Eternal Pyramid",
    description: "+10% passive income across all future playthroughs.",
    playStyle: "Wealth-focused",
  },
  {
    id: "FoundersStela",
    name: "Founders' Stela",
    description: "Start each new game with one Founding Age tech already researched.",
    playStyle: "Skip early game",
  },
  {
    id: "JadePalace",
    name: "Jade Palace",
    description: "Specializations are 25% stronger in future games.",
    playStyle: "Specialization-focused",
  },
  {
    id: "GardenOfEternity",
    name: "Garden of Eternity",
    description: "Start with 2 extra land parcels in every future game.",
    playStyle: "Expansion-focused",
  },
  {
    id: "CodexOfAges",
    name: "Codex of Ages",
    description: "See the next Age's researches before advancing in every future game.",
    playStyle: "Planning-focused",
  },
];

/** Returns the Legacy with the given id, or undefined. */
export function getLegacy(id: LegacyId): Legacy | undefined {
  return LEGACIES.find((l) => l.id === id);
}

/** Maximum number of legacies a player can hold simultaneously. */
export const MAX_LEGACIES = 3;