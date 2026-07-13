import { GameScreen } from "./screens/GameScreen";
import { RealmSetup } from "./screens/RealmSetup";
import { useGame } from "./hooks/useGame";

export function App() {
  const game = useGame();

  if (game.needsRealmName) {
    return <RealmSetup onSubmit={game.setRealmName} />;
  }

  return <GameScreen game={game} />;
}