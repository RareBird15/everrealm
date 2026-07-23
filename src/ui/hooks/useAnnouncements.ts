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
 *
 * v1.1.0: Changed to announce ALL new story records since the last check,
 * not just records matching the current turn. This ensures expedition
 * return events (which fire on the old turn before the command increments
 * it) are announced alongside the command's own events.
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

    // Collect all new story records since the last check.
    // This includes both expedition/pre-turn events (old turn number)
    // and the command's events (new turn number).
    const newRecords = state.story.slice(prevStoryLen.current);

    prevTurn.current = state.turn;
    prevStoryLen.current = state.story.length;

    if (newRecords.length === 0) return;

    const newAnnouncements = newRecords.map((record) =>
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
    case "ExpeditionSent":
      return `Turn ${record.turn}: Pochteca departed for ${record.destination}. ${record.cost} Cacao invested.`;
    case "ExpeditionReturned":
      return `Turn ${record.turn}: Pochteca returned from ${record.destination}. They ${record.rewardDescription}.`;
    case "ExpeditionBonusExpired":
      return `Turn ${record.turn}: An expedition bonus has expired (${record.bonusType}).`;
  }
}