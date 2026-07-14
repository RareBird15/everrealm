// src/engine/commands.ts

import type { GameState } from "./state/GameState";
import type { GameCommand } from "./events/GameCommand";
import type { GameEvent } from "./events/GameEvent";
import type { GameError } from "./events/GameError";
import type { Result } from "../shared/types";
import type { SettlementLevel } from "./settlements/types";
import type { TechNodeId } from "./techtree/types";

import { establishSettlement, ESTABLISH_COST } from "./settlements/establish";
import { developSettlement } from "./settlements/develop";
import { canAccommodate, totalSettlements } from "./settlements/capacity";
import { levelIndex, isSpecialBuilding, isStandardLevel } from "./settlements/progression";

import { earnProsperity, ESTABLISH_REWARD, DEVELOP_REWARD, CHAIN_REACTION_REWARD, DISCOVERY_REWARD, AGE_ENTRY_REWARD } from "./prosperity/earn";
import { spendProsperity } from "./prosperity/spend";
import { computePassive, BASE_PASSIVE_RATE_PER_HOUR } from "./prosperity/passive";

import { advanceAge, AGE_ADVANCE_COST } from "./ages/advance";

import { purchaseImprovement } from "./improvements/purchase";
import { getImprovement, isImprovementAvailableForAge } from "./improvements/catalog";
import { summarizeEffects } from "./improvements/effects";

import { TECH_NODES, getTechNode, isBuildingUnlocked, meetsPrerequisites, isTechAvailableForAge } from "./techtree/definitions";

import { deriveStoryRecords, capacityIncreasedRecord } from "./story/derive";
import type { StoryRecord } from "./story/types";

export interface CommandResult {
  readonly state: GameState;
  readonly events: GameEvent[];
}

// ── Private helpers ──

/**
 * Computes the effective passive rate including improvement bonuses
 * and special building passive effects.
 *
 * Exported so the UI can display the current rate to the player.
 */
export function effectivePassiveRate(state: GameState): number {
  let bonus = 0;
  let multiplier = 1;
  for (const id of state.improvements) {
    const imp = getImprovement(id);
    if (imp) {
      const summary = summarizeEffects(imp.effects);
      bonus += summary.passiveBonus;
      multiplier += summary.passiveRateMultiplier;
    }
  }
  // Add passive bonuses from special buildings
  bonus += specialBuildingPassiveBonus(state);
  // Apply Aqueduct multiplier (each adds 5% to base rate)
  const aqueductMultiplier = specialBuildingPassiveMultiplier(state);
  return Math.floor((BASE_PASSIVE_RATE_PER_HOUR + bonus) * multiplier * aqueductMultiplier);
}

/**
 * Sums the passive-per-hour bonus from all special buildings in the realm.
 */
function specialBuildingPassiveBonus(state: GameState): number {
  let bonus = 0;
  for (const stack of state.settlements) {
    if (isSpecialBuilding(stack.level)) {
      const tech = getTechForBuilding(stack.level);
      if (tech) {
        for (const effect of tech.buildingEffects) {
          if (effect.kind === "PassivePerHour") {
            bonus += effect.amount * stack.quantity;
          }
        }
      }
    }
  }
  return bonus;
}

/**
 * Computes the passive rate multiplier from special buildings with
 * PassiveRateMultiplierPer effects (e.g. Aqueducts +5%, Banks +8%).
 * Each building adds its percentage to the base rate multiplicatively,
 * so 2 Aqueducts = 1.10x, 1 Bank = 1.08x, etc.
 */
function specialBuildingPassiveMultiplier(state: GameState): number {
  let multiplier = 1;
  for (const stack of state.settlements) {
    if (isSpecialBuilding(stack.level)) {
      const tech = getTechForBuilding(stack.level);
      if (tech) {
        for (const effect of tech.buildingEffects) {
          if (effect.kind === "PassiveRateMultiplierPer") {
            multiplier += effect.amount * stack.quantity;
          }
        }
      }
    }
  }
  return multiplier;
}

/**
 * Sums the discovery bonus from all special buildings with
 * DiscoveryBonusPer effects (e.g. Libraries +25, Shrines +50).
 */
