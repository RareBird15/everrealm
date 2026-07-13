// src/ui/hooks/useGame.ts

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState } from "../../engine/state/GameState";
import type { GameCommand } from "../../engine/events/GameCommand";
import type { GameError } from "../../engine/events/GameError";
import type { GameEvent } from "../../engine/events/GameEvent";
import type { Result } from "../../shared/types";
import type { SettlementLevel } from "../../engine/settlements/types";
import type { TechNodeId } from "../../engine/techtree/types";
import { initialState } from "../../engine/state/initialState";
import { executeCommand, reconcileTime, effectivePassiveRate, type CommandResult } from "../../engine/commands";
import { saveGame, loadGame, deleteSave } from "../../storage/save";
import { ESTABLISH_COST } from "../../engine/settlements/establish";
import { canAccommodate } from "../../engine/settlements/capacity";
import { getImprovement } from "../../engine/improvements/catalog";
import { summarizeEffects } from "../../engine/improvements/effects";
import { findStack } from "../../engine/settlements/stacks";
import { isFinalAge } from "../../engine/ages/definitions";
import { AGE_ADVANCE_COST } from "../../engine/ages/advance";

export interface GameApi {
  readonly state: GameState;
  readonly error: GameError | null;
  readonly dismissError: () => void;
  readonly needsRealmName: boolean;
  readonly offlineEarnings: number | null;
  readonly dismissOfflineEarnings: () => void;

  // Derived state
  readonly canEstablish: boolean;
  readonly canAdvanceAge: boolean;
  readonly effectiveCapacity: number;
  readonly passiveRatePerHour: number;

  // Actions
  readonly setRealmName: (name: string) => void;
  readonly establishSettlement: () => void;
  readonly developSettlement: (age: GameState["age"], level: SettlementLevel, target?: SettlementLevel) => void;
  readonly purchaseImprovement: (improvementId: string) => void;
  readonly advanceAge: () => void;
  readonly unlockTech: (techId: TechNodeId) => void;
  readonly resetGame: () => void;
}

function computeEffectiveCapacity(state: GameState): number {
  let capacity = state.capacity;
  for (const id of state.improvements) {
    const imp = getImprovement(id);
    if (imp) {
      capacity += summarizeEffects(imp.effects).capacityBonus;
    }
  }
  // Town Hall capacity bonus is handled by engine's effectiveCapacity,
  // but we replicate it here for the UI's derived value.
  for (const stack of state.settlements) {
    if (stack.level === "TownHall") {
      capacity += stack.quantity;
    }
  }
  return capacity;
}

export function useGame(): GameApi {
  const savedState = useRef<GameState | null>(loadGame());
  const hasSave = savedState.current !== null;

  const [state, setState] = useState<GameState>(() => {
    if (hasSave) {
      return savedState.current!;
    }
    // No save — start with empty state, realm name set later
    return initialState("", Date.now());
  });
  const [error, setError] = useState<GameError | null>(null);
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Save on every state change (skip empty realm name — before setup)
  useEffect(() => {
    if (state.realmName) {
      saveGame(state);
    }
  }, [state]);

  // Reconcile passive time on mount — only for existing saves
  useEffect(() => {
    if (!hasSave) return;
    const current = stateRef.current;
    const result = reconcileTime(current, Date.now());
    if (result.success && result.value.events.length > 0) {
      setState(result.value.state);
      // Extract passive amount for the "while you were away" banner
      const passiveAmount = result.value.events
        .filter((e: GameEvent) => e.type === "PassiveProsperityApplied")
        .reduce((sum: number, e: GameEvent) => {
          return e.type === "PassiveProsperityApplied" ? sum + e.amount : sum;
        }, 0);
      if (passiveAmount > 0) {
        setOfflineEarnings(passiveAmount);
      }
    }
    // Only run once on mount
  }, []);

  // Periodic passive prosperity tick
  // Base rate is 120/hour (2/min), so a 30s interval yields ~1 prosperity
  // per tick at base rate. computePassive preserves sub-unit time, so
  // shorter intervals don't lose fractional accrual.
  useEffect(() => {
    const TICK_MS = 30_000;
    const interval = setInterval(() => {
      const current = stateRef.current;
      const result = reconcileTime(current, Date.now());
      if (result.success && result.value.events.length > 0) {
        setState(result.value.state);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const dispatch = useCallback(
    (command: GameCommand): boolean => {
      const current = stateRef.current;
      const result: Result<CommandResult, GameError> = executeCommand(
        current,
        command,
        Date.now(),
      );

      if (!result.success) {
        setError(result.error);
        return false;
      }

      setError(null);
      // Type narrowing: we know result.success is true here
      const successResult = result as { success: true; value: CommandResult };
      setState(successResult.value.state);
      return true;
    },
    [],
  );

  const establishSettlement = useCallback(() => {
    dispatch({ type: "EstablishSettlement" });
  }, [dispatch]);

  const developSettlement = useCallback(
    (age: GameState["age"], level: SettlementLevel, target?: SettlementLevel) => {
      const cmd: GameCommand = target !== undefined
        ? { type: "DevelopSettlement", age, level, target }
        : { type: "DevelopSettlement", age, level };
      dispatch(cmd);
    },
    [dispatch],
  );

  const purchaseImprovement = useCallback(
    (improvementId: string) => {
      dispatch({
        type: "PurchaseImprovement",
        improvementId: improvementId as never,
      });
    },
    [dispatch],
  );

  const advanceAge = useCallback(() => {
    dispatch({ type: "AdvanceAge" });
  }, []);

  const unlockTech = useCallback(
    (techId: TechNodeId) => {
      dispatch({ type: "UnlockTech", techId });
    },
    [dispatch],
  );

  const setRealmName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, realmName: name }));
  }, []);

  const resetGame = useCallback(() => {
    deleteSave();
    setState(initialState("", Date.now()));
    setError(null);
    setOfflineEarnings(null);
  }, []);

  const dismissError = useCallback(() => setError(null), []);
  const dismissOfflineEarnings = useCallback(() => setOfflineEarnings(null), []);

  // Derived state
  const effectiveCapacity = computeEffectiveCapacity(state);
  const passiveRatePerHour = effectivePassiveRate(state);
  const canEstablish =
    state.prosperity >= ESTABLISH_COST &&
    canAccommodate(state.settlements, effectiveCapacity);

  const citadelCount =
    findStack(state.settlements, state.age, "Citadel")?.quantity ?? 0;
  const canAdvanceAge =
    !isFinalAge(state.age) &&
    citadelCount >= 2 &&
    state.prosperity >= AGE_ADVANCE_COST;

  return {
    state,
    error,
    dismissError,
    needsRealmName: !state.realmName,
    offlineEarnings,
    dismissOfflineEarnings,
    canEstablish,
    canAdvanceAge,
    effectiveCapacity,
    passiveRatePerHour,
    setRealmName,
    establishSettlement,
    developSettlement,
    purchaseImprovement,
    advanceAge,
    unlockTech,
    resetGame,
  };
}