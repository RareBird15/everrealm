// src/engine/prosperity/earn.ts

import type { Prosperity } from "./types";
import type { GameEvent } from "../events/GameEvent";
import type { ProsperitySource } from "../events/GameEvent";

// ── Balance constants (V1 placeholders, to be tuned during playtesting) ──

/** Awarded each time the player establishes a new settlement. */
export const ESTABLISH_REWARD: Prosperity = 5;

/** Awarded each time the player develops a settlement. */
export const DEVELOP_REWARD: Prosperity = 5;

/** Awarded per chain-reaction step during a cascade. */
export const CHAIN_REACTION_REWARD: Prosperity = 3;

/** Awarded the first time a new settlement level is discovered. */
export const DISCOVERY_REWARD: Prosperity = 25;

/** Awarded when entering a new Age. */
export const AGE_ENTRY_REWARD: Prosperity = 100;

// ── Helpers ──

/**
 * Adds `amount` to `prosperity` and returns the new value plus a
 * `ProsperityEarned` event for the UI to announce.
 */
export function earnProsperity(
  prosperity: Prosperity,
  amount: Prosperity,
  source: ProsperitySource,
): { prosperity: Prosperity; event: GameEvent } {
  return {
    prosperity: prosperity + amount,
    event: { type: "ProsperityEarned", amount, source },
  };
}