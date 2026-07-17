// src/engine/improvements/types.ts

/**
 * Realm improvement IDs.
 * The improvements system is being updated for v0.3.
 * This type exists so GameState and GameCommand can reference it.
 */
export type ImprovementId = string & { readonly __brand: "ImprovementId" };