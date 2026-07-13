// src/engine/prosperity/passive.ts

import type { Prosperity } from "./types";

// ── Balance constants (V1 placeholders, to be tuned during playtesting) ──

/**
 * Base passive prosperity per real-time hour.
 *
 * At 120/hour the player earns 2 Prosperity per minute of elapsed time.
 * This is the baseline before any Improvement bonuses.
 */
export const BASE_PASSIVE_RATE_PER_HOUR: Prosperity = 120;

/** Milliseconds per hour. */
const MS_PER_HOUR = 3_600_000;

export interface PassiveResult {
  /** Whole units of Prosperity accrued. */
  readonly amount: Prosperity;
  /** Updated timestamp — advances by exactly the consumed time. */
  readonly newLastUpdate: number;
}

/**
 * Computes passive Prosperity accrued between `lastUpdate` and `now`.
 *
 * The calculation floors to whole units. `newLastUpdate` advances by only
 * the time actually consumed, so partial-unit time is preserved across calls
 * (30 seconds + 30 seconds = 1 full minute's worth, not two zeros).
 *
 * @param lastUpdate - Previous timestamp (ms).
 * @param now - Current timestamp (ms).
 * @param ratePerHour - Prosperity per hour (defaults to base rate).
 */
export function computePassive(
  lastUpdate: number,
  now: number,
  ratePerHour: Prosperity = BASE_PASSIVE_RATE_PER_HOUR,
): PassiveResult {
  const elapsedMs = Math.max(0, now - lastUpdate);
  if (elapsedMs === 0 || ratePerHour <= 0) {
    return { amount: 0, newLastUpdate: lastUpdate };
  }

  const accrued = Math.floor((elapsedMs * ratePerHour) / MS_PER_HOUR);
  if (accrued === 0) {
    return { amount: 0, newLastUpdate: lastUpdate };
  }

  // Advance lastUpdate by exactly the time consumed by `accrued` units.
  const consumedMs = Math.floor((accrued * MS_PER_HOUR) / ratePerHour);
  return {
    amount: accrued,
    newLastUpdate: lastUpdate + consumedMs,
  };
}