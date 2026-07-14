// src/ui/screens/GameScreen.tsx

import { useEffect, useRef } from "react";
import type { GameApi } from "../hooks/useGame";
import type { GameState } from "../../engine/state/GameState";
import type { SettlementLevel, StandardLevel } from "../../engine/settlements/types";
import { useAnnouncements } from "../hooks/useAnnouncements";
import { RealmSummary } from "../components/RealmSummary";
import { SettlementList } from "../components/SettlementList";
import { ImprovementList } from "../components/ImprovementList";
import { DiscoveriesList } from "../components/DiscoveriesList";
import { StoryLog } from "../components/StoryLog";
import { ActionBar } from "../components/ActionBar";
import { OfflineEarnings } from "../components/OfflineEarnings";
import { Statistics } from "../components/Statistics";
import { OnboardingTip } from "../components/OnboardingTip";
import { LiveRegion } from "../../accessibility/LiveRegion";
import { levelIndex } from "../../engine/settlements/progression";
import { getTechForBuilding } from "../../engine/techtree/definitions";

interface Props {
  readonly game: GameApi;
}

/**
 * Maps shortcut keys to settlement levels for the develop action.
 * First letter where possible; conflicts resolved with a second consonant:
 *   Tent=t, Hut=h, Cottage=c, House=u (hoUse), Manor=n (maNor),
 *   Village=v, Town=w (toWn), City=i (cIty), Citadel=d (citiDel).
 * Special buildings: Farm=f, Market=m, Workshop=o (wOrkshop),
 *   Library=l, TownHall=g (governance building), Aqueduct=q (aQueduct).
 */
const DEVELOP_SHORTCUTS: Record<string, SettlementLevel> = {
  t: "Tent",
  h: "Hut",
  c: "Cottage",
  u: "House",
  n: "Manor",
  v: "Village",
  w: "Town",
  i: "City",
  d: "Citadel",
  f: "Farm",
  m: "Market",
  o: "Workshop",
  l: "Library",
  g: "TownHall",
  q: "Aqueduct",
};

/**
 * Returns a contextual onboarding tip for the first few turns, or null
 * once the player is past the early game.
 */
function getOnboardingTip(turn: number, state: GameState): string | null {
  if (turn > 4) return null;

  const settlementCount = state.settlements.reduce((sum, s) => sum + s.quantity, 0);

  if (turn <= 1 && settlementCount === 0) {
    return "Welcome to Everrealm! Press E to establish your first settlement. Each settlement costs 10 Prosperity.";
  }
  if (turn <= 2 && settlementCount >= 2) {
    return "You have multiple settlements! Press T to develop two Tents into a Hut. Developing earns Prosperity.";
  }
  if (turn <= 3) {
    return "Keep establishing and developing settlements. Two Huts become a Cottage, two Cottages become a House. Build toward a Citadel to advance to the next Age!";
  }
  return null;
}

export function GameScreen({ game }: Props) {
  const announcements = useAnnouncements(game.state);
  const gameRef = useRef(game);
  gameRef.current = game;

  const tip = getOnboardingTip(game.state.turn, game.state);

  // Keyboard shortcuts for common actions.
  // Only skips when focus is in a text input (not buttons, so NVDA
  // users who tab to buttons can still use shortcuts).
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? "";
      // Only skip for text inputs where typing letters is expected
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const key = e.key.toLowerCase();
      const g = gameRef.current;

      switch (key) {
        case "e":
          if (g.canEstablish) g.establishSettlement();
          break;
        case "a":
          if (g.canAdvanceAge) g.advanceAge();
          break;
        default: {
          // Check if this is a develop shortcut
          const level = DEVELOP_SHORTCUTS[key];
          if (level) {
            developFirstEligible(g, level);
          }
          break;
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <main aria-label="Everrealm">
      <h1>Everrealm</h1>

      <LiveRegion>{announcements.join(" ")}</LiveRegion>

      {game.offlineEarnings !== null && (
        <OfflineEarnings
          amount={game.offlineEarnings}
          onDismiss={game.dismissOfflineEarnings}
        />
      )}

      <RealmSummary
        state={game.state}
        effectiveCapacity={game.effectiveCapacity}
        passiveRatePerHour={game.passiveRatePerHour}
      />

      {tip && <OnboardingTip tip={tip} />}

      <ActionBar
        canEstablish={game.canEstablish}
        canAdvanceAge={game.canAdvanceAge}
        error={game.error}
        onEstablish={game.establishSettlement}
        onAdvanceAge={game.advanceAge}
        onDismissError={game.dismissError}
        onReset={game.resetGame}
      />

      <SettlementList state={game.state} onDevelop={game.developSettlement} />

      <DiscoveriesList state={game.state} onUnlock={game.unlockTech} />

      <ImprovementList state={game.state} onPurchase={game.purchaseImprovement} />

      <Statistics state={game.state} />

      <StoryLog story={game.state.story} />
    </main>
  );
}

/**
 * Finds the first settlement stack that can be developed into `level`
 * and develops it. For standard levels, finds a stack with quantity >= 2
 * and uses default progression. For special buildings, finds a standard
 * level stack with quantity >= 2 that meets the building's minimum
 * source level requirement.
 */
function developFirstEligible(game: GameApi, level: SettlementLevel): void {
  const state = game.state;

  if (level === "Citadel") {
    return;
  }

  const isSpecial = ["Farm", "Market", "Workshop", "Library", "TownHall", "Aqueduct"].includes(level);

  if (isSpecial) {
    const tech = getTechForBuilding(level);
    if (!tech) return;
    const minIdx = levelIndex(tech.minimumSourceLevel);

    // Find first standard level stack with quantity >= 2 that meets the minimum
    const stack = state.settlements.find(
      (s) => {
        if (s.quantity < 2) return false;
        if (["Citadel"].includes(s.level)) return false;
        if (["Farm", "Market", "Workshop", "Library", "TownHall", "Aqueduct"].includes(s.level)) return false;
        const sourceIdx = levelIndex(s.level as StandardLevel);
        return sourceIdx >= minIdx;
      },
    );
    if (stack) {
      game.developSettlement(stack.age, stack.level, level);
    }
    return;
  }

  // For standard levels, find a stack with quantity >= 2
  const stack = state.settlements.find(
    (s) => s.level === level && s.quantity >= 2,
  );
  if (stack) {
    game.developSettlement(stack.age, stack.level as StandardLevel);
  }
}