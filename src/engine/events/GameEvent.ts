// src/engine/events/GameEvent.ts

import type { AgeId } from "../ages/types";
import type { SettlementLevel } from "../settlements/types";
import type { Prosperity } from "../prosperity/types";
import type { ImprovementId } from "../improvements/types";

export type DevelopSource = "Player" | "ChainReaction";

export type ProsperitySource =
  | "Passive"
  | "Establish"
  | "Develop"
  | "ChainReaction"
  | "Discovery"
  | "AgeEntry"
  | "Improvement";

export type GameEvent =
  | {
      type: "SettlementEstablished";
      age: AgeId;
      level: SettlementLevel;
    }
  | { type: "ChainReactionStarted" }
  | {
      type: "SettlementDeveloped";
      age: AgeId;
      level: SettlementLevel;
      newLevel: SettlementLevel;
      source: DevelopSource;
    }
  | { type: "ChainReactionCompleted"; chainLength: number }
  | { type: "SettlementLevelDiscovered"; level: SettlementLevel }
  | {
      type: "ProsperityEarned";
      amount: Prosperity;
      source: ProsperitySource;
    }
  | { type: "ImprovementPurchased"; improvementId: ImprovementId }
  | { type: "AgeAdvanced"; fromAge: AgeId; toAge: AgeId }
  | { type: "CapacityReached" }
  | { type: "PassiveProsperityApplied"; amount: Prosperity }
  | { type: "TechUnlocked"; techId: import("../techtree/types").TechNodeId };