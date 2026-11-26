import { useEffect, useState } from "react";
import {
  RESEARCH_TABS,
  canStartResearch,
  playerYear,
  researchItem,
  researchCost,
  researchLock,
  researchRows,
  researchSpeed,
  researchUnlocks,
  secondTechSlot,
  TECH_OPENS,
  FIRST_RESEARCH_ID,
  techJobs,
  hasResearchMaterials,
  researchMaterials,
  inGameMonth,
  queueBlock,
  researchSection,
  researchWhereLabel,
  serverTier,
  SERVER_TIERS,
} from "@/lib/research";
import { monthName } from "@/lib/releaseMonths";
import { REFINED } from "@/lib/gameConfig";
import { useGameState } from "./GameState";
import { GoldButton, Panel, ProgressBar } from "./chrome";
import { techProgress } from "@/lib/progress";
import { ItemHelp } from "./HintSheet";
import { SearchBox } from "./SearchBox";
import { matchesSearch, revealedHaystack } from "@/lib/searchText";
import { techRevealed } from "@/lib/techFog";

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

// The two halves of the TECH timeline (T3 item 57): what goes on the PC Build
// Bench, and what goes in the server room (and the other plants).
export const TECH_SECTIONS = [
  { id: "home", label: "HOME PC", note: "Boards, CPUs, memory, cases, power supplies, sound and video for the PC Build Bench." },
  { id: "room", label: "SERVER ROOM", note: "Machines, generators, cooling, disks and networks for the server room and the other plants." },
];

function tabsFor(section) {
  return RESEARCH_TABS.filter((entry) => researchRows(entry.id).some((row) => researchSection(row, section)));
}

