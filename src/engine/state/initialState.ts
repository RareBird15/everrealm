// src/engine/state/initialState.ts

import type { GameState } from "./GameState";
import type { StandardLevel } from "../settlements/types";

/** Current save version — old saves are not compatible with v0.3. */
export const SAVE_VERSION = 3;

/** Starting cacao amount. */
export const STARTING_CACAO = 100;

/** Starting land parcels. */
export const STARTING_LAND_PARCELS = 5;

/**
 * Calculates the effective land parcel count, including bonuses from
 * Council specializations and Trade Mission specializations.
 * - Each Council adds +1 land parcel
 * - Each Trade Mission adds +1 land parcel per Market and Council
 */
export function effectiveLandParcels(state: GameState): number {
  let total = state.landParcels;
  const settlements = state.settlements;

  // Each Council adds +1 land parcel
  const councilHouses = settlements.filter(
    (s) => s.specialization === "Council",
  ).length;
  total += councilHouses;

  // Each Trade Mission adds +1 per Market and Council
  const tradeMissions = settlements.filter(
    (s) => s.specialization === "TradeMission",
  ).length;
  if (tradeMissions > 0) {
    const markets = settlements.filter(
      (s) => s.specialization === "Market",
    ).length;
    total += tradeMissions * (markets + councilHouses);
  }

  return total;
}

/** Base passive cacao rate per hour, before multipliers. Now a bonus, not primary. */
export const BASE_PASSIVE_RATE = 30; // 0.5 per minute — bonus for time away

/** Starting settlement tier. */
export const STARTING_BASE_TIER: StandardLevel = "Tent";

/**
 * Creates the initial game state for a new playthrough.
 *
 * If legacies are carried from a previous playthrough (prestige),
 * their bonuses are applied here:
 * - Founders' Stela: one Founding Age tech already researched
 * - Garden of Eternity: +2 land parcels
 */
export function createInitialState(
  realmName: string,
  completedResearch: string[] = [],
  legacies: string[] = [],
  landParcelsBonus: number = 0,
): GameState {
  let baseTier: StandardLevel = STARTING_BASE_TIER;
  const research = [...completedResearch];

  // Apply Founders' Stela legacy: start with forestry already researched
  if (legacies.includes("FoundersStela")) {
    research.push("forestry");
    baseTier = "Hut"; // Forestry upgrades Tent → Hut
  }

  return {
    version: SAVE_VERSION,
    realmName,
    age: "FoundingAge",
    settlements: [],
    improvements: [],
    cacao: STARTING_CACAO,
    landParcels: STARTING_LAND_PARCELS + landParcelsBonus,
    completedResearch: research as GameState["completedResearch"],
    baseTier,
    story: [],
    turn: 0,
    lastUpdate: Date.now(),
    prestige: {
      legacies: legacies as GameState["prestige"]["legacies"],
      ascensionCount: 0,
    },
  };
}