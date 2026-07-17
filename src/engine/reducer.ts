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
import type { ImprovementId } from "./improvements/types";

/**
 * The reducer processes a game command and returns the new state plus
 * any events that occurred.
 *
 * Before each command, passive cacao is applied based on elapsed time.
 */
export function reducer(state: GameState, command: GameCommand): {
  state: GameState;
  events: GameEvent[];
} {
  // Apply passive cacao first
  const { state: withPassive, events: passiveEvents } = applyPassiveCacao(state);

  try {
    let result: { state: GameState; events: GameEvent[] };

    switch (command.type) {
      case "EstablishSettlement":
        result = establishSettlement(withPassive);
        break;

      case "ResearchUpgrade":
        result = doResearch(withPassive, command.researchId);
        break;

      case "SpecializeSettlement":
        result = specializeSettlement(
          withPassive,
          command.settlementId,
          command.building,
        );
        break;

      case "UnspecializeSettlement":
        result = unspecializeSettlement(withPassive, command.settlementId);
        break;

      case "BatchSpecialize":
        result = batchSpecialize(withPassive, command.building, command.count);
        break;

      case "BatchUnspecialize":
        result = batchUnspecialize(withPassive, command.count);
        break;

      case "BuyLand":
        result = buyLand(withPassive);
        break;

      case "PurchaseImprovement":
        result = purchaseImprovement(withPassive, command.improvementId);
        break;

      case "AdvanceAge":
        result = advanceAge(withPassive);
        break;

      case "Ascend":
        result = ascend(withPassive, command.legacy);
        break;

      default:
        throw new Error(`Unknown command type`);
    }

    // Derive story records from events and append to state
    const allEvents = [...passiveEvents, ...result.events];
    const newStory = deriveStoryRecords(allEvents);

    return {
      state: {
        ...result.state,
        story: [...result.state.story, ...newStory],
      },
      events: allEvents,
    };
  } catch (error) {
    return {
      state: withPassive,
      events: [
        ...passiveEvents,
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