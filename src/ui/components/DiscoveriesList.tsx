// src/ui/components/DiscoveriesList.tsx

import type { GameState } from "../../engine/state/GameState";
import type { TechNodeId } from "../../engine/techtree/types";
import { TECH_NODES, meetsPrerequisites } from "../../engine/techtree/definitions";

interface Props {
  readonly state: GameState;
  readonly onUnlock: (techId: TechNodeId) => void;
}

export function DiscoveriesList({ state, onUnlock }: Props) {
  const unlocked = TECH_NODES.filter((n) =>
    state.unlockedTechs.some((u) => u === n.id),
  );
  const available = TECH_NODES.filter(
    (n) => !state.unlockedTechs.some((u) => u === n.id),
  );

  if (available.length === 0 && unlocked.length === 0) {
    return null;
  }

  return (
    <section aria-label="Discoveries">
      <h2>Discoveries</h2>

      {available.length > 0 && (
        <ul>
          {available.map((node) => {
            const prereqsMet = meetsPrerequisites(node, state.unlockedTechs);
            const canAfford = state.prosperity >= node.cost;
            const disabled = !canAfford || !prereqsMet;

            const prereqLabel = node.requires && node.requires.length > 0
              ? " — requires any Tier 1 discovery"
              : "";

            return (
              <li key={node.id as string}>
                <span>
                  {node.name} (Tier {node.tier}, {node.cost} Prosperity) — {node.description}
                  {prereqLabel}
                </span>
                {!prereqsMet && (
                  <span className="prereq-locked"> (Locked: unlock a Tier 1 discovery first)</span>
                )}
                {prereqsMet && (
                  <button
                    type="button"
                    onClick={() => onUnlock(node.id)}
                    disabled={disabled}
                    aria-label={`Unlock ${node.name} for ${node.cost} Prosperity — ${node.description}`}
                  >
                    Unlock ({node.cost})
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {unlocked.length > 0 && (
        <details>
          <summary>Unlocked Discoveries ({unlocked.length})</summary>
          <ul>
            {unlocked.map((node) => (
              <li key={node.id as string}>
                {node.name} (Tier {node.tier}) — {node.buildingDescription}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}