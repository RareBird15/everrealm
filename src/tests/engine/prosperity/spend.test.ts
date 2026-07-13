import { describe, it, expect } from "vitest";
import {
  canAfford,
  spendProsperity,
} from "../../../engine/prosperity/spend";

describe("canAfford", () => {
  it("returns true when prosperity equals cost", () => {
    expect(canAfford(10, 10)).toBe(true);
  });

  it("returns true when prosperity exceeds cost", () => {
    expect(canAfford(15, 10)).toBe(true);
  });

  it("returns false when prosperity is less than cost", () => {
    expect(canAfford(5, 10)).toBe(false);
  });

  it("returns true when cost is zero", () => {
    expect(canAfford(0, 0)).toBe(true);
  });
});

describe("spendProsperity", () => {
  it("deducts the cost and returns the remaining prosperity", () => {
    const result = spendProsperity(30, 10);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value).toBe(20);
  });

  it("returns InsufficientProsperity when cost exceeds prosperity", () => {
    const result = spendProsperity(5, 10);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toEqual({
      type: "InsufficientProsperity",
      cost: 10,
      available: 5,
    });
  });

  it("succeeds when prosperity exactly equals cost", () => {
    const result = spendProsperity(10, 10);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value).toBe(0);
  });

  it("handles zero-cost spending", () => {
    const result = spendProsperity(5, 0);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value).toBe(5);
  });
});