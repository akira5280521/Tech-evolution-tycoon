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
import AccountPanel from "./AccountPanel";
import { HelpTip } from "./HintSheet";
import { GLOSSARY, GLOSSARY_ORDER } from "@/lib/glossary";

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
  const { state, reset, purchaseShop, chooseSpecialty, setOrientation, touchBriefing, exportSave, importSave, tutorialReplay, setTipsOff } = useGameState();
  const navigate = useNavigate();
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
          <AccountPanel state={state} onExport={exportSave} onImport={importSave} />
          <SaveBackup state={state} onExport={exportSave} onImport={importSave} />
          <button type="button" onClick={reset} className="min-h-11 border-2 border-[var(--game-danger)] px-3 font-pixel text-[0.55rem] text-[var(--game-danger)]">
            RESET SAVE
          </button>
          <AppVersionFooter />
        </div>
      )}
      {tab === "howto" && (
        <>
          <DailyBriefing state={state} onRoll={touchBriefing} />
          <NextMove state={state} />
          <Panel>
            <h2 className="font-pixel text-[0.6rem]">TUTORIAL</h2>
            <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">Walk through the basics again on the Game screen.</p>
            <div className="mt-3">
              <GoldButton
                dataAttr="tutorial-replay"
                onClick={() => {
                  tutorialReplay();
                  navigate({ to: "/" });
                }}
              >
                <span className="font-pixel text-[0.6rem]">REPLAY TUTORIAL</span>
              </GoldButton>
            </div>
          </Panel>
          <HowTo tipsOff={!!state.tutorial?.tipsOff} onTips={setTipsOff} />
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

const HOW_TO = [
  {
    id: "basics",
    title: "THE BASICS",
    lines: [
      "Tap a machine's picture to start it. The bar fills up, then it pays you.",
      "Spend the money on more machines. Every one you own adds to each payout, and the price goes up a little each time.",
      "Owning a machine opens the next one in history. Each new era pays much more than the last.",
    ],
  },
  {
    id: "materials",
    title: "MATERIALS",
    lines: [
      "Some machines use what an earlier one makes: wood for paper, paper for the Jacquard loom and punch cards, sand for glass, glass, copper and filament for vacuum tubes, germanium for the first transistors, and silicon wafers for chips.",
      "The strip at the top shows what you have. If a material runs out, the machine that needs it pays much less until more is made, so keep the earlier rows growing too.",
    ],
  },
  {
    id: "managers",
    title: "MANAGERS AND THE FOREMAN",
    lines: [
      "Once you own enough of a machine (the Hire button shows how many), hire its manager. A manager keeps that machine running by itself, even while the app is closed, for up to 24 hours.",
      "The Foreman is a one-time hire that adds a RUN ALL button, which starts every machine that doesn't have a manager yet.",
    ],
  },
  {
    id: "buying",
    title: "BUYING FASTER",
    lines: [
      "The buttons at the top pick how many you buy per tap: X1, X10, X100, NEXT (just enough to reach the next goal) or MAX (as many as you can afford).",
      "Owning 25, 50 and 100 of one machine makes it run twice as fast each time. Bigger counts after that make it pay more.",
    ],
  },
  {
    id: "upgrades",
    title: "UPGRADES",
    lines: [
      "On the BOOST tab each machine has two upgrades: one makes it pay 3 times as much (and on a material row, make 3 times the material), one makes it twice as fast. They take 12 seconds to install.",
      "Own enough of a machine and buy both of its upgrades to master that era: +5% to all income for the rest of the run.",
    ],
  },
  {
    id: "prestige",
    title: "PRESTIGE (STARTING OVER)",
    lines: [
      "Once you've earned $1T in one run, the PRESTIGE button lets you start over and trade in the whole run for investors. You lose your cash, machines, managers and upgrades.",
      "Every investor makes all income higher, forever, so the next run goes much faster. The more you earn before you prestige, the more investors join. It's how you get really big numbers.",
    ],
  },
  {
    id: "keep",
    title: "WHAT YOU KEEP FOREVER",
    lines: [
      "Investors, research data and your research picks, era tokens, badges, Museum cards, and the rewards from challenges and mega-projects all stay when you prestige.",
      "Research: every era you own makes a little research data. Spend it in MORE > RESEARCH on a bonus you keep.",
      "Era tokens come from new eras, milestones, projects and the free Daily Crate. Spend them in the shop on the BOARD tab.",
    ],
  },
  {
    id: "extras",
    title: "CHALLENGES AND PROJECTS",
    lines: [
      "The RUNS tab has optional challenges: one run with special rules, like no managers. Win one for +10% income forever.",
      "Mega-projects finish on their own once you reach their goal, and each gives a bonus you keep plus tokens.",
    ],
  },
  {
    id: "fork",
    title: "THE BIGGER RESET (FORK)",
    lines: [
      "Much later, with thousands of investors, you can fork the timeline on the BOARD tab. It spends investors to start over like a prestige, with a multiplier you keep forever (up to x4), a higher income limit, and another research slot.",
    ],
  },
  {
    id: "away",
    title: "WHILE YOU'RE AWAY",
    lines: ["Close the app and machines with a manager keep earning for up to 24 hours. You'll see what they made when you come back."],
  },
];

function HowTo({ tipsOff, onTips }) {
  return (
    <>
      {HOW_TO.map((section, i) => (
        <details key={section.id} data-howto={section.id} open={i === 0} className="howto-section border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] shadow-[4px_4px_0_0_#000]">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 px-3 py-2 font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">
            {section.title}
            <span aria-hidden="true" className="howto-caret shrink-0 text-[var(--game-muted)]">+</span>
          </summary>
          <ul className="space-y-2 px-3 pb-3">
            {section.lines.map((line) => (
              <li key={line} className="font-term text-lg leading-6">{line}</li>
            ))}
          </ul>
        </details>
      ))}
      <details data-howto="words" className="howto-section border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] shadow-[4px_4px_0_0_#000]">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 px-3 py-2 font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">
          WORDS TO KNOW
          <span aria-hidden="true" className="howto-caret shrink-0 text-[var(--game-muted)]">+</span>
        </summary>
        <dl className="space-y-3 px-3 pb-3">
          {GLOSSARY_ORDER.map((id) => (
            <div key={id}>
              <dt className="font-pixel text-[0.55rem] leading-5 text-[var(--game-fg)]">{GLOSSARY[id].term}</dt>
              <dd className="font-term text-lg leading-6 text-[var(--game-muted)]">{GLOSSARY[id].text}</dd>
            </div>
          ))}
        </dl>
      </details>
      <Panel>
        <h2 className="font-pixel text-[0.6rem]">TIPS</h2>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          {tipsOff ? "Tips are off. Turn them on to see a short note the first time each new thing appears." : "A short note explains each new thing the first time it appears. Tap a ? anywhere for a quick explanation."}
        </p>
        <div className="mt-3">
          <GoldButton dataAttr="tips-toggle" onClick={() => onTips(!tipsOff)}>
            <span className="font-pixel text-[0.6rem]">{tipsOff ? "TURN TIPS ON" : "TURN TIPS OFF"}</span>
          </GoldButton>
        </div>
      </Panel>
    </>
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
        <p className="flex items-center gap-2 font-pixel text-[0.55rem] text-[var(--game-muted)]">
          RESEARCH DATA <HelpTip term="research" />
        </p>
        <p className="font-term text-5xl leading-none text-[var(--game-success)]">{(state.data || 0).toFixed(1)}</p>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          +{rate.toFixed(2)} a second from the {establishedCount(state)} {establishedCount(state) === 1 ? "era" : "eras"} you own and {masteredCount(state)} mastered. Data is never lost, even when you prestige.
        </p>
      </Panel>
      <Panel>
        <h2 className="flex items-center gap-2 font-pixel text-[0.7rem]">
          <FlaskConical className="h-4 w-4 text-[var(--game-accent)]" aria-hidden="true" />
          COMPANY SPECIALTY <HelpTip term="specialty" />
        </h2>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          Pick a bonus to keep forever. You have {slots} {slots === 1 ? "slot" : "slots"} and have used {picked.length}. Forking the timeline opens another.
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
                <p className="mt-2 font-pixel text-[0.55rem] text-[var(--game-success)]">YOURS</p>
              ) : job ? (
                <div className="mt-2">
                  <p className="font-pixel text-[0.55rem] text-[var(--game-accent)]">RESEARCHING</p>
                  <div className="mt-2 h-5 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]">
                    <div className="h-full bg-[var(--game-accent)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <GoldButton disabled={!open} onClick={() => onCommit(spec.id)} dataAttr={spec.id}>
                    <span className="font-pixel text-[0.6rem]">PICK {spec.name}</span>
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
