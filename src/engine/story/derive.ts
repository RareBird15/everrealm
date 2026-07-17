// src/engine/story/derive.ts

import type { GameEvent } from "../events/GameEvent";
import type { StoryRecord } from "./types";

/**
 * Derives StoryRecords from a list of GameEvents.
 *
 * Story records are structured domain data, not prose. The UI decides
 * how to present them.
 */
export function deriveStoryRecords(
  events: readonly GameEvent[],
): StoryRecord[] {
  const records: StoryRecord[] = [];

  for (const event of events) {
    switch (event.type) {
      case "SettlementEstablished":
        records.push({
          kind: "SettlementEstablished",
          turn: event.turn,
          tier: event.settlementTier,
        });
        break;
      case "SettlementsUpgraded":
        records.push({
          kind: "SettlementsUpgraded",
          turn: event.turn,
          fromTier: event.fromTier,
          toTier: event.toTier,
          researchName: event.researchName,
        });
        break;
      case "SpecializationUnlocked":
        records.push({
          kind: "SpecializationUnlocked",
          turn: event.turn,
          building: event.building,
          researchName: event.researchName,
        });
        break;
      case "ResearchCompleted":
        records.push({
          kind: "ResearchCompleted",
          turn: event.turn,
          researchName: event.researchName,
        });
        break;
      case "SettlementSpecialized":
        records.push({
          kind: "SettlementSpecialized",
          turn: event.turn,
          building: event.building,
        });
        break;
      case "LandPurchased":
        records.push({
          kind: "LandPurchased",
          turn: event.turn,
          cost: event.cost,
        });
        break;
      case "AgeAdvanced":
        records.push({
          kind: "AgeAdvanced",
          turn: event.turn,
          fromAge: event.fromAge,
          toAge: event.toAge,
        });
        break;
      case "Ascended":
        records.push({
          kind: "Ascended",
          turn: event.turn,
          legacy: event.legacy,
          ascensionCount: event.ascensionCount,
        });
        break;
      case "CacaoEarned":
        records.push({
          kind: "CacaoEarned",
          turn: event.turn,
          amount: event.amount,
          source: event.source,
        });
        break;
      case "Error":
        // Errors don't produce story records
        break;
      case "ImprovementPurchased":
        // TODO: Will be implemented with improvements system
        break;
    }
  }

  return records;
}