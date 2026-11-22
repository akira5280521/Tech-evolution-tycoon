import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { FOREMAN_COST, buyModeLabel, money, nextBuyMode, reachedEraLabel } from "@/lib/gameConfig";
import { HUB_LABEL, HUB_ROUTE, hubOpen } from "@/lib/hub";
import { researchSpeed, techOpen } from "@/lib/research";
import { techProgress } from "@/lib/progress";
import { ItemHelp } from "./HintSheet";

const SIDE = "relative flex min-h-12 w-[4.5rem] shrink-0 flex-col items-center justify-center border-2 px-1 overflow-hidden break-words text-center font-pixel text-[0.45rem] leading-4 shadow-[2px_2px_0_0_#000]";

// A shortcut that stays greyed out ("???") until its feature is reached.
function SideLink({ to, open, data, label, progress = null }) {
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

// How far along history the player is: the decade of the newest era they
// own, derived from that era's date (material rows use the next dated era).
function EraProgress({ state }) {
  const label = reachedEraLabel(state);
  return (
    <span
      data-era-progress
      aria-label={label ? `Current era: ${label}` : "Current era"}
      className="shrink-0 font-pixel text-[0.5rem] leading-none text-[var(--game-muted)]"
    >
      {label}
    </span>
  );
}

export default function TopBar({ state, buyMode, setBuyMode, onRunAll, canRunAll, onBuyForeman }) {
  const unlocked = !!state.foreman;
  const affordForeman = state.cash >= FOREMAN_COST;
  return (
    <header className="safe-x px-3 pb-2 pt-2">
      <div className="mx-auto max-w-4xl space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="title-glow font-pixel text-[0.65rem] leading-none text-[var(--game-accent)]">TECH EVOLUTION TYCOON</h1>
          <EraProgress state={state} />
        </div>

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
          <SideLink to="/tech" open={techOpen(state)} data="research" label="TECH" progress={techProgress(state.techJob, researchSpeed(state))} />
          <SideLink to={HUB_ROUTE} open={hubOpen(state)} data="facilities" label={HUB_LABEL} />
          <ItemHelp kind="topbar" id={{ tech: techOpen(state), rigs: hubOpen(state) }} state={state} name={`buy amount, TECH and ${HUB_LABEL}`} className="my-0 self-center" />
        </div>
      </div>
    </header>
  );
}
