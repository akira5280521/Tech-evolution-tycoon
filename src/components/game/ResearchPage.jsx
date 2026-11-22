import { useState } from "react";
import {
  RESEARCH_TABS,
  canStartResearch,
  playerYear,
  researchItem,
  researchCost,
  researchLock,
  researchRows,
  researchSpeed,
  serverOutput,
} from "@/lib/research";
import { dataPerSecond } from "@/lib/empire";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton, Panel, ProgressBar } from "./chrome";
import { techProgress } from "@/lib/progress";
import { ItemHelp } from "./HintSheet";

function PixelMark({ id }) {
  const cells = [];
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 33 + id.charCodeAt(i)) >>> 0;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      n = (n * 1664525 + 1013904223) >>> 0;
      if (x === 0 || y === 0 || x === 15 || y === 15) continue;
      if ((n & 7) !== 0) continue;
      const hue = 30 + (id.charCodeAt(0) % 50);
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={`hsl(${hue} 70% ${40 + (n % 30)}%)`} />);
    }
  }
  return (
    <svg viewBox="0 0 16 16" width="32" height="32" className="pixel-art h-8 w-8 shrink-0 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]" aria-hidden="true" shapeRendering="crispEdges">
      <rect width="16" height="16" fill="#14122a" />
      {cells}
    </svg>
  );
}

function formatDuration(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function ResearchPage() {
  const { state, startTech } = useGameState();
  const [tab, setTab] = useState("cpu");
  const rows = researchRows(tab);
  const job = state.techJob;
  const activeName = job ? researchItem(job.id) : null;
  const live = techProgress(job, researchSpeed(state));
  const rd = Math.floor(state.data || 0);
  const perSecond = dataPerSecond(state) + serverOutput(state).perSecond;

  return (
    <ScreenShell title="TECH" subtitle="One project at a time. It keeps going while the app is closed.">
      <Panel>
        <div className="flex items-start justify-between gap-1">
          <p className="break-words font-term text-base leading-5 text-[var(--game-fg)]">R&amp;D points {rd.toLocaleString("en-US")} · +{perSecond.toFixed(2)} a second · year {playerYear(state) || "—"}</p>
          <ItemHelp kind="rd" state={state} name="R&D points" className="-mr-2 -mt-2.5" />
        </div>
        {job && activeName && (
          <div data-research-active className="mt-2">
            <p className="break-words font-pixel text-[0.55rem] leading-4 text-[var(--game-accent)]">Researching {activeName.name}</p>
            <ProgressBar progress={live} label={`${activeName.name} research`} dataAttr="tech-summary" />
          </div>
        )}
      </Panel>
      <div className="flex flex-wrap gap-2 pb-1" role="tablist">
        {RESEARCH_TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            data-research-tab={entry.id}
            onClick={() => setTab(entry.id)}
            className={`min-h-12 shrink-0 border-2 px-2 font-pixel text-[0.5rem] ${tab === entry.id ? "border-[var(--game-accent)] text-[var(--game-accent)]" : "border-[var(--game-border-strong)] text-[var(--game-muted)]"}`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {rows.map((entry) => {
          const lock = researchLock(state, entry);
          const done = (state.techDone || []).includes(entry.id);
          const running = job?.id === entry.id;
          return (
            <Panel key={entry.id}>
              <div data-research-item={entry.id} data-help-scope className="flex items-start gap-2">
                <div className={lock ? "opacity-60" : ""}><PixelMark id={entry.id} /></div>
                <div className={`min-w-0 flex-1 ${lock ? "opacity-60" : ""}`}>
                  <p className="break-words font-pixel text-[0.55rem] leading-4 text-[var(--game-fg)] [overflow-wrap:anywhere]">{entry.year} · {entry.name}</p>
                  <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">{entry.spec}</p>
                  {entry.soon ? (
                    <p className="mt-1 font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">COMING SOON</p>
                  ) : done ? (
                    <p className="mt-1 font-pixel text-[0.5rem] leading-4 text-[var(--game-success)]">DONE</p>
                  ) : running ? (
                    <div data-research-running>
                      <p className="mt-1 font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">IN PROGRESS</p>
                      <ProgressBar progress={live} label={`${entry.name} research`} dataAttr="tech" />
                    </div>
                  ) : lock ? (
                    <p data-research-lock className="mt-1 font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">{lock}</p>
                  ) : (
                    <div className="mt-2">
                      <p className="font-term text-base leading-5 text-[var(--game-muted)]">{researchCost(entry).toLocaleString("en-US")} R&amp;D · {formatDuration(entry.durationMs / researchSpeed(state))}</p>
                      <GoldButton dataAttr={`research-${entry.id}`} disabled={!canStartResearch(state, entry.id)} onClick={() => startTech(entry.id)}>
                        <span className="font-pixel text-[0.55rem]">START</span>
                      </GoldButton>
                    </div>
                  )}
                </div>
                <ItemHelp kind="research" id={entry.id} state={state} name={entry.name} className="-mr-2 -mt-2.5" />
              </div>
            </Panel>
          );
        })}
      </div>
    </ScreenShell>
  );
}
