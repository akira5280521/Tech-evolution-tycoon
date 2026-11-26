import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { currentGoal } from "@/lib/goals";
import { PREFS_EVENT, readPrefs, writePrefs } from "@/lib/gamePrefs";
import { nextGoal, nextGoalLabel } from "@/lib/nextGoal";
import { focusRowLater } from "@/lib/sections";
import { tutorialActive } from "@/lib/tutorial";

export function NextGoalChip({ state }) {
  const navigate = useNavigate();
  const [goalsHidden, setGoalsHidden] = useState(() => !!readPrefs().goalsHidden);
  useEffect(() => {
    const apply = () => setGoalsHidden(!!readPrefs().goalsHidden);
    apply();
    window.addEventListener(PREFS_EVENT, apply);
    return () => window.removeEventListener(PREFS_EVENT, apply);
  }, []);
  if (tutorialActive(state)) return null;
  // The starter-goal card already sits under cash; don't stack a second line.
  if (!goalsHidden && currentGoal(state)) return null;
  const goal = nextGoal(state);
  const label = nextGoalLabel(goal);
  if (!goal || !label) return null;

  const jump = () => {
    if (goal.section) writePrefs({ gameSection: goal.section });
    if (goal.rowId) focusRowLater(goal.rowId);
    if (goal.to && goal.to !== "/") {
      navigate(goal.hash ? { to: goal.to, hash: goal.hash } : { to: goal.to });
      return;
    }
    navigate({ to: "/" });
  };

  return (
    <button type="button" data-next-goal={goal.id} onClick={jump} className="mt-1 flex min-h-12 w-full items-center border-2 border-[var(--game-border)] bg-[var(--game-panel)] px-2 font-pixel text-[0.55rem] text-[var(--game-fg)]">
      <span className="block truncate">{label}</span>
    </button>
  );
}
