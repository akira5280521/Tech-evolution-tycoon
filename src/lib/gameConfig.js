// Central tuning for the idle computing-empire game: eras, milestones, and money math.
//
// Tier pacing (the nine businesses): a full-uptime run used to buy every era
// by 37 minutes and then idle until 2.4h for the first investor. From Punch
// Cards up, sticker prices and manager costs are 36× the old values. Era n
// (Punch Cards = 1) keeps its old revenue times 1.75^(n-1), so a tier you
// waited for is still a raise without funding the next one immediately.
// Quantum's first purchase now lands just before the ~2.4h first prestige.
// Vacuum Tubes are unchanged so the opening still teaches the click.

export const BUSINESSES = [
  {
    id: "tubes",
    name: "Vacuum Tubes",
    era: "c. 1946",
    tagline: "Room-sized computers, soldered together one glowing glass valve at a time.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/d0e144559_generated_image.png",
    baseCost: 4,
    revenue: 1,
    cycleMs: 600,
    coef: 1.071,
    managerName: "Lab Technician",
    managerCost: 1000,
  },
  {
    id: "punchcards",
    name: "Punch Cards",
    era: "c. 1951",
    tagline: "Feed the mainframe a stack of holes and it pays you back in bytes.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/99c96d2bc_generated_image.png",
    baseCost: 2160,
    revenue: 60,
    cycleMs: 3000,
    coef: 1.14,
    managerName: "Keypunch Operator",
    managerCost: 540000,
  },
  {
    id: "transistors",
    name: "Transistors",
    era: "c. 1958",
    tagline: "Solid-state switches replace the glowing glass. Smaller, cooler, faster.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/94f9dc9a6_generated_image.png",
    baseCost: 25920,
    revenue: 945,
    cycleMs: 6000,
    coef: 1.14,
    managerName: "Cleanroom Foreman",
    managerCost: 3600000,
  },
  {
    id: "ics",
    name: "Integrated Circuits",
    era: "c. 1965",
    tagline: "A whole logic board shrunk onto a single sliver of silicon.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/3ed85add0_generated_image.png",
    baseCost: 311040,
    revenue: 13230,
    cycleMs: 12000,
    coef: 1.14,
    managerName: "Fab Line Supervisor",
    managerCost: 18000000,
  },
  {
    id: "cpu",
    name: "Microprocessors",
    era: "c. 1971",
    tagline: "A computer on a chip. The brain is born, and it prints money.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/b81d51d3c_generated_image.png",
    baseCost: 3732480,
    revenue: 277830,
    cycleMs: 24000,
    coef: 1.12,
    managerName: "Chip Architect",
    managerCost: 43200000,
  },
  {
    id: "homepc",
    name: "Home Computers",
    era: "c. 1977",
    tagline: "Computing escapes the lab and lands on every desk in the suburbs.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/f1a4bc2bc_generated_image.png",
    baseCost: 44789760,
    revenue: 5834430,
    cycleMs: 48000,
    coef: 1.11,
    managerName: "Assembly Line Boss",
    managerCost: 432000000,
  },
  {
    id: "gpu",
    name: "Graphics Cards",
    era: "c. 1999",
    tagline: "Polygons! Pixels! The GPU gold rush begins and never slows down.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/601001ef4_generated_image.png",
    baseCost: 537477120,
    revenue: 122523030,
    cycleMs: 96000,
    coef: 1.1,
    managerName: "Silicon Engineer",
    managerCost: 3996000000,
  },
  {
    id: "rgb",
    name: "RGB Battlestations",
    era: "c. 2010",
    tagline: "More glow, more frames, more profit. The fans never sleep.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/5dab53cc9_generated_image.png",
    baseCost: 6449725440,
    revenue: 2572983630,
    cycleMs: 192000,
    coef: 1.09,
    managerName: "Streamer Crafter",
    managerCost: 19999999980,
  },
  {
    id: "quantum",
    name: "Quantum Servers",
    era: "c. 2025",
    tagline: "Superpositioned profits, observed daily inside a golden chandelier.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/b105db4ed_generated_image.png",
    baseCost: 77396705280,
    revenue: 54032656230,
    cycleMs: 384000,
    coef: 1.08,
    managerName: "Cryogenics Engineer",
    managerCost: 360000000000,
  },
];

// Ordered by owned count. The product tops out at ×144 (2^4 × 3^2) once a
// business reaches 220 — there is no milestone past that, so this multiplier
// cannot grow forever.
export const MILESTONES = [
  { owned: 25, mult: 2 },
  { owned: 50, mult: 2 },
  { owned: 100, mult: 2 },
  { owned: 150, mult: 3 },
  { owned: 200, mult: 2 },
  { owned: 220, mult: 3 },
];

