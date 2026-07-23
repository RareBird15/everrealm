import { useState, useEffect, useRef } from "react";
import { GameScreen } from "./screens/GameScreen";
import { RealmSetup } from "./screens/RealmSetup";
import { ChronicleScreen } from "./screens/ChronicleScreen";
import { useGame } from "./hooks/useGame";

export function App() {
  const game = useGame();
  const [showChronicle, setShowChronicle] = useState(false);
  const [pendingChronicle, setPendingChronicle] = useState<string | null>(null);
  const prevChronicleCount = useRef(game.state.prestige.chronicles?.length ?? 0);

  // Detect when a new chronicle is added (ascension just happened)
  useEffect(() => {
    const currentCount = game.state.prestige.chronicles?.length ?? 0;
    if (currentCount > prevChronicleCount.current) {
      const newest = game.state.prestige.chronicles?.[0];
      if (newest) {
        setPendingChronicle(newest);
        setShowChronicle(true);
      }
    }
    prevChronicleCount.current = currentCount;
  }, [game.state.prestige.chronicles]);

  if (showChronicle && pendingChronicle) {
    return (
      <ChronicleScreen
        chronicle={pendingChronicle}
        onContinue={() => {
          setShowChronicle(false);
          setPendingChronicle(null);
        }}
      />
    );
  }

  if (game.needsRealmName) {
    return <RealmSetup onSubmit={game.setRealmName} />;
  }

  return <GameScreen game={game} />;
}