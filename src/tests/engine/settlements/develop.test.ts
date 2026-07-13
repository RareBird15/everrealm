import { describe, it, expect } from "vitest";
import { developSettlement } from "../../../engine/settlements/develop";
import { findStack } from "../../../engine/settlements/stacks";
import type { AgeId } from "../../../engine/ages/types";
import type { SettlementLevel } from "../../../engine/settlements/types";
import type { SettlementStack } from "../../../engine/settlements/types";

const stacks = (entries: [AgeId, SettlementLevel, number][]): SettlementStack[] =>
  entries.map(([age, level, quantity]) => ({ age, level, quantity }));

describe("developSettlement — basic development", () => {
  it("consumes 2 Tents and creates 1 Hut", () => {
    const s = stacks([["FoundingAge", "Tent", 2]]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    const settlements = result.value.settlements;
    expect(findStack(settlements, "FoundingAge", "Tent")).toBeUndefined();
    expect(findStack(settlements, "FoundingAge", "Hut")?.quantity).toBe(1);
  });

  it("emits a SettlementDeveloped event with source Player", () => {
    const s = stacks([["FoundingAge", "Tent", 2]]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.events[0]).toEqual({
      type: "SettlementDeveloped",
      age: "FoundingAge",
      level: "Tent",
      newLevel: "Hut",
      source: "Player",
    });
  });

  it("does not emit chain reaction events when no match exists", () => {
    const s = stacks([["FoundingAge", "Tent", 2]]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.events).toHaveLength(1);
    expect(
      result.value.events.some((e) => e.type === "ChainReactionStarted"),
    ).toBe(false);
  });

  it("preserves unrelated stacks", () => {
    // 2 Tents + 1 Cottage: developing Tents → Hut, no chain (no existing Hut)
    const s = stacks([
      ["FoundingAge", "Tent", 2],
      ["FoundingAge", "Cottage", 1],
    ]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      findStack(result.value.settlements, "FoundingAge", "Cottage")?.quantity,
    ).toBe(1);
    expect(
      findStack(result.value.settlements, "FoundingAge", "Hut")?.quantity,
    ).toBe(1);
  });

  it("does not mutate the input array", () => {
    const s = stacks([["FoundingAge", "Tent", 2]]);
    developSettlement(s, "FoundingAge", "Tent");
    expect(findStack(s, "FoundingAge", "Tent")?.quantity).toBe(2);
  });
});

describe("developSettlement — chain reactions", () => {
  it("cascades when the new settlement matches an existing one", () => {
    // 2 Tents + 1 Hut: develop Tents → 1 Hut, chains with existing Hut → Cottage
    const s = stacks([
      ["FoundingAge", "Tent", 2],
      ["FoundingAge", "Hut", 1],
    ]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    const settlements = result.value.settlements;
    expect(findStack(settlements, "FoundingAge", "Tent")).toBeUndefined();
    expect(findStack(settlements, "FoundingAge", "Hut")).toBeUndefined();
    expect(findStack(settlements, "FoundingAge", "Cottage")?.quantity).toBe(1);
  });

  it("emits events in the correct order for a single chain step", () => {
    const s = stacks([
      ["FoundingAge", "Tent", 2],
      ["FoundingAge", "Hut", 1],
    ]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    const types = result.value.events.map((e) => e.type);
    expect(types).toEqual([
      "SettlementDeveloped", // Player: Tent → Hut
      "ChainReactionStarted",
      "SettlementDeveloped", // ChainReaction: Hut → Cottage
      "ChainReactionCompleted",
    ]);
  });

  it("reports chainLength as 1 for a single cascade", () => {
    const s = stacks([
      ["FoundingAge", "Tent", 2],
      ["FoundingAge", "Hut", 1],
    ]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    const completed = result.value.events.find(
      (e) => e.type === "ChainReactionCompleted",
    );
    expect(completed).toEqual({ type: "ChainReactionCompleted", chainLength: 1 });
  });

  it("cascades through multiple levels", () => {
    // 2 Tents + 1 Hut + 1 Cottage: Tent → Hut, Hut → Cottage, Cottage → House
    const s = stacks([
      ["FoundingAge", "Tent", 2],
      ["FoundingAge", "Hut", 1],
      ["FoundingAge", "Cottage", 1],
    ]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    const settlements = result.value.settlements;
    expect(findStack(settlements, "FoundingAge", "House")?.quantity).toBe(1);
    expect(findStack(settlements, "FoundingAge", "Cottage")).toBeUndefined();
    expect(findStack(settlements, "FoundingAge", "Hut")).toBeUndefined();
    expect(findStack(settlements, "FoundingAge", "Tent")).toBeUndefined();
  });

  it("reports chainLength as 2 for a double cascade", () => {
    const s = stacks([
      ["FoundingAge", "Tent", 2],
      ["FoundingAge", "Hut", 1],
      ["FoundingAge", "Cottage", 1],
    ]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    const completed = result.value.events.find(
      (e) => e.type === "ChainReactionCompleted",
    );
    expect(completed).toEqual({ type: "ChainReactionCompleted", chainLength: 2 });
  });

  it("stops the chain when no match exists", () => {
    // 2 Tents + 1 Hut: Tent → Hut, Hut has no match → stop
    // This is the same as the first chain test, but verify chainLength
    const s = stacks([
      ["FoundingAge", "Tent", 2],
      ["FoundingAge", "Hut", 1],
    ]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    const completed = result.value.events.find(
      (e) => e.type === "ChainReactionCompleted",
    );
    expect(completed).toEqual({ type: "ChainReactionCompleted", chainLength: 1 });
  });

  it("does not chain with settlements from a different Age", () => {
    // 2 FoundingAge Tents + 1 AgeOfGrowth Hut: Tent → Hut, but no match
    const s = stacks([
      ["FoundingAge", "Tent", 2],
      ["AgeOfGrowth", "Hut", 1],
    ]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(true);
    if (!result.success) return;
    const settlements = result.value.settlements;
    expect(
      findStack(settlements, "FoundingAge", "Hut")?.quantity,
    ).toBe(1);
    expect(
      findStack(settlements, "AgeOfGrowth", "Hut")?.quantity,
    ).toBe(1);
    expect(
      result.value.events.some((e) => e.type === "ChainReactionStarted"),
    ).toBe(false);
  });
});

describe("developSettlement — errors", () => {
  it("returns NoEligibleSettlements when no stack exists", () => {
    const result = developSettlement([], "FoundingAge", "Tent");
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toEqual({
      type: "NoEligibleSettlements",
      age: "FoundingAge",
      level: "Tent",
    });
  });

  it("returns NoEligibleSettlements when quantity < 2", () => {
    const s = stacks([["FoundingAge", "Tent", 1]]);
    const result = developSettlement(s, "FoundingAge", "Tent");
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).toBe("NoEligibleSettlements");
  });

  it("returns InvalidAgeOrLevel when developing Citadel", () => {
    const s = stacks([["FoundingAge", "Citadel", 2]]);
    const result = developSettlement(s, "FoundingAge", "Citadel");
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toEqual({
      type: "InvalidAgeOrLevel",
      age: "FoundingAge",
      level: "Citadel",
    });
  });
});
