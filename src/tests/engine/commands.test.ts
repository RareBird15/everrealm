import { describe, it, expect } from "vitest";
import { initialState, STARTING_PROSPERITY } from "../../engine/state/initialState";
import { executeCommand, reconcileTime } from "../../engine/commands";
import { ESTABLISH_COST } from "../../engine/settlements/establish";
import { DEVELOP_REWARD, DISCOVERY_REWARD, AGE_ENTRY_REWARD, ESTABLISH_REWARD } from "../../engine/prosperity/earn";
import { AGE_ADVANCE_COST } from "../../engine/ages/advance";
import { findStack } from "../../engine/settlements/stacks";
import { getImprovement } from "../../engine/improvements/catalog";
import type { ImprovementId } from "../../engine/improvements/types";

const NOW = 1_000_000;

function id(s: string): ImprovementId {
  return s as ImprovementId;
}

describe("executeCommand — EstablishSettlement", () => {
  it("creates a Tent and deducts the cost", () => {
    const state = initialState("Elderglen", NOW);
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(findStack(result.value.state.settlements, "FoundingAge", "Tent")?.quantity).toBe(1);
    // STARTING_PROSPERITY - ESTABLISH_COST + ESTABLISH_REWARD + DISCOVERY_REWARD (first Tent discovery)
    expect(result.value.state.prosperity).toBe(
      STARTING_PROSPERITY - ESTABLISH_COST + ESTABLISH_REWARD + DISCOVERY_REWARD,
    );
  });

  it("increments the turn", () => {
    const state = initialState("Elderglen", NOW);
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.state.turn).toBe(1);
  });

  it("emits SettlementEstablished event", () => {
    const state = initialState("Elderglen", NOW);
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.value.events.some((e) => e.type === "SettlementEstablished"),
    ).toBe(true);
  });

  it("discovers Tent on first establishment", () => {
    const state = initialState("Elderglen", NOW);
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.state.discoveredLevels).toContain("Tent");
    expect(
      result.value.events.some((e) => e.type === "SettlementLevelDiscovered"),
    ).toBe(true);
  });

  it("awards discovery prosperity for first Tent", () => {
    const state = initialState("Elderglen", NOW);
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW);
    expect(result.success).toBe(true);
    if (!result.success) return;
    // STARTING_PROSPERITY - ESTABLISH_COST + ESTABLISH_REWARD + DISCOVERY_REWARD
    expect(result.value.state.prosperity).toBe(
      STARTING_PROSPERITY - ESTABLISH_COST + ESTABLISH_REWARD + DISCOVERY_REWARD,
    );
  });

  it("does not award discovery on subsequent establishments", () => {
    let state = initialState("Elderglen", NOW);
    // Establish first tent (with discovery)
    const r1 = executeCommand(state, { type: "EstablishSettlement" }, NOW);
    if (r1.success) state = r1.value.state;
    // Establish second tent
    const r2 = executeCommand(state, { type: "EstablishSettlement" }, NOW);
    if (r2.success) state = r2.value.state;
    // Establish third tent — no discovery
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.value.events.some((e) => e.type === "SettlementLevelDiscovered"),
    ).toBe(false);
  });

  it("fails when Prosperity is insufficient", () => {
    const state = { ...initialState("Elderglen", NOW), prosperity: 5 };
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).toBe("InsufficientProsperity");
  });

  it("fails when capacity is full", () => {
  const state = {
    ...initialState("Elderglen", NOW),
    settlements: [{ age: "FoundingAge" as const, level: "Tent" as const, quantity: 20 }],
  };
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).toBe("SettlementCapacityFull");
  });

  it("adds a story record for the establishment", () => {
    const state = initialState("Elderglen", NOW);
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.state.story).toContainEqual({
      kind: "SettlementEstablished",
      turn: 1,
      level: "Tent",
    });
  });
});

