import { describe, it, expect } from "vitest";
import {
  totalSettlements,
  canAccommodate,
} from "../../../engine/settlements/capacity";
import type { AgeId } from "../../../engine/ages/types";
import type { SettlementLevel } from "../../../engine/settlements/types";
import type { SettlementStack } from "../../../engine/settlements/types";

const stacks = (entries: [AgeId, SettlementLevel, number][]): SettlementStack[] =>
  entries.map(([age, level, quantity]) => ({ age, level, quantity }));

describe("totalSettlements", () => {
  it("returns 0 for empty settlements", () => {
    expect(totalSettlements([])).toBe(0);
  });

  it("returns the quantity of a single stack", () => {
    expect(totalSettlements(stacks([["FoundingAge", "Tent", 5]]))).toBe(5);
  });

  it("sums across multiple stacks", () => {
    expect(
      totalSettlements(
        stacks([
          ["FoundingAge", "Tent", 5],
          ["FoundingAge", "Hut", 3],
          ["FoundingAge", "Village", 2],
        ]),
      ),
    ).toBe(10);
  });

  it("counts stacks from different Ages", () => {
    expect(
      totalSettlements(
        stacks([
          ["FoundingAge", "Tent", 4],
          ["AgeOfGrowth", "Hut", 6],
        ]),
      ),
    ).toBe(10);
  });
});

describe("canAccommodate", () => {
  it("returns true when there is room for 1 more", () => {
    expect(canAccommodate(stacks([["FoundingAge", "Tent", 5]]), 20)).toBe(true);
  });

  it("returns false when at capacity", () => {
    expect(canAccommodate(stacks([["FoundingAge", "Tent", 20]]), 20)).toBe(
      false,
    );
  });

  it("returns false when adding would exceed capacity", () => {
    expect(canAccommodate(stacks([["FoundingAge", "Tent", 19]]), 20)).toBe(
      true,
    );
    expect(canAccommodate(stacks([["FoundingAge", "Tent", 20]]), 20)).toBe(
      false,
    );
  });

  it("respects the count parameter", () => {
    const s = stacks([["FoundingAge", "Tent", 18]]);
    expect(canAccommodate(s, 20, 2)).toBe(true);
    expect(canAccommodate(s, 20, 3)).toBe(false);
  });

  it("returns true for empty settlements with nonzero capacity", () => {
    expect(canAccommodate([], 20)).toBe(true);
  });
});
