// Meta progression that sits on top of the era ladder: named upgrades, mastery,
// challenges, mega-projects, research, the token shop, boardroom events, and
// singularity. Every Empire Bonuses source multiplies, then a soft ceiling
// that rises with singularity points keeps the product finite.

import {
  BUSINESSES,
  MILESTONES,
  costOf,
  investorsFor,
  milestoneMult,
  money,
  prestigeMult,
} from "./gameConfig.js";

export const SINGULARITY_MAX = 4;
export const DATA_PER_ERA = 0.008;
export const SPECIALTY_COST = 80;
// Per era, cheapest first. Tubes are easy to stack, so their bar is higher.
// Punch cards scale steeply, so theirs is lower. Every era should be finishable
// within a few weeks of active play.
const SPEED_NEED = [120, 36, 42, 50, 65, 85, 110, 130, 155];
const MASTERY_NEED = [190, 52, 60, 72, 90, 115, 145, 175, 210];

export function speedNeed(index) {
  return SPEED_NEED[index] ?? 150;
}

export function masteryNeed(index) {
  return MASTERY_NEED[index] ?? 200;
}

// Fork 1, 2, 3… costs this many investors. The curve is meant to put the first
// fork around day 5-7 of active play and the x4 cap months out.
export function forkCost(points) {
  const n = Math.max(0, Math.floor(Number(points)) || 0) + 1;
  return Math.round(17000 * Math.pow(n, 1.85));
}

const UPGRADE_NAMES = [
  ["Tungsten Filaments", "Hotter filaments, brighter valves - the batch fetches triple.", "Batch Soldering", "Pre-tinned boards fire in half the time."],
  ["Steel Hoppers", "The card path stops jamming. Every stack pays triple.", "Gang Punch", "One stroke cuts a whole row. Cycles run twice as fast."],
  ["Doped Wafers", "Cleaner junctions, triple the yield from each wafer.", "Wave Soldering", "The line never waits on a hand iron. Twice the speed."],
  ["Gold Bond Wire", "The leads stop failing. Revenue from each die triples.", "Stepper Align", "Masks land true. The fab cycle is cut in half."],
  ["Microcode Cache", "The chip stops fetching from the slow path. Triple revenue.", "Pipelined Clock", "Instructions overlap. The cycle time is halved."],
  ["Bundled Software", "Every desk ships with a reason to buy. Triple revenue.", "Assembly Jig", "Cases close themselves. The line runs twice as fast."],
  ["Shader Cores", "More pixels per die. Graphics revenue triples.", "Binning Pass", "Good chips leave the tester sooner. Twice the speed."],
  ["Addressable LEDs", "The glow is the product. Revenue triples.", "Fan Curves", "Thermals stay quiet. Cycles complete twice as fast."],
  ["Cryo Loops", "The chandelier stays cold. Quantum revenue triples.", "Error Correction", "Fewer shots are wasted. The cycle is cut in half."],
];

export function upgradeOffer(index) {
  const cfg = BUSINESSES[index];
  const names = UPGRADE_NAMES[index];
  return {
    id: cfg.id,
    index,
    rev: {
      kind: "rev",
      name: names[0],
      blurb: names[1],
      badge: "X3 REV",
      cost: cfg.managerCost * 10,
      need: 0,
    },
    spd: {
      kind: "spd",
      name: names[2],
      blurb: names[3],
      badge: "2X SPD",
      cost: cfg.managerCost * 200,
      need: speedNeed(index),
    },
  };
}

export const SPECIALTIES = [
  { id: "scale", name: "SCALE", cost: SPECIALTY_COST, blurb: "+25% all revenue, forever." },
  { id: "velocity", name: "VELOCITY", cost: SPECIALTY_COST, blurb: "Every production cycle 8% faster, forever." },
  { id: "signal", name: "SIGNAL", cost: SPECIALTY_COST, blurb: "+10% all revenue, forever." },
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
    blurb: "Earn $3.20B this run before the clock hits 90 minutes.",
    goal: 3200000000,
    reward: 0.1,
    limitMs: 90 * 60 * 1000,
  },
];

