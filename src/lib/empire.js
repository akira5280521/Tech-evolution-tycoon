// Meta progression that sits on top of the era ladder: named upgrades, mastery,
// challenges, mega-projects, research, the token shop, boardroom events, and
// singularity. Every Empire Bonuses source multiplies, then a soft ceiling
// that rises with singularity points keeps the product finite.

import { blankTutorial } from "./tutorial.js";
import {
  BUSINESSES,
  COMMISSION_MS,
  MILESTONES,
  PROJECT_MS,
  RESEARCH_MS,
  SUPPLY_KEYS,
  UPGRADE_MS,
  blankSupply,
  blockedByGlass,
  costOf,
  indexOfBusiness,
  investorsFor,
  managerNeed,
  MAX_BUY,
  milestoneMult,
  milestoneSpeed,
  money,
  prestigeMult,
} from "./gameConfig.js";

export const SINGULARITY_MAX = 4;
export const DATA_PER_ERA = 0.008;
export const SPECIALTY_COST = 80;
// Speed gate, mastery bar and badge count live on each era in BUSINESSES, so
// the order of the rows can change without shifting these numbers.
export function speedNeed(index) {
  return BUSINESSES[index]?.speedNeed ?? 150;
}

export function masteryNeed(index) {
  return BUSINESSES[index]?.masteryNeed ?? 200;
}

// One click stops at the next milestone, speed gate, or mastery gate.
// Past every gate, the purchase is still bounded by MAX_BUY.
export function maxBuyCount(owned, index) {
  const have = Number.isFinite(owned) && owned > 0 ? Math.floor(owned) : 0;
  const gates = [];
  for (const ms of MILESTONES) if (ms.owned > have) gates.push(ms.owned);
  const speed = speedNeed(index);
  const mastery = masteryNeed(index);
  if (speed > have) gates.push(speed);
  if (mastery > have) gates.push(mastery);
  if (!gates.length) return MAX_BUY;
  return Math.max(1, Math.min(MAX_BUY, Math.min(...gates) - have));
}

// Fork 1, 2, 3… costs this many investors. The curve is meant to put the first
// fork around day 5-7 of active play and the x4 cap months out.
export function forkCost(points) {
  const n = Math.max(0, Math.floor(Number(points)) || 0) + 1;
  return Math.round(8500 * Math.pow(n, 1.85));
}


export function upgradeOffer(index) {
  const cfg = BUSINESSES[index];
  const names = cfg.upgrades || ["Revenue Upgrade", "Triple revenue.", "Speed Upgrade", "Twice the speed."];
  return {
    id: cfg.id,
    index,
    rev: {
      kind: "rev",
      name: names[0],
      blurb: names[1],
      badge: "X3 REV",
      cost: cfg.revCost ?? cfg.managerCost * 10,
      need: 0,
    },
    spd: {
      kind: "spd",
      name: names[2],
      blurb: names[3],
      badge: "2X SPD",
      cost: cfg.spdCost ?? cfg.managerCost * 200,
      need: speedNeed(index),
    },
  };
}

// Boardroom dilemmas. Each offers two shapes of the same moment. Effects:
//   tokens: era tokens   data: research data   cash: seconds of current income
//   boost: minutes of the x1.15 revenue boost
// Which dilemma appears is random, and the same one does not appear twice in a
// row. Each choice's reward is fixed.
export const DILEMMAS = [
  {
    id: "grant",
    title: "GOVERNMENT GRANT",
    text: "The Ministry of Computing offers a research grant - in two shapes.",
    choices: [
      { key: "a", label: "FILE THE PAPERWORK", effects: { tokens: 2 } },
      { key: "b", label: "SELL THE AUTOMATION", effects: { boost: 5 } },
    ],
  },
  {
    id: "patent",
    title: "PATENT TROLL",
    text: "A shell company claims it invented the on/off switch and wants a cut.",
    choices: [
      { key: "a", label: "FIGHT IT IN COURT", effects: { data: 20 } },
      { key: "b", label: "SETTLE AND CROSS-LICENSE", effects: { cash: 20 } },
    ],
  },
  {
    id: "expo",
    title: "COMPUTER EXPO",
    text: "You have a booth at the biggest trade show of the year.",
    choices: [
      { key: "a", label: "WORK THE CROWD", effects: { boost: 5 } },
      { key: "b", label: "SELL THE DEMO UNITS", effects: { cash: 25 } },
    ],
  },
  {
    id: "intern",
    title: "THE SUMMER INTERN",
    text: "A brilliant intern rewired the break-room toaster. Where do they go next?",
    choices: [
      { key: "a", label: "SEND THEM TO R&D", effects: { data: 25 } },
      { key: "b", label: "LEND THEM TO SALES", effects: { tokens: 3 } },
    ],
  },
  {
    id: "cover",
    title: "MAGAZINE COVER",
    text: "A computing magazine wants your flagship machine on the front page.",
    choices: [
      { key: "a", label: "DO THE PHOTO SHOOT", effects: { tokens: 3 } },
      { key: "b", label: "OPEN PRE-ORDERS", effects: { cash: 30 } },
    ],
  },
  {
    id: "overclock",
    title: "OVERCLOCK THE LINE",
    text: "The engineers swear the machines can run hotter. The fire marshal is less sure.",
    choices: [
      { key: "a", label: "PUSH IT", effects: { boost: 5 } },
      { key: "b", label: "LOG THE THERMALS", effects: { data: 15 } },
    ],
  },
  {
    id: "hackathon",
    title: "WEEKEND HACKATHON",
    text: "Local hackers want to use your servers for a 48-hour coding marathon.",
    choices: [
      { key: "a", label: "SPONSOR IT", effects: { tokens: 1, data: 15 } },
      { key: "b", label: "RENT THEM THE RACKS", effects: { cash: 20 } },
    ],
  },
  {
    id: "y2k",
    title: "MILLENNIUM BUG",
    text: "Clients panic that every clock will roll back to 1900 at midnight.",
    choices: [
      { key: "a", label: "PATCH EVERYTHING", effects: { data: 20 } },
      { key: "b", label: "SELL CONSULTING HOURS", effects: { cash: 30 } },
    ],
  },
];

