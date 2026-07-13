// src/ui/hooks/useAnnouncements.ts

import { useEffect, useRef, useState } from "react";
import type { GameState } from "../../engine/state/GameState";
import type { StoryRecord } from "../../engine/story/types";
import { getImprovement } from "../../engine/improvements/catalog";
import { getAge } from "../../engine/ages/definitions";
import { getTechNode } from "../../engine/techtree/definitions";

/**
 * Tracks the previous game state and announces events that occurred
 * between the previous and current state.
 *
 * The hook compares `state.turn` to detect when a new command has been
 * processed, then derives announcements from the story records for that
 * turn.
 *
 * Each announcement includes the turn number to ensure the live region
 * text changes between actions. Screen readers often do not re-announce
 * a polite live region when the content is identical to the previous
 * update, so repeating "Created Tent." twice in a row would be silently
 * skipped. Including the turn number makes each announcement unique.
 */
export function useAnnouncements(state: GameState): string[] {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const prevTurn = useRef(state.turn);

  useEffect(() => {
    if (state.turn === prevTurn.current) return;
    prevTurn.current = state.turn;

    const recentRecords = state.story.filter(
      (r) => r.turn === state.turn,
    );

    const newAnnouncements = recentRecords.map((record) =>
      announceRecord(record),
    );

    // Always set announcements (even empty) to clear the live region
    // so the next announcement is detected as a content change.
    setAnnouncements(newAnnouncements);
  }, [state]);

  return announcements;
}

function announceRecord(record: StoryRecord): string {
  switch (record.kind) {
    case "SettlementEstablished":
      return `Turn ${record.turn}: Created ${record.level}.`;
    case "SettlementLevelDiscovered":
      return `Turn ${record.turn}: Discovered ${record.level}.`;
    case "ImprovementPurchased": {
      const imp = getImprovement(record.improvementId);
      return `Turn ${record.turn}: ${imp?.name ?? "Improvement"} completed.`;
    }
    case "CapacityIncreased":
      return `Turn ${record.turn}: Settlement Capacity increased to ${record.newCapacity}.`;
    case "AgeAdvanced": {
      const age = getAge(record.age);
      return `Turn ${record.turn}: Welcome to ${age?.name ?? "the new Age"}.`;
    }
    case "TechUnlocked": {
      const tech = getTechNode(record.techId);
      return `Turn ${record.turn}: ${tech?.name ?? "New discovery"} unlocked.`;
    }
  }
}