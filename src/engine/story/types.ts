// src/engine/story/types.ts

import type { SettlementLevel } from "../settlements/types";
import type { ImprovementId } from "../improvements/types";
import type { AgeId } from "../ages/types";

export type StoryRecord =
  | {
      kind: "SettlementEstablished";
      turn: number;
      level: SettlementLevel;
    }
  | {
      kind: "SettlementLevelDiscovered";
      turn: number;
      level: SettlementLevel;
    }
  | {
      kind: "ImprovementPurchased";
      turn: number;
      improvementId: ImprovementId;
    }
  | { kind: "CapacityIncreased"; turn: number; newCapacity: number }
  | { kind: "AgeAdvanced"; turn: number; age: AgeId }
  | { kind: "TechUnlocked"; turn: number; techId: import("../techtree/types").TechNodeId };