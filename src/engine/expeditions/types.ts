// src/engine/expeditions/types.ts

/**
 * Pochteca Expeditions — a new action added in v1.1.0.
 *
 * The player spends Cacao to send long-distance merchants (pochteca) to
 * a destination. After a set number of turns, the expedition returns
 * with a reward. The player chooses the destination, weighing cost,
 * travel time, and potential reward.
 *
 * Destinations unlock by Age — more distant and rewarding destinations
 * become available as the realm advances.
 */

/** Identifies a pochteca expedition destination. */
export type ExpeditionDestinationId =
  | "lowlandForests"
  | "highlandQuarries"
  | "coastalPorts"
  | "mountainPasses"
  | "distantKingdoms"
  | "jungleTradeRoutes"
  | "mythicLands"
  | "spiritRealm";

/** The kind of bonus an expedition can grant on return. */
export type ExpeditionBonusType =
  | "production" // Multiplies cacaoPerTurn
  | "research_discount" // Reduces research costs
  | "income_flat"; // Flat cacao per turn

/** A temporary bonus granted by a returned expedition. */
export interface ExpeditionBonus {
  readonly id: string;
  readonly type: ExpeditionBonusType;
  /** Magnitude: percentage for production/research_discount, flat for income_flat. */
  readonly magnitude: number;
  /** Turns remaining before this bonus expires. */
  readonly turnsRemaining: number;
  /** Human-readable description for the UI. */
  readonly description: string;
}

/** An expedition currently traveling. */
export interface PendingExpedition {
  readonly id: string;
  readonly destination: ExpeditionDestinationId;
  readonly turnsRemaining: number;
  readonly cost: number;
  readonly sentTurn: number;
}

/** An expedition that has returned, kept for chronicle generation. */
export interface CompletedExpedition {
  readonly destination: ExpeditionDestinationId;
  readonly sentTurn: number;
  readonly returnedTurn: number;
  readonly rewardDescription: string;
}

/** One possible reward from a destination's reward pool. */
export interface ExpeditionRewardOption {
  /** The bonus type granted if this reward is selected. */
  readonly type: ExpeditionBonusType;
  /** Magnitude of the bonus. */
  readonly magnitude: number;
  /** Duration in turns for temporary bonuses (0 for instant effects). */
  readonly duration: number;
  /** Human-readable description shown to the player. */
  readonly description: string;
  /** If true, this is a lump-sum cacao reward, not a temporary bonus. */
  readonly isLumpSum?: boolean;
  /** If true, this grants land parcels instead of a bonus. */
  readonly isLand?: boolean;
  /** Number of land parcels granted (only if isLand is true). */
  readonly landAmount?: number;
  /** Amount of cacao granted (only if isLumpSum is true). */
  readonly cacaoAmount?: number;
}

/** A destination definition. */
export interface ExpeditionDestination {
  readonly id: ExpeditionDestinationId;
  readonly name: string;
  readonly description: string;
  /** Minimum Age index required to access this destination. */
  readonly minAgeIndex: number;
  readonly cost: number;
  readonly turns: number;
  /** Two possible rewards, each chosen with 50% probability. */
  readonly rewards: readonly [ExpeditionRewardOption, ExpeditionRewardOption];
}

/** Maximum number of concurrent expeditions. */
export const MAX_CONCURRENT_EXPEDITIONS = 2;