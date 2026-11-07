import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { BUSINESSES, money } from "@/lib/gameConfig";
import { incomePerSecond } from "@/lib/empire";
import { readPrefs, writePrefs } from "@/lib/gamePrefs";
import { setSoundEnabled } from "@/lib/sfx";
import { useGameState } from "./GameState";
import TopBar from "./TopBar";
import BusinessRow from "./BusinessRow";
import LockedRow from "./LockedRow";
import PrestigeBar from "./PrestigeBar";
import WelcomeBack from "./WelcomeBack";
import BottomTabs from "./BottomTabs";
import NewsTicker from "./NewsTicker";
import NextMove from "./NextMove";
import DailyBriefing from "./DailyBriefing";
import DilemmaModal from "./DilemmaModal";
import { MoreLinks } from "./MorePage";

export default function GameScreen() {
  const game = useGameState();
  const { state, buyMode, setBuyMode, buy, hire, run, runAll, prestige, reset, dismissOffline, chooseDilemma, touchBriefing } = game;
  const [, bumpTick] = useState(0);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [compact, setCompact] = useState(false);
  const [sound, setSound] = useState(true);
  const startYRef = useRef(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const prefs = readPrefs();
    setCompact(prefs.compact);
    setSound(prefs.sound);
    setSoundEnabled(prefs.sound);
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
  const canRunAll = state.biz.some((st, i) => st.owned > 0 && !st.manager && !st.running && (!glass || i === 0));
  const firstLocked = glass
    ? -1
    : BUSINESSES.findIndex((_, i) => i > 0 && state.biz[i - 1].owned === 0 && state.biz[i].owned === 0);

  return (
    <div className="min-h-screen bg-[var(--game-bg)] text-[var(--game-fg)]">
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-50 opacity-30" />
      <TopBar
        state={state}
        cps={cps}
        buyMode={buyMode}
        setBuyMode={setBuyMode}
        compact={compact}
        sound={sound}
        canRunAll={canRunAll}
        onCompact={() => {
          const next = !compact;
          setCompact(next);
          writePrefs({ compact: next });
        }}
        onSound={() => {
          const next = !sound;
          setSound(next);
          setSoundEnabled(next);
          writePrefs({ sound: next });
        }}
        onRunAll={runAll}
      />
      <WelcomeBack report={state.offlineReport} onDismiss={dismissOffline} />
      {!state.offlineReport && <DilemmaModal dilemma={state.dilemma} onChoose={chooseDilemma} />}

      {(pullDist > 0 || refreshing) && (
        <div className="flex items-center justify-center gap-2 py-2 font-pixel text-sm text-[var(--game-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {refreshing ? "REFRESHING" : "PULL TO REFRESH"}
        </div>
      )}

      <main className="mx-auto max-w-4xl space-y-2 px-3 py-2 overscroll-none">
        <NewsTicker />
        <NextMove state={state} />
        <DailyBriefing state={state} onRoll={touchBriefing} />
        {state.challenge && (
          <p className="border-2 border-[var(--game-accent)] bg-[var(--game-accent-bg)] p-3 font-term text-lg text-[var(--game-accent)]">
            Challenge running: {state.challenge.id} · {money(state.challenge.earnings)} earned this run.
          </p>
        )}
        <PrestigeBar state={state} onPrestige={prestige} />

        {BUSINESSES.map((cfg, i) => {
          if (glass && i !== 0) return null;
          const visible = i === 0 || state.biz[i - 1].owned > 0 || state.biz[i].owned > 0;
          if (!visible) return null;
          return (
            <BusinessRow
              key={cfg.id}
              index={i}
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

      <footer className="safe-bottom mx-auto max-w-4xl space-y-3 px-3 pb-28 font-term text-base leading-5 text-[var(--game-dim)]">
        <p className="border-t-2 border-[var(--game-border)] pt-3">
          Progress saves automatically in this browser. Close the tab - your hired crew keeps earning for up to 8 hours.
        </p>
        <MoreLinks active="" />
        <div className="flex gap-2">
          <Link to="/more" hash="settings" className="min-h-11 border-2 border-[var(--game-border-strong)] px-2 py-1 uppercase">
            Settings
          </Link>
          <button type="button" onClick={reset} className="min-h-11 border-2 border-[var(--game-border-strong)] px-2 py-1 uppercase hover:text-[var(--game-danger)]">
            Reset save
          </button>
        </div>
      </footer>
      <BottomTabs />
    </div>
  );
}
