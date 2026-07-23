// src/engine/expeditions/resolve.ts

import type { GameState } from "../state/GameState";
import type { GameEvent } from "../events/GameEvent";
import type { PendingExpedition } from "./types";
import { getDestination } from "./definitions";
import { rollReward, applyReward } from "./sendExpedition";

/**
 * Ticks all pending expeditions and active bonuses by one turn.
 * Called at the top of the reducer, before processing the player's command.
 *
 * - Pending expeditions: decrement turnsRemaining. If it reaches 0, resolve.
 * - Active bonuses: decrement turnsRemaining. If it reaches 0, remove.
 *
 * Returns the updated state and any events from resolutions/expirations.
 */
export function tickExpeditions(state: GameState): {
  state: GameState;
  events: GameEvent[];
} {
  const events: GameEvent[] = [];
  let cacao = state.cacao;
  let landParcels = state.landParcels;
  const remainingPending: PendingExpedition[] = [];
  const newCompleted = [...state.completedExpeditions];
  const newBonuses = [...state.expeditionBonuses];

  // Process pending expeditions
  for (const exp of state.pendingExpeditions) {
    const newTurnsRemaining = exp.turnsRemaining - 1;

    if (newTurnsRemaining <= 0) {
      // Expedition returns!
      const dest = getDestination(exp.destination);
      if (dest) {
        // Roll for reward using a seed from the turn and expedition ID
        const seed = (exp.sentTurn + exp.id.charCodeAt(0)) >>> 0;
        const reward = rollReward(dest.rewards, seed);

        // Apply the reward to a temp state
        const tempState: GameState = {
          ...state,
          cacao,
          landParcels,
        };
        const { state: rewardedState, description } = applyReward(tempState, reward);
        cacao = rewardedState.cacao;
        landParcels = rewardedState.landParcels;

        // Copy any new bonus from the rewarded state
        const newBonusFromReward = rewardedState.expeditionBonuses.find(
          (b) => !state.expeditionBonuses.some((old) => old.id === b.id),
        );
        if (newBonusFromReward) {
          newBonuses.push(newBonusFromReward);
        }

        // Record completed expedition
        newCompleted.push({
          destination: exp.destination,
          sentTurn: exp.sentTurn,
          returnedTurn: state.turn,
          rewardDescription: description,
        });

        events.push({
          type: "ExpeditionReturned",
          turn: state.turn,
          destination: dest.name,
          reward: reward.description,
          rewardDescription: description,
        });
      }
    } else {
      // Still traveling
      remainingPending.push({
        ...exp,
        turnsRemaining: newTurnsRemaining,
      });
    }
  }

  // Tick active bonuses
  const survivingBonuses = newBonuses
    .map((bonus) => ({ ...bonus, turnsRemaining: bonus.turnsRemaining - 1 }))
    .filter((bonus) => {
      if (bonus.turnsRemaining <= 0) {
        events.push({
          type: "ExpeditionBonusExpired",
          turn: state.turn,
          bonusType: bonus.description,
        });
        return false;
      }
      return true;
    });

  return {
    state: {
      ...state,
      cacao,
      landParcels,
      pendingExpeditions: remainingPending,
      completedExpeditions: newCompleted,
      expeditionBonuses: survivingBonuses,
    },
    events,
  };
}