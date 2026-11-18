import { Zap } from "lucide-react";
import { LAB_PATENT, LAB_PROJECTS, labQuote } from "@/lib/empire";
import { HelpTip } from "./HintSheet";
import { GoldButton, Panel } from "./chrome";

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
        Spend spare data any time. Each price is fixed.
      </p>
      {LAB_PROJECTS.map((item) => {
        const quote = labQuote(state, item.id, now);
        const st = status(state, item.id, now);
        const done = item.id === "crew" && state.lab?.crew;
        return (
          <div key={item.id} data-lab={item.id} className="mt-3 border-2 border-[var(--game-border)] p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-pixel text-[0.65rem]">{item.name}</h3>
              <span className="font-term text-lg text-[var(--game-muted)]">{item.cost} DATA</span>
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
            {!done && (
              <div className="mt-2">
                <GoldButton disabled={!quote.ok} onClick={() => onRun(item.id)} dataAttr={`lab-${item.id}`}>
                  <span className="font-pixel text-[0.6rem]">{quote.ok ? `${item.name} · ${item.cost} DATA` : quote.reason}</span>
                </GoldButton>
              </div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}
