// src/tests/engine/engine.test.ts

import { describe, it, expect } from "vitest";
import { createInitialState } from "../../engine/state/initialState";
import { reducer } from "../../engine/reducer";
import type { ResearchId } from "../../engine/research/types";
import type { SpecialBuilding } from "../../engine/settlements/types";

describe("createInitialState", () => {
  it("starts with 100 Cacao", () => {
    const state = createInitialState("Test Realm");
    expect(state.cacao).toBe(100);
  });

  it("starts with 5 land parcels", () => {
    const state = createInitialState("Test Realm");
    expect(state.landParcels).toBe(5);
  });

  it("starts in Founding Age", () => {
    const state = createInitialState("Test Realm");
    expect(state.age).toBe("FoundingAge");
  });

  it("starts at Tent tier", () => {
    const state = createInitialState("Test Realm");
    expect(state.baseTier).toBe("Tent");
  });

  it("applies Founders' Stela legacy (starts at Hut with forestry)", () => {
    const state = createInitialState("Test Realm", [], ["FoundersStela"]);
    expect(state.baseTier).toBe("Hut");
    expect(state.completedResearch).toContain("forestry");
  });

  it("applies Garden of Eternity legacy (+2 land parcels)", () => {
    const state = createInitialState(
      "Test Realm",
      [],
      ["GardenOfEternity"],
      2,
    );
    expect(state.landParcels).toBe(7);
  });
});

describe("Establish Settlement", () => {
  it("creates a settlement at the current base tier", () => {
    const state = createInitialState("Test Realm");
    const { state: newState, events } = reducer(state, {
      type: "EstablishSettlement",
    });

    expect(newState.settlements).toHaveLength(1);
    expect(newState.settlements[0].tier).toBe("Tent");
    expect(newState.settlements[0].specialization).toBeNull();
    expect(events).toContainEqual(
      expect.objectContaining({ type: "SettlementEstablished" }),
    );
  });

  it("costs Cacao and grants a reward plus turn income", () => {
    const state = createInitialState("Test Realm");
    const { state: newState } = reducer(state, {
      type: "EstablishSettlement",
    });
    // Cost 10, reward 5, turn income 5 (base, no settlements yet) = net 0
    // But turn income is earned before the action, so: 100 + 5 - 10 + 5 = 100
    expect(newState.cacao).toBe(100);
  });

  it("fails when not enough Cacao", () => {
    const state = { ...createInitialState("Test Realm"), cacao: 0 };
    const { state: newState, events } = reducer(state, {
      type: "EstablishSettlement",
    });
    expect(events).toContainEqual(
      expect.objectContaining({ type: "Error" }),
    );
    expect(newState.settlements).toHaveLength(0);
  });

  it("fails when all land parcels are used", () => {
    let state = createInitialState("Test Realm");
    // Fill all 5 parcels
    for (let i = 0; i < 5; i++) {
      state = reducer(state, { type: "EstablishSettlement" }).state;
    }
    expect(state.settlements).toHaveLength(5);
    // Try to establish a 6th
    const { state: newState, events } = reducer(state, {
      type: "EstablishSettlement",
    });
    expect(events).toContainEqual(
      expect.objectContaining({ type: "Error" }),
    );
    expect(newState.settlements).toHaveLength(5);
  });
});

describe("Research Upgrade", () => {
  it("researches Forestry and upgrades all Tents to Huts", () => {
    let state = createInitialState("Test Realm");
    // Give enough Cacao for establishes + research
    state = { ...state, cacao: 200 };
    // Establish 2 settlements first
    state = reducer(state, { type: "EstablishSettlement" }).state;
    state = reducer(state, { type: "EstablishSettlement" }).state;
    expect(state.settlements.every((s) => s.tier === "Tent")).toBe(true);

    // Research Forestry
    const { state: newState, events } = reducer(state, {
      type: "ResearchUpgrade",
      researchId: "forestry" as ResearchId,
    });

    expect(newState.completedResearch).toContain("forestry");
    expect(newState.baseTier).toBe("Hut");
    expect(newState.settlements.every((s) => s.tier === "Hut")).toBe(true);
    expect(events).toContainEqual(
      expect.objectContaining({ type: "SettlementsUpgraded" }),
    );
  });

  it("researches Agriculture to unlock Farm specialization", () => {
    let state = createInitialState("Test Realm");
    state = { ...state, cacao: 200 };
    state = reducer(state, { type: "EstablishSettlement" }).state;

    const { state: newState, events } = reducer(state, {
      type: "ResearchUpgrade",
      researchId: "agriculture" as ResearchId,
    });

    expect(newState.completedResearch).toContain("agriculture");
    expect(events).toContainEqual(
      expect.objectContaining({ type: "SpecializationUnlocked" }),
    );
  });

  it("fails when not enough Cacao", () => {
    const state = { ...createInitialState("Test Realm"), cacao: 10 };
    const { events } = reducer(state, {
      type: "ResearchUpgrade",
      researchId: "forestry" as ResearchId,
    });
    expect(events).toContainEqual(
      expect.objectContaining({ type: "Error" }),
    );
  });
});

