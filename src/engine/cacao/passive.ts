// src/engine/cacao/passive.ts

import type { GameState } from "../state/GameState";
import { BASE_PASSIVE_RATE } from "../state/initialState";
import { countSpecialization } from "../settlements/establish";
import { levelIndex } from "../settlements/progression";
import type { GameEvent } from "../events/GameEvent";

/**
 * HYBRID INCOME SYSTEM
 *
 * Turn-based income (primary):
 * Every action collects Cacao from all settlements. This is the main
 * economy — you always make progress with every click, never stuck waiting.
 *
 * Clock-based income (bonus):
 * A smaller amount accrues in real time between actions, rewarding
 * players who step away. Shown as "+X from time away" when you act.
 */

// ── Turn-based income (primary) ──

/** Base Cacao earned per action, regardless of settlements. */
const BASE_PER_TURN = 5;

/**
 * Calculates Cacao earned per turn (per action) from all settlements.
 * This is the primary income source — every click earns this.
 */
export function cacaoPerTurn(state: GameState): number {
  let income = BASE_PER_TURN;

  // ALL settlements add income based on their tier, including specialized ones.
  // Specialized settlements are locked at their tier but still produce
  // tier-based income — they're still communities of people.
  for (const s of state.settlements) {
    const idx = levelIndex(s.tier);
    income += (idx + 1) * 2; // Tent=2, Hut=4, Cottage=6, House=8, etc.
  }

  // Specialized buildings add BONUS income on top of their tier income
  // Jade Palace legacy: specializations are 25% stronger
  const jadeBoost = state.prestige.legacies.includes("JadePalace") ? 1.25 : 1.0;
  income += countSpecialization(state, "Farm") * 3 * jadeBoost;
  income += countSpecialization(state, "Market") * 2 * jadeBoost;
  income += countSpecialization(state, "Workshop") * 1 * jadeBoost;
  income += countSpecialization(state, "Estate") * 5 * jadeBoost;

  // Gardens scale with total specializations
  const gardens = countSpecialization(state, "Garden");
  const specializedCount = state.settlements.filter(
    (s) => s.specialization !== null,
  ).length;
  income += gardens * specializedCount * 2;

  // War Shrine gives active income per turn
  income += countSpecialization(state, "WarShrine") * 5;

  // v1.1.0: Flat income from expedition bonuses
  for (const bonus of state.expeditionBonuses) {
    if (bonus.type === "income_flat") {
      income += bonus.magnitude;
    }
  }

  // Multipliers (same as clock-based, applied to turn income too)
  income = applyMultipliers(state, income);

  return Math.floor(income);
}

// ── Clock-based income (bonus) ──

/**
 * Calculates the clock-based Cacao rate per hour.
 * This is a BONUS — smaller than the turn-based income.
 * Rewards returning players without being the primary economy.
 */
export function passiveRatePerHour(state: GameState): number {
  let rate = BASE_PASSIVE_RATE; // 30/hour base (0.5/min)

  // ALL settlements add to clock rate based on tier (including specialized)
  for (const s of state.settlements) {
    const idx = levelIndex(s.tier);
    rate += idx * 1; // Tent=0, Hut=1, Cottage=2, etc.
  }

  rate = applyMultipliers(state, rate);

  return Math.floor(rate);
}

/**
 * Applies realm-wide multipliers from specializations, legacies, and expedition bonuses.
 * Shared between turn-based and clock-based income.
 */
function applyMultipliers(state: GameState, amount: number): number {
  // Each Aqueduct adds 5%
  const aqueducts = countSpecialization(state, "Aqueduct");
  amount *= 1 + aqueducts * 0.05;

  // Each Treasury adds 8%
  const treasuries = countSpecialization(state, "Treasury");
  amount *= 1 + treasuries * 0.08;

  // Each Temple adds 25%
  const temples = countSpecialization(state, "Temple");
  amount *= 1 + temples * 0.25;

  // Each Oracle adds 50%
  const oracles = countSpecialization(state, "Oracle");
  amount *= 1 + oracles * 0.50;

  // Eternal Pyramid legacy: +10%
  if (state.prestige.legacies.includes("EternalPyramid")) {
    amount *= 1.10;
  }

  // v1.1.0: Expedition production bonuses
  for (const bonus of state.expeditionBonuses) {
    if (bonus.type === "production") {
      amount *= 1 + bonus.magnitude;
    }
  }

  return amount;
}

/**
 * Calculates clock-based Cacao earned since the last update.
 */
export function calculatePassiveCacao(state: GameState): number {
  const now = Date.now();
  const elapsedHours = (now - state.lastUpdate) / (1000 * 60 * 60);
  return Math.floor(passiveRatePerHour(state) * elapsedHours);
}

/**
 * Applies both turn-based and clock-based Cacao to the state.
 * Called before every command in the reducer.
 *
 * Turn-based income is the primary source — every action earns it.
 * Clock-based income is a bonus for time elapsed since last action.
 */
export function applyPassiveCacao(state: GameState): {
  state: GameState;
  events: GameEvent[];
} {
  const events: GameEvent[] = [];

  // 1. Clock-based bonus (time elapsed since last action)
  const clockEarned = calculatePassiveCacao(state);
  if (clockEarned > 0) {
    events.push({
      type: "CacaoEarned",
      turn: state.turn,
      amount: clockEarned,
      source: "time away",
    });
  }

  // 2. Turn-based income (from settlements, earned this turn)
  const turnEarned = cacaoPerTurn(state);
  events.push({
    type: "CacaoEarned",
    turn: state.turn,
    amount: turnEarned,
    source: "settlements",
  });

  const totalEarned = clockEarned + turnEarned;

  return {
    state: {
      ...state,
      cacao: state.cacao + totalEarned,
      lastUpdate: Date.now(),
    },
    events,
  };
}