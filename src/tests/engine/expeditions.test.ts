// src/tests/engine/expeditions.test.ts

import { describe, it, expect } from "vitest";
import { createInitialState } from "../../engine/state/initialState";
import { reducer } from "../../engine/reducer";
import { canSendExpedition } from "../../engine/expeditions/sendExpedition";
import { destinationsForAge, getDestination } from "../../engine/expeditions/definitions";
import { MAX_CONCURRENT_EXPEDITIONS } from "../../engine/expeditions/types";
import { generateChronicle } from "../../engine/story/generateChronicle";
import type { GameState } from "../../engine/state/GameState";

/** Creates a state in the Age of Growth with enough Cacao for expeditions. */
function growthState(cacao = 500): GameState {
  let state = createInitialState("Test Realm");
  state = { ...state, cacao, age: "AgeOfGrowth" };
  return state;
}

describe("Pochteca Expeditions", () => {
  describe("canSendExpedition", () => {
    it("returns false in Founding Age (no destinations available)", () => {
      const state = createInitialState("Test Realm");
      expect(canSendExpedition(state, "lowlandForests")).toBe(false);
    });

    it("returns true in Age of Growth with enough Cacao", () => {
      const state = growthState(500);
      expect(canSendExpedition(state, "lowlandForests")).toBe(true);
    });

    it("returns false when not enough Cacao", () => {
      const state = growthState(10);
      expect(canSendExpedition(state, "lowlandForests")).toBe(false);
    });

    it("returns false when too many pending expeditions", () => {
      let state = growthState(2000);
      // Send 2 expeditions (the max)
      state = reducer(state, { type: "SendExpedition", destination: "lowlandForests" }).state;
      state = reducer(state, { type: "SendExpedition", destination: "highlandQuarries" }).state;
      expect(state.pendingExpeditions.length).toBe(MAX_CONCURRENT_EXPEDITIONS);
      expect(canSendExpedition(state, "lowlandForests")).toBe(false);
    });
  });

  describe("sendExpedition", () => {
    it("spends Cacao and creates a pending expedition", () => {
      const state = growthState(500);
      const dest = getDestination("lowlandForests")!;
      const { state: newState, events } = reducer(state, {
        type: "SendExpedition",
        destination: "lowlandForests",
      });

      expect(newState.pendingExpeditions).toHaveLength(1);
      expect(newState.pendingExpeditions[0]?.destination).toBe("lowlandForests");
      expect(newState.pendingExpeditions[0]?.turnsRemaining).toBe(dest.turns);
      expect(newState.cacao).toBeLessThan(state.cacao);
      expect(events).toContainEqual(
        expect.objectContaining({ type: "ExpeditionSent" }),
      );
    });

    it("increments the turn counter", () => {
      const state = growthState(500);
      const { state: newState } = reducer(state, {
        type: "SendExpedition",
        destination: "lowlandForests",
      });
      expect(newState.turn).toBe(state.turn + 1);
    });

    it("fails when not enough Cacao", () => {
      const state = growthState(10);
      const { events } = reducer(state, {
        type: "SendExpedition",
        destination: "lowlandForests",
      });
      expect(events).toContainEqual(
        expect.objectContaining({ type: "Error" }),
      );
    });

    it("fails when at max concurrent expeditions", () => {
      let state = growthState(2000);
      state = reducer(state, { type: "SendExpedition", destination: "lowlandForests" }).state;
      state = reducer(state, { type: "SendExpedition", destination: "highlandQuarries" }).state;
      const { events } = reducer(state, {
        type: "SendExpedition",
        destination: "lowlandForests",
      });
      expect(events).toContainEqual(
        expect.objectContaining({ type: "Error" }),
      );
    });
  });

  describe("expedition resolution", () => {
    it("ticks down turns remaining on each action", () => {
      let state = growthState(500);
      state = reducer(state, { type: "SendExpedition", destination: "lowlandForests" }).state;
      const initialTurns = state.pendingExpeditions[0]?.turnsRemaining ?? 0;

      // Do a different action (establish settlement) to tick the turn
      state = { ...state, cacao: 500 };
      state = reducer(state, { type: "EstablishSettlement" }).state;

      expect(state.pendingExpeditions[0]?.turnsRemaining).toBe(initialTurns - 1);
    });

    it("resolves after the required number of turns", () => {
      let state = growthState(5000);
      state = reducer(state, { type: "SendExpedition", destination: "lowlandForests" }).state;
      const dest = getDestination("lowlandForests")!;
      const turns = dest.turns;

      // The send action itself doesn't tick (no pending expedition exists yet).
      // Each subsequent action ticks turnsRemaining by 1.
      // So we need exactly `turns` more actions to resolve.
      for (let i = 0; i < turns; i++) {
        state = { ...state, cacao: 5000 };
        state = reducer(state, { type: "BuyLand" }).state;
      }

      // The expedition should have resolved by now
      expect(state.pendingExpeditions).toHaveLength(0);
      expect(state.completedExpeditions).toHaveLength(1);
      expect(state.completedExpeditions[0]?.destination).toBe("lowlandForests");
    });

    it("emits ExpeditionReturned event when resolving", () => {
      let state = growthState(5000);
      const { state: afterSend } = reducer(state, { type: "SendExpedition", destination: "lowlandForests" });
      const dest = getDestination("lowlandForests")!;

      let currentState = afterSend;
      for (let i = 0; i < dest.turns; i++) {
        currentState = { ...currentState, cacao: 5000 };
        const result = reducer(currentState, { type: "BuyLand" });
        currentState = result.state;
        // Check if the return event appeared
        const returnedEvent = result.events.find((e) => e.type === "ExpeditionReturned");
        if (returnedEvent) {
          expect(returnedEvent).toEqual(
            expect.objectContaining({ type: "ExpeditionReturned" }),
          );
          return;
        }
      }
      // If we didn't find it, something is wrong
      expect.fail("ExpeditionReturned event was not emitted");
    });
  });

  describe("destination availability", () => {
    it("has 0 destinations in Founding Age", () => {
      expect(destinationsForAge(0)).toHaveLength(0);
    });

    it("has 2 destinations in Age of Growth", () => {
      expect(destinationsForAge(1)).toHaveLength(2);
    });

    it("has 4 destinations in Age of City-States", () => {
      expect(destinationsForAge(2)).toHaveLength(4);
    });

    it("has 8 destinations in Age of Myths", () => {
      expect(destinationsForAge(5)).toHaveLength(8);
    });
  });

  describe("story records", () => {
    it("records expedition sent in story", () => {
      const state = growthState(500);
      const { state: newState } = reducer(state, {
        type: "SendExpedition",
        destination: "lowlandForests",
      });
      expect(newState.story).toContainEqual(
        expect.objectContaining({ kind: "ExpeditionSent" }),
      );
    });
  });
});

