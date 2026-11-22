import { useLocation, useNavigate } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { BUSINESSES, RESEARCH_MS, count, investorsFor, money } from "@/lib/gameConfig";
import { SPECIALTIES, canCommit, dataPerSecond, establishedCount, masteredCount, specialtySlots } from "@/lib/empire";
import { getSaveData } from "@/lib/gameSave";
import { eraNameAt, eraReachedIndex, formatDuration } from "@/lib/records";
import { useGameState } from "./GameState";
import AnalyticsPanel from "./AnalyticsPanel";
import BadgesPage from "./BadgesPage";
import AppVersionFooter from "./AppVersion";
import DailyBriefing from "./DailyBriefing";
import NextMove from "./NextMove";
import ScreenShell, { GoldButton, Panel } from "./chrome";
import { CheckForUpdatesButton } from "./UpdateNotice";
import SaveBackup from "./SaveBackup";
import CopyStats from "./CopyStats";
import LabProjects from "./LabProjects";
import AccountPanel from "./AccountPanel";
import { HelpTip, ItemHelp } from "./HintSheet";
import { GLOSSARY, GLOSSARY_ORDER } from "@/lib/glossary";
import { AchievementsButton, AwayReminder, DisplaySettings, FeedbackButton, PlayToggles, ResetProgress, WhatsNewButton } from "./SettingsControls";