export function dilemmaSpec(id) {
  return DILEMMAS.find((d) => d.id === id) || DILEMMAS[0];
}

function pickDilemma(lastId) {
  const pool = DILEMMAS.filter((d) => d.id !== lastId);
  return pool[Math.floor(Math.random() * pool.length)] || DILEMMAS[0];
}

export const SPECIALTIES = [
  { id: "scale", name: "SCALE", cost: SPECIALTY_COST, blurb: "+25% all income, forever." },
  { id: "velocity", name: "VELOCITY", cost: SPECIALTY_COST, blurb: "Every production cycle 8% faster, forever." },
  { id: "signal", name: "SIGNAL", cost: SPECIALTY_COST, blurb: "+10% all income, forever." },
];

export const CHALLENGES = [
  {
    id: "glass",
    name: "GLASS CEILING",
    blurb: "Vacuum Tubes only - no other era unlocks for the whole run.",
    goal: 450000000,
    reward: 0.1,
    limitMs: 0,
  },
  {
    id: "noboss",
    name: "NO BOSSES",
    blurb: "No managers - you fire every batch yourself, in any era.",
    goal: 850000000,
    reward: 0.1,
    limitMs: 0,
  },
  {
    id: "speed",
    name: "SPEEDRUN",
    blurb: "Earn this run's goal before the clock hits 90 minutes.",
    goal: 3200000000,
    reward: 0.1,
    limitMs: 90 * 60 * 1000,
  },
];

export const PROJECTS = [
  { id: "cable", name: "TRANSCONTINENTAL CABLE", blurb: "Career earnings reach $10.00B.", reward: 0.1, tokens: 20 },
  { id: "mainframe", name: "NATIONAL MAINFRAME", blurb: "Career earnings reach $1.00T.", reward: 0.1, tokens: 20 },
  { id: "orbital", name: "ORBITAL ARRAY", blurb: "Own 25 Quantum Servers at once.", reward: 0.1, tokens: 20, eras: ["quantum"] },
  // Later projects pay a smaller bonus each so the set stays inside the soft ceiling.
  { id: "arpanet", name: "ARPANET NODE", blurb: "Own 100 Punch Cards and 100 Transistors at once.", reward: 0.05, tokens: 15, eras: ["punchcards", "transistors"],
    check: (s) => owns(s, "punchcards", 100) && owns(s, "transistors", 100) },
  { id: "apollo", name: "APOLLO GUIDANCE COMPUTER", blurb: "Own 150 Integrated Circuits at once.", reward: 0.05, tokens: 15, eras: ["ics"],
    check: (s) => owns(s, "ics", 150) },
  { id: "homebrew", name: "HOMEBREW COMPUTER CLUB", blurb: "Own 100 each of Punch Cards, Transistors, Integrated Circuits, Microprocessors and Home Computers at once.", reward: 0.05, tokens: 15, eras: ["punchcards", "transistors", "ics", "cpu", "homepc"],
    check: (s) => ["punchcards", "transistors", "ics", "cpu", "homepc"].every((id) => owns(s, id, 100)) },
  { id: "y2k", name: "Y2K PATCH", blurb: "Career earnings reach $1.00Qa.", reward: 0.05, tokens: 15,
    check: (s) => (s.careerEarnings || 0) >= 1e15 },
  { id: "lan", name: "WORLD'S BIGGEST LAN PARTY", blurb: "Own 150 Graphics Cards and 150 RGB Battlestations at once.", reward: 0.05, tokens: 15, eras: ["gpu", "rgb"],
    check: (s) => owns(s, "gpu", 150) && owns(s, "rgb", 150) },
  { id: "timeline", name: "PARALLEL TIMELINE", blurb: "Fork the timeline once.", reward: 0.05, tokens: 15,
    check: (s) => (s.singularities || 0) >= 1 },
];

function owns(state, id, n) {
  return (state.biz?.[indexOfBusiness(id)]?.owned || 0) >= n;
}

// The furthest era the player has discovered: on screen now, or proven by a
// badge, mastery or Museum card from an earlier run. Everything up to it is
// discovered. Locked items for eras past it stay hidden ("???").
export function furthestRevealedEra(state) {
  const biz = state?.biz || [];
  const earned = new Set(state?.badgesEarned || []);
  const museum = state?.museum || [];
  let furthest = 0;
  BUSINESSES.forEach((cfg, i) => {
    const onScreen = i === 0 || (biz[i]?.owned || 0) > 0 || (biz[i - 1]?.owned || 0) > 0;
    const proven = earned.has(`era-${cfg.id}`) || earned.has(`master-${cfg.id}`) || museum.some((id) => id.startsWith(`${cfg.id}-`));
    if (onScreen || proven) furthest = i;
  });
  return furthest;
}

export function eraRevealed(state, index) {
  return index <= furthestRevealedEra(state);
}

export function projectRevealed(state, project) {
  if ((state?.projectsDone || []).includes(project.id)) return true;
  return (project.eras || []).every((id) => eraRevealed(state, indexOfBusiness(id)));
}

export const SHOP = [
  { id: "crate", name: "Daily Crate", cost: 0, blurb: "+6 era tokens, once each local day." },
  { id: "petty", name: "Petty Cash", cost: 18, blurb: "30 seconds of your current income. Costs 6 more tokens each time. Needs 40 tokens earned from play." },
  { id: "sample", name: "Research Sample", cost: 36, blurb: "+40 data. Up to 20 samples. Needs 70 tokens earned from play." },
  { id: "key", name: "Master Key", cost: 55, blurb: "The next manager you hire is free. Once. Needs 110 tokens earned from play." },
];

export function blankMeta() {
  return {
    careerEarnings: 0,
    singularities: 0,
    tokens: 0,
    grants: [],
    data: 0,
    specialties: [],
    upgrades: {},
    challengesDone: [],
    challenge: null,
    projectsDone: [],
    badgesEarned: [],
    shop: { freeManager: false, cashBuys: 0, samples: 0, crateDay: null },
    boostUntil: 0,
    dilemma: null,
    lastDilemma: null,
    museum: [],
    bubble: null,
    nextBubbleAt: 0,
    dilemmaDeferUntil: 0,
    nextDilemmaAt: 0,
    nextWindfallAt: 0,
    prestiged: false,
    supply: blankSupply(),
    foreman: false,
    sawPit: false,
    tutorial: blankTutorial(),
    orientation: "auto",
    researchJob: null,
    upgradeJob: null,
    projectJob: null,
  };
}

