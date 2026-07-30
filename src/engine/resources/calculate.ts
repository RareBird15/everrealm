// src/engine/resources/calculate.ts

import type { GameState } from "../state/GameState";
import type { ResourceId, ResourceBalance, ResourceReport } from "./types";
import { RESOURCES, SPECIALIZATION_FLOWS } from "./types";
import { countSpecialization } from "../settlements/establish";

/**
 * Calculates the resource balance for the realm.
 *
 * For each resource:
 * 1. Sum production from all producer specializations
 * 2. Sum consumption from all consumer specializations
 * 3. Net = produced - consumed
 * 4. If net < 0, some consumers are idle (not enough resource to process)
 *
 * Resources only count if the current Age has unlocked them.
 */
export function calculateResources(state: GameState): ResourceReport {
  const ageIndex = getAgeIndex(state);
  const balances: ResourceBalance[] = [];
  const idleConsumers = {} as Record<ResourceId, number>;

  for (const res of RESOURCES) {
    if (ageIndex < res.unlockAge) {
      // Resource not yet unlocked
      balances.push({
        resource: res.id,
        produced: 0,
        consumed: 0,
        net: 0,
        active: false,
      });
      idleConsumers[res.id] = 0;
      continue;
    }

    let produced = 0;
    let consumed = 0;

    for (const [building, flows] of Object.entries(SPECIALIZATION_FLOWS)) {
      const count = countSpecialization(state, building as never);
      if (count === 0) continue;

      for (const flow of flows) {
        if (flow.resource !== res.id) continue;

        if (flow.rate > 0) {
          produced += count * flow.rate;
        } else {
          consumed += count * Math.abs(flow.rate);
        }
      }
    }

    const net = produced - consumed;
    const active = true;

    // Calculate idle consumers: if consumption exceeds production,
    // some consumers can't run at full capacity
    if (net < 0 && consumed > 0) {
      // Each consumer needs `rate` units. Available = produced.
      // Idle consumers = total consumers - (produced / rate_per_consumer)
      const consumerRate = getConsumerRate(res.id);
      if (consumerRate > 0) {
        const activeConsumers = Math.floor(produced / consumerRate);
        const totalConsumers = Math.floor(consumed / consumerRate);
        idleConsumers[res.id] = totalConsumers - activeConsumers;
      } else {
        idleConsumers[res.id] = 0;
      }
    } else {
      idleConsumers[res.id] = 0;
    }

    balances.push({ resource: res.id, produced, consumed, net, active });
  }

  return { balances, idleConsumers };
}

/**
 * Gets the consumption rate per individual consumer for a resource.
 * Used to calculate how many consumers are idle when production is insufficient.
 */
function getConsumerRate(resource: ResourceId): number {
  for (const flows of Object.values(SPECIALIZATION_FLOWS)) {
    for (const flow of flows) {
      if (flow.resource === resource && flow.rate < 0) {
        return Math.abs(flow.rate);
      }
    }
  }
  return 0;
}

/** Gets the current Age index from the game state. */
function getAgeIndex(state: GameState): number {
  const ageOrder = [
    "FoundingAge",
    "AgeOfGrowth",
    "AgeOfCityStates",
    "AgeOfSplendor",
    "AgeOfLegends",
    "AgeOfMyths",
  ] as const;
  return ageOrder.indexOf(state.age as (typeof ageOrder)[number]);
}

/**
 * Formats a resource report as a readable text summary.
 * Used for NVDA announcements and UI display.
 */
export function formatResourceReport(report: ResourceReport): string {
  const lines: string[] = ["Realm Resources (per turn):"];

  for (const balance of report.balances) {
    if (!balance.active) continue;

    const sign = balance.net >= 0 ? "+" : "";
    const status =
      balance.net === 0
        ? "balanced"
        : balance.net > 0
          ? `${sign}${balance.net} surplus (wasted)`
          : `${balance.net} deficit (${report.idleConsumers[balance.resource]} consumer${report.idleConsumers[balance.resource] === 1 ? "" : "s"} idle)`;

    lines.push(`${balance.resource}: ${balance.produced} produced, ${balance.consumed} consumed, ${status}`);
  }

  return lines.join("\n");
}