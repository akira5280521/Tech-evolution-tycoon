// What to post when the app is hidden: the away cap, a research project
// finishing, or a material bin filling. Pure planning; the Capacitor hook
// in capNotify.js is the only place that talks to the OS.

import { BUSINESSES, isManaged } from "./gameConfig.js";
import { effectiveCycleMs, makesOf, offlineCapMs, supplyCap } from "./empire.js";
import { researchSpeed, techJobs } from "./research.js";

export const NOTIFY_COOLDOWN_MS = 30 * 60 * 1000;
export const NOTE_IDS = { cap: 22022, research: 22023, bins: 22024 };

export function researchReadyIn(state, now = Date.now()) {
  let soonest = Infinity;
  let label = "Research";
  for (const job of techJobs(state)) {
    const left = Math.max(0, (job.durationMs || 0) - (job.progressMs || 0));
    const speed = researchSpeed(state, now);
    const ms = speed > 0 ? left / speed : left;
    if (ms < soonest) {
      soonest = ms;
      label = job.id || "Research";
    }
  }
  const specialty = state?.researchJob;
  if (specialty?.readyAt) {
    const ms = Math.max(0, specialty.readyAt - now);
    if (ms < soonest) {
      soonest = ms;
      label = "Lab research";
    }
  }
  if (!Number.isFinite(soonest) || soonest === Infinity) return null;
  return { ms: soonest, label };
}

export function binFillIn(state, now = Date.now()) {
  const times = [];
  const keys = new Set();
  BUSINESSES.forEach((cfg) => {
    if (cfg.makes) Object.keys(cfg.makes).forEach((key) => keys.add(key));
  });
  for (const key of keys) {
    const cap = supplyCap(state, key);
    const have = state?.supply?.[key] || 0;
    if (!(cap > have)) continue;
    let net = 0;
    BUSINESSES.forEach((cfg, i) => {
      const st = state.biz?.[i];
      if (!isManaged(st) || !(st.owned > 0)) return;
      const cycle = effectiveCycleMs(cfg, state) / 1000;
      if (!(cycle > 0)) return;
      if (cfg.makes?.[key]) net += (makesOf(state, cfg)?.[key] || 0) * st.owned / cycle;
      if (cfg.uses?.[key]) net -= (Number(cfg.uses[key]) || 0) * st.owned / cycle;
    });
    if (!(net > 0)) continue;
    times.push({ key, ms: ((cap - have) / net) * 1000 });
  }
  times.sort((a, b) => a.ms - b.ms);
  if (!times.length) return null;
  return { ms: times[0].ms, keys: times.filter((row) => row.ms <= times[0].ms + 1000).map((row) => row.key) };
}

function cooled(last, now) {
  return !(last > 0) || now - last >= NOTIFY_COOLDOWN_MS;
}

function researchTitle(label) {
  if (!label || label === "Research" || label === "Lab research") return "Research is done";
  return "Research is done";
}

export function notifyPlan(state, prefs, now = Date.now()) {
  const hiddenAt = state?.hiddenAt || now;
  const capMs = offlineCapMs(state);
  const capAt = hiddenAt + capMs;
  const out = [];
  const last = prefs?.notifyAt || {};

  if (prefs?.notifyCap && cooled(last.cap, now) && capAt > now + 5000) {
    out.push({
      type: "cap",
      id: NOTE_IDS.cap,
      title: "Away time is full",
      body: "Your managers have hit the away-time cap. Open Tech Evolution Tycoon to keep earning.",
      at: capAt,
    });
  }

  if (prefs?.notifyResearch && cooled(last.research, now)) {
    const ready = researchReadyIn(state, now);
    if (ready && ready.ms < capMs) {
      const at = now + ready.ms;
      if (at > now + 2000) {
        out.push({
          type: "research",
          id: NOTE_IDS.research,
          title: researchTitle(ready.label),
          body: "A research project has finished. Open Tech Evolution Tycoon to start the next one.",
          at,
        });
      }
    }
  }

  if (prefs?.notifyBins && cooled(last.bins, now)) {
    const fill = binFillIn(state, now);
    if (fill && fill.ms < capMs) {
      const at = now + fill.ms;
      if (at > now + 2000) {
        const names = fill.keys.slice(0, 3).join(", ");
        out.push({
          type: "bins",
          id: NOTE_IDS.bins,
          title: "Bins are full",
          body: `${names} bins are full, and new output will be lost. Open Tech Evolution Tycoon to empty or enlarge them.`,
          at,
        });
      }
    }
  }

  return out;
}
