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
 * Returns the actual cost of a research, accounting for Alchemist's Lab
 * reductions and legacy bonuses.
 */
export function researchCost(state: GameState, node: ResearchNode): number {
  let cost = node.cost;

  // Each Alchemist's Lab reduces all research costs by 5%
  const labs = state.settlements.filter(
    (s) => s.specialization === "AlchemistsLab",
  ).length;
  cost = Math.floor(cost * (1 - labs * 0.05));

  // Jade Palace legacy: specializations are 25% stronger
  // This doesn't reduce research cost but makes specialization bonuses stronger
  // (applied at the specialization effect calculation, not here)

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