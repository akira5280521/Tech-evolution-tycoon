import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { BUSINESSES, RESEARCH_MS, count, investorsFor, money } from "@/lib/gameConfig";
import { SPECIALTIES, canCommit, specialtySlots } from "@/lib/empire";
import { serverOutput } from "@/lib/research";
import { getSaveData } from "@/lib/gameSave";
import { eraNameAt, eraReachedIndex, formatDuration, longestRun, runLengthMs } from "@/lib/records";
import { useGameState } from "./GameState";
import AnalyticsPanel from "./AnalyticsPanel";
import AppVersionFooter from "./AppVersion";
import DailyBriefing from "./DailyBriefing";
import NextMove from "./NextMove";
import ScreenShell, { GoldButton, Panel, ProgressBar, SubTabs } from "./chrome";
import { timedProgress } from "@/lib/progress";
import { CheckForUpdatesButton } from "./UpdateNotice";
import SaveBackup from "./SaveBackup";
import CopyStats from "./CopyStats";
import { CompanyNameSetting } from "./CompanyName";
import { companyName } from "@/lib/company";
import LabProjects from "./LabProjects";
import AccountPanel from "./AccountPanel";
import { HelpTip, ItemHelp } from "./HintSheet";
import { GLOSSARY, GLOSSARY_ORDER } from "@/lib/glossary";
import { AchievementsButton, AwayReminder, DisplaySettings, FeedbackButton, PlayToggles, ResetProgress, WhatsNewButton } from "./SettingsControls";
import { HUB_LABEL } from "@/lib/hub";
import { HOWTO_GUIDES, guideLocked } from "@/lib/howto";
import { labSummary, specialtySummary } from "@/lib/rdSummary";

// MORE is settings and help (T3 item 16). Stats, badges, runs and the
// museum are in PROGRESS.
const TABS = [
  { id: "settings", label: "SETTINGS", title: "SETTINGS" },
  { id: "howto", label: "HOW TO PLAY", title: "HOW TO PLAY" },
];

const tabBtn = (active, id) =>
  `min-h-12 border-2 px-2 py-2 text-center font-pixel text-[0.5rem] leading-4 shadow-[3px_3px_0_0_#000] ${
    active === id
      ? "border-[var(--game-accent)] text-[var(--game-accent)]"
      : "border-[var(--game-border-strong)] text-[var(--game-muted)]"
  }`;

export function MoreLinks({ active }) {
  const navigate = useNavigate();
  const go = (id) => navigate({ to: "/more", hash: id });
  return (
    <div data-more-tabs>
      <SubTabs tabs={TABS.map((t) => ({ id: t.id, label: t.label }))} active={active} onPick={go} name="more" />
    </div>
  );
}

