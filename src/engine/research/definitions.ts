// src/engine/research/definitions.ts

import type { AgeId } from "../ages/types";
import { getAge } from "../ages/definitions";
import type { ResearchId, ResearchNode } from "./types";

// ── Balance constants ──

/**
 * Individual research costs. The top-tier upgrade in each Age is always
 * the most expensive, so players can't rush to the advancement gate.
 * Specializations are priced between the two upgrades.
 *
 * Pattern per Age (Founding through Splendor):
 *   First upgrade:  X
 *   Specializations: X + 10 (each)
 *   Top-tier upgrade: X + 20
 *
 * Legends and Myths have no upgrades — specializations scale up.
 */

// Founding Age
const FOUNDING_UPGRADE_1 = 60;   // Forestry (Tent → Hut)
const FOUNDING_UPGRADE_2 = 100;  // Adobe Making (Hut → Cottage) — top tier
const FOUNDING_SPEC = 80;        // Agriculture, Trade, Crafts

// Age of Growth
const GROWTH_UPGRADE_1 = 200;    // Stonecutting (Cottage → House)
const GROWTH_UPGRADE_2 = 300;    // Stucco (House → Homestead) — top tier
const GROWTH_SPEC = 250;         // Codex Keeping, Governance, Engineering

// Age of City-States
const CITYSTATE_UPGRADE_1 = 500; // Mosaic Art (Homestead → Village)
const CITYSTATE_UPGRADE_2 = 700; // Obsidian Working (Village → Town) — top tier
const CITYSTATE_SPEC = 600;      // Calpulli Org, Cacao Treasury, Astronomy

// Age of Splendor
const SPLENDOR_UPGRADE_1 = 1200; // Architecture (Town → City)
const SPLENDOR_UPGRADE_2 = 1600; // Urban Planning (City → Capital) — top tier
const SPLENDOR_SPEC = 1400;      // Industry, Diplomacy, Philosophy

// Age of Legends (no upgrades — all specializations)
const LEGENDS_SPEC = 3000;       // Heroism, Alchemy, Sacred Geometry, Garden, Prophecy

// Age of Myths (no upgrades — all specializations)
const MYTHS_SPEC_1 = 5000;       // Mythology, Divinity
const MYTHS_SPEC_2 = 6000;       // Eternity, Ascension, Monument Building

// ── Helper for creating research IDs ──
function rid(id: string): ResearchId {
  return id as ResearchId;
}

// ═══════════════════════════════════════════════════════════════════════
// Founding Age (5 researches: 2 upgrades + 3 specializations)
// ═══════════════════════════════════════════════════════════════════════

const FOUNDING_UPGRADES: readonly ResearchNode[] = [
  {
    id: rid("forestry"),
    name: "Forestry",
    description: "Your people learn to harvest trees and build simple permanent shelters.",
    category: "SettlementUpgrade",
    age: "FoundingAge",
    cost: FOUNDING_UPGRADE_1,
    fromTier: "Tent",
    toTier: "Hut",
  },
  {
    id: rid("adobeMaking"),
    name: "Adobe Making",
    description: "Your people learn to mix mud, clay, and straw to build walls that keep out the weather. Adobe is one of the oldest building materials in Mesoamerica.",
    category: "SettlementUpgrade",
    age: "FoundingAge",
    cost: FOUNDING_UPGRADE_2,
    fromTier: "Hut",
    toTier: "Cottage",
  },
];

