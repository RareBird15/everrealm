// src/engine/state/initialState.ts

import type { GameState } from "./GameState";
import type { AgeId } from "../ages/types";

/**
 * Starting Settlement Capacity per spec.
 * All other balance values are TBD and set to 0 until defined.
 */
export const STARTING_CAPACITY = 20;

/**
 * Starting Prosperity.
 *
 * Enough to establish ~3 settlements at V1 costs, giving the player
 * a productive first session without front-loading too much.
 */
export const STARTING_PROSPERITY = 30;

/**
 * Creates a new game state with default starting values.
 *
 * Balance values marked TBD in the spec default to 0.
 * These will be replaced with real values after playtesting.
 *
 * @param realmName - The player's chosen realm name.
 * @param now - Unix timestamp (ms) for the initial `lastUpdate`.
 */
export function initialState(realmName: string, now: number): GameState {
  return {
    version: 2,
    realmName,
    age: "FoundingAge" as AgeId,
    settlements: [],
    improvements: [],
    prosperity: STARTING_PROSPERITY,
    capacity: STARTING_CAPACITY,
    unlockedTechs: [],
    lastUpdate: now,
    discoveredLevels: [],
    story: [],
    turn: 0,
  };
}