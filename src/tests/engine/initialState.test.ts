import { describe, it, expect } from "vitest";
import { initialState, STARTING_CAPACITY, STARTING_PROSPERITY } from "../../engine/state/initialState";

describe("initialState", () => {
  it("creates a state with the Founding Age", () => {
    const state = initialState("Elderglen", 0);
    expect(state.age).toBe("FoundingAge");
  });

  it("creates a state with the realm name provided", () => {
    const state = initialState("Elderglen", 0);
    expect(state.realmName).toBe("Elderglen");
  });

  it("creates a state with starting Settlement Capacity", () => {
    const state = initialState("Elderglen", 0);
    expect(state.capacity).toBe(STARTING_CAPACITY);
    expect(STARTING_CAPACITY).toBe(20);
  });

  it("creates a state with starting Prosperity", () => {
    const state = initialState("Elderglen", 0);
    expect(state.prosperity).toBe(STARTING_PROSPERITY);
    expect(STARTING_PROSPERITY).toBe(30);
  });

  it("creates a state with no settlements", () => {
    const state = initialState("Elderglen", 0);
    expect(state.settlements).toHaveLength(0);
  });

  it("creates a state with the provided timestamp as lastUpdate", () => {
    const state = initialState("Elderglen", 12345);
    expect(state.lastUpdate).toBe(12345);
  });

  it("creates a state with version 1", () => {
    const state = initialState("Elderglen", 0);
    expect(state.version).toBe(1);
  });

  it("creates a state with turn 0", () => {
    const state = initialState("Elderglen", 0);
    expect(state.turn).toBe(0);
  });
});