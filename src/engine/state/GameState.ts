// src/engine/state/GameState.ts

import type { AgeId } from "../ages/types";
import type { SettlementStack, SettlementLevel } from "../settlements/types";
import type { Prosperity } from "../prosperity/types";
import type { ImprovementId } from "../improvements/types";
import type { StoryRecord } from "../story/types";

export interface GameState {
  readonly version: number;
  readonly realmName: string;
  readonly age: AgeId;

  /** Settlements grouped as stacks, keyed by (age, level). */
  readonly settlements: readonly SettlementStack[];

  readonly improvements: readonly ImprovementId[];
  readonly prosperity: Prosperity;
  readonly capacity: number;

  /** Tech tree nodes unlocked by the player (permanent across Ages). */
  readonly unlockedTechs: readonly (import("../techtree/types").TechNodeId)[];

  /** Unix timestamp (ms) for passive prosperity calculation. */
  readonly lastUpdate: number;

  /**
   * Settlement levels discovered globally across the realm.
   * Not per-Age — if a level is discovered in one Age, it is discovered
   * in all Ages.
   */
  readonly discoveredLevels: readonly SettlementLevel[];

  /** Story records — structured, derived from events, not prose. */
  readonly story: readonly StoryRecord[];

  /** Increments per player action. */
  readonly turn: number;
}