function specialBuildingDiscoveryBonus(state: GameState): number {
  let bonus = 0;
  for (const stack of state.settlements) {
    if (isSpecialBuilding(stack.level)) {
      const tech = getTechForBuilding(stack.level);
      if (tech) {
        for (const effect of tech.buildingEffects) {
          if (effect.kind === "DiscoveryBonusPer") {
            bonus += effect.amount * stack.quantity;
          }
        }
      }
    }
  }
  return bonus;
}

/**
 * Sums the capacity bonus from all special buildings with
 * CapacityPerBuilding effects (e.g. Town Halls +1, Apothecaries +2).
 */
function specialBuildingCapacityBonus(state: GameState): number {
  let bonus = 0;
  for (const stack of state.settlements) {
    if (isSpecialBuilding(stack.level)) {
      const tech = getTechForBuilding(stack.level);
      if (tech) {
        for (const effect of tech.buildingEffects) {
          if (effect.kind === "CapacityPerBuilding") {
            bonus += effect.amount * stack.quantity;
          }
        }
      }
    }
  }
  return bonus;
}

/**
 * Returns the tech node that unlocks a given building, or undefined.
 */
function getTechForBuilding(building: SettlementLevel): { buildingEffects: readonly { kind: string; amount: number }[] } | undefined {
  for (const node of TECH_NODES) {
    if (node.unlocksBuilding === building) return node;
  }
  return undefined;
}

/**
 * Computes the effective capacity including improvement bonuses
 * and Town Hall building bonuses.
 */
function effectiveCapacity(state: GameState): number {
  let capacity = state.capacity;
  for (const id of state.improvements) {
    const imp = getImprovement(id);
    if (imp) {
      const summary = summarizeEffects(imp.effects);
      capacity += summary.capacityBonus;
    }
  }
  capacity += specialBuildingCapacityBonus(state);
  return capacity;
}

/**
 * Computes the active reward bonus from improvements.
 */
function activeRewardBonus(state: GameState): number {
  let bonus = 0;
  for (const id of state.improvements) {
    const imp = getImprovement(id);
    if (imp) {
      const summary = summarizeEffects(imp.effects);
      bonus += summary.activeRewardBonus;
    }
  }
  return bonus;
}

/**
 * Sums the develop bonus from all special buildings (Farms give +1 per Farm).
 */
function specialBuildingDevelopBonus(state: GameState): number {
  let bonus = 0;
  for (const stack of state.settlements) {
    if (stack.level === "Farm") {
      const tech = getTechForBuilding("Farm");
      if (tech) {
        for (const effect of tech.buildingEffects) {
          if (effect.kind === "DevelopBonusPer") {
            bonus += effect.amount * stack.quantity;
          }
        }
      }
    }
  }
  return bonus;
}

/**
 * Sums the establish bonus from all special buildings (Markets give +2 per Market).
 */
function specialBuildingEstablishBonus(state: GameState): number {
  let bonus = 0;
  for (const stack of state.settlements) {
    if (stack.level === "Market") {
      const tech = getTechForBuilding("Market");
      if (tech) {
        for (const effect of tech.buildingEffects) {
          if (effect.kind === "EstablishBonusPer") {
            bonus += effect.amount * stack.quantity;
          }
        }
      }
    }
  }
  return bonus;
}

/**
 * Sums the establish cost reduction from all special buildings (Workshops give -1 per Workshop, min cost 1).
 */
function specialBuildingEstablishCostReduction(state: GameState): number {
  let reduction = 0;
  for (const stack of state.settlements) {
    if (stack.level === "Workshop") {
      const tech = getTechForBuilding("Workshop");
      if (tech) {
        for (const effect of tech.buildingEffects) {
          if (effect.kind === "EstablishCostReductionPer") {
            reduction += effect.amount * stack.quantity;
          }
        }
      }
    }
  }
  return reduction;
}

/**
 * Computes the effective establish cost after Workshop reductions (min 1).
 */
function effectiveEstablishCost(state: GameState): number {
  const reduction = specialBuildingEstablishCostReduction(state);
  return Math.max(1, ESTABLISH_COST - reduction);
}

/**
 * Applies passive prosperity accrued since `lastUpdate` and returns
 * updated state plus any passive events.
 */
