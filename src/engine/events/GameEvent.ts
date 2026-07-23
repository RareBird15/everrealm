// src/engine/events/GameEvent.ts

import type { StandardLevel, SpecialBuilding } from "../settlements/types";
import type { AgeId } from "../ages/types";
import type { LegacyId } from "../prestige/types";

/**
 * Game events in v0.3.
 *
 * Events are structured data (not prose) that get rendered into
 * human-readable text by the story system.
 *
 * Changes from v0.2.x:
 * - Removed: ChainReactionStarted, ChainReactionCompleted, SettlementDeveloped, SettlementLevelDiscovered, PassiveProsperityApplied
 * - Added: SettlementsUpgraded, SpecializationUnlocked, ResearchCompleted, LandPurchased, SettlementSpecialized, Ascended
 * - Renamed: ProsperityEarned → CacaoEarned
 */
export type GameEvent =
  | {
      type: "SettlementEstablished";
      turn: number;
      settlementTier: StandardLevel;
      cost: number;
      reward: number;
    }
  | {
      type: "SettlementsUpgraded";
      turn: number;
      fromTier: StandardLevel;
      toTier: StandardLevel;
      researchName: string;
    }
  | {
      type: "SpecializationUnlocked";
      turn: number;
      building: SpecialBuilding;
      researchName: string;
    }
  | {
      type: "ResearchCompleted";
      turn: number;
      researchName: string;
      cost: number;
      discoveryReward: number;
      canAdvanceAge: boolean;
    }
  | {
      type: "SettlementSpecialized";
      turn: number;
      settlementId: string;
      building: SpecialBuilding;
    }
  | {
      type: "LandPurchased";
      turn: number;
      parcels: number;
      cost: number;
    }
  | {
      type: "ImprovementPurchased";
      turn: number;
      improvementName: string;
      cost: number;
    }
  | {
      type: "AgeAdvanced";
      turn: number;
      fromAge: AgeId;
      toAge: AgeId;
      reward: number;
    }
  | {
      type: "Ascended";
      turn: number;
      legacy: LegacyId;
      ascensionCount: number;
    }
  | {
      type: "CacaoEarned";
      turn: number;
      amount: number;
      source: string;
    }
  | {
      type: "ExpeditionSent";
      turn: number;
      destination: string;
      cost: number;
      turnsToComplete: number;
    }
  | {
      type: "ExpeditionReturned";
      turn: number;
      destination: string;
      reward: string;
      rewardDescription: string;
    }
  | {
      type: "ExpeditionBonusExpired";
      turn: number;
      bonusType: string;
    }
  | {
      type: "Error";
      turn: number;
      message: string;
    };