describe("executeCommand — DevelopSettlement", () => {
  it("develops two Tents into a Hut and awards prosperity", () => {
    let state = initialState("Elderglen", NOW);
    // Establish 2 tents
    for (let i = 0; i < 2; i++) {
      const r = executeCommand(state, { type: "EstablishSettlement" }, NOW);
      if (r.success) state = r.value.state;
    }

    const result = executeCommand(
      state,
      { type: "DevelopSettlement", age: "FoundingAge", level: "Tent" },
      NOW,
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(findStack(result.value.state.settlements, "FoundingAge", "Hut")?.quantity).toBe(1);
    // Should have earned DEVELOP_REWARD + DISCOVERY_REWARD (for Hut)
    expect(result.value.state.prosperity).toBe(
      state.prosperity + DEVELOP_REWARD + DISCOVERY_REWARD,
    );
  });

  it("discovers the new level on first develop", () => {
    let state = initialState("Elderglen", NOW);
    for (let i = 0; i < 2; i++) {
      const r = executeCommand(state, { type: "EstablishSettlement" }, NOW);
      if (r.success) state = r.value.state;
    }

    const result = executeCommand(
      state,
      { type: "DevelopSettlement", age: "FoundingAge", level: "Tent" },
      NOW,
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.state.discoveredLevels).toContain("Hut");
  });

  it("emits chain reaction events when applicable", () => {
    let state = initialState("Elderglen", NOW);
    // Establish 4 tents → 2 develops available, but we need a specific setup:
    // 2 Tents + 1 Hut for chain
    for (let i = 0; i < 4; i++) {
      const r = executeCommand(state, { type: "EstablishSettlement" }, NOW);
      if (r.success) state = r.value.state;
    }
    // Develop first pair → creates Hut, no chain yet (only 1 Hut)
    const r1 = executeCommand(
      state,
      { type: "DevelopSettlement", age: "FoundingAge", level: "Tent" },
      NOW,
    );
    if (r1.success) state = r1.value.state;
    // Now develop second pair → creates Hut, chains with existing Hut → Cottage
    const result = executeCommand(
      state,
      { type: "DevelopSettlement", age: "FoundingAge", level: "Tent" },
      NOW,
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.value.events.some((e) => e.type === "ChainReactionStarted"),
    ).toBe(true);
    expect(
      result.value.events.some((e) => e.type === "ChainReactionCompleted"),
    ).toBe(true);
  });

  it("fails when there are not enough settlements", () => {
    const state = initialState("Elderglen", NOW);
    const result = executeCommand(
      state,
      { type: "DevelopSettlement", age: "FoundingAge", level: "Tent" },
      NOW,
    );
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).toBe("NoEligibleSettlements");
  });
});

