import { useEffect, useState } from "react";
import { PROJECT_MS, money } from "@/lib/gameConfig";
import { CHALLENGES, PROJECTS, activeChallengeGoal, projectRevealed, scaledChallengeGoal } from "@/lib/empire";
import { aheadLabel, calendarYear, historyRows } from "@/lib/calendar";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton, Panel } from "./chrome";
import { HelpTip, ItemHelp } from "./HintSheet";

export default function RunsPage() {
  const { state, startChallenge, abandonChallenge } = useGameState();
  const locked = !state.prestiged && !state.challenge;
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <ScreenShell title="RUNS" subtitle="Optional harder runs and big goals. Their rewards are kept forever.">
      <AheadOfHistory state={state} now={now} />
      <h2 className="flex items-center gap-2 font-pixel text-[0.7rem] text-[var(--game-accent)]">
        CHALLENGE RUNS <HelpTip term="challenge" />
      </h2>
      <p className="font-term text-lg leading-6 text-[var(--game-muted)]">
        One run with special rules. Starting one resets your businesses and cash like a prestige does, but you keep investors.
      </p>
      {locked && (
        <Panel>
          <p data-challenges-locked className="font-term text-lg leading-6 text-[var(--game-muted)]">
            Challenges open after your first prestige. They're tuned for a company that already has investors.
          </p>
        </Panel>
      )}
      {CHALLENGES.map((challenge) => {
        const done = (state.challengesDone || []).includes(challenge.id);
        const active = state.challenge?.id === challenge.id;
        const left = active && challenge.limitMs ? Math.max(0, challenge.limitMs - (now - state.challenge.startedAt)) : 0;
        return (
          <Panel key={challenge.id}>
            <div data-help-scope>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-pixel text-[0.7rem]">{challenge.name}</h3>
              <ItemHelp kind="challenge" id={challenge.id} state={state} name={challenge.name} className="-mr-2 -mt-2.5" />
            </div>
            <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">{challenge.blurb}</p>
            <p className="mt-2 font-term text-lg leading-6">
              Goal: {money(active ? activeChallengeGoal(state) : scaledChallengeGoal(challenge, state))} this run · <span className="text-[var(--game-success)]">+10% all income, forever</span>
            </p>
            {active && (
              <p className="mt-1 font-term text-base text-[var(--game-accent)]">
                This run {money(state.challenge.earnings)} / {money(activeChallengeGoal(state))}
                {challenge.limitMs ? ` · ${Math.ceil(left / 1000)}s left` : ""}
              </p>
            )}
            {done ? (
              <p className="mt-2 font-pixel text-[0.55rem] text-[var(--game-success)]">WON</p>
            ) : active ? (
              <div className="mt-2">
                <button
                  type="button"
                  data-abandon-challenge
                  onClick={abandonChallenge}
                  className="min-h-11 w-full border-2 border-[var(--game-danger)] bg-[var(--game-panel)] px-3 font-pixel text-[0.6rem] text-[var(--game-danger)] shadow-[3px_3px_0_0_#000]"
                >
                  ABANDON CHALLENGE
                </button>
              </div>
            ) : (
              <div className="mt-2">
                <GoldButton disabled={!!state.challenge || locked} onClick={() => startChallenge(challenge.id)} dataAttr={challenge.id}>
                  <span className="font-pixel text-[0.7rem]">{locked ? "AFTER FIRST PRESTIGE" : "START RUN"}</span>
                </GoldButton>
              </div>
            )}
            </div>
          </Panel>
        );
      })}
      <h2 className="flex items-center gap-2 font-pixel text-[0.7rem] text-[var(--game-accent)]">
        MEGA-PROJECTS <HelpTip term="projects" />
      </h2>
      <p className="font-term text-lg leading-6 text-[var(--game-muted)]">These finish on their own once you reach the goal. Nothing to start.</p>
      {PROJECTS.map((project) => {
        const done = (state.projectsDone || []).includes(project.id);
        if (!projectRevealed(state, project)) {
          return (
            <Panel key={project.id}>
              <div data-project-hidden data-help-scope>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-pixel text-[0.65rem] text-[var(--game-dim)] opacity-60">???</h3>
                  <ItemHelp kind="project" id={project.id} state={state} name="this hidden project" className="-mr-2 -mt-2.5" />
                </div>
                <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)] opacity-60">Reach more eras to reveal this project.</p>
              </div>
            </Panel>
          );
        }
        return (
          <Panel key={project.id}>
            <div data-help-scope className="flex items-start justify-between gap-2">
              <h3 className="min-w-0 break-words font-pixel text-[0.65rem]">{project.name}</h3>
              <ItemHelp kind="project" id={project.id} state={state} name={project.name} className="-mr-2 -mt-2.5" />
            </div>
            <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">{project.blurb}</p>
            <p className="mt-1 font-term text-lg text-[var(--game-success)]">+{Math.round(project.reward * 100)}% all income, forever · +{project.tokens} tokens</p>
            {done && <p className="mt-2 font-pixel text-[0.55rem] text-[var(--game-success)]">FINISHED</p>}
            {!done && state.projectJob?.id === project.id && (
              <div className="mt-2">
                <p className="font-pixel text-[0.55rem] text-[var(--game-accent)]">UNDER CONSTRUCTION</p>
                <div className="mt-2 h-5 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]">
                  <div
                    className="h-full bg-[var(--game-accent)]"
                    style={{ width: `${Math.max(0, Math.min(100, ((Date.now() - state.projectJob.startedAt) / PROJECT_MS) * 100))}%` }}
                  />
                </div>
              </div>
            )}
          </Panel>
        );
      })}
    </ScreenShell>
  );
}

