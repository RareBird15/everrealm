
import { describe, it, expect } from "vitest";
import { createInitialState, effectiveLandParcels } from "../../engine/state/initialState";
import { reducer } from "../../engine/reducer";
import { canResearch, researchCost } from "../../engine/research/researchAction";
import { researchForAge, ALL_RESEARCH, canAdvanceAge, getResearch } from "../../engine/research/definitions";
import { establishCost, canEstablish } from "../../engine/settlements/establish";
import { landCost, canBuyLand } from "../../engine/land/buyLand";
import { passiveRatePerHour, cacaoPerTurn } from "../../engine/cacao/passive";
import { isFinalAge } from "../../engine/ages/definitions";
import type { ResearchId } from "../../engine/research/types";
import type { SpecialBuilding } from "../../engine/settlements/types";
import type { GameCommand } from "../../engine/events/GameCommand";

function playGame(maxTurns: number, strategy: string): any[] {
  let state = createInitialState("Balance Test");
  const log: any[] = [];
  
  for (let turn = 0; turn < maxTurns; turn++) {
    const turnRate = cacaoPerTurn(state);
    const passiveRate = passiveRatePerHour(state);
    const landUsed = state.settlements.length;
    const landTotal = effectiveLandParcels(state);
    
    // Log every 5 turns
    if (turn % 5 === 0 || turn < 10) {
      log.push({
        turn: state.turn,
        cacao: state.cacao,
        turnRate,
        passiveRate,
        landUsed,
        landTotal,
        settlements: state.settlements.length,
        specialized: state.settlements.filter(s => s.specialization !== null).length,
        age: state.age,
        baseTier: state.baseTier,
        researchCount: state.completedResearch.length,
      });
    }
    
    // Strategy: prioritize research, then land, then establish
    const availableResearch = ALL_RESEARCH.filter(r => canResearch(state, r.id));
    const canAdvance = !isFinalAge(state.age) && canAdvanceAge(state.age, state.completedResearch);
    
    if (canAdvance) {
      state = reducer(state, { type: "AdvanceAge" }).state;
      continue;
    }
    
    // Try to research the cheapest available
    if (availableResearch.length > 0) {
      const cheapest = availableResearch.reduce((min, r) => 
        researchCost(state, r) < researchCost(state, min) ? r : min
      );
      if (state.cacao >= researchCost(state, cheapest)) {
        state = reducer(state, { type: "ResearchUpgrade", researchId: cheapest.id }).state;
        continue;
      }
    }
    
    // Buy land if we're close to capacity
    if (landUsed >= landTotal - 1 && canBuyLand(state)) {
      state = reducer(state, { type: "BuyLand" }).state;
      continue;
    }
    
    // Establish if we have space
    if (canEstablish(state)) {
      state = reducer(state, { type: "EstablishSettlement" }).state;
      continue;
    }
    
    // Specialize unspecialized settlements if we have research unlocked
    const unlocked = state.completedResearch
      .map(r => getResearch(r))
      .filter(r => r?.unlocksBuilding)
      .map(r => r!.unlocksBuilding!);
    
    const unspecialized = state.settlements.find(s => s.specialization === null);
    if (unspecialized && unlocked.length > 0) {
      // Pick the first unlocked building
      state = reducer(state, {
        type: "SpecializeSettlement",
        settlementId: unspecialized.id,
        building: unlocked[0] as SpecialBuilding,
      }).state;
      continue;
    }
    
    // Nothing to do — just wait (simulate by establishing if possible, or break)
    if (!canEstablish(state) && !canBuyLand(state) && availableResearch.length === 0) {
      break;
    }
    
    // Can't afford anything — skip this turn by doing nothing
    // Force a turn advancement by establishing if possible, otherwise break
    break;
  }
  
  return log;
}

