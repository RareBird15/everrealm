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
});