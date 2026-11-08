import { useEffect, useState } from "react";
import { PROJECT_MS, money } from "@/lib/gameConfig";
import { CHALLENGES, PROJECTS } from "@/lib/empire";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton, Panel } from "./chrome";

export default function RunsPage() {
  const { state, startChallenge } = useGameState();
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <ScreenShell title="CHALLENGES" subtitle="Special runs and long builds with rewards that never reset.">
      <h2 className="font-pixel text-[0.7rem] text-[var(--game-accent)]">CHALLENGE RUNS</h2>
      {CHALLENGES.map((challenge) => {
        const done = (state.challengesDone || []).includes(challenge.id);
        const active = state.challenge?.id === challenge.id;
        const left = active && challenge.limitMs ? Math.max(0, challenge.limitMs - (now - state.challenge.startedAt)) : 0;
        return (
          <Panel key={challenge.id}>
            <h3 className="font-pixel text-[0.7rem]">{challenge.name}</h3>
            <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">{challenge.blurb}</p>
            <p className="mt-2 font-term text-lg leading-6">
              Goal: {money(challenge.goal)} this run · <span className="text-[var(--game-success)]">+10% all revenue, forever</span>
            </p>
            {active && (
              <p className="mt-1 font-term text-base text-[var(--game-accent)]">
                This run {money(state.challenge.earnings)}
                {challenge.limitMs ? ` · ${Math.ceil(left / 1000)}s left` : ""}
              </p>
            )}
            {done ? (
              <p className="mt-2 font-pixel text-[0.55rem] text-[var(--game-success)]">WON</p>
            ) : (
              <div className="mt-2">
                <GoldButton disabled={!!state.challenge} onClick={() => startChallenge(challenge.id)} dataAttr={challenge.id}>
                  <span className="font-pixel text-[0.7rem]">START RUN</span>
                </GoldButton>
              </div>
            )}
          </Panel>
        );
      })}
      <h2 className="font-pixel text-[0.7rem] text-[var(--game-accent)]">MEGA-PROJECTS</h2>
      {PROJECTS.map((project) => {
        const done = (state.projectsDone || []).includes(project.id);
        return (
          <Panel key={project.id}>
            <h3 className="font-pixel text-[0.65rem]">{project.name}</h3>
            <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">{project.blurb}</p>
            <p className="mt-1 font-term text-lg text-[var(--game-success)]">+10% all revenue, forever · +{project.tokens} tokens</p>
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
