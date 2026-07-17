// src/engine/cacao/types.ts

/**
 * Cacao is the primary game currency.
 *
 * In Mesoamerica, cacao beans were used as currency. The name grounds the
 * economy in the setting while being a simple, recognizable word for screen
 * readers.
 *
 * Cacao is earned passively (based on settlement tiers and specializations)
 * and actively (through research, discoveries, and Age advancement).
 * It is spent to establish settlements, research upgrades, buy land,
 * purchase realm improvements, and advance Ages.
 */
export type Cacao = number;

/** Brand type for clarity in function signatures. */
export type CacaoAmount = number;