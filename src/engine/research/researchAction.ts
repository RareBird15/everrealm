// src/engine/research/researchAction.ts

import type { GameState } from "../state/GameState";
import type { ResearchId, ResearchNode } from "./types";
import { getResearch, meetsPrerequisites, isResearchAvailableForAge } from "./definitions";
import { topTierUpgradeForAge } from "./definitions";
import type { GameEvent } from "../events/GameEvent";

/** Discovery reward for completing a research. */
export const DISCOVERY_REWARD = 25;

/** Cacao reward for advancing to a new Age. */
export const AGE_ADVANCE_REWARD = 100;

/**
 * Returns the actual cost of a research, accounting for settlement count
 * scaling, Alchemist's Lab reductions, and legacy bonuses.
 *
 * Research costs scale with the number of settlements because settlement
 * upgrades affect ALL settlements simultaneously. Researching Forestry
 * for 3 Tents is cheap; researching it for 300 settlements is not.
 *
 * Scaling formula: baseCost * (1 + max(0, settlementCount - 10) * SCALE_FACTOR)
 * At 1-10 settlements: base cost (early game unchanged)
 * At 20 settlements: 1.3x base cost
 * At 50 settlements: 2.2x base cost
 * At 100 settlements: 3.7x base cost
 * At 1000 settlements: 30.8x base cost
 * At 3000 settlements: 90.8x base cost
 *
 * This prevents the late-game economy from trivializing research costs.
 */
const RESEARCH_SETTLEMENT_SCALE = 0.03;

export function researchCost(state: GameState, node: ResearchNode): number {
  let cost = node.cost;

  // Scale with settlement count — upgrading more settlements costs more.
  // First 10 settlements are free of scaling to preserve early-game balance.
  const settlementCount = state.settlements.length;
  cost = Math.floor(cost * (1 + Math.max(0, settlementCount - 10) * RESEARCH_SETTLEMENT_SCALE));

  // Each Alchemist's Lab reduces all research costs by 5%
  const labs = state.settlements.filter(
    (s) => s.specialization === "AlchemistsLab",
  ).length;
  cost = Math.floor(cost * (1 - labs * 0.05));

  // v1.1.0: Expedition research discount bonuses
  let totalResearchDiscount = 0;
  for (const bonus of state.expeditionBonuses) {
    if (bonus.type === "research_discount") {
      totalResearchDiscount += bonus.magnitude;
    }
  }
  if (totalResearchDiscount > 0) {
    cost = Math.floor(cost * (1 - Math.min(totalResearchDiscount, 0.75)));
  }

  return Math.max(1, cost);
}

/** Returns true if the player can research the given node. */
export function canResearch(state: GameState, researchId: ResearchId): boolean {
  const node = getResearch(researchId);
  if (!node) return false;

  // Already researched?
  if (state.completedResearch.some((r) => r === researchId)) return false;

  // Available for current Age?
  if (!isResearchAvailableForAge(node, state.age)) return false;

  // Prerequisites met?
  if (!meetsPrerequisites(node, state.completedResearch)) return false;

  // Must have at least one settlement to research
  if (state.settlements.length === 0) return false;

  // Can afford it?
  if (state.cacao < researchCost(state, node)) return false;

  return true;
}

/**
 * Completes a research. If it's a settlement upgrade, ALL settlements
 * upgrade to the next tier simultaneously. If it's a specialization,
 * it unlocks a new building type for specialization.
 */
export function doResearch(state: GameState, researchId: ResearchId): {
  state: GameState;
  events: GameEvent[];
} {
  if (!canResearch(state, researchId)) {
    const node = getResearch(researchId);
    if (!node) throw new Error(`Unknown research: ${researchId}`);
    if (state.completedResearch.some((r) => r === researchId))
      throw new Error(`${node.name} is already researched.`);
    if (!isResearchAvailableForAge(node, state.age))
      throw new Error(`${node.name} is not available in the current Age.`);
    if (!meetsPrerequisites(node, state.completedResearch))
      throw new Error(`${node.name} requires prerequisites not yet completed.`);
    throw new Error(
      `Not enough cacao for ${node.name}. Need ${researchCost(state, node)}, have ${state.cacao}.`,
    );
  }

  const node = getResearch(researchId)!;
  const cost = researchCost(state, node);
  const events: GameEvent[] = [];

  let newSettlements = state.settlements;
  let newBaseTier = state.baseTier;

  if (node.category === "SettlementUpgrade" && node.fromTier && node.toTier) {
    // Upgrade ALL settlements at the from-tier to the to-tier
    newSettlements = state.settlements.map((s) =>
      s.tier === node.fromTier && s.specialization === null
        ? { ...s, tier: node.toTier! }
        : s,
    );
    newBaseTier = node.toTier;
    events.push({
      type: "SettlementsUpgraded",
      turn: state.turn + 1,
      fromTier: node.fromTier,
      toTier: node.toTier,
      researchName: node.name,
    });
  } else if (node.category === "Specialization") {
    // Only emit SpecializationUnlocked if the research actually unlocks a building
    if (node.unlocksBuilding) {
      events.push({
        type: "SpecializationUnlocked",
        turn: state.turn + 1,
        building: node.unlocksBuilding,
        researchName: node.name,
      });
    }
  }

  // Check if this research completes the top-tier upgrade for the current Age
  const topTier = topTierUpgradeForAge(state.age);
  const canAdvance = topTier && researchId === topTier.id;

  events.push({
    type: "ResearchCompleted",
    turn: state.turn + 1,
    researchName: node.name,
    cost,
    discoveryReward: DISCOVERY_REWARD,
    canAdvanceAge: canAdvance ?? false,
  });

  return {
    state: {
      ...state,
      settlements: newSettlements,
      cacao: state.cacao - cost + DISCOVERY_REWARD,
      completedResearch: [...state.completedResearch, researchId],
      baseTier: newBaseTier,
      turn: state.turn + 1,
    },
    events,
  };
}