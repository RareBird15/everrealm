// src/ui/components/ResourcePanel.tsx

import { useMemo } from "react";
import type { GameState } from "../../engine/state/GameState";
import { calculateResources } from "../../engine/resources/calculate";
import { RESOURCES } from "../../engine/resources/types";

interface Props {
  readonly state: GameState;
}

/**
 * Resource Pipeline panel — v1.2.0.
 *
 * Shows the balance of intermediate resources (Trade Goods, Knowledge, Materials)
 * that flow between specializations. Only displays resources that have been
 * unlocked by the current Age.
 *
 * Screen-reader friendly: uses a definition list with clear labels for
 * production, consumption, and status. Idle consumers are announced.
 */
export function ResourcePanel({ state }: Props) {
  const report = useMemo(() => calculateResources(state), [state]);

  // Only show if at least one resource is active
  const activeResources = report.balances.filter((b) => b.active);
  if (activeResources.length === 0) return null;

  return (
    <section aria-label="Realm Resources">
      <h2>Realm Resources</h2>

      <p className="form-help">
        Some specializations produce resources that others consume.
        Balance your production and consumption for maximum efficiency.
        Surplus is wasted. Deficit means consumers go idle.
      </p>

      <dl>
        {activeResources.map((balance) => {
          const def = RESOURCES.find((r) => r.id === balance.resource);
          const idle = report.idleConsumers[balance.resource] || 0;
          const isDeficit = balance.net < 0;
          const isSurplus = balance.net > 0;
          const statusText =
            balance.net === 0
              ? "Balanced"
              : balance.net > 0
                ? `${balance.net} surplus (wasted)`
                : `${Math.abs(balance.net)} deficit, ${idle} consumer${idle === 1 ? "" : "s"} idle`;

          return (
            <div key={balance.resource}>
              <dt>{def?.name ?? balance.resource}</dt>
              <dd className={isDeficit ? "resource-deficit" : isSurplus ? "resource-surplus" : ""}>
                {balance.produced} produced, {balance.consumed} consumed, {statusText}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}