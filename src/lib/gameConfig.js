// Central tuning for the idle computing-empire game: eras, milestones, and money math.
//
// Pacing: the first unit of each row costs more than the row before it, and a
// steady player opens a new row every two to four minutes through the first
// half hour (punch cards ~10 min, tubes ~16, transistors ~21, ICs ~29). From
// Integrated Circuits on, prices and revenue are unchanged from the earlier
// tuning, so the first prestige (~3 h) and first fork (~4 days nonstop) stay
// where they were. Checked with the pacing simulation after the history
// reorder.

export const BUSINESSES = [
  // Rows run in historical order. Each material sits just before the first
  // era that uses it: paper before punch cards, glass and filament before
  // vacuum tubes, germanium before the first transistors, and silicon and
  // wafers before integrated circuits. Saves store rows by id (save v5).
  {
    id: "sand",
    name: "Sand Quarry",
    era: "Raw stock",
    tagline: "Scoop silica sand. Glass and, much later, silicon chips both start as grit.",
    icon: "/icons/sand.png",
    baseCost: 4,
    revenue: 0.4,
    cycleMs: 2200,
    coef: 1.14,
    managerName: "Pit Boss",
    managerCost: 180,
    revCost: 550,
    spdCost: 52000,
    makes: { sand: 3 },
    speedNeed: 30,
    masteryNeed: 72,
    badgeOwned: 20,
    upgrades: ["Screened Grit", "Washed sand sells cleaner. Each scoop pays triple.", "Second Shift", "The pit stays lit. Cycles run twice as fast."],
  },
  {
    id: "copper",
    name: "Copper Seam",
    era: "Raw stock",
    tagline: "Wire starts in the rock. Pull copper before the tube works ask.",
    icon: "/icons/copper.png",
    baseCost: 80,
    revenue: 1.4,
    cycleMs: 2400,
    coef: 1.15,
    managerName: "Drift Miner",
    managerCost: 2400,
    revCost: 14000,
    spdCost: 160000,
    makes: { copper: 3 },
    speedNeed: 36,
    masteryNeed: 70,
    badgeOwned: 18,
    upgrades: ["High-Grade Ore", "The seam runs rich. Each pull pays triple.", "Twin Drills", "Two faces at once. The cycle is cut in half."],
  },
  {
    id: "paper",
    name: "Paper Mill",
    era: "Raw stock",
    tagline: "Press pulp into stiff, smooth card stock that can take a punch.",
    icon: "/icons/paper.png",
    baseCost: 300,
    revenue: 3,
    cycleMs: 2600,
    coef: 1.15,
    managerName: "Mill Hand",
    managerCost: 6000,
    revCost: 30000,
    spdCost: 300000,
    makes: { paper: 3 },
    speedNeed: 38,
    masteryNeed: 75,
    badgeOwned: 17,
    upgrades: ["Rag Content", "Cotton-rich card stock stops tearing. Each bale pays triple.", "Continuous Roll", "The machine makes one endless roll. Twice the speed."],
  },
  {
    id: "punchcards",
    name: "Punch Cards",
    era: "c. 1890",
    tagline: "Holes in stiff cards count a whole nation, one tabulator run at a time.",
    icon: "/icons/punchcards.png",
    baseCost: 1000,
    revenue: 30,
    cycleMs: 3000,
    coef: 1.09,
    managerName: "Keypunch Operator",
    managerCost: 20000,
    revCost: 100000,
    spdCost: 1000000,
    uses: { paper: 1 },
    speedNeed: 50,
    masteryNeed: 130,
    badgeOwned: 25,
    upgrades: ["Steel Hoppers", "The card path stops jamming. Every stack pays triple.", "Gang Punch", "One stroke copies a whole card. Cycles run twice as fast."],
  },
  {
    id: "glass",
    name: "Glassworks",
    era: "Refine",
    tagline: "Melt sand into clear glass, ready to blow into bulbs and valves.",
    icon: "/icons/glass.png",
    baseCost: 2500,
    revenue: 8,
    cycleMs: 3000,
    coef: 1.15,
    managerName: "Glassblower",
    managerCost: 30000,
    revCost: 150000,
    spdCost: 1500000,
    uses: { sand: 1 },
    makes: { glass: 3 },
    speedNeed: 40,
    masteryNeed: 80,
    badgeOwned: 16,
    upgrades: ["Borosilicate Batch", "Tougher glass takes the heat. Each melt pays triple.", "Ribbon Machine", "Bulbs blown from a moving ribbon of glass. Twice the speed."],
  },
  {
    id: "filament",
    name: "Filament Forge",
    era: "Refine",
    tagline: "Draw tungsten and nickel into fine wire for the glowing heart of a tube.",
    icon: "/icons/filament.png",
    baseCost: 4000,
    revenue: 12,
    cycleMs: 3200,
    coef: 1.15,
    managerName: "Wire Drawer",
    managerCost: 50000,
    revCost: 250000,
    spdCost: 2500000,
    makes: { filament: 3 },
    speedNeed: 42,
    masteryNeed: 85,
    badgeOwned: 16,
    upgrades: ["Ductile Tungsten", "Tungsten that bends into wire. Each spool pays triple.", "Diamond Dies", "Wire pulled through diamond dies runs twice as fast."],
  },
  {
    id: "tubes",
    name: "Vacuum Tubes",
    era: "c. 1946",
    tagline: "Room-sized computers, soldered together one glowing glass valve at a time.",
    icon: "/icons/tubes.png",
    baseCost: 7000,
    revenue: 200,
    cycleMs: 3000,
    coef: 1.11,
    managerName: "Lab Technician",
    managerCost: 200000,
    revCost: 1000000,
    spdCost: 10000000,
    uses: { glass: 1, copper: 1, filament: 1 },
    speedNeed: 60,
    masteryNeed: 150,
    badgeOwned: 25,
    upgrades: ["Getter Flash", "A flash of metal soaks up the last of the air. Each batch fetches triple.", "Batch Soldering", "Pre-tinned chassis wire up in half the time."],
  },
  {
    id: "germanium",
    name: "Germanium Refinery",
    era: "Refine",
    tagline: "Pull germanium from smelter dust. The first transistors were made of it.",
    icon: "/icons/germanium.png",
    baseCost: 12000,
    revenue: 24,
    cycleMs: 3400,
    coef: 1.15,
    managerName: "Furnace Chemist",
    managerCost: 200000,
    revCost: 1000000,
    spdCost: 8000000,
    makes: { germanium: 3 },
    speedNeed: 44,
    masteryNeed: 90,
    badgeOwned: 16,
    upgrades: ["Zone Refining", "A molten zone sweeps the impurities out. Yield triples.", "Tandem Furnaces", "Two furnaces share the load. Cycles are halved."],
  },
  {
    id: "transistors",
    name: "Transistors",
    era: "c. 1954",
    tagline: "Solid-state switches replace the glowing glass. Smaller, cooler, faster.",
    icon: "/icons/transistors.png",
    baseCost: 25920,
    revenue: 945,
    cycleMs: 6000,
    coef: 1.14,
    managerName: "Junction Tech",
    managerCost: 3600000,
    uses: { germanium: 1 },
    speedNeed: 70,
    masteryNeed: 150,
    badgeOwned: 20,
    upgrades: ["Alloy Junctions", "Cleaner junctions, triple the yield from each crystal.", "Wave Soldering", "The line never waits on a hand iron. Twice the speed."],
  },
  {
    id: "silicon",
    name: "Silicon Still",
    era: "Refine",
    tagline: "Refine sand into ultra-pure silicon. It takes over from germanium.",
    icon: "/icons/silicon.png",
    baseCost: 40000,
    revenue: 60,
    cycleMs: 2800,
    coef: 1.15,
    managerName: "Kiln Hand",
    managerCost: 1000000,
    revCost: 5000000,
    spdCost: 40000000,
    uses: { sand: 1 },
    makes: { silicon: 3 },
    speedNeed: 40,
    masteryNeed: 80,
    badgeOwned: 16,
    upgrades: ["Float Zone", "A molten zone carries the impurities away. Yield triples.", "Hotter Crucible", "The melt finishes sooner. Twice the speed."],
  },
  {
    id: "wafers",
    name: "Wafer Bench",
    era: "Grow",
    tagline: "Pull one big silicon crystal and slice it into wafers.",
    icon: "/icons/wafers.png",
    baseCost: 90000,
    revenue: 140,
    cycleMs: 3600,
    coef: 1.15,
    managerName: "Crystal Puller",
    managerCost: 2500000,
    revCost: 12000000,
    spdCost: 100000000,
    uses: { silicon: 1 },
    makes: { wafers: 6 },
    speedNeed: 44,
    masteryNeed: 90,
    badgeOwned: 16,
    upgrades: ["Seed Crystals", "Each pull starts true. Wafer revenue triples.", "Twin Pullers", "Two crystals grow at once. Cycles are halved."],
  },
  {
    id: "ics",
    name: "Integrated Circuits",
    era: "c. 1965",
    tagline: "A whole logic board shrunk onto a single sliver of silicon.",
    icon: "/icons/ics.png",
    baseCost: 311040,
    revenue: 13230,
    cycleMs: 12000,
    coef: 1.14,
    managerName: "Fab Line Supervisor",
    managerCost: 18000000,
    uses: { wafers: 1 },
    speedNeed: 80,
    masteryNeed: 150,
    badgeOwned: 30,
    upgrades: ["Gold Bond Wire", "The leads stop failing. Revenue from each die triples.", "Mask Aligner", "Masks land true. The fab cycle is cut in half."],
  },
  {
    id: "cpu",
    name: "Microprocessors",
    era: "c. 1971",
    tagline: "A computer on a chip. The brain is born, and it prints money.",
    icon: "/icons/cpu.png",
    baseCost: 3732480,
    revenue: 277830,
    cycleMs: 24000,
    coef: 1.12,
    managerName: "Chip Architect",
    managerCost: 43200000,
    speedNeed: 90,
    masteryNeed: 155,
    badgeOwned: 40,
    upgrades: ["Microcode Cache", "The chip stops fetching from the slow path. Triple revenue.", "Pipelined Clock", "Instructions overlap. The cycle time is halved."],
  },
  {
    id: "homepc",
    name: "Home Computers",
    era: "c. 1977",
    tagline: "Computing escapes the lab and lands on every desk in the suburbs.",
    icon: "/icons/homepc.png",
    baseCost: 44789760,
    revenue: 5834430,
    cycleMs: 48000,
    coef: 1.11,
    managerName: "Assembly Line Boss",
    managerCost: 432000000,
    speedNeed: 110,
    masteryNeed: 165,
    badgeOwned: 50,
    upgrades: ["Bundled Software", "Every desk ships with a reason to buy. Triple revenue.", "Assembly Jig", "Cases close themselves. The line runs twice as fast."],
  },
  {
    id: "gpu",
    name: "Graphics Cards",
    era: "c. 1999",
    tagline: "Polygons! Pixels! The GPU gold rush begins and never slows down.",
    icon: "/icons/gpu.png",
    baseCost: 537477120,
    revenue: 122523030,
    cycleMs: 96000,
    coef: 1.1,
    managerName: "Silicon Engineer",
    managerCost: 3996000000,
    speedNeed: 130,
    masteryNeed: 220,
    badgeOwned: 80,
    upgrades: ["Shader Cores", "More pixels per die. Graphics revenue triples.", "Binning Pass", "Good chips leave the tester sooner. Twice the speed."],
  },
  {
    id: "rgb",
    name: "RGB Battlestations",
    era: "c. 2015",
    tagline: "More glow, more frames, more profit. The fans never sleep.",
    icon: "/icons/rgb.png",
    baseCost: 6449725440,
    revenue: 2572983630,
    cycleMs: 192000,
    coef: 1.09,
    managerName: "Streamer Crafter",
    managerCost: 19999999980,
    speedNeed: 160,
    masteryNeed: 220,
    badgeOwned: 100,
    upgrades: ["Addressable LEDs", "The glow is the product. Revenue triples.", "Fan Curves", "Thermals stay quiet. Cycles complete twice as fast."],
  },
  {
    id: "quantum",
    name: "Quantum Servers",
    era: "c. 2019",
    tagline: "Superpositioned profits, observed daily inside a golden chandelier.",
    icon: "/icons/quantum.png",
    baseCost: 77396705280,
    revenue: 54032656230,
    cycleMs: 384000,
    coef: 1.08,
    managerName: "Cryogenics Engineer",
    managerCost: 360000000000,
    speedNeed: 190,
    masteryNeed: 250,
    badgeOwned: 150,
    upgrades: ["Cryo Loops", "The chandelier stays cold. Quantum revenue triples.", "Error Correction", "Fewer shots are wasted. The cycle is cut in half."],
  },
];

