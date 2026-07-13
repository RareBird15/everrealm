// src/shared/types.ts

import type { GameError } from "../engine/events/GameError";

/**
 * Result type for engine operations.
 *
 * Engine operations never throw on invalid game actions.
 * They return a Result so the UI can present a message.
 */
export type Result<T, E = GameError> =
  | { success: true; value: T }
  | { success: false; error: E };