// src/engine/story/generateChronicle.ts

import type { GameState } from "../state/GameState";
import type { StoryRecord } from "./types";
import type { AgeId } from "../ages/types";
import type { LegacyId } from "../prestige/types";
import { getAge } from "../ages/definitions";
import { getLegacy } from "../prestige/definitions";
import { getDestination } from "../expeditions/definitions";

/**
 * Generates a prose chronicle of the player's realm at ascension.
 *
 * The chronicle is a multi-paragraph narrative that weaves together
 * the player's actual choices — research, specialization, expeditions,
 * and expansion — into a shareable story.
 *
 * Rules:
 * 1. Never longer than 500 words.
 * 2. No system language (no "cacao," "turns," "tiers"). Translate to in-world language.
 * 3. Reflect the player's actual choices.
 * 4. Handle edge cases (blitz runs, long runs).
 * 5. Deterministic — same state always produces the same chronicle.
 */

/** Maps a specialization to a narrative name. */
function specializationName(building: string): string {
  const map: Record<string, string> = {
    Farm: "farms",
    Market: "markets",
    Workshop: "workshops",
    Codex: "codex houses",
    Council: "council houses",
    Aqueduct: "aqueducts",
    Estate: "noble estates",
    Treasury: "treasuries",
    Observatory: "observatories",
    CraftDistrict: "craft districts",
    TradeMission: "trade missions",
    Academy: "academies",
    WarShrine: "halls of valor",
    AlchemistsLab: "alchemist's labs",
    Temple: "temples",
    Garden: "gardens",
    Oracle: "oracles",
    Pyramid: "pyramids",
    Stela: "stelae",
    Sanctum: "sanctums",
  };
  return map[building] ?? building.toLowerCase();
}

/**
 * Generates the chronicle prose from the final game state.
 *
 * @param state The game state at the moment of ascension (before reset)
 * @param legacyId The legacy the player chose for this ascension
 * @returns A string containing the chronicle, max 500 words.
 */
