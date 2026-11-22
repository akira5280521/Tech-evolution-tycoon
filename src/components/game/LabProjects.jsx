import { Zap } from "lucide-react";
import { LAB_FAB, LAB_OVERCLOCK, LAB_PATENT, LAB_PROJECTS, labQuote } from "@/lib/empire";
import { REFINED } from "@/lib/gameConfig";
import { timedProgress } from "@/lib/progress";
import { HelpTip, ItemHelp } from "./HintSheet";
import { GoldButton, Panel, ProgressBar } from "./chrome";

const clock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function localDay(now) {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// What a project's card says about where it stands right now.
function status(state, id, now) {
  const lab = state.lab || {};
  if (id === "overclock") {
    if (now < (lab.overclockUntil || 0)) return { text: `RUNNING · ${clock(lab.overclockUntil - now)} left`, tone: "good" };
    if (now < (lab.coolUntil || 0)) return { text: `COOLING DOWN · ready in ${clock(lab.coolUntil - now)}`, tone: "wait" };
    return null;
  }
  if (id === "patent") {
    const used = lab.patentDay === localDay(now) ? lab.patents || 0 : 0;
    return { text: `${LAB_PATENT.perDay - used} of ${LAB_PATENT.perDay} filings left today`, tone: "info" };
  }
  if (id === "crew" && lab.crew) return { text: "HIRED", tone: "good" };
  if (id === "fab") {
    const used = lab.fabDay === localDay(now) ? lab.fabs || 0 : 0;
    return { text: `${LAB_FAB.perDay - used} of ${LAB_FAB.perDay} test runs left today`, tone: "info" };
  }
  if (id === "cleanroom" && now < (lab.cleanUntil || 0)) return { text: `RUNNING · ${clock(lab.cleanUntil - now)} left`, tone: "good" };
  return null;
}

// Lab projects: spend spare research data any time, at fixed prices.
export default function LabProjects({ state, onRun }) {
  const now = Date.now();
  return (
    <Panel>
      <h2 className="flex items-center gap-2 font-pixel text-[0.7rem]">
        <Zap className="h-4 w-4 text-[var(--game-accent)]" aria-hidden="true" />
        LAB PROJECTS <HelpTip term="lab" />
      </h2>
      <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
        Spend spare R&D points any time. Each price is fixed.
      </p>
      {LAB_PROJECTS.map((item) => {
        const quote = labQuote(state, item.id, now);
        const st = status(state, item.id, now);
        const done = item.id === "crew" && state.lab?.crew;
        return (
          <div key={item.id} data-lab={item.id} data-help-scope className="mt-3 border-2 border-[var(--game-border)] p-3">
            <div className="flex items-start gap-2">
              <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-pixel text-[0.65rem]">{item.name}</h3>
                <span className="font-term text-lg text-[var(--game-muted)]">
                  {item.cost} R&amp;D
                  {item.materials &&
                    Object.entries(item.materials).map(([key, n]) => (
                      <span key={key} data-lab-material={key} className={(state.supply?.[key] || 0) >= n ? "" : "text-[var(--game-danger)]"}>
                        {` + ${n} ${REFINED[key]?.short || key}`}
                      </span>
                    ))}
                </span>
              </div>
              <ItemHelp kind="lab" id={item.id} state={state} name={item.name} className="-mr-2 -mt-2.5" />
            </div>
            <p className="mt-2 font-term text-lg leading-6">{item.blurb}</p>
            {st && (
              <p
                data-lab-status
                className={`mt-2 font-pixel text-[0.55rem] leading-5 ${
                  st.tone === "good" ? "text-[var(--game-success)]" : st.tone === "wait" ? "text-[var(--game-accent)]" : "text-[var(--game-muted)]"
                }`}
              >
                {st.text}
              </p>
            )}
            {item.id === "overclock" && now < (state.lab?.overclockUntil || 0) && (
              <ProgressBar
                progress={timedProgress(state.lab.overclockUntil - LAB_OVERCLOCK.ms, LAB_OVERCLOCK.ms, now)}
                label="Overclock"
                dataAttr="overclock"
              />
            )}
            {!done && (
              <div className="mt-2">
                <GoldButton disabled={!quote.ok} onClick={() => onRun(item.id)} dataAttr={`lab-${item.id}`}>
                  <span className="font-pixel text-[0.6rem]">{quote.ok ? `${item.name} · ${item.cost} R&D` : quote.reason}</span>
                </GoldButton>
              </div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}