const SUPPLY_CAP = 1e9;

export function ensureSupply(state) {
  const next = blankSupply();
  const raw = state.supply && typeof state.supply === "object" ? state.supply : {};
  for (const key of SUPPLY_KEYS) {
    const n = raw[key];
    next[key] = typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.min(SUPPLY_CAP, n) : 0;
  }
  state.supply = next;
  return next;
}

// A dry machine still pays a floor so the bar never freezes on an empty bin.
export function supplyFactor(state, cfg) {
  if (!cfg?.uses) return 1;
  if (state?.challenge?.id === "glass" && cfg.id === "tubes") return 1;
  const supply = ensureSupply(state);
  let cover = 1;
  for (const [key, need] of Object.entries(cfg.uses)) {
    const want = Number(need) || 0;
    if (want <= 0) continue;
    cover = Math.min(cover, (supply[key] || 0) / want);
  }
  if (!Number.isFinite(cover) || cover < 0) cover = 0;
  return 0.15 + 0.85 * Math.min(1, cover);
}

// What one unit of a material row makes per cycle. The row's x3 upgrade
// triples the material as well as the pay, so early on each unit makes 1.
export const MATERIAL_UPGRADE_MULT = 3;
export function makesOf(state, cfg) {
  if (!cfg?.makes) return null;
  const mult = upgradesOf(state, cfg.id).rev ? MATERIAL_UPGRADE_MULT : 1;
  return Object.fromEntries(Object.entries(cfg.makes).map(([key, n]) => [key, (Number(n) || 0) * mult]));
}

function moveSupply(state, cfg, cycles, owned) {
  if (!cfg?.uses && !cfg?.makes) return;
  const supply = ensureSupply(state);
  const n = Number.isFinite(cycles) && cycles > 0 ? cycles : 0;
  const count = Number.isFinite(owned) && owned > 0 ? owned : 0;
  const skipDraw = state?.challenge?.id === "glass" && cfg.id === "tubes";
  if (cfg.uses && !skipDraw) {
    for (const [key, need] of Object.entries(cfg.uses)) {
      const want = (Number(need) || 0) * n;
      const have = supply[key] || 0;
      supply[key] = Math.max(0, have - Math.min(have, want));
    }
  }
  if (cfg.makes && count > 0) {
    for (const [key, make] of Object.entries(makesOf(state, cfg))) {
      const add = (Number(make) || 0) * count * n;
      const next = (supply[key] || 0) + add;
      supply[key] = Number.isFinite(next) ? Math.min(SUPPLY_CAP, Math.max(0, next)) : supply[key] || 0;
    }
  }
}

export function singularityMult(points) {
  const n = Math.max(0, Math.floor(Number(points)) || 0);
  if (!Number.isFinite(n)) return 1;
  return Math.min(SINGULARITY_MAX, 1 + n * 0.2);
}

export function specialtySlots(state) {
  return Math.min(SPECIALTIES.length, 1 + (state.singularities || 0));
}

export function upgradesOf(state, id) {
  return (state.upgrades && state.upgrades[id]) || { rev: false, spd: false };
}

export function isMastered(state, index) {
  const st = state.biz?.[index];
  if (!st || st.owned < masteryNeed(index)) return false;
  const up = upgradesOf(state, BUSINESSES[index].id);
  return !!(up.rev && up.spd);
}

export function masteredCount(state) {
  return BUSINESSES.reduce((n, _, i) => n + (isMastered(state, i) ? 1 : 0), 0);
}

export function establishedCount(state) {
  return (state.biz || []).reduce((n, st) => n + (st && st.owned > 0 ? 1 : 0), 0);
}

export function dataPerSecond(state) {
  return DATA_PER_ERA * establishedCount(state) + DATA_PER_ERA * masteredCount(state);
}

// Ceiling starts at 50 and rises by 6 for each singularity point (max 15
// points → 140). Income approaches that ceiling and never passes it.
export function incomeCeiling(points) {
  const n = Math.max(0, Math.min(15, Math.floor(Number(points)) || 0));
  return 50 + n * 6;
}

// Soft cap: the first bonuses count almost 1:1, then returns diminish, and
// the result stays strictly below the ceiling. Non-finite input becomes 1.
export function softenMultiplier(raw, points) {
  if (!Number.isFinite(raw) || raw <= 1) return 1;
  const ceiling = incomeCeiling(points);
  const span = ceiling - 1;
  const applied = 1 + span * (1 - Math.exp(-(raw - 1) / span));
  if (!Number.isFinite(applied)) return ceiling;
  return Math.min(ceiling, Math.max(1, applied));
}

// Permanent income bonus a challenge run actually keeps. Machines reset, so
// mastery from the empire you just left does not inflate the target. A live
// boost is left out too: it expires, and the goal must not.
export function challengeIncomeBonus(state) {
  const virtual = {
    investors: state?.investors || 0,
    singularities: state?.singularities || 0,
    challengesDone: state?.challengesDone || [],
    projectsDone: state?.projectsDone || [],
    specialties: state?.specialties || [],
    upgrades: state?.upgrades || {},
    biz: BUSINESSES.map(() => ({ owned: 0 })),
  };
  const total = empireFactors(virtual, 0).total;
  return Number.isFinite(total) && total >= 1 ? total : 1;
}

export function scaledChallengeGoal(spec, state) {
  const base = spec?.goal;
  if (!Number.isFinite(base) || base <= 0) return 0;
  const goal = base * challengeIncomeBonus(state);
  return Number.isFinite(goal) && goal > 0 ? goal : base;
}

// The goal locked in when the run started. An older save has no stored goal
// and keeps the original base number, so a run already underway does not move.
export function activeChallengeGoal(state) {
  const spec = CHALLENGES.find((entry) => entry.id === state?.challenge?.id);
  const stored = state?.challenge?.goal;
  if (typeof stored === "number" && Number.isFinite(stored) && stored > 0) return stored;
  return spec?.goal || 0;
}