function applyPassive(state: GameState, now: number): { state: GameState; events: GameEvent[] } {
  const rate = effectivePassiveRate(state);
  const passive = computePassive(state.lastUpdate, now, rate);

  if (passive.amount === 0) {
    return { state, events: [] };
  }

  const events: GameEvent[] = [
    { type: "PassiveProsperityApplied", amount: passive.amount },
    {
      type: "ProsperityEarned",
      amount: passive.amount,
      source: "Passive" as const,
    },
  ];

  return {
    state: {
      ...state,
      prosperity: state.prosperity + passive.amount,
      lastUpdate: passive.newLastUpdate,
    },
    events,
  };
}

/**
 * Checks for new settlement level discoveries and returns discovery events
 * plus updated discoveredLevels.
 */
function checkDiscoveries(
  settlements: readonly { age: string; level: SettlementLevel; quantity: number }[],
  discoveredLevels: readonly SettlementLevel[],
): {
  discoveredLevels: SettlementLevel[];
  events: GameEvent[];
} {
  const known = new Set(discoveredLevels);
  const newDiscoveries: SettlementLevel[] = [];
  const events: GameEvent[] = [];

  for (const stack of settlements) {
    if (!known.has(stack.level) && !newDiscoveries.includes(stack.level)) {
      newDiscoveries.push(stack.level);
      events.push({ type: "SettlementLevelDiscovered", level: stack.level });
    }
  }

  if (newDiscoveries.length === 0) {
    return { discoveredLevels: [...discoveredLevels], events };
  }

  // Merge and sort by progression order
  const all = [...discoveredLevels, ...newDiscoveries];
  all.sort((a, b) => {
    // Standard levels sort by index; special buildings sort after all standard levels
    if (isStandardLevel(a) && isStandardLevel(b)) {
      return levelIndex(a) - levelIndex(b);
    }
    if (isStandardLevel(a)) return -1;
    if (isStandardLevel(b)) return 1;
    return a < b ? -1 : a > b ? 1 : 0;
  });

  return { discoveredLevels: all, events };
}

/**
 * Awards discovery prosperity for each discovery event and appends
 * the earned events. Returns updated prosperity and the new events.
 * Includes bonuses from improvements (Grand Library, Ancient Ruins)
 * and Library buildings.
 */
function awardDiscoveries(
  state: GameState,
  prosperity: number,
  discoveryEvents: GameEvent[],
  allEvents: GameEvent[],
): number {
  // Flat bonus from improvements
  let impDiscoveryBonus = 0;
  for (const id of state.improvements) {
    const imp = getImprovement(id);
    if (imp) {
      const summary = summarizeEffects(imp.effects);
      impDiscoveryBonus += summary.discoveryBonus;
    }
  }
  // Bonus from Library buildings
  const buildingDiscoveryBonus = specialBuildingDiscoveryBonus(state);
  const totalDiscoveryReward = DISCOVERY_REWARD + impDiscoveryBonus + buildingDiscoveryBonus;

  for (const _ of discoveryEvents) {
    const earned = earnProsperity(prosperity, totalDiscoveryReward, "Discovery");
    prosperity = earned.prosperity;
    allEvents.push(earned.event);
  }
  return prosperity;
}

/**
 * Finalizes state after a command: increments turn, derives story records.
 */
function finalizeState(
  state: GameState,
  allEvents: GameEvent[],
): GameState {
  const turn = state.turn + 1;
  const storyRecords = deriveStoryRecords(allEvents, turn);
  return {
    ...state,
    turn,
    story: [...state.story, ...storyRecords],
  };
}

// ── Command handlers ──

