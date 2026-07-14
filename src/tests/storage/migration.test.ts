import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadGame, deleteSave } from "../../storage/save";
import type { GameState } from "../../engine/state/GameState";

describe("save migration v1 to v2", () => {
  beforeEach(() => {
    deleteSave();
  });

  afterEach(() => {
    deleteSave();
  });

  it("loads a v1 save without crashing", () => {
    const oldSave: Partial<GameState> = {
      version: 1,
      realmName: "TestRealm",
      age: "FoundingAge",
      settlements: [],
      improvements: [],
      prosperity: 100,
      capacity: 20,
      unlockedTechs: [],
      lastUpdate: Date.now(),
      discoveredLevels: [],
      story: [],
      turn: 5,
    };
    localStorage.setItem("everrealm:save", JSON.stringify(oldSave));
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.realmName).toBe("TestRealm");
    expect(loaded?.turn).toBe(5);
    expect(loaded?.prosperity).toBe(100);
  });

  it("loads a save with missing fields using defaults", () => {
    const minimalSave = {
      realmName: "Minimal",
    };
    localStorage.setItem("everrealm:save", JSON.stringify(minimalSave));
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.realmName).toBe("Minimal");
    expect(loaded?.prosperity).toBe(0);
    expect(loaded?.capacity).toBe(20);
    expect(loaded?.turn).toBe(0);
  });

  it("handles old AgeAdvanced story records without new fields", () => {
    // Simulate a v1 save where AgeAdvanced records lack the
    // newTechsAvailable and newImprovementsAvailable fields added in v2.
    const oldSave = {
      version: 1,
      realmName: "OldRealm",
      age: "AgeOfGrowth",
      settlements: [],
      improvements: [],
      prosperity: 50,
      capacity: 20,
      unlockedTechs: [],
      lastUpdate: Date.now(),
      discoveredLevels: [],
      story: [
        { kind: "AgeAdvanced", turn: 10, age: "AgeOfGrowth" },
      ],
      turn: 11,
    };
    localStorage.setItem("everrealm:save", JSON.stringify(oldSave));
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    // The old story record should still be there
    expect(loaded?.story).toHaveLength(1);
    // Migration should have added the new fields
    const record = loaded?.story[0];
    expect(record).toBeDefined();
    if (record && record.kind === "AgeAdvanced") {
      expect(record.newTechsAvailable).toEqual([]);
      expect(record.newImprovementsAvailable).toEqual([]);
    }
  });
});