// Investors, singularity, mastery, challenges, mega-projects, and research
// revenue specialties multiply together, then pass through the soft ceiling.
export function empireFactors(state, now = 0) {
  const investors = prestigeMult(state?.investors || 0);
  const singularity = singularityMult(state?.singularities || 0);
  const mastery = 1 + 0.05 * masteredCount(state);
  const challenges = 1 + 0.1 * ((state?.challengesDone || []).length);
  const projects = 1 + (state?.projectsDone || []).reduce((sum, id) => sum + (PROJECTS.find((p) => p.id === id)?.reward || 0), 0);
  let specialty = 1;
  const specs = state?.specialties || [];
  if (specs.includes("scale")) specialty *= 1.25;
  if (specs.includes("signal")) specialty *= 1.1;
  const raw = investors * singularity * mastery * challenges * projects * specialty;
  const safeRaw = Number.isFinite(raw) && raw > 0 ? raw : 1;
  const temp = now > 0 && now < (state?.boostUntil || 0) ? 1.15 : 1;
  const total = softenMultiplier(safeRaw * temp, state?.singularities || 0);
  return { investors, singularity, mastery, challenges, projects, specialty, raw: safeRaw, temp, total, ceiling: incomeCeiling(state?.singularities || 0) };
}

export function effectiveCycleMs(cfg, state) {
  const index = BUSINESSES.findIndex((entry) => entry.id === cfg?.id);
  const owned = index >= 0 ? state?.biz?.[index]?.owned || 0 : 0;
  const up = upgradesOf(state, cfg.id);
  let speed = up.spd ? 2 : 1;
  if ((state?.specialties || []).includes("velocity")) speed *= 1.08;
  speed *= milestoneSpeed(owned);
  return cfg.cycleMs / speed;
}

export function incomePerSecond(state, now = 0) {
  const mult = empireFactors(state, now).total;
  let sum = 0;
  (state.biz || []).forEach((st, i) => {
    if (!st || st.owned <= 0) return;
    if (!st.manager && !st.running) return;
    const cfg = BUSINESSES[i];
    const up = upgradesOf(state, cfg.id);
    const rev = up.rev ? 3 : 1;
    sum += (cfg.revenue * rev * st.owned * milestoneMult(st.owned) * mult * supplyFactor(state, cfg) * 1000) / effectiveCycleMs(cfg, state);
  });
  return sum;
}

export function creditCycles(state, index, cycles, now = 0) {
  if (cycles <= 0) return 0;
  const cfg = BUSINESSES[index];
  const st = state.biz?.[index];
  if (!st || st.owned <= 0) return 0;
  const rev = upgradesOf(state, cfg.id).rev ? 3 : 1;
  const factor = supplyFactor(state, cfg);
  moveSupply(state, cfg, cycles, st.owned);
  const amount = cycles * cfg.revenue * rev * st.owned * milestoneMult(st.owned) * empireFactors(state, now).total * factor;
  return creditAmount(state, amount, now);
}

export function creditAmount(state, amount, now = 0) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (!Number.isFinite(state.cash) || !Number.isFinite(state.lifetime)) return 0;
  state.cash += amount;
  state.lifetime += amount;
  state.careerEarnings = (state.careerEarnings || 0) + amount;
  if (state.challenge) {
    state.challenge.earnings += amount;
    const spec = CHALLENGES.find((c) => c.id === state.challenge.id);
    if (spec && state.challenge.earnings >= activeChallengeGoal(state)) {
      const elapsed = now - state.challenge.startedAt;
      if (!spec.limitMs || (now > 0 && elapsed <= spec.limitMs)) completeChallenge(state);
    }
  }
    // Honor the payout's own clock. Offline slices pass a past moment; a
    // missing clock means "right now" so a shop or windfall still finishes work.
    completeProjects(state, now > 1e11 ? now : Date.now());
    return amount;
}

export function grantTokens(state, id, amount) {
  if (!Array.isArray(state.grants)) state.grants = [];
  if (state.grants.includes(id)) return false;
  state.grants.push(id);
  state.tokens = (state.tokens || 0) + amount;
  return true;
}

export function notePurchase(state, index, before, after) {
  const id = BUSINESSES[index].id;
  if (before <= 0 && after > 0) grantTokens(state, `era:${id}`, 5);
  for (const ms of MILESTONES) {
    if (before < ms.owned && after >= ms.owned) grantTokens(state, `ms:${id}:${ms.owned}`, 2);
  }
}

function completeChallenge(state) {
  const id = state.challenge?.id;
  if (!id) return;
  if (!(state.challengesDone || []).includes(id)) {
    state.challengesDone = [...(state.challengesDone || []), id];
    grantTokens(state, `challenge:${id}`, 12);
  }
  state.challenge = null;
  state.modStamp = (state.modStamp || 0) + 1;
}

export function failChallenge(state) {
  if (!state.challenge) return false;
  state.challenge = null;
  return true;
}

function projectReady(state, id) {
  if ((state.projectsDone || []).includes(id)) return false;
  if (id === "cable") return (state.careerEarnings || 0) >= 1e10;
  if (id === "mainframe") return (state.careerEarnings || 0) >= 1e12;
  if (id === "orbital") return (state.biz?.[indexOfBusiness("quantum")]?.owned || 0) >= 25;
  const spec = PROJECTS.find((p) => p.id === id);
  return !!spec?.check?.(state);
}

function timedJob(job) {
  if (!job || typeof job !== "object") return null;
  if (!Number.isFinite(job.readyAt) || !Number.isFinite(job.startedAt)) return null;
  if (job.readyAt < job.startedAt) return null;
  return job;
}

function copyTimedJob(job) {
  const clean = timedJob(job);
  return clean ? { ...clean } : null;
}

export function beginResearch(state, id, now) {
  if (timedJob(state.researchJob)) return false;
  if (!canCommit(state, id)) return false;
  state.researchJob = { id, startedAt: now, readyAt: now + RESEARCH_MS };
  state.modStamp = (state.modStamp || 0) + 1;
  return true;
}