describe("Specialize Settlement", () => {
  it("specializes a settlement as a Farm", () => {
    let state = createInitialState("Test Realm");
    state = { ...state, cacao: 200 };
    state = reducer(state, { type: "EstablishSettlement" }).state;
    // Research Agriculture first
    state = reducer(state, {
      type: "ResearchUpgrade",
      researchId: "agriculture" as ResearchId,
    }).state;

    const settlementId = state.settlements[0].id;
    const { state: newState, events } = reducer(state, {
      type: "SpecializeSettlement",
      settlementId,
      building: "Farm" as SpecialBuilding,
    });

    expect(newState.settlements[0].specialization).toBe("Farm");
    expect(events).toContainEqual(
      expect.objectContaining({ type: "SettlementSpecialized" }),
    );
  });

  it("fails if building not unlocked", () => {
    let state = createInitialState("Test Realm");
    state = reducer(state, { type: "EstablishSettlement" }).state;
    const settlementId = state.settlements[0].id;

    const { events } = reducer(state, {
      type: "SpecializeSettlement",
      settlementId,
      building: "Farm" as SpecialBuilding,
    });
    expect(events).toContainEqual(
      expect.objectContaining({ type: "Error" }),
    );
  });
});

describe("Buy Land", () => {
  it("purchases a land parcel", () => {
    const state = createInitialState("Test Realm");
    const { state: newState, events } = reducer(state, { type: "BuyLand" });

    expect(newState.landParcels).toBe(6);
    expect(events).toContainEqual(
      expect.objectContaining({ type: "LandPurchased" }),
    );
  });

  it("costs 60 Cacao for the first parcel", () => {
    const state = createInitialState("Test Realm");
    const { state: newState } = reducer(state, { type: "BuyLand" });
    // 100 + 5 (turn income) - 60 (land cost) = 45
    expect(newState.cacao).toBe(45);
  });
});

describe("Advance Age", () => {
  it("fails without top-tier research", () => {
    const state = createInitialState("Test Realm");
    const { events } = reducer(state, { type: "AdvanceAge" });
    expect(events).toContainEqual(
      expect.objectContaining({ type: "Error" }),
    );
  });

  it("advances after completing top-tier research", () => {
    let state = createInitialState("Test Realm");
    state = { ...state, cacao: 500 };
    // Must establish at least one settlement before research is available
    state = reducer(state, { type: "EstablishSettlement" }).state;
    // Research both Founding Age upgrades
    state = reducer(state, {
      type: "ResearchUpgrade",
      researchId: "forestry" as ResearchId,
    }).state;
    state = reducer(state, {
      type: "ResearchUpgrade",
      researchId: "adobeMaking" as ResearchId,
    }).state;

    const { state: newState, events } = reducer(state, {
      type: "AdvanceAge",
    });

    expect(newState.age).toBe("AgeOfGrowth");
    expect(events).toContainEqual(
      expect.objectContaining({ type: "AgeAdvanced" }),
    );
  });
});

describe("Cacao terminology", () => {
  it("uses Cacao in error messages", () => {
    const state = { ...createInitialState("Test Realm"), cacao: 0 };
    const { events } = reducer(state, { type: "BuyLand" });
    const errorEvent = events.find((e) => e.type === "Error");
    expect(errorEvent).toBeDefined();
    if (errorEvent && errorEvent.type === "Error") {
      expect(errorEvent.message.includes("cacao") || errorEvent.message.includes("Cacao")).toBe(true);
    }
  });
});

describe("Story records", () => {
  it("records settlement establishment in story", () => {
    const state = createInitialState("Test Realm");
    const { state: newState } = reducer(state, {
      type: "EstablishSettlement",
    });
    expect(newState.story).toContainEqual(
      expect.objectContaining({ kind: "SettlementEstablished" }),
    );
  });

  it("records research completion in story", () => {
    let state = createInitialState("Test Realm");
    state = { ...state, cacao: 200 };
    state = reducer(state, { type: "EstablishSettlement" }).state;
    const { state: newState } = reducer(state, {
      type: "ResearchUpgrade",
      researchId: "forestry" as ResearchId,
    });
    expect(newState.story).toContainEqual(
      expect.objectContaining({ kind: "ResearchCompleted" }),
    );
  });
});