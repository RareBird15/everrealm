
import { describe, it, expect } from "vitest";
import { createInitialState, effectiveLandParcels } from "../../engine/state/initialState";
import { reducer } from "../../engine/reducer";
import { canResearch, researchCost } from "../../engine/research/researchAction";
import { ALL_RESEARCH, canAdvanceAge, getResearch } from "../../engine/research/definitions";
import { canEstablish } from "../../engine/settlements/establish";
import { canBuyLand } from "../../engine/land/buyLand";
import { cacaoPerTurn } from "../../engine/cacao/passive";
import { isFinalAge } from "../../engine/ages/definitions";
import type { SpecialBuilding } from "../../engine/settlements/types";

interface LogEntry {
  turn: number;
  cacao: number;
  turnRate: number;
  passiveRate?: number;
  land?: string;
  landUsed?: number;
  landTotal?: number;
  settlements?: number;
  spec?: number;
  specialized?: number;
  age: string;
  tier?: string;
  baseTier?: string;
  research?: number;
  researchCount?: number;
  ASCENDED?: boolean;
}

function playGame(maxTurns: number, legacies: string[]): { log: LogEntry[]; ascendedAt: number } {
  let state = createInitialState("Test", [], legacies, legacies.includes("GardenOfEternity") ? 2 : 0);
  if (legacies.includes("FoundersStela")) {
    // FoundersStela auto-researches forestry
  }
  state = { ...state, cacao: 100 };

  let specializedCount = 0;
  const log: LogEntry[] = [];

  for (let turn = 0; turn < maxTurns; turn++) {
    const turnRate = cacaoPerTurn(state);

    if (turn % 10 === 0 || turn < 5) {
      log.push({
        turn: state.turn,
        cacao: Math.floor(state.cacao),
        turnRate,
        land: `${state.settlements.length}/${effectiveLandParcels(state)}`,
        spec: state.settlements.filter(s => s.specialization !== null).length,
        age: state.age,
        tier: state.baseTier,
        research: state.completedResearch.length,
      });
    }

    // Check if we can ascend
    const hasAscension = state.completedResearch.some((r: string) => r === "ascension");
    const hasCapital = state.settlements.some(s => s.tier === "Capital");
    const legendary = state.settlements.filter(s =>
      s.specialization === "Pyramid" || s.specialization === "Sanctum" || s.specialization === "Stela"
    ).length;
    if (hasAscension && hasCapital && legendary >= 3) {
      log.push({
        turn: state.turn,
        cacao: Math.floor(state.cacao),
        turnRate,
        land: `${state.settlements.length}/${effectiveLandParcels(state)}`,
        spec: state.settlements.filter(s => s.specialization !== null).length,
        age: state.age,
        tier: state.baseTier,
        research: state.completedResearch.length,
        ASCENDED: true,
      });
      return { log, ascendedAt: state.turn };
    }

    // Strategy
    const availableResearch = ALL_RESEARCH.filter(r => canResearch(state, r.id));
    const canAdv = !isFinalAge(state.age) && canAdvanceAge(state.age, state.completedResearch);

    {
      // 1. Advance if possible
      if (canAdv) {
        state = reducer(state, { type: "AdvanceAge" }).state;
        continue;
      }
      // 2. Research cheapest available
      if (availableResearch.length > 0) {
        const cheapest = availableResearch.reduce((min, r) =>
          researchCost(state, r) < researchCost(state, min) ? r : min
        );
        if (state.cacao >= researchCost(state, cheapest)) {
          state = reducer(state, { type: "ResearchUpgrade", researchId: cheapest.id }).state;
          continue;
        }
      }
      // 3. Specialize every 3rd unspecialized settlement
      const unspec = state.settlements.filter(s => s.specialization === null);
      if (unspec.length >= 3 && specializedCount < state.settlements.length * 0.4) {
        const unlocked = state.completedResearch
          .map(r => getResearch(r))
          .filter(r => r?.unlocksBuilding)
          .map(r => r!.unlocksBuilding!);
        if (unlocked.length > 0) {
          const used = new Set(state.settlements.map(s => s.specialization));
          const building = unlocked.find(b => !used.has(b)) ?? unlocked[0];
          state = reducer(state, {
            type: "SpecializeSettlement",
            settlementId: unspec[0]!.id,
            building: building as SpecialBuilding,
          }).state;
          specializedCount++;
          continue;
        }
      }
      // 4. Buy land if full
      if (state.settlements.length >= effectiveLandParcels(state) - 1 && canBuyLand(state)) {
        // Don't expand beyond 50 settlements — research costs scale with settlement count
        if (state.settlements.length < 50) {
          state = reducer(state, { type: "BuyLand" }).state;
          continue;
        }
      }
      // 5. Establish (but don't over-expand)
      if (canEstablish(state) && state.settlements.length < 50) {
        state = reducer(state, { type: "EstablishSettlement" }).state;
        continue;
      }
      // 6. If we can't do anything else, unspecialize a settlement to free it for upgrading
      // or just wait by doing a land purchase we can't afford — but actually we need to
      // wait for passive income. The only way to "wait" is to take any action that costs
      // nothing but still earns turn income. Buy land is the cheapest if we can afford it.
      // If truly stuck, break.
      if (!canBuyLand(state) && availableResearch.length === 0 && !canAdv) {
        // Check if we have unspecialized settlements we could specialize
        const unlocked = state.completedResearch
          .map(r => getResearch(r))
          .filter(r => r?.unlocksBuilding)
          .map(r => r!.unlocksBuilding!);
        if (unlocked.length > 0) {
          const unspec = state.settlements.find(s => s.specialization === null);
          if (unspec) {
            state = reducer(state, {
              type: "SpecializeSettlement",
              settlementId: unspec!.id,
              building: unlocked[0] as SpecialBuilding,
            }).state;
            continue;
          }
        }
        break;
      }
      // If we can buy land, do it (earns turn income too)
      if (canBuyLand(state)) {
        state = reducer(state, { type: "BuyLand" }).state;
        continue;
      }
      break;
    }
  }

  return { log, ascendedAt: -1 };
}