function applyUpgradeFlag(state, index, kind) {
  const cfg = BUSINESSES[index];
  if (!cfg || (kind !== "rev" && kind !== "spd")) return false;
  const up = { ...upgradesOf(state, cfg.id) };
  if (up[kind]) return false;
  up[kind] = true;
  state.upgrades = { ...(state.upgrades || {}), [cfg.id]: up };
  state.modStamp = (state.modStamp || 0) + 1;
  return true;
}

// Spend now, install over a visible timer. The tick applies the flag.
export function buyUpgrade(state, index, kind, now = Date.now()) {
  if (timedJob(state.upgradeJob)) return false;
  const offer = upgradeOffer(index);
  const piece = offer?.[kind];
  if (!piece) return false;
  const up = upgradesOf(state, offer.id);
  if (up[kind]) return false;
  const owned = state.biz?.[index]?.owned || 0;
  if (owned < piece.need) return false;
  if (!(state.cash >= piece.cost) || !Number.isFinite(piece.cost)) return false;
  state.cash -= piece.cost;
  // id as well as index, so a save still finds the row if the rows are reordered.
  state.upgradeJob = { index, id: BUSINESSES[index].id, kind, startedAt: now, readyAt: now + UPGRADE_MS };
  state.modStamp = (state.modStamp || 0) + 1;
  return true;
}

export function finishTimedWork(state, now) {
  const notes = [];
  if (!Number.isFinite(now) || now < 1e11) return notes;
  const research = timedJob(state.researchJob);
  state.researchJob = research;
  if (research && now >= research.readyAt) {
    state.researchJob = null;
    if (commitSpecialty(state, research.id)) notes.push({ type: "research", id: research.id });
  }
  const upgrade = timedJob(state.upgradeJob);
  state.upgradeJob = upgrade;
  if (upgrade && now >= upgrade.readyAt) {
    state.upgradeJob = null;
    if (applyUpgradeFlag(state, upgrade.index, upgrade.kind)) notes.push({ type: "upgrade" });
  }
  const project = timedJob(state.projectJob);
  state.projectJob = project;
  if (project && now >= project.readyAt) {
    state.projectJob = null;
    if (!(state.projectsDone || []).includes(project.id)) {
      const spec = PROJECTS.find((entry) => entry.id === project.id);
      state.projectsDone = [...(state.projectsDone || []), project.id];
      if (spec) grantTokens(state, `project:${project.id}`, spec.tokens);
      state.modStamp = (state.modStamp || 0) + 1;
      notes.push({ type: "project", id: project.id });
    }
  }
  if (!state.projectJob) {
    for (const entry of PROJECTS) {
      if (!projectReady(state, entry.id)) continue;
      state.projectJob = { id: entry.id, startedAt: now, readyAt: now + PROJECT_MS };
      notes.push({ type: "projectstart", id: entry.id });
      break;
    }
  }
  return notes;
}

export function completeProjects(state, now = Date.now()) {
  finishTimedWork(state, now);
}

export function pettyCost(state) {
  return 18 + (state.shop?.cashBuys || 0) * 6;
}

// Tokens that came from play, not from opening the daily crate.
export function gameplayTokens(state) {
  let n = 0;
  for (const id of state.grants || []) {
    if (id.startsWith("era:")) n += 5;
    else if (id.startsWith("ms:")) n += 2;
    else if (id.startsWith("challenge:")) n += 12;
    else if (id.startsWith("project:")) n += 20;
  }
  return n;
}

const SHOP_EARNED = { petty: 40, sample: 70, key: 110 };

export function shopQuote(state, id, now = Date.now()) {
  const item = SHOP.find((entry) => entry.id === id);
  if (!item || !state.shop) return { ok: false, reason: "Unknown item." };
  if (id === "crate") {
    const { localDayKey } = dayHelpers(now);
    if (state.shop.crateDay === localDayKey) return { ok: false, reason: "The crate was already opened today.", cost: 0 };
    return { ok: true, cost: 0 };
  }
  const earnedNeed = SHOP_EARNED[id] || 0;
  const earned = gameplayTokens(state);
  const cost = id === "petty" ? pettyCost(state) : item.cost;
  if (earned < earnedNeed) {
    return { ok: false, reason: `Earn ${earnedNeed} tokens from play first (${earned} so far). The daily crate does not count.`, cost };
  }
  if (id === "key" && state.shop.freeManager) return { ok: false, reason: "You already hold a Master Key.", cost };
  if (id === "sample" && (state.shop.samples || 0) >= 20) return { ok: false, reason: "No samples left.", cost };
  if ((state.tokens || 0) < cost) return { ok: false, reason: "Not enough era tokens.", cost };
  return { ok: true, cost };
}

function dayHelpers(now) {
  const d = new Date(now);
  const localDayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { localDayKey };
}

export function buyShopItem(state, id, now = Date.now()) {
  const quote = shopQuote(state, id, now);
  if (!quote.ok) return quote;
  state.tokens -= quote.cost;
  if (id === "crate") {
    state.shop.crateDay = dayHelpers(now).localDayKey;
    state.tokens += 6;
    return { ok: true, cost: 0, detail: "The daily crate held 6 era tokens." };
  }
  if (id === "petty") {
    const gain = Math.max(100, incomePerSecond(state, now) * 30);
    creditAmount(state, gain, now);
    state.shop.cashBuys = (state.shop.cashBuys || 0) + 1;
    return { ok: true, cost: quote.cost, detail: `Petty cash pays ${money(gain)}.` };
  }
  if (id === "sample") {
    state.data = (state.data || 0) + 40;
    state.shop.samples = (state.shop.samples || 0) + 1;
    return { ok: true, cost: quote.cost, detail: "Research sample: +40 data." };
  }
  state.shop.freeManager = true;
  return { ok: true, cost: quote.cost, detail: "The next manager is free." };
}

export function canCommit(state, id) {
  if (timedJob(state.researchJob)) return false;
  if (!SPECIALTIES.some((entry) => entry.id === id)) return false;
  if ((state.specialties || []).includes(id)) return false;
  if ((state.specialties || []).length >= specialtySlots(state)) return false;
  if ((state.data || 0) < SPECIALTY_COST) return false;
  return true;
}

