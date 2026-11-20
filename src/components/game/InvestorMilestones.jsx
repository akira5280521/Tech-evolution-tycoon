import { INVESTOR_MILESTONES, investorPeak } from "@/lib/empire";
import { count } from "@/lib/gameConfig";
import { Panel } from "./chrome";
import { HelpTip, ItemHelp } from "./HintSheet";

// The investor milestone ladder: reached rungs, the next one, and "???" for
// the rest (each shows once the one before it is reached).
export default function InvestorMilestones({ state }) {
  const peak = investorPeak(state);
  const nextIndex = INVESTOR_MILESTONES.findIndex((m) => peak < m.at);
  return (
    <Panel>
      <h2 className="flex items-center gap-2 font-pixel text-[0.7rem] text-[var(--game-violet)]">
        INVESTOR MILESTONES <HelpTip term="investorMilestones" />
      </h2>
      <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">
        Unlocks you keep forever, by the most investors you've had: {count(peak)}.
      </p>
      <ol className="mt-3 space-y-2">
        {INVESTOR_MILESTONES.map((m, i) => {
          const reached = peak >= m.at;
          const isNext = i === nextIndex;
          const hidden = !reached && !isNext;
          return (
            <li
              key={m.id}
              data-investor-milestone={m.id}
              data-reached={reached ? "yes" : "no"}
              data-help-scope
              className={`border-2 p-2 ${reached ? "border-[var(--game-success-border)] bg-[var(--game-success-bg)]" : "border-[var(--game-border)] bg-[var(--game-bg)]"}`}
            >
              <div className="flex items-start gap-2">
                <span className={`min-w-0 flex-1 ${hidden ? "opacity-60" : ""} font-pixel text-[0.55rem] leading-5 ${reached ? "text-[var(--game-success)]" : "text-[var(--game-fg)]"}`}>
                  {hidden ? "???" : m.title}
                </span>
                <span className={`shrink-0 font-term text-base leading-5 text-[var(--game-muted)] ${hidden ? "opacity-60" : ""}`}>
                  {reached ? "✓ " : ""}
                  {count(m.at)} investors
                </span>
                <ItemHelp kind="milestone" id={m.id} state={state} name={hidden ? "this locked milestone" : m.title} className="-mr-1 -mt-2.5" />
              </div>
              {!hidden && <p className="font-term text-base leading-5 text-[var(--game-muted)]">{m.text}</p>}
              {isNext && (
                <div className="mt-1 h-1.5 border border-[var(--game-border)] bg-[var(--game-bg)]" aria-hidden="true">
                  <div className="h-full bg-[var(--game-violet)]" style={{ width: `${Math.min(100, (peak / m.at) * 100)}%` }} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
