// src/engine/ages/definitions.ts

import type { AgeId, Age } from "./types";

/**
 * The six Ages in progression order.
 *
 * Each Age represents a chapter in the civilization's history.
 * Advancing requires two Citadels of the current Age.
 */
export const AGES: readonly Age[] = [
  { id: "FoundingAge", name: "Founding Age", index: 0, description: "The first stirrings of civilization. Tents rise in cleared ground, and people dare to imagine a future beyond survival." },
  { id: "AgeOfGrowth", name: "Age of Growth", index: 1, description: "Settlements multiply and trade routes form. The realm is young and hungry, reaching outward." },
  { id: "AgeOfLords", name: "Age of Lords", index: 2, description: "Noble houses establish themselves. Wealth concentrates, and the first true towns rise from clusters of huts and farms." },
  { id: "GoldenAge", name: "Golden Age", index: 3, description: "An era of prosperity and flourishing arts. The realm's cities hum with commerce, and its granaries overflow." },
  { id: "AgeOfLegends", name: "Age of Legends", index: 4, description: "Heroes and scholars walk the realm. Great deeds are recorded, and the names of cities echo far beyond their walls." },
  { id: "AgeOfMyths", name: "Age of Myths", index: 5, description: "The realm has passed into story. Its wonders are spoken of in the same breath as the old gods, and its citadels stand as monuments to what civilization can achieve." },
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