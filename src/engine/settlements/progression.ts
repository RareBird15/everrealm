// src/engine/settlements/progression.ts

import type { StandardLevel, SpecialBuilding, SettlementLevel } from "./types";

/**
 * The standard settlement progression order, from lowest to highest.
 *
 * 9 levels: Tent → Hut → Cottage → House → Homestead → Village → Town → City → Capital.
 * Capital is the top — no settlement upgrades exist beyond it.
 *
 * In v0.3, research upgrades ALL settlements to the next tier simultaneously.
 * No merging. No pairing. No 256-tent grinding.
 */
export const SETTLEMENT_LEVELS: readonly StandardLevel[] = [
  "Tent",
  "Hut",
  "Cottage",
  "House",
  "Homestead",
  "Village",
  "Town",
  "City",
  "Capital",
];

/** All special buildings that can be created through specialization research. */
export const SPECIAL_BUILDINGS: readonly SpecialBuilding[] = [
  "Farm",
  "Market",
  "Workshop",
  "Codex",
  "Council",
  "Aqueduct",
  "Estate",
  "Treasury",
  "Observatory",
  "CraftDistrict",
  "TradeMission",
  "Academy",
  "WarShrine",
  "AlchemistsLab",
  "Temple",
  "Garden",
  "Oracle",
  "Pyramid",
  "Stela",
  "Sanctum",
];

/** Returns true if `level` is a special building (not on the standard ladder). */
export function isSpecialBuilding(level: SettlementLevel): level is SpecialBuilding {
  return SPECIAL_BUILDINGS.some((b) => b === level);
}

/** Returns true if `level` is a standard settlement on the progression ladder. */
export function isStandardLevel(level: SettlementLevel): level is StandardLevel {
  return SETTLEMENT_LEVELS.some((l) => l === level);
}

/** Returns the 0-based index of a standard settlement level in the progression. */
export function levelIndex(level: StandardLevel): number {
  return SETTLEMENT_LEVELS.indexOf(level);
}

/** Returns the next standard settlement level, or null if `level` is the maximum (Capital). */
export function nextLevel(level: StandardLevel): StandardLevel | null {
  const idx = levelIndex(level);
  if (idx < 0 || idx >= SETTLEMENT_LEVELS.length - 1) return null;
  return SETTLEMENT_LEVELS[idx + 1] ?? null;
}

/** Returns true if `level` is the maximum standard settlement level (Capital). */
export function isMaxLevel(level: StandardLevel): boolean {
  return level === "Capital";
}