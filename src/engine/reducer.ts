// src/engine/reducer.ts

import type { GameState } from "./state/GameState";
import type { GameCommand } from "./events/GameCommand";
import type { GameEvent } from "./events/GameEvent";
import type { Result } from "../shared/types";
import { executeCommand } from "./commands";

/**
 * Internal dispatch from command to handler.
 *
 * This is a thin wrapper around `executeCommand` that exists for
 * architectural separation — the reducer is the internal entry point,
 * while `executeCommand` is the public API that handles passive prosperity
 * and turn incrementing.
 */
export function reducer(
  state: GameState,
  command: GameCommand,
  now: number,
): Result<{ state: GameState; events: GameEvent[] }> {
  return executeCommand(state, command, now);
}