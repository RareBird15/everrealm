// src/engine/events/GameCommand.ts

import type { AgeId } from "../ages/types";
import type { SettlementLevel } from "../settlements/types";
import type { ImprovementId } from "../improvements/types";
import type { TechNodeId } from "../techtree/types";

export type GameCommand =
  | { type: "EstablishSettlement" }
  | {
      type: "DevelopSettlement";
      age: AgeId;
      level: SettlementLevel;
      /** What to develop into. Defaults to nextLevel if not specified. */
      target?: SettlementLevel;
    }
  | { type: "PurchaseImprovement"; improvementId: ImprovementId }
  | { type: "AdvanceAge" }
  | { type: "UnlockTech"; techId: TechNodeId };