const LEGACIES: { id: string, name: string }[] = [
  { id: "EternalPyramid", name: "Eternal Pyramid" },
  { id: "FoundersStela", name: "Founders' Stela" },
  { id: "JadePalace", name: "Jade Palace" },
  { id: "GardenOfEternity", name: "Garden of Eternity" },
  { id: "CodexOfAges", name: "Codex of Ages" },
];

describe("Balance: Legacy Comparison", () => {
  for (const legacy of LEGACIES) {
    it(`completes a run with ${legacy.name}`, () => {
      const { log, ascendedAt } = playGame(300, [legacy.id]);

      console.log(`\n=== ${legacy.name} ===`);
      console.log(`Ascended: ${ascendedAt > 0 ? "YES at turn " + ascendedAt : "NO"}`);
      console.log("Turn | Cacao | TurnRate | Land | Spec | Age | Tier | Research");
      console.log("-----|-------|----------|------|------|-----|------|--------");
      for (const entry of log) {
        console.log(
          `${String(entry.turn).padStart(4)} | ${String(entry.cacao).padStart(5)} | ${String(entry.turnRate).padStart(8)} | ${(entry.land ?? '').padStart(5)} | ${String(entry.spec).padStart(4)} | ${entry.age.substring(0, 12).padEnd(12)} | ${(entry.tier ?? '').padEnd(10)} | ${entry.research}${entry.ASCENDED ? " ← ASCENDED" : ""}`
        );
      }

      expect(log.length).toBeGreaterThan(0);
    });
  }

  it("tests a run with 3 stacked legacies", () => {
    // Simulate a player who has ascended 3 times and has all 3 legacies:
    // Eternal Pyramid, Founders' Stela, Garden of Eternity
    const { log, ascendedAt } = playGame(300,
        ["EternalPyramid", "FoundersStela", "GardenOfEternity"],
      );

    console.log("\n=== 3 STACKED LEGACIES ===");
    console.log("Legacies: Eternal Pyramid + Founders' Stela + Garden of Eternity");
    console.log(`Ascended: ${ascendedAt > 0 ? "YES at turn " + ascendedAt : "NO"}`);
    console.log("Turn | Cacao | TurnRate | Land | Spec | Age | Tier | Research");
    console.log("-----|-------|----------|------|------|-----|------|--------");
    for (const entry of log) {
      console.log(
        `${String(entry.turn).padStart(4)} | ${String(entry.cacao).padStart(5)} | ${String(entry.turnRate).padStart(8)} | ${(entry.land ?? '').padStart(5)} | ${String(entry.spec).padStart(4)} | ${entry.age.substring(0, 12).padEnd(12)} | ${(entry.tier ?? '').padEnd(10)} | ${entry.research}${entry.ASCENDED ? " ← ASCENDED" : ""}`
      );
    }

    expect(log.length).toBeGreaterThan(0);
    if (ascendedAt > 0) {
      console.log(`\n3-legacy run ascended at turn ${ascendedAt}`);
    }
  });

  it("compares all legacies", () => {
    const results: { legacy: string; ascendedAt: number; finalTurn: number; finalCacao: number; finalTurnRate: number; researchCount: number }[] = [];
    for (const legacy of LEGACIES) {
      const { ascendedAt, log } = playGame(300, [legacy.id]);
      const final = log[log.length - 1];
      results.push({
        legacy: legacy.name,
        ascendedAt,
        finalTurn: final?.turn ?? 0,
        finalCacao: final?.cacao ?? 0,
        finalTurnRate: final?.turnRate ?? 0,
        researchCount: final?.research ?? 0,
      });
    }

    // Add the 3-legacy combo
    {
      const { ascendedAt, log } = playGame(300,
        ["EternalPyramid", "FoundersStela", "GardenOfEternity"]
      );
      const final = log[log.length - 1];
      results.push({
        legacy: "3-Stacked (EP+FS+GoE)",
        ascendedAt,
        finalTurn: final?.turn ?? 0,
        finalCacao: final?.cacao ?? 0,
        finalTurnRate: final?.turnRate ?? 0,
        researchCount: final?.research ?? 0,
      });
    }

    console.log("\n=== LEGACY COMPARISON ===");
    console.log("Legacy | Ascended | Turn | Cacao | TurnRate | Research");
    console.log("-------|----------|------|-------|----------|--------");
    for (const r of results) {
      console.log(
        `${r.legacy.padEnd(18)} | ${r.ascendedAt > 0 ? "YES turn " + r.ascendedAt : "NO".padEnd(9)} | ${String(r.finalTurn).padStart(4)} | ${String(r.finalCacao).padStart(5)} | ${String(r.finalTurnRate).padStart(8)} | ${r.researchCount}`
      );
    }
    expect(results.length).toBe(6);
  });
});
