// src/ui/screens/GameScreen.tsx

import { useEffect, useRef } from "react";
import type { GameApi } from "../hooks/useGame";
import { useAnnouncements } from "../hooks/useAnnouncements";
import { RealmSummary } from "../components/RealmSummary";
import { SettlementList } from "../components/SettlementList";
import { ResearchList } from "../components/ResearchList";
import { StoryLog } from "../components/StoryLog";
import { ActionBar } from "../components/ActionBar";
import { OfflineEarnings } from "../components/OfflineEarnings";
import { OnboardingTip } from "../components/OnboardingTip";
import { AboutPage } from "../components/AboutPage";
import { SettingsPage, applyAppearanceSettings } from "../components/SettingsPage";
import { LiveRegion } from "../../accessibility/LiveRegion";
import type { GameState } from "../../engine/state/GameState";

interface Props {
  readonly game: GameApi;
}

function getOnboardingTip(turn: number, state: GameState): string | null {
  if (turn > 4) return null;
  const settlementCount = state.settlements.length;

  if (turn <= 1 && settlementCount === 0) {
    return "Welcome to Everrealm! Press E to establish your first settlement. Each settlement costs Cacao and occupies a land parcel.";
  }
  if (turn <= 2 && settlementCount >= 1) {
    return "You have a settlement! Research upgrades to improve ALL settlements at once. No merging needed.";
  }
  if (turn <= 3) {
    return "Research Forestry to upgrade all Tents to Huts, or research Agriculture to unlock Farms. Each research transforms your realm.";
  }
  return null;
}

export function GameScreen({ game }: Props) {
  const announcements = useAnnouncements(game.state);
  const gameRef = useRef(game);
  gameRef.current = game;

  const tip = getOnboardingTip(game.state.turn, game.state);

  // Apply saved appearance settings on mount
  useEffect(() => {
    applyAppearanceSettings(
      (localStorage.getItem("everrealm:theme") as "dark" | "light") || "dark",
      (localStorage.getItem("everrealm:textSize") as "normal" | "large" | "extra-large") || "normal",
    );
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName ?? "";
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
        passiveRate={game.passiveRate}
        turnRate={game.turnRate}
        landUsed={game.landUsed}
        landTotal={game.landTotal}
      />

      {tip && <OnboardingTip tip={tip} />}

      <ActionBar game={game} />

      <SettlementList game={game} />

      <ResearchList game={game} />

      <StoryLog story={game.state.story} />

      <AboutPage />
      <SettingsPage />
    </main>
  );
}