export function milestoneMult(owned) {
  if (!Number.isFinite(owned) || owned < 0) return 1;
  return MILESTONES.reduce((m, ms) => (owned >= ms.owned ? m * ms.mult : m), 1);
}

export function nextMilestone(owned) {
  return MILESTONES.find((ms) => ms.owned > owned) || null;
}

const UNITS = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

export function fmt(n) {
  if (Number.isNaN(n)) return "—";
  if (!isFinite(n)) return "∞";
  if (n < 0) return "-" + fmt(-n);
  if (n < 1000) return Number.isInteger(n) ? String(n) : n.toFixed(2);
  const tier = Math.floor(Math.log10(n) / 3);
  if (tier >= UNITS.length || !Number.isFinite(tier)) return n.toExponential(2);
  return (n / Math.pow(1000, tier)).toFixed(2) + UNITS[tier];
}

export function money(n) {
  return "$" + fmt(n);
}

// One click never buys more than this. Past here Math.pow(coef, owned) walks
// into Infinity and a MAX purchase would poison cash with NaN.
export const MAX_BUY = 1000;

// Total price of buying `count` units, geometric scaling per unit owned.
export function costOf(cfg, owned, count) {
  const r = cfg.coef;
  if (!Number.isFinite(r) || r <= 1) return Infinity;
  if (!Number.isFinite(owned) || owned < 0 || !Number.isFinite(count) || count < 1 || count > MAX_BUY) {
    return Infinity;
  }
  const start = cfg.baseCost * Math.pow(r, owned);
  const total = (start * (Math.pow(r, count) - 1)) / (r - 1);
  return Number.isFinite(total) ? total : Infinity;
}

export function maxAffordable(cfg, owned, cash) {
  const r = cfg.coef;
  if (!Number.isFinite(r) || r <= 1) return 0;
  const start = cfg.baseCost * Math.pow(r, owned);
  if (!Number.isFinite(cash) || cash <= 0 || !Number.isFinite(start) || start <= 0 || !Number.isFinite(owned) || owned < 0) {
    return 0;
  }
  const n = Math.floor(Math.log((cash * (r - 1)) / start + 1) / Math.log(r));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_BUY, n));
}

