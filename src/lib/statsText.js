// "Copy my stats": the player's progress as plain text they can paste into a
// message for the developer. Only game numbers: no name, account, device or
// location.

import { BUSINESSES, count, money } from "./gameConfig.js";
import { eraNameAt, eraReachedIndex } from "./records.js";
import { RESEARCH, serverOutput } from "./research.js";
import { investorPeak } from "./empire.js";
import { readErrors } from "./errorLog.js";

function span(ms) {
  const min = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function day(ms) {
  try {
    return new Date(ms).toISOString().slice(0, 10);
  } catch {
    return "unknown";
  }
}

function label(key) {
  const [kind, id] = key.split(":");
  if (kind === "era") return BUSINESSES.find((b) => b.id === id)?.name || id;
  if (kind === "prestige") return "First prestige";
  if (kind === "fork") return id === "1" ? "First fork" : `Fork ${id}`;
  return key;
}

export function statsText(state, { version = "", code = "", now = Date.now() } = {}) {
  const s = state || {};
  const since = s.trackedSince || 0;
  const lines = [];
  lines.push(`Tech Evolution Tycoon ${version}${code ? ` (${code})` : ""} stats`);
  lines.push(since ? `Tracked since ${day(since)}${s.trackedFromStart ? " (first launch)" : " (an update; earlier steps marked 'before')"}, ${span(now - since)} ago` : "Tracking just started");
  lines.push(`Play time: ${span(s.playMs || 0)}`);
  lines.push(`Best era: ${eraNameAt(Math.max(0, eraReachedIndex(s)))}`);
  lines.push(`Prestiges: ${count(s.prestigeCount || 0)} · Forks: ${count(s.singularities || 0)} · Investors: ${count(s.investors || 0)} (most ${count(investorPeak(s))})`);
  lines.push(`Earned: ${money(s.careerEarnings || 0)} total, ${money(s.lifetime || 0)} this run`);
  const done = (s.techDone || []).length;
  const total = RESEARCH.filter((r) => !r.soon).length;
  lines.push(`R&D: ${Math.round(s.data || 0).toLocaleString("en-US")} points · tech ${done}/${total} done · servers ${serverOutput(s).perSecond.toFixed(2)}/s`);
  lines.push(`Specialties: ${(s.specialties || []).length} · Challenges won: ${(s.challengesDone || []).length} · Tutorial: ${s.tutorial?.skipped ? "skipped" : s.tutorial?.done ? "finished" : "in progress"}`);

  const marks = Object.entries(s.milestones || {});
  if (marks.length) {
    lines.push("");
    lines.push("Reached (time since tracking began · play time):");
    const order = (key) => {
      const [kind, id] = key.split(":");
      if (kind === "era") return BUSINESSES.findIndex((b) => b.id === id);
      return 1000 + (kind === "fork" ? Number(id) : 0);
    };
    marks.sort((a, b) => (a[1].at || 0) - (b[1].at || 0) || order(a[0]) - order(b[0]));
    for (const [key, m] of marks) lines.push(m.before ? `- ${label(key)}: before` : `- ${label(key)}: ${span(m.at - since)} · ${span(m.play)}`);
  }

  const runs = Array.isArray(s.runs) ? s.runs.slice(-8) : [];
  if (runs.length) {
    lines.push("");
    lines.push("Last runs (length · era · investors gained):");
    for (const r of runs) lines.push(`- ${span(r.lengthMs || 0)} · ${r.eraName || "?"} · +${count(r.investorsGained || 0)}${r.challenge ? ` · ${r.challenge}` : ""}`);
  }
  const errors = typeof window === "undefined" ? [] : readErrors();
  lines.push("");
  if (errors.length) {
    lines.push("Recent errors (newest last):");
    for (const e of errors) lines.push(`- ${day(e.at)} ${e.v || "?"} ${e.page}: ${e.msg}${e.n > 1 ? ` (x${e.n})` : ""}`);
  } else {
    lines.push("Recent errors: none");
  }
  return lines.join("\n");
}