describe("Balance: Full Game Playthrough", () => {
  it("plays through 100 turns and logs economy", () => {
    const log = playGame(100, "research-first");
    
    console.log("\n=== BALANCE LOG ===");
    console.log("Turn | Cacao | TurnRate | Passive | Land | Setts | Spec | Age | Tier | Research");
    console.log("-----|-------|----------|---------|------|-------|------|-----|------|--------");
    for (const entry of log) {
      console.log(
        `${String(entry.turn).padStart(4)} | ${String(entry.cacao).padStart(5)} | ${String(entry.turnRate).padStart(8)} | ${String(entry.passiveRate).padStart(7)} | ${String(entry.landUsed).padStart(4)}/${entry.landTotal} | ${String(entry.settlements).padStart(5)} | ${String(entry.specialized).padStart(4)} | ${entry.age.substring(0, 12).padEnd(12)} | ${entry.baseTier.padEnd(10)} | ${entry.researchCount}`
      );
    }
    
    // Basic assertions
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].cacao).toBe(100);
  });
  
  it("plays through 100 turns specializing aggressively", () => {
    let state = createInitialState("Spec Test");
    const log: any[] = [];

    for (let turn = 0; turn < 100; turn++) {
      const turnRate = cacaoPerTurn(state);
      const landUsed = state.settlements.length;
      const landTotal = effectiveLandParcels(state);

      if (turn % 5 === 0 || turn < 10) {
        log.push({
          turn: state.turn,
          cacao: Math.floor(state.cacao),
          turnRate,
          landUsed,
          landTotal,
          settlements: state.settlements.length,
          specialized: state.settlements.filter(s => s.specialization !== null).length,
          age: state.age,
          baseTier: state.baseTier,
          researchCount: state.completedResearch.length,
        });
      }

      // Strategy: specialize aggressively
      // 1. If we have unlocked buildings and unspecialized settlements, specialize
      const unlocked = state.completedResearch
        .map(r => getResearch(r))
        .filter(r => r?.unlocksBuilding)
        .map(r => r!.unlocksBuilding!);

      const unspecialized = state.settlements.find(s => s.specialization === null);
      if (unspecialized && unlocked.length > 0) {
        // Pick a building we haven't used yet
        const used = new Set(state.settlements.map(s => s.specialization));
        const building = unlocked.find(b => !used.has(b)) ?? unlocked[0];
        state = reducer(state, {
          type: "SpecializeSettlement",
          settlementId: unspecialized.id,
          building: building as SpecialBuilding,
        }).state;
        continue;
      }

      // 2. Research if possible
      const availableResearch = ALL_RESEARCH.filter(r => canResearch(state, r.id));
      if (availableResearch.length > 0) {
        const cheapest = availableResearch.reduce((min, r) =>
          researchCost(state, r) < researchCost(state, min) ? r : min
        );
        if (state.cacao >= researchCost(state, cheapest)) {
          state = reducer(state, { type: "ResearchUpgrade", researchId: cheapest.id }).state;
          continue;
        }
      }

      // 3. Advance age if possible
      if (!isFinalAge(state.age) && canAdvanceAge(state.age, state.completedResearch)) {
        state = reducer(state, { type: "AdvanceAge" }).state;
        continue;
      }

      // 4. Establish if we have space
      if (canEstablish(state)) {
        state = reducer(state, { type: "EstablishSettlement" }).state;
        continue;
      }

      // 5. Buy land
      if (canBuyLand(state)) {
        state = reducer(state, { type: "BuyLand" }).state;
        continue;
      }

      break;
    }

    console.log("\n=== SPECIALIZATION STRATEGY LOG ===");
    console.log("Turn | Cacao | TurnRate | Land | Setts | Spec | Age | Tier | Research");
    console.log("-----|-------|----------|------|-------|------|-----|------|--------");
    for (const entry of log) {
      console.log(
        `${String(entry.turn).padStart(4)} | ${String(entry.cacao).padStart(5)} | ${String(entry.turnRate).padStart(8)} | ${String(entry.landUsed).padStart(4)}/${entry.landTotal} | ${String(entry.settlements).padStart(5)} | ${String(entry.specialized).padStart(4)} | ${entry.age.substring(0, 12).padEnd(12)} | ${entry.baseTier.padEnd(10)} | ${entry.researchCount}`
      );
    }
    expect(log.length).toBeGreaterThan(0);
  });
});
