// src/ui/hooks/useAnnouncements.ts

import { useEffect, useRef, useState } from "react";
import type { GameState } from "../../engine/state/GameState";
import type { StoryRecord } from "../../engine/story/types";
import { getAge } from "../../engine/ages/definitions";
import { getLegacy } from "../../engine/prestige/definitions";

/**
 * Tracks the previous game state and announces events that occurred
 * between the previous and current state.
 *
 * Each announcement includes the turn number for uniqueness so screen
 * readers re-announce even if the text is similar.
 *
 * The hook compares state.turn and state.story.length to detect when
 * a new command has been processed.
 */
export function useAnnouncements(state: GameState): string[] {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const prevTurn = useRef(state.turn);
  const prevStoryLen = useRef(state.story.length);

  useEffect(() => {
    // Skip if turn hasn't changed (no new action was taken)
    if (state.turn === prevTurn.current) return;

    // Also check if story actually grew (defensive check)
    if (state.story.length <= prevStoryLen.current) {
      prevTurn.current = state.turn;
      return;
    }

    prevTurn.current = state.turn;
    prevStoryLen.current = state.story.length;

    // Find all story records from the current turn
    const recentRecords = state.story.filter(
      (r) => r.turn === state.turn,
    );

    // If no records match the current turn, try the previous turn
    // (passive income events use the old turn number)
    if (recentRecords.length === 0) {
      const prevTurnRecords = state.story.filter(
        (r) => r.turn === state.turn - 1,
      );
      if (prevTurnRecords.length > 0) {
        const newAnnouncements = prevTurnRecords
          .slice(prevTurnRecords.length > 1 ? prevTurnRecords.length - 1 : 0)
          .map((record) => announceRecord(record));
        setAnnouncements(newAnnouncements);
      }
      return;
    }

    const newAnnouncements = recentRecords.map((record) =>
      announceRecord(record),
    );

    setAnnouncements(newAnnouncements);
  }, [state]);

  return announcements;
}

function announceRecord(record: StoryRecord): string {
  switch (record.kind) {
    case "SettlementEstablished":
      return `Turn ${record.turn}: Established a ${record.tier}.`;
    case "SettlementsUpgraded":
      return `Turn ${record.turn}: All ${record.fromTier}s upgraded to ${record.toTier}s. ${record.researchName}.`;
    case "SpecializationUnlocked":
      return `Turn ${record.turn}: ${record.building} unlocked. ${record.researchName}.`;
    case "ResearchCompleted":
      return `Turn ${record.turn}: ${record.researchName} researched.`;
    case "SettlementSpecialized":
      return `Turn ${record.turn}: Settlement specialized as ${record.building}.`;
    case "LandPurchased":
      return `Turn ${record.turn}: Land parcel purchased for ${record.cost} Cacao.`;
    case "AgeAdvanced": {
      const age = getAge(record.toAge);
      return `Turn ${record.turn}: Welcome to ${age?.name ?? "the new Age"}.`;
    }
    case "Ascended": {
      const legacy = getLegacy(record.legacy);
      return `Turn ${record.turn}: Ascended! Legacy: ${legacy?.name ?? record.legacy}.`;
    }
    case "CacaoEarned":
      return `+${record.amount} Cacao from ${record.source}.`;
  }
}