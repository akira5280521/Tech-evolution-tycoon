import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import { BUSINESSES, milestoneMult, prestigeMult } from "@/lib/gameConfig";
import TopBar from "./TopBar";
import BusinessRow from "./BusinessRow";
import LockedRow from "./LockedRow";
import PrestigeBar from "./PrestigeBar";
import WelcomeBack from "./WelcomeBack";
import BottomTabs from "./BottomTabs";

export default function GameScreen() {
  const { state, buyMode, setBuyMode, buy, hire, run, prestige, reset, dismissOffline } = useGame();
  const [, bumpTick] = useState(0);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);

  // Mobile pull-to-refresh: pulling down from the very top of the page shows
  // a spinner, then forces a fresh render of the current game state.
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
        bumpTick((n) => n + 1); // re-render the game state
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

  const cps = state.biz.reduce((sum, st, i) => {
    if (st.owned <= 0 || (!st.manager && !st.running)) return sum;
    const cfg = BUSINESSES[i];
    return sum + (cfg.revenue * st.owned * milestoneMult(st.owned) * prestigeMult(state.investors) * 1000) / cfg.cycleMs;
  }, 0);

  const firstLocked = BUSINESSES.findIndex(
    (_, i) => i > 0 && state.biz[i - 1].owned === 0 && state.biz[i].owned === 0
  );

  return (
    <div className="min-h-screen bg-[var(--game-bg)] text-[var(--game-fg)]">
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-50 opacity-30" />
      <TopBar state={state} cps={cps} buyMode={buyMode} setBuyMode={setBuyMode} />
      <WelcomeBack report={state.offlineReport} onDismiss={dismissOffline} />

      {(pullDist > 0 || refreshing) && (
        <div className="flex items-center justify-center gap-2 py-2 font-pixel text-sm text-[var(--game-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {refreshing ? "REFRESHING" : "PULL TO REFRESH"}
        </div>
      )}

      <main className="mx-auto max-w-4xl space-y-3 px-3 py-5 overscroll-none">
        <PrestigeBar state={state} onPrestige={prestige} />

        {state.lifetime === 0 && (
          <p className="border-2 border-[var(--game-accent)] bg-[var(--game-accent-bg)] p-3 font-term text-lg leading-6 text-[var(--game-accent)]">
            Click the Vacuum Tube to fire your first batch, then reinvest the profit into more hardware.
          </p>
        )}

        {BUSINESSES.map((cfg, i) => {
          const visible = i === 0 || state.biz[i - 1].owned > 0 || state.biz[i].owned > 0;
          if (!visible) return null;
          return (
            <BusinessRow
              key={cfg.id}
              index={i}
              state={state}
              buyMode={buyMode}
              onBuy={buy}
              onHire={hire}
              onRun={run}
            />
          );
        })}

        {firstLocked >= 0 && <LockedRow prevName={BUSINESSES[firstLocked - 1].name.replace(/s$/, "")} />}
      </main>

      <footer className="safe-bottom mx-auto max-w-4xl px-3 font-term text-base leading-5 text-[var(--game-dim)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-[var(--game-border)] pt-3">
          <span>
            Progress saves automatically in this browser. Close the tab — your hired crew keeps
            earning for up to 8 hours.
          </span>
          <div className="flex gap-2">
            <Link
              to="/settings"
              className="min-h-[44px] select-none border-2 border-[var(--game-border-strong)] px-2 py-1 uppercase hover:border-[var(--game-accent)] hover:text-[var(--game-accent)]"
            >
              Settings
            </Link>
            <button
              type="button"
              onClick={reset}
              className="min-h-[44px] select-none border-2 border-[var(--game-border-strong)] px-2 py-1 uppercase hover:border-[var(--game-danger)] hover:text-[var(--game-danger)]"
            >
              Reset save
            </button>
          </div>
        </div>
        {/* clearance so content is not hidden behind the fixed bottom tab bar */}
        <div className="h-20" aria-hidden="true" />
      </footer>
      <BottomTabs />
    </div>
  );
}