describe("executeCommand — PurchaseImprovement", () => {
  it("purchases an improvement and deducts the cost", () => {
    const state = {
      ...initialState("Elderglen", NOW),
      prosperity: 1000,
    };
    const result = executeCommand(
      state,
      { type: "PurchaseImprovement", improvementId: id("stone_roads") },
      NOW,
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    const improvement = getImprovement(id("stone_roads"))!;
    expect(result.value.state.improvements).toContain(id("stone_roads"));
    expect(result.value.state.prosperity).toBe(1000 - improvement.cost);
  });

  it("fails when already purchased", () => {
    const state = {
      ...initialState("Elderglen", NOW),
      prosperity: 1000,
      improvements: [id("stone_roads")],
    };
    const result = executeCommand(
      state,
      { type: "PurchaseImprovement", improvementId: id("stone_roads") },
      NOW,
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).toBe("ImprovementAlreadyPurchased");
  });

  it("fails when not enough Prosperity", () => {
    const state = initialState("Elderglen", NOW);
    const result = executeCommand(
      state,
      { type: "PurchaseImprovement", improvementId: id("stone_roads") },
      NOW,
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).toBe("InsufficientProsperity");
  });

  it("increases capacity when purchasing Guild Hall", () => {
    const state = {
      ...initialState("Elderglen", NOW),
      prosperity: 1000,
    };
    const result = executeCommand(
      state,
      { type: "PurchaseImprovement", improvementId: id("guild_hall") },
      NOW,
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    // Guild Hall gives +5 capacity
    expect(result.value.state.capacity).toBe(state.capacity + 5);
  });

  it("adds a CapacityIncreased story record when capacity changes", () => {
    const state = {
      ...initialState("Elderglen", NOW),
      prosperity: 1000,
    };
    const result = executeCommand(
      state,
      { type: "PurchaseImprovement", improvementId: id("guild_hall") },
      NOW,
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.value.state.story.some(
        (r) => r.kind === "CapacityIncreased" && r.newCapacity === state.capacity + 5,
      ),
    ).toBe(true);
  });
});

describe("executeCommand — AdvanceAge", () => {
  it("fails when not enough Citadels", () => {
    const state = initialState("Elderglen", NOW);
    const result = executeCommand(state, { type: "AdvanceAge" }, NOW);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).toBe("AgeAdvancementNotAvailable");
  });

  it("fails from the final Age", () => {
    const state = {
      ...initialState("Elderglen", NOW),
      age: "AgeOfMyths" as const,
      settlements: [{ age: "AgeOfMyths" as const, level: "Citadel" as const, quantity: 2 }],
      prosperity: 10000,
    };
    const result = executeCommand(state, { type: "AdvanceAge" }, NOW);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.type).toBe("AgeAdvancementNotAvailable");
  });

  it("advances to the next Age with 2 Citadels and enough Prosperity", () => {
    const state = {
      ...initialState("Elderglen", NOW),
      settlements: [
        { age: "FoundingAge" as const, level: "Citadel" as const, quantity: 2 },
      ],
      prosperity: 1000,
    };
    const result = executeCommand(state, { type: "AdvanceAge" }, NOW);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.value.state.age).toBe("AgeOfGrowth");
    // Citadels consumed
    expect(
      findStack(result.value.state.settlements, "FoundingAge", "Citadel"),
    ).toBeUndefined();
    // New Age Tent created
    expect(
      findStack(result.value.state.settlements, "AgeOfGrowth", "Tent")?.quantity,
    ).toBe(1);
    // Prosperity: 1000 - AGE_ADVANCE_COST + AGE_ENTRY_REWARD + DISCOVERY_REWARD
    // (Tent is discovered for the first time since discoveredLevels was empty)
    expect(result.value.state.prosperity).toBe(
      1000 - AGE_ADVANCE_COST + AGE_ENTRY_REWARD + DISCOVERY_REWARD,
    );
  });

  it("emits an AgeAdvanced event", () => {
    const state = {
      ...initialState("Elderglen", NOW),
      settlements: [
        { age: "FoundingAge" as const, level: "Citadel" as const, quantity: 2 },
      ],
      prosperity: 1000,
    };
    const result = executeCommand(state, { type: "AdvanceAge" }, NOW);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.value.events.some(
        (e) => e.type === "AgeAdvanced" && e.fromAge === "FoundingAge" && e.toAge === "AgeOfGrowth",
      ),
    ).toBe(true);
  });

  it("adds an AgeAdvanced story record", () => {
    const state = {
      ...initialState("Elderglen", NOW),
      settlements: [
        { age: "FoundingAge" as const, level: "Citadel" as const, quantity: 2 },
      ],
      prosperity: 1000,
    };
    const result = executeCommand(state, { type: "AdvanceAge" }, NOW);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.state.story).toContainEqual({
      kind: "AgeAdvanced",
      turn: 1,
      age: "AgeOfGrowth",
    });
  });
});

describe("executeCommand — passive prosperity", () => {
  it("applies passive prosperity before commands", () => {
    const state = initialState("Elderglen", NOW);
    // Advance time by 1 hour = 60 prosperity at base rate
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW + 3_600_000);

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Prosperity: STARTING + 120 (passive) - ESTABLISH_COST + ESTABLISH_REWARD + DISCOVERY_REWARD
    expect(result.value.state.prosperity).toBe(
      STARTING_PROSPERITY + 120 - ESTABLISH_COST + ESTABLISH_REWARD + DISCOVERY_REWARD,
    );
  });

  it("emits PassiveProsperityApplied event", () => {
    const state = initialState("Elderglen", NOW);
    const result = executeCommand(state, { type: "EstablishSettlement" }, NOW + 3_600_000);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.value.events.some((e) => e.type === "PassiveProsperityApplied"),
    ).toBe(true);
  });
});

describe("reconcileTime", () => {
  it("applies passive prosperity without incrementing turn", () => {
    const state = initialState("Elderglen", NOW);
    const result = reconcileTime(state, NOW + 3_600_000);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.value.state.prosperity).toBe(STARTING_PROSPERITY + 120);
    expect(result.value.state.turn).toBe(0); // turn not incremented
    expect(
      result.value.events.some((e) => e.type === "PassiveProsperityApplied"),
    ).toBe(true);
  });

  it("does nothing when no time has elapsed", () => {
    const state = initialState("Elderglen", NOW);
    const result = reconcileTime(state, NOW);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.value.state.prosperity).toBe(STARTING_PROSPERITY);
    expect(result.value.events).toHaveLength(0);
  });
});