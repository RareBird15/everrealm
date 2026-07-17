// src/ui/components/StoryLog.tsx

import type { StoryRecord } from "../../engine/story/types";
import { getAge } from "../../engine/ages/definitions";
import { getLegacy } from "../../engine/prestige/definitions";

interface Props {
  readonly story: readonly StoryRecord[];
}

function storyText(record: StoryRecord): string {
  switch (record.kind) {
    case "SettlementEstablished":
      return `Turn ${record.turn}: Established a ${record.tier}.`;
    case "SettlementsUpgraded":
      return `Turn ${record.turn}: All ${record.fromTier}s upgraded to ${record.toTier}s (${record.researchName}).`;
    case "SpecializationUnlocked":
      return `Turn ${record.turn}: ${record.building} unlocked (${record.researchName}).`;
    case "ResearchCompleted":
      return `Turn ${record.turn}: ${record.researchName} researched.`;
    case "SettlementSpecialized":
      return `Turn ${record.turn}: Settlement specialized as ${record.building}.`;
    case "LandPurchased":
      return `Turn ${record.turn}: Purchased a land parcel for ${record.cost} Cacao.`;
    case "AgeAdvanced": {
      const age = getAge(record.toAge);
      return `Turn ${record.turn}: Welcome to the ${age?.name ?? "new Age"}.`;
    }
    case "Ascended": {
      const legacy = getLegacy(record.legacy);
      return `Turn ${record.turn}: Ascended! Legacy: ${legacy?.name ?? record.legacy}. New realm begins.`;
    }
    case "CacaoEarned":
      return `Turn ${record.turn}: +${record.amount} Cacao from ${record.source}.`;
  }
}

export function StoryLog({ story }: Props) {
  if (story.length === 0) return null;

  const recent = [...story].reverse().slice(0, 20);

  return (
    <section aria-label="Realm History">
      <h2>Realm History</h2>
      <ol reversed>
        {recent.map((record, i) => (
          <li key={i}>{storyText(record)}</li>
        ))}
      </ol>
    </section>
  );
}