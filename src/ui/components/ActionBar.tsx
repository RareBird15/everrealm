// src/ui/components/ActionBar.tsx

import { useState } from "react";
import type { GameError } from "../../engine/events/GameError";
import { ESTABLISH_COST } from "../../engine/settlements/establish";
import { AGE_ADVANCE_COST } from "../../engine/ages/advance";

interface Props {
  readonly canEstablish: boolean;
  readonly canAdvanceAge: boolean;
  readonly error: GameError | null;
  readonly onEstablish: () => void;
  readonly onAdvanceAge: () => void;
  readonly onDismissError: () => void;
  readonly onReset: () => void;
}

function errorText(error: GameError): string {
  switch (error.type) {
    case "InsufficientProsperity":
      return `Need ${error.cost} Prosperity, but only have ${error.available}.`;
    case "SettlementCapacityFull":
      return `Settlement Capacity is full (${error.current} / ${error.capacity}).`;
    case "NoEligibleSettlements":
      return `No ${error.level} settlements available to develop.`;
    case "ImprovementNotFound":
      return `Improvement not found.`;
    case "ImprovementAlreadyPurchased":
      return `Already purchased.`;
    case "AgeAdvancementNotAvailable":
      return `Need 2 Citadels to advance (have ${error.citadelCount}).`;
    case "InvalidAgeOrLevel":
      return `Cannot develop ${error.level}.`;
    case "TechNotFound":
      return `Discovery not found.`;
    case "TechAlreadyUnlocked":
      return `Already unlocked.`;
    case "TechPrerequisitesNotMet":
      return `Requires unlocking a Tier 1 discovery first.`;
    case "BuildingNotUnlocked":
      return `${error.building} has not been unlocked yet.`;
    case "SourceLevelTooLow":
      return `${error.building} requires at least ${error.minimumLevel}s to build (you used ${error.sourceLevel}s).`;
  }
}

export function ActionBar({
  canEstablish,
  canAdvanceAge,
  error,
  onEstablish,
  onAdvanceAge,
  onDismissError,
  onReset,
}: Props) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <section aria-label="Actions">
      <h2>Actions</h2>

      {error && (
        <div role="alert">
          <p>{errorText(error)}</p>
          <button type="button" onClick={onDismissError}>
            Dismiss
          </button>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={onEstablish}
          disabled={!canEstablish}
          aria-label={`Establish Settlement (costs ${ESTABLISH_COST} Prosperity) — keyboard shortcut E`}
        >
          Establish Settlement ({ESTABLISH_COST})
        </button>

        <button
          type="button"
          onClick={onAdvanceAge}
          disabled={!canAdvanceAge}
          aria-label={`Advance to next Age (requires 2 Citadels and ${AGE_ADVANCE_COST} Prosperity) — keyboard shortcut A`}
        >
          Advance Age
        </button>

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
                onReset();
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

      <details className="shortcuts">
        <summary>Keyboard Shortcuts</summary>
        <dl>
          <dt>E</dt>
          <dd>Establish Settlement</dd>
          <dt>A</dt>
          <dd>Advance to next Age</dd>
          <dt>T</dt>
          <dd>Develop Tent</dd>
          <dt>H</dt>
          <dd>Develop Hut</dd>
          <dt>C</dt>
          <dd>Develop Cottage</dd>
          <dt>U</dt>
          <dd>Develop House</dd>
          <dt>N</dt>
          <dd>Develop Manor</dd>
          <dt>V</dt>
          <dd>Develop Village</dd>
          <dt>W</dt>
          <dd>Develop Town</dd>
          <dt>I</dt>
          <dd>Develop City</dd>
          <dt>F</dt>
          <dd>Develop into Farm</dd>
          <dt>M</dt>
          <dd>Develop into Market</dd>
          <dt>O</dt>
          <dd>Develop into Workshop</dd>
          <dt>L</dt>
          <dd>Develop into Library</dd>
          <dt>G</dt>
          <dd>Develop into Town Hall</dd>
          <dt>Q</dt>
          <dd>Develop into Aqueduct</dd>
        </dl>
        <p className="form-help">
          Shortcuts develop the first eligible stack. Standard level shortcuts
          (T through I) develop that level using the default progression path.
          Special building shortcuts (F, M, O, L, G, Q) develop the first
          available standard level stack into that building. Shortcuts work
          except when typing in a text field.
        </p>
      </details>
    </section>
  );
}