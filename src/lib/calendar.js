// The run calendar: "ahead of history".
//
// Each run has a calendar that moves through real history at a set pace. When
// an era opens, the calendar shows how far it has got; opening an era before
// the calendar reaches its real year puts you that many years ahead.
//
// The pace comes from the pacing sim: HISTORY_PACE_MS is how long after the
// start of a first run each era opens for a steady player. Stronger runs (more
// investors, forks) move faster, so the calendar does too, by the same run
// bonus that scales the era earnings gates. The best result for each era is
// kept through prestige.
import { BUSINESSES, runBonus } from "./gameConfig.js";
import { ERA_YEAR } from "./eraYear.js";

const MIN = 60e3;
const H = 60 * MIN;

// Time after a run starts, era by era, for a run with no investors: twice the
// pacing sim's nonstop first run (0.0.29), so a steady player who isn't on
// all day is about on time. The first run in the sim prestiges after 3D
// Accelerators; later eras come from its strong run (20,000 investors, one
// fork) times 14.5, how much faster it was on the eras both reached. Germanium
// is left out: it opens after Mainframes in the game but came first (1948),
// so it would always read as behind.
export const HISTORY_PACE_MS = {
  loom: 19 * MIN,
  punchcards: 21 * MIN,
  relay: 23 * MIN,
  sand: 26 * MIN,
  copper: 46 * MIN,
  glass: 51 * MIN,
  filament: 64 * MIN,
  tubes: 74 * MIN,
  mainframes: 75 * MIN,
  transistors: 103 * MIN,
  silicon: 104 * MIN,
  wafers: 131 * MIN,
  ics: 137 * MIN,
  minis: 139 * MIN,
  cpu: 143 * MIN,
  homepc: 3.2 * H,
  consoles: 4.4 * H,
  supercomputers: 5.8 * H,
  workstations: 6.4 * H,
  laptops: 7 * H,
  dialup: 7.2 * H,
  multimedia: 7.3 * H,
  accel3d: 7.8 * H,
  gpu: 10 * H,
  cloud: 10.5 * H,
  phones: 12.4 * H,
  tablets: 15 * H,
  rgb: 17.3 * H,
  ai: 19.3 * H,
  quantum: 29 * H,
  vr: 67 * H,
  chatbots: 197 * H,
  supercluster: 500 * H,
};

// How strongly run strength speeds the calendar: speed = runBonus ^ power.
// The strong run was 14.5x faster at a run bonus of 16.4: 0.95.
export const CALENDAR_POWER = 0.95;

// The calendar starts here; earlier eras open in the first minutes anyway.
export const CALENDAR_START = 1800;

// Anchors (pace ms -> year), in time order, years never going backwards.
const ANCHORS = (() => {
  const list = Object.entries(HISTORY_PACE_MS)
    .filter(([id]) => ERA_YEAR[id] != null)
    .map(([id, ms]) => ({ ms, year: ERA_YEAR[id] }))
    .sort((a, b) => a.ms - b.ms);
  const out = [{ ms: 0, year: CALENDAR_START }];
  for (const a of list) out.push({ ms: a.ms, year: Math.max(a.year, out[out.length - 1].year) });
  return out;
})();

export function calendarSpeed(state) {
  const bonus = runBonus(state);
  return Number.isFinite(bonus) && bonus > 1 ? bonus ** CALENDAR_POWER : 1;
}

function runStart(state, now) {
  const t = state?.runStartedAt;
  return typeof t === "number" && Number.isFinite(t) && t > 0 && t <= now ? t : 0;
}

// The calendar year (with a fraction) at `now`, or null if the run start
// wasn't tracked.
export function calendarYearAt(state, now = Date.now()) {
  const start = runStart(state, now);
  if (!start) return null;
  const ms = (now - start) * calendarSpeed(state);
  for (let i = 1; i < ANCHORS.length; i++) {
    const a = ANCHORS[i - 1];
    const b = ANCHORS[i];
    if (ms <= b.ms) return a.year + ((b.year - a.year) * (ms - a.ms)) / Math.max(1, b.ms - a.ms);
  }
  // Past the last era the calendar keeps going at the last stretch's pace.
  const a = ANCHORS[ANCHORS.length - 2];
  const b = ANCHORS[ANCHORS.length - 1];
  const perMs = (b.year - a.year) / Math.max(1, b.ms - a.ms);
  return b.year + (ms - b.ms) * perMs;
}

