// src/engine/events/GameCommand.ts

import type { ResearchId } from "../research/types";
import type { SpecialBuilding } from "../settlements/types";
import type { ImprovementId } from "../improvements/types";
import type { LegacyId } from "../prestige/types";

/**
 * The five game actions in v0.3.
 *
 * Changes from v0.2.x:
 * - Removed: DevelopSettlement (merge mechanic is gone)
 * - Removed: UnlockTech (replaced by ResearchUpgrade)
 * - Added: ResearchUpgrade (research upgrades OR unlocks specialization)
 * - Added: SpecializeSettlement (lock a settlement for income)
 * - Added: BuyLand (expand land parcels)
 * - Added: Ascend (prestige system)
 */
export type GameCommand =
  | { type: "EstablishSettlement" }
  | { type: "ResearchUpgrade"; researchId: ResearchId }
  | {
      type: "SpecializeSettlement";
      settlementId: string;
      building: SpecialBuilding;
    }
  | { type: "UnspecializeSettlement"; settlementId: string }
  | { type: "BuyLand" }
  | { type: "PurchaseImprovement"; improvementId: ImprovementId }
  | { type: "AdvanceAge" }
  | { type: "Ascend"; legacy: LegacyId };