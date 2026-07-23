// src/engine/expeditions/definitions.ts

import type { ExpeditionDestination, ExpeditionDestinationId } from "./types";

/**
 * The eight pochteca expedition destinations, unlocked progressively by Age.
 *
 * Each destination has a cost, a travel time in turns, and two possible
 * rewards (50/50 chance). The player sees the reward pool but not the
 * exact outcome — they know the range of possibilities, not the result.
 *
 * Rewards scale with Age — later destinations offer bigger bonuses,
 * longer durations, and more dramatic effects.
 */
export const DESTINATIONS: readonly ExpeditionDestination[] = [
  // ── Age of Growth (index 1) — 2 destinations ──
  {
    id: "lowlandForests",
    name: "Lowland Forests",
    description:
      "The tropical forests to the east, rich with hardwoods, rubber, and vanilla.",
    minAgeIndex: 1,
    cost: 50,
    turns: 8,
    rewards: [
      {
        type: "production",
        magnitude: 0.08,
        duration: 40,
        description: "+8% production for 40 turns",
      },
      {
        type: "income_flat",
        magnitude: 40,
        duration: 0,
        isLumpSum: true,
        cacaoAmount: 40,
        description: "+40 Cacao lump sum",
      },
    ],
  },
  {
    id: "highlandQuarries",
    name: "Highland Quarries",
    description:
      "Mountain quarries where obsidian and basalt are mined by skilled hands.",
    minAgeIndex: 1,
    cost: 80,
    turns: 10,
    rewards: [
      {
        type: "production",
        magnitude: 0.12,
        duration: 40,
        description: "+12% production for 40 turns",
      },
      {
        type: "income_flat",
        magnitude: 0,
        duration: 0,
        isLand: true,
        landAmount: 1,
        description: "+1 land parcel",
      },
    ],
  },

  // ── Age of City-States (index 2) — 2 destinations ──
  {
    id: "coastalPorts",
    name: "Coastal Ports",
    description:
      "Distant ports on the sea, where salt, cotton, and shells flow in endless trade.",
    minAgeIndex: 2,
    cost: 150,
    turns: 12,
    rewards: [
      {
        type: "production",
        magnitude: 0.10,
        duration: 50,
        description: "+10% production for 50 turns",
      },
      {
        type: "research_discount",
        magnitude: 0.15,
        duration: 30,
        description: "-15% research costs for 30 turns",
      },
    ],
  },
  {
    id: "mountainPasses",
    name: "Mountain Passes",
    description:
      "High mountain routes connecting to distant valleys, where jade and turquoise await.",
    minAgeIndex: 2,
    cost: 200,
    turns: 15,
    rewards: [
      {
        type: "income_flat",
        magnitude: 0,
        duration: 0,
        isLand: true,
        landAmount: 1,
        description: "+1 land parcel",
      },
      {
        type: "income_flat",
        magnitude: 100,
        duration: 0,
        isLumpSum: true,
        cacaoAmount: 100,
        description: "+100 Cacao lump sum",
      },
    ],
  },

  // ── Age of Splendor (index 3) — 2 destinations ──
  {
    id: "distantKingdoms",
    name: "Distant Kingdoms",
    description:
      "Far-off realms beyond the horizon, reachable only by the bravest pochteca.",
    minAgeIndex: 3,
    cost: 400,
    turns: 20,
    rewards: [
      {
        type: "production",
        magnitude: 0.15,
        duration: 60,
        description: "+15% production for 60 turns",
      },
      {
        type: "research_discount",
        magnitude: 0.20,
        duration: 40,
        description: "-20% research costs for 40 turns",
      },
    ],
  },
  {
    id: "jungleTradeRoutes",
    name: "Jungle Trade Routes",
    description:
      "Ancient paths through dense jungle, where cacao groves grow wild and plentiful.",
    minAgeIndex: 3,
    cost: 350,
    turns: 18,
    rewards: [
      {
        type: "production",
        magnitude: 0.05,
        duration: 80,
        description: "+5% production for 80 turns",
      },
      {
        type: "income_flat",
        magnitude: 250,
        duration: 0,
        isLumpSum: true,
        cacaoAmount: 250,
        description: "+250 Cacao lump sum",
      },
    ],
  },

  // ── Age of Legends (index 4) — 1 destination ──
  {
    id: "mythicLands",
    name: "Mythic Lands",
    description:
      "Lands of legend, where the boundary between mortal and divine grows thin.",
    minAgeIndex: 4,
    cost: 800,
    turns: 25,
    rewards: [
      {
        type: "production",
        magnitude: 0.20,
        duration: 80,
        description: "+20% production for 80 turns",
      },
      {
        type: "research_discount",
        magnitude: 0.25,
        duration: 50,
        description: "-25% research costs for 50 turns",
      },
    ],
  },

  // ── Age of Myths (index 5) — 1 destination ──
  {
    id: "spiritRealm",
    name: "Spirit Realm",
    description:
      "The realm beyond the veil, where the ancestors walk and time flows differently.",
    minAgeIndex: 5,
    cost: 1500,
    turns: 30,
    rewards: [
      {
        type: "production",
        magnitude: 0.25,
        duration: 100,
        description: "+25% production for 100 turns",
      },
      {
        type: "research_discount",
        magnitude: 0.30,
        duration: 60,
        description: "-30% research costs for 60 turns",
      },
    ],
  },
];

/** Returns the destination with the given ID, or undefined. */
export function getDestination(
  id: ExpeditionDestinationId,
): ExpeditionDestination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}

/**
 * Returns all destinations available at the given Age index.
 * A destination is available if the current Age index >= the destination's minAgeIndex.
 */
export function destinationsForAge(ageIndex: number): readonly ExpeditionDestination[] {
  return DESTINATIONS.filter((d) => d.minAgeIndex <= ageIndex);
}