export function calendarYear(state, now = Date.now()) {
  const y = calendarYearAt(state, now);
  return y == null ? null : Math.floor(y);
}

// Whole years ahead (positive) or behind (negative) for an era opening now.
export function yearsAhead(state, eraId, now = Date.now()) {
  const year = ERA_YEAR[eraId];
  const cal = calendarYearAt(state, now);
  if (year == null || cal == null || HISTORY_PACE_MS[eraId] == null) return null;
  return Math.round(year - cal);
}

export function aheadLabel(n) {
  if (n == null) return "";
  if (n === 0) return "RIGHT ON HISTORY";
  const y = Math.abs(n);
  return `${y} ${y === 1 ? "YEAR" : "YEARS"} ${n > 0 ? "AHEAD OF" : "BEHIND"} HISTORY`;
}

// A new best on an era you'd reached before pays this many era tokens, up to
// HISTORY_TOKENS_PER_RUN in one run. The calendar speeds up with run
// strength, so a best has to be earned, not just waited for.
export const HISTORY_TOKEN = 1;
export const HISTORY_TOKENS_PER_RUN = 10;

// Record each era the first time this run owns it. `state.calendar` is per
// run (era id -> years ahead, or null for eras owned when the run began);
// `state.historyBest` keeps the best for each era through prestige.
// Returns the eras recorded just now as [{ id, ahead, best }].
export function noteCalendar(state, now = Date.now()) {
  if (!state) return [];
  const owned = BUSINESSES.filter((cfg, i) => (state.biz?.[i]?.owned || 0) > 0).map((cfg) => cfg.id);
  if (!state.calendar || typeof state.calendar !== "object") {
    // A new run, or a save from before the calendar: what's already owned
    // isn't scored.
    state.calendar = Object.fromEntries(owned.map((id) => [id, null]));
    return [];
  }
  if (!runStart(state, now)) return [];
  const out = [];
  for (const id of owned) {
    if (id in state.calendar) continue;
    const ahead = yearsAhead(state, id, now);
    state.calendar = { ...state.calendar, [id]: ahead };
    if (ahead == null) continue;
    const prev = state.historyBest?.[id];
    const best = typeof prev === "number" && prev >= ahead ? prev : ahead;
    state.historyBest = { ...(state.historyBest || {}), [id]: best };
    // Beating a best you already had pays an era token, a few per run.
    let tokens = 0;
    if (typeof prev === "number" && ahead > prev && (state.calendarTokens || 0) < HISTORY_TOKENS_PER_RUN) {
      tokens = HISTORY_TOKEN;
      state.tokens = (state.tokens || 0) + tokens;
      state.calendarTokens = (state.calendarTokens || 0) + tokens;
    }
    out.push({ id, ahead, best, newBest: best === ahead && prev !== ahead, tokens });
  }
  return out;
}

// Save readers: only known eras, whole numbers.
export function readCalendar(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out = {};
  for (const [id, v] of Object.entries(raw)) {
    if (ERA_YEAR[id] == null) continue;
    out[id] = typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;
  }
  return out;
}

export function readHistoryBest(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const [id, v] of Object.entries(raw)) {
    if (ERA_YEAR[id] != null && typeof v === "number" && Number.isFinite(v)) out[id] = Math.round(v);
  }
  return out;
}

// Rows for the Runs page: every scored era reached this run or before.
export function historyRows(state) {
  return BUSINESSES.filter((cfg) => HISTORY_PACE_MS[cfg.id] != null)
    .map((cfg) => ({
      id: cfg.id,
      name: cfg.name,
      year: ERA_YEAR[cfg.id],
      run: typeof state?.calendar?.[cfg.id] === "number" ? state.calendar[cfg.id] : null,
      best: typeof state?.historyBest?.[cfg.id] === "number" ? state.historyBest[cfg.id] : null,
    }))
    .filter((r) => r.run != null || r.best != null);
}