function handleEstablish(working: GameState, allEvents: GameEvent[]): Result<CommandResult, GameError> {
  const capacity = effectiveCapacity(working);

  if (!canAccommodate(working.settlements, capacity)) {
    return {
      success: false,
      error: {
        type: "SettlementCapacityFull",
        capacity,
        current: totalSettlements(working.settlements),
      },
    };
  }

  const cost = effectiveEstablishCost(working);
  const spendResult = spendProsperity(working.prosperity, cost);
  if (!spendResult.success) {
    return spendResult;
  }

  const result = establishSettlement(working.settlements, working.age);
  allEvents.push(...result.events);

  // Award establish reward (with active bonus from improvements + Market bonus)
  const impBonus = activeRewardBonus(working);
  const marketBonus = specialBuildingEstablishBonus(working);
  const totalReward = ESTABLISH_REWARD + impBonus + marketBonus;
  const establishEarned = earnProsperity(
    spendResult.value,
    totalReward,
    "Establish",
  );
  allEvents.push(establishEarned.event);

  const discoveryResult = checkDiscoveries(result.settlements, working.discoveredLevels);
  allEvents.push(...discoveryResult.events);

  const prosperity = awardDiscoveries(working, establishEarned.prosperity, discoveryResult.events, allEvents);

  const newTotal = totalSettlements(result.settlements);
  if (newTotal >= capacity) {
    allEvents.push({ type: "CapacityReached" });
  }

  const updated: GameState = {
    ...working,
    settlements: result.settlements,
    prosperity,
    discoveredLevels: discoveryResult.discoveredLevels,
  };

  return { success: true, value: { state: finalizeState(updated, allEvents), events: allEvents } };
}

function handleDevelop(
  working: GameState,
  command: { age: GameState["age"]; level: SettlementLevel; target?: SettlementLevel },
  allEvents: GameEvent[],
): Result<CommandResult, GameError> {
  // Validate that the target building is unlocked if it's a special building
  if (command.target !== undefined && isSpecialBuilding(command.target)) {
    if (!isBuildingUnlocked(command.target, working.unlockedTechs)) {
      return {
        success: false,
        error: { type: "BuildingNotUnlocked", building: command.target },
      };
    }
  }

  const developResult = developSettlement(working.settlements, command.age, command.level, command.target, working.unlockedTechs);
  if (!developResult.success) {
    return developResult;
  }

  allEvents.push(...developResult.value.events);

  const impBonus = activeRewardBonus(working);
  const farmBonus = specialBuildingDevelopBonus(working);
  let prosperity = working.prosperity;

  for (const event of developResult.value.events) {
    if (event.type === "SettlementDeveloped") {
      const baseReward = event.source === "Player" ? DEVELOP_REWARD : CHAIN_REACTION_REWARD;
      const reward = baseReward + impBonus + (event.source === "Player" ? farmBonus : 0);
      const earned = earnProsperity(prosperity, reward, event.source === "Player" ? "Develop" : "ChainReaction");
      prosperity = earned.prosperity;
      allEvents.push(earned.event);
    }
  }

  const discoveryResult = checkDiscoveries(developResult.value.settlements, working.discoveredLevels);
  allEvents.push(...discoveryResult.events);
  prosperity = awardDiscoveries(working, prosperity, discoveryResult.events, allEvents);

  const updated: GameState = {
    ...working,
    settlements: developResult.value.settlements,
    prosperity,
    discoveredLevels: discoveryResult.discoveredLevels,
  };

  return { success: true, value: { state: finalizeState(updated, allEvents), events: allEvents } };
}

function handlePurchase(
  working: GameState,
  command: { improvementId: import("./improvements/types").ImprovementId },
  allEvents: GameEvent[],
): Result<CommandResult, GameError> {
  const improvement = getImprovement(command.improvementId);
  if (!improvement) {
    return { success: false, error: { type: "ImprovementNotFound", improvementId: command.improvementId } };
  }
  if (!isImprovementAvailableForAge(improvement, working.age)) {
    return {
      success: false,
      error: { type: "ImprovementNotAvailableForAge", improvementId: command.improvementId, currentAge: working.age },
    };
  }

  const purchaseResult = purchaseImprovement(working.improvements, working.prosperity, command.improvementId);
  if (!purchaseResult.success) {
    return purchaseResult;
  }

  allEvents.push(...purchaseResult.value.events);

  const oldCapacity = effectiveCapacity(working);
  const newStateWithImprovement: GameState = {
    ...working,
    improvements: [...working.improvements, command.improvementId],
    prosperity: purchaseResult.value.prosperity,
  };
  const newCapacity = effectiveCapacity(newStateWithImprovement);

  const storyRecords: StoryRecord[] = [...working.story];

  if (newCapacity > oldCapacity) {
    const record = capacityIncreasedRecord(working.turn + 1, newCapacity);
    storyRecords.push(record);
  }

  let updated: GameState = {
    ...newStateWithImprovement,
    capacity: newCapacity,
    turn: working.turn + 1,
    story: storyRecords,
  };

  const eventStoryRecords = deriveStoryRecords(purchaseResult.value.events, updated.turn);
  updated = {
    ...updated,
    story: [...updated.story, ...eventStoryRecords],
  };

  return { success: true, value: { state: updated, events: allEvents } };
}