export function generateChronicle(state: GameState, legacyId?: string): string {
  const realmName = state.realmName || "the realm";
  const paragraphs: string[] = [];

  // ── Opening ──
  const totalSettlements = state.settlements.length;
  const specializedCount = state.settlements.filter((s) => s.specialization !== null).length;

  paragraphs.push(
    `In the beginning, the people of ${realmName} raised their first tents on unfamiliar ground. They had little — some tools, some seeds, and the will to build something that would last.`
  );

  // ── Build turn boundaries for each Age from AgeAdvancement events ──
  const completedResearchNames = state.story
    .filter((r): r is Extract<StoryRecord, { kind: "ResearchCompleted" }> => r.kind === "ResearchCompleted")
    .map((r) => r.researchName);

  const ageAdvances = state.story.filter(
    (r): r is Extract<StoryRecord, { kind: "AgeAdvanced" }> => r.kind === "AgeAdvanced"
  );

  const ageBoundaries: { age: AgeId; startTurn: number; endTurn: number }[] = [];
  let currentStart = 0;
  for (const advance of ageAdvances) {
    ageBoundaries.push({
      age: advance.fromAge,
      startTurn: currentStart,
      endTurn: advance.turn,
    });
    currentStart = advance.turn;
  }
  // Final Age (the one the player ascended in)
  if (ageAdvances.length > 0) {
    const lastAdvance = ageAdvances[ageAdvances.length - 1]!;
    ageBoundaries.push({
      age: lastAdvance.toAge,
      startTurn: currentStart,
      endTurn: state.turn,
    });
  } else {
    // Player never advanced — stayed in Founding Age
    ageBoundaries.push({
      age: "FoundingAge",
      startTurn: 0,
      endTurn: state.turn,
    });
  }

  // ── One paragraph per Age ──
  for (const boundary of ageBoundaries) {
    const age = getAge(boundary.age);
    if (!age) continue;

    // Find research completed in this Age's turn range
    const researchInAge = completedResearchNames.filter((name) => {
      const record = state.story.find(
        (r) => r.kind === "ResearchCompleted" && r.researchName === name
      );
      return record && record.turn >= boundary.startTurn && record.turn < boundary.endTurn;
    });

    if (researchInAge.length === 0 && boundary.age !== "FoundingAge") continue;

    const ageDesc = age.name;
    let para = `In the ${ageDesc}, `;

    if (researchInAge.length > 0) {
      const researchList = researchInAge.slice(0, 3); // Max 3 per Age
      if (researchList.length === 1) {
        para += `the people learned ${researchList[0]}. `;
      } else if (researchList.length === 2) {
        para += `the people learned ${researchList[0]} and ${researchList[1]}. `;
      } else {
        para += `the people learned ${researchList[0]}, ${researchList[1]}, and ${researchList[2]}. `;
      }
    } else {
      para += `the people laid their foundations. `;
    }

    if (boundary.age === "FoundingAge" && totalSettlements > 0) {
      para += `By the end of this period, ${totalSettlements} settlement${totalSettlements !== 1 ? "s" : ""} dotted the landscape.`;
    }

    paragraphs.push(para);
  }

  // ── Expedition highlights ──
  if (state.completedExpeditions.length > 0) {
    const expeditionCount = state.completedExpeditions.length;
    const destinations = [...new Set(state.completedExpeditions.map((e) => {
      const dest = getDestination(e.destination);
      return dest?.name ?? e.destination;
    }))];

    let para = `Pochteca traveled to ${destinations.length} distant land${destinations.length !== 1 ? "s" : ""}`;
    if (destinations.length <= 3) {
      para += ` — ${destinations.join(", ")}`;
    }
    para += `. Over the course of the realm's history, ${expeditionCount} expedition${expeditionCount !== 1 ? "s" : ""} returned with goods and stories from beyond the horizon.`;
    paragraphs.push(para);
  }

  // ── Final composition ──
  const specializationBreakdown = new Map<string, number>();
  for (const s of state.settlements) {
    if (s.specialization) {
      const name = specializationName(s.specialization);
      specializationBreakdown.set(name, (specializationBreakdown.get(name) ?? 0) + 1);
    }
  }

  let compPara = `At its height, the realm of ${realmName} spanned ${state.landParcels} parcels of land. `;
  compPara += `${totalSettlements} settlement${totalSettlements !== 1 ? "s" : ""} stood under its banner`;
  if (specializedCount > 0) {
    compPara += ` — ${specializedCount} specialized into prosperity buildings`;
  }
  compPara += `.`;

  if (specializationBreakdown.size > 0 && specializationBreakdown.size <= 5) {
    const specList = [...specializationBreakdown.entries()]
      .map(([name, count]) => `${count} ${name}`)
      .join(", ");
    compPara += ` The realm was known for its ${specList}.`;
  }

  paragraphs.push(compPara);

  // ── Ascension and legacy ──
  // The legacyId is passed in from ascend.ts because the "Ascended" story
  // record hasn't been added to state.story yet at the time we generate
  // the chronicle.
  const legacyToUse = legacyId ?? state.story.find(
    (r): r is Extract<StoryRecord, { kind: "Ascended" }> => r.kind === "Ascended"
  )?.legacy;
  if (legacyToUse) {
    const legacy = getLegacy(legacyToUse as LegacyId);
    const legacyName = legacy?.name ?? "a lasting legacy";
    const turns = state.turn;
    const turnDesc = turns < 20 ? "a brief but brilliant reign" : turns < 50 ? "a steady reign" : "a long and storied reign";
    paragraphs.push(
      `And so, after ${turnDesc} across six Ages, the ruler of ${realmName} chose the ${legacyName}. The Capital was transformed, and its people scattered to begin again — but what they built would echo into the next world, and the next, and the next.`
    );
  }

  // ── Assemble and enforce word limit ──
  let chronicle = paragraphs.join("\n\n");

  const words = chronicle.split(/\s+/);
  if (words.length > 500) {
    chronicle = words.slice(0, 500).join(" ") + "...";
  }

  return chronicle;
}