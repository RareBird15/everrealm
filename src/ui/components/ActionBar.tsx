// src/ui/components/ActionBar.tsx

import { useState } from "react";
import type { GameApi } from "../hooks/useGame";
import { LEGACIES } from "../../engine/prestige/definitions";
import type { LegacyId } from "../../engine/prestige/types";

interface Props {
  readonly game: GameApi;
}

export function ActionBar({ game }: Props) {
  const state = game.state;
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [showingLegacies, setShowingLegacies] = useState(false);

  return (
    <section aria-label="Actions">
      <h2>Actions</h2>

      {game.error && (
        <div role="alert">
          <p>{game.error}</p>
          <button type="button" onClick={game.dismissError}>
            Dismiss
          </button>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={game.establishSettlement}
          disabled={!game.canEstablish}
          aria-label={`Establish Settlement (costs ${game.establishCostNow} Cacao) — keyboard shortcut E`}
        >
          Establish Settlement ({game.establishCostNow})
        </button>

        <button
          type="button"
          onClick={game.buyLand}
          disabled={!game.canBuyLandFlag}
          aria-label={`Buy Land Parcel (costs ${game.landCostNow} Cacao)`}
        >
          Buy Land ({game.landCostNow})
        </button>

        <button
          type="button"
          onClick={game.advanceAge}
          disabled={!game.canAdvanceAge}
          aria-label="Advance to next Age — keyboard shortcut A"
        >
          Advance Age
        </button>

        {game.canAscendFlag && !showingLegacies && (
          <button
            type="button"
            onClick={() => setShowingLegacies(true)}
            aria-label="Ascend — transform your Capital into a permanent legacy"
          >
            Ascend
          </button>
        )}

        {!confirmingReset ? (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            aria-label="Start a new game (deletes current save)"
          >
            New Game
          </button>
        ) : (
          <span className="reset-confirm">
            <button
              type="button"
              onClick={() => {
                setConfirmingReset(false);
                game.resetGame();
              }}
              aria-label="Confirm new game — this will permanently delete your current realm"
            >
              Confirm New Game
            </button>
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              aria-label="Cancel new game"
            >
              Cancel
            </button>
          </span>
        )}
      </div>

      {showingLegacies && (
        <div className="legacy-select">
          <h3>Choose Your Legacy</h3>
          <p>
            Your Capital will be transformed into a permanent legacy that
            carries forward to your next playthrough. Choose wisely — this
            bonus shapes every future game.
          </p>
          {state.prestige.legacies.length > 0 && (
            <p>
              Current legacies ({state.prestige.legacies.length}/{3}):{" "}
              {state.prestige.legacies.map(l => {
                const def = LEGACIES.find(lg => lg.id === l);
                return def?.name ?? l;
              }).join(", ")}
            </p>
          )}
          {state.prestige.legacies.length >= 3 && (
            <p>
              You already have 3 legacies. Choosing a new one will replace
              the last one.
            </p>
          )}
          <ul>
            {LEGACIES.map((legacy) => (
              <li key={legacy.id}>
                <button
                  type="button"
                  onClick={() => {
                    setShowingLegacies(false);
                    game.ascend(legacy.id as LegacyId);
                  }}
                  aria-label={`Choose ${legacy.name} — ${legacy.description}`}
                >
                  <strong>{legacy.name}</strong>
                  <p>{legacy.description}</p>
                  <p className="flavor-text">Play style: {legacy.playStyle}</p>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setShowingLegacies(false)}
            aria-label="Cancel ascension"
          >
            Cancel
          </button>
        </div>
      )}

      <details className="shortcuts">
        <summary>Keyboard Shortcuts</summary>
        <dl>
          <dt>E</dt>
          <dd>Establish Settlement</dd>
          <dt>A</dt>
          <dd>Advance to next Age</dd>
        </dl>
        <p className="form-help">
          Shortcuts work except when typing in a text field. All other
          actions (research, specialize, buy land, ascend) are done via
          on-screen buttons for clarity.
        </p>
      </details>
    </section>
  );
}