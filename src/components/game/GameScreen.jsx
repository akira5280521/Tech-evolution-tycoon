import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { BUSINESSES, ERA_GATE, REFINED, SUPPLY_KEYS, blockedByGlass, eraOpen, frontierEra, isManaged, money, pluralName } from "@/lib/gameConfig";
import { activeChallengeGoal, incomePerSecond, refiningOpen, shortageOn, supplyCap, supplyFull } from "@/lib/empire";
import StorageSheet, { amount } from "./StorageSheet";
import { PREFS_EVENT, readPrefs, writePrefs } from "@/lib/gamePrefs";
import { SECTIONS, makerOf, rowSection, sectionOfId, sectionOfTarget, shownSection, supplyAlerts, pendingRowId, focusRowLater } from "@/lib/sections";
import { currentTip } from "@/lib/tips";
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
import ArrivalCard from "./ArrivalCard";
import ContractCard, { ContractChip } from "./ContractCard";
import StoryEventModal from "./StoryEventModal";
import { currentArrival } from "@/lib/arrivals";
import BubbleBanner from "./BubbleBanner";
import { CompanyNameCard, CompanyNameScreen } from "./CompanyName";
import AnniversaryBanner from "./AnniversaryBanner";
import { ItemHelp, TipCard } from "./HintSheet";
import { currentTutorialStep, stepTarget, tutorialActive } from "@/lib/tutorial";
import { StickyHud } from "./chrome";
import { EraChipStrip } from "./EraChipStrip";
import { shouldCollapseRow, rowFullyUpgraded } from "@/lib/rowCollapse";

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
  // Refined grades show once the refinery is open and you have some (or a batch is on).
  if (REFINED[key]) return refiningOpen(state) && ((state.supply?.[key] || 0) > 0 || state.refineJob?.id === key);
  const i = BUSINESSES.findIndex((cfg) => cfg.makes && cfg.makes[key]);
  if (i < 0) return false;
  return eraOpen(state, i);
}

