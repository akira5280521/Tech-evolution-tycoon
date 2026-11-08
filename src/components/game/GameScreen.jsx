import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { BUSINESSES, SUPPLY_KEYS, blockedByGlass, money } from "@/lib/gameConfig";
import { incomePerSecond } from "@/lib/empire";
import { PREFS_EVENT, readPrefs } from "@/lib/gamePrefs";
import { setSoundEnabled } from "@/lib/sfx";
import { useGameState } from "./GameState";
import TopBar from "./TopBar";
import BusinessRow from "./BusinessRow";
import LockedRow from "./LockedRow";
import PrestigeBar from "./PrestigeBar";
import WelcomeBack from "./WelcomeBack";
import BottomTabs from "./BottomTabs";
import NewsTicker from "./NewsTicker";
import DilemmaModal from "./DilemmaModal";

export default function GameScreen() {
  const game = useGameState();
  const { state, buyMode, setBuyMode, buy, hire, run, runAll, buyForeman, prestige, dismissOffline, chooseDilemma } = game;
  const [, bumpTick] = useState(0);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [compact, setCompact] = useState(false);
  const startYRef = useRef(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const apply = () => {
      const prefs = readPrefs();
      setCompact(prefs.compact);
      setSoundEnabled(prefs.sound);
    };
    apply();
    window.addEventListener(PREFS_EVENT, apply);
    return () => window.removeEventListener(PREFS_EVENT, apply);
  }, []);

  useEffect(() => {
    const onStart = (e) => {
      startYRef.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };
    const onMove = (e) => {
      if (startYRef.current === null) return;
      const d = e.touches[0].clientY - startYRef.current;
      pullRef.current = d > 0 && window.scrollY <= 0 ? Math.min(d, 80) : 0;
      setPullDist(pullRef.current);
    };
    const onEnd = () => {
      if (startYRef.current === null) return;
      startYRef.current = null;
      const pulled = pullRef.current >= 60;
      pullRef.current = 0;
      setPullDist(0);
      if (!pulled || refreshingRef.current) return;
      refreshingRef.current = true;
      setRefreshing(true);
      setTimeout(() => {
        refreshingRef.current = false;
        setRefreshing(false);
        bumpTick((n) => n + 1);
      }, 600);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  const cps = incomePerSecond(state, Date.now());
  const glass = state.challenge?.id === "glass";
  const canRunAll = !!state.foreman && state.biz.some((st, i) => st.owned > 0 && !st.manager && !st.running && !blockedByGlass(state, i) && !((st.commissionUntil || 0) > Date.now()));
  const firstLocked = glass
    ? -1
    : BUSINESSES.findIndex((_, i) => i > 0 && state.biz[i - 1].owned === 0 && state.biz[i].owned === 0);
  const supply = state.supply || {};

  return (
    <div className="game-root min-h-screen overflow-x-hidden bg-[var(--game-bg)] text-[var(--game-fg)]">
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-50 opacity-30" />
      <WelcomeBack report={state.offlineReport} onDismiss={dismissOffline} />
      {!state.offlineReport && <DilemmaModal dilemma={state.dilemma} onChoose={chooseDilemma} />}

      {(pullDist > 0 || refreshing) && (
        <div className="flex items-center justify-center gap-2 py-2 font-pixel text-[0.55rem] text-[var(--game-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {refreshing ? "REFRESHING" : "PULL TO REFRESH"}
        </div>
      )}

      <div className="game-frame">
        <div className="game-side">
          <TopBar
            state={state}
            cps={cps}
            buyMode={buyMode}
            setBuyMode={setBuyMode}
            canRunAll={canRunAll}
            onRunAll={runAll}
            onBuyForeman={buyForeman}
          />
          <div className="safe-x mx-auto max-w-4xl px-3 pt-2">
            <p data-supply className="flex flex-wrap gap-x-3 gap-y-1 border-2 border-[var(--game-border)] bg-[var(--game-card)] px-2 py-1 font-term text-base leading-5 text-[var(--game-muted)]">
              {SUPPLY_KEYS.map((key) => (
                <span key={key}>{key} {Math.floor(supply[key] || 0)}</span>
              ))}
            </p>
            {!state.sawPit && (
              <p data-onboard className="mt-2 border-2 border-[var(--game-accent)] bg-[var(--game-accent-bg)] p-2 font-term text-lg leading-6 text-[var(--game-fg)]">
                Tap the Sand Quarry picture. The bar fills, then the scoop pays. Extra taps wait until it finishes.
              </p>
            )}
          </div>
        </div>

        <main className="safe-x mx-auto min-w-0 max-w-4xl space-y-2 overflow-x-hidden px-3 py-2">
          <NewsTicker />
          {state.challenge && (
            <p className="break-words border-2 border-[var(--game-accent)] bg-[var(--game-accent-bg)] p-3 font-term text-lg leading-6 text-[var(--game-accent)]">
              Challenge running: {state.challenge.id} · {money(state.challenge.earnings)} earned this run.
            </p>
          )}
          <PrestigeBar state={state} onPrestige={prestige} />

          {BUSINESSES.map((cfg, i) => {
            if (blockedByGlass(state, i)) return null;
            const visible = i === 0 || state.biz[i - 1].owned > 0 || state.biz[i].owned > 0;
            if (!visible) return null;
            return (
              <BusinessRow
                key={cfg.id}
                index={i}
                row={state.biz[i]}
                cash={state.cash}
                investors={state.investors}
                modStamp={state.modStamp || 0}
                boostUntil={state.boostUntil || 0}
                supplyKey={SUPPLY_KEYS.map((key) => Math.floor(supply[key] || 0)).join(":")}
                state={state}
                buyMode={buyMode}
                compact={compact}
                onBuy={buy}
                onHire={hire}
                onRun={run}
              />
            );
          })}

          {firstLocked >= 0 && <LockedRow prevName={BUSINESSES[firstLocked - 1].name.replace(/s$/, "")} />}
        </main>
      </div>

      <footer className="safe-x safe-bottom mx-auto max-w-4xl px-3 pb-4 pt-2 font-term text-base leading-5 text-[var(--game-dim)]">
        <p className="border-t-2 border-[var(--game-border)] pt-3">
          Progress saves on this device. Close the app and a hired crew keeps earning for up to 8 hours.
        </p>
      </footer>
      <BottomTabs />
    </div>
  );
}