export function commitSpecialty(state, id) {
  if (!canCommit(state, id)) return false;
  state.data -= SPECIALTY_COST;
  state.specialties = [...(state.specialties || []), id];
  state.modStamp = (state.modStamp || 0) + 1;
  return true;
}

export function managerPrice(state, index) {
  if (state.shop?.freeManager) return 0;
  return BUSINESSES[index].managerCost;
}

export function canHireIndex(state, index) {
  const st = state.biz?.[index];
  if (!st || st.manager || st.owned < managerNeed(index)) return false;
  if (state.challenge?.id === "noboss") return false;
  return state.cash >= managerPrice(state, index);
}

export function canBuyIndex(state, index) {
  if (blockedByGlass(state, index)) return false;
  if (index > 0 && !(state.biz?.[index - 1]?.owned > 0 || state.biz?.[index]?.owned > 0)) return false;
  return true;
}

// Owned counts for the tech-era badges. Early eras clear in minutes; the
// later counts sit well past the first purchase, into hours and days.
const badgeOwned = (index) => BUSINESSES[index]?.badgeOwned ?? 25;
const LIFE_BADGES = [
  { id: "life-1", legacy: 1e3, need: 1e6, label: "$1.00M" },
  { id: "life-2", legacy: 1e6, need: 1e9, label: "$1.00B" },
  { id: "life-3", legacy: 1e9, need: 1e12, label: "$1.00T" },
  { id: "life-4", legacy: 1e12, need: 1e15, label: "$1.00Qa" },
  { id: "life-5", legacy: 1e15, need: 1e18, label: "$1.00Qi" },
];
const PROJECT_BADGES = [
  { id: "cable", legacy: 1e10, need: 1e13, label: "$10.00T" },
  { id: "mainframe", legacy: 1e12, need: 1e15, label: "$1.00Qa" },
  { id: "orbital", legacyOwned: 25, needOwned: 120 },
];

const BADGE_DEFS = [
  ...BUSINESSES.map((cfg, index) => ({
    id: `era-${cfg.id}`,
    group: "TECH ERAS",
    name: cfg.name,
    desc: `Own ${badgeOwned(index)} ${cfg.name}`,
    icon: cfg.icon,
    era: index,
    earned: (s) => (s.biz?.[index]?.owned || 0) >= badgeOwned(index),
  })),
  ...BUSINESSES.map((cfg, index) => ({
    id: `master-${cfg.id}`,
    group: "MASTERY",
    name: `${cfg.name} Mastery`,
    desc: "Reach this era's mastery count and buy both upgrades",
    icon: cfg.icon,
    era: index,
    earned: (s) => isMastered(s, index),
  })),
  ...LIFE_BADGES.map((row) => ({
    id: row.id,
    group: "LIFETIME",
    name: row.label,
    desc: `Career earnings reach ${row.label}`,
    earned: (s) => (s.careerEarnings || 0) >= row.need,
  })),
  ...CHALLENGES.map((c) => ({
    id: `ch-${c.id}`,
    group: "CHALLENGES",
    name: c.name,
    desc: "Win this challenge run",
    earned: (s) => (s.challengesDone || []).includes(c.id),
  })),
  ...PROJECT_BADGES.map((row) => {
    const project = PROJECTS.find((p) => p.id === row.id);
    const desc = row.needOwned
      ? `Own ${row.needOwned} Quantum Servers at once`
      : `Career earnings reach ${row.label}`;
    return {
      id: `pr-${row.id}`,
      group: "MEGA-PROJECTS",
      name: project.name,
      desc,
      era: row.needOwned ? indexOfBusiness("quantum") : undefined,
      earned: (s) => (row.needOwned
        ? (s.biz?.[indexOfBusiness("quantum")]?.owned || 0) >= row.needOwned
        : (s.careerEarnings || 0) >= row.need),
    };
  }),
  {
    id: "time-prestige",
    group: "TIMELINE",
    name: "First Investor",
    desc: "Prestige at least once",
    earned: (s) => !!s.prestiged,
  },
  {
    id: "time-board",
    group: "TIMELINE",
    name: "Full Board",
    desc: "Bank enough investors to fork the timeline",
    earned: (s) => (s.investors || 0) >= forkCost(0),
  },
  {
    id: "time-fork",
    group: "TIMELINE",
    name: "Collapse",
    desc: "Fork the timeline once",
    earned: (s) => (s.singularities || 0) >= 1,
  },
  {
    id: "time-lab",
    group: "TIMELINE",
    name: "Specialty",
    desc: "Pick two research bonuses",
    earned: (s) => (s.specialties || []).length >= 2,
  },
  {
    id: "time-streak",
    group: "TIMELINE",
    name: "Fortnight on the Floor",
    desc: "Keep a 14 day briefing streak",
    earned: (s) => (s.streak || 0) >= 14,
  },
];

// Badges a save already showed before the thresholds moved. Evaluated once,
// then stored, so a raised bar never takes a collected badge away.
export function legacyBadgeIds(state) {
  const ids = [];
  BUSINESSES.forEach((cfg, index) => {
    if ((state.biz?.[index]?.owned || 0) > 0) ids.push(`era-${cfg.id}`);
    if (isMastered(state, index)) ids.push(`master-${cfg.id}`);
  });
  for (const row of LIFE_BADGES) {
    if ((state.careerEarnings || 0) >= row.legacy) ids.push(row.id);
  }
  for (const c of CHALLENGES) {
    if ((state.challengesDone || []).includes(c.id)) ids.push(`ch-${c.id}`);
  }
  for (const row of PROJECT_BADGES) {
    const byProject = (state.projectsDone || []).includes(row.id);
    const byLegacy = row.legacyOwned
      ? (state.biz?.[indexOfBusiness("quantum")]?.owned || 0) >= row.legacyOwned
      : (state.careerEarnings || 0) >= row.legacy;
    if (byProject || byLegacy) ids.push(`pr-${row.id}`);
  }
  if (state.prestiged) ids.push("time-prestige");
  if ((state.investors || 0) >= forkCost(0)) ids.push("time-board");
  if ((state.singularities || 0) >= 1) ids.push("time-fork");
  if ((state.specialties || []).length >= 1) ids.push("time-lab");
  if ((state.streak || 0) >= 7) ids.push("time-streak");
  return ids;
}

