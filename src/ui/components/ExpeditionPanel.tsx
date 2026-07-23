// src/ui/components/ExpeditionPanel.tsx

import { useState } from "react";
import type { GameApi } from "../hooks/useGame";
import type { ExpeditionDestinationId } from "../../engine/expeditions/types";
import { getDestination } from "../../engine/expeditions/definitions";

interface Props {
  readonly game: GameApi;
}

/**
 * Pochteca Expeditions panel — v1.1.0.
 *
 * Shows available destinations, pending expeditions, and active bonuses.
 * Unlocked starting from the Age of Growth (index 1).
 */
export function ExpeditionPanel({ game }: Props) {
  const [selectedDest, setSelectedDest] = useState<ExpeditionDestinationId | null>(null);

  const state = game.state;
  const destinations = game.availableDestinations;
  const slotsUsed = game.expeditionSlotsUsed;
  const slotsMax = game.expeditionSlotsMax;

  // Don't render if no destinations are available yet (Founding Age)
  if (destinations.length === 0) return null;

  const selectedDef = selectedDest ? getDestination(selectedDest) : null;
  const canSend = selectedDest !== null && game.canSendExpeditionFlag(selectedDest);

  return (
    <section aria-label="Pochteca Expeditions">
      <h2>Pochteca Expeditions</h2>

      <p className="form-help">
        Send long-distance merchants to trade with distant lands.
        Each expedition costs Cacao and returns after a set number of turns
        with a reward. You may have up to {slotsMax} expeditions in progress at once.
        Slots used: {slotsUsed}/{slotsMax}.
      </p>

      {/* Send Expedition */}
      <div className="expedition-send">
        <label htmlFor="expedition-dest">Expedition destination:</label>
        <select
          id="expedition-dest"
          value={selectedDest ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedDest(val ? (val as ExpeditionDestinationId) : null);
          }}
          aria-label="Choose a destination for your pochteca expedition"
        >
          <option value="">Select a destination...</option>
          {destinations.map((dest) => {
            const canAfford = state.cacao >= dest.cost;
            const slotsAvailable = slotsUsed < slotsMax;
            const disabled = !canAfford || !slotsAvailable;
            return (
              <option
                key={dest.id}
                value={dest.id}
                disabled={disabled}
              >
                {dest.name} — {dest.cost} Cacao, {dest.turns} turns{disabled ? !canAfford ? " (not enough Cacao)" : " (no slots)" : ""}
              </option>
            );
          })}
        </select>

        {selectedDef && (
          <div className="expedition-details">
            <p><strong>{selectedDef.name}</strong></p>
            <p className="flavor-text">{selectedDef.description}</p>
            <p>Cost: {selectedDef.cost} Cacao</p>
            <p>Travel time: {selectedDef.turns} turns</p>
            <p>Possible rewards:</p>
            <ul>
              <li>{selectedDef.rewards[0].description}</li>
              <li>{selectedDef.rewards[1].description}</li>
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (selectedDest) {
              game.sendExpedition(selectedDest);
              setSelectedDest(null);
            }
          }}
          disabled={!canSend}
          aria-label={
            canSend && selectedDef
              ? `Send expedition to ${selectedDef.name} for ${selectedDef.cost} Cacao`
              : "Cannot send expedition"
          }
        >
          Send Expedition
        </button>
      </div>

      {/* Pending Expeditions */}
      {game.pendingExpeditions.length > 0 && (
        <div className="expedition-pending">
          <h3>Expeditions in Progress</h3>
          <ul>
            {game.pendingExpeditions.map((exp) => {
              const dest = getDestination(exp.destination);
              return (
                <li key={exp.id}>
                  {dest?.name ?? exp.destination} — {exp.turnsRemaining} turn{exp.turnsRemaining !== 1 ? "s" : ""} remaining
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Active Bonuses */}
      {game.activeExpeditionBonuses.length > 0 && (
        <div className="expedition-bonuses">
          <h3>Active Expedition Bonuses</h3>
          <ul>
            {game.activeExpeditionBonuses.map((bonus) => (
              <li key={bonus.id}>
                {bonus.description} — {bonus.turnsRemaining} turn{bonus.turnsRemaining !== 1 ? "s" : ""} remaining
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}