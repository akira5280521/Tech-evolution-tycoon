import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { BUSINESSES, ERA_GATE, SUPPLY_KEYS, blockedByGlass, eraOpen, frontierEra, money, pluralName } from "@/lib/gameConfig";
import { activeChallengeGoal, incomePerSecond, supplyCap, supplyFull } from "@/lib/empire";
import StorageSheet, { amount } from "./StorageSheet";
import { PREFS_EVENT, readPrefs } from "@/lib/gamePrefs";
import { applyAudioPrefs } from "@/lib/sfx";
import { useGameState } from "./GameState";
import TopBar from "./TopBar";
import BusinessRow from "./BusinessRow";
import LockedRow from "./LockedRow";
import PrestigeBar from "./PrestigeBar";
import WelcomeBack from "./WelcomeBack";
import PrestigeReport from "./PrestigeReport";
import BottomTabs from "./BottomTabs";
import DilemmaModal from "./DilemmaModal";
import BubbleBanner from "./BubbleBanner";
import CoachMark from "./CoachMark";
import { ItemHelp, TipCard } from "./HintSheet";
import { currentTutorialStep, tutorialActive } from "@/lib/tutorial";
import { StickyHud } from "./chrome";

// The first-run Timber note stays up until the player has both run a business
// by hand and bought one. Either action on its own is not the whole loop.
function playedAndBought(state) {
  if (!state?.sawPit) return false;
  if ((state.businessesBought || 0) > 0) return true;
  return (state.biz || []).some((row, i) => (row?.owned || 0) > (i === 0 ? 1 : 0));
}

// A material shows in the supply strip once the row that makes it is on
// screen, so materials from undiscovered eras stay hidden.
function supplyShown(state, key) {
  const i = BUSINESSES.findIndex((cfg) => cfg.makes && cfg.makes[key]);
  if (i < 0) return false;
  return eraOpen(state, i);
}

export default function GameScreen() {
  const game = useGameState();
  const { state, buyMode, setBuyMode, buy, hire, run, runAll, buyForeman, prestige, dismissOffline,
    dismissPrestigeReport, chooseDilemma, cashOut, tutorialNext, tutorialSkip } = game;
  const [, bumpTick] = useState(0);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [compact, setCompact] = useState(false);
  const [storageKey, setStorageKey] = useState(null);
  const startYRef = useRef(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  useEffect(() => {
    const apply = () => {
      const prefs = readPrefs();
      setCompact(prefs.compact);
      applyAudioPrefs(prefs);
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
  const firstLocked = glass ? -1 : frontierEra(state);
  const supply = state.supply || {};

  return (
    <div className="game-root game-clip-x min-h-screen bg-[var(--game-bg)] text-[var(--game-fg)]">
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-50 opacity-30" />
      <WelcomeBack report={state.offlineReport} onDismiss={dismissOffline} />
      <PrestigeReport report={state.offlineReport ? null : state.prestigeReport} onDismiss={dismissPrestigeReport} />
      {!state.offlineReport && <DilemmaModal dilemma={state.dilemma} onChoose={chooseDilemma} />}

      {(pullDist > 0 || refreshing) && (
        <div className="flex items-center justify-center gap-2 py-2 font-pixel text-[0.55rem] text-[var(--game-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {refreshing ? "REFRESHING" : "PULL TO REFRESH"}
        </div>
      )}

      <StickyHud state={state} cps={cps} />
      {storageKey && <StorageSheet state={state} materialKey={storageKey} onUpgrade={game.upgradeStorage} onClose={() => setStorageKey(null)} />}

      <div className="game-frame">
        <div className="game-side">
          <TopBar
            state={state}
            buyMode={buyMode}
            setBuyMode={(mode) => {
              setBuyMode(mode);
              // Tapping the amount button is the action, whichever amount it shows.
              if (currentTutorialStep(state)?.id === "modes") tutorialNext("modes");
            }}
            canRunAll={canRunAll}
            onRunAll={runAll}
            onBuyForeman={buyForeman}
          />
          <div className="safe-x mx-auto max-w-4xl px-3 pt-2">
            <p
              data-supply
              onClick={(event) => {
                if (event.target.closest("[data-help]")) return;
                if (currentTutorialStep(state)?.id === "materials") tutorialNext("materials");
              }}
              className="flex flex-wrap gap-x-3 gap-y-1 border-2 border-[var(--game-border)] bg-[var(--game-card)] px-2 py-1 font-term text-base leading-5 text-[var(--game-muted)]"
            >
              {SUPPLY_KEYS.filter((key) => supplyShown(state, key)).map((key) => {
                const full = supplyFull(state, key);
                return (
                  <button
                    key={key}
                    type="button"
                    data-material={key}
                    onClick={() => setStorageKey(key)}
                    className={`min-h-6 text-left tabular-nums ${full ? "text-[var(--game-danger)]" : ""}`}
                  >
                    {key} {amount(supply[key])}/{amount(supplyCap(state, key))}
                    {full && <span className="ml-1 font-pixel text-[0.4rem]">FULL</span>}
                  </button>
                );
              })}
              <ItemHelp kind="materials" id={SUPPLY_KEYS.filter((key) => supplyShown(state, key))} state={state} name="materials" className="ml-auto" />
            </p>
            {!playedAndBought(state) && !tutorialActive(state) && (
              <p data-onboard className="mt-2 border-2 border-[var(--game-accent)] bg-[var(--game-accent-bg)] p-2 font-term text-lg leading-6 text-[var(--game-fg)]">
                Tap the Timber Camp picture to run the business. Then tap BUY. BUY spends cash.
              </p>
            )}
          </div>
        </div>

        <main className="safe-x mx-auto min-w-0 max-w-4xl space-y-2 overflow-x-hidden px-3 py-2">
          <BubbleBanner state={state} onCashOut={cashOut} />
          {state.challenge && (
            <p className="break-words border-2 border-[var(--game-accent)] bg-[var(--game-accent-bg)] p-3 font-term text-lg leading-6 text-[var(--game-accent)]">
              Challenge running: {state.challenge.id} · {money(state.challenge.earnings)} / {money(activeChallengeGoal(state))} this run.
            </p>
          )}
          {/* Prestige only matters much later; a brand-new player sees it once
              the run has earned $100M (a thousandth of the first investor). */}
          {((state.investors || 0) > 0 || state.prestiged || (state.lifetime || 0) >= 1e8) && (
            <PrestigeBar state={state} onPrestige={prestige} />
          )}

          {BUSINESSES.map((cfg, i) => {
            if (blockedByGlass(state, i)) return null;
            if (!eraOpen(state, i)) return null;
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

          {firstLocked > 0 && (
            <LockedRow index={firstLocked} id={BUSINESSES[firstLocked].id} state={state} onOpen={game.openEraAt} />
          )}
        </main>
      </div>

      <footer className="safe-x mx-auto max-w-4xl px-3 pb-4 pt-2 font-term text-base leading-5 text-[var(--game-dim)]">
        <p className="border-t-2 border-[var(--game-border)] pt-3">
          Progress saves on this device. Close the app and managers keep earning at half speed for up to 24 hours.
        </p>
      </footer>
      <BottomTabs />
      <CoachMark state={state} onNext={tutorialNext} onSkip={tutorialSkip} />
      <TipCard />
    </div>
  );
}