// Ordered by owned count. The product tops out at ×144 (2^4 × 3^2) once a
// business reaches 220 — there is no milestone past that, so this multiplier
// cannot grow forever.
export const SUPPLY_KEYS = ["sand", "copper", "paper", "glass", "filament", "germanium", "silicon", "wafers"];
export const FOREMAN_COST = 25000;
export const RESEARCH_MS = 20000;
export const UPGRADE_MS = 12000;
export const COMMISSION_MS = 8000;
export const PROJECT_MS = 20000;

export function blankSupply() {
  return Object.fromEntries(SUPPLY_KEYS.map((key) => [key, 0]));
}

export function indexOfBusiness(id) {
  return BUSINESSES.findIndex((cfg) => cfg.id === id);
}

export function blockedByGlass(state, index) {
  return state?.challenge?.id === "glass" && BUSINESSES[index]?.id !== "tubes";
}

export function formatFlow(flow) {
  if (!flow) return "";
  return Object.entries(flow)
    .map(([key, count]) => `${count} ${count === 1 && key.endsWith("s") ? key.slice(0, -1) : key}`)
    .join(", ");
}

// 25, 50 and 100 halve the cycle (AdCap-style speed). Later bars still multiply profit.
export const MILESTONES = [
  { owned: 25, speed: 2 },
  { owned: 50, speed: 2 },
  { owned: 100, speed: 2 },
  { owned: 150, mult: 3 },
  { owned: 200, mult: 2 },
  { owned: 220, mult: 3 },
];

