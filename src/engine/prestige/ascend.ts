// src/engine/prestige/ascend.ts

import type { GameState } from "../state/GameState";
import type { LegacyId } from "./types";
import { getLegacy, MAX_LEGACIES } from "./definitions";
import { createInitialState } from "../state/initialState";
import type { GameEvent } from "../events/GameEvent";

/** Number of legendary buildings needed to ascend. */
export const ASCENSION_THRESHOLD = 3;

/**
 * Returns true if the player can ascend.
 * Requires:
 * - Ascension research completed
 * - Enough legendary buildings (Temples, Oracle's Sanctums, Gardens)
 */
export function canAscend(state: GameState): boolean {
  // Must have researched Ascension
  const hasAscension = state.completedResearch.some((r) => r === "ascension");
  if (!hasAscension) return false;

  // Must have a Capital (specialized or not — a specialized Capital is still a Capital)
  const hasCapital = state.settlements.some((s) => s.tier === "Capital");
  if (!hasCapital) return false;

  // Must have enough legendary buildings (Pyramids, Sanctums, Stelae)
  const legendaryCount =
    state.settlements.filter((s) => s.specialization === "Pyramid").length +
    state.settlements.filter((s) => s.specialization === "Sanctum").length +
    state.settlements.filter((s) => s.specialization === "Stela").length;

  return legendaryCount >= ASCENSION_THRESHOLD;
}

/**
 * Ascends: transforms the Capital into a permanent legacy and
 * begins a new playthrough with the chosen legacy bonus.
 */
export function ascend(state: GameState, legacy: LegacyId): {
  state: GameState;
  events: GameEvent[];
} {
  if (!canAscend(state)) {
    if (!state.completedResearch.some((r) => r === "ascension"))
      throw new Error("You must research Ascension before ascending.");
    if (!state.settlements.some((s) => s.tier === "Capital"))
      throw new Error("You need a Capital to ascend.");
    throw new Error(
      `You need ${ASCENSION_THRESHOLD} legendary buildings (Pyramids, Sanctums, or Stelae) to ascend.`,
    );
  }

  const legacyDef = getLegacy(legacy);
  if (!legacyDef) throw new Error(`Unknown legacy: ${legacy}`);

  // Determine the new legacies list
  const currentLegacies = [...state.prestige.legacies] as LegacyId[];
  let newLegacies: LegacyId[];

  if (currentLegacies.length < MAX_LEGACIES) {
    // Room to add without replacing
    newLegacies = [...currentLegacies, legacy];
  } else {
    // At max — replace the last one (player chose to swap)
    // In the UI, the player will choose which to replace
    // For now, replace the last one
    newLegacies = [...currentLegacies.slice(0, -1), legacy];
  }

  const ascensionCount = state.prestige.ascensionCount + 1;

  // Create new game state with legacy bonuses applied
  const landBonus = newLegacies.includes("GardenOfEternity") ? 2 : 0;
  const startingResearch = newLegacies.includes("FoundersStela")
    ? ["forestry"]
    : [];

  const newState = {
    ...createInitialState(
      state.realmName,
      startingResearch,
      newLegacies,
      landBonus,
    ),
    prestige: {
      legacies: newLegacies,
      ascensionCount,
    } as GameState["prestige"],
  };

  return {
    state: newState,
    events: [
      {
        type: "Ascended",
        turn: state.turn + 1,
        legacy,
        ascensionCount,
      },
    ],
  };
}