export default function MorePage() {
  const location = useLocation();
  const hash = (location.hash || "#settings").replace("#", "");
  const tab = TABS.some((entry) => entry.id === hash) ? hash : "settings";
  const { state, reset, setOrientation, touchBriefing, exportSave, importSave, tutorialReplay, setTipsOff, nameCompany } = useGameState();
  const navigate = useNavigate();
  const data = getSaveData();


  return (
    <ScreenShell title={TABS.find((entry) => entry.id === tab)?.title || "SETTINGS"} subtitle="">
      <MoreLinks active={tab} />
      {tab === "settings" && (
        <div className="flex min-h-[60vh] flex-col gap-3">
          <Panel>
            <CompanyNameSetting state={state} onName={nameCompany} />
          </Panel>
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
          <HowTo state={state} tipsOff={!!state.tutorial?.tipsOff} onTips={setTipsOff} />
        </>
      )}
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
            className={`min-h-12 border-2 px-1 font-pixel text-[0.5rem] ${value === id ? "border-[var(--game-accent)] text-[var(--game-accent)]" : "border-[var(--game-border-strong)] text-[var(--game-muted)]"}`}
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
      "You run a company of businesses, from a timber camp onward. The decade at the top is the era you have reached.",
      "Make cash, spend it to grow, and open the next business. Much later you can prestige and start over stronger.",
    ],
  },
  {
    id: "basics",
    title: "THE BASICS",
    lines: [
      "Tap a business's picture to run it. The bar fills, then it pays you cash.",
      "Tap BUY to get another one. BUY spends cash, the big CASH number. What you earned this run is not cash.",
      "The buy-amount button at the top, or the slim bar at the bottom of the GAME list (×1, ×10, ×100, Max), sets how many one BUY tap gets. Both use the same setting, and the game remembers it.",
      "Own 10 of a business to open the next one. Each era also needs some earnings this run, and more with more investors and forks.",
      "The late eras need a TECH project first, and from Mainframes on, opening an era the first time uses some material when you tap OPEN ERA.",
    ],
  },
  {
    id: "navigation",
    title: "FINDING YOUR WAY",
    lines: [
      "Chips at the top of the GAME list jump to an unlocked era. A grey ??? chip is the next era you have not opened yet.",
      "A short Next line under the cash box points at the most useful next goal. Tap it to go there.",
      "A fully upgraded business with a manager on shrinks to one line (icon, name, count, income). Tap the line to expand it, or turn COLLAPSE MAXED off in Settings.",
      "The R&D tab has Specialty and Lab Projects sub-tabs; each section can be collapsed, and a short summary stays visible. A green dot on BOOST, R&D, TECH or an HQ card means something there is ready. It clears when you open that page.",
      "MORE is grouped into Game, Help and Settings. On TECH and in the Hardware Museum, the search box filters by name and model as you type; later-era TECH projects and locked museum pieces stay hidden as ??? and will not match a name search.",
    ],
  },
  {
    id: "materials",
    title: "MATERIALS",
    lines: [
      "Some businesses use what an earlier one makes. Timber Camp makes wood, and the Paper Mill uses that wood.",
      "The strip at the top shows what you have. If a material runs out, the business that needs it stops paying.",
      "Each material's bins hold so much. When they're FULL, new output is lost. Tap a material to buy bigger bins; they stay through prestige.",
      "From Integrated Circuits on, tap silicon, copper or germanium to refine it: ten make one of a refined grade (polysilicon, oxygen-free copper, high-purity germanium) after a minute. Some late research needs them.",
      "RIGS parts take materials too: chips and boards wafers, screens and disks glass, power, cooling, cases and cables copper. From 2018 the copper parts take oxygen-free copper, and from 2020 the chip parts polysilicon. The BUY button shows what's missing.",
      "Two lab projects use materials: FAB TEST RUN (400 wafers for an era token, three a day) and CLEAN ROOM (100 polysilicon: TECH research 25% faster for 15 minutes).",
      "Tap a material to sell spare stock for a little cash, or swap it for another material (with a 10% fee). Prices are small, set by the era that makes it, and drift slowly.",
      "Real shortages happen once each, in their years: the 1988 memory chip crunch, the 1999 Taiwan earthquake, the 2011 Thailand floods, the 2017 crypto rush and the 2020 chip shortage. Pay to keep going, or wait it out with that material made at half rate for ten minutes.",
      "Five famous hardware flaws also happen once each: the 1994 division bug, the bad capacitors of the early 2000s, the 2007 console red lights, the 2011 chipset recall and the 2016 phone battery fires. Recall and replace for about a minute of income, or ride it out with that row earning half for ten minutes.",
      "Anniversary weeks: in the week that starts on a real launch day (ENIAC on February 15, the 4004 on November 15 and more), that era's row earns ×1.25. A banner on the game screen says which.",
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
      "X1 buys one business per tap. X10, X25, X50, X75 and X100 buy that many. MAX buys as many as your cash allows. The bar at the bottom of the GAME list jumps to ×1, ×10, ×100 or Max; the top BUY AMOUNT button still cycles every amount, including the in-between ones.",
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
      "Era tokens come from new eras, milestones, projects and the free Daily Crate. Spend them in the shop in BOOST > BONUSES.",
    ],
  },
  {
    id: "rd",
    title: "R&D POINTS",
    lines: [
      `R&D points are the one research currency, made only by research machines in ${HUB_LABEL} > RESEARCH SERVERS: a cheap punch-card multiplier from the start, then research servers from Mainframes. They earn at half rate while the game is closed; the servers only bank what their disks hold (1 hour of output, plus another hour per TB of disk), while the punch-card machine banks all day.`,
      "Spend them on the R&D tab (specialties and lab projects; use the sub-tabs at the top, or collapse a section to see a short summary) and on the TECH timeline. They are never lost, even when you prestige.",
    ],
  },
  {
    id: "tech",
    title: "THE TECH TIMELINE",
    lines: [
      "R&D > TECH lists the chips, memory, storage, cooling, power and networking of the eras you have reached, in the order they came out. Later eras stay hidden as ??? and will not match a name search. One project runs at a time and keeps going while the app is closed.",
      "\"Requires 1985\" means your company hasn't reached that year yet. \"Research X first\" means finish the project before it. Processor and graphics projects unlock each chip generation's extra pay. Finished research is kept when you prestige.",
    ],
  },
  {
    id: "facilities",
    title: `FACILITIES (${HUB_LABEL})`,
    lines: [
      "HQ (beside BUY AMOUNT) is the menu for every area: Research Servers, the PC Build Bench, the Bitbark Mine, the training cluster, and the Hardware Museum. Tap a card to open that area.",
      "Each plant has its own page. Research servers make R&D points; later plants add a little income. Parts need their TECH project, and are lost when you prestige.",
    ],
  },
  {
    id: "extras",
    title: "CHALLENGES AND PROJECTS",
    lines: [
      "PROGRESS > RUNS has optional challenges: one run with special rules, like no managers. Win one for +10% income forever.",
      "Mega-projects finish on their own once you reach their goal, and each gives a bonus you keep plus tokens.",
    ],
  },
  {
    id: "fork",
    title: "THE BIGGER RESET (FORK)",
    lines: [
      "Much later, with thousands of investors, you can fork the timeline in BOOST > BONUSES. It spends investors to start over like a prestige, with a multiplier you keep forever (up to x4), a higher income limit, and another research slot.",
    ],
  },
  {
    id: "away",
    title: "WHILE YOU'RE AWAY",
    lines: ["Close the app or switch away and businesses with a manager keep earning at half speed, for up to 24 hours. Keep the game open to earn twice as much. You'll see what they made when you come back."],
  },
];

