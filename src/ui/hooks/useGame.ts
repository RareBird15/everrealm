// src/ui/hooks/useGame.ts

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState } from "../../engine/state/GameState";
import type { GameCommand } from "../../engine/events/GameCommand";
import type { GameEvent } from "../../engine/events/GameEvent";
import type { ResearchId } from "../../engine/research/types";
import type { SpecialBuilding } from "../../engine/settlements/types";
import type { LegacyId } from "../../engine/prestige/types";
import { createInitialState } from "../../engine/state/initialState";
import { reducer } from "../../engine/reducer";
import { saveGame, loadGame, deleteSave } from "../../storage/save";
import { canEstablish, establishCost, countSpecialized } from "../../engine/settlements/establish";
import { canResearch, researchCost } from "../../engine/research/researchAction";
import { canBuyLand, landCost } from "../../engine/land/buyLand";
import { canAscend } from "../../engine/prestige/ascend";
import { canAdvanceAge } from "../../engine/research/definitions";
import { passiveRatePerHour, applyPassiveCacao, calculatePassiveCacao, cacaoPerTurn } from "../../engine/cacao/passive";
import { isFinalAge } from "../../engine/ages/definitions";
import { getResearch, researchForAge, ALL_RESEARCH } from "../../engine/research/definitions";
import { effectiveLandParcels } from "../../engine/state/initialState";

export interface GameApi {
  readonly state: GameState;
  readonly error: string | null;
  readonly dismissError: () => void;
  readonly needsRealmName: boolean;
  readonly offlineEarnings: number | null;
  readonly dismissOfflineEarnings: () => void;

  // Derived state
  readonly canEstablish: boolean;
  readonly canAdvanceAge: boolean;
  readonly canBuyLandFlag: boolean;
  readonly canAscendFlag: boolean;
  readonly passiveRate: number;
  readonly turnRate: number;
  readonly landUsed: number;
  readonly landTotal: number;

  // Actions
  readonly setRealmName: (name: string) => void;
  readonly establishSettlement: () => void;
  readonly researchUpgrade: (researchId: ResearchId) => void;
  readonly specializeSettlement: (settlementId: string, building: SpecialBuilding) => void;
  readonly unspecializeSettlement: (settlementId: string) => void;
  readonly buyLand: () => void;
  readonly advanceAge: () => void;
  readonly ascend: (legacy: LegacyId) => void;
  readonly resetGame: () => void;

  // Research info
  readonly availableResearch: typeof ALL_RESEARCH;
  readonly establishCostNow: number;
  readonly landCostNow: number;
}

export function useGame(): GameApi {
  const savedState = useRef<GameState | null>(loadGame());
  const hasSave = savedState.current !== null;

  const [state, setState] = useState<GameState>(() => {
    if (hasSave) return savedState.current!;
    return createInitialState("");
  });
  const [error, setError] = useState<string | null>(null);
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Save on every state change
  useEffect(() => {
    if (state.realmName) saveGame(state);
  }, [state]);

  // Apply passive cacao on mount for existing saves
  useEffect(() => {
    if (!hasSave) return;
    const current = stateRef.current;
    const earned = calculatePassiveCacao(current);
    if (earned > 0) {
      const { state: newState } = applyPassiveCacao(current);
      setState(newState);
      setOfflineEarnings(earned);
    }
  }, []);

  // Periodic passive cacao tick
  useEffect(() => {
    const TICK_MS = 30_000;
    const interval = setInterval(() => {
      const current = stateRef.current;
      const { state: newState, events } = applyPassiveCacao(current);
      if (events.length > 0) setState(newState);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const dispatch = useCallback((command: GameCommand): boolean => {
    const current = stateRef.current;
    const { state: newState, events } = reducer(current, command);

    // Check for error events
    const errorEvent = events.find((e) => e.type === "Error");
    if (errorEvent && errorEvent.type === "Error") {
      setError(errorEvent.message);
      return false;
    }

    setError(null);
    setState(newState);
    return true;
  }, []);

  const establishSettlement = useCallback(() => {
    dispatch({ type: "EstablishSettlement" });
  }, [dispatch]);

  const researchUpgrade = useCallback(
    (researchId: ResearchId) => {
      dispatch({ type: "ResearchUpgrade", researchId });
    },
    [dispatch],
  );

  const specializeSettlement = useCallback(
    (settlementId: string, building: SpecialBuilding) => {
      dispatch({ type: "SpecializeSettlement", settlementId, building });
    },
    [dispatch],
  );

  const unspecializeSettlement = useCallback(
    (settlementId: string) => {
      dispatch({ type: "UnspecializeSettlement", settlementId });
    },
    [dispatch],
  );

  const buyLand = useCallback(() => {
    dispatch({ type: "BuyLand" });
  }, [dispatch]);

  const advanceAge = useCallback(() => {
    dispatch({ type: "AdvanceAge" });
  }, [dispatch]);

  const ascend = useCallback(
    (legacy: LegacyId) => {
      dispatch({ type: "Ascend", legacy });
    },
    [dispatch],
  );

  const setRealmName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, realmName: name }));
  }, []);

  const resetGame = useCallback(() => {
    deleteSave();
    setState(createInitialState(""));
    setError(null);
    setOfflineEarnings(null);
  }, []);

  const dismissError = useCallback(() => setError(null), []);
  const dismissOfflineEarnings = useCallback(() => setOfflineEarnings(null), []);

  // Derived state
  const passiveRate = passiveRatePerHour(state);
  const turnRate = cacaoPerTurn(state);
  const landUsed = state.settlements.length;
  const landTotal = effectiveLandParcels(state);
  const establishCostNow = establishCost(state);
  const landCostNow = landCost(state);

  // Available research for current Age (not yet completed, prereqs met)
  const availableResearch = ALL_RESEARCH.filter((r) =>
    canResearch(state, r.id),
  );

  return {
    state,
    error,
    dismissError,
    needsRealmName: !state.realmName,
    offlineEarnings,
    dismissOfflineEarnings,
    canEstablish: canEstablish(state),
    canAdvanceAge: !isFinalAge(state.age) && canAdvanceAge(state.age, state.completedResearch),
    canBuyLandFlag: canBuyLand(state),
    canAscendFlag: canAscend(state),
    passiveRate,
    turnRate,
    landUsed,
    landTotal,
    setRealmName,
    establishSettlement,
    researchUpgrade,
    specializeSettlement,
    unspecializeSettlement,
    buyLand,
    advanceAge,
    ascend,
    resetGame,
    availableResearch,
    establishCostNow,
    landCostNow,
  };
}