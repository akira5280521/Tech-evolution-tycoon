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
