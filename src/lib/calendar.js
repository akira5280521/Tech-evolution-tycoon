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

// Time after a first run starts, era by era, from the pacing sim. Germanium
// is left out: it opens after Mainframes in the game but came first (1948),
// so it would always read as behind.
export const HISTORY_PACE_MS = {
  loom: 6 * MIN,
  punchcards: 12 * MIN,
  relay: 20 * MIN,
  sand: 26 * MIN,
  copper: 30 * MIN,
  glass: 34 * MIN,
  filament: 38 * MIN,
  tubes: 45 * MIN,
  mainframes: 1 * H,
  transistors: 1.3 * H,
  silicon: 1.5 * H,
  wafers: 1.7 * H,
  ics: 2 * H,
  minis: 2.3 * H,
  cpu: 2.8 * H,
  homepc: 3.4 * H,
  consoles: 3.8 * H,
  supercomputers: 4.5 * H,
  workstations: 5.2 * H,
  laptops: 6 * H,
  dialup: 7 * H,
  multimedia: 8 * H,
  accel3d: 9.5 * H,
  gpu: 11 * H,
  cloud: 13 * H,
  phones: 15 * H,
  tablets: 17 * H,
  rgb: 20 * H,
  ai: 23 * H,
  quantum: 27 * H,
  vr: 32 * H,
  chatbots: 38 * H,
  supercluster: 46 * H,
};

// How strongly run strength speeds the calendar: speed = runBonus ^ power.
export const CALENDAR_POWER = 1;

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
    out.push({ id, ahead, best, newBest: best === ahead && prev !== ahead });
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
