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
      return `Turn ${record.turn}: Entered the ${age?.name ?? "new Age"}.`;
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