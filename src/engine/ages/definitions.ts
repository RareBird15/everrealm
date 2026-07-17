// src/engine/ages/definitions.ts

import type { AgeId, Age } from "./types";

/**
 * The six Ages in progression order.
 *
 * Each Age represents a chapter in the civilization's history.
 * Each introduces one new mechanic layer on top of the previous ones.
 * The game gets deeper, but never more complicated all at once.
 *
 * Advancement requires researching the top-tier technology for the current Age.
 */
export const AGES: readonly Age[] = [
  {
    id: "FoundingAge",
    name: "Founding Age",
    index: 0,
    description: "The first stirrings of civilization. Tents rise on cleared ground, and people dare to imagine a future beyond survival.",
    newMechanic: "Basics — establish settlements, earn cacao, research first upgrades, discover specialization.",
  },
  {
    id: "AgeOfGrowth",
    name: "Age of Growth",
    index: 1,
    description: "Settlements multiply and trade routes form. The realm is young and hungry, reaching outward. Specialization unlocks — the first real choice between upgrading and specializing.",
    newMechanic: "Specialization — upgrade a settlement or lock it for income.",
  },
  {
    id: "AgeOfCityStates",
    name: "Age of City-States",
    index: 2,
    description: "The realm grows into city-states, known in Nahuatl as altepetl — self-governing communities with their own identity. Wealth concentrates, and specializations begin to interact with each other.",
    newMechanic: "Interaction — specializations affect each other.",
  },
  {
    id: "AgeOfSplendor",
    name: "Age of Splendor",
    index: 3,
    description: "An era of prosperity and flourishing arts. The realm's cities hum with commerce, and specializations feed into each other across Ages. The game becomes about composing your realm, not just building it.",
    newMechanic: "Synergy — specializations scale across Ages.",
  },
  {
    id: "AgeOfLegends",
    name: "Age of Legends",
    index: 4,
    description: "Heroes and scholars walk the realm. Five mechanically unique buildings, each doing something no previous building does. The game shifts from bigger numbers to new kinds of power.",
    newMechanic: "Unique power — mechanically distinct buildings.",
  },
  {
    id: "AgeOfMyths",
    name: "Age of Myths",
    index: 5,
    description: "The realm has passed into story. Build legendary buildings, research the transformation, and ascend your Capital into a permanent legacy that shapes your next playthrough.",
    newMechanic: "Transformation — ascension and legacy.",
  },
];

/** Returns the Age with the given id, or undefined. */
export function getAge(id: AgeId): Age | undefined {
  return AGES.find((a) => a.id === id);
}

/** Returns the Age at the given 0-based index, or undefined. */
export function getAgeByIndex(index: number): Age | undefined {
  return AGES[index];
}

/** Returns the next Age after `id`, or null if `id` is the final Age. */
export function nextAge(id: AgeId): Age | null {
  const current = getAge(id);
  if (!current) return null;
  return getAgeByIndex(current.index + 1) ?? null;
}

/** Returns true if `id` is the final Age (Age of Myths). */
export function isFinalAge(id: AgeId): boolean {
  return id === "AgeOfMyths";
}