export const PROJECTS = [
  { id: "cable", name: "TRANSCONTINENTAL CABLE", blurb: "Career earnings reach $10.00B.", reward: 0.1, tokens: 20 },
  { id: "mainframe", name: "NATIONAL MAINFRAME", blurb: "Career earnings reach $1.00T.", reward: 0.1, tokens: 20 },
  { id: "orbital", name: "ORBITAL ARRAY", blurb: "Own 25 Quantum Servers at once.", reward: 0.1, tokens: 20 },
];

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
    shop: { freeManager: false, cashBuys: 0, samples: 0, crateDay: null },
    boostUntil: 0,
    dilemma: null,
    dilemmaDeferUntil: 0,
    nextDilemmaAt: 0,
    nextWindfallAt: 0,
    prestiged: false,
  };
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

// Investors, singularity, mastery, challenges, mega-projects, and research
// revenue specialties multiply together, then pass through the soft ceiling.
export function empireFactors(state, now = 0) {
  const investors = prestigeMult(state?.investors || 0);
  const singularity = singularityMult(state?.singularities || 0);
  const mastery = 1 + 0.05 * masteredCount(state);
  const challenges = 1 + 0.1 * ((state?.challengesDone || []).length);
  const projects = 1 + 0.1 * ((state?.projectsDone || []).length);
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
  const up = upgradesOf(state, cfg.id);
  let speed = up.spd ? 2 : 1;
  if ((state.specialties || []).includes("velocity")) speed *= 1.08;
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
    sum += (cfg.revenue * rev * st.owned * milestoneMult(st.owned) * mult * 1000) / effectiveCycleMs(cfg, state);
  });
  return sum;
}

export function creditCycles(state, index, cycles, now = 0) {
  if (cycles <= 0) return 0;
  const cfg = BUSINESSES[index];
  const st = state.biz?.[index];
  if (!st || st.owned <= 0) return 0;
  const rev = upgradesOf(state, cfg.id).rev ? 3 : 1;
  const amount = cycles * cfg.revenue * rev * st.owned * milestoneMult(st.owned) * empireFactors(state, now).total;
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
    if (spec && state.challenge.earnings >= spec.goal) {
      const elapsed = now - state.challenge.startedAt;
      if (!spec.limitMs || (now > 0 && elapsed <= spec.limitMs)) completeChallenge(state);
    }
  }
  completeProjects(state);
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
  if (id === "orbital") return (state.biz?.[8]?.owned || 0) >= 25;
  return false;
}

export function completeProjects(state) {
  for (const project of PROJECTS) {
    if (!projectReady(state, project.id)) continue;
    state.projectsDone = [...(state.projectsDone || []), project.id];
    grantTokens(state, `project:${project.id}`, project.tokens);
    state.modStamp = (state.modStamp || 0) + 1;
  }
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

export function buyUpgrade(state, index, kind) {
  const offer = upgradeOffer(index);
  const piece = offer[kind];
  if (!piece) return false;
  const id = offer.id;
  const up = { ...upgradesOf(state, id) };
  if (up[kind]) return false;
  const owned = state.biz?.[index]?.owned || 0;
  if (owned < piece.need) return false;
  if (!(state.cash >= piece.cost)) return false;
  state.cash -= piece.cost;
  up[kind] = true;
  state.upgrades = { ...(state.upgrades || {}), [id]: up };
  state.modStamp = (state.modStamp || 0) + 1;
  return true;
}

export function managerPrice(state, index) {
  if (state.shop?.freeManager) return 0;
  return BUSINESSES[index].managerCost;
}

export function canHireIndex(state, index) {
  const st = state.biz?.[index];
  if (!st || st.manager || st.owned <= 0) return false;
  if (state.challenge?.id === "noboss") return false;
  return state.cash >= managerPrice(state, index);
}

export function canBuyIndex(state, index) {
  if (state.challenge?.id === "glass" && index !== 0) return false;
  if (index > 0 && !(state.biz?.[index - 1]?.owned > 0 || state.biz?.[index]?.owned > 0)) return false;
  return true;
}

const BADGE_DEFS = [
  ...BUSINESSES.map((cfg, index) => ({
    id: `era-${cfg.id}`,
    group: "TECH ERAS",
    name: cfg.name,
    desc: `Own your first ${cfg.name}`,
    icon: cfg.icon,
    earned: (s) => (s.biz?.[index]?.owned || 0) > 0,
  })),
  ...BUSINESSES.map((cfg, index) => ({
    id: `master-${cfg.id}`,
    group: "MASTERY",
    name: `${cfg.name} Mastery`,
    desc: "Reach this era's mastery count and buy both upgrades",
    icon: cfg.icon,
    earned: (s) => isMastered(s, index),
  })),
  ...[
    [1e3, "$1.00K"],
    [1e6, "$1.00M"],
    [1e9, "$1.00B"],
    [1e12, "$1.00T"],
    [1e15, "$1.00Qa"],
  ].map(([n, label]) => ({
    id: `life-${n}`,
    group: "LIFETIME",
    name: label,
    desc: `Career earnings reach ${label}`,
    earned: (s) => (s.careerEarnings || 0) >= n,
  })),
  ...CHALLENGES.map((c) => ({
    id: `ch-${c.id}`,
    group: "CHALLENGES",
    name: c.name,
    desc: "Win this challenge run",
    earned: (s) => (s.challengesDone || []).includes(c.id),
  })),
  ...PROJECTS.map((p) => ({
    id: `pr-${p.id}`,
    group: "MEGA-PROJECTS",
    name: p.name,
    desc: p.blurb,
    earned: (s) => (s.projectsDone || []).includes(p.id),
  })),
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
    desc: "Commit to a research branch",
    earned: (s) => (s.specialties || []).length >= 1,
  },
  {
    id: "time-streak",
    group: "TIMELINE",
    name: "Week on the Floor",
    desc: "Keep a 7 day briefing streak",
    earned: (s) => (s.streak || 0) >= 7,
  },
];

