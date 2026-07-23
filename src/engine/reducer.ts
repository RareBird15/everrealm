// src/engine/reducer.ts

import type { GameState } from "./state/GameState";
import type { GameCommand } from "./events/GameCommand";
import type { GameEvent } from "./events/GameEvent";
import { establishSettlement } from "./settlements/establish";
import { doResearch } from "./research/researchAction";
import { specializeSettlement, unspecializeSettlement, batchSpecialize, batchUnspecialize } from "./settlements/specialize";
import { buyLand } from "./land/buyLand";
import { advanceAge } from "./ages/advance";
import { ascend } from "./prestige/ascend";
import { applyPassiveCacao } from "./cacao/passive";
import { deriveStoryRecords } from "./story/derive";
import { tickExpeditions } from "./expeditions/resolve";
import { sendExpedition } from "./expeditions/sendExpedition";
import type { ImprovementId } from "./improvements/types";

/**
 * The reducer processes a game command and returns the new state plus
 * any events that occurred.
 *
 * Before each command, the following are applied in order:
 * 1. Passive cacao (based on elapsed time)
 * 2. Expedition ticking (pending expeditions and active bonuses)
 */
export function reducer(state: GameState, command: GameCommand): {
  state: GameState;
  events: GameEvent[];
} {
  // Apply passive cacao first
  const { state: withPassive, events: passiveEvents } = applyPassiveCacao(state);

  // Tick expeditions (resolve returning ones, expire old bonuses)
  const { state: withExpeditions, events: expeditionEvents } = tickExpeditions(withPassive);

  try {
    let result: { state: GameState; events: GameEvent[] };

    switch (command.type) {
      case "EstablishSettlement":
        result = establishSettlement(withExpeditions);
        break;

      case "ResearchUpgrade":
        result = doResearch(withExpeditions, command.researchId);
        break;

      case "SpecializeSettlement":
        result = specializeSettlement(
          withExpeditions,
          command.settlementId,
          command.building,
        );
        break;

      case "UnspecializeSettlement":
        result = unspecializeSettlement(withExpeditions, command.settlementId);
        break;

      case "BatchSpecialize":
        result = batchSpecialize(withExpeditions, command.building, command.count);
        break;

      case "BatchUnspecialize":
        result = batchUnspecialize(withExpeditions, command.count);
        break;

      case "BuyLand":
        result = buyLand(withExpeditions);
        break;

      case "PurchaseImprovement":
        result = purchaseImprovement(withExpeditions, command.improvementId);
        break;

      case "AdvanceAge":
        result = advanceAge(withExpeditions);
        break;

      case "Ascend":
        result = ascend(withExpeditions, command.legacy);
        break;

      case "SendExpedition":
        result = sendExpedition(withExpeditions, command.destination);
        break;

      default:
        throw new Error(`Unknown command type`);
    }

    // Derive story records from events and append to state
    const allEvents = [...passiveEvents, ...expeditionEvents, ...result.events];
    const newStory = deriveStoryRecords(allEvents);

    return {
      state: {
        ...result.state,
        story: [...result.state.story, ...newStory],
      },
      events: allEvents,
    };
  } catch (error) {
    // Still need to derive story from expedition events even on error
    const allEvents = [...passiveEvents, ...expeditionEvents];
    const newStory = deriveStoryRecords(allEvents);

    return {
      state: {
        ...withExpeditions,
        story: [...withExpeditions.story, ...newStory],
      },
      events: [
        ...allEvents,
        {
          type: "Error" as const,
          turn: state.turn,
          message: error instanceof Error ? error.message : "Unknown error",
        },
      ],
    };
  }
}

// Placeholder for improvement purchase — will be properly implemented
// when the improvements system is updated for v0.3
function purchaseImprovement(
  state: GameState,
  _improvementId: ImprovementId,
): { state: GameState; events: GameEvent[] } {
  // TODO: Implement improvement system for v0.3
  return {
    state: { ...state, turn: state.turn + 1 },
    events: [
      {
        type: "Error" as const,
        turn: state.turn + 1,
        message: "Improvements are being updated for v0.3.",
      },
    ],
  };
}