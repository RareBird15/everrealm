import { describe, it, expect } from "vitest";
import {
  earnProsperity,
  DEVELOP_REWARD,
  CHAIN_REACTION_REWARD,
  DISCOVERY_REWARD,
  AGE_ENTRY_REWARD,
} from "../../../engine/prosperity/earn";

describe("earnProsperity", () => {
  it("adds the amount to prosperity", () => {
    const { prosperity } = earnProsperity(10, 5, "Develop");
    expect(prosperity).toBe(15);
  });

  it("emits a ProsperityEarned event with the correct source", () => {
    const { event } = earnProsperity(0, 3, "Develop");
    expect(event).toEqual({
      type: "ProsperityEarned",
      amount: 3,
      source: "Develop",
    });
  });

  it("works with each prosperity source", () => {
    const sources = [
      "Passive",
      "Develop",
      "ChainReaction",
      "Discovery",
      "AgeEntry",
      "Improvement",
    ] as const;

    for (const source of sources) {
      const { event } = earnProsperity(0, 1, source);
      if (event.type === "ProsperityEarned") {
        expect(event.source).toBe(source);
      }
    }
  });

  it("does not modify the original prosperity value", () => {
    const original = 10;
    earnProsperity(original, 5, "Develop");
    expect(original).toBe(10);
  });
});

describe("balance constants", () => {
  it("has positive reward values", () => {
    expect(DEVELOP_REWARD).toBeGreaterThan(0);
    expect(CHAIN_REACTION_REWARD).toBeGreaterThan(0);
    expect(DISCOVERY_REWARD).toBeGreaterThan(0);
    expect(AGE_ENTRY_REWARD).toBeGreaterThan(0);
  });

  it("makes chain reactions worth less than direct develops", () => {
    // Chain reactions are a bonus, not the main reward.
    // Each step should be worth less than the initial develop.
    expect(CHAIN_REACTION_REWARD).toBeLessThan(DEVELOP_REWARD);
  });

  it("makes discoveries significant", () => {
    // First-time discovery of a settlement level should feel rewarding.
    expect(DISCOVERY_REWARD).toBeGreaterThanOrEqual(DEVELOP_REWARD * 5);
  });

  it("makes Age entry the largest single reward", () => {
    expect(AGE_ENTRY_REWARD).toBeGreaterThan(DISCOVERY_REWARD);
  });
});