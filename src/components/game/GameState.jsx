import { createContext, useContext } from "react";
import { useGame } from "@/hooks/useGame";

const GameContext = createContext(null);

export function GameStateProvider({ children }) {
  const api = useGame();
  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGameState() {
  const api = useContext(GameContext);
  if (!api) throw new Error("useGameState must be used inside GameStateProvider");
  return api;
}
