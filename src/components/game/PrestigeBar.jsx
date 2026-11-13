import { useState } from "react";
import { PRESTIGE_UNIT, investorsFor, money, prestigeMult } from "@/lib/gameConfig";
import { HelpTip } from "./HintSheet";

// Investors and starting over (prestige), in plain words. The exact numbers
// sit behind "Details" for players who want them.
export default function PrestigeBar({ state, onPrestige }) {
  const [details, setDetails] = useState(false);
  const claimable = investorsFor(state.lifetime);
  const pct = Math.round((prestigeMult(state.investors) - 1) * 100);
  const nextAt = money(Math.pow(claimable + 1, 2) * PRESTIGE_UNIT);
  const firstAt = money(PRESTIGE_UNIT);
  const investors = state.investors || 0;

  let line;
  if (claimable > 0) {
    line = `Start over now and ${claimable} new ${claimable === 1 ? "investor joins" : "investors join"}. Keep going to get more: the next one comes at ${nextAt} earned this run.`;
  } else if (investors === 0) {
    line = `Later, you can start over for a permanent boost. Once you've earned ${firstAt} in one run, you can trade it in for investors. Each one makes everything earn more, forever.`;
  } else {
    line = `Your next investor comes at ${nextAt} earned this run.`;
  }

  return (
    <section
      aria-label="Investors"
      className="border-2 border-[var(--game-violet-border)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 font-pixel text-sm text-[var(--game-violet)]">
            INVESTORS <HelpTip term="prestige" />
          </h2>
          {investors > 0 && (
            <p className="font-term text-base leading-5 text-[var(--game-fg)]">
              {investors} on your board <span className="text-[var(--game-violet)]">· +{pct}% income, forever</span>
            </p>
          )}
          <p data-prestige-line className="font-term text-base leading-5 text-[var(--game-muted)]">{line}</p>
          <button
            type="button"
            data-prestige-details
            aria-expanded={details}
            onClick={() => setDetails((v) => !v)}
            className="min-h-8 font-term text-sm leading-4 text-[var(--game-dim)] underline"
          >
            {details ? "Hide details" : "Details"}
          </button>
          {details && (
            <p className="font-term text-sm leading-4 text-[var(--game-dim)]">
              Starting over (prestige) resets your cash, machines, managers and upgrades. Investors, research, tokens and badges stay. The first 100 investors add +5% each, the next 400 add +1% each, and every one after that adds +0.07%. All bonuses together approach an income limit that rises when you fork the timeline.
            </p>
          )}
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
          <span className="font-pixel text-sm uppercase">Start over</span>
          <span className="block font-term text-lg leading-5">
            {claimable >= 1 ? `+${claimable} investor${claimable === 1 ? "" : "s"}` : `at ${firstAt}`}
          </span>
        </button>
      </div>
    </section>
  );
}