// `limit` is how many units this click may add. Callers pass the distance to
// the next milestone, speed gate, or mastery gate so one press cannot skip it.
export function buyCount(mode, cfg, owned, cash, limit = MAX_BUY) {
  const cap = Number.isFinite(limit) && limit >= 1 ? Math.min(MAX_BUY, Math.floor(limit)) : MAX_BUY;
  if (mode === "MAX") return Math.min(cap, Math.max(maxAffordable(cfg, owned, cash), 1));
  const n = parseInt(String(mode).slice(1), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(cap, n);
}

// Closed tabs, hidden tabs, and suspended timers all share this one budget.
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;
export const AWAY_MODAL_MS = 60 * 1000;
// A live tick longer than this is a stalled or suspended timer, not a frame.
export const NORMAL_TICK_MS = 2000;

// `budget` is the milliseconds still payable for the current absence.
// Visible play refills it. A hidden streak draws it down to zero and stops.
export function cappedTick(raw, hidden, budget) {
  const safeRaw = Number.isFinite(raw) && raw > 0 ? raw : 0;
  const safeBudget = Number.isFinite(budget) && budget > 0 ? Math.min(budget, OFFLINE_CAP_MS) : 0;
  const catchup = !!hidden || safeRaw > NORMAL_TICK_MS;
  if (!catchup) return { dt: safeRaw, budget: OFFLINE_CAP_MS };
  const dt = Math.min(safeRaw, safeBudget);
  let nextBudget = Math.max(0, safeBudget - dt);
  if (!hidden) nextBudget = OFFLINE_CAP_MS;
  return { dt, budget: nextBudget };
}

// --- Prestige: reset your empire to recruit a capped profit bonus ---
// First investor at $1T lifetime (was $1M, which a rush reached in ~3 minutes).
export const PRESTIGE_UNIT = 1e12;
// Kept as the old reference point. The live income ceiling is the soft cap in
// empire.js, which starts near x14 and rises with singularity points.
export const GLOBAL_CAP = 10;

// Income multipliers stay bounded:
//   milestoneMult — ×144 at 220 owned, then flat
//   prestigeMult  — +5% for 100, +1% for 400, then +0.02% with no hard stop
// The product of every empire bonus then passes through the soft ceiling in
// empire.js, so a huge investor count still cannot make income infinite.
// Owned count is a quantity, not a bonus. A single purchase stops at the next
// milestone, speed gate, or mastery gate, and never adds more than MAX_BUY.
//
// Singularity is implemented in empire.js. Each point is +20% up to ×4.
// The investor bill for the next fork grows with points already taken, and the
// whole empire product approaches a ceiling that rises with those points.
export function investorsFor(runLifetime) {
  if (!Number.isFinite(runLifetime) || runLifetime <= 0) return 0;
  const n = Math.floor(Math.sqrt(runLifetime / PRESTIGE_UNIT));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function prestigeMult(investors) {
  const n = Math.max(0, Math.floor(investors));
  if (!Number.isFinite(n)) return 1;
  const a = Math.min(n, 100); // +5% each
  const b = Math.min(Math.max(n - 100, 0), 400); // +1% each, through 500
  const c = Math.max(n - 500, 0); // +0.02% each after that, no hard stop
  const mult = 1 + a * 0.05 + b * 0.01 + c * 0.0002;
  return Number.isFinite(mult) ? mult : 1;
}

function rateOf(cfg, owned) {
  if (!owned || owned <= 0) return 0;
  return (cfg.revenue / (cfg.cycleMs / 1000)) * owned * milestoneMult(owned);
}

// The single best thing to do with the empire as it stands. Hire beats a new
// era, which beats clicking an idle machine, which beats another copy of
// something you already run.
export function nextMove(state) {
  const biz = Array.isArray(state?.biz) ? state.biz : [];
  const cash = Number.isFinite(state?.cash) ? state.cash : 0;

  const noBoss = state?.challenge?.id === "noboss";
  const glass = state?.challenge?.id === "glass";

  if (!noBoss) {
    for (let i = BUSINESSES.length - 1; i >= 0; i--) {
      const st = biz[i];
      const cfg = BUSINESSES[i];
      if (!st || st.owned <= 0 || st.manager) continue;
      if (glass && i !== 0) continue;
      const cost = state?.shop?.freeManager ? 0 : cfg.managerCost;
      if (cash >= cost) {
        return `Hire the ${cfg.managerName} for ${money(cost)} - that era then earns on its own.`;
      }
    }
  }

  for (let i = 1; i < BUSINESSES.length; i++) {
    if (glass) break;
    const prev = biz[i - 1];
    const st = biz[i];
    if (!prev || prev.owned <= 0 || (st && st.owned > 0)) continue;
    const cost = costOf(BUSINESSES[i], 0, 1);
    if (Number.isFinite(cost) && cash >= cost) {
      return `Buy your first ${BUSINESSES[i].name} for ${money(cost)}.`;
    }
    break;
  }

  for (let i = 0; i < BUSINESSES.length; i++) {
    const st = biz[i];
    if (st && st.owned > 0 && !st.manager && !st.running) {
      return `Run ${BUSINESSES[i].name} to fire the next batch.`;
    }
  }

  let best = null;
  for (let i = 0; i < BUSINESSES.length; i++) {
    const st = biz[i];
    const owned = st ? st.owned : 0;
    if (!(i === 0 || (biz[i - 1] && biz[i - 1].owned > 0) || owned > 0)) continue;
    const cfg = BUSINESSES[i];
    const cost = costOf(cfg, owned, 1);
    const delta = rateOf(cfg, owned + 1) - rateOf(cfg, owned);
    if (!Number.isFinite(cost) || !(delta > 0) || cash < cost) continue;
    const payback = cost / delta;
    if (!best || payback < best.payback) best = { name: cfg.name, cost, payback };
  }
  if (best) return `Buy another ${best.name} for ${money(best.cost)}.`;

  const claim = investorsFor(state?.lifetime);
  if (claim >= 1) {
    const noun = claim === 1 ? "investor" : "investors";
    return `Prestige to recruit ${claim} ${noun}.`;
  }

  let goal = null;
  for (let i = 0; i < BUSINESSES.length; i++) {
    const st = biz[i];
    const cfg = BUSINESSES[i];
    if (st && st.owned > 0 && !st.manager) {
      const short = cfg.managerCost - cash;
      if (short > 0 && (!goal || short < goal.short)) {
        goal = { short, text: `Save ${money(short)} more to hire the ${cfg.managerName}.` };
      }
    }
  }
  for (let i = 1; i < BUSINESSES.length; i++) {
    const prev = biz[i - 1];
    const st = biz[i];
    if (!prev || prev.owned <= 0 || (st && st.owned > 0)) continue;
    const cost = costOf(BUSINESSES[i], 0, 1);
    const short = cost - cash;
    if (Number.isFinite(short) && short > 0 && (!goal || short < goal.short)) {
      goal = { short, text: `Save ${money(short)} more to open ${BUSINESSES[i].name}.` };
    }
    break;
  }
  return goal ? goal.text : "Keep the machines running. The next era is on its way.";
}
