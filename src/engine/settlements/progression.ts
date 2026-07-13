// src/engine/settlements/progression.ts

import type { SettlementLevel, StandardLevel, SpecialBuilding } from "./types";

/**
 * The standard settlement progression order, from lowest to highest.
 *
 * Each Age uses the same 10-level progression.
 * Building two Citadels unlocks the next Age.
 */
export const SETTLEMENT_LEVELS: readonly StandardLevel[] = [
  "Tent",
  "Hut",
  "Cottage",
  "House",
  "Manor",
  "Hamlet",
  "Village",
  "Town",
  "City",
  "Citadel",
];

/** All special buildings that can be created via tech tree unlocks. */
export const SPECIAL_BUILDINGS: readonly SpecialBuilding[] = [
  "Farm",
  "Market",
  "Workshop",
  "Library",
  "TownHall",
  "Aqueduct",
];

/** Returns true if `level` is a special building (not on the standard ladder). */
export function isSpecialBuilding(level: SettlementLevel): level is SpecialBuilding {
  return SPECIAL_BUILDINGS.some((b) => b === level);
}

/** Returns true if `level` is a standard settlement on the merge ladder. */
export function isStandardLevel(level: SettlementLevel): level is StandardLevel {
  return SETTLEMENT_LEVELS.some((l) => l === level);
}

/** Returns the 0-based index of a standard settlement level in the progression. */
export function levelIndex(level: StandardLevel): number {
  return SETTLEMENT_LEVELS.indexOf(level);
}

/** Returns the next standard settlement level, or null if `level` is the maximum (Citadel). */
export function nextLevel(level: StandardLevel): StandardLevel | null {
  const idx = levelIndex(level);
  if (idx < 0 || idx >= SETTLEMENT_LEVELS.length - 1) return null;
  return SETTLEMENT_LEVELS[idx + 1] ?? null;
}

/** Returns true if `level` is the maximum standard settlement level (Citadel). */
export function isMaxLevel(level: SettlementLevel): boolean {
  return level === "Citadel";
}

/**
 * Returns true if `level` can be developed (has a next level or is a valid
 * develop target). Special buildings and Citadel cannot be developed further.
 */
export function canDevelop(level: SettlementLevel): boolean {
  if (isSpecialBuilding(level)) return false;
  if (isMaxLevel(level)) return false;
  return true;
}