export function collectBadges(state) {
  const held = new Set(Array.isArray(state.badgesEarned) ? state.badgesEarned : []);
  let changed = false;
  for (const badge of BADGE_DEFS) {
    if (!held.has(badge.id) && badge.earned(state)) {
      held.add(badge.id);
      changed = true;
    }
  }
  if (changed || !Array.isArray(state.badgesEarned)) state.badgesEarned = [...held];
  return changed;
}

export function badgeList(state) {
  const held = new Set(state.badgesEarned || []);
  const furthest = furthestRevealedEra(state);
  return BADGE_DEFS.map((badge) => {
    const earned = held.has(badge.id) || !!badge.earned(state);
    return {
      id: badge.id,
      group: badge.group,
      name: badge.name,
      desc: badge.desc,
      icon: badge.icon || "",
      earned,
      // Badges for eras the player hasn't discovered yet don't give them away.
      hidden: !earned && badge.era !== undefined && badge.era > furthest,
    };
  });
}

export function tickDilemma(state, now) {
  const notes = [];
  if (!state.nextDilemmaAt) state.nextDilemmaAt = now + 60 * 1000;
  if (!state.nextWindfallAt) state.nextWindfallAt = now + 45 * 1000;
  if (state.dilemma && now >= state.dilemma.expiresAt) {
    state.dilemma = null;
    state.nextDilemmaAt = now + 6 * 60 * 1000;
    notes.push({ type: "expire" });
  }
  // The guided start runs one thing at a time: dilemmas wait until it ends.
  const tutorialRunning = !!state.tutorial && !state.tutorial.done && !state.tutorial.skipped;
  if (tutorialRunning && !state.dilemma) {
    state.nextDilemmaAt = Math.max(state.nextDilemmaAt || 0, now + 60 * 1000);
  }
  if (!tutorialRunning && !state.dilemma && now >= (state.dilemmaDeferUntil || 0) && now >= (state.nextDilemmaAt || 0)) {
    const pick = pickDilemma(state.lastDilemma);
    state.lastDilemma = pick.id;
    state.dilemma = { id: pick.id, expiresAt: now + 45 * 1000 };
    notes.push({ type: "dilemma" });
  }
  if (now >= (state.nextWindfallAt || 0) && incomePerSecond(state, now) > 0) {
    const amount = Math.max(100, incomePerSecond(state, now) * 30);
    creditAmount(state, amount, now);
    state.nextWindfallAt = now + 4 * 60 * 1000;
    notes.push({ type: "windfall", amount });
  }
  if (state.challenge?.id === "speed") {
    const spec = CHALLENGES.find((c) => c.id === "speed");
    // A run that reached the goal in time was already completed by creditAmount.
    // Anything still open past the limit has failed, even if earnings crossed
    // the goal late; otherwise the run could never close.
    if (now - state.challenge.startedAt > spec.limitMs) {
      notes.push({ type: "speedfail", goal: activeChallengeGoal(state) });
      failChallenge(state);
    }
  }
  return notes;
}

// Plain-language summary of a choice, for the modal and the toast.
export function describeEffects(effects) {
  const parts = [];
  if (effects.tokens) parts.push(`+${effects.tokens} era token${effects.tokens === 1 ? "" : "s"}`);
  if (effects.data) parts.push(`+${effects.data} data`);
  if (effects.cash) parts.push(`${effects.cash} seconds of income`);
  if (effects.boost) parts.push(`Income x1.15 for ${effects.boost} minutes`);
  return parts.join(", ");
}

export function resolveDilemma(state, choice, now) {
  if (!state.dilemma) return null;
  const spec = dilemmaSpec(state.dilemma.id);
  // Old saves sent "tokens"/"boost"; map them to the grant's two choices.
  const key = choice === "tokens" ? "a" : choice === "boost" ? "b" : choice;
  const picked = spec.choices.find((c) => c.key === key);
  if (picked) {
    state.dilemma = null;
    state.nextDilemmaAt = now + 6 * 60 * 1000;
    const fx = picked.effects;
    const summary = describeEffects(fx);
    if (fx.tokens) state.tokens = (state.tokens || 0) + fx.tokens;
    if (fx.data) state.data = (state.data || 0) + fx.data;
    if (fx.cash) creditAmount(state, Math.max(100, incomePerSecond(state, now) * fx.cash), now);
    if (fx.boost) state.boostUntil = Math.max(state.boostUntil || 0, now) + fx.boost * 60 * 1000;
    state.modStamp = (state.modStamp || 0) + 1;
    return { type: "choice", title: picked.label, summary };
  }
  state.dilemma = null;
  state.dilemmaDeferUntil = now + 5 * 60 * 1000;
  state.nextDilemmaAt = state.dilemmaDeferUntil;
  return { type: "defer" };
}

export function snapshotMeta(state, options = {}) {
  collectBadges(state);
  // Cash upgrades belong to the run. Prestige, fork and a challenge clear them
  // so they are bought again. An in-flight upgrade job is the same kind of
  // purchase: carrying it would install that upgrade on the fresh run for free.
  const resetRunUpgrades = !!options.resetRunUpgrades;
  return {
    investors: state.investors || 0,
    careerEarnings: state.careerEarnings || 0,
    singularities: state.singularities || 0,
    tokens: state.tokens || 0,
    grants: [...(state.grants || [])],
    data: state.data || 0,
    specialties: [...(state.specialties || [])],
    upgrades: resetRunUpgrades ? {} : JSON.parse(JSON.stringify(state.upgrades || {})),
    challengesDone: [...(state.challengesDone || [])],
    projectsDone: [...(state.projectsDone || [])],
    shop: { ...(state.shop || blankMeta().shop) },
    boostUntil: state.boostUntil || 0,
    dilemmaDeferUntil: state.dilemmaDeferUntil || 0,
    lastDilemma: state.lastDilemma || null,
    nextDilemmaAt: state.nextDilemmaAt || 0,
    nextWindfallAt: state.nextWindfallAt || 0,
    prestiged: !!state.prestiged,
    streak: state.streak || 1,
    briefingDay: state.briefingDay || null,
    badgesEarned: [...(state.badgesEarned || [])],
    museum: [...(state.museum || [])],
    nextBubbleAt: state.nextBubbleAt || 0,
    supply: { ...ensureSupply(state) },
    foreman: !!state.foreman,
    sawPit: !!state.sawPit,
    tutorial: { ...(state.tutorial || blankTutorial()), seen: [...(state.tutorial?.seen || [])], tips: [...(state.tutorial?.tips || [])] },
    orientation: state.orientation === "portrait" || state.orientation === "landscape" ? state.orientation : "auto",
    // Research and projects are permanent, so a job already paid for keeps its
    // clock. A cash-upgrade job does not: the fresh run would install it free.
    // A copy, not the live object, so the old state cannot clear the new job.
    researchJob: copyTimedJob(state.researchJob),
    upgradeJob: resetRunUpgrades ? null : copyTimedJob(state.upgradeJob),
    projectJob: copyTimedJob(state.projectJob),
    modStamp: (state.modStamp || 0) + 1,
  };
}

