// src/ui/components/SettlementList.tsx

import type { GameState } from "../../engine/state/GameState";
import type { SettlementStack, SettlementLevel, StandardLevel } from "../../engine/settlements/types";
import type { TechNodeId } from "../../engine/techtree/types";
import { getAge } from "../../engine/ages/definitions";
import { isMaxLevel, nextLevel, isSpecialBuilding, levelIndex } from "../../engine/settlements/progression";
import { getDescription } from "../../engine/settlements/descriptions";
import { TECH_NODES, isBuildingUnlocked } from "../../engine/techtree/definitions";

interface Props {
  readonly state: GameState;
  readonly onDevelop: (age: GameState["age"], level: SettlementLevel, target?: SettlementLevel) => void;
}

function SettlementRow({
  stack,
  unlockedTechs,
  onDevelop,
}: {
  readonly stack: SettlementStack;
  readonly unlockedTechs: readonly TechNodeId[];
  readonly onDevelop: (age: GameState["age"], level: SettlementLevel, target?: SettlementLevel) => void;
}) {
  const age = getAge(stack.age);
  const isSpecial = isSpecialBuilding(stack.level);
  const canDevelop = stack.quantity >= 2 && !isMaxLevel(stack.level) && !isSpecial;
  const next = isSpecial ? null : nextLevel(stack.level as StandardLevel);

  // Build list of available develop targets
  const targets: { label: string; target?: SettlementLevel }[] = [];
  if (canDevelop && next) {
    targets.push({ label: `Develop into ${next}` });
    // Add special building options if unlocked AND source level meets minimum
    const sourceIdx = levelIndex(stack.level as StandardLevel);
    for (const node of TECH_NODES) {
      if (isBuildingUnlocked(node.unlocksBuilding, unlockedTechs)) {
        const minIdx = levelIndex(node.minimumSourceLevel);
        if (sourceIdx >= minIdx) {
          targets.push({
            label: `Develop into ${node.unlocksBuilding}`,
            target: node.unlocksBuilding,
          });
        }
      }
    }
  }

  return (
    <li>
      <span>
        {age?.name} {stack.level} ×{stack.quantity}
      </span>
      <span className="settlement-description">{getDescription(stack.level)}</span>
      {canDevelop && targets.length === 1 && (
        <button
          type="button"
          onClick={() => onDevelop(stack.age, stack.level)}
          aria-label={`Develop ${stack.level} into ${next}`}
        >
          Develop
        </button>
      )}
      {canDevelop && targets.length > 1 && (
        <>
          {targets.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onDevelop(stack.age, stack.level, t.target)}
              aria-label={t.label}
            >
              {t.target ?? "Develop"}
            </button>
          ))}
        </>
      )}
      {!canDevelop && stack.quantity >= 2 && isMaxLevel(stack.level) && (
        <span aria-label="Maximum level reached">(Max)</span>
      )}
      {isSpecial && (
        <span aria-label={`${stack.level} — special building, cannot develop further`}>
          (Special)
        </span>
      )}
    </li>
  );
}

export function SettlementList({ state, onDevelop }: Props) {
  if (state.settlements.length === 0) {
    return (
      <section aria-label="Settlements">
        <h2>Settlements</h2>
        <p>No settlements yet. Establish one to begin.</p>
      </section>
    );
  }

  return (
    <section aria-label="Settlements">
      <h2>Settlements</h2>
      <ul>
        {state.settlements.map((stack, i) => (
          <SettlementRow
            key={`${stack.age}-${stack.level}-${i}`}
            stack={stack}
            unlockedTechs={state.unlockedTechs}
            onDevelop={onDevelop}
          />
        ))}
      </ul>
    </section>
  );
}