import { useState } from "react";
import { PRESTIGE_UNIT, count, investorsFor, money, prestigeMult } from "@/lib/gameConfig";
import { HelpTip } from "./HintSheet";
import { empireFactors, investorPeak, nextInvestorMilestone } from "@/lib/empire";

// Investors and starting over (prestige), in plain words. The exact numbers
// sit behind "Details" for players who want them.
export default function PrestigeBar({ state, onPrestige }) {
  const [details, setDetails] = useState(false);
  const claimable = investorsFor(state.lifetime);
  const pct = Math.round((prestigeMult(state.investors) - 1) * 100);
  const nextAt = money(Math.pow(claimable + 1, 2) * PRESTIGE_UNIT);
  const firstAt = money(PRESTIGE_UNIT);
  const investors = state.investors || 0;

  // Prestige guide: what a prestige now would do to income, and the common
  // rule of thumb: prestige once it would at least double your investors.
  const now = Date.now();
  const incomeNow = empireFactors(state, now).total;
  const incomeAfter = claimable > 0 ? empireFactors({ ...state, investors: investors + claimable }, now).total : incomeNow;
  const doubles = claimable > 0 && claimable >= Math.max(1, investors);
  const doubleAt = money(Math.pow(Math.max(1, investors), 2) * PRESTIGE_UNIT);

  let line;
  if (claimable > 0) {
    line = `Prestige now and ${claimable} new ${claimable === 1 ? "investor joins" : "investors join"}. Keep going to get more: the next one comes at ${nextAt} earned this run.`;
  } else if (investors === 0) {
    line = `Later, you can prestige for a permanent boost. Once you've earned ${firstAt} in one run, you can start over and trade the run in for investors. Each one makes everything earn more, forever.`;
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
          {claimable > 0 && (
            <p data-prestige-guide={doubles ? "good" : "wait"} className={`font-term text-base leading-5 ${doubles ? "text-[var(--game-success)]" : "text-[var(--game-fg)]"}`}>
              Income ×{incomeNow.toFixed(2)} now → ×{incomeAfter.toFixed(2)} after.{" "}
              {doubles
                ? "Good time to prestige: it at least doubles your investors."
                : `Most players wait until it doubles their investors (at ${doubleAt} this run).`}
            </p>
          )}
          {nextInvestorMilestone(state) && (
            <p data-next-unlock className="font-term text-base leading-5 text-[var(--game-violet)]">
              Next unlock at {count(nextInvestorMilestone(state).at)} investors (you've had {count(investorPeak(state))}): see BOARD.
            </p>
          )}
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
              A prestige resets your cash, businesses, managers and upgrades. Investors, research, tokens and badges stay. The first 100 investors add +5% each, the next 400 add +1% each, and every one after that adds +0.07%. All bonuses together approach an income limit that rises when you fork the timeline.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onPrestige}
          disabled={claimable < 1}
          data-prestige="recruit"
          data-prestige-ready={doubles ? "yes" : "no"}
          className={`min-h-[44px] select-none border-2 px-4 py-2 text-center shadow-[3px_3px_0_0_#000] ${doubles ? "prestige-ready" : ""} ${
            claimable >= 1
              ? "border-[var(--game-violet)] bg-[var(--game-violet-bg)] text-[var(--game-violet)] hover:bg-[var(--game-violet-bg-hover)]"
              : "cursor-not-allowed border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-dim)]"
          }`}
        >
          <span className="font-pixel text-sm uppercase">Prestige</span>
          <span className="block font-term text-lg leading-5">
            {claimable >= 1 ? `+${claimable} investor${claimable === 1 ? "" : "s"}` : `at ${firstAt}`}
          </span>
        </button>
      </div>
    </section>
  );
}