function HowTo({ state, tipsOff, onTips }) {
  return (
    <>
      {HOW_TO.map((section, i) => (
        <details key={section.id} data-howto={section.id} open={i < 2} className="howto-section border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] shadow-[4px_4px_0_0_#000]">
          <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-2 px-3 py-2 font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">
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
      {HOWTO_GUIDES.map((guide) => {
        const locked = guideLocked(state, guide);
        return (
          <details key={guide.id} data-howto={guide.id} data-howto-locked={locked ? "" : undefined} className="howto-section border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] shadow-[4px_4px_0_0_#000]">
            <summary className={`flex min-h-12 cursor-pointer items-center justify-between gap-2 px-3 py-2 font-pixel text-[0.6rem] leading-5 ${locked ? "text-[var(--game-dim)]" : "text-[var(--game-accent)]"}`}>
              {locked ? "??? " + guide.title : guide.title}
              <span aria-hidden="true" className="howto-caret shrink-0 text-[var(--game-muted)]">+</span>
            </summary>
            {locked ? (
              <p data-howto-need className="px-3 pb-3 font-pixel text-[0.5rem] leading-4 text-[var(--game-dim)]">Unlocks with {guide.unlocks}. COMING SOON</p>
            ) : (
              <ul className="space-y-2 px-3 pb-3">
                {guide.lines.map((line) => (
                  <li key={line} className="font-term text-lg leading-6">{line}</li>
                ))}
              </ul>
            )}
          </details>
        );
      })}
      <details data-howto="words" className="howto-section border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] shadow-[4px_4px_0_0_#000]">
        <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-2 px-3 py-2 font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">
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

export function Stats({ state, data }) {
  const era = Math.max(0, eraReachedIndex(state));
  const runs = Array.isArray(state.runs) ? state.runs : [];
  const bestEarn = runs.reduce((best, run) => (!best || run.earnings > best.earnings ? run : best), null);
  const bestTime = longestRun(runs);
  const bestBackers = runs.reduce((best, run) => (!best || run.investorsGained > best.investorsGained ? run : best), null);
  const pending = investorsFor(state.lifetime || 0);
  const challengeName = state.challenge ? (state.challenge.id === "glass" ? "GLASS CEILING" : state.challenge.id === "noboss" ? "NO BOSSES" : "SPEEDRUN") : null;
  return (
    <>
      <p data-stats-company className="break-words font-pixel text-[0.6rem] text-[var(--game-accent)]">{companyName(state).toUpperCase()}</p>
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
          <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">Finished runs show up here after a prestige, a fork, or starting a challenge. The run you're on is below.</p>
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
          This run: {money(state.lifetime || 0)} earned · {formatDuration(runLengthMs(state))} · {eraNameAt(era)}
          {pending > 0 ? ` · ${count(pending)} investors waiting` : ""}
          {challengeName ? ` · ${challengeName}` : ""}
        </p>
        <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">Runs from before this update aren't listed. If a run's start wasn't tracked, its length shows as unknown.</p>
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
        <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">Active is how long each business has been running this run, time away included. Without a manager a business only runs while you tap it, so a low number means it sat idle.</p>
        {BUSINESSES.map((cfg, index) => {
          const st = state.biz[index];
          const minutes = Math.floor((st?.activeMs || 0) / 60000);
          return (
            <p key={cfg.id} className="font-term text-lg leading-6">
              {cfg.name}: {count(st?.owned || 0)} owned · {st?.manager ? (st.managerOff ? "manager off" : "manager") : "manual"} · {minutes}m active
            </p>
          );
        })}
      </Panel>
    </>
  );
}

// The Research Lab, on its own tab in the main navigation.
// The specialty picks (R&D > SPECIALTY).
export function SpecialtyList({ state, onCommit }) {
  const picked = state.specialties || [];
  return (
    <Panel>
        {SPECIALTIES.map((spec) => {
          const owned = picked.includes(spec.id);
          const job = state.researchJob && state.researchJob.id === spec.id ? state.researchJob : null;
          const open = canCommit(state, spec.id);
          const live = job ? timedProgress(job.startedAt, RESEARCH_MS) : null;
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
                  <ProgressBar progress={live} label={`${spec.name} research`} dataAttr="specialty" />
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
  );
}
