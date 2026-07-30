// src/engine/resources/types.ts

/**
 * Intermediate resources that flow between specializations.
 *
 * The pipeline mechanic: some specializations produce a resource, others
 * consume it. The player must balance production and consumption.
 * Surplus is wasted (no stockpiling). Deficit means consumers go idle.
 *
 * Resources unlock gradually:
 * - Trade Goods: available from the Founding Age
 * - Knowledge: available from the Age of Growth
 * - Materials: available from the Age of City-States
 */

export type ResourceId = "TradeGoods" | "Knowledge" | "Materials";

export interface ResourceDef {
  readonly id: ResourceId;
  readonly name: string;
  readonly description: string;
  /** The Age index at which this resource becomes active. */
  readonly unlockAge: number;
}

export const RESOURCES: readonly ResourceDef[] = [
  {
    id: "TradeGoods",
    name: "Trade Goods",
    description:
      "Goods produced by Markets and consumed by Craft Districts to generate bonus cacao.",
    unlockAge: 0, // Founding Age
  },
  {
    id: "Knowledge",
    name: "Knowledge",
    description:
      "Scholarly output from Codex Houses, consumed by Temples to boost their multiplier.",
    unlockAge: 1, // Age of Growth
  },
  {
    id: "Materials",
    name: "Materials",
    description:
      "Construction materials from Estates, consumed by Aqueducts to boost their income effect.",
    unlockAge: 2, // Age of City-States
  },
];

/** Production/consumption rates per specialization. */
export interface ResourceFlow {
  readonly resource: ResourceId;
  /** Positive = produces, negative = consumes. */
  readonly rate: number;
}

/** Which specializations produce or consume which resources. */
export const SPECIALIZATION_FLOWS: Readonly<Record<string, readonly ResourceFlow[]>> = {
  Market: [{ resource: "TradeGoods", rate: 1 }],
  CraftDistrict: [{ resource: "TradeGoods", rate: -1 }],
  Codex: [{ resource: "Knowledge", rate: 1 }],
  Temple: [{ resource: "Knowledge", rate: -1 }],
  Estate: [{ resource: "Materials", rate: 1 }],
  Aqueduct: [{ resource: "Materials", rate: -1 }],
};

/** Result of calculating the resource balance for the realm. */
export interface ResourceBalance {
  readonly resource: ResourceId;
  readonly produced: number;
  readonly consumed: number;
  /** Positive = surplus (wasted), negative = deficit (idle consumers). */
  readonly net: number;
  readonly active: boolean;
}

/** Full balance report for all resources. */
export interface ResourceReport {
  readonly balances: readonly ResourceBalance[];
  /** Number of idle (underfed) consumers, per resource. */
  readonly idleConsumers: Readonly<Record<ResourceId, number>>;
}