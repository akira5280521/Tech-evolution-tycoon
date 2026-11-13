import { Play } from "lucide-react";
import { FOREMAN_COST, money } from "@/lib/gameConfig";
import { HelpTip } from "./HintSheet";

const MODES = [
  { id: "x1", label: "X1", sub: "ONE UNIT" },
  { id: "x10", label: "X10", sub: "TEN UNITS" },
  { id: "x100", label: "X100", sub: "HUNDRED" },
  { id: "NEXT", label: "NEXT", sub: "NEXT GOAL" },
  { id: "MAX", label: "MAX", sub: "ALL YOU CAN" },
];

const on = "border-[var(--game-accent)] bg-[var(--game-accent)] text-black";
const off = "border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-muted)]";

export default function TopBar({ state, cps, buyMode, setBuyMode, onRunAll, canRunAll, onBuyForeman }) {
  const unlocked = !!state.foreman;
  const affordForeman = state.cash >= FOREMAN_COST;
  return (
    <header className="safe-top safe-x sticky top-0 z-20 border-b-2 border-[var(--game-border)] bg-[var(--game-bg-95)] px-3 pb-2 backdrop-blur">
      <div className="mx-auto max-w-4xl space-y-1.5">
        <h1 className="title-glow font-pixel text-[0.65rem] leading-none text-[var(--game-accent)]">TECH EVOLUTION TYCOON</h1>

        <div data-cash-panel className="border-2 border-[var(--game-border-strong)] bg-[var(--game-bg-deep)] px-2 py-1 text-center shadow-[3px_3px_0_0_#000]">
          <div data-cash className="break-all font-term text-3xl leading-none text-[var(--game-success)]">{money(state.cash)}</div>
          <div className="font-term text-base leading-5 text-[var(--game-success)]">
            {money(cps)}/s · {money(state.lifetime)} this run
          </div>
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

        <div>
          <p className="flex items-center gap-2 font-pixel text-[0.55rem] leading-none text-[var(--game-fg)]">
            BUY <HelpTip term="buymodes" />
          </p>
          <div data-buy-modes className="mt-1 grid grid-cols-5 gap-1">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                data-mode={mode.id}
                aria-pressed={buyMode === mode.id}
                onClick={() => setBuyMode(mode.id)}
                className={`min-h-11 min-w-0 border-2 px-0.5 py-1 text-center shadow-[2px_2px_0_0_#000] ${buyMode === mode.id ? on : off}`}
              >
                <span className="block break-words font-pixel text-[0.5rem] leading-4 [overflow-wrap:anywhere]">{mode.label}</span>
                <span className="buy-mode-sub mt-0.5 block break-words font-term text-xs leading-4">{mode.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
