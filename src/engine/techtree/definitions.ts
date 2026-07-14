// src/engine/techtree/definitions.ts

import type { AgeId } from "../ages/types";
import { getAge } from "../ages/definitions";
import type { TechNode, TechNodeId } from "./types";

// ── Balance constants ──

/** Cost per Tier 1 tech tree node. */
export const TECH_TIER1_COST = 50;

/** Cost per Tier 2 tech tree node. */
export const TECH_TIER2_COST = 200;

/** Cost per Tier 3 tech tree node. */
export const TECH_TIER3_COST = 500;

// ── Tier 1 tech tree nodes ──

export const TECH_NODES: readonly TechNode[] = [
  {
    id: "agriculture" as TechNodeId,
    name: "Agriculture",
    description: "Your people learn to coax sustenance from the soil, transforming wild roots into reliable harvests. Unlocks Farm buildings.",
    tier: 1,
    cost: TECH_TIER1_COST,
    unlocksBuilding: "Farm",
    buildingEffects: [
      { kind: "PassivePerHour", amount: 3 },
      { kind: "DevelopBonusPer", amount: 1 },
    ],
    buildingDescription: "Farms generate +3 Prosperity per hour and add +1 to develop rewards for each Farm in the realm. Requires at least Huts to build.",
    minimumSourceLevel: "Hut",
    availableFromAge: "FoundingAge" as AgeId,
  },
  {
    id: "trade" as TechNodeId,
    name: "Trade",
    description: "Merchants learn to barter with distant settlements, exchanging surplus for goods the realm lacks. Unlocks Market buildings.",
    tier: 1,
    cost: TECH_TIER1_COST,
    unlocksBuilding: "Market",
    buildingEffects: [
      { kind: "PassivePerHour", amount: 2 },
      { kind: "EstablishBonusPer", amount: 2 },
    ],
    buildingDescription: "Markets generate +2 Prosperity per hour and add +2 to establish rewards for each Market in the realm. Requires at least Cottages to build.",
    minimumSourceLevel: "Cottage",
    availableFromAge: "FoundingAge" as AgeId,
  },
  {
    id: "crafts" as TechNodeId,
    name: "Crafts",
    description: "Skilled hands shape raw materials into tools, cloth, and shelter. The realm becomes more efficient at building. Unlocks Workshop buildings.",
    tier: 1,
    cost: TECH_TIER1_COST,
    unlocksBuilding: "Workshop",
    buildingEffects: [
      { kind: "PassivePerHour", amount: 1 },
      { kind: "EstablishCostReductionPer", amount: 1 },
    ],
    buildingDescription: "Workshops generate +1 Prosperity per hour and reduce establish cost by 1 for each Workshop in the realm (minimum cost 1). Requires at least Houses to build.",
    minimumSourceLevel: "House",
    availableFromAge: "FoundingAge" as AgeId,
  },
  // ── Tier 2 ──
  {
    id: "scholarship" as TechNodeId,
    name: "Scholarship",
    description: "Scholars gather knowledge in great libraries, preserving discoveries for future generations. Unlocks Library buildings.",
    tier: 2,
    cost: TECH_TIER2_COST,
    unlocksBuilding: "Library",
    buildingEffects: [
      { kind: "DiscoveryBonusPer", amount: 25 },
    ],
    buildingDescription: "Libraries add +25 to each discovery reward for each Library in the realm. Requires at least Manors to build.",
    requires: ["agriculture" as TechNodeId, "trade" as TechNodeId, "crafts" as TechNodeId],
    minimumSourceLevel: "Manor",
    availableFromAge: "AgeOfGrowth" as AgeId,
  },
  {
    id: "governance" as TechNodeId,
    name: "Governance",
    description: "Organized administration allows the realm to support larger populations without strain. Unlocks Town Hall buildings.",
    tier: 2,
    cost: TECH_TIER2_COST,
    unlocksBuilding: "TownHall",
    buildingEffects: [
      { kind: "CapacityPerBuilding", amount: 1 },
    ],
    buildingDescription: "Each Town Hall adds +1 to settlement capacity. Requires at least Villages to build.",
    requires: ["agriculture" as TechNodeId, "trade" as TechNodeId, "crafts" as TechNodeId],
    minimumSourceLevel: "Village",
    availableFromAge: "AgeOfGrowth" as AgeId,
  },
  {
    id: "engineering" as TechNodeId,
    name: "Engineering",
    description: "Aqueducts and irrigation systems multiply the realm's productivity, turning arid land into fertile ground. Unlocks Aqueduct buildings.",
    tier: 2,
    cost: TECH_TIER2_COST,
    unlocksBuilding: "Aqueduct",
    buildingEffects: [
      { kind: "PassiveRateMultiplierPer", amount: 0.05 },
    ],
    buildingDescription: "Each Aqueduct increases the base passive income rate by 5%. Requires at least Towns to build.",
    requires: ["agriculture" as TechNodeId, "trade" as TechNodeId, "crafts" as TechNodeId],
    minimumSourceLevel: "Town",
    availableFromAge: "AgeOfGrowth" as AgeId,
  },
  // ── Tier 3 ──
  {
    id: "masonry" as TechNodeId,
    name: "Masonry",
    description: "Master stonemasons raise shrines that endure for centuries, channeling the realm's devotion into tangible blessing. Unlocks Shrine buildings.",
    tier: 3,
    cost: TECH_TIER3_COST,
    unlocksBuilding: "Shrine",
    buildingEffects: [
      { kind: "DiscoveryBonusPer", amount: 50 },
    ],
    buildingDescription: "Each Shrine adds +50 to each discovery reward for each Shrine in the realm. Requires at least Towns to build.",
    requires: ["scholarship" as TechNodeId, "governance" as TechNodeId, "engineering" as TechNodeId],
    minimumSourceLevel: "Town",
    availableFromAge: "AgeOfLords" as AgeId,
  },
  {
    id: "banking" as TechNodeId,
    name: "Banking",
    description: "A network of treasuries and lenders multiplies the realm's productivity, turning stored wealth into new growth. Unlocks Bank buildings.",
    tier: 3,
    cost: TECH_TIER3_COST,
    unlocksBuilding: "Bank",
    buildingEffects: [
      { kind: "PassiveRateMultiplierPer", amount: 0.08 },
    ],
    buildingDescription: "Each Bank increases the base passive income rate by 8%. Requires at least Cities to build.",
    requires: ["scholarship" as TechNodeId, "governance" as TechNodeId, "engineering" as TechNodeId],
    minimumSourceLevel: "City",
    availableFromAge: "AgeOfLords" as AgeId,
  },
  {
    id: "medicine" as TechNodeId,
    name: "Medicine",
    description: "Apothecaries distill remedies that sustain larger populations, easing the burdens of crowding and disease. Unlocks Apothecary buildings.",
    tier: 3,
    cost: TECH_TIER3_COST,
    unlocksBuilding: "Apothecary",
    buildingEffects: [
      { kind: "CapacityPerBuilding", amount: 2 },
    ],
    buildingDescription: "Each Apothecary adds +2 to settlement capacity. Requires at least Manors to build.",
    requires: ["scholarship" as TechNodeId, "governance" as TechNodeId, "engineering" as TechNodeId],
    minimumSourceLevel: "Manor",
    availableFromAge: "AgeOfLords" as AgeId,
  },
];

