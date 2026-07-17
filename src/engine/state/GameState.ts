// src/engine/state/GameState.ts

import type { AgeId } from "../ages/types";
import type { Cacao } from "../cacao/types";
import type { Settlement } from "../settlements/types";
import type { ResearchId } from "../research/types";
import type { ImprovementId } from "../improvements/types";
import type { StoryRecord } from "../story/types";
import type { PrestigeState } from "../prestige/types";

/**
 * The complete game state for Everrealm v0.3.
 *
 * Key changes from v0.2.x:
 * - Settlements are individual entities (not stacks for merging)
 * - Capacity replaced by landParcels (physical, expandable)
 * - Prosperity renamed to Cacao
 * - unlockedTechs renamed to completedResearch
 * - Prestige state added
 * - baseTier tracks the current settlement tier from research
 */
export interface GameState {
  readonly version: number;
  readonly realmName: string;
  readonly age: AgeId;

  /** Individual settlements, each on its own land parcel. */
  readonly settlements: readonly Settlement[];

  /** Realm improvements purchased. */
  readonly improvements: readonly ImprovementId[];

  /** Cacao currency — earned passively and through actions. */
  readonly cacao: Cacao;

  /** Land parcels — each settlement occupies one. Expandable through research. */
  readonly landParcels: number;

  /**
   * Research completed by the player.
   * Settlement upgrades and specializations are permanent across Ages.
   */
  readonly completedResearch: readonly ResearchId[];

  /**
   * The current base tier for new settlements.
   * Determined by how many settlement upgrade researches the player has completed.
   * New settlements are always established at this tier.
   */
  readonly baseTier: import("../settlements/types").StandardLevel;

  /** Story records — structured, derived from events. */
  readonly story: readonly StoryRecord[];

  /** Increments per player action. */
  readonly turn: number;

  /** Unix timestamp (ms) for passive cacao calculation. */
  readonly lastUpdate: number;

  /** Prestige state — legacies carried from previous playthroughs. */
  readonly prestige: PrestigeState;
}