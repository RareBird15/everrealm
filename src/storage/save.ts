// src/storage/save.ts

import type { GameState } from "../engine/state/GameState";
import { SAVE_VERSION } from "../engine/state/initialState";

const SAVE_KEY = "everrealm:save";

/**
 * Serializes game state to localStorage.
 *
 * Returns false if storage is unavailable or serialization fails.
 */
export function saveGame(state: GameState): boolean {
  try {
    const data = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deserializes game state from localStorage.
 *
 * Returns null if no save exists, deserialization fails, or the save
 * is from an incompatible version (v0.3 uses save version 3; old v0.2.x
 * saves used version 2 and cannot migrate to the new format).
 *
 * v1.1.0: Backward compatibility — saves from v1.0.x won't have
 * expedition fields. We fill in empty defaults.
 */
export function loadGame(): GameState | null {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    const raw = JSON.parse(data) as Partial<GameState>;

    // v0.3 is a clean break — old saves are not compatible
    if (raw.version !== undefined && raw.version < SAVE_VERSION) {
      return null;
    }

    // v1.1.0: Backfill expedition and chronicle fields for older saves.
    // Older saves (v1.0.x) won't have pendingExpeditions, completedExpeditions,
    // expeditionBonuses, or prestige.chronicles. We add empty defaults.
    const state = raw as GameState;

    if (
      "pendingExpeditions" in state &&
      "completedExpeditions" in state &&
      "expeditionBonuses" in state &&
      state.prestige &&
      "chronicles" in state.prestige
    ) {
      // Already has all v1.1.0 fields
      return state;
    }

    // Build a new object with backfilled fields
    return {
      ...state,
      pendingExpeditions: (state as Partial<GameState>).pendingExpeditions ?? [],
      completedExpeditions: (state as Partial<GameState>).completedExpeditions ?? [],
      expeditionBonuses: (state as Partial<GameState>).expeditionBonuses ?? [],
      prestige: state.prestige
        ? {
            ...state.prestige,
            chronicles: (state.prestige as Partial<{ chronicles: readonly string[] }>).chronicles ?? [],
          }
        : state.prestige,
    };
  } catch {
    return null;
  }
}

/** Removes the saved game from localStorage. */
export function deleteSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore — storage may be unavailable
  }
}