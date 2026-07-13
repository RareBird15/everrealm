import { describe, it, expect } from "vitest";
import {
  SETTLEMENT_LEVELS,
  levelIndex,
  nextLevel,
  isMaxLevel,
} from "../../../engine/settlements/progression";

describe("SETTLEMENT_LEVELS", () => {
  it("has 10 levels in the correct order", () => {
    expect(SETTLEMENT_LEVELS).toEqual([
      "Tent",
      "Hut",
      "Cottage",
      "House",
      "Manor",
      "Hamlet",
      "Village",
      "Town",
      "City",
      "Citadel",
    ]);
  });
});

describe("levelIndex", () => {
  it("returns 0 for Tent", () => {
    expect(levelIndex("Tent")).toBe(0);
  });

  it("returns 9 for Citadel", () => {
    expect(levelIndex("Citadel")).toBe(9);
  });

  it("returns 4 for Manor", () => {
    expect(levelIndex("Manor")).toBe(4);
  });
});

describe("nextLevel", () => {
  it("returns Hut for Tent", () => {
    expect(nextLevel("Tent")).toBe("Hut");
  });

  it("returns Cottage for Hut", () => {
    expect(nextLevel("Hut")).toBe("Cottage");
  });

  it("returns null for Citadel (max level)", () => {
    expect(nextLevel("Citadel")).toBeNull();
  });

  it("returns Town for Village", () => {
    expect(nextLevel("Village")).toBe("Town");
  });
});

describe("isMaxLevel", () => {
  it("returns true for Citadel", () => {
    expect(isMaxLevel("Citadel")).toBe(true);
  });

  it("returns false for Tent", () => {
    expect(isMaxLevel("Tent")).toBe(false);
  });

  it("returns false for City", () => {
    expect(isMaxLevel("City")).toBe(false);
  });
});
