import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { BUSINESSES, RESEARCH_MS } from "@/lib/gameConfig";
import { SPECIALTIES, canCommit, dataPerSecond, establishedCount, masteredCount, specialtySlots } from "@/lib/empire";
import { getSaveData } from "@/lib/gameSave";
import { readPrefs, writePrefs } from "@/lib/gamePrefs";
import { setSoundEnabled } from "@/lib/sfx";
import { useGameState } from "./GameState";
import AnalyticsPanel from "./AnalyticsPanel";
import AppVersionFooter from "./AppVersion";
import DailyBriefing from "./DailyBriefing";
import NextMove from "./NextMove";
import TokenShop from "./TokenShop";
import ScreenShell, { GoldButton, Panel } from "./chrome";
import { CheckForUpdatesButton } from "./UpdateNotice";
import SaveBackup from "./SaveBackup";

const TABS = [
  { id: "howto", label: "HOW TO PLAY" },
  { id: "settings", label: "SETTINGS" },
  { id: "stats", label: "STATS" },
  { id: "research", label: "RESEARCH" },
  { id: "market", label: "MARKET" },
];

export function MoreLinks({ active }) {
  const navigate = useNavigate();
  return (
    <div data-more-tabs className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => navigate({ to: "/more", hash: tab.id })}
          className={`min-h-11 border-2 px-2 py-2 text-center font-pixel text-[0.5rem] leading-4 shadow-[3px_3px_0_0_#000] ${
            active === tab.id
              ? "border-[var(--game-accent)] text-[var(--game-accent)]"
              : "border-[var(--game-border-strong)] text-[var(--game-muted)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function MorePage() {
  const location = useLocation();
  const hash = (location.hash || "#settings").replace("#", "");
  const tab = TABS.some((entry) => entry.id === hash) ? hash : "settings";
  const { state, reset, purchaseShop, chooseSpecialty, setOrientation, touchBriefing, exportSave, importSave } = useGameState();
  const data = getSaveData();

  if (tab === "research") {
    return (
      <ScreenShell title={"RESEARCH\nLAB"} subtitle="">
        <ResearchBody state={state} onCommit={chooseSpecialty} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title={"GAME\nSETTINGS"} subtitle="">
      <MoreLinks active={tab} />
      {tab === "settings" && (
        <div className="flex min-h-[60vh] flex-col gap-3">
          <PlayToggles />
          <OrientationSetting value={state.orientation || "auto"} onChange={setOrientation} />
          <AnalyticsPanel data={data} />
          <CheckForUpdatesButton />
          <SaveBackup state={state} onExport={exportSave} onImport={importSave} />
          <button type="button" onClick={reset} className="min-h-11 border-2 border-[var(--game-danger)] px-3 font-pixel text-[0.55rem] text-[var(--game-danger)]">
            RESET SAVE
          </button>
          <Panel>
            <h2 className="font-pixel text-[0.6rem]">ACCOUNT</h2>
            <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">Coming soon</p>
          </Panel>
          <AppVersionFooter />
        </div>
      )}
      {tab === "howto" && (
        <>
          <DailyBriefing state={state} onRoll={touchBriefing} />
          <NextMove state={state} />
          <HowTo />
        </>
      )}
      {tab === "stats" && <Stats state={state} />}
      {tab === "market" && (
        <Panel className="border-[var(--game-accent)]">
          <h2 className="font-pixel text-[0.7rem] text-[var(--game-accent)]">MARKET</h2>
          <div className="mt-3">
            <TokenShop state={state} onBuy={purchaseShop} />
          </div>
        </Panel>
      )}
    </ScreenShell>
  );
}

function PlayToggles() {
  const [prefs, setPrefs] = useState({ sound: true, compact: false });
  useEffect(() => setPrefs(readPrefs()), []);
  const set = (partial) => {
    const next = writePrefs(partial);
    if ("sound" in partial) setSoundEnabled(next.sound);
    setPrefs(next);
  };
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">PLAY</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button type="button" data-compact onClick={() => set({ compact: !prefs.compact })} className="min-h-11 border-2 border-[var(--game-border-strong)] px-2 font-pixel text-[0.55rem]">
          COMPACT ROWS: {prefs.compact ? "ON" : "OFF"}
        </button>
        <button type="button" data-sound onClick={() => set({ sound: !prefs.sound })} className="min-h-11 border-2 border-[var(--game-border-strong)] px-2 font-pixel text-[0.55rem]">
          SOUND: {prefs.sound ? "ON" : "OFF"}
        </button>
      </div>
    </Panel>
  );
}

function OrientationSetting({ value, onChange }) {
  const modes = [
    ["auto", "AUTO"],
    ["portrait", "PORTRAIT"],
    ["landscape", "LANDSCAPE"],
  ];
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">ORIENTATION</h2>
      <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">Auto follows the device. Portrait and landscape hold the screen still.</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {modes.map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-orientation={id}
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            className={`min-h-11 border-2 px-1 font-pixel text-[0.5rem] ${value === id ? "border-[var(--game-accent)] text-[var(--game-accent)]" : "border-[var(--game-border-strong)] text-[var(--game-muted)]"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </Panel>
  );
}

function HowTo() {
  const lines = [
    "Tap a machine to run one batch. The bar fills over the cycle, then it pays. Once you own enough of a machine (the Hire button shows how many), hire its manager and it keeps running.",
    "Material rows feed the eras that use them: paper for punch cards, glass, copper and filament for tubes, germanium for the first transistors, and silicon wafers for chips. A dry line still pays a little so the bar never freezes.",
    "The Foreman unlocks Run All. Until then, each machine starts on its own.",
    "Buy x1, x10, x100, NEXT, or MAX. NEXT buys exactly enough to reach the next milestone or gate, then the next 25. At 25, 50 and 100 owned the cycle runs twice as fast. Later milestones multiply profit.",
    "Prestige on the game tab recruits investors. The first one needs $1T lifetime earnings.",
    "Cash upgrades reset when you prestige, fork, or start a challenge, and are bought again each run. Research, investors and singularity stay. Mastery returns once you own enough and buy both upgrades again.",
    "Era tokens pay for the shop on the Board tab. Only the daily crate is free from the start.",
    "Fork the timeline once you can pay the investor bill. Each fork costs more. Singularity maxes at x4, and the income ceiling rises with it instead of cutting off flat.",
    "Close the tab and hired crews earn for up to 24 hours. Sound goes quiet while the app is hidden.",
  ];
  return (
    <Panel>
      <ul className="space-y-2">
        {lines.map((line) => (
          <li key={line} className="font-term text-lg leading-6">{line}</li>
        ))}
      </ul>
    </Panel>
  );
}

function Stats({ state }) {
  return (
    <Panel>
      {BUSINESSES.map((cfg, index) => {
        const st = state.biz[index];
        const minutes = Math.floor((st?.activeMs || 0) / 60000);
        return (
          <p key={cfg.id} className="font-term text-lg leading-6">
            {cfg.name}: {st?.owned || 0} owned · {st?.manager ? "manager" : "manual"} · {minutes}m active
          </p>
        );
      })}
    </Panel>
  );
}

export function ResearchBody({ state, onCommit }) {
  const rate = dataPerSecond(state);
  const slots = specialtySlots(state);
  const picked = state.specialties || [];
  return (
    <>
      <Panel>
        <p className="font-pixel text-[0.55rem] text-[var(--game-muted)]">DATA BANK</p>
        <p className="font-term text-5xl leading-none text-[var(--game-success)]">{(state.data || 0).toFixed(1)}</p>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          +{rate.toFixed(2)}/s from {establishedCount(state)} established {establishedCount(state) === 1 ? "era" : "eras"} and {masteredCount(state)} mastered. Research is permanent - no reset ever takes it.
        </p>
      </Panel>
      <Panel>
        <h2 className="flex items-center gap-2 font-pixel text-[0.7rem]">
          <FlaskConical className="h-4 w-4 text-[var(--game-accent)]" aria-hidden="true" />
          COMPANY SPECIALTY
        </h2>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          Pick one branch for good. The other two are lost until the timeline is forked. Slots open: {slots}. Committed: {picked.length}.
        </p>
        {SPECIALTIES.map((spec) => {
          const owned = picked.includes(spec.id);
          const job = state.researchJob && state.researchJob.id === spec.id ? state.researchJob : null;
          const open = canCommit(state, spec.id);
          const elapsed = job ? Date.now() - job.startedAt : 0;
          const pct = job ? Math.max(0, Math.min(100, (elapsed / RESEARCH_MS) * 100)) : 0;
          return (
            <div key={spec.id} className="mt-3 border-2 border-[var(--game-border)] p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-pixel text-[0.65rem]">{spec.name}</h3>
                <span className="font-term text-lg text-[var(--game-muted)]">{spec.cost} DATA</span>
              </div>
              <p className="mt-2 font-term text-lg leading-6">{spec.blurb}</p>
              {owned ? (
                <p className="mt-2 font-pixel text-[0.55rem] text-[var(--game-success)]">COMMITTED</p>
              ) : job ? (
                <div className="mt-2">
                  <p className="font-pixel text-[0.55rem] text-[var(--game-accent)]">CALIBRATING</p>
                  <div className="mt-2 h-5 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]">
                    <div className="h-full bg-[var(--game-accent)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <GoldButton disabled={!open} onClick={() => onCommit(spec.id)} dataAttr={spec.id}>
                    <span className="font-pixel text-[0.6rem]">COMMIT TO {spec.name}</span>
                  </GoldButton>
                </div>
              )}
            </div>
          );
        })}
      </Panel>
    </>
  );
}
