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
    <header className="safe-top sticky top-0 z-20 border-b-2 border-[var(--game-border)] bg-[var(--game-bg-95)] px-3 pb-2 backdrop-blur">
      <div className="mx-auto max-w-4xl space-y-1.5">
        <h1 className="title-glow font-pixel text-[0.65rem] leading-none text-[var(--game-accent)]">PC TYCOON</h1>

        <div data-cash-panel className="border-2 border-[var(--game-border-strong)] bg-[var(--game-bg-deep)] px-2 py-1 text-center shadow-[3px_3px_0_0_#000]">
          <div data-cash className="font-term text-3xl leading-none text-[var(--game-success)]">{money(state.cash)}</div>
          <div className="font-term text-base leading-4 text-[var(--game-success)]">
            {money(cps)}/s · lifetime {money(state.lifetime)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            data-compact
            aria-pressed={compact}
            aria-label="Compact Rows"
            onClick={onCompact}
            className={`flex min-h-9 items-center justify-center gap-1 border-2 px-1 font-pixel text-[0.42rem] uppercase leading-tight shadow-[2px_2px_0_0_#000] ${compact ? on : off}`}
          >
            <Rows3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Compact</span>
          </button>
          <button
            type="button"
            data-run-all
            aria-label="Run All"
            onClick={onRunAll}
            disabled={!canRunAll}
            className={`flex min-h-9 items-center justify-center gap-1 border-2 px-1 font-pixel text-[0.42rem] uppercase leading-tight shadow-[2px_2px_0_0_#000] ${canRunAll ? off + " hover:border-[var(--game-accent)] hover:text-[var(--game-accent)]" : "cursor-not-allowed border-[var(--game-border)] text-[var(--game-dim)]"}`}
          >
            <Play className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Run All</span>
          </button>
          <button
            type="button"
            data-sound
            aria-pressed={sound}
            aria-label={sound ? "Sound On" : "Sound Off"}
            onClick={onSound}
            className={`flex min-h-9 items-center justify-center gap-1 border-2 px-1 font-pixel text-[0.42rem] uppercase leading-tight shadow-[2px_2px_0_0_#000] ${off}`}
          >
            {sound ? <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : <VolumeX className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            <span className="truncate">{sound ? "Sound" : "Muted"}</span>
          </button>
        </div>

        <div>
          <p className="font-pixel text-[0.5rem] leading-none text-[var(--game-fg)]">BUY</p>
          <div className="mt-1 grid grid-cols-4 gap-1.5">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                data-mode={mode.id}
                aria-pressed={buyMode === mode.id}
                onClick={() => setBuyMode(mode.id)}
                className={`min-h-9 border-2 px-0.5 py-0.5 text-center shadow-[2px_2px_0_0_#000] ${buyMode === mode.id ? on : off}`}
              >
                <span className="block font-pixel text-[0.5rem] leading-none">{mode.label}</span>
                <span className="mt-0.5 block truncate font-term text-sm leading-4">{mode.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
