// src/engine/story/types.ts

import type { StandardLevel, SpecialBuilding } from "../settlements/types";
import type { AgeId } from "../ages/types";
import type { LegacyId } from "../prestige/types";

/**
 * Story records are structured domain data, not prose.
 * The UI decides how to present them.
 */
export type StoryRecord =
  | {
      kind: "SettlementEstablished";
      turn: number;
      tier: StandardLevel;
    }
  | {
      kind: "SettlementsUpgraded";
      turn: number;
      fromTier: StandardLevel;
      toTier: StandardLevel;
      researchName: string;
    }
  | {
      kind: "SpecializationUnlocked";
      turn: number;
      building: SpecialBuilding;
      researchName: string;
    }
  | {
      kind: "ResearchCompleted";
      turn: number;
      researchName: string;
    }
  | {
      kind: "SettlementSpecialized";
      turn: number;
      building: SpecialBuilding;
    }
  | {
      kind: "LandPurchased";
      turn: number;
      cost: number;
    }
  | {
      kind: "AgeAdvanced";
      turn: number;
      fromAge: AgeId;
      toAge: AgeId;
    }
  | {
      kind: "Ascended";
      turn: number;
      legacy: LegacyId;
      ascensionCount: number;
    }
  | {
      kind: "CacaoEarned";
      turn: number;
      amount: number;
      source: string;
    }
  | {
      kind: "ExpeditionSent";
      turn: number;
      destination: string;
      cost: number;
    }
  | {
      kind: "ExpeditionReturned";
      turn: number;
      destination: string;
      rewardDescription: string;
    }
  | {
      kind: "ExpeditionBonusExpired";
      turn: number;
      bonusType: string;
    };