// src/engine/expeditions/sendExpedition.ts

import type { GameState } from "../state/GameState";
import type { GameEvent } from "../events/GameEvent";
import type { ExpeditionDestinationId, ExpeditionRewardOption, ExpeditionBonus } from "./types";
import { MAX_CONCURRENT_EXPEDITIONS } from "./types";
import { getDestination } from "./definitions";
import { getAge } from "../ages/definitions";

/**
 * Returns true if the player can send an expedition to the given destination.
 * Requires:
 * - Enough Cacao for the cost
 * - Fewer than MAX_CONCURRENT_EXPEDITIONS pending
 * - Current Age >= destination's minimum Age
 */
export function canSendExpedition(
  state: GameState,
  destinationId: ExpeditionDestinationId,
): boolean {
  const dest = getDestination(destinationId);
  if (!dest) return false;

  // Check Age requirement
  const currentAge = getAge(state.age);
  if (!currentAge || currentAge.index < dest.minAgeIndex) return false;

  // Check Cacao
  if (state.cacao < dest.cost) return false;

  // Check concurrent expedition limit
  if (state.pendingExpeditions.length >= MAX_CONCURRENT_EXPEDITIONS) return false;

  return true;
}

/**
 * Sends a pochteca expedition to the given destination.
 * Spends Cacao, creates a pending expedition that will resolve after `turns` turns.
 */
export function sendExpedition(
  state: GameState,
  destinationId: ExpeditionDestinationId,
): {
  state: GameState;
  events: GameEvent[];
} {
  const dest = getDestination(destinationId);
  if (!dest) throw new Error(`Unknown destination: ${destinationId}`);

  if (!canSendExpedition(state, destinationId)) {
    const currentAge = getAge(state.age);
    if (currentAge && currentAge.index < dest.minAgeIndex) {
      throw new Error(
        `${dest.name} requires a later Age to reach.`,
      );
    }
    if (state.cacao < dest.cost) {
      throw new Error(
        `Not enough Cacao. Need ${dest.cost}, have ${state.cacao}.`,
      );
    }
    if (state.pendingExpeditions.length >= MAX_CONCURRENT_EXPEDITIONS) {
      throw new Error(
        `You already have ${MAX_CONCURRENT_EXPEDITIONS} expeditions in progress. Wait for one to return.`,
      );
    }
    throw new Error("Cannot send expedition.");
  }

  const expeditionId = `expedition-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    state: {
      ...state,
      cacao: state.cacao - dest.cost,
      pendingExpeditions: [
        ...state.pendingExpeditions,
        {
          id: expeditionId,
          destination: destinationId,
          turnsRemaining: dest.turns,
          cost: dest.cost,
          sentTurn: state.turn + 1, // This turn
        },
      ],
      turn: state.turn + 1,
    },
    events: [
      {
        type: "ExpeditionSent",
        turn: state.turn + 1,
        destination: dest.name,
        cost: dest.cost,
        turnsToComplete: dest.turns,
      },
    ],
  };
}

/**
 * Rolls for a reward from a destination's reward pool.
 * 50/50 between the two options.
 * Uses a simple deterministic hash of the turn + expedition ID for reproducibility.
 */
export function rollReward(
  options: readonly [ExpeditionRewardOption, ExpeditionRewardOption],
  seed: number,
): ExpeditionRewardOption {
  // Deterministic pseudo-random based on seed
  const hash = (seed * 9301 + 49297) % 233280;
  const rnd = hash / 233280;
  return rnd < 0.5 ? options[0] : options[1];
}

/**
 * Applies a reward to the game state.
 * Returns the new state and a description string.
 */
export function applyReward(
  state: GameState,
  reward: ExpeditionRewardOption,
): { state: GameState; description: string } {
  // Lump-sum Cacao
  if (reward.isLumpSum && reward.cacaoAmount) {
    return {
      state: { ...state, cacao: state.cacao + reward.cacaoAmount },
      description: `returned with ${reward.cacaoAmount} Cacao in trade goods`,
    };
  }

  // Land parcel
  if (reward.isLand && reward.landAmount) {
    return {
      state: {
        ...state,
        landParcels: state.landParcels + reward.landAmount,
      },
      description: `returned with news of ${reward.landAmount} new land parcel${reward.landAmount > 1 ? "s" : ""} for your realm`,
    };
  }

  // Temporary bonus
  const bonusId = `bonus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const bonus: ExpeditionBonus = {
    id: bonusId,
    type: reward.type,
    magnitude: reward.magnitude,
    turnsRemaining: reward.duration,
    description: reward.description,
  };

  return {
    state: {
      ...state,
      expeditionBonuses: [...state.expeditionBonuses, bonus],
    },
    description: reward.description,
  };
}