export function investorsReady(state) {
  return investorsFor(state.lifetime || 0);
}

// Ticker headlines, each tied to the era it belongs to, so the news never
// runs ahead of history. "always" lines fit any time; "prestige" lines need
// at least one prestige.
export const HEADLINES = [
  { era: "always", text: "MINISTRY OF COMPUTING ANNOUNCES A GRANT" },
  { era: "timber", text: "SPRING LOG DRIVE REACHES THE PAPER MILL" },
  { era: "paper", text: "PAPER MILL SWITCHES FROM RAGS TO WOOD PULP" },
  { era: "loom", text: "LYON WEAVERS PROTEST THE CARD-READING LOOM" },
  { era: "loom", text: "THE DRAW BOY'S JOB GOES TO A CHAIN OF CARDS" },
  { era: "punchcards", text: "CENSUS COUNTED IN WEEKS, NOT YEARS" },
  { era: "punchcards", text: "PUNCH CARDS JAM, PROFITS DO NOT" },
  { era: "sand", text: "SILICA SAND LEAVES THE PIT BY THE TONNE" },
  { era: "copper", text: "COPPER PRICES TICK UP, MINERS TICK DOWN" },
  { era: "glass", text: "GLASSBLOWERS RACE THE NEW RIBBON MACHINE" },
  { era: "filament", text: "TUNGSTEN WIRE FINALLY BENDS WITHOUT SNAPPING" },
  { era: "tubes", text: "VACUUM TUBES STILL WARM IN THE BACK ROOM" },
  { era: "tubes", text: "NEW COMPUTER FILLS AN ENTIRE ROOM, STILL WANTS MORE" },
  { era: "tubes", text: "MOTH FOUND IN A RELAY, ENGINEERS LOG THE FIRST BUG" },
  { era: "germanium", text: "GERMANIUM CRYSTALS GROWN FOR THE NEW TRANSISTOR" },
  { era: "transistors", text: "POCKET RADIO GOES ON SALE IN TIME FOR CHRISTMAS" },
  { era: "silicon", text: "SILICON TAKES THE HEAT GERMANIUM COULDN'T" },
  { era: "wafers", text: "WAFER BENCH WORKERS DEMAND BETTER STOOLS" },
  { era: "ics", text: "MOON LANDING CREDITS YOUR GUIDANCE CHIPS" },
  { era: "ics", text: "FAB LINE SUPERVISOR DENIES ANY LEAK" },
  { era: "cpu", text: "CALCULATOR MAKER ORDERS A CHIP THAT CAN DO ANYTHING" },
  { era: "cpu", text: "MICROPROCESSORS PRINT OVERTIME" },
  { era: "homepc", text: "THREE HOME COMPUTERS LAUNCH IN ONE YEAR" },
  { era: "homepc", text: "EXPERTS: 640K SHOULD BE ENOUGH FOR ANYBODY" },
  { era: "homepc", text: "INTERN REWIRES TOASTER, PATENTS PENDING" },
  { era: "homepc", text: "DIAL-UP SCREECH NAMED CITY'S NEW ANTHEM" },
  { era: "gpu", text: "PRICES SOAR AS GAMERS CHASE THE NEXT FRAME" },
  { era: "gpu", text: "MILLENNIUM BUG FAILS TO BITE" },
  { era: "gpu", text: "LAN PARTY ENTERS DAY THREE, PIZZA SUPPLY HOLDS" },
  { era: "rgb", text: "RGB FANS AUDIBLE FROM ORBIT" },
  { era: "rgb", text: "GPU SHORTAGE: GAMERS QUEUE AROUND THE BLOCK" },
  { era: "quantum", text: "QUANTUM CHANDELIER OBSERVED PAYING DIVIDENDS" },
  { era: "quantum", text: "QUANTUM SERVER BOTH ON AND OFF, ANALYSTS SAY" },
  { era: "prestige", text: "INVESTORS ASK IF THE TIMELINE CAN BE FORKED" },
];

// How many headlines run at once: the newest eras first, so the ticker talks
// about what's happening now rather than the 1890 census forever.
const HEADLINE_COUNT = 8;

// The furthest era owned in this run (-1 if none).
export function currentEraIndex(state) {
  const biz = state?.biz || [];
  for (let i = biz.length - 1; i >= 0; i--) if ((biz[i]?.owned || 0) > 0) return i;
  return -1;
}

// Headlines for where the player is in history right now.
export function headlinesFor(state) {
  const reached = currentEraIndex(state);
  const indexOf = (id) => BUSINESSES.findIndex((cfg) => cfg.id === id);
  const dated = HEADLINES
    .map((h) => ({ ...h, at: indexOf(h.era) }))
    .filter((h) => h.at >= 0 && h.at <= reached)
    .sort((a, b) => b.at - a.at)
    .slice(0, HEADLINE_COUNT)
    .map((h) => h.text);
  const extra = HEADLINES.filter((h) => h.era === "always" || (h.era === "prestige" && (state?.prestiged || (state?.investors || 0) > 0))).map((h) => h.text);
  const lines = [...dated, ...extra];
  return lines.length ? lines : [HEADLINES[0].text];
}
