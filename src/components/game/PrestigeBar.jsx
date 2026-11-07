import { PRESTIGE_UNIT, investorsFor, money, prestigeMult } from "@/lib/gameConfig";

export default function PrestigeBar({ state, onPrestige }) {
  const claimable = investorsFor(state.lifetime);
  const pct = Math.round((prestigeMult(state.investors) - 1) * 100);
  const nextAt = money(Math.pow(claimable + 1, 2) * PRESTIGE_UNIT);

  return (
    <section
      aria-label="Investors"
      className="border-2 border-[var(--game-violet-border)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className="font-pixel text-sm text-[var(--game-violet)]">INVESTORS</h2>
          <p className="font-term text-base leading-5 text-[var(--game-fg)]">
            {state.investors} on your board
            <span className="text-[var(--game-violet)]"> · +{pct}% profit forever</span>
            {claimable > 0 && (
              <span className="text-[var(--game-success)]"> · +{claimable} ready to recruit</span>
            )}
          </p>
          <p className="font-term text-sm leading-4 text-[var(--game-dim)]">
            The first 100 investors add +5% each and the next 400 add +1%, up to ×10. Prestige
            resets your empire; next recruit at {nextAt} lifetime earnings.
          </p>
        </div>
        <button
          type="button"
          onClick={onPrestige}
          disabled={claimable < 1}
          data-prestige="recruit"
          className={`min-h-[44px] select-none border-2 px-4 py-2 text-center shadow-[3px_3px_0_0_#000] ${
            claimable >= 1
              ? "border-[var(--game-violet)] bg-[var(--game-violet-bg)] text-[var(--game-violet)] hover:bg-[var(--game-violet-bg-hover)]"
              : "cursor-not-allowed border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-dim)]"
          }`}
        >
          <span className="font-pixel text-sm uppercase">Prestige</span>
          <span className="block font-term text-lg leading-5">
            {claimable >= 1 ? `+${claimable}` : "locked"}
          </span>
        </button>
      </div>
    </section>
  );
}