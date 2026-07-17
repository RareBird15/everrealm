// src/tests/engine/ages/definitions.test.ts

import { describe, it, expect } from "vitest";
import {
  AGES,
  getAge,
  getAgeByIndex,
  nextAge,
  isFinalAge,
} from "../../../engine/ages/definitions";

describe("AGES", () => {
  it("has 6 Ages", () => {
    expect(AGES).toHaveLength(6);
  });

  it("starts with Founding Age", () => {
    expect(AGES[0].id).toBe("FoundingAge");
  });

  it("ends with Age of Myths", () => {
    expect(AGES[5].id).toBe("AgeOfMyths");
  });

  it("has Age of City-States at index 2 (replacing Age of Lords)", () => {
    expect(AGES[2].id).toBe("AgeOfCityStates");
    expect(AGES[2].name).toBe("Age of City-States");
  });

  it("has Age of Splendor at index 3 (replacing Golden Age)", () => {
    expect(AGES[3].id).toBe("AgeOfSplendor");
    expect(AGES[3].name).toBe("Age of Splendor");
  });
});

describe("getAge", () => {
  it("returns the Age for a valid id", () => {
    const age = getAge("FoundingAge");
    expect(age?.name).toBe("Founding Age");
  });

  it("returns undefined for an invalid id", () => {
    expect(getAge("Nonexistent" as never)).toBeUndefined();
  });
});

describe("nextAge", () => {
  it("returns Age of Growth after Founding Age", () => {
    expect(nextAge("FoundingAge")?.id).toBe("AgeOfGrowth");
  });

  it("returns null for Age of Myths", () => {
    expect(nextAge("AgeOfMyths")).toBeNull();
  });
});

describe("isFinalAge", () => {
  it("returns true for Age of Myths", () => {
    expect(isFinalAge("AgeOfMyths")).toBe(true);
  });

  it("returns false for Founding Age", () => {
    expect(isFinalAge("FoundingAge")).toBe(false);
  });
});