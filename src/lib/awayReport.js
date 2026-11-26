// The Welcome Back card's text (T4 items 47, 36, 42): one summary, the bins
// that were FULL folded into a single line, and the away-time cap.
import { INVESTOR_MILESTONES, hasPerk, offlineCapMs } from "./empire.js";

export function awayLabel(ms) {
  const totalMin = Math.floor((Number(ms) || 0) / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 1) return `${h}h ${m}m`;
  if (m >= 1) return `${m} min`;
  return "a moment";
}

// "Bins full for 8h 9m: wood, paper, sand (extra lost)". When the bins
// filled at different times it says "up to" the longest.
export function binsLine(full) {
  const list = (full || []).filter((f) => f && f.key);
  if (!list.length) return "";
  const longest = Math.max(...list.map((f) => Number(f.ms) || 0));
  const same = list.every((f) => Math.abs((Number(f.ms) || 0) - longest) < 60000);
  return `Bins full for ${same ? "" : "up to "}${awayLabel(longest)}: ${list.map((f) => f.key).join(", ")} (extra lost)`;
}

// The away cap now, whether this absence hit it, and the next earned way
// to raise it.
export function awayCap(state, rawAwayMs) {
  const capMs = offlineCapMs(state);
  const capped = Number(rawAwayMs) > capMs;
  const next = INVESTOR_MILESTONES.find((m) => (m.id === "away-36" || m.id === "away-48") && !hasPerk(state, m.id)) || null;
  return { capMs, capped, next };
}