describe("Realm Chronicle", () => {
  it("generates a non-empty chronicle", () => {
    const state = createInitialState("Anahuac");
    const chronicle = generateChronicle(state, "EternalPyramid");
    expect(chronicle.length).toBeGreaterThan(100);
    expect(chronicle).toContain("Anahuac");
  });

  it("includes the realm name", () => {
    const state = createInitialState("Tollan");
    const chronicle = generateChronicle(state, "EternalPyramid");
    expect(chronicle).toContain("Tollan");
  });

  it("mentions expeditions when completed expeditions exist", () => {
    let state = growthState(5000);
    state = reducer(state, { type: "SendExpedition", destination: "lowlandForests" }).state;
    const dest = getDestination("lowlandForests")!;
    for (let i = 0; i < dest.turns; i++) {
      state = { ...state, cacao: 5000 };
      state = reducer(state, { type: "BuyLand" }).state;
    }
    const chronicle = generateChronicle(state, "EternalPyramid");
    expect(chronicle.toLowerCase()).toContain("pochteca");
  });

  it("is under 500 words", () => {
    const state = createInitialState("LongNameRealm");
    const chronicle = generateChronicle(state, "EternalPyramid");
    const wordCount = chronicle.split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(502); // 500 + "..."
  });

  it("is deterministic — same state produces same chronicle", () => {
    const state = createInitialState("TestRealm");
    const chronicle1 = generateChronicle(state, "EternalPyramid");
    const chronicle2 = generateChronicle(state, "EternalPyramid");
    expect(chronicle1).toBe(chronicle2);
  });

  it("includes the legacy name when legacyId is provided", () => {
    const state = createInitialState("TestRealm");
    const chronicle = generateChronicle(state, "EternalPyramid");
    expect(chronicle).toContain("Eternal Pyramid");
  });
});