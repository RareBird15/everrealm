// src/tests/resources-calculate.test.ts

import { describe, it, expect } from "vitest";
import { calculateResources, formatResourceReport } from "../engine/resources/calculate";
import type { GameState } from "../engine/state/GameState";
import type { Settlement } from "../engine/settlements/types";

function makeSettlement(
  id: string,
  tier: Settlement["tier"] = "Cottage",
  specialization: Settlement["specialization"] = null,
): Settlement {
  return { id, tier, specialization };
}

function makeState(
  age: GameState["age"] = "FoundingAge",
  settlements: Settlement[] = [],
  overrides: Partial<GameState> = {},
): GameState {
  return {
    version: 3,
    realmName: "Test Realm",
    age,
    settlements,
    improvements: [],
    cacao: 100,
    landParcels: 10,
    completedResearch: [],
    baseTier: "Cottage",
    story: [],
    turn: 0,
    lastUpdate: Date.now(),
    prestige: { legacies: [], chronicles: [] },
    pendingExpeditions: [],
    completedExpeditions: [],
    expeditionBonuses: [],
    ...overrides,
  } as GameState;
}

describe("calculateResources", () => {
  it("returns all resources as inactive in Founding Age with no specializations", () => {
    const state = makeState("FoundingAge", []);
    const report = calculateResources(state);
    expect(report.balances).toHaveLength(3);
    // Trade Goods is unlocked at age 0 but has no production
    expect(report.balances[0]!.active).toBe(true);
    expect(report.balances[0]!.produced).toBe(0);
    expect(report.balances[0]!.consumed).toBe(0);
  });

  it("calculates Trade Goods production from Markets", () => {
    const state = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Market"),
      makeSettlement("s2", "Cottage", "Market"),
    ]);
    const report = calculateResources(state);
    const tradeGoods = report.balances.find((b) => b.resource === "TradeGoods");
    expect(tradeGoods).toBeDefined();
    expect(tradeGoods!.produced).toBe(2);
    expect(tradeGoods!.consumed).toBe(0);
    expect(tradeGoods!.net).toBe(2);
    expect(report.idleConsumers.TradeGoods).toBe(0);
  });

  it("calculates Trade Goods consumption by CraftDistricts", () => {
    const state = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Market"),
      makeSettlement("s2", "Cottage", "CraftDistrict"),
    ]);
    const report = calculateResources(state);
    const tradeGoods = report.balances.find((b) => b.resource === "TradeGoods");
    expect(tradeGoods).toBeDefined();
    expect(tradeGoods!.produced).toBe(1);
    expect(tradeGoods!.consumed).toBe(1);
    expect(tradeGoods!.net).toBe(0);
    expect(report.idleConsumers.TradeGoods).toBe(0);
  });

  it("reports idle consumers when consumption exceeds production", () => {
    const state = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Market"),
      makeSettlement("s2", "Cottage", "CraftDistrict"),
      makeSettlement("s3", "Cottage", "CraftDistrict"),
      makeSettlement("s4", "Cottage", "CraftDistrict"),
    ]);
    const report = calculateResources(state);
    const tradeGoods = report.balances.find((b) => b.resource === "TradeGoods");
    expect(tradeGoods).toBeDefined();
    expect(tradeGoods!.produced).toBe(1);
    expect(tradeGoods!.consumed).toBe(3);
    expect(tradeGoods!.net).toBe(-2);
    expect(report.idleConsumers.TradeGoods).toBe(2);
  });

  it("does not calculate Knowledge before Age of Growth", () => {
    const state = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Codex"),
      makeSettlement("s2", "Cottage", "Temple"),
    ]);
    const report = calculateResources(state);
    const knowledge = report.balances.find((b) => b.resource === "Knowledge");
    expect(knowledge).toBeDefined();
    expect(knowledge!.active).toBe(false);
    expect(knowledge!.produced).toBe(0);
    expect(knowledge!.consumed).toBe(0);
  });

  it("calculates Knowledge flow from Age of Growth", () => {
    const state = makeState("AgeOfGrowth", [
      makeSettlement("s1", "Cottage", "Codex"),
      makeSettlement("s2", "Cottage", "Codex"),
      makeSettlement("s3", "Cottage", "Temple"),
    ]);
    const report = calculateResources(state);
    const knowledge = report.balances.find((b) => b.resource === "Knowledge");
    expect(knowledge).toBeDefined();
    expect(knowledge!.active).toBe(true);
    expect(knowledge!.produced).toBe(2);
    expect(knowledge!.consumed).toBe(1);
    expect(knowledge!.net).toBe(1);
  });

  it("does not calculate Materials before Age of City-States", () => {
    const state = makeState("AgeOfGrowth", [
      makeSettlement("s1", "Cottage", "Estate"),
      makeSettlement("s2", "Cottage", "Aqueduct"),
    ]);
    const report = calculateResources(state);
    const materials = report.balances.find((b) => b.resource === "Materials");
    expect(materials).toBeDefined();
    expect(materials!.active).toBe(false);
  });

  it("calculates Materials flow from Age of City-States", () => {
    const state = makeState("AgeOfCityStates", [
      makeSettlement("s1", "Cottage", "Estate"),
      makeSettlement("s2", "Cottage", "Estate"),
      makeSettlement("s3", "Cottage", "Aqueduct"),
    ]);
    const report = calculateResources(state);
    const materials = report.balances.find((b) => b.resource === "Materials");
    expect(materials).toBeDefined();
    expect(materials!.active).toBe(true);
    expect(materials!.produced).toBe(2);
    expect(materials!.consumed).toBe(1);
    expect(materials!.net).toBe(1);
  });

  it("handles all three resources active in Age of City-States", () => {
    const state = makeState("AgeOfCityStates", [
      makeSettlement("s1", "Cottage", "Market"),
      makeSettlement("s2", "Cottage", "CraftDistrict"),
      makeSettlement("s3", "Cottage", "Codex"),
      makeSettlement("s4", "Cottage", "Temple"),
      makeSettlement("s5", "Cottage", "Estate"),
      makeSettlement("s6", "Cottage", "Aqueduct"),
    ]);
    const report = calculateResources(state);
    expect(report.balances.every((b) => b.active)).toBe(true);
    expect(report.balances.find((b) => b.resource === "TradeGoods")!.net).toBe(0);
    expect(report.balances.find((b) => b.resource === "Knowledge")!.net).toBe(0);
    expect(report.balances.find((b) => b.resource === "Materials")!.net).toBe(0);
  });

  it("formats a readable report", () => {
    const state = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Market"),
      makeSettlement("s2", "Cottage", "Market"),
      makeSettlement("s3", "Cottage", "CraftDistrict"),
    ]);
    const report = calculateResources(state);
    const text = formatResourceReport(report);
    expect(text).toContain("Realm Resources");
    expect(text).toContain("TradeGoods: 2 produced, 1 consumed");
    expect(text).toContain("surplus (wasted)");
    // Knowledge and Materials should not appear (not yet active)
    expect(text).not.toContain("Knowledge");
    expect(text).not.toContain("Materials");
  });

  it("formats idle consumers in report", () => {
    const state = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Market"),
      makeSettlement("s2", "Cottage", "CraftDistrict"),
      makeSettlement("s3", "Cottage", "CraftDistrict"),
    ]);
    const report = calculateResources(state);
    const text = formatResourceReport(report);
    expect(text).toContain("deficit");
    expect(text).toContain("1 consumer idle");
  });
});