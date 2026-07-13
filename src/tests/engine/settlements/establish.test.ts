import { describe, it, expect } from "vitest";
import { establishSettlement } from "../../../engine/settlements/establish";
import { findStack } from "../../../engine/settlements/stacks";
import type { AgeId } from "../../../engine/ages/types";
import type { SettlementLevel } from "../../../engine/settlements/types";
import type { SettlementStack } from "../../../engine/settlements/types";

const stacks = (entries: [AgeId, SettlementLevel, number][]): SettlementStack[] =>
  entries.map(([age, level, quantity]) => ({ age, level, quantity }));

describe("establishSettlement", () => {
  it("adds a Tent to an empty realm", () => {
    const result = establishSettlement([], "FoundingAge");
    expect(findStack(result.settlements, "FoundingAge", "Tent")?.quantity).toBe(
      1,
    );
  });

  it("increments an existing Tent stack", () => {
    const s = stacks([["FoundingAge", "Tent", 2]]);
    const result = establishSettlement(s, "FoundingAge");
    expect(findStack(result.settlements, "FoundingAge", "Tent")?.quantity).toBe(
      3,
    );
  });

  it("emits a SettlementEstablished event", () => {
    const result = establishSettlement([], "FoundingAge");
    expect(result.events).toEqual([
      { type: "SettlementEstablished", age: "FoundingAge", level: "Tent" },
    ]);
  });

  it("does not mutate the input array", () => {
    const s = stacks([["FoundingAge", "Tent", 2]]);
    establishSettlement(s, "FoundingAge");
    expect(findStack(s, "FoundingAge", "Tent")?.quantity).toBe(2);
  });

  it("creates a Tent for the specified Age", () => {
    const result = establishSettlement([], "AgeOfGrowth");
    expect(findStack(result.settlements, "AgeOfGrowth", "Tent")?.quantity).toBe(
      1,
    );
    expect(findStack(result.settlements, "FoundingAge", "Tent")).toBeUndefined();
  });
});
