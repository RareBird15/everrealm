// src/engine/events/GameError.ts

import type { Prosperity } from "../prosperity/types";
import type { SettlementLevel } from "../settlements/types";
import type { AgeId } from "../ages/types";
import type { ImprovementId } from "../improvements/types";

export type GameError =
  | {
      type: "InsufficientProsperity";
      cost: Prosperity;
      available: Prosperity;
    }
  | { type: "SettlementCapacityFull"; capacity: number; current: number }
  | {
      type: "NoEligibleSettlements";
      age: AgeId;
      level: SettlementLevel;
    }
  | { type: "ImprovementNotFound"; improvementId: ImprovementId }
  | {
      type: "ImprovementAlreadyPurchased";
      improvementId: ImprovementId;
    }
  | {
      type: "AgeAdvancementNotAvailable";
      currentAge: AgeId;
      citadelCount: number;
    }
  | { type: "InvalidAgeOrLevel"; age: AgeId; level: SettlementLevel }
  | { type: "TechNotFound"; techId: import("../techtree/types").TechNodeId }
  | { type: "TechAlreadyUnlocked"; techId: import("../techtree/types").TechNodeId }
  | { type: "TechPrerequisitesNotMet"; techId: import("../techtree/types").TechNodeId }
  | { type: "BuildingNotUnlocked"; building: SettlementLevel }
  | { type: "SourceLevelTooLow"; building: SettlementLevel; sourceLevel: SettlementLevel; minimumLevel: SettlementLevel }
  | { type: "TechNotAvailableForAge"; techId: import("../techtree/types").TechNodeId; currentAge: AgeId }
  | { type: "ImprovementNotAvailableForAge"; improvementId: ImprovementId; currentAge: AgeId };