// Each run has a calendar that moves through real history. Opening an era
// before the calendar reaches its real year puts you ahead of history.
function AheadOfHistory({ state, now }) {
  const year = now ? calendarYear(state, now) : null;
  const rows = historyRows(state);
  const cell = (n) => (n == null ? "—" : n === 0 ? "ON TIME" : `${n > 0 ? "▲" : "▼"} ${Math.abs(n)}`);
  const tone = (n) => (n == null ? "text-[var(--game-dim)]" : n >= 0 ? "text-[var(--game-success)]" : "text-[var(--game-danger)]");
  return (
    <section data-ahead className="space-y-2">
      <h2 className="font-pixel text-[0.7rem] text-[var(--game-accent)]">AHEAD OF HISTORY</h2>
      <p className="font-term text-lg leading-6 text-[var(--game-muted)]">
        Every run has a calendar that moves through history at a steady pace, and faster the more investors and forks you have. Open an era before the calendar reaches the year it really arrived to get ahead of history. Beat your best on an era for +1 era token, up to 10 a run.
      </p>
      {year != null && (
        <p data-calendar-year={year} className="font-pixel text-[0.6rem] text-[var(--game-fg)]">CALENDAR: {year}</p>
      )}
      {rows.length > 0 ? (
        <Panel>
          <table data-ahead-table className="w-full font-term text-lg leading-6">
            <thead>
              <tr className="font-pixel text-[0.45rem] text-[var(--game-muted)]">
                <th className="text-left font-normal">ERA</th>
                <th className="text-right font-normal">THIS RUN</th>
                <th className="text-right font-normal">BEST</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} data-ahead-row={r.id} data-run={r.run ?? ""} data-best={r.best ?? ""}>
                  <td className="min-w-0 break-words pr-2">
                    {r.name} <span className="text-[var(--game-dim)]">{r.year}</span>
                  </td>
                  <td className={`whitespace-nowrap text-right tabular-nums ${tone(r.run)}`} aria-label={aheadLabel(r.run) || "not reached this run"}>
                    {cell(r.run)}
                  </td>
                  <td className={`whitespace-nowrap pl-2 text-right tabular-nums ${tone(r.best)}`} aria-label={aheadLabel(r.best) || "no best yet"}>
                    {cell(r.best)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">▲ years ahead of history · ▼ years behind</p>
        </Panel>
      ) : (
        <Panel>
          <p className="font-term text-lg leading-6 text-[var(--game-muted)]">Open your next era to see how you compare with history.</p>
        </Panel>
      )}
    </section>
  );
}
