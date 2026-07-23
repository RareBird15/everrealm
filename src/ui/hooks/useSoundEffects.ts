// src/ui/hooks/useSoundEffects.ts

import { useEffect, useRef } from "react";
import type { GameState } from "../../engine/state/GameState";
import type { StoryRecord } from "../../engine/story/types";
import { playSound, type SoundEvent } from "../sounds";

/**
 * Watches for new story records and plays the matching sound.
 *
 * Mirrors the logic in useAnnouncements: detects when the turn
 * advances and story records grow, then maps each record kind
 * to a SoundEvent.
 *
 * CacaoEarned records are ignored (too frequent, would be noisy).
 * SpecializationUnlocked and SettlementSpecialized are both mapped
 * to their own sounds.
 */
export function useSoundEffects(state: GameState): void {
  const prevTurn = useRef(state.turn);
  const prevStoryLen = useRef(state.story.length);

  useEffect(() => {
    // Skip if no new action
    if (state.turn === prevTurn.current) return;
    if (state.story.length <= prevStoryLen.current) {
      prevTurn.current = state.turn;
      return;
    }

    prevTurn.current = state.turn;
    prevStoryLen.current = state.story.length;

    // Find story records from the current turn
    const recentRecords = state.story.filter(
      (r) => r.turn === state.turn,
    );

    // If none match, try previous turn (passive income events)
    const recordsToPlay =
      recentRecords.length > 0
        ? recentRecords
        : state.story.filter((r) => r.turn === state.turn - 1);

    for (const record of recordsToPlay) {
      const event = mapRecordToSound(record);
      if (event) playSound(event);
    }
  }, [state]);
}

function mapRecordToSound(record: StoryRecord): SoundEvent | null {
  switch (record.kind) {
    case "SettlementEstablished":
      return "SettlementEstablished";
    case "SettlementsUpgraded":
      return "SettlementsUpgraded";
    case "SpecializationUnlocked":
      return "SpecializationUnlocked";
    case "ResearchCompleted":
      return "ResearchCompleted";
    case "SettlementSpecialized":
      return "SettlementSpecialized";
    case "LandPurchased":
      return "LandPurchased";
    case "AgeAdvanced":
      return "AgeAdvanced";
    case "Ascended":
      return "Ascended";
    case "CacaoEarned":
      return null; // Too frequent, skip
    case "ExpeditionSent":
      return "SettlementEstablished"; // Reuse a suitable sound for now
    case "ExpeditionReturned":
      return "ResearchCompleted"; // Reuse a suitable sound for now
    case "ExpeditionBonusExpired":
      return null;
  }
}