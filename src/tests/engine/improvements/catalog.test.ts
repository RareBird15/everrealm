// src/tests/engine/improvements/catalog.test.ts

import { describe, it, expect } from "vitest";
import { IMPROVEMENTS, isImprovementAvailableForAge } from "../../../engine/improvements/catalog";
import type { ImprovementId } from "../../../engine/improvements/types";

function findImprovement(id: string) {
  return IMPROVEMENTS.find((i) => i.id === (id as never as ImprovementId));
}

describe("isImprovementAvailableForAge", () => {
  it("stone_roads (Tier 1) is available in FoundingAge", () => {
    const stone_roads = findImprovement("stone_roads");
    expect(stone_roads).toBeDefined();
    expect(isImprovementAvailableForAge(stone_roads!, "FoundingAge")).toBe(true);
  });

  it("grand_library (Tier 2) is NOT available in FoundingAge", () => {
    const grand_library = findImprovement("grand_library");
    expect(grand_library).toBeDefined();
    expect(isImprovementAvailableForAge(grand_library!, "FoundingAge")).toBe(false);
  });

  it("grand_library (Tier 2) is available in AgeOfGrowth", () => {
    const grand_library = findImprovement("grand_library");
    expect(grand_library).toBeDefined();
    expect(isImprovementAvailableForAge(grand_library!, "AgeOfGrowth")).toBe(true);
  });

  // ── Tier 3 (Age of Lords) ──
  it("great_walls is NOT available in FoundingAge", () => {
    const great_walls = findImprovement("great_walls");
    expect(great_walls).toBeDefined();
    expect(isImprovementAvailableForAge(great_walls!, "FoundingAge")).toBe(false);
  });

  it("great_walls is NOT available in AgeOfGrowth", () => {
    const great_walls = findImprovement("great_walls");
    expect(great_walls).toBeDefined();
    expect(isImprovementAvailableForAge(great_walls!, "AgeOfGrowth")).toBe(false);
  });

  it("great_walls IS available in AgeOfLords", () => {
    const great_walls = findImprovement("great_walls");
    expect(great_walls).toBeDefined();
    expect(isImprovementAvailableForAge(great_walls!, "AgeOfLords")).toBe(true);
  });

  it("cathedral is available in AgeOfLords", () => {
    const cathedral = findImprovement("cathedral");
    expect(cathedral).toBeDefined();
    expect(isImprovementAvailableForAge(cathedral!, "AgeOfLords")).toBe(true);
  });

  it("trading_company is available in AgeOfLords", () => {
    const trading_company = findImprovement("trading_company");
    expect(trading_company).toBeDefined();
    expect(isImprovementAvailableForAge(trading_company!, "AgeOfLords")).toBe(true);
  });
});