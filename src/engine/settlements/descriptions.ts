// src/engine/settlements/descriptions.ts

import type { SettlementLevel } from "./types";

/**
 * Flavor text for each settlement level.
 *
 * These descriptions are shown in the UI to give each settlement type
 * a sense of place and history rather than reading as a spreadsheet.
 * The tone is calm, welcoming, and evocative per the design spec.
 */
export const SETTLEMENT_DESCRIPTIONS: Readonly<Record<SettlementLevel, string>> = {
  Tent: "A humble canvas shelter, the first sign of civilization in the wilderness. It sways in the wind but keeps the rain out.",
  Hut: "Walls of woven branches and packed earth. Sturdier than canvas, and warm enough to sleep through a cold night.",
  Cottage: "A proper dwelling with a stone foundation and a hearth that stays lit through the evening. Smoke curls from the chimney.",
  House: "A solid timber home with shuttered windows and a locked door. Families put down roots here.",
  Manor: "A sprawling estate with outbuildings and a private well. The household has servants, and the fields stretch to the treeline.",
  Hamlet: "A cluster of homes gathered around a shared well. Children play in the lane, and neighbors know each other by name.",
  Village: "A thriving community with a mill, a market square, and a chapel. Travelers stop here on their way to somewhere larger.",
  Town: "Cobbled streets, a council hall, and walls thick enough to discourage bandits. Goods flow in from the surrounding farms each morning.",
  City: "Grand buildings of stone and timber, a cathedral spire visible for miles, and streets busy with commerce from dawn to dusk.",
  Citadel: "A fortress of the realm, seat of power and last refuge in times of trouble. Its walls have never fallen.",

  // Special buildings
  Farm: "Cleared fields and a stone barn. Workers rise before dawn to tend the crops, and the harvest feeds the realm through winter.",
  Market: "An open-air market square where goods change hands from morning to night. The sound of haggling carries on the wind.",
  Workshop: "A clutter of tools, forges, and workbenches. Craftspeople shape raw materials into goods the realm needs.",
  Library: "Towering shelves of scrolls and codices, where scholars preserve the realm's accumulated knowledge for future generations.",
  TownHall: "A sturdy civic building where administrators coordinate the business of governance and keep the realm running smoothly.",
  Aqueduct: "Arched stone channels that carry fresh water across miles of countryside, turning dry ground into productive land.",
  Shrine: "A sacred enclosure where the realm honors the old powers. Incense drifts skyward and the faithful leave offerings at the stone altar.",
  Bank: "A fortified treasury where the realm's wealth is stored and lent. Ledgers track every coin, and vault doors stand thick as castle walls.",
  Apothecary: "A workshop of remedies and tinctures, where dried herbs hang from the rafters and the apothecary measures cures by the drop.",

  // Tier 4 special buildings (Golden Age)
  Cathedral: "A soaring cathedral of glass and stone, its spire piercing the clouds. Pilgrims travel from every corner of the realm to witness its radiance.",
  Embassy: "A grand hall of polished marble where envoys from distant lands broker alliances, negotiate treaties, and share the wealth of nations.",
  Observatory: "A domed tower perched on the highest ground, where astronomers chart the heavens and unlock secrets written in the stars.",
  // Tier 5 special buildings (Age of Legends)
  Garden: "Terraced gardens of impossible beauty, where every bloom is cultivated with philosophical precision and the air hums with tranquility.",
  Laboratory: "A sprawling laboratory of alchemical apparatus, crucibles, and retorts, where the boundaries of matter are tested and redefined.",
  HerosHall: "A mead hall of legendary renown, where heroes gather to feast and plan their next great quest. Their deeds echo through the ages.",
  // Tier 6 special buildings (Age of Myths)
  Temple: "A temple of Living stone, where myth and devotion intertwine. The divine presence is palpable, and the faithful are never turned away.",
  Oracle: "A sacred precinct where the veil between worlds grows thin. The oracle speaks in riddles that pierce the veil of the future.",
  EternalSpire: "A spire that defies time itself, its summit lost in the clouds. Legends say it will stand when all else has crumbled to dust.",
};

/**
 * Returns the flavor description for a settlement level.
 */
export function getDescription(level: SettlementLevel): string {
  return SETTLEMENT_DESCRIPTIONS[level] ?? "";
}