function handleAdvanceAge(working: GameState, allEvents: GameEvent[]): Result<CommandResult, GameError> {
  const advanceResult = advanceAge(working.settlements, working.age, working.prosperity);
  if (!advanceResult.success) {
    return advanceResult;
  }

  allEvents.push(...advanceResult.value.events);

  let prosperity = working.prosperity - AGE_ADVANCE_COST;

  const ageEntryEarned = earnProsperity(prosperity, AGE_ENTRY_REWARD, "AgeEntry");
  prosperity = ageEntryEarned.prosperity;
  allEvents.push(ageEntryEarned.event);

  const discoveryResult = checkDiscoveries(advanceResult.value.settlements, working.discoveredLevels);
  allEvents.push(...discoveryResult.events);
  prosperity = awardDiscoveries(working, prosperity, discoveryResult.events, allEvents);

  const updated: GameState = {
    ...working,
    settlements: advanceResult.value.settlements,
    age: advanceResult.value.age,
    prosperity,
    discoveredLevels: discoveryResult.discoveredLevels,
  };

  return { success: true, value: { state: finalizeState(updated, allEvents), events: allEvents } };
}

function handleUnlockTech(
  working: GameState,
  command: { techId: TechNodeId },
  allEvents: GameEvent[],
): Result<CommandResult, GameError> {
  const node = getTechNode(command.techId);
  if (!node) {
    return {
      success: false,
      error: { type: "TechNotFound", techId: command.techId },
    };
  }

  if (!isTechAvailableForAge(node, working.age)) {
    return {
      success: false,
      error: { type: "TechNotAvailableForAge", techId: command.techId, currentAge: working.age },
    };
  }

  // Check if already unlocked
  if (working.unlockedTechs.some((t) => t === command.techId)) {
    return {
      success: false,
      error: { type: "TechAlreadyUnlocked", techId: command.techId },
    };
  }

  // Check prerequisites (any-of: at least one required tech must be unlocked)
  if (!meetsPrerequisites(node, working.unlockedTechs)) {
    return {
      success: false,
      error: { type: "TechPrerequisitesNotMet", techId: command.techId },
    };
  }

  // Check prosperity
  const spendResult = spendProsperity(working.prosperity, node.cost);
  if (!spendResult.success) {
    return spendResult;
  }

  allEvents.push({ type: "TechUnlocked", techId: command.techId });

  const updated: GameState = {
    ...working,
    prosperity: spendResult.value,
    unlockedTechs: [...working.unlockedTechs, command.techId],
  };

  return { success: true, value: { state: finalizeState(updated, allEvents), events: allEvents } };
}

// ── Public API ──

/**
 * Executes a player command.
 *
 * Passive prosperity is applied automatically before the command is
 * dispatched, using the provided `now` timestamp.
 *
 * The engine never throws on invalid actions — it returns a typed Result
 * so the UI can present an appropriate message.
 */
export function executeCommand(
  state: GameState,
  command: GameCommand,
  now: number,
): Result<CommandResult, GameError> {
  const { state: afterPassive, events: passiveEvents } = applyPassive(state, now);
  const working = afterPassive;
  const allEvents: GameEvent[] = [...passiveEvents];

  switch (command.type) {
    case "EstablishSettlement":
      return handleEstablish(working, allEvents);
    case "DevelopSettlement":
      return handleDevelop(working, command, allEvents);
    case "PurchaseImprovement":
      return handlePurchase(working, command, allEvents);
    case "AdvanceAge":
      return handleAdvanceAge(working, allEvents);
    case "UnlockTech":
      return handleUnlockTech(working, command, allEvents);
  }
}

/**
 * Reconciles elapsed-time passive prosperity on load or resume.
 *
 * Not a player command — does not increment turn or produce story records.
 */
export function reconcileTime(
  state: GameState,
  now: number,
): Result<CommandResult> {
  const { state: newState, events } = applyPassive(state, now);
  return { success: true, value: { state: newState, events } };
}