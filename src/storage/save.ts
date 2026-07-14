// src/storage/save.ts

import type { GameState } from "../engine/state/GameState";
import type { StoryRecord } from "../engine/story/types";

const SAVE_KEY = "everrealm:save";

/**
 * Default values for fields that may be missing in older saves.
 * Used during deserialization to fill in gaps from schema changes.
 */
function migrateSave(raw: Partial<GameState>): GameState {
  return {
    version: raw.version ?? 2,
    realmName: raw.realmName ?? "",
    age: raw.age ?? "FoundingAge",
    settlements: raw.settlements ?? [],
    improvements: raw.improvements ?? [],
    prosperity: raw.prosperity ?? 0,
    capacity: raw.capacity ?? 20,
    unlockedTechs: raw.unlockedTechs ?? [],
    lastUpdate: raw.lastUpdate ?? Date.now(),
    discoveredLevels: raw.discoveredLevels ?? [],
    story: (raw.story ?? []).map((r) => {
      const record = r as StoryRecord;
      if (record.kind === "AgeAdvanced" && !(record as StoryRecord & { newTechsAvailable?: unknown[] }).newTechsAvailable) {
        return { ...record, newTechsAvailable: [], newImprovementsAvailable: [] } as StoryRecord;
      }
      return record;
    }),
    turn: raw.turn ?? 0,
  };
}

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
 * Returns null if no save exists or deserialization fails.
 * Missing fields from older saves are filled with defaults.
 */
export function loadGame(): GameState | null {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    const raw = JSON.parse(data) as Partial<GameState>;
    return migrateSave(raw);
  } catch {
    return null;
  }
}

/**
 * Removes the saved game from localStorage.
 */
export function deleteSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore — storage may be unavailable
  }
}