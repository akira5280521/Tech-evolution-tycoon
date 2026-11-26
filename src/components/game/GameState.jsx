import { createContext, useContext, useEffect, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { PREFS_EVENT, readPrefs } from "@/lib/gamePrefs";
import { setNumberFormat } from "@/lib/gameConfig";
import { applyAudioPrefs } from "@/lib/sfx";
import CloudSync from "./CloudSync";
import LoadingScreen from "./LoadingScreen";
import { WhatsNewGate } from "./WhatsNew";
import { RestartOfferGate } from "./RestartOffer";
import TapFeedback from "./TapFeedback";

const GameContext = createContext(null);

function applyDisplay(prefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.text = prefs.textSize === "large" || prefs.textSize === "xl" ? prefs.textSize : "normal";
  root.dataset.contrast = prefs.contrast ? "high" : "off";
  root.dataset.colorblind = prefs.colorblind ? "on" : "off";
  setNumberFormat(prefs.numberFormat);
}

export function GameStateProvider({ children }) {
  const api = useGame();
  const [, setTick] = useState(0);
  if (typeof window !== "undefined") {
    const prefs = readPrefs();
    setNumberFormat(prefs.numberFormat);
  }
  useEffect(() => {
    const apply = () => {
      const prefs = readPrefs();
      applyDisplay(prefs);
      applyAudioPrefs(prefs);
      setTick((n) => n + 1);
    };
    apply();
    window.addEventListener(PREFS_EVENT, apply);
    return () => window.removeEventListener(PREFS_EVENT, apply);
  }, []);
  if (!api.ready) return <LoadingScreen />;
  return (
    <GameContext.Provider value={api}>
      {children}
      <CloudSync game={api} />
      <WhatsNewGate />
      <RestartOfferGate game={api} />
      <TapFeedback />
    </GameContext.Provider>
  );
}

export function useGameState() {
  const api = useContext(GameContext);
  if (!api) throw new Error("useGameState must be used inside GameStateProvider");
  return api;
}