const FOUNDING_SPECS: readonly ResearchNode[] = [
  {
    id: rid("agriculture"),
    name: "Agriculture",
    description: "Your people learn to cultivate milpa — corn, beans, and squash grown together — instead of foraging.",
    category: "Specialization",
    age: "FoundingAge",
    cost: FOUNDING_SPEC,
    unlocksBuilding: "Farm",
    buildingEffects: [
      { kind: "PassiveIncomePerHour", amount: 3 },
      { kind: "EstablishBonusPer", amount: 1 },
    ],
    buildingDescription: "Farms generate +3 Cacao per hour and add +1 to establish rewards for each Farm.",
  },
  {
    id: rid("trade"),
    name: "Trade",
    description: "Your people learn to exchange goods through pochteca — traveling merchants who connect settlements and carry news as well as cargo.",
    category: "Specialization",
    age: "FoundingAge",
    cost: FOUNDING_SPEC,
    unlocksBuilding: "Market",
    buildingEffects: [
      { kind: "PassiveIncomePerHour", amount: 2 },
      { kind: "EstablishBonusPer", amount: 2 },
    ],
    buildingDescription: "Markets generate +2 Cacao per hour and add +2 to establish rewards for each Market.",
  },
  {
    id: rid("crafts"),
    name: "Crafts",
    description: "Your people learn to make tools and goods by hand — pottery, textiles, and carved obsidian.",
    category: "Specialization",
    age: "FoundingAge",
    cost: FOUNDING_SPEC,
    unlocksBuilding: "Workshop",
    buildingEffects: [
      { kind: "PassiveIncomePerHour", amount: 1 },
      { kind: "EstablishCostReductionPer", amount: 1 },
    ],
    buildingDescription: "Workshops generate +1 Cacao per hour and reduce establish cost by 1 for each Workshop (minimum cost 1).",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Age of Growth (5 researches: 2 upgrades + 3 specializations)
// ═══════════════════════════════════════════════════════════════════════

const GROWTH_UPGRADES: readonly ResearchNode[] = [
  {
    id: rid("stonecutting"),
    name: "Stonecutting",
    description: "Your people learn to cut and stack stone. Walls become solid and permanent.",
    category: "SettlementUpgrade",
    age: "AgeOfGrowth",
    cost: GROWTH_UPGRADE_1,
    fromTier: "Cottage",
    toTier: "House",
    requires: [rid("adobeMaking")],
  },
  {
    id: rid("stucco"),
    name: "Stucco",
    description: "Your people learn to mix lime stucco — a Mesoamerican innovation — to coat walls and make homes that last. Homesteads are self-sufficient properties built to endure.",
    category: "SettlementUpgrade",
    age: "AgeOfGrowth",
    cost: GROWTH_UPGRADE_2,
    fromTier: "House",
    toTier: "Homestead",
    requires: [rid("stonecutting")],
  },
];

const GROWTH_SPECS: readonly ResearchNode[] = [
  {
    id: rid("codexKeeping"),
    name: "Codex Keeping",
    description: "Your people learn to record knowledge in painted codices — books of folded bark paper — and pass wisdom between settlements.",
    category: "Specialization",
    age: "AgeOfGrowth",
    cost: GROWTH_SPEC,
    unlocksBuilding: "Codex",
    buildingEffects: [
      { kind: "DiscoveryBonusPer", amount: 25 },
    ],
    buildingDescription: "Each Codex adds +25 to each discovery reward. The more codices your realm keeps, the faster new knowledge spreads.",
  },
  {
    id: rid("governance"),
    name: "Governance",
    description: "Your people learn to organize beyond individual households and manage territory as a community.",
    category: "Specialization",
    age: "AgeOfGrowth",
    cost: GROWTH_SPEC,
    unlocksBuilding: "Council",
    buildingEffects: [
      { kind: "LandParcelPerBuilding", amount: 1 },
    ],
    buildingDescription: "Each Council adds +1 land parcel to your realm, giving you space for more settlements.",
  },
  {
    id: rid("engineering"),
    name: "Engineering",
    description: "Your people learn to move water through aqueducts and canals, connecting settlements and making the land productive.",
    category: "Specialization",
    age: "AgeOfGrowth",
    cost: GROWTH_SPEC,
    unlocksBuilding: "Aqueduct",
    buildingEffects: [
      { kind: "PassiveRateMultiplierPer", amount: 0.05 },
    ],
    buildingDescription: "Each Aqueduct increases the base passive income rate by 5%.",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Age of City-States (5 researches: 2 upgrades + 3 specializations)
// ═══════════════════════════════════════════════════════════════════════

const CITY_STATE_UPGRADES: readonly ResearchNode[] = [
  {
    id: rid("mosaicArt"),
    name: "Mosaic Art",
    description: "Your people learn to create mosaics from turquoise, obsidian, and shell — decorating public buildings and marking villages as places of beauty.",
    category: "SettlementUpgrade",
    age: "AgeOfCityStates",
    cost: CITYSTATE_UPGRADE_1,
    fromTier: "Homestead",
    toTier: "Village",
    requires: [rid("stucco")],
  },
  {
    id: rid("obsidianWorking"),
    name: "Obsidian Working",
    description: "Your people learn to work obsidian — the sharpest material known — into tools, blades, and trade goods. A town is a center of commerce and craft.",
    category: "SettlementUpgrade",
    age: "AgeOfCityStates",
    cost: CITYSTATE_UPGRADE_2,
    fromTier: "Village",
    toTier: "Town",
    requires: [rid("mosaicArt")],
  },
];

const CITY_STATE_SPECS: readonly ResearchNode[] = [
  {
    id: rid("calpulliOrganization"),
    name: "Calpulli Organization",
    description: "Your people learn to organize communities through calpulli — social groups that manage land and labor together. The more your realm is organized, the more efficient each noble house becomes.",
    category: "Specialization",
    age: "AgeOfCityStates",
    cost: CITYSTATE_SPEC,
    unlocksBuilding: "Estate",
    buildingEffects: [
      { kind: "PassiveIncomePerHour", amount: 5 },
      { kind: "ScalesWithBuildings", buildings: ["Farm", "Market", "Workshop", "Codex", "Council", "Aqueduct"], amountPerBuilding: 1 },
    ],
    buildingDescription: "Estates generate +5 Cacao per hour, plus +1 per hour for each other specialized building in your realm.",
  },
  {
    id: rid("cacaoTreasury"),
    name: "Cacao Treasury",
    description: "Your people learn to store and trade cacao beans as currency. Treasuries reward commitment — one gives a small boost, three give a much bigger one.",
    category: "Specialization",
    age: "AgeOfCityStates",
    cost: CITYSTATE_SPEC,
    unlocksBuilding: "Treasury",
    buildingEffects: [
      { kind: "PassiveRateMultiplierPer", amount: 0.08 },
    ],
    buildingDescription: "Each Treasury increases the base passive income rate by 8%. The more treasuries you build, the faster your cacao flows.",
  },
  {
    id: rid("astronomy"),
    name: "Astronomy",
    description: "Your people learn to track the cycles of the sun, moon, and stars. Each Observatory makes your old Codexs more valuable, as ancient records meet new observations.",
    category: "Specialization",
    age: "AgeOfCityStates",
    cost: CITYSTATE_SPEC,
    unlocksBuilding: "Observatory",
    buildingEffects: [
      { kind: "ScalesWithBuildings", buildings: ["Codex"], amountPerBuilding: 15 },
    ],
    buildingDescription: "Each Observatory adds +15 to discovery rewards for each Codex in your realm. Knowledge compounds.",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Age of Splendor (5 researches: 2 upgrades + 3 specializations)
// ═══════════════════════════════════════════════════════════════════════

const SPLENDOR_UPGRADES: readonly ResearchNode[] = [
  {
    id: rid("architecture"),
    name: "Architecture",
    description: "Your people learn to design and build on a grand scale — temples, plazas, and ball courts. A city is planned, organized, with districts and ceremonial centers.",
    category: "SettlementUpgrade",
    age: "AgeOfSplendor",
    cost: SPLENDOR_UPGRADE_1,
    fromTier: "Town",
    toTier: "City",
    requires: [rid("obsidianWorking")],
  },
  {
    id: rid("urbanPlanning"),
    name: "Urban Planning",
    description: "Your people learn to build a seat of power. A capital organizes everything else around it, drawing the realm together.",
    category: "SettlementUpgrade",
    age: "AgeOfSplendor",
    cost: SPLENDOR_UPGRADE_2,
    fromTier: "City",
    toTier: "Capital",
    requires: [rid("architecture")],
  },
];

const SPLENDOR_SPECS: readonly ResearchNode[] = [
  {
    id: rid("industry"),
    name: "Industry",
    description: "Your early-game specializations feed into mid-game power. Each Farm and Workshop makes your Craft District stronger.",
    category: "Specialization",
    age: "AgeOfSplendor",
    cost: SPLENDOR_SPEC,
    unlocksBuilding: "CraftDistrict",
    buildingEffects: [
      { kind: "ScalesWithBuildings", buildings: ["Farm", "Workshop"], amountPerBuilding: 4 },
    ],
    buildingDescription: "Craft Districts generate +4 Cacao per hour for each Farm and Workshop in your realm. Early investments pay off.",
  },
  {
    id: rid("diplomacy"),
    name: "Diplomacy",
    description: "Trade and governance infrastructure makes diplomacy more effective. Each Market and Council expands your Trade Mission's reach.",
    category: "Specialization",
    age: "AgeOfSplendor",
    cost: SPLENDOR_SPEC,
    unlocksBuilding: "TradeMission",
    buildingEffects: [
      { kind: "ScalesWithBuildings", buildings: ["Market", "Council"], amountPerBuilding: 1 },
    ],
    buildingDescription: "Each Trade Mission adds +1 land parcel for each Market and Council in your realm. Trade expands borders.",
  },
  {
    id: rid("philosophy"),
    name: "Philosophy",
    description: "Knowledge buildings feed each other. Each Codex and Observatory makes your Academy's discovery bonus stronger.",
    category: "Specialization",
    age: "AgeOfSplendor",
    cost: SPLENDOR_SPEC,
    unlocksBuilding: "Academy",
    buildingEffects: [
      { kind: "ScalesWithBuildings", buildings: ["Codex", "Observatory"], amountPerBuilding: 30 },
    ],
    buildingDescription: "Each Academy adds +30 to discovery rewards for each Codex and Observatory in your realm.",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Age of Legends (5 researches: all specializations, no upgrades)
// Each building does something mechanically unique.
// ═══════════════════════════════════════════════════════════════════════

const LEGENDS_SPECS: readonly ResearchNode[] = [
  {
    id: rid("heroism"),
    name: "Heroism",
    description: "A legendary figure whose deeds generate wealth directly. No other building produces active income.",
    category: "Specialization",
    age: "AgeOfLegends",
    cost: LEGENDS_SPEC,
    unlocksBuilding: "WarShrine",
    buildingEffects: [
      { kind: "ActiveIncomePerTurn", amount: 5 },
    ],
    buildingDescription: "War Shrines generate +5 Cacao per turn — active income, not passive. The only building that does this.",
  },
  {
    id: rid("alchemy"),
    name: "Alchemy",
    description: "Each Alchemist's Lab makes everything cheaper — not just the next research, all of them.",
    category: "Specialization",
    age: "AgeOfLegends",
    cost: LEGENDS_SPEC,
    unlocksBuilding: "AlchemistsLab",
    buildingEffects: [
      { kind: "ResearchCostReductionPer", amount: 0.05 },
    ],
    buildingDescription: "Each Alchemist's Lab reduces all future research costs by 5%. The more labs, the cheaper everything becomes.",
  },
  {
    id: rid("sacredGeometry"),
    name: "Sacred Geometry",
    description: "One Temple multiplies all passive income across your entire realm.",
    category: "Specialization",
    age: "AgeOfLegends",
    cost: LEGENDS_SPEC,
    unlocksBuilding: "Temple",
    buildingEffects: [
      { kind: "RealmPassiveMultiplier", amount: 0.25 },
    ],
    buildingDescription: "Each Temple multiplies all passive income across your entire realm by 25%. The biggest passive multiplier available.",
  },
  {
    id: rid("gardenCultivation"),
    name: "Garden Cultivation",
    description: "Each Garden generates income for every specialized settlement you have. Rewards commitment to specialization.",
    category: "Specialization",
    age: "AgeOfLegends",
    cost: LEGENDS_SPEC,
    unlocksBuilding: "Garden",
    buildingEffects: [
      { kind: "IncomePerSpecialization", amount: 2 },
    ],
    buildingDescription: "Each Garden generates +2 Cacao per hour for every specialized settlement in your realm. The more you specialize, the more gardens earn.",
  },
  {
    id: rid("prophecy"),
    name: "Prophecy",
    description: "Strategic advantage — plan your realm for what's coming instead of advancing blind. Reveals the next Age's researches before advancing.",
    category: "Specialization",
    age: "AgeOfLegends",
    cost: LEGENDS_SPEC,
    unlocksBuilding: "Oracle",
    buildingEffects: [
      { kind: "RevealsNextAgeResearch", amount: 1 },
    ],
    buildingDescription: "The Oracle reveals the next Age's researches before you advance, letting you plan your realm strategically.",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Age of Myths (4 researches: transformation focus, no upgrades)
// ═══════════════════════════════════════════════════════════════════════

const MYTHS_RESEARCH: readonly ResearchNode[] = [
  {
    id: rid("mythology"),
    name: "Mythology",
    description: "Your civilization begins to build things of legendary significance. Unlocks Pyramid buildings that count toward ascension.",
    category: "Specialization",
    age: "AgeOfMyths",
    cost: MYTHS_SPEC_1,
    unlocksBuilding: "Pyramid",
    buildingEffects: [
      { kind: "PassiveIncomePerHour", amount: 20 },
    ],
    buildingDescription: "Pyramids generate +20 Cacao per hour and count toward ascension. The greatest monuments mark a civilization worthy of legend.",
  },
  {
    id: rid("divinity"),
    name: "Divinity",
    description: "Your people build sanctums where the divine and mortal planes intertwine. Each counts toward ascension and multiplies your realm's income.",
    category: "Specialization",
    age: "AgeOfMyths",
    cost: MYTHS_SPEC_1,
    unlocksBuilding: "Sanctum",
    buildingEffects: [
      { kind: "RealmPassiveMultiplier", amount: 0.50 },
    ],
    buildingDescription: "Each Sanctum multiplies all passive income by 50% and counts toward ascension. The biggest multiplier in the game.",
  },
  {
    id: rid("eternity"),
    name: "Eternity",
    description: "Your civilization raises stelae — stone monuments that record your realm's history for all time. Each counts toward ascension and unlocks the transformation action.",
    category: "Specialization",
    age: "AgeOfMyths",
    cost: MYTHS_SPEC_2,
    unlocksBuilding: "Stela",
    buildingEffects: [
      { kind: "IncomePerSpecialization", amount: 5 },
    ],
    buildingDescription: "Each Stela generates +5 Cacao per hour per specialization and counts toward ascension. Unlocks the transformation action.",
  },
  {
    id: rid("ascension"),
    name: "Ascension",
    description: "Transform your Capital into a permanent legacy and begin a new playthrough with that bonus. This research unlocks the prestige system.",
    category: "Specialization",
    age: "AgeOfMyths",
    cost: MYTHS_SPEC_2,
    buildingEffects: [],
    buildingDescription: "Unlocks the prestige system. Transform your Capital into a permanent legacy and begin anew with a powerful bonus.",
  },
  {
    id: rid("monumentBuilding"),
    name: "Monument Building",
    description: "Your master builders learn techniques that make every specialization more productive. All specialized buildings generate more Cacao.",
    category: "Specialization",
    age: "AgeOfMyths",
    cost: MYTHS_SPEC_2,
    buildingEffects: [
      { kind: "PassiveRateMultiplierPer", amount: 0.10 },
    ],
    buildingDescription: "Each Monument Building research increases all passive income by 10%. The culmination of your civilization's architectural knowledge.",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// All researches combined (30 total)
// ═══════════════════════════════════════════════════════════════════════

export const ALL_RESEARCH: readonly ResearchNode[] = [
  ...FOUNDING_UPGRADES,
  ...FOUNDING_SPECS,
  ...GROWTH_UPGRADES,
  ...GROWTH_SPECS,
  ...CITY_STATE_UPGRADES,
  ...CITY_STATE_SPECS,
  ...SPLENDOR_UPGRADES,
  ...SPLENDOR_SPECS,
  ...LEGENDS_SPECS,
  ...MYTHS_RESEARCH,
];

/** Returns the research node with the given ID, or undefined. */
export function getResearch(id: ResearchId): ResearchNode | undefined {
  for (const r of ALL_RESEARCH) {
    if (r.id === id) return r;
  }
  return undefined;
}

/** Returns all research available in the given Age. */
export function researchForAge(age: AgeId): readonly ResearchNode[] {
  return ALL_RESEARCH.filter((r) => r.age === age);
}

/** Returns true if the prerequisites for `node` are met. */
export function meetsPrerequisites(
  node: ResearchNode,
  completed: readonly ResearchId[],
): boolean {
  if (!node.requires || node.requires.length === 0) return true;
  return node.requires.some((req) => completed.some((c) => c === req));
}

/** Returns true if `node` is available given the current Age. */
export function isResearchAvailableForAge(
  node: ResearchNode,
  currentAge: AgeId,
): boolean {
  const required = getAge(node.age);
  const current = getAge(currentAge);
  if (!required || !current) return true;
  return current.index >= required.index;
}

/**
 * Returns the top-tier settlement upgrade research for the given Age.
 * This is the research required to advance to the next Age.
 * Returns undefined for Ages that have no settlement upgrades (Legends, Myths).
 */
export function topTierUpgradeForAge(age: AgeId): ResearchNode | undefined {
  const upgrades = ALL_RESEARCH.filter(
    (r) => r.category === "SettlementUpgrade" && r.age === age,
  );
  // The last upgrade in the Age is the top-tier one
  return upgrades[upgrades.length - 1];
}

/**
 * Returns true if the player has completed the top-tier upgrade
 * for their current Age, meaning they can advance.
 */
export function canAdvanceAge(
  currentAge: AgeId,
  completed: readonly ResearchId[],
): boolean {
  // For Legends and Myths, any research in that Age qualifies
  const ageResearch = researchForAge(currentAge);
  if (ageResearch.length === 0) return false;

  const upgrades = ageResearch.filter((r) => r.category === "SettlementUpgrade");
  if (upgrades.length === 0) {
    // No upgrades in this Age — need at least one research completed
    return ageResearch.some((r) => completed.some((c) => c === r.id));
  }

  // Need the top-tier upgrade completed
  const topTier = topTierUpgradeForAge(currentAge);
  if (!topTier) return false;
  return completed.some((c) => c === topTier.id);
}