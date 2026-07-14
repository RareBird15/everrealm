// src/engine/story/derive.ts

import type { GameEvent } from "../events/GameEvent";
import type { StoryRecord } from "./types";
import { TECH_NODES } from "../techtree/definitions";
import { IMPROVEMENTS } from "../improvements/catalog";

/**
 * Derives StoryRecords from a list of GameEvents.
 *
 * Story records are structured domain data, not prose. The UI decides
 * how to present them.
 *
 * Not every GameEvent produces a StoryRecord — only meaningful milestones
 * are recorded (establishments, discoveries, improvements, capacity increases,
 * age advancements).
 */
export function deriveStoryRecords(
  events: readonly GameEvent[],
  turn: number,
): StoryRecord[] {
  const records: StoryRecord[] = [];

  for (const event of events) {
    switch (event.type) {
      case "SettlementEstablished":
        records.push({
          kind: "SettlementEstablished",
          turn,
          level: event.level,
        });
        break;
      case "SettlementDeveloped":
        records.push({
          kind: "SettlementDeveloped",
          turn,
          fromLevel: event.level,
          toLevel: event.newLevel,
          source: event.source,
        });
        break;
      case "SettlementLevelDiscovered":
        records.push({
          kind: "SettlementLevelDiscovered",
          turn,
          level: event.level,
        });
        break;
      case "ImprovementPurchased":
        records.push({
          kind: "ImprovementPurchased",
          turn,
          improvementId: event.improvementId,
        });
        break;
      case "AgeAdvanced": {
        const newTechs = TECH_NODES.filter(
          (n) => n.availableFromAge === event.toAge,
        ).map((n) => n.id);
        const newImprovements = IMPROVEMENTS.filter(
          (i) => i.availableFromAge === event.toAge,
        ).map((i) => i.id);
        records.push({
          kind: "AgeAdvanced",
          turn,
          age: event.toAge,
          newTechsAvailable: newTechs,
          newImprovementsAvailable: newImprovements,
        });
        break;
      }
      case "TechUnlocked":
        records.push({
          kind: "TechUnlocked",
          turn,
          techId: event.techId,
        });
        break;
      // ProsperityEarned, ChainReactionStarted, etc. do not produce
      // story records — they're too frequent to be historical milestones.
      default:
        break;
    }
  }

  return records;
}

/**
 * Derives a CapacityIncreased story record when capacity changes.
 * Called separately because capacity changes are computed in the
 * dispatcher, not emitted as GameEvents directly.
 */
export function capacityIncreasedRecord(
  turn: number,
  newCapacity: number,
): StoryRecord {
  return { kind: "CapacityIncreased", turn, newCapacity };
}