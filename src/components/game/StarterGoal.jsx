import { money } from "@/lib/gameConfig";
import { PREFS_EVENT, readPrefs, writePrefs } from "@/lib/gamePrefs";
import { STARTER_GOALS, currentGoal, goalIndex } from "@/lib/goals";
import { tutorialActive } from "@/lib/tutorial";
import { useEffect, useState } from "react";

// One early target, tucked under the cash readout. Hidden during the tutorial
// and when the player turns goals off in Settings.
export default function StarterGoal({ state }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const apply = () => setHidden(!!readPrefs().goalsHidden);
    apply();
    window.addEventListener(PREFS_EVENT, apply);
    return () => window.removeEventListener(PREFS_EVENT, apply);
  }, []);
  if (hidden || tutorialActive(state)) return null;
  const goal = currentGoal(state);
  if (!goal) return null;
  const have = goal.progress(state, false);
  const pct = Math.max(0, Math.min(100, (have / goal.goal) * 100));
  const n = goalIndex(goal) + 1;
  return (
    <section
      data-starter-goal={goal.id}
      className="border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] px-2 py-1.5 shadow-[3px_3px_0_0_#000]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 break-words font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)] [overflow-wrap:anywhere]">
          GOAL {n}/{STARTER_GOALS.length} · {goal.title}
        </p>
        <button
          type="button"
          data-goals-hide
          onClick={() => writePrefs({ goalsHidden: true })}
          className="min-h-12 shrink-0 px-1 font-pixel text-[0.45rem] leading-4 text-[var(--game-muted)] underline"
        >
          HIDE
        </button>
      </div>
      <p className="break-words font-term text-base leading-5 text-[var(--game-fg)]">{goal.detail}</p>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-2 min-w-0 flex-1 border border-[var(--game-border)] bg-[var(--game-bg)]" aria-hidden="true">
          <div className="h-full bg-[var(--game-accent)]" style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 font-term text-base leading-5 text-[var(--game-muted)]">
          {Math.min(goal.goal, Math.floor(have))}/{goal.goal}
        </span>
        <span className="shrink-0 font-term text-base leading-5 text-[var(--game-success)]">+{money(goal.reward)}</span>
      </div>
    </section>
  );
}
