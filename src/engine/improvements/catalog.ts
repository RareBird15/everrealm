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
  // ── Tier 4 (Golden Age) ──
  {
    id: id("great_basilica"),
    name: "Great Basilica",
    description: "A vast basilica of arched ceilings and golden light, drawing pilgrims whose offerings enrich every discovery. +200 to all discovery rewards.",
    cost: 1200,
    effects: [{ kind: "IncreaseDiscoveryReward", amount: 200 }],
    availableFromAge: "GoldenAge" as AgeId,
  },
  {
    id: id("grand_plaza"),
    name: "Grand Plaza",
    description: "A sweeping plaza at the heart of the realm, where crowds gather for festivals and commerce flows freely. +20 settlement capacity.",
    cost: 1500,
    effects: [{ kind: "IncreaseCapacity", amount: 20 }],
    availableFromAge: "GoldenAge" as AgeId,
  },
  {
    id: id("silk_road"),
    name: "Silk Road",
    description: "A network of trade routes spanning the known world, carrying silk, spice, and silver into the realm's coffers. +200 Prosperity per hour.",
    cost: 1800,
    effects: [{ kind: "IncreasePassiveProsperity", amount: 200 }],
    availableFromAge: "GoldenAge" as AgeId,
  },
  // ── Tier 5 (Age of Legends) ──
  {
    id: id("hall_of_heroes"),
    name: "Hall of Heroes",
    description: "A vaulted hall lined with the trophies of legendary deeds, inspiring every act of development across the realm. +10 to all active rewards.",
    cost: 2500,
    effects: [{ kind: "IncreaseActiveReward", amount: 10 }],
    availableFromAge: "AgeOfLegends" as AgeId,
  },
  {
    id: id("hanging_gardens"),
    name: "Hanging Gardens",
    description: "Terraced gardens cascading with flowers and fountains, whose beauty draws visitors from across the world. +300 Prosperity per hour.",
    cost: 3000,
    effects: [{ kind: "IncreasePassiveProsperity", amount: 300 }],
    availableFromAge: "AgeOfLegends" as AgeId,
  },
  {
    id: id("philosopher_stone"),
    name: "Philosopher's Stone",
    description: "A legendary artifact that transmutes base matter into wondrous discoveries, doubling the value of every find. +500 to all discovery rewards.",
    cost: 3500,
    effects: [{ kind: "IncreaseDiscoveryReward", amount: 500 }],
    availableFromAge: "AgeOfLegends" as AgeId,
  },
  // ── Tier 6 (Age of Myths) ──
  {
    id: id("temple_of_ages"),
    name: "Temple of Ages",
    description: "A temple that transcends the ages, where the faithful channel devotion into unending prosperity. +500 Prosperity per hour.",
    cost: 5000,
    effects: [{ kind: "IncreasePassiveProsperity", amount: 500 }],
    availableFromAge: "AgeOfMyths" as AgeId,
  },
  {
    id: id("oracles_sanctum"),
    name: "Oracle's Sanctum",
    description: "A sanctum where the oracle reads the threads of fate, bending the flow of prosperity toward the realm. +50% passive income rate.",
    cost: 6000,
    effects: [{ kind: "PassiveRateMultiplier", amount: 0.5 }],
    availableFromAge: "AgeOfMyths" as AgeId,
  },
  {
    id: id("eternal_monument"),
    name: "Eternal Monument",
    description: "A monument that will outlast empires, its presence inspiring citizens to feats of legendary ambition. +25 to all active rewards.",
    cost: 8000,
    effects: [{ kind: "IncreaseActiveReward", amount: 25 }],
    availableFromAge: "AgeOfMyths" as AgeId,
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