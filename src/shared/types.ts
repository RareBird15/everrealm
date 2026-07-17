// src/shared/types.ts

/**
 * Result type for engine operations.
 *
 * Engine operations never throw on invalid game actions.
 * They return a Result so the UI can present a message.
 */
export type Result<T, E = string> =
  | { success: true; value: T }
  | { success: false; error: E };