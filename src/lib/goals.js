// A short chain of early targets for a new player. One is current at a time.
// Cash rewards are ordinary in-game cash. Goals already true on an older save
// are marked done without paying, so a veteran does not get a pile of rewards.

import { BUSINESSES } from "./gameConfig.js";
import { tutorialActive } from "./tutorial.js";

const indexOf = (id) => BUSINESSES.findIndex((cfg) => cfg.id === id);
const owned = (state, id) => state?.biz?.[indexOf(id)]?.owned || 0;

export const STARTER_GOALS = [
  {
    id: "tap",
    title: "RUN THE CAMP",
    detail: "Tap the Timber Camp picture once. The bar fills, then it pays.",
    reward: 5,
    goal: 1,
    progress: (s) => (s?.sawPit || (s?.lifetime || 0) > 0 ? 1 : 0),
    met: (s) => (s?.sawPit || (s?.lifetime || 0) > 0),
  },
  {
    id: "timber5",
    title: "FIVE CAMPS",
    detail: "Own 5 Timber Camps. The Hire button appears at 5.",
    reward: 10,
    goal: 5,
    progress: (s) => Math.min(5, owned(s, "timber")),
    met: (s) => owned(s, "timber") >= 5,
  },
  {
    id: "hire",
    title: "HIRE THE FELLER",
    detail: "Hire your first manager with cash. They run that business for you.",
    reward: 10,
    goal: 1,
    progress: (s) => ((s?.biz || []).some((row) => row?.manager) ? 1 : 0),
    met: (s) => (s?.biz || []).some((row) => row?.manager),
  },
  {
    id: "timber10",
    title: "TEN CAMPS",
    detail: "Own 10 Timber Camps. That opens the Paper Mill.",
    reward: 15,
    goal: 10,
    progress: (s) => Math.min(10, owned(s, "timber")),
    met: (s) => owned(s, "timber") >= 10,
  },
  {
    id: "paper",
    title: "OPEN THE MILL",
    detail: "Buy your first Paper Mill.",
    reward: 15,
    goal: 1,
    progress: (s) => Math.min(1, owned(s, "paper")),
    met: (s) => owned(s, "paper") >= 1,
  },
  {
    id: "punch",
    title: "PUNCH CARDS",
    detail: "Reach Punch Cards and buy the first one.",
    reward: 20,
    goal: 1,
    progress: (s) => Math.min(1, owned(s, "punchcards")),
    met: (s) => owned(s, "punchcards") >= 1,
  },
  {
    id: "x10",
    title: "BUY X10",
    detail: "Tap BUY AMOUNT until it says X10, then buy.",
    reward: 25,
    goal: 1,
    progress: (s, migrate) => (s?.boughtX10 || (migrate && owned(s, "punchcards") >= 1) ? 1 : 0),
    met: (s, migrate) => !!s?.boughtX10 || (migrate && owned(s, "punchcards") >= 1),
  },
  {
    id: "museum",
    title: "FIRST HISTORY CARD",
    detail: "Own 25 Timber Camps. The first Museum card is filed.",
    reward: 30,
    goal: 25,
    progress: (s) => Math.min(25, owned(s, "timber")),
    met: (s) => owned(s, "timber") >= 25 || (s?.museum || []).includes("timber-1"),
  },
];

const IDS = new Set(STARTER_GOALS.map((goal) => goal.id));

export function readGoalsDone(raw) {
  if (!Array.isArray(raw)) return null;
  return raw.filter((id) => IDS.has(id));
}

export function currentGoal(state) {
  const done = new Set(state?.goalsDone || []);
  return STARTER_GOALS.find((goal) => !done.has(goal.id)) || null;
}

export function goalIndex(goal) {
  const i = STARTER_GOALS.findIndex((entry) => entry.id === goal?.id);
  return i < 0 ? 0 : i;
}

// Mark every goal that is already true, in order, and stop at the first that
// is not. Pay only the one that was current when this call started, and only
// when the tutorial is finished and the caller asked to pay. A backlog of
// several (an older save, or the tutorial just ending) is marked with no cash.
export function settleGoals(state, { pay = false, migrate = false } = {}) {
  if (!state) return { reward: 0 };
  if (!Array.isArray(state.goalsDone)) state.goalsDone = [];
  if (tutorialActive(state)) return { reward: 0 };
  const done = new Set(state.goalsDone);
  const current = STARTER_GOALS.find((goal) => !done.has(goal.id));
  if (!current) return { reward: 0 };
  let reward = 0;
  for (const goal of STARTER_GOALS) {
    if (done.has(goal.id)) continue;
    if (!goal.met(state, migrate)) break;
    done.add(goal.id);
    if (pay && goal.id === current.id) reward += goal.reward;
  }
  state.goalsDone = [...done];
  if (reward > 0) state.cash = (state.cash || 0) + reward;
  return { reward };
}
