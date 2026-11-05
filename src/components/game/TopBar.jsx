import { money } from "@/lib/gameConfig";

const MODES = ["x1", "x10", "x100", "MAX"];

export default function TopBar({ state, cps, buyMode, setBuyMode }) {
  return (
    <header className="safe-top sticky top-0 z-20 border-b-2 border-[var(--game-border)] bg-[var(--game-bg-95)] px-3 pb-3 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="title-glow font-pixel text-base text-[var(--game-accent)]">PC TYCOON</h1>
          <p className="font-term text-base leading-5 text-[var(--game-muted)]">
            From glowing glass to quantum gold — the computing century, one batch at a time.
          </p>
        </div>
        <div className="text-right">
          <div data-cash className="font-term text-4xl leading-8 text-[var(--game-success)]">
            {money(state.cash)}
          </div>
          <div className="font-term text-base leading-5 text-[var(--game-muted)]">
            {money(cps)}/s · lifetime {money(state.lifetime)}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-2 flex max-w-4xl flex-wrap items-center gap-2">
        <span className="font-pixel text-sm text-[var(--game-muted)]">BUY</span>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setBuyMode(m)}
            aria-pressed={buyMode === m}
            data-mode={m}
            className={`min-h-[44px] select-none border-2 px-3 py-1 font-pixel text-sm uppercase shadow-[2px_2px_0_0_#000] ${
              buyMode === m
                ? "border-[var(--game-accent)] bg-[var(--game-accent)] text-[var(--game-accent-fg)]"
                : "border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-muted)] hover:border-[var(--game-accent)] hover:text-[var(--game-accent)]"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </header>
  );
}