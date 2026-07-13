// src/accessibility/announcements.ts

import type { GameEvent } from "../engine/events/GameEvent";
import { getImprovement } from "../engine/improvements/catalog";
import { getAge } from "../engine/ages/definitions";

/**
 * Converts a structured GameEvent into a screen-reader announcement string.
 *
 * Returns null for events that should not be announced individually
 * (e.g. passive prosperity is announced via PassiveProsperityApplied,
 * not ProsperityEarned).
 *
 * Announcement patterns follow the spec:
 * - "Created House."
 * - "Chain reaction."
 * - "Welcome to the Golden Age."
 * - "Realm Improvement completed."
 * - "Settlement Capacity reached."
 */
export function announce(event: GameEvent): string | null {
  switch (event.type) {
    case "SettlementEstablished":
      return `Created ${event.level}.`;

    case "SettlementDeveloped": {
      if (event.source === "ChainReaction") {
        // The "Chain reaction." announcement is handled by
        // ChainReactionStarted. Here we just announce the creation.
        return `Created ${event.newLevel}.`;
      }
      return `Created ${event.newLevel}.`;
    }

    case "ChainReactionStarted":
      return "Chain reaction.";

    case "ChainReactionCompleted":
      // The chain length is announced as part of the individual
      // SettlementDeveloped events. No separate announcement needed.
      return null;

    case "SettlementLevelDiscovered":
      return `Discovered ${event.level}.`;

    case "ProsperityEarned": {
      // Only announce active rewards, not passive (passive is announced
      // via PassiveProsperityApplied to avoid double-announcing).
      if (event.source === "Passive") return null;
      return `Earned ${event.amount} Prosperity.`;
    }

    case "ImprovementPurchased": {
      const improvement = getImprovement(event.improvementId);
      const name = improvement?.name ?? "Improvement";
      return `${name} completed.`;
    }

    case "AgeAdvanced": {
      const age = getAge(event.toAge);
      const name = age?.name ?? "new Age";
      return `Welcome to the ${name}.`;
    }

    case "CapacityReached":
      return "Settlement Capacity reached.";

    case "PassiveProsperityApplied":
      return `Earned ${event.amount} Prosperity.`;

    default:
      return null;
  }
}

/**
 * Converts a list of GameEvents into announcement strings,
 * filtering out nulls.
 */
export function announceEvents(events: readonly GameEvent[]): string[] {
  return events.map(announce).filter((a): a is string => a !== null);
}