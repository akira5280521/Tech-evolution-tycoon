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