export function milestoneMult(owned) {
  if (!Number.isFinite(owned) || owned < 0) return 1;
  return MILESTONES.reduce((m, ms) => (ms.mult && owned >= ms.owned ? m * ms.mult : m), 1);
}

export function milestoneSpeed(owned) {
  if (!Number.isFinite(owned) || owned < 0) return 1;
  let speed = 1;
  for (const ms of MILESTONES) {
    if (ms.speed && owned >= ms.owned) speed *= ms.speed;
  }
  return speed;
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
  // NEXT: exactly enough to reach the next milestone, speed gate, or mastery
  // gate. Callers pass that distance as `limit`. Past every gate, round up to
  // the next multiple of 25 so the button still has a target.
  if (mode === "NEXT") {
    if (cap < MAX_BUY) return cap;
    const have = Number.isFinite(owned) && owned > 0 ? Math.floor(owned) : 0;
    return 25 - (have % 25);
  }
  const n = parseInt(String(mode).slice(1), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(cap, n);
}

// Closed tabs, hidden tabs, and suspended timers all share this one budget.
export const OFFLINE_CAP_MS = 24 * 60 * 60 * 1000;
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
//   milestoneSpeed — ×8 cycle speed by 100 owned, then flat
//   milestoneMult — ×18 profit by 220 owned, then flat
//   prestigeMult  — +5% for 100, +1% for 400, then +0.07% with no hard stop
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
  const c = Math.max(n - 500, 0); // +0.07% each after that, no hard stop
  const mult = 1 + a * 0.05 + b * 0.01 + c * 0.0007;
  return Number.isFinite(mult) ? mult : 1;
}

