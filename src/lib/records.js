import { BUSINESSES } from "./gameConfig.js";

function num(n) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : 0;
}

// Highest business the player has actually owned, or the best remembered.
export function eraReachedIndex(state) {
  let best = -1;
  (state?.biz || []).forEach((row, i) => {
    if ((row?.owned || 0) > 0) best = i;
  });
  const remembered = Math.floor(num(state?.bestEra));
  return Math.max(best, remembered > 0 || state?.bestEra === 0 ? remembered : -1);
}

export function eraNameAt(index) {
  return BUSINESSES[index]?.name || "Timber Camp";
}

// Close the current run and start the clock on the next one.
export function pushRun(state, extra = {}) {
  const era = Math.max(0, eraReachedIndex(state));
  const cfg = BUSINESSES[era] || BUSINESSES[0];
  const now = Date.now();
  const rec = {
    earnings: num(state.lifetime),
    lengthMs: Math.max(0, now - (state.runStartedAt || now)),
    eraId: cfg.id,
    eraName: cfg.name,
    investorsGained: Math.max(0, Math.floor(extra.investorsGained || 0)),
    challenge: typeof extra.challenge === "string" && extra.challenge ? extra.challenge : null,
    at: now,
  };
  const prev = Array.isArray(state.runs) ? state.runs : [];
  state.runs = [...prev, rec].slice(-40);
  state.runStartedAt = now;
  state.bestEra = Math.max(era, Math.floor(num(state.bestEra)));
}

export function readRuns(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((row) => row && typeof row === "object")
    .slice(-40)
    .map((row) => ({
      earnings: num(row.earnings),
      lengthMs: num(row.lengthMs),
      eraId: typeof row.eraId === "string" ? row.eraId : "",
      eraName: typeof row.eraName === "string" ? row.eraName : "Unknown",
      investorsGained: Math.floor(num(row.investorsGained)),
      challenge: typeof row.challenge === "string" ? row.challenge : null,
      at: num(row.at),
    }));
}

export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(num(ms) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h >= 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h >= 1) return `${h}h ${m}m`;
  if (m >= 1) return `${m}m`;
  return `${total}s`;
}

// --- Milestones, for "Copy my stats" ---------------------------------------
// The first time each era is reached, plus the first prestige and each fork:
// when (wall clock) and after how much play time. Nothing leaves the phone
// unless the player copies it.

const MAX_FORKS_LOGGED = 5;

export function readMilestones(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out = {};
  for (const [key, row] of Object.entries(raw).slice(0, 80)) {
    if (typeof key !== "string" || key.length > 40 || !row || typeof row !== "object") continue;
    out[key] = { at: num(row.at), play: num(row.play), before: !!row.before };
  }
  return out;
}

function milestoneKeys(state) {
  const keys = [];
  const era = eraReachedIndex(state);
  for (let i = 0; i <= era && i < BUSINESSES.length; i++) keys.push(`era:${BUSINESSES[i].id}`);
  if ((state?.prestigeCount || 0) >= 1) keys.push("prestige:1");
  const forks = Math.min(MAX_FORKS_LOGGED, Math.floor(num(state?.singularities)));
  for (let n = 1; n <= forks; n++) keys.push(`fork:${n}`);
  return keys;
}

// An older save: what it has already done happened before tracking began.
export function startMilestones(state, now = Date.now()) {
  state.milestones = {};
  for (const key of milestoneKeys(state)) state.milestones[key] = { at: 0, play: 0, before: true };
  state.trackedSince = now;
  state.trackedFromStart = false;
}

// Record anything new. Returns true when something was added.
export function noteMilestones(state, now = Date.now()) {
  if (!state) return false;
  if (!state.milestones) state.milestones = {};
  let added = false;
  for (const key of milestoneKeys(state)) {
    if (state.milestones[key]) continue;
    state.milestones[key] = { at: now, play: Math.floor(num(state.playMs)), before: false };
    added = true;
  }
  return added;
}

// --- Play time ---------------------------------------------------------------
// playMs counts time with the game open. Saves from before 0.0.22 had no
// timer, and 0.0.22-0.0.27 started it from the SUM of every business's
// running time. That double counts (18 rows running for one hour read as 18
// hours) and includes time away, so old saves showed weeks of play.

// Start of the oldest moment this save has a clock for: the current run, the
// logged runs, and the stats log.
export function earliestTracked(state) {
  const stamps = [];
  const push = (t) => {
    if (typeof t === "number" && Number.isFinite(t) && t > 0) stamps.push(t);
  };
  push(state?.runStartedAt);
  push(state?.trackedSince);
  for (const run of Array.isArray(state?.runs) ? state.runs : []) {
    if (run && num(run.at) > 0) push(num(run.at) - num(run.lengthMs));
  }
  return stamps.length ? Math.min(...stamps) : 0;
}

// The longest any one business has run. Rows run side by side, so this is
// the honest estimate for a save from before the timer, never the sum.
export function longestRowMs(state) {
  return (state?.biz || []).reduce((best, row) => Math.max(best, num(row?.activeMs)), 0);
}

// Slack for clock jitter before a saved total counts as impossible.
const PLAY_SLACK_MS = 60 * 60 * 1000;

// Run once per save, before time away is replayed. A save with no timer
// starts from the longest-running business. A total that can't be true (more
// than that estimate plus every hour since tracking began) came from the old
// summed start. The live part can't be told apart from it, so the total goes
// back to the same estimate a save with no timer gets (it may read a little
// low, never weeks too high), and "Copy my stats" times logged after it move
// down by the same amount. Returns true when it changed.
export function settlePlayMs(state, now = Date.now(), checked = false) {
  if (!state) return false;
  const estimate = longestRowMs(state);
  if (state.playMs == null || !Number.isFinite(state.playMs) || state.playMs < 0) {
    state.playMs = estimate;
    return true;
  }
  if (checked) return false;
  const since = earliestTracked(state);
  const wall = since > 0 ? Math.max(0, now - since) : 0;
  if (state.playMs <= estimate + wall + PLAY_SLACK_MS) return false;
  const fixed = estimate;
  const cut = state.playMs - fixed;
  state.playMs = fixed;
  if (state.milestones && typeof state.milestones === "object") {
    for (const row of Object.values(state.milestones)) {
      if (row && !row.before && num(row.play) > 0) row.play = Math.max(0, Math.min(fixed, num(row.play) - cut));
    }
  }
  return true;
}

// Play time only counts a normal tick. A longer gap with the app showing
// means the phone froze the game (screen off, low memory) and is not play.
export function playStep(dt, maxStep) {
  if (!(dt > 0) || !Number.isFinite(dt)) return 0;
  return Math.min(dt, maxStep);
}
