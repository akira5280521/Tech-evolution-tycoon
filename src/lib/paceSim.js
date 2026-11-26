// Headless pacing bot. It calls the same buy / hire / open / prestige /
// replayAway functions as the live game, then reports when eras, the first
// prestige, the first fork, and Quantum arrive.

import {
  BUSINESSES,
  ERA_GATE,
  FOREMAN_COST,
  OFFLINE_CAP_MS,
  OFFLINE_RATE,
  costOf,
  ERA_RESEARCH,
  eraCanOpen,
  eraNeeds,
  eraOpen,
  frontierEra,
  openEra,
  shortMaterial,
} from "./gameConfig.js";
import {
  autoBuyUpgrade,
  buyStorage,
  buyUpgrade,
  canHireIndex,
  dataPerSecond,
  finishTimedWork,
  incomePerSecond,
  managerPrice,
  replayAway,
  supplyFull,
  upgradeOffer,
  upgradesOf,
} from "./empire.js";
import { PARTS, STARTER_PART_ID, partCost, purchasePart } from "./facilities.js";
import { RESEARCH, canStartResearch, researchCost, startResearch } from "./research.js";
import {
  applyFork,
  applyPrestige,
  botPlayHistory,
  buyBusiness,
  buyForeman,
  canFork,
  freshState,
  hireManager,
  prestigeWouldDouble,
} from "./playState.js";

export const QUANTUM_ID = "quantum";
export const SIM_START = 1_700_000_000_000;
// Stop if a profile has not forked by then (well past the ~4 day target).
export const MAX_ELAPSED_MS = 21 * 24 * 60 * 60 * 1000;
const ACTIVE_JUMP_MS = 60 * 1000;
const SESSION_MS = 45 * 60 * 1000;
const IDLE_GAP_MS = 8 * 60 * 60 * 1000;


function researchChain(id) {
  const out = [];
  const seen = new Set();
  let cur = RESEARCH.find((entry) => entry.id === id);
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    out.unshift(cur.id);
    cur = cur.prereq ? RESEARCH.find((entry) => entry.id === cur.prereq) : null;
  }
  return out;
}

function neededResearchIds(state) {
  const ids = [];
  for (const cfg of BUSINESSES) {
    const project = ERA_RESEARCH[cfg.id];
    if (project && !(state.techDone || []).includes(project.id)) {
      for (const id of researchChain(project.id)) {
        if (!(state.techDone || []).includes(id) && !ids.includes(id)) ids.push(id);
      }
    }
  }
  return ids;
}

const STARTER_MAX = 6;

function tryStarter(state) {
  const counts = state.facilities?.servers || {};
  if ((counts[STARTER_PART_ID] || 0) >= STARTER_MAX) return false;
  return purchasePart(state, "servers", STARTER_PART_ID).ok === true;
}

// Only the next era-gate project, including its prereqs. Do not skip ahead
// to a later chain (for example SSDs) just because that project is cheaper.
function nextResearchId(state) {
  return neededResearchIds(state)[0] || null;
}

function tryServerRd(state, now) {
  if (tryStarter(state)) return true;
  const id = nextResearchId(state);
  if (!id) return false;
  const entry = RESEARCH.find((row) => row.id === id);
  if (!entry || (Number(state.data) || 0) >= researchCost(entry)) return false;
  const income = incomePerSecond(state, now);
  const budget = Math.max(income * 600, (state.cash || 0) * 0.05);
  const parts = PARTS.filter((part) => part.fits?.includes("servers") && part.rd > 0 && !part.soon)
    .sort((a, b) => (a.cost || 0) - (b.cost || 0));
  const counts = state.facilities?.servers || {};
  for (const part of parts) {
    const cost = partCost(part, counts[part.id] || 0);
    if (!(cost > 0) || cost > budget) continue;
    if (purchasePart(state, "servers", part.id, now).ok) return true;
  }
  return false;
}

function tryResearch(state, now = 0) {
  if (tryServerRd(state, now)) return true;
  const id = nextResearchId(state);
  if (!id) return false;
  if (canStartResearch(state, id) && startResearch(state, id).ok) return true;
  return false;
}