/** Returns the tech node with the given ID, or undefined. */
export function getTechNode(id: TechNodeId): TechNode | undefined {
  for (const n of TECH_NODES) {
    if (n.id === id) return n;
  }
  return undefined;
}

/** Returns true if the given building type has been unlocked via tech. */
export function isBuildingUnlocked(
  building: string,
  unlockedTechs: readonly TechNodeId[],
): boolean {
  for (const n of TECH_NODES) {
    if (n.unlocksBuilding === building && unlockedTechs.some((u) => u === n.id)) {
      return true;
    }
  }
  return false;
}

/** Returns the tech node that unlocks a given building, or undefined. */
export function getTechForBuilding(building: string): TechNode | undefined {
  for (const n of TECH_NODES) {
    if (n.unlocksBuilding === building) return n;
  }
  return undefined;
}

/**
 * Returns true if the prerequisites for `node` are met.
 * A node with no `requires` field has no prerequisites.
 * A node with a `requires` array needs at least one of the listed techs unlocked
 * (any-of semantics, not all-of).
 */
export function meetsPrerequisites(
  node: TechNode,
  unlockedTechs: readonly TechNodeId[],
): boolean {
  if (!node.requires || node.requires.length === 0) return true;
  return node.requires.some((req) => unlockedTechs.some((u) => u === req));
}

/**
 * Returns true if `node` is available in the given `currentAge`.
 * A tech node is available once the realm has reached the Age
 * specified by `node.availableFromAge` (or any later Age).
 */
export function isTechAvailableForAge(
  node: TechNode,
  currentAge: AgeId,
): boolean {
  const required = getAge(node.availableFromAge);
  const current = getAge(currentAge);
  if (!required || !current) return true;
  return current.index >= required.index;
}