export default function GameScreen() {
  const game = useGameState();
  const { state, buyMode, setBuyMode, buy, hire, run, runAll, toggleManager, buyForeman, prestige, dismissOffline,
    dismissPrestigeReport, dismissArrivalCard, chooseDilemma, chooseStoryEvent, acceptContractOffer, skipContractOffer, cashOut, tutorialNext, tutorialSkip } = game;
  const [, bumpTick] = useState(0);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [compact, setCompact] = useState(false);
  const [collapseMaxed, setCollapseMaxed] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [storageKey, setStorageKey] = useState(null);
  const [savedSection, setSavedSection] = useState(() => readPrefs().gameSection);
  // A dilemma or shortage event takes the screen: close the material sheet
  // so the two never stack.
  useEffect(() => {
    if (state.dilemma || state.storyEvent || state.contract?.status === "offered") setStorageKey(null);
  }, [state.dilemma, state.storyEvent, state.contract]);
  const [scrollTo, setScrollTo] = useState(() => pendingRowId());
  const startYRef = useRef(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  useEffect(() => {
    const apply = () => {
      const prefs = readPrefs();
      setCompact(prefs.compact);
      setCollapseMaxed(prefs.collapseMaxed !== false);
      setSavedSection(prefs.gameSection);
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
  const canRunAll = !!state.foreman && state.biz.some((st, i) => st.owned > 0 && !isManaged(st) && !st.running && !blockedByGlass(state, i) && !((st.commissionUntil || 0) > Date.now()));
  const firstLocked = glass ? -1 : frontierEra(state);
  const supply = state.supply || {};

  // TECH or SUPPLY. A tutorial step or tip that points at a row in the other
  // section, or a row asked for by NEXT MOVE, switches the view to it.
  const coachTarget = tutorialActive(state) ? stepTarget(currentTutorialStep(state), state) : null;
  const tipTarget = currentTip(state, "game")?.target || null;
  const forced = sectionOfTarget(coachTarget) || sectionOfTarget(tipTarget);
  const section = shownSection(state, savedSection);
  const chooseSection = useCallback((id) => {
    setSavedSection(id);
    writePrefs({ gameSection: id });
  }, []);
  useEffect(() => {
    if (forced && forced !== section) chooseSection(forced);
  }, [forced, section, chooseSection]);
  useEffect(() => {
    if (!scrollTo) return;
    const want = sectionOfId(scrollTo);
    if (want && want !== section) {
      chooseSection(want);
      return;
    }
    // Wait for the row to draw (the screen may still be loading), scroll to
    // it, then once more after the page settles (a route change resets scroll).
    let tries = 0;
    let found = 0;
    const iv = setInterval(() => {
      tries += 1;
      const el = document.querySelector(`[data-row="${scrollTo}"]`);
      if (el) {
        el.scrollIntoView({ block: "center" });
        found += 1;
      }
      if (found >= 3 || tries >= 30) {
        clearInterval(iv);
        focusRowLater(null);
        setScrollTo(null);
      }
    }, 100);
    return () => clearInterval(iv);
  }, [scrollTo, section, chooseSection]);
  // "Needs wood" on a TECH row: open SUPPLY at the row that makes it.
  const showMaker = useCallback((key) => {
    const maker = makerOf(key);
    // A refined grade has no maker row: open its sheet (REFINE lives there).
    if (maker < 0) {
      setStorageKey(key);
      return;
    }
    setScrollTo(BUSINESSES[maker].id);
  }, []);
  const alerts = supplyAlerts(state);
  const techOpen = BUSINESSES.some((cfg, i) => rowSection(i) === "tech" && eraOpen(state, i) && !blockedByGlass(state, i));

  return (
    <div className="game-root game-clip-x min-h-screen bg-[var(--game-bg)] text-[var(--game-fg)]">
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-50 opacity-30" />
      <WelcomeBack report={state.offlineReport} onDismiss={dismissOffline} />
      <PrestigeReport report={state.offlineReport ? null : state.prestigeReport} onDismiss={dismissPrestigeReport} />
      {!state.offlineReport && !state.prestigeReport && !tutorialActive(state) && (
        <ArrivalCard arrival={currentArrival(state)} onDismiss={dismissArrivalCard} />
      )}
      {!state.offlineReport && !state.prestigeReport && !currentArrival(state) && (
        <StoryEventModal event={state.storyEvent} onChoose={chooseStoryEvent} />
      )}
      {!state.offlineReport && !state.prestigeReport && !currentArrival(state) && !state.storyEvent && (
        <ContractCard contract={state.contract} state={state} onAccept={acceptContractOffer} onSkip={skipContractOffer} />
      )}
      {!state.offlineReport && !state.prestigeReport && !currentArrival(state) && !state.storyEvent && state.contract?.status !== "offered" && (
        <DilemmaModal dilemma={state.dilemma} onChoose={chooseDilemma} />
      )}

      {(pullDist > 0 || refreshing) && (
        <div className="flex items-center justify-center gap-2 py-2 font-pixel text-[0.55rem] text-[var(--game-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {refreshing ? "REFRESHING" : "PULL TO REFRESH"}
        </div>
      )}

      <StickyHud state={state} cps={cps} />
      {storageKey && <StorageSheet state={state} materialKey={storageKey} onUpgrade={game.upgradeStorage} onRefine={game.refine} onSell={game.sellStock} onSwap={game.swapStock} shown={SUPPLY_KEYS.filter((key) => supplyShown(state, key))} onClose={() => setStorageKey(null)} />}

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
                    {REFINED[key]?.short || key} {amount(supply[key])}/{amount(supplyCap(state, key))}
                    {full && <span className="ml-1 font-pixel text-[0.4rem]">FULL</span>}
                    {shortageOn(state, Date.now()) === key && <span data-short={key} className="ml-1 font-pixel text-[0.4rem] text-[var(--game-violet)]">SHORT</span>}
                  </button>
                );
              })}
              <ItemHelp kind="materials" id={SUPPLY_KEYS.filter((key) => supplyShown(state, key))} state={state} name="materials" className="ml-auto" />
            </p>
            <ContractChip contract={state.contract} now={Date.now()} />
            <div data-section-toggle role="group" aria-label="Game section" className="mt-2 grid grid-cols-2 border-2 border-[var(--game-border)] bg-[var(--game-panel)] shadow-[3px_3px_0_0_#000]">
              {SECTIONS.map((item) => {
                const on = section === item.id;
                const alert = item.id === "supply" && alerts.length > 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-section={item.id}
                    aria-pressed={on}
                    disabled={item.id === "tech" && !techOpen}
                    onClick={() => chooseSection(item.id)}
                    className={`relative min-h-[40px] px-2 font-pixel text-[0.6rem] leading-4 ${
                      on
                        ? "bg-[var(--game-accent)] text-[var(--game-accent-fg)]"
                        : "text-[var(--game-muted)] disabled:text-[var(--game-dim)]"
                    }`}
                  >
                    {item.label}
                    {alert && (
                      <span
                        data-supply-alert={alerts.map((a) => `${a.key}:${a.kind}`).join(" ")}
                        aria-label="A material is empty or full"
                        className="absolute right-2 top-1.5 h-2 w-2 bg-[var(--game-danger)] shadow-[1px_1px_0_0_#000]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <EraChipStrip
              state={state}
              onPick={(chip) => {
                const want = sectionOfId(chip.id);
                if (want) chooseSection(want);
                setScrollTo(chip.id);
              }}
            />
            {!playedAndBought(state) && !tutorialActive(state) && (
              <p data-onboard className="mt-2 border-2 border-[var(--game-accent)] bg-[var(--game-accent-bg)] p-2 font-term text-lg leading-6 text-[var(--game-fg)]">
                Tap the Timber Camp picture to run the business. Then tap BUY. BUY spends cash.
                {section !== "supply" && (
                  <button type="button" data-onboard-supply onClick={() => chooseSection("supply")} className="ml-2 font-pixel text-[0.5rem] text-[var(--game-accent)] underline">
                    SHOW SUPPLY
                  </button>
                )}
              </p>
            )}
          </div>
        </div>

        <main className="safe-x mx-auto min-w-0 max-w-4xl space-y-2 overflow-x-hidden px-3 py-2">
          <BubbleBanner state={state} onCashOut={cashOut} />
          <CompanyNameCard state={state} onName={game.nameCompany} />
          <AnniversaryBanner state={state} />
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
            if (rowSection(i) !== section) return null;
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
                collapsed={shouldCollapseRow(state, i, { collapseMaxed }, !!expandedRows[cfg.id])}
                canCollapse={collapseMaxed && rowFullyUpgraded(state, i)}
                onToggleCollapse={() => setExpandedRows((m) => ({ ...m, [cfg.id]: !m[cfg.id] }))}
                supplyCard={section === "supply"}
                onNeed={showMaker}
                tapHint={tutorialActive(state)}
                onBuy={buy}
                onHire={hire}
                onRun={run}
                onToggleManager={toggleManager}
              />
            );
          })}

          {/* The next era waits at the end of the TECH list (or of SUPPLY
              before any TECH row is open). */}
          {firstLocked > 0 && (section === "tech" || !techOpen) && (
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
      {/* A new game names the company first; the coach waits for it (CoachHost). */}
      <CompanyNameScreen state={state} onName={game.nameCompany} />
      <TipCard />
    </div>
  );
}
