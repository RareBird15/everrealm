// src/tests/engine/settlements/progression.test.ts

import { describe, it, expect } from "vitest";
import {
  SETTLEMENT_LEVELS,
  levelIndex,
  nextLevel,
  isMaxLevel,
  isSpecialBuilding,
  isStandardLevel,
} from "../../../engine/settlements/progression";

describe("SETTLEMENT_LEVELS", () => {
  it("has 9 levels", () => {
    expect(SETTLEMENT_LEVELS).toHaveLength(9);
  });

  it("starts with Tent", () => {
    expect(SETTLEMENT_LEVELS[0]).toBe("Tent");
  });

  it("ends with Capital", () => {
    expect(SETTLEMENT_LEVELS[8]).toBe("Capital");
  });

  it("includes Homestead at index 4", () => {
    expect(SETTLEMENT_LEVELS[4]).toBe("Homestead");
  });
});

describe("levelIndex", () => {
  it("returns 0 for Tent", () => {
    expect(levelIndex("Tent")).toBe(0);
  });

  it("returns 8 for Capital", () => {
    expect(levelIndex("Capital")).toBe(8);
  });

  it("returns 4 for Homestead", () => {
    expect(levelIndex("Homestead")).toBe(4);
  });
});

describe("nextLevel", () => {
  it("returns Hut for Tent", () => {
    expect(nextLevel("Tent")).toBe("Hut");
  });

  it("returns Capital for City", () => {
    expect(nextLevel("City")).toBe("Capital");
  });

  it("returns null for Capital", () => {
    expect(nextLevel("Capital")).toBeNull();
  });
});

describe("isMaxLevel", () => {
  it("returns true for Capital", () => {
    expect(isMaxLevel("Capital")).toBe(true);
  });

  it("returns false for Tent", () => {
    expect(isMaxLevel("Tent")).toBe(false);
  });
});