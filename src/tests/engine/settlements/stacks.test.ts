import { describe, it, expect } from "vitest";
import {
  findStack,
  addToStack,
  removeFromStack,
} from "../../../engine/settlements/stacks";
import type { AgeId } from "../../../engine/ages/types";
import type { SettlementLevel } from "../../../engine/settlements/types";
import type { SettlementStack } from "../../../engine/settlements/types";

const stacks = (entries: [AgeId, SettlementLevel, number][]): SettlementStack[] =>
  entries.map(([age, level, quantity]) => ({ age, level, quantity }));

describe("findStack", () => {
  it("finds an existing stack", () => {
    const s = stacks([["FoundingAge", "Tent", 3]]);
    const result = findStack(s, "FoundingAge", "Tent");
    expect(result).toEqual({ age: "FoundingAge", level: "Tent", quantity: 3 });
  });

  it("returns undefined when no stack matches", () => {
    const s = stacks([["FoundingAge", "Tent", 3]]);
    expect(findStack(s, "FoundingAge", "Hut")).toBeUndefined();
  });

  it("distinguishes by age", () => {
    const s = stacks([
      ["FoundingAge", "Tent", 3],
      ["AgeOfGrowth", "Tent", 1],
    ]);
    expect(findStack(s, "FoundingAge", "Tent")?.quantity).toBe(3);
    expect(findStack(s, "AgeOfGrowth", "Tent")?.quantity).toBe(1);
  });
});

describe("addToStack", () => {
  it("creates a new stack when none exists", () => {
    const result = addToStack([], "FoundingAge", "Tent", 1);
    expect(result).toEqual([
      { age: "FoundingAge", level: "Tent", quantity: 1 },
    ]);
  });

  it("increments an existing stack", () => {
    const s = stacks([["FoundingAge", "Tent", 3]]);
    const result = addToStack(s, "FoundingAge", "Tent", 2);
    expect(findStack(result, "FoundingAge", "Tent")?.quantity).toBe(5);
  });

  it("does not mutate the input array", () => {
    const s = stacks([["FoundingAge", "Tent", 3]]);
    addToStack(s, "FoundingAge", "Tent", 1);
    expect(findStack(s, "FoundingAge", "Tent")?.quantity).toBe(3);
  });

  it("preserves other stacks", () => {
    const s = stacks([
      ["FoundingAge", "Tent", 3],
      ["FoundingAge", "Hut", 2],
    ]);
    const result = addToStack(s, "FoundingAge", "Tent", 1);
    expect(findStack(result, "FoundingAge", "Hut")?.quantity).toBe(2);
    expect(findStack(result, "FoundingAge", "Tent")?.quantity).toBe(4);
  });
});

describe("removeFromStack", () => {
  it("decrements an existing stack", () => {
    const s = stacks([["FoundingAge", "Tent", 5]]);
    const result = removeFromStack(s, "FoundingAge", "Tent", 2);
    expect(findStack(result, "FoundingAge", "Tent")?.quantity).toBe(3);
  });

  it("removes the stack when quantity reaches zero", () => {
    const s = stacks([["FoundingAge", "Tent", 2]]);
    const result = removeFromStack(s, "FoundingAge", "Tent", 2);
    expect(findStack(result, "FoundingAge", "Tent")).toBeUndefined();
  });

  it("removes the stack when quantity goes below zero", () => {
    const s = stacks([["FoundingAge", "Tent", 1]]);
    const result = removeFromStack(s, "FoundingAge", "Tent", 5);
    expect(findStack(result, "FoundingAge", "Tent")).toBeUndefined();
  });

  it("returns a copy when the stack does not exist", () => {
    const s = stacks([["FoundingAge", "Tent", 1]]);
    const result = removeFromStack(s, "FoundingAge", "Hut", 1);
    expect(result).toEqual(s);
    expect(result).not.toBe(s);
  });

  it("does not mutate the input array", () => {
    const s = stacks([["FoundingAge", "Tent", 5]]);
    removeFromStack(s, "FoundingAge", "Tent", 2);
    expect(findStack(s, "FoundingAge", "Tent")?.quantity).toBe(5);
  });
});
