import { describe, it, expect } from "vitest";
import {
  computePassive,
  BASE_PASSIVE_RATE_PER_HOUR,
} from "../../../engine/prosperity/passive";

const MS_PER_HOUR = 3_600_000;

describe("computePassive", () => {
  it("returns 0 when no time has elapsed", () => {
    const result = computePassive(1000, 1000);
    expect(result.amount).toBe(0);
    expect(result.newLastUpdate).toBe(1000);
  });

  it("returns 0 when now is before lastUpdate (clock skew)", () => {
    const result = computePassive(2000, 1000);
    expect(result.amount).toBe(0);
    expect(result.newLastUpdate).toBe(2000);
  });

  it("accrues 2 prosperity per minute at the base rate", () => {
    // 120/hour = 2/minute = 2 per 60,000 ms
    const result = computePassive(0, 60_000);
    expect(result.amount).toBe(2);
    expect(result.newLastUpdate).toBe(60_000);
  });

  it("accrues 120 prosperity for 1 hour at the base rate", () => {
    const result = computePassive(0, MS_PER_HOUR);
    expect(result.amount).toBe(120);
    expect(result.newLastUpdate).toBe(MS_PER_HOUR);
  });

  it("floors partial units (15 seconds = 0 at base rate)", () => {
    // 120/hour = 2/minute. 15 seconds = 0.5 units → floors to 0
    const result = computePassive(0, 15_000);
    expect(result.amount).toBe(0);
    expect(result.newLastUpdate).toBe(0); // no time consumed
  });

  it("preserves partial time across calls", () => {
    // 15 seconds → 0 units, but 15 more seconds → 1 unit total
    const first = computePassive(0, 15_000);
    expect(first.amount).toBe(0);
    expect(first.newLastUpdate).toBe(0);

    const second = computePassive(first.newLastUpdate, 30_000);
    expect(second.amount).toBe(1);
    expect(second.newLastUpdate).toBe(30_000);
  });

  it("respects a custom rate", () => {
    // 120/hour = 2/minute
    const result = computePassive(0, 60_000, 120);
    expect(result.amount).toBe(2);
  });

  it("handles zero rate gracefully", () => {
    const result = computePassive(0, MS_PER_HOUR, 0);
    expect(result.amount).toBe(0);
    expect(result.newLastUpdate).toBe(0);
  });

  it("handles large time gaps", () => {
    // 24 hours = 1440 minutes = 2880 prosperity at base rate (2/min)
    const oneDay = 24 * MS_PER_HOUR;
    const result = computePassive(0, oneDay);
    expect(result.amount).toBe(2880);
    expect(result.newLastUpdate).toBe(oneDay);
  });

  it("does not mutate the input lastUpdate", () => {
    const lastUpdate = 5000;
    computePassive(lastUpdate, 65_000);
    expect(lastUpdate).toBe(5000);
  });
});

describe("BASE_PASSIVE_RATE_PER_HOUR", () => {
  it("is set to 120 (2 per minute)", () => {
    expect(BASE_PASSIVE_RATE_PER_HOUR).toBe(120);
  });
});