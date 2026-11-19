import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { BUSINESSES, FOREMAN_COST, buyModeLabel, money, nextBuyMode } from "@/lib/gameConfig";
import { HelpTip } from "./HintSheet";

const on = "border-[var(--game-accent)] bg-[var(--game-accent)] text-black";
const off = "border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-muted)]";

// How far along history the player is: the newest era they own, of all of
// them. The game's goal is to reach the last one.
function EraProgress({ state }) {
  let at = 0;
  (state.biz || []).forEach((st, i) => {
    if ((st?.owned || 0) > 0) at = i + 1;
  });
  return (
    <span
      data-era-progress
      aria-label={`Era ${at} of ${BUSINESSES.length}`}
      className="shrink-0 font-pixel text-[0.5rem] leading-none text-[var(--game-muted)]"
    >
      ERA {at}/{BUSINESSES.length}
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
          <Link
            to="/tech"
            data-open-research
            className="flex min-h-12 w-[4.5rem] shrink-0 flex-col items-center justify-center border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-1 text-center font-pixel text-[0.45rem] leading-4 text-[var(--game-fg)] shadow-[2px_2px_0_0_#000]"
          >
            RESEARCH
          </Link>
          <Link
            to="/facilities"
            data-open-facilities
            className="flex min-h-12 w-[4.5rem] shrink-0 flex-col items-center justify-center border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-1 text-center font-pixel text-[0.45rem] leading-4 text-[var(--game-fg)] shadow-[2px_2px_0_0_#000]"
          >
            FACILITIES
          </Link>
          <HelpTip term="buymodes" className="self-center" />
        </div>
      </div>
    </header>
  );
}
