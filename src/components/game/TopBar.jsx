import { Play, Rows3, Volume2, VolumeX } from "lucide-react";
import { money } from "@/lib/gameConfig";

const MODES = [
  { id: "x1", label: "X1", sub: "ONE UNIT" },
  { id: "x10", label: "X10", sub: "TEN UNITS" },
  { id: "x100", label: "X100", sub: "HUNDRED" },
  { id: "MAX", label: "MAX", sub: "ALL AFFORDABLE" },
];

const on = "border-[var(--game-accent)] bg-[var(--game-accent)] text-black";
const off = "border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-muted)]";

export default function TopBar({ state, cps, buyMode, setBuyMode, compact, onCompact, sound, onSound, onRunAll, canRunAll }) {
  return (
    <header className="safe-top sticky top-0 z-20 border-b-2 border-[var(--game-border)] bg-[var(--game-bg-95)] px-3 pb-3 backdrop-blur">
      <div className="mx-auto max-w-4xl space-y-3">
        <div>
          <h1 className="title-glow font-pixel text-base text-[var(--game-accent)]">PC TYCOON</h1>
          <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
            From glowing glass to quantum gold - the computing century, one batch at a time.
          </p>
        </div>

        <div data-cash-panel className="border-2 border-[var(--game-border-strong)] bg-[var(--game-bg-deep)] px-3 py-3 text-center shadow-[4px_4px_0_0_#000]">
          <div data-cash className="font-term text-5xl leading-none text-[var(--game-success)]">{money(state.cash)}</div>
          <div className="mt-2 font-term text-lg leading-5 text-[var(--game-success)]">
            {money(cps)}/s · lifetime {money(state.lifetime)}
          </div>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-2">
          <button
            type="button"
            data-compact
            aria-pressed={compact}
            onClick={onCompact}
            className={`flex min-h-11 items-center justify-center gap-2 border-2 px-2 font-pixel text-[0.55rem] uppercase shadow-[3px_3px_0_0_#000] ${compact ? on : off}`}
          >
            <Rows3 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Compact Rows
          </button>
          <button
            type="button"
            data-run-all
            onClick={onRunAll}
            disabled={!canRunAll}
            className={`flex min-h-11 items-center justify-center gap-2 border-2 px-2 font-pixel text-[0.55rem] uppercase shadow-[3px_3px_0_0_#000] ${canRunAll ? off + " hover:border-[var(--game-accent)] hover:text-[var(--game-accent)]" : "cursor-not-allowed border-[var(--game-border)] text-[var(--game-dim)]"}`}
          >
            <Play className="h-4 w-4 shrink-0" aria-hidden="true" />
            Run All
          </button>
        </div>

        <button
          type="button"
          data-sound
          aria-pressed={sound}
          onClick={onSound}
          className={`flex min-h-11 items-center gap-2 border-2 px-3 font-pixel text-[0.55rem] uppercase shadow-[3px_3px_0_0_#000] ${off}`}
        >
          {sound ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
          {sound ? "Sound On" : "Sound Off"}
        </button>

        <div>
          <p className="font-pixel text-sm text-[var(--game-fg)]">BUY</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                data-mode={mode.id}
                aria-pressed={buyMode === mode.id}
                onClick={() => setBuyMode(mode.id)}
                className={`min-h-[52px] border-2 px-1 py-1 text-center shadow-[3px_3px_0_0_#000] ${buyMode === mode.id ? on : off}`}
              >
                <span className="block font-pixel text-[0.6rem]">{mode.label}</span>
                <span className="mt-1 block font-term text-sm leading-4">{mode.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