export function badgeList(state) {
  return BADGE_DEFS.map((badge) => ({
    id: badge.id,
    group: badge.group,
    name: badge.name,
    desc: badge.desc,
    icon: badge.icon || "",
    earned: !!badge.earned(state),
  }));
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
  if (!state.dilemma && now >= (state.dilemmaDeferUntil || 0) && now >= (state.nextDilemmaAt || 0)) {
    state.dilemma = { id: "grant", expiresAt: now + 45 * 1000 };
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
    if (now - state.challenge.startedAt > spec.limitMs && state.challenge.earnings < spec.goal) {
      failChallenge(state);
      notes.push({ type: "speedfail" });
    }
  }
  return notes;
}

export function resolveDilemma(state, choice, now) {
  if (!state.dilemma) return null;
  state.dilemma = null;
  state.nextDilemmaAt = now + 6 * 60 * 1000;
  if (choice === "tokens") {
    state.tokens = (state.tokens || 0) + 2;
    return { type: "tokens" };
  }
  if (choice === "boost") {
    state.boostUntil = now + 5 * 60 * 1000;
    state.modStamp = (state.modStamp || 0) + 1;
    return { type: "boost" };
  }
  state.dilemmaDeferUntil = now + 5 * 60 * 1000;
  state.nextDilemmaAt = state.dilemmaDeferUntil;
  return { type: "defer" };
}

export function snapshotMeta(state) {
  return {
    investors: state.investors || 0,
    careerEarnings: state.careerEarnings || 0,
    singularities: state.singularities || 0,
    tokens: state.tokens || 0,
    grants: [...(state.grants || [])],
    data: state.data || 0,
    specialties: [...(state.specialties || [])],
    upgrades: JSON.parse(JSON.stringify(state.upgrades || {})),
    challengesDone: [...(state.challengesDone || [])],
    projectsDone: [...(state.projectsDone || [])],
    shop: { ...(state.shop || blankMeta().shop) },
    boostUntil: state.boostUntil || 0,
    dilemmaDeferUntil: state.dilemmaDeferUntil || 0,
    nextDilemmaAt: state.nextDilemmaAt || 0,
    nextWindfallAt: state.nextWindfallAt || 0,
    prestiged: !!state.prestiged,
    streak: state.streak || 1,
    briefingDay: state.briefingDay || null,
    modStamp: (state.modStamp || 0) + 1,
  };
}

export function investorsReady(state) {
  return investorsFor(state.lifetime || 0);
}

export const HEADLINES = [
  "PRICES SOAR AS GAMERS CHASE THE NEXT FRAME",
  "VACUUM TUBES STILL WARM IN THE BACK ROOM",
  "PUNCH CARDS JAM, PROFITS DO NOT",
  "CLEANROOM FOREMAN DENIES ANY LEAK",
  "MICROPROCESSORS PRINT OVERTIME",
  "RGB FANS AUDIBLE FROM ORBIT",
  "QUANTUM CHANDELIER OBSERVED PAYING DIVIDENDS",
  "MINISTRY OF COMPUTING ANNOUNCES A GRANT",
];
