// src/engine/ages/advance.ts

import type { GameState } from "../state/GameState";
import { nextAge, getAge } from "./definitions";
import { canAdvanceAge } from "../research/definitions";
import type { GameEvent } from "../events/GameEvent";

/** Cacao reward for advancing to a new Age. */
export const AGE_ADVANCE_REWARD = 100;

/**
 * Advances the realm to the next Age.
 * Requires the top-tier technology for the current Age to be researched.
 */
export function advanceAge(state: GameState): {
  state: GameState;
  events: GameEvent[];
} {
  const next = nextAge(state.age);
  if (!next) throw new Error("You are already in the final Age.");

  if (!canAdvanceAge(state.age, state.completedResearch))
    throw new Error(
      "You must complete the top-tier research for your current Age before advancing.",
    );

  return {
    state: {
      ...state,
      age: next.id,
      cacao: state.cacao + AGE_ADVANCE_REWARD,
      turn: state.turn + 1,
    },
    events: [
      {
        type: "AgeAdvanced",
        turn: state.turn + 1,
        fromAge: state.age,
        toAge: next.id,
        reward: AGE_ADVANCE_REWARD,
      },
    ],
  };
}