import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { FlaskConical, Lock, X } from "lucide-react";
import { RESEARCH_MS } from "@/lib/gameConfig";
import { HUB_LABEL } from "@/lib/hub";
import {
  QUEUE_SLOTS,
  queueSlotQuote,
  queueSlots,
  queueWait,
  researchCost,
  researchItem,
  researchSpeed,
  researchWhereLabel,
  serverOutput,
  techJobs,
  techQueue,
} from "@/lib/research";
import { SPECIALTIES, specialtySlots } from "@/lib/empire";
import { timedProgress, techProgress } from "@/lib/progress";
import { labSummary, specialtySummary } from "@/lib/rdSummary";
import { readyDots } from "@/lib/ready";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton, Panel, ProgressBar, SubTabs } from "./chrome";
import TechList from "./ResearchPage";
import { SpecialtyList } from "./MorePage";
import LabProjects from "./LabProjects";
import { HelpTip } from "./HintSheet";

export const RD_TABS = [
  { id: "queue", label: "QUEUE" },
  { id: "tech", label: "TECH" },
  { id: "specialty", label: "SPECIALTY" },
  { id: "lab", label: "LAB PROJECTS" },
];

// /research#tech-cpu-8080 -> { tab: "tech", focus: "cpu-8080" }
export function readRdHash(hash) {
  const h = decodeURIComponent((hash || "").replace(/^#/, ""));
  if (h.startsWith("tech-")) return { tab: "tech", focus: h.slice(5) };
  if (RD_TABS.some((t) => t.id === h)) return { tab: h, focus: "" };
  return { tab: "queue", focus: "" };
}

function minutes(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

// The main R&D page: what is being researched now, and what waits after it.
// No points card: the points are in the status bar at the top.
function QueueView({ state, onPick, onUnqueue }) {
  const speed = researchSpeed(state);
  const jobs = techJobs(state);
  const queue = techQueue(state);
  const owned = queueSlots(state);
  const wait = queueWait(state);
  const spec = state.researchJob ? SPECIALTIES.find((s) => s.id === state.researchJob.id) : null;
  return (
    <div data-rd-queue className="space-y-3">
      <Panel>
        <h2 className="flex items-center gap-2 font-pixel text-[0.65rem] text-[var(--game-accent)]">
          <FlaskConical className="h-4 w-4" aria-hidden="true" /> NOW RESEARCHING
        </h2>
        {jobs.length === 0 ? (
          <div data-rd-idle className="mt-2 space-y-2">
            <p className="font-term text-lg leading-6 text-[var(--game-muted)]">{wait ? `Next in the queue: ${researchItem(queue[0])?.name}. ${wait}.` : "Nothing is being researched."}</p>
            <GoldButton dataAttr="rd-pick-tech" onClick={() => onPick("tech")}>
              <span className="font-pixel text-[0.55rem]">PICK A PROJECT ON TECH</span>
            </GoldButton>
          </div>
        ) : (
          jobs.map((job) => {
            const entry = researchItem(job.id);
            if (!entry) return null;
            return (
              <div key={job.id} data-rd-now={job.id} data-research-active className="mt-2">
                <p className="break-words font-pixel text-[0.55rem] leading-4 text-[var(--game-fg)]">{entry.year} · {entry.name}</p>
                <p className="font-pixel text-[0.45rem] leading-4 text-[var(--game-muted)]">USED IN: {researchWhereLabel(entry).toUpperCase()}</p>
                <ProgressBar progress={techProgress(job, speed)} label={`${entry.name} research`} dataAttr="tech-summary" />
              </div>
            );
          })
        )}
        {spec && (
          <div data-rd-specialty-now className="mt-3">
            <p className="font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">SPECIALTY: {spec.name}</p>
            <ProgressBar progress={timedProgress(state.researchJob.startedAt, RESEARCH_MS)} label={`${spec.name} research`} dataAttr="specialty-summary" />
          </div>
        )}
        <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">
          One project at a time. R&amp;D comes from your machines in {HUB_LABEL} &gt; RESEARCH SERVERS (+{rateText(serverOutput(state).perSecond)} a second).
        </p>
      </Panel>
      <Panel>
        <h2 className="flex items-center gap-2 font-pixel text-[0.65rem] text-[var(--game-accent)]">
          UP NEXT <HelpTip term="queue" />
        </h2>
        <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">
          {owned === 0 ? "No queue yet. Each project starts by hand until the lab earns a queue slot." : "Queued projects start by themselves, in order, and pay their R&D when they start."}
        </p>
        <ol className="mt-2 space-y-2">
          {QUEUE_SLOTS.map((slot, i) => {
            if (i >= owned) {
              return (
                <li key={slot.id} data-queue-slot={i + 1} data-queue-locked className="flex items-start gap-2 border-2 border-dashed border-[var(--game-border)] p-2 opacity-60">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--game-dim)]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="font-pixel text-[0.5rem] leading-4 text-[var(--game-dim)]">SLOT {i + 1} · LOCKED</p>
                    <p data-queue-hint className="font-term text-base leading-5 text-[var(--game-muted)]">
                      {slot.name} in LAB PROJECTS · {slot.year} · {slot.cost} R&amp;D
                    </p>
                  </div>
                </li>
              );
            }
            const id = queue[i];
            const entry = id && researchItem(id);
            if (!entry) {
              return (
                <li key={slot.id} data-queue-slot={i + 1} data-queue-empty className="border-2 border-dashed border-[var(--game-border-strong)] p-2">
                  <p className="font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">SLOT {i + 1} · EMPTY</p>
                  <p className="font-term text-base leading-5 text-[var(--game-muted)]">Tap ADD TO QUEUE on a TECH project.</p>
                </li>
              );
            }
            return (
              <li key={slot.id} data-queue-slot={i + 1} data-queued={entry.id} className="border-2 border-[var(--game-border-strong)] p-2">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-pixel text-[0.5rem] leading-4 text-[var(--game-fg)]">{i + 1}. {entry.year} · {entry.name}</p>
                    <p className="font-term text-base leading-5 text-[var(--game-muted)]">
                      {researchCost(entry).toLocaleString("en-US")} R&amp;D · {minutes(entry.durationMs / speed)}
                      {i === 0 && wait ? ` · ${wait}` : ""}
                    </p>
                  </div>
                  <button type="button" data-unqueue={entry.id} aria-label={`Remove ${entry.name} from the queue`} onClick={() => onUnqueue(entry.id)} className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[var(--game-border-strong)] text-[var(--game-muted)]">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <ProgressBar progress={{ pct: 0, done: false, leftMs: entry.durationMs / speed, waiting: true }} label={`${entry.name} waits`} dataAttr="queued" />
              </li>
            );
          })}
        </ol>
      </Panel>
    </div>
  );
}

function rateText(v) {
  return v >= 10 ? v.toFixed(1) : v >= 0.1 ? v.toFixed(2) : v.toFixed(3);
}

// The research queue slots, earned as Lab Projects in their era.
function QueueSlotProjects({ state, onBuy }) {
  const owned = queueSlots(state);
  const quote = queueSlotQuote(state);
  return (
    <Panel>
      <h2 className="font-pixel text-[0.65rem] text-[var(--game-accent)]">RESEARCH QUEUE SLOTS</h2>
      <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">{owned} of {QUEUE_SLOTS.length} open. Each one lets one more project wait in the queue.</p>
      {QUEUE_SLOTS.map((slot, i) => {
        const have = i < owned;
        const next = i === owned;
        return (
          <div key={slot.id} data-queue-project={slot.id} className={`mt-2 border-2 border-[var(--game-border)] p-3 ${!have && !next ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-pixel text-[0.6rem]">{slot.name}</h3>
              <span className="font-term text-lg text-[var(--game-muted)]">{slot.year} · {slot.cost} R&amp;D</span>
            </div>
            <p className="mt-1 font-term text-lg leading-6">{slot.blurb}</p>
            {have ? (
              <p className="mt-1 font-pixel text-[0.5rem] text-[var(--game-success)]">OPEN</p>
            ) : next ? (
              <div className="mt-2">
                <GoldButton dataAttr={`lab-queue-${slot.id}`} disabled={!quote.ok} onClick={onBuy}>
                  <span className="font-pixel text-[0.55rem]">{quote.ok ? `${slot.name} · ${slot.cost} R&D` : quote.reason}</span>
                </GoldButton>
              </div>
            ) : (
              <p className="mt-1 font-pixel text-[0.5rem] text-[var(--game-dim)]">AFTER {QUEUE_SLOTS[i - 1].name}</p>
            )}
          </div>
        );
      })}
    </Panel>
  );
}

export default function RdPage() {
  const { state, chooseSpecialty, runLabProject, markReadyView, unqueueTech, buyQueueSlot } = useGameState();
  const location = useLocation();
  const navigate = useNavigate();
  const { tab, focus } = readRdHash(location.hash);
  useEffect(() => { markReadyView?.("research"); }, [markReadyView, state.data, state.researchJob, state.lab, state.specialties]);
  const pick = (id) => navigate({ to: "/research", hash: id === "queue" ? "" : id, replace: true });
  const dots = readyDots(state);
  const ready = new Set(dots.research || []);
  const tabs = RD_TABS.map((t) => ({
    ...t,
    dot:
      (t.id === "tech" && (dots.tech || []).length > 0) ||
      (t.id === "specialty" && [...ready].some((k) => k.startsWith("spec"))) ||
      (t.id === "lab" && [...ready].some((k) => k.startsWith("lab"))),
  }));
  return (
    <ScreenShell title="R&D" subtitle="">
      <SubTabs tabs={tabs} active={tab} onPick={pick} name="rd" />
      {tab === "queue" && <QueueView state={state} onPick={pick} onUnqueue={unqueueTech} />}
      {tab === "tech" && <TechList focusId={focus} />}
      {tab === "specialty" && (
        <div data-rd-section="specialty" className="space-y-3">
          <Panel>
            <h2 className="flex items-center gap-2 font-pixel text-[0.65rem] text-[var(--game-accent)]">COMPANY SPECIALTY <HelpTip term="specialty" /></h2>
            <p data-rd-summary="specialty" className="mt-1 font-term text-lg leading-6 text-[var(--game-fg)]">{specialtySummary(state)}</p>
            <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">
              A bonus you keep forever, even through a prestige. {specialtySlots(state)} {specialtySlots(state) === 1 ? "slot" : "slots"}; forking the timeline opens another.
            </p>
          </Panel>
          <SpecialtyList state={state} onCommit={chooseSpecialty} />
        </div>
      )}
      {tab === "lab" && (
        <div data-rd-section="lab" className="space-y-3">
          <Panel>
            <h2 className="flex items-center gap-2 font-pixel text-[0.65rem] text-[var(--game-accent)]">LAB PROJECTS <HelpTip term="lab" /></h2>
            <p data-rd-summary="lab" className="mt-1 font-term text-lg leading-6 text-[var(--game-fg)]">{labSummary(state)}</p>
            <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">Spend spare R&amp;D points on one-off projects at fixed prices, and earn research queue slots.</p>
          </Panel>
          <QueueSlotProjects state={state} onBuy={buyQueueSlot} />
          <LabProjects state={state} onRun={runLabProject} bare />
        </div>
      )}
    </ScreenShell>
  );
}