const TABS = [
  { id: "settings", label: "SETTINGS", title: "SETTINGS" },
  { id: "howto", label: "HOW TO PLAY", title: "HOW TO PLAY" },
  { id: "stats", label: "STATS", title: "STATS" },
  { id: "badges", label: "BADGES", title: "BADGES" },
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
  const { state, reset, setOrientation, touchBriefing, exportSave, importSave, tutorialReplay, setTipsOff } = useGameState();
  const navigate = useNavigate();
  const data = getSaveData();

  if (tab === "badges") return <BadgesPage top={<MoreLinks active="badges" />} />;

  return (
    <ScreenShell title={TABS.find((entry) => entry.id === tab)?.title || "SETTINGS"} subtitle="">
      <MoreLinks active={tab} />
      {tab === "settings" && (
        <div className="flex min-h-[60vh] flex-col gap-3">
          <PlayToggles />
          <DisplaySettings />
          <OrientationSetting value={state.orientation || "auto"} onChange={setOrientation} />
          <AwayReminder />
          <CheckForUpdatesButton />
          <WhatsNewButton />
          <AccountPanel state={state} onExport={exportSave} onImport={importSave} />
          <AchievementsButton />
          <SaveBackup state={state} onExport={exportSave} onImport={importSave} />
          <FeedbackButton state={state} />
          <ResetProgress onReset={reset} />
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
      {tab === "stats" && <Stats state={state} data={data} />}
    </ScreenShell>
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
      <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">Auto follows your phone, including its auto-rotate switch. Portrait and landscape keep the game that way.</p>
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
    id: "goal",
    title: "THE GOAL",
    lines: [
      "You run a company of businesses, from a timber camp onward. ERA at the top shows how many you've opened.",
      "Make cash, spend it to grow, and open the next business. Much later you can prestige and start over stronger.",
    ],
  },
  {
    id: "basics",
    title: "THE BASICS",
    lines: [
      "Tap a business's picture to run it. The bar fills, then it pays you cash.",
      "Tap BUY to get another one. BUY spends cash, the big CASH number. What you earned this run is not cash.",
      "The buy-amount button sets how many one BUY tap gets. Tap it to cycle X1, X10, X25, X50, X75, X100, then MAX.",
      "Own 10 of a business to open the next one.",
    ],
  },
  {
    id: "materials",
    title: "MATERIALS",
    lines: [
      "Some businesses use what an earlier one makes. Timber Camp makes wood, and the Paper Mill uses that wood.",
      "The strip at the top shows what you have. If a material runs out, the business that needs it stops paying.",
    ],
  },
  {
    id: "managers",
    title: "MANAGERS AND THE FOREMAN",
    lines: [
      "Tap Hire when you own enough of that business and have the cash. The button shows the count and the price. Some businesses need 5, others need 10.",
      "A manager runs that business for you, even while you're away, at half speed for up to 24 hours.",
      "The Foreman is a one-time hire. He adds RUN ALL, which starts every business that has no manager yet.",
    ],
  },
  {
    id: "buying",
    title: "BUYING FASTER",
    lines: [
      "X1 buys one business per tap. X10, X25, X50, X75 and X100 buy that many. MAX buys as many as your cash allows.",
      "Milestones come at 25, 50, 75, 100, 150 and 200 of one business. At 25, 50 and 100 it runs twice as fast; at 75 and 150 it pays twice as much, and at 200 three times as much.",
    ],
  },
  {
    id: "upgrades",
    title: "UPGRADES",
    lines: [
      "On the BOOST tab each business has two upgrades: one makes it pay 3 times as much (and on a material row, make 3 times the material), one makes it twice as fast. They take 12 seconds to install.",
      "Own enough of a business and buy both of its upgrades to master that era: +5% to all income for the rest of the run.",
    ],
  },
  {
    id: "prestige",
    title: "PRESTIGE (STARTING OVER)",
    lines: [
      "Once you've earned $100B in one run, the PRESTIGE button lets you start over and trade in the whole run for investors. You lose your cash, businesses, managers, upgrades and facility parts.",
      "Every investor makes all income higher, forever, so the next run goes much faster. The more you earn before you prestige, the more investors join. It's how you get really big numbers.",
    ],
  },
  {
    id: "keep",
    title: "WHAT YOU KEEP FOREVER",
    lines: [
      "Investors, R&D points and your research picks, era tokens, badges, Museum cards, and the rewards from challenges and mega-projects all stay when you prestige.",
      "Era tokens come from new eras, milestones, projects and the free Daily Crate. Spend them in the shop on the BOARD tab.",
    ],
  },
  {
    id: "rd",
    title: "R&D POINTS",
    lines: [
      "R&D points are the one research currency. Each era you own makes a trickle; research servers (under the RIGS button beside TECH, from Mainframes) make most of them. Both earn at half rate while the game is closed, and the servers only bank what their disks hold: 1 hour of output, plus another hour per TB of disk.",
      "Spend them on the RESEARCH tab (specialties and lab projects) and on the TECH timeline. They are never lost, even when you prestige.",
    ],
  },
  {
    id: "tech",
    title: "THE TECH TIMELINE",
    lines: [
      "TECH (beside the buy button) lists real chips, memory, storage, cooling, power and networking in the order they came out. One project runs at a time and keeps going while the app is closed.",
      "\"Requires 1985\" means your company hasn't reached that year yet. \"Research X first\" means finish the project before it. Processor and graphics projects unlock each chip generation's extra pay. Finished research is kept when you prestige.",
    ],
  },
  {
    id: "facilities",
    title: "FACILITIES (RIGS)",
    lines: [
      "Research servers open with Mainframes and make R&D points. Newer machines and parts open in their real year once you research them on TECH. With AI Accelerators, the Bitbark mine and the AI training cluster add a small extra income.",
      "Buy parts for each plant. A plant runs slower when its power or cooling can't keep up with its cards or racks, and it tells you what to add next. Parts are lost when you prestige.",
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
    lines: ["Close the app or switch away and businesses with a manager keep earning at half speed, for up to 24 hours. Keep the game open to earn twice as much. You'll see what they made when you come back."],
  },
];

function HowTo({ tipsOff, onTips }) {
  return (
    <>
      {HOW_TO.map((section, i) => (
        <details key={section.id} data-howto={section.id} open={i < 2} className="howto-section border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] shadow-[4px_4px_0_0_#000]">
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

function Stats({ state, data }) {
  const era = Math.max(0, eraReachedIndex(state));
  const runs = Array.isArray(state.runs) ? state.runs : [];
  const bestEarn = runs.reduce((best, run) => (!best || run.earnings > best.earnings ? run : best), null);
  const bestTime = runs.reduce((best, run) => (!best || run.lengthMs > best.lengthMs ? run : best), null);
  const bestBackers = runs.reduce((best, run) => (!best || run.investorsGained > best.investorsGained ? run : best), null);
  const pending = investorsFor(state.lifetime || 0);
  const challengeName = state.challenge ? (state.challenge.id === "glass" ? "GLASS CEILING" : state.challenge.id === "noboss" ? "NO BOSSES" : "SPEEDRUN") : null;
  return (
    <>
      <AnalyticsPanel data={data} />
      <CopyStats state={state} />
      <Panel>
        <h2 className="font-pixel text-[0.6rem]">LIFETIME</h2>
        <ul className="mt-2 space-y-1 font-term text-lg leading-6">
          <li>Total earned: {money(state.careerEarnings || 0)}</li>
          <li>Businesses bought: {count(state.businessesBought || 0)}</li>
          <li>Managers hired: {count(state.managersHired || 0)}</li>
          <li>Prestiges: {count(state.prestigeCount || 0)}</li>
          <li>Investors: {count(state.investors || 0)} (most ever {count(state.investorPeak || state.investors || 0)})</li>
          <li>Play time: {formatDuration(state.playMs || 0)}</li>
          <li>Best era reached: {eraNameAt(era)}</li>
        </ul>
      </Panel>
      <Panel>
        <h2 className="font-pixel text-[0.6rem]">BEST RUNS</h2>
        {runs.length === 0 ? (
          <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">Finished runs show up here after a prestige, a fork, or a challenge. The run you're on is below.</p>
        ) : (
          <ul className="mt-2 space-y-1 font-term text-lg leading-6">
            {bestEarn ? <li>Richest: {money(bestEarn.earnings)} · {bestEarn.eraName}</li> : null}
            {bestTime ? <li>Longest: {formatDuration(bestTime.lengthMs)} · {bestTime.eraName}</li> : null}
            {bestBackers ? <li>Most investors: {count(bestBackers.investorsGained)} · {money(bestBackers.earnings)}</li> : null}
          </ul>
        )}
      </Panel>
      <Panel>
        <h2 className="font-pixel text-[0.6rem]">RUNS</h2>
        <p className="mt-2 font-term text-lg leading-6">
          This run: {money(state.lifetime || 0)} earned · {formatDuration(Date.now() - (state.runStartedAt || Date.now()))} · {eraNameAt(era)}
          {pending > 0 ? ` · ${count(pending)} investors waiting` : ""}
          {challengeName ? ` · ${challengeName}` : ""}
        </p>
        <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">Runs from before this update aren't listed. Length of the current run starts when tracking began.</p>
        <ul className="mt-2 space-y-2">
          {[...runs].reverse().map((run) => (
            <li key={`${run.at}-${run.eraId}`} className="font-term text-lg leading-6">
              {money(run.earnings)} · {formatDuration(run.lengthMs)} · {run.eraName} · {count(run.investorsGained)} investors
              {run.challenge ? ` · ${run.challenge}` : ""}
            </li>
          ))}
        </ul>
      </Panel>
      <Panel>
        <h2 className="font-pixel text-[0.6rem]">BY BUSINESS</h2>
        {BUSINESSES.map((cfg, index) => {
          const st = state.biz[index];
          const minutes = Math.floor((st?.activeMs || 0) / 60000);
          return (
            <p key={cfg.id} className="font-term text-lg leading-6">
              {cfg.name}: {count(st?.owned || 0)} owned · {st?.manager ? "manager" : "manual"} · {minutes}m active
            </p>
          );
        })}
      </Panel>
    </>
  );
}

// The Research Lab, on its own tab in the main navigation.
export function ResearchPage() {
  const { state, chooseSpecialty, runLabProject } = useGameState();
  return (
    <ScreenShell title={"RESEARCH\nLAB"} subtitle="">
      <ResearchBody state={state} onCommit={chooseSpecialty} onLab={runLabProject} />
    </ScreenShell>
  );
}

export function ResearchBody({ state, onCommit, onLab }) {
  const rate = dataPerSecond(state);
  const slots = specialtySlots(state);
  const picked = state.specialties || [];
  return (
    <>
      <Panel>
        <p className="flex items-center gap-2 font-pixel text-[0.55rem] text-[var(--game-muted)]">
          R&amp;D POINTS <ItemHelp kind="rd" state={state} name="R&D points" />
        </p>
        <p className="font-term text-5xl leading-none text-[var(--game-success)]">{(state.data || 0).toFixed(1)}</p>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          +{rate.toFixed(2)} a second from the {establishedCount(state)} {establishedCount(state) === 1 ? "era" : "eras"} you own and {masteredCount(state)} mastered. R&D points are never lost, even when you prestige.
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
            <div key={spec.id} data-help-scope className="mt-3 border-2 border-[var(--game-border)] p-3">
              <div className="flex items-start gap-2">
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-pixel text-[0.65rem]">{spec.name}</h3>
                  <span className="font-term text-lg text-[var(--game-muted)]">{spec.cost} R&amp;D</span>
                </div>
                <ItemHelp kind="specialty" id={spec.id} state={state} name={spec.name} className="-mr-2 -mt-2.5" />
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
      {onLab && <LabProjects state={state} onRun={onLab} />}
    </>
  );
}
