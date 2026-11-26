import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { FOREMAN_COST, buyModeLabel, money, nextBuyMode } from "@/lib/gameConfig";
import StarterGoal from "./StarterGoal";
import { NextGoalChip } from "./NextGoalChip";
import { HUB_LABEL, HUB_ROUTE, hubOpen } from "@/lib/hub";
import { researchSpeed, techOpen } from "@/lib/research";
import { techProgress } from "@/lib/progress";
import { ItemHelp } from "./HintSheet";
import { hqCardHasDot, readyDots } from "@/lib/ready";
import { ReadyDot } from "./ReadyDot";

const SIDE = "relative flex min-h-12 w-[4.5rem] shrink-0 flex-col items-center justify-center border-2 px-1 overflow-hidden break-words text-center font-pixel text-[0.45rem] leading-4 shadow-[2px_2px_0_0_#000]";

// A shortcut that stays greyed out ("???") until its feature is reached.
function SideLink({ to, open, data, label, progress = null, dot = false }) {
  if (!open) {
    return (
      <span aria-disabled="true" aria-label={`${label}, locked`} {...{ [`data-open-${data}`]: "", "data-locked": "" }} className={`${SIDE} border-[var(--game-border)] bg-[var(--game-panel)] text-[var(--game-dim)]`}>
        ???
      </span>
    );
  }
  return (
    <Link
      to={to}
      {...{ [`data-open-${data}`]: "" }}
      aria-label={progress ? `${label}, research ${progress.pct}% done` : undefined}
      className={`${SIDE} border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-fg)]`}
    >
      {label}
      <ReadyDot show={dot} testId={data} />
      {progress && (
        // A thin bar along the bottom while a job runs; it takes no layout space.
        <span data-side-progress data-pct={progress.pct} aria-hidden="true" className="absolute inset-x-0.5 bottom-0.5 h-1 bg-[var(--game-bg)]">
          <span className="block h-full bg-[var(--game-accent)] transition-[width] duration-700 ease-linear" style={{ width: `${progress.pct}%` }} />
        </span>
      )}
    </Link>
  );
}

const on = "border-[var(--game-accent)] bg-[var(--game-accent)] text-black";
const off = "border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-muted)]";

// TECH and HQ, for any screen so the tutorial and later play can reach them
// without going all the way back to the game list.
export function TechHqLinks({ state }) {
  const dots = readyDots(state);
  return (
    <div className="flex items-stretch gap-2">
      <SideLink to="/tech" open={techOpen(state)} data="research" label="TECH" progress={techProgress(state.techJob, researchSpeed(state))} dot={(dots.tech || []).length > 0} />
      <SideLink to={HUB_ROUTE} open={hubOpen(state)} data="facilities" label={HUB_LABEL} dot={(dots.hq || []).length > 0} />
    </div>
  );
}

export default function TopBar({ state, buyMode, setBuyMode, onRunAll, canRunAll, onBuyForeman }) {
  const unlocked = !!state.foreman;
  const affordForeman = state.cash >= FOREMAN_COST;
  return (
    <header className="safe-x px-3 pb-2 pt-2">
      <div className="mx-auto max-w-4xl space-y-1.5">
        <div className="flex items-stretch gap-1">
        {unlocked ? (
          <button
            type="button"
            data-run-all
            aria-label="Run All"
            onClick={onRunAll}
            disabled={!canRunAll}
            className={`flex min-h-11 w-full items-center justify-center gap-2 border-2 px-2 font-pixel text-[0.55rem] uppercase shadow-[2px_2px_0_0_#000] ${canRunAll ? `${off} hover:border-[var(--game-accent)] hover:text-[var(--game-accent)]` : "cursor-not-allowed border-[var(--game-border)] text-[var(--game-dim)]"}`}
          >
            <Play className="h-4 w-4 shrink-0" aria-hidden="true" />
            Run All
          </button>
        ) : (
          <button
            type="button"
            data-buy-foreman
            aria-label={`Hire the Foreman for ${money(FOREMAN_COST)}`}
            onClick={onBuyForeman}
            disabled={!affordForeman}
            className={`flex min-h-11 w-full flex-col items-center justify-center border-2 px-2 py-1 text-center shadow-[2px_2px_0_0_#000] ${affordForeman ? on : "cursor-not-allowed border-[var(--game-border)] bg-[var(--game-panel)] text-[var(--game-dim)]"}`}
          >
            <span className="font-pixel text-[0.55rem] leading-4">FOREMAN</span>
            <span className="font-term text-base leading-5">{money(FOREMAN_COST)} · unlocks Run All</span>
          </button>
        )}
        <ItemHelp kind="foreman" state={state} name="the Foreman" className="my-0 self-center" />
        </div>

        <div className="flex items-stretch gap-2">
          <button
            type="button"
            data-buy-modes
            data-mode={buyMode}
            aria-label={`Buy amount ${buyModeLabel(buyMode)}. Tap to change.`}
            onClick={() => setBuyMode(nextBuyMode(buyMode))}
            className="flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-2 py-1 text-black shadow-[3px_3px_0_0_#000]"
          >
            <span className="font-pixel text-sm leading-5">{buyModeLabel(buyMode)}</span>
            <span className="font-term text-lg leading-5">BUY AMOUNT</span>
          </button>
          <SideLink to="/tech" open={techOpen(state)} data="research" label="TECH" progress={techProgress(state.techJob, researchSpeed(state))} dot={(readyDots(state).tech || []).length > 0} />
          <SideLink to={HUB_ROUTE} open={hubOpen(state)} data="facilities" label={HUB_LABEL} dot={(readyDots(state).hq || []).length > 0} />
          <ItemHelp kind="topbar" id={{ tech: techOpen(state), rigs: hubOpen(state) }} state={state} name={`buy amount, TECH and ${HUB_LABEL}`} className="my-0 self-center" />
        </div>
        {/* The NEXT goal sits under the buy-amount row (GAME only). */}
        <NextGoalChip state={state} />
        <StarterGoal state={state} />
      </div>
    </header>
  );
}
