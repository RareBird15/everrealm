// src/ui/components/ImprovementList.tsx

import type { GameState } from "../../engine/state/GameState";
import { IMPROVEMENTS, getImprovement } from "../../engine/improvements/catalog";

interface Props {
  readonly state: GameState;
  readonly onPurchase: (improvementId: string) => void;
}

export function ImprovementList({ state, onPurchase }: Props) {
  const purchased = new Set(state.improvements.map((id) => id as string));
  const available = IMPROVEMENTS.filter((imp) => !purchased.has(imp.id as string));

  return (
    <section aria-label="Realm Improvements">
      <h2>Realm Improvements</h2>

      {available.length === 0 && state.improvements.length > 0 && (
        <p>All improvements purchased.</p>
      )}

      {available.length > 0 && (
        <ul>
          {available.map((imp) => {
            const affordable = state.prosperity >= imp.cost;
            return (
              <li key={imp.id as string}>
                <span>
                  {imp.name} ({imp.cost} Prosperity) — {imp.description}
                </span>
                <button
                  type="button"
                  onClick={() => onPurchase(imp.id as string)}
                  disabled={!affordable}
                  aria-label={`Purchase ${imp.name} for ${imp.cost} Prosperity — ${imp.description}`}
                >
                  Purchase
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {state.improvements.length > 0 && (
        <details>
          <summary>Purchased Improvements ({state.improvements.length})</summary>
          <ul>
            {state.improvements.map((id) => {
              const imp = getImprovement(id);
              return (
                <li key={id as string}>{imp?.name ?? (id as string)}</li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}