export function formatDuration(ms) {
  if (!(ms >= 0) || !Number.isFinite(ms)) return "—";
  const s = Math.round(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return h ? `${d}d ${h}h` : `${d}d`;
  if (h > 0) return m ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return sec && m < 10 ? `${m}m ${sec}s` : `${m}m`;
  return `${sec}s`;
}

function indexOf(id) {
  return BUSINESSES.findIndex((b) => b.id === id);
}

function recordEra(result, state, elapsed) {
  (state.biz || []).forEach((row, i) => {
    if ((row?.owned || 0) <= 0) return;
    const id = BUSINESSES[i].id;
    if (result.eras[id] == null) {
      result.eras[id] = elapsed;
      result.eraOrder.push({ id, name: BUSINESSES[i].name, ms: elapsed });
    }
  });
  if (result.quantum == null && (state.biz[indexOf(QUANTUM_ID)]?.owned || 0) > 0) {
    result.quantum = elapsed;
  }
}

function tryHire(state, now) {
  let any = false;
  for (let i = BUSINESSES.length - 1; i >= 0; i--) {
    if (canHireIndex(state, i) && (state.biz[i].commissionUntil || 0) <= now) {
      if (hireManager(state, i, now)) any = true;
    }
  }
  return any;
}

function tryUpgrades(state, now) {
  if (autoBuyUpgrade(state, now)) return true;
  let best = null;
  BUSINESSES.forEach((cfg, i) => {
    const owned = state.biz?.[i]?.owned || 0;
    if (owned <= 0) return;
    const offer = upgradeOffer(i);
    const up = upgradesOf(state, cfg.id);
    for (const kind of ["rev", "spd"]) {
      const piece = offer[kind];
      if (up[kind] || owned < piece.need || !Number.isFinite(piece.cost) || piece.cost > state.cash) continue;
      if (!best || piece.cost < best.cost) best = { i, kind, cost: piece.cost };
    }
  });
  return best ? buyUpgrade(state, best.i, best.kind, now) : false;
}

function tryStorage(state) {
  let any = false;
  for (const key of Object.keys(state.supply || {})) {
    if (supplyFull(state, key) && buyStorage(state, key)) any = true;
  }
  return any;
}

function buyOne(state, index, now) {
  return buyBusiness(state, index, "x1", now).ok;
}

function buyMax(state, index, now) {
  return buyBusiness(state, index, "MAX", now).ok;
}

// One pass of a reasonable active player: the same priority as nextMove,
// plus affordable upgrades, storage when a bin is full, a foreman, and a
// fork once it is actually payable.

// Don't prestige over the next era when it's already close (owned-count
// gate still in progress, or its earnings gate is within 50% of this run).
// Otherwise a doubling point can sit just before a late-era gate and the
// bot never opens that era.
function shouldDelayPrestige(state) {
  const front = frontierEra(state);
  if (!(front > 0)) return false;
  if (eraCanOpen(state, front)) return true;
  if ((state.biz[front - 1]?.owned || 0) < ERA_GATE) return true;
  const needs = eraNeeds(state, front);
  if (needs.some((n) => n.kind === "research" && !n.met)) return true;
  const earn = needs.find((n) => n.kind === "earn");
  if (earn && !earn.met && earn.need <= (state.lifetime || 0) * 1.5) return true;
  return false;
}

export function act(state, now) {
  let acted = false;

  botPlayHistory(state, now);

  if (tryResearch(state, now)) acted = true;
  if (tryHire(state, now)) acted = true;

  const short = shortMaterial(state);
  if (short) {
    const maker = BUSINESSES[short.maker];
    const up = upgradesOf(state, maker.id);
    const offer = upgradeOffer(short.maker);
    if (!up.rev && Number.isFinite(offer.rev.cost) && state.cash >= offer.rev.cost) {
      if (buyUpgrade(state, short.maker, "rev", now)) return true;
    }
    if (canHireIndex(state, short.maker) && (state.biz[short.maker].commissionUntil || 0) <= now) {
      if (hireManager(state, short.maker, now)) return true;
    }
    if (eraOpen(state, short.maker) && buyOne(state, short.maker, now)) return true;
  }

  if (tryHire(state, now)) acted = true;

  for (let i = 1; i < BUSINESSES.length; i++) {
    if (!eraOpen(state, i) || (state.biz[i]?.owned || 0) > 0) continue;
    if (buyOne(state, i, now)) return true;
    break;
  }

  const front = frontierEra(state);
  if (front > 0) {
    if (eraCanOpen(state, front) && openEra(state, front)) return true;
    const prev = front - 1;
    const have = state.biz[prev]?.owned || 0;
    if (have < ERA_GATE && eraOpen(state, prev) && buyMax(state, prev, now)) return true;
  }

  if (prestigeWouldDouble(state) && !shouldDelayPrestige(state)) {
    const result = applyPrestige(state, now);
    if (result) return { state: result.next, prestige: true, gained: result.gained };
  }

  if (!state.foreman && state.cash >= FOREMAN_COST && buyForeman(state)) acted = true;

  if (tryUpgrades(state, now)) acted = true;
  if (tryStorage(state)) acted = true;

  if (canFork(state)) {
    const result = applyFork(state, now);
    if (result) return { state: result.next, fork: true, bill: result.bill };
  }

  // Put new cash into the newest open row first (the one a player is
  // climbing), then any cheaper earlier row that still pays back.
  for (let i = BUSINESSES.length - 1; i >= 0; i--) {
    if (!eraOpen(state, i)) continue;
    const cost = costOf(BUSINESSES[i], state.biz[i]?.owned || 0, 1, state);
    if (Number.isFinite(cost) && cost <= state.cash && buyMax(state, i, now)) return true;
  }

  return acted;
}

function applyAct(state, now, result) {
  const out = act(state, now);
  if (out && out.state) {
    result.state = out.state;
    if (out.prestige && result.firstPrestige == null) result.firstPrestige = result.elapsed;
    if (out.fork && result.firstFork == null) result.firstFork = result.elapsed;
    return { state: out.state, acted: true, reset: true };
  }
  return { state, acted: !!out, reset: false };
}

function advance(state, elapsed, end, rate, active) {
  finishTimedWork(state, end);
  const slices = elapsed <= 2 * 60 * 1000 ? Math.max(12, Math.ceil(elapsed / 2000)) : undefined;
  const opts = active ? { alsoManual: true, slices } : { slices };
  replayAway(state, elapsed, end, rate, opts);
  const data = dataPerSecond(state) * (elapsed / 1000) * rate;
  if (data > 0) state.data = (state.data || 0) + data;
}

function waitMs(state, now, cap) {
  let wait = cap;
  for (const st of state.biz || []) {
    const left = (st.commissionUntil || 0) - now;
    if (left > 0 && left < wait) wait = left;
  }
  const job = state.upgradeJob || state.researchJob || state.projectJob || state.refineJob;
  if (job?.readyAt) {
    const left = job.readyAt - now;
    if (left > 0 && left < wait) wait = left;
  }
  const income = incomePerSecond(state, now);
  if (income > 0) {
    const front = frontierEra(state);
    if (front > 0 && eraOpen(state, front - 1)) {
      const have = state.biz[front - 1]?.owned || 0;
      const cost = costOf(BUSINESSES[front - 1], have, 1, state);
      if (Number.isFinite(cost) && cost > state.cash) {
        const need = (cost - state.cash) / income * 1000;
        if (need > 0 && need < wait) wait = need;
      }
    }
    for (let i = BUSINESSES.length - 1; i >= 0; i--) {
      if (!canHireIndex(state, i) && state.biz[i]?.owned > 0 && !state.biz[i].manager) {
        const price = managerPrice(state, i);
        if (price > state.cash && income > 0) {
          const need = (price - state.cash) / income * 1000;
          if (need > 0 && need < wait) wait = need;
        }
      }
    }
  }
  return Math.max(250, wait);
}

function blankResult(profile) {
  return {
    profile,
    eras: {},
    eraOrder: [],
    firstPrestige: null,
    firstFork: null,
    quantum: null,
    elapsed: 0,
    playMs: 0,
    steps: 0,
    stopped: null,
    state: null,
  };
}

function done(result) {
  return result.firstFork != null && result.quantum != null;
}

export function runProfile(profile, options = {}) {
  const start = options.start ?? SIM_START;
  const maxElapsed = options.maxElapsed ?? MAX_ELAPSED_MS;
  let now = start;
  let state = freshState(now);
  const result = blankResult(profile);
  result.state = state;

  const session = profile === "idle" ? SESSION_MS : Infinity;
  const gap = profile === "idle" ? IDLE_GAP_MS : 0;
  let inSession = 0;

  while (result.elapsed < maxElapsed && result.steps < 2_000_000) {
    result.steps += 1;
    recordEra(result, state, result.elapsed);
    if (done(result)) break;

    // Spend as many actions as we can at this instant (prestige/fork may
    // replace state).
    let loops = 0;
    while (loops < 40) {
      loops += 1;
      const next = applyAct(state, now, result);
      state = next.state;
      result.state = state;
      if (!next.acted) break;
      recordEra(result, state, result.elapsed);
      if (done(result)) break;
    }
    if (done(result)) break;

    if (profile === "idle" && inSession >= session) {
      const away = Math.min(gap, OFFLINE_CAP_MS);
      advance(state, away, now + away, OFFLINE_RATE, false);
      now += away;
      result.elapsed += away;
      inSession = 0;
      continue;
    }

    const cap = profile === "active" ? ACTIVE_JUMP_MS : Math.min(ACTIVE_JUMP_MS, session - inSession || ACTIVE_JUMP_MS);
    const jump = Math.min(waitMs(state, now, cap), cap, maxElapsed - result.elapsed);
    if (!(jump > 0)) break;
    advance(state, jump, now + jump, 1, true);
    now += jump;
    result.elapsed += jump;
    result.playMs += jump;
    state.playMs = (state.playMs || 0) + jump;
    if (profile === "idle") inSession += jump;
  }

  recordEra(result, state, result.elapsed);
  if (!result.stopped) {
    if (done(result)) result.stopped = "done";
    else if (result.elapsed >= maxElapsed) result.stopped = "cap";
    else result.stopped = "steps";
  }
  return result;
}

export function runPacing(options = {}) {
  const active = runProfile("active", options);
  const idle = runProfile("idle", options);
  return { active, idle, startedAt: options.start ?? SIM_START };
}

export function reportMarkdown(run, { title = "Pacing report", note = "" } = {}) {
  const lines = [];
  lines.push(`# ${title}`);
  lines.push("");
  if (note) {
    lines.push(note);
    lines.push("");
  }
  lines.push(`Generated from the live game rules in \`src/lib\` (not a copy of the formulas).`);
  lines.push("");
  const profiles = [
    ["Nonstop (active)", run.active],
    ["Casual (idle sessions)", run.idle],
  ];
  for (const [label, r] of profiles) {
    lines.push(`## ${label}`);
    lines.push("");
    lines.push(`Stopped: ${r.stopped}. Elapsed ${formatDuration(r.elapsed)} (${r.elapsed} ms). Active play ${formatDuration(r.playMs)}.`);
    lines.push("");
    lines.push("| Milestone | Time |");
    lines.push("|---|---|");
    lines.push(`| First prestige | ${formatDuration(r.firstPrestige)} |`);
    lines.push(`| Nonstop to Quantum | ${formatDuration(r.quantum)} |`);
    lines.push(`| First fork | ${formatDuration(r.firstFork)} |`);
    lines.push("");
    lines.push("Era arrivals:");
    lines.push("");
    lines.push("| Era | Time |");
    lines.push("|---|---|");
    for (const row of r.eraOrder) {
      lines.push(`| ${row.name} | ${formatDuration(row.ms)} |`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}
