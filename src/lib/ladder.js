// Mid-game milestone ladder (T5 item 43): the stretch between the first
// prestige and the first timeline fork is long, so it gets rungs to climb.
// Each rung pays era tokens once, ever (earned, never bought). The rungs
// are career goals: investors, eras reached, a specialty, a mega-project.
import { BUSINESSES } from "./gameConfig.js";

const idx = (id) => BUSINESSES.findIndex((cfg) => cfg.id === id);
const eraName = (id) => BUSINESSES[idx(id)]?.name || id;
const FORK_INVESTORS = 8500; // forkCost(0), see empire.js

const investors = (n) => ({ goal: n, progress: (s) => Math.min(n, Math.floor(Number(s?.investors) || 0)) });
const era = (id) => ({ goal: 1, progress: (s) => ((Number(s?.bestEra) || 0) >= idx(id) ? 1 : 0) });

export const LADDER = [
  { id: "prestige1", title: "FIRST PRESTIGE", detail: "Cash out once for investors.", tokens: 10, goal: 1, progress: (s) => ((s?.prestigeCount || 0) >= 1 || s?.prestiged ? 1 : 0) },
  { id: "inv100", title: "100 INVESTORS", detail: "Hold 100 investors.", tokens: 10, ...investors(100) },
  { id: "era-cpu", title: eraName("cpu").toUpperCase(), detail: `Reach ${eraName("cpu")} in any run.`, tokens: 12, ...era("cpu") },
  { id: "specialty", title: "A SPECIALTY", detail: "Commit a specialty in R&D > SPECIALTY.", tokens: 12, goal: 1, progress: (s) => ((s?.specialties || []).length >= 1 ? 1 : 0) },
  { id: "inv500", title: "500 INVESTORS", detail: "Hold 500 investors.", tokens: 15, ...investors(500) },
  { id: "era-super", title: eraName("supercomputers").toUpperCase(), detail: `Reach ${eraName("supercomputers")} in any run.`, tokens: 15, ...era("supercomputers") },
  { id: "project", title: "A MEGA-PROJECT", detail: "Finish a mega-project (PROGRESS > RUNS).", tokens: 15, goal: 1, progress: (s) => ((s?.projectsDone || []).length >= 1 ? 1 : 0) },
  { id: "inv2000", title: "2,000 INVESTORS", detail: "Hold 2,000 investors.", tokens: 20, ...investors(2000) },
  { id: "era-gpu", title: eraName("gpu").toUpperCase(), detail: `Reach ${eraName("gpu")} in any run.`, tokens: 20, ...era("gpu") },
  { id: "inv5000", title: "5,000 INVESTORS", detail: "Hold 5,000 investors.", tokens: 25, ...investors(5000) },
  { id: "fork", title: "READY TO FORK", detail: `Hold ${FORK_INVESTORS.toLocaleString("en-US")} investors: fork the timeline in BOOST > PRESTIGE.`, tokens: 30, goal: FORK_INVESTORS, progress: (s) => ((s?.singularities || 0) >= 1 ? FORK_INVESTORS : Math.min(FORK_INVESTORS, Math.floor(Number(s?.investors) || 0))) },
];

export function rungMet(state, rung) {
  return rung.progress(state) >= rung.goal;
}

export function ladderOpen(state) {
  return (state?.prestigeCount || 0) >= 1 || !!state?.prestiged || (state?.singularities || 0) >= 1;
}

// Rungs paid so far (kept in state.grants as ladder:<id>).
export function rungPaid(state, rung) {
  return (state?.grants || []).includes(`ladder:${rung.id}`);
}

// The first rung not yet paid, or null at the top.
export function currentRung(state) {
  return LADDER.find((rung) => !rungPaid(state, rung)) || null;
}

// Pay every rung that is met, in order, stopping at the first that isn't.
// Returns the rungs paid now.
export function settleLadder(state) {
  if (!state || !ladderOpen(state)) return [];
  if (!Array.isArray(state.grants)) state.grants = [];
  const paid = [];
  for (const rung of LADDER) {
    if (rungPaid(state, rung)) continue;
    if (!rungMet(state, rung)) break;
    state.grants.push(`ladder:${rung.id}`);
    state.tokens = (state.tokens || 0) + rung.tokens;
    paid.push(rung);
  }
  return paid;
}
