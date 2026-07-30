// src/tests/resource-economy.test.ts

import { describe, it, expect } from "vitest";
import { cacaoPerTurn } from "../engine/cacao/passive";
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

describe("Resource pipeline economy integration", () => {
  it("CraftDistrict adds bonus cacao when Trade Goods are available", () => {
    // 1 Market (produces 1 Trade Good) + 1 CraftDistrict (consumes 1 Trade Good)
    // Both should be active, CraftDistrict should produce +4 bonus cacao
    const withPipeline = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Market"),
      makeSettlement("s2", "Cottage", "CraftDistrict"),
    ]);

    const withoutPipeline = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Market"),
      makeSettlement("s2", "Cottage", null), // unspecialized
    ]);

    const pipelineIncome = cacaoPerTurn(withPipeline);
    const baseIncome = cacaoPerTurn(withoutPipeline);

    // Pipeline income should be higher by the CraftDistrict bonus
    // Market gives +2 base, CraftDistrict gives +4 when active
    // So difference should be at least +4 (CraftDistrict bonus) minus tier income difference
    expect(pipelineIncome).toBeGreaterThan(baseIncome);
  });

  it("CraftDistricts go idle when Trade Goods are insufficient", () => {
    // 1 Market + 3 CraftDistricts = only 1 CraftDistrict can be active
    const state = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Market"),
      makeSettlement("s2", "Cottage", "CraftDistrict"),
      makeSettlement("s3", "Cottage", "CraftDistrict"),
      makeSettlement("s4", "Cottage", "CraftDistrict"),
    ]);

    // Only 1 CraftDistrict is active (1 Trade Good from 1 Market)
    // Bonus should be 4 (1 active * 4 per active)
    // Compare with 1 Market + 1 CraftDistrict (1 active, same bonus)
    const balanced = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Market"),
      makeSettlement("s2", "Cottage", "CraftDistrict"),
    ]);

    // The 3-CraftDistrict state should earn the same CraftDistrict bonus
    // as the 1-CraftDistrict state, because only 1 is active in both cases.
    // But the 3-CD state has 2 more settlements contributing tier income.
    const threeCDIncome = cacaoPerTurn(state);
    const oneCDIncome = cacaoPerTurn(balanced);

    // Three CDs should earn more from tier income (2 extra settlements)
    // but the same CraftDistrict bonus (only 1 active in both)
    expect(threeCDIncome).toBeGreaterThan(oneCDIncome);
    // The extra should be roughly 2 settlements * 6 (Cottage tier) = 12
    // Not 2 * (6 + 4) = 20, which would mean both extra CDs are producing bonus
    expect(threeCDIncome - oneCDIncome).toBeLessThan(20);
  });

  it("Temple multiplier boosted by Knowledge in Age of Growth", () => {
    // 1 Codex (produces Knowledge) + 1 Temple (consumes Knowledge, boosted)
    const withKnowledge = makeState("AgeOfGrowth", [
      makeSettlement("s1", "Cottage", "Codex"),
      makeSettlement("s2", "Cottage", "Temple"),
    ]);

    // Same setup but no Codex (Temple has no Knowledge to consume)
    const withoutKnowledge = makeState("AgeOfGrowth", [
      makeSettlement("s1", "Cottage", null),
      makeSettlement("s2", "Cottage", "Temple"),
    ]);

    const withKIncome = cacaoPerTurn(withKnowledge);
    const withoutKIncome = cacaoPerTurn(withoutKnowledge);

    // With Knowledge, Temple gets 25% + 10% = 35% multiplier instead of 25%
    // Plus the Codex settlement contributes tier income
    expect(withKIncome).toBeGreaterThan(withoutKIncome);
  });

  it("Aqueduct multiplier boosted by Materials in Age of City-States", () => {
    // 1 Estate (produces Materials) + 1 Aqueduct (consumes Materials, boosted)
    const withMaterials = makeState("AgeOfCityStates", [
      makeSettlement("s1", "Cottage", "Estate"),
      makeSettlement("s2", "Cottage", "Aqueduct"),
    ]);

    const withoutMaterials = makeState("AgeOfCityStates", [
      makeSettlement("s1", "Cottage", null),
      makeSettlement("s2", "Cottage", "Aqueduct"),
    ]);

    const withMIncome = cacaoPerTurn(withMaterials);
    const withoutMIncome = cacaoPerTurn(withoutMaterials);

    expect(withMIncome).toBeGreaterThan(withoutMIncome);
  });

  it("resource bonuses do not apply before unlock age", () => {
    // In Founding Age, Knowledge and Materials are not active.
    // A Temple without Codex should give same income as a Temple with Codex
    // (because Knowledge flow hasn't unlocked yet).
    const withCodex = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", "Codex"),
      makeSettlement("s2", "Cottage", "Temple"),
    ]);

    const withoutCodex = makeState("FoundingAge", [
      makeSettlement("s1", "Cottage", null),
      makeSettlement("s2", "Cottage", "Temple"),
    ]);

    const withC = cacaoPerTurn(withCodex);
    const withoutC = cacaoPerTurn(withoutCodex);

    // The only difference would be from the Knowledge boost, which should NOT
    // apply in Founding Age. Both settlements are Cottages with the same tier income.
    // Codex doesn't add base cacao (it's a research building, not an income building).
    // So the income should be identical.
    expect(withC - withoutC).toBe(0);
  });
});