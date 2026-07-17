// src/tests/engine/prestige/definitions.test.ts

import { describe, it, expect } from "vitest";
import { LEGACIES, getLegacy, MAX_LEGACIES } from "../../../engine/prestige/definitions";

describe("LEGACIES", () => {
  it("has 5 legacies", () => {
    expect(LEGACIES).toHaveLength(5);
  });

  it("includes Eternal Pyramid (not Eternal Spire)", () => {
    const legacy = getLegacy("EternalPyramid");
    expect(legacy?.name).toBe("Eternal Pyramid");
  });

  it("includes Founders' Stela (not Founders' Monument)", () => {
    const legacy = getLegacy("FoundersStela");
    expect(legacy?.name).toBe("Founders' Stela");
  });

  it("includes Jade Palace (not Crystal Palace)", () => {
    const legacy = getLegacy("JadePalace");
    expect(legacy?.name).toBe("Jade Palace");
  });

  it("includes Garden of Eternity", () => {
    const legacy = getLegacy("GardenOfEternity");
    expect(legacy?.name).toBe("Garden of Eternity");
  });

  it("includes Codex of Ages (not Library of Ages)", () => {
    const legacy = getLegacy("CodexOfAges");
    expect(legacy?.name).toBe("Codex of Ages");
  });
});

describe("MAX_LEGACIES", () => {
  it("is 3", () => {
    expect(MAX_LEGACIES).toBe(3);
  });
});