// The full TECH timeline, as the TECH tab of the R&D menu. focusId: a
// project to open and scroll to (from GO TO TECH or a NEXT goal).
export default function TechList({ focusId = "" }) {
  const { state, startTech, queueTech, noteTutorialPage, markReadyView } = useGameState();
  const [section, setSection] = useState("home");
  const [tab, setTab] = useState("cpu");
  const [focus, setFocus] = useState(null);
  const [query, setQuery] = useState("");
  // Arriving from a locked era's GO TO TECH (/research#tech-id): open that
  // project's tab and scroll to it.
  useEffect(() => {
    const id = focusId;
    let entry = id && researchItem(id);
    // New players land on the first teaching project (it lives on Storage),
    // not on the CPU tab where the tree starts in 1971.
    if (!entry) {
      const first = researchItem(FIRST_RESEARCH_ID);
      const done = first && (state.techDone || []).includes(first.id);
      const jobs = techJobs(state);
      const runningFirst = first && jobs.some((job) => job.id === first.id);
      // Don't yank away from a project already running on another tab.
      if (first && !done && (runningFirst || jobs.length === 0)) entry = first;
      const mark1 = researchItem("srv-mark1");
      if (!entry && done && jobs.length === 0 && mark1 && playerYear(state) >= mark1.year && !(state.techDone || []).includes(mark1.id)) entry = mark1;
    }
    if (!entry || !techRevealed(state, entry)) return;
    const sec = researchSection(entry, "home") ? "home" : "room";
    setSection(sec);
    setTab(entry.tab);
    setFocus(entry.id);
    const timer = setTimeout(() => document.querySelector(`[data-research-item="${CSS.escape(entry.id)}"]`)?.scrollIntoView({ block: "center" }), 50);
    return () => clearTimeout(timer);
  }, [focusId]);
  useEffect(() => { noteTutorialPage?.("tech"); }, [noteTutorialPage]);
  useEffect(() => { markReadyView?.("tech"); }, [markReadyView, state.techDone]);
  const sectionTabs = tabsFor(section);
  const shownTab = sectionTabs.some((entry) => entry.id === tab) ? tab : sectionTabs[0]?.id;
  const allRows = RESEARCH_TABS.flatMap((entry) => researchRows(entry.id));
  const tierIndex = (entry) => SERVER_TIERS.findIndex((t) => t.id === serverTier(entry));
  const tabRowsSorted = shownTab === "servers" ? researchRows(shownTab).slice().sort((a, b) => tierIndex(a) - tierIndex(b)) : researchRows(shownTab);
  const rows = (query.trim() ? allRows : tabRowsSorted.filter((entry) => researchSection(entry, section))).filter((entry) => matchesSearch(query, revealedHaystack(techRevealed(state, entry), entry.name, entry.spec, entry.year)));

  const jobs = techJobs(state);
  const twoSlots = secondTechSlot(state);
  const speed = researchSpeed(state);
  const month = inGameMonth(state);
  const mark1 = researchItem("srv-mark1");
  const needsServer = !!mark1 && playerYear(state) >= mark1.year && !(state.techDone || []).includes("srv-mark1") && !jobs.some((j) => j.id === "srv-mark1");
  const tabRows = researchRows(shownTab).filter((entry) => researchSection(entry, section));
  const firstInTab = tabRows.find((entry) => !entry.soon);
  const tabEmpty = !query.trim() && tabRows.length > 0 && !tabRows.some((entry) => techRevealed(state, entry));

  return (
    <div data-tech-list className="space-y-3">
      <Panel>
        <div className="flex items-start justify-between gap-1">
          <p data-tech-intro className="break-words font-term text-base leading-5 text-[var(--game-fg)]">The whole timeline of real inventions. Projects keep going while the app is closed.</p>
          <ItemHelp kind="rd" state={state} name="R&D points" className="-mr-2 -mt-2.5" />
        </div>
        {jobs.map((job) => {
          const activeName = researchItem(job.id);
          if (!activeName) return null;
          return (
            <div key={job.id} data-research-active className="mt-2">
              <p className="break-words font-pixel text-[0.55rem] leading-4 text-[var(--game-accent)]">Researching {activeName.name}</p>
              <ProgressBar progress={techProgress(job, speed)} label={`${activeName.name} research`} dataAttr="tech-summary" />
            </div>
          );
        })}
        <p data-research-slots className="mt-1 break-words font-term text-base leading-5 text-[var(--game-muted)]">
          {twoSlots ? "Two projects at once." : "One project at a time."} Projects open in their real month: {monthName(month.month)} {month.year || "—"} now.
        </p>
        {needsServer && (
          <button type="button" data-first-server onClick={() => { setSection("room"); setTab("servers"); setFocus("srv-mark1"); setTimeout(() => document.querySelector('[data-research-item="srv-mark1"]')?.scrollIntoView({ block: "center" }), 50); }} className="mt-2 w-full border-2 border-[var(--game-accent)] p-2 text-left font-term text-base leading-5 text-[var(--game-accent)]">
            First research server: research the Irwell Mark 1 on SERVERS ({researchCost(researchItem("srv-mark1")).toLocaleString("en-US")} R&amp;D), then build it in HQ. It makes R&amp;D far faster than punch cards.
          </button>
        )}
        {playerYear(state) < TECH_OPENS && (
          <p data-tech-opens-year className="mt-2 break-words font-term text-base leading-5 text-[var(--game-accent)]">
            Projects open in their real year. The earliest ones open in {TECH_OPENS}.
          </p>
        )}
      </Panel>
      <SearchBox value={query} onChange={setQuery} placeholder="Search TECH" testId="tech" />
      <div data-tech-sections className="grid grid-cols-2 gap-2" role="tablist" aria-label="Home PC or server room">
        {TECH_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            role="tab"
            aria-selected={section === sec.id}
            data-tech-section={sec.id}
            onClick={() => setSection(sec.id)}
            className={`min-h-12 border-2 px-2 font-pixel text-[0.55rem] shadow-[3px_3px_0_0_#000] ${section === sec.id ? "border-[var(--game-accent)] bg-[var(--game-accent)] text-black" : "border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-muted)]"}`}
          >
            {sec.label}
          </button>
        ))}
      </div>
      <p data-tech-section-note className="font-term text-base leading-5 text-[var(--game-muted)]">{TECH_SECTIONS.find((sec) => sec.id === section)?.note}</p>
      <div className="flex flex-wrap gap-2 pb-1" role="tablist">
        {sectionTabs.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={shownTab === entry.id}
            data-research-tab={entry.id}
            onClick={() => setTab(entry.id)}
            className={`min-h-12 shrink-0 border-2 px-2 font-pixel text-[0.5rem] ${shownTab === entry.id ? "border-[var(--game-accent)] text-[var(--game-accent)]" : "border-[var(--game-border-strong)] text-[var(--game-muted)]"}`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {tabEmpty && firstInTab && (
          <p data-tab-opens className="font-term text-base leading-5 text-[var(--game-muted)]">Nothing to research here yet. The first project on this tab opens in {firstInTab.year}.</p>
        )}
        {rows.length === 0 && <p data-search-empty="tech" className="font-term text-lg text-[var(--game-muted)]">No matches.</p>}
        {rows.map((entry, i) => {
          const tier = !query.trim() && shownTab === "servers" ? serverTier(entry) : null;
          const prevTier = i > 0 && tier ? serverTier(rows[i - 1]) : null;
          const tierInfo = tier && tier !== prevTier ? SERVER_TIERS.find((t) => t.id === tier) : null;
          const header = tierInfo ? (
            <div key={`tier-${tier}`} data-server-tier={tier} className="pt-2">
              <p className="font-pixel text-[0.55rem] leading-4 text-[var(--game-accent)]">{tierInfo.label}</p>
              <p className="font-term text-base leading-5 text-[var(--game-muted)]">{tierInfo.note}</p>
            </div>
          ) : null;
          return [header, renderRow(entry)];
        })}
      </div>
    </div>
  );

  function renderRow(entry) {
          const revealed = techRevealed(state, entry);
          if (!revealed) {
            return (
              <Panel key={entry.id}>
                <div data-research-hidden aria-label="Unknown future project" className="flex items-start gap-2 opacity-60">
                  <div className="h-8 w-8 shrink-0 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-pixel text-[0.55rem] leading-4 text-[var(--game-muted)]">{entry.year} · ???</p>
                    <p data-research-hidden-need className="font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">{researchLock(state, entry) || `Requires ${entry.year}`}</p>
                  </div>
                </div>
              </Panel>
            );
          }
          const lock = researchLock(state, entry);
          const done = (state.techDone || []).includes(entry.id);
          const running = jobs.some((j) => j.id === entry.id);
          const opens = researchUnlocks(entry.id);
          const qBlock = !done && !running && state.techJob ? queueBlock(state, entry.id) : "x";
          const queued = (state.techQueue || []).includes(entry.id);
          return (
            <Panel key={entry.id}>
              <div data-research-item={entry.id} data-focus={focus === entry.id ? "1" : undefined} data-help-scope className={`flex items-start gap-2 ${focus === entry.id ? "outline outline-2 outline-offset-4 outline-[var(--game-accent)]" : ""}`}>
                <div className={lock ? "opacity-60" : ""}>
                  {opens[0]?.icon ? (
                    <div className="h-8 w-8 shrink-0 overflow-hidden border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]">
                      <img src={opens[0].icon} alt="" className="pixel-art h-full w-full scale-[1.4] object-contain" />
                    </div>
                  ) : (
                    <PixelMark id={entry.id} />
                  )}
                </div>
                <div className={`min-w-0 flex-1 ${lock ? "opacity-60" : ""}`}>
                  <p className="break-words font-pixel text-[0.55rem] leading-4 text-[var(--game-fg)] [overflow-wrap:anywhere]">{entry.year >= 1000 ? `${monthName(entry.month)} ${entry.year}` : entry.year} · {entry.name}</p>
                  <p data-research-where className="font-pixel text-[0.45rem] leading-4 text-[var(--game-violet,var(--game-muted))]">USED IN: {researchWhereLabel(entry).toUpperCase()}</p>
                  {!done && entry.prereq && researchItem(entry.prereq) && (
                    <p data-research-after className="break-words font-term text-base leading-5 text-[var(--game-muted)]">After: {researchItem(entry.prereq).name}{(state.techDone || []).includes(entry.prereq) ? " (done)" : ""}</p>
                  )}
                  <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">{entry.spec}</p>
                  {opens.length > 0 && (
                    <p data-research-opens className="break-words font-term text-base leading-5 text-[var(--game-accent)]">Opens in HQ: {opens.map((p) => p.name).join(", ")}</p>
                  )}
                  {entry.soon ? (
                    <p className="mt-1 font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">COMING SOON</p>
                  ) : done ? (
                    <p className="mt-1 font-pixel text-[0.5rem] leading-4 text-[var(--game-success)]">DONE</p>
                  ) : running ? (
                    <div data-research-running>
                      <p className="mt-1 font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">IN PROGRESS</p>
                      <ProgressBar progress={techProgress(jobs.find((j) => j.id === entry.id), speed)} label={`${entry.name} research`} dataAttr="tech" />
                    </div>
                  ) : lock && queued ? (
                    <p data-research-queued className="mt-1 font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">IN THE QUEUE · {lock}</p>
                  ) : lock && qBlock === null ? (
                    <div className="mt-2">
                      <p data-research-lock className="font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">{lock}: it can wait behind it in the queue.</p>
                      <GoldButton dataAttr={`queue-${entry.id}`} onClick={() => queueTech(entry.id)}>
                        <span className="font-pixel text-[0.55rem]">ADD TO QUEUE</span>
                      </GoldButton>
                    </div>
                  ) : lock ? (
                    <p data-research-lock className="mt-1 font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">{lock}</p>
                  ) : (
                    <div className="mt-2">
                      <p className="font-term text-base leading-5 text-[var(--game-muted)]">
                        {researchCost(entry).toLocaleString("en-US")} R&amp;D
                        {researchMaterials(entry) && (
                          <span data-research-materials className={hasResearchMaterials(state, entry) ? "" : "text-[var(--game-danger)]"}>
                            {" + "}
                            {Object.entries(researchMaterials(entry))
                              .map(([key, n]) => `${n} ${REFINED[key]?.short || key} (have ${Math.floor(state.supply?.[key] || 0)})`)
                              .join(", ")}
                          </span>
                        )}
                        {" · "}
                        {formatDuration(entry.durationMs / researchSpeed(state))}
                      </p>
                      {queued ? (
                        <p data-research-queued className="font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">IN THE QUEUE</p>
                      ) : state.techJob && qBlock === null ? (
                        <GoldButton dataAttr={`queue-${entry.id}`} onClick={() => queueTech(entry.id)}>
                          <span className="font-pixel text-[0.55rem]">ADD TO QUEUE</span>
                        </GoldButton>
                      ) : (
                        <GoldButton dataAttr={`research-${entry.id}`} disabled={!canStartResearch(state, entry.id)} onClick={() => startTech(entry.id)}>
                          <span className="font-pixel text-[0.55rem]">{state.techJob ? (qBlock === "No queue slot yet" ? "ONE AT A TIME" : qBlock === "Queue full" ? "QUEUE FULL" : "START") : "START"}</span>
                        </GoldButton>
                      )}
                    </div>
                  )}
                </div>
                <ItemHelp kind="research" id={entry.id} state={state} name={entry.name} className="-mr-2 -mt-2.5" />
              </div>
            </Panel>
          );
  }
}
