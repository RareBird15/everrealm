// src/engine/improvements/catalog.ts

import type { Improvement, ImprovementId } from "./types";
import type { AgeId } from "../ages/types";
import { getAge } from "../ages/definitions";

/**
 * Creates a branded ImprovementId from a plain string.
 * Use this to define improvement IDs in the catalog.
 */
function id(s: string): ImprovementId {
  return s as ImprovementId;
}

/**
 * Realm Improvements catalog.
 *
 * Tier 1 (150-500): early game, fundamental bonuses.
 * Tier 2 (400-1000): mid-to-late game, more powerful or unique effects.
 *
 * Each improvement encourages a different play style rather than
 * a single optimal strategy. Costs are placeholders for tuning.
 */
export const IMPROVEMENTS: readonly Improvement[] = [
  // ── Tier 1 ──
  {
    id: id("stone_roads"),
    name: "Stone Roads",
    description: "Paved roads connect your settlements, speeding trade and travel. +30 Prosperity per hour from increased commerce.",
    cost: 150,
    effects: [{ kind: "IncreasePassiveProsperity", amount: 30 }],
    availableFromAge: "FoundingAge" as AgeId,
  },
  {
    id: id("market_charter"),
    name: "Market Charter",
    description: "An official charter grants your merchants trading rights and standardized weights. Every action yields more. +1 to all active rewards.",
    cost: 200,
    effects: [{ kind: "IncreaseActiveReward", amount: 1 }],
    availableFromAge: "FoundingAge" as AgeId,
  },
  {
    id: id("guild_hall"),
    name: "Guild Hall",
    description: "A central hall where crafters and traders organize, pooling resources to expand operations. +5 settlement capacity.",
    cost: 300,
    effects: [{ kind: "IncreaseCapacity", amount: 5 }],
    availableFromAge: "FoundingAge" as AgeId,
  },
  {
    id: id("royal_treasury"),
    name: "Royal Treasury",
    description: "A vault beneath the seat of power, where accumulated wealth works on behalf of the realm. +60 Prosperity per hour from investments and taxes.",
    cost: 500,
    effects: [{ kind: "IncreasePassiveProsperity", amount: 60 }],
    availableFromAge: "FoundingAge" as AgeId,
  },
  {
    id: id("town_watch"),
    name: "Town Watch",
    description: "A organized militia that patrols the roads and keeps the peace, allowing settlements to grow beyond their original bounds. +3 settlement capacity.",
    cost: 250,
    effects: [{ kind: "IncreaseCapacity", amount: 3 }],
    availableFromAge: "FoundingAge" as AgeId,
  },
  // ── Tier 2 ──
  {
    id: id("grand_library"),
    name: "Grand Library",
    description: "A vast repository of knowledge where scholars study the realm's discoveries. +50 to all discovery rewards.",
    cost: 400,
    effects: [{ kind: "IncreaseDiscoveryReward", amount: 50 }],
    availableFromAge: "AgeOfGrowth" as AgeId,
  },
  {
    id: id("colonnade"),
    name: "Colonnade",
    description: "Grand columns and public squares give your settlements room to breathe and grow. +10 settlement capacity.",
    cost: 500,
    effects: [{ kind: "IncreaseCapacity", amount: 10 }],
    availableFromAge: "AgeOfGrowth" as AgeId,
  },
  {
    id: id("royal_mint"),
    name: "Royal Mint",
    description: "A sanctioned mint standardizes coinage, boosting commerce far beyond what simple treasuries can achieve. +50 Prosperity per hour.",
    cost: 600,
    effects: [{ kind: "IncreasePassiveProsperity", amount: 50 }],
    availableFromAge: "AgeOfGrowth" as AgeId,
  },
  {
    id: id("ancient_ruins"),
    name: "Ancient Ruins",
    description: "Mysterious ruins on the edge of the realm attract explorers and scholars, greatly increasing the value of every new discovery. +100 to all discovery rewards.",
    cost: 700,
    effects: [{ kind: "IncreaseDiscoveryReward", amount: 100 }],
    availableFromAge: "AgeOfGrowth" as AgeId,
  },
  {
    id: id("monument"),
    name: "Monument",
    description: "A towering monument commemorates the realm's greatest achievements, inspiring citizens to greater efforts. +3 to all active rewards.",
    cost: 800,
    effects: [{ kind: "IncreaseActiveReward", amount: 3 }],
    availableFromAge: "AgeOfGrowth" as AgeId,
  },
  // ── Tier 3 (Age of Lords) ──
  {
    id: id("great_walls"),
    name: "Great Walls",
    description: "Massive fortifications surround your cities, protecting your accumulated wealth. +100 Prosperity per hour from secured trade.",
    cost: 800,
    effects: [{ kind: "IncreasePassiveProsperity", amount: 100 }],
    availableFromAge: "AgeOfLords" as AgeId,
  },
  {
    id: id("cathedral"),
    name: "Cathedral",
    description: "A towering cathedral inspires devotion and civic pride, doubling the value of every discovery. +150 to all discovery rewards.",
    cost: 1000,
    effects: [{ kind: "IncreaseDiscoveryReward", amount: 150 }],
    availableFromAge: "AgeOfLords" as AgeId,
  },
  {
    id: id("trading_company"),
    name: "Trading Company",
    description: "A chartered trading company extends your reach to distant markets, multiplying every action's reward. +5 to all active rewards.",
    cost: 1200,
    effects: [{ kind: "IncreaseActiveReward", amount: 5 }],
    availableFromAge: "AgeOfLords" as AgeId,
  },
];

/**
 * Returns true if `improvement` is available in `currentAge`.
 *
 * An improvement is available once the realm has reached the Age it
 * was introduced in. If either Age cannot be resolved, the improvement
 * is treated as available (fail-open).
 */
export function isImprovementAvailableForAge(
  improvement: Improvement,
  currentAge: AgeId,
): boolean {
  const required = getAge(improvement.availableFromAge);
  const current = getAge(currentAge);
  if (!required || !current) return true;
  return current.index >= required.index;
}

/** Returns the improvement with the given id, or undefined. */
export function getImprovement(improvementId: ImprovementId): Improvement | undefined {
  return IMPROVEMENTS.find((i) => i.id === improvementId);
}