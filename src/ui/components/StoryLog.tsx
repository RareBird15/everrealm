// src/ui/components/StoryLog.tsx

import type { StoryRecord } from "../../engine/story/types";
import { getAge } from "../../engine/ages/definitions";
import { getImprovement } from "../../engine/improvements/catalog";
import { getTechNode } from "../../engine/techtree/definitions";

interface Props {
  readonly story: readonly StoryRecord[];
}

function storyText(record: StoryRecord): string {
  switch (record.kind) {
    case "SettlementEstablished":
      return `Turn ${record.turn}: Established a ${record.level}.`;
    case "SettlementDeveloped":
      if (record.source === "ChainReaction") {
        return `Turn ${record.turn}: Chain reaction created a ${record.toLevel}.`;
      }
      return `Turn ${record.turn}: Developed ${record.fromLevel} into ${record.toLevel}.`;
    case "SettlementLevelDiscovered":
      return `Turn ${record.turn}: Discovered the ${record.level}.`;
    case "ImprovementPurchased": {
      const imp = getImprovement(record.improvementId);
      return `Turn ${record.turn}: Built ${imp?.name ?? "an improvement"}.`;
    }
    case "CapacityIncreased":
      return `Turn ${record.turn}: Settlement Capacity increased to ${record.newCapacity}.`;
    case "AgeAdvanced": {
      const age = getAge(record.age);
      const ageName = age?.name ?? "new Age";
      const hasNewContent =
        record.newTechsAvailable.length > 0 ||
        record.newImprovementsAvailable.length > 0;
      if (hasNewContent) {
        return `Turn ${record.turn}: Welcome to the ${ageName}. New discoveries and improvements are now available.`;
      }
      return `Turn ${record.turn}: Welcome to the ${ageName}.`;
    }
    case "TechUnlocked": {
      const tech = getTechNode(record.techId);
      return `Turn ${record.turn}: ${tech?.name ?? "New discovery"} unlocked.`;
    }
  }
}

export function StoryLog({ story }: Props) {
  if (story.length === 0) {
    return null;
  }

  // Show most recent first
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