// src/ui/components/ResearchList.tsx

import type { GameState } from "../../engine/state/GameState";
import type { ResearchNode, ResearchId } from "../../engine/research/types";
import { researchForAge, ALL_RESEARCH } from "../../engine/research/definitions";
import { canResearch, researchCost } from "../../engine/research/researchAction";
import { getAge, getAgeByIndex } from "../../engine/ages/definitions";
import type { GameApi } from "../hooks/useGame";

interface Props {
  readonly game: GameApi;
}

function ResearchRow({
  node,
  state,
  cost,
  onResearch,
}: {
  readonly node: ResearchNode;
  readonly state: GameState;
  readonly cost: number;
  readonly onResearch: (id: ResearchId) => void;
}) {
  const canDo = canResearch(state, node.id);
  const isCompleted = state.completedResearch.some((r) => r === node.id);

  return (
    <li>
      <strong>{node.name}</strong>
      {isCompleted && <span aria-label="Completed"> ✓</span>}
      <p className="flavor-text">{node.description}</p>
      {node.category === "SettlementUpgrade" && node.fromTier && node.toTier && (
        <p>Effect: Upgrades all {node.fromTier}s to {node.toTier}s.</p>
      )}
      {node.category === "Specialization" && node.buildingDescription && (
        <p>Building: {node.buildingDescription}</p>
      )}
      <p>Cost: {cost} Cacao</p>
      {!isCompleted && (
        <button
          type="button"
          onClick={() => onResearch(node.id)}
          disabled={!canDo}
          aria-label={`Research ${node.name} for ${cost} Cacao`}
        >
          Research
        </button>
      )}
    </li>
  );
}

export function ResearchList({ game }: Props) {
  const { state, researchUpgrade } = game;
  const currentAge = getAge(state.age);

  // Show incomplete research from current Age
  const ageResearch = researchForAge(state.age).filter(
    (r) => !state.completedResearch.some((c) => c === r.id),
  );

  const completedInAge = researchForAge(state.age).filter((r) =>
    state.completedResearch.some((c) => c === r.id),
  );

  // Show incomplete research from previous Ages (carried over)
  const previousAgeResearch = ALL_RESEARCH.filter((r) => {
    const researchAge = getAge(r.age);
    if (!researchAge || !currentAge) return false;
    return researchAge.index < currentAge.index &&
      !state.completedResearch.some((c) => c === r.id);
  });

  // Oracle or Codex of Ages legacy: reveal next Age's research
  const hasOracle = state.settlements.some((s) => s.specialization === "Oracle");
  const hasCodexLegacy = state.prestige.legacies.includes("CodexOfAges");
  const canSeeNextAge = hasOracle || hasCodexLegacy;
  const nextAgeObj = currentAge ? getAgeByIndex(currentAge.index + 1) : undefined;
  const nextAgeResearch = canSeeNextAge && nextAgeObj
    ? researchForAge(nextAgeObj.id)
    : [];

  if (ageResearch.length === 0 && completedInAge.length === 0 && previousAgeResearch.length === 0 && nextAgeResearch.length === 0) return null;

  return (
    <section aria-label="Research">
      <h2>Research — {currentAge?.name}</h2>
      <p>
        Research upgrades all settlements simultaneously or unlocks new
        specialization buildings. No merging required.
      </p>
      {nextAgeResearch.length > 0 && (
        <details>
          <summary>Next Age Preview — {nextAgeObj?.name} ({nextAgeResearch.length})</summary>
          <p className="flavor-text">
            The Oracle reveals what awaits in the next Age. Plan your realm
            strategically.
          </p>
          <ul>
            {nextAgeResearch.map((node) => (
              <li key={node.id}>
                <strong>{node.name}</strong>
                <p className="flavor-text">{node.description}</p>
                {node.category === "SettlementUpgrade" && node.fromTier && node.toTier && (
                  <p>Effect: Upgrades all {node.fromTier}s to {node.toTier}s.</p>
                )}
                {node.category === "Specialization" && node.buildingDescription && (
                  <p>Building: {node.buildingDescription}</p>
                )}
                <p>Cost: {node.cost} Cacao</p>
              </li>
            ))}
          </ul>
        </details>
      )}
      {previousAgeResearch.length > 0 && (
        <details>
          <summary>Previous Age Research ({previousAgeResearch.length})</summary>
          <ul>
            {previousAgeResearch.map((node) => (
              <ResearchRow
                key={node.id}
                node={node}
                state={state}
                cost={researchCost(state, node)}
                onResearch={researchUpgrade}
              />
            ))}
          </ul>
        </details>
      )}
      {ageResearch.length > 0 && (
        <ul>
          {ageResearch.map((node) => (
            <ResearchRow
              key={node.id}
              node={node}
              state={state}
              cost={researchCost(state, node)}
              onResearch={researchUpgrade}
            />
          ))}
        </ul>
      )}
      {completedInAge.length > 0 && (
        <details>
          <summary>Completed Research ({completedInAge.length})</summary>
          <ul>
            {completedInAge.map((node) => (
              <ResearchRow
                key={node.id}
                node={node}
                state={state}
                cost={node.cost}
                onResearch={researchUpgrade}
              />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}