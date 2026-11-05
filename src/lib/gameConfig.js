// Central tuning for the idle computing-empire game: eras, milestones, and money math.

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
    coef: 1.07,
    managerName: "Lab Technician",
    managerCost: 1000,
  },
  {
    id: "punchcards",
    name: "Punch Cards",
    era: "c. 1951",
    tagline: "Feed the mainframe a stack of holes and it pays you back in bytes.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/99c96d2bc_generated_image.png",
    baseCost: 60,
    revenue: 60,
    cycleMs: 3000,
    coef: 1.15,
    managerName: "Keypunch Operator",
    managerCost: 15000,
  },
  {
    id: "transistors",
    name: "Transistors",
    era: "c. 1958",
    tagline: "Solid-state switches replace the glowing glass. Smaller, cooler, faster.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/94f9dc9a6_generated_image.png",
    baseCost: 720,
    revenue: 540,
    cycleMs: 6000,
    coef: 1.14,
    managerName: "Cleanroom Foreman",
    managerCost: 100000,
  },
  {
    id: "ics",
    name: "Integrated Circuits",
    era: "c. 1965",
    tagline: "A whole logic board shrunk onto a single sliver of silicon.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/3ed85add0_generated_image.png",
    baseCost: 8640,
    revenue: 4320,
    cycleMs: 12000,
    coef: 1.13,
    managerName: "Fab Line Supervisor",
    managerCost: 500000,
  },
  {
    id: "cpu",
    name: "Microprocessors",
    era: "c. 1971",
    tagline: "A computer on a chip. The brain is born, and it prints money.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/b81d51d3c_generated_image.png",
    baseCost: 103680,
    revenue: 51840,
    cycleMs: 24000,
    coef: 1.12,
    managerName: "Chip Architect",
    managerCost: 1200000,
  },
  {
    id: "homepc",
    name: "Home Computers",
    era: "c. 1977",
    tagline: "Computing escapes the lab and lands on every desk in the suburbs.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/f1a4bc2bc_generated_image.png",
    baseCost: 1244160,
    revenue: 622080,
    cycleMs: 48000,
    coef: 1.11,
    managerName: "Assembly Line Boss",
    managerCost: 12000000,
  },
  {
    id: "gpu",
    name: "Graphics Cards",
    era: "c. 1999",
    tagline: "Polygons! Pixels! The GPU gold rush begins and never slows down.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/601001ef4_generated_image.png",
    baseCost: 14929920,
    revenue: 7464960,
    cycleMs: 96000,
    coef: 1.1,
    managerName: "Silicon Engineer",
    managerCost: 111000000,
  },
  {
    id: "rgb",
    name: "RGB Battlestations",
    era: "c. 2010",
    tagline: "More glow, more frames, more profit. The fans never sleep.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/5dab53cc9_generated_image.png",
    baseCost: 179159040,
    revenue: 89579520,
    cycleMs: 192000,
    coef: 1.09,
    managerName: "Streamer Crafter",
    managerCost: 555555555,
  },
  {
    id: "quantum",
    name: "Quantum Servers",
    era: "c. 2025",
    tagline: "Superpositioned profits, observed daily inside a golden chandelier.",
    icon: "https://media.base44.com/images/public/6aebb2bec73aa2ce1dbb81db/b105db4ed_generated_image.png",
    baseCost: 2149908480,
    revenue: 1074954240,
    cycleMs: 384000,
    coef: 1.08,
    managerName: "Cryogenics Engineer",
    managerCost: 10000000000,
  },
];

export const MILESTONES = [
  { owned: 25, mult: 2 },
  { owned: 50, mult: 2 },
  { owned: 100, mult: 2 },
  { owned: 200, mult: 2 },
  { owned: 300, mult: 3 },
  { owned: 400, mult: 3 },
];

export function milestoneMult(owned) {
  return MILESTONES.reduce((m, ms) => (owned >= ms.owned ? m * ms.mult : m), 1);
}

export function nextMilestone(owned) {
  return MILESTONES.find((ms) => ms.owned > owned) || null;
}

const UNITS = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

export function fmt(n) {
  if (!isFinite(n)) return "∞";
  if (n < 0) return "-" + fmt(-n);
  if (n < 1000) return Number.isInteger(n) ? String(n) : n.toFixed(2);
  const tier = Math.floor(Math.log10(n) / 3);
  if (tier >= UNITS.length) return n.toExponential(2);
  return (n / Math.pow(1000, tier)).toFixed(2) + UNITS[tier];
}

export function money(n) {
  return "$" + fmt(n);
}

// Total price of buying `count` units, geometric scaling per unit owned.
export function costOf(cfg, owned, count) {
  const r = cfg.coef;
  const start = cfg.baseCost * Math.pow(r, owned);
  return (start * (Math.pow(r, count) - 1)) / (r - 1);
}

export function maxAffordable(cfg, owned, cash) {
  const r = cfg.coef;
  const start = cfg.baseCost * Math.pow(r, owned);
  return Math.max(0, Math.floor(Math.log((cash * (r - 1)) / start + 1) / Math.log(r)));
}

export function buyCount(mode, cfg, owned, cash) {
  if (mode === "MAX") return Math.max(maxAffordable(cfg, owned, cash), 1);
  return parseInt(mode.slice(1), 10);
}

// --- Prestige: reset your empire to recruit permanent profit multipliers ---
export const PRESTIGE_UNIT = 1e6;
export const PRESTIGE_BONUS = 0.05;

export function investorsFor(runLifetime) {
  return Math.floor(Math.sqrt(Math.max(runLifetime, 0) / PRESTIGE_UNIT));
}

export function prestigeMult(investors) {
  return 1 + investors * PRESTIGE_BONUS;
}