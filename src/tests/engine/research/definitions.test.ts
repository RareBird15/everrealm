// src/tests/engine/research/definitions.test.ts

import { describe, it, expect } from "vitest";
import {
  ALL_RESEARCH,
  researchForAge,
  getResearch,
  canAdvanceAge,
} from "../../../engine/research/definitions";
import type { ResearchId } from "../../../engine/research/types";

describe("ALL_RESEARCH", () => {
  it("has 30 researches total", () => {
    expect(ALL_RESEARCH).toHaveLength(30);
  });

  it("has 5 researches in Founding Age", () => {
    expect(researchForAge("FoundingAge")).toHaveLength(5);
  });

  it("has 5 researches in Age of Growth", () => {
    expect(researchForAge("AgeOfGrowth")).toHaveLength(5);
  });

  it("has 5 researches in Age of City-States", () => {
    expect(researchForAge("AgeOfCityStates")).toHaveLength(5);
  });

  it("has 5 researches in Age of Splendor", () => {
    expect(researchForAge("AgeOfSplendor")).toHaveLength(5);
  });

  it("has 5 researches in Age of Legends", () => {
    expect(researchForAge("AgeOfLegends")).toHaveLength(5);
  });

  it("has 5 researches in Age of Myths", () => {
    expect(researchForAge("AgeOfMyths")).toHaveLength(5);
  });
});

describe("Mesoamerican research names", () => {
  it("includes Forestry (not Woodcutting)", () => {
    const node = getResearch("forestry" as ResearchId);
    expect(node?.name).toBe("Forestry");
  });

  it("includes Adobe Making (not Plasterwork)", () => {
    const node = getResearch("adobeMaking" as ResearchId);
    expect(node?.name).toBe("Adobe Making");
  });

  it("includes Stonecutting (not Masonry)", () => {
    const node = getResearch("stonecutting" as ResearchId);
    expect(node?.name).toBe("Stonecutting");
  });

  it("includes Codex Keeping (not Scholarship)", () => {
    const node = getResearch("codexKeeping" as ResearchId);
    expect(node?.name).toBe("Codex Keeping");
  });

  it("includes Calpulli Organization (not Estate Management)", () => {
    const node = getResearch("calpulliOrganization" as ResearchId);
    expect(node?.name).toBe("Calpulli Organization");
  });

  it("includes Cacao Treasury (not Banking)", () => {
    const node = getResearch("cacaoTreasury" as ResearchId);
    expect(node?.name).toBe("Cacao Treasury");
  });
});

describe("canAdvanceAge", () => {
  it("returns false when no research completed", () => {
    expect(canAdvanceAge("FoundingAge", [])).toBe(false);
  });

  it("returns false when only first upgrade completed", () => {
    expect(canAdvanceAge("FoundingAge", ["forestry" as ResearchId])).toBe(false);
  });

  it("returns true when top-tier upgrade completed", () => {
    expect(
      canAdvanceAge("FoundingAge", [
        "forestry" as ResearchId,
        "adobeMaking" as ResearchId,
      ]),
    ).toBe(true);
  });
});