function rateOf(cfg, owned) {
  if (!owned || owned <= 0) return 0;
  return (cfg.revenue / (cfg.cycleMs / 1000) * milestoneSpeed(owned)) * owned * milestoneMult(owned);
}

// The single best thing to do with the empire as it stands. Hire beats a new
// era, which beats clicking an idle machine, which beats another copy of
// something you already run.
export function nextMove(state) {
  const biz = Array.isArray(state?.biz) ? state.biz : [];
  const cash = Number.isFinite(state?.cash) ? state.cash : 0;

  const noBoss = state?.challenge?.id === "noboss";
  const glass = state?.challenge?.id === "glass";
  const now = Date.now();
  const commissioning = (st) => (st?.commissionUntil || 0) > now;

  if (!noBoss) {
    for (let i = BUSINESSES.length - 1; i >= 0; i--) {
      const st = biz[i];
      const cfg = BUSINESSES[i];
      if (!st || st.owned <= 0 || st.manager || commissioning(st)) continue;
      if (blockedByGlass(state, i)) continue;
      const cost = state?.shop?.freeManager ? 0 : cfg.managerCost;
      if (cash >= cost) {
        return `Hire the ${cfg.managerName} for ${money(cost)} - that era then earns on its own.`;
      }
    }
  }

  for (let i = 1; i < BUSINESSES.length; i++) {
    if (blockedByGlass(state, i)) continue;
    const prev = biz[i - 1];
    const st = biz[i];
    const prevOwned = prev && prev.owned > 0;
    const glassOpen = glass && BUSINESSES[i].id === "tubes";
    if ((!prevOwned && !glassOpen) || (st && st.owned > 0)) continue;
    const cost = costOf(BUSINESSES[i], 0, 1);
    if (Number.isFinite(cost) && cash >= cost) {
      return `Buy your first ${BUSINESSES[i].name} for ${money(cost)}.`;
    }
    break;
  }

  for (let i = 0; i < BUSINESSES.length; i++) {
    const st = biz[i];
    if (st && st.owned > 0 && !st.manager && !st.running && !commissioning(st)) {
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
  for (let i = 0; i < BUSINESSES.length && !noBoss; i++) {
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
    if (blockedByGlass(state, i)) continue;
    const prev = biz[i - 1];
    const st = biz[i];
    const prevOwned = prev && prev.owned > 0;
    const glassOpen = glass && BUSINESSES[i].id === "tubes";
    if ((!prevOwned && !glassOpen) || (st && st.owned > 0)) continue;
    const cost = costOf(BUSINESSES[i], 0, 1);
    const short = cost - cash;
    if (Number.isFinite(short) && short > 0 && (!goal || short < goal.short)) {
      goal = { short, text: `Save ${money(short)} more to open ${BUSINESSES[i].name}.` };
    }
    break;
  }
  return goal ? goal.text : "Keep the machines running. The next era is on its way.";
}
