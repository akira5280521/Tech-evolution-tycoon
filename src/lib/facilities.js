// Two late-game plants. Pay is a share of current business income,
// capped at 5% for both together, so the plants never outgrow the businesses.
// While the game is minimized or closed they earn at the away rate
// (OFFLINE_RATE), like everything else.
// Bitbark is a game coin: nothing here is real currency, a wallet, or a link.
//
// speed = min(1, min(power watts, cooling watts) / GPU watts).
// A plant's power is its cards' work x speed x memory factor, in Raster 3060s.
// Its share of business income is STARTER_SHARE x sqrt(power): one full 3060
// is STARTER_SHARE, and each better card still adds, a little less each time,
// until both plants together reach SHARE_CAP.

import { BUSINESSES } from "./gameConfig.js";

export const SHARE_CAP = 0.05;
export const STARTER_SHARE = 0.0009;
export const MAX_PART = 24;
const REFERENCE_WORK = 13;
const MINE_RAM_GB = 16;

// The cluster trains the biggest model its memory allows. Frontier needs
// 512 GB of RAM (16 DDR4 sticks, or 8 DDR5); Foundation needs 2 TB, a full
// DDR5 board like an H100 server (32 x 64 GB), and about 1.4 TB on the cards,
// like an eight-card B200 server.
const TIERS = [
  { id: "foundation", name: "Foundation", vram: 1400, ram: 2048, mult: 3.5 },
  { id: "frontier", name: "Frontier", vram: 400, ram: 512, mult: 3 },
  { id: "mural", name: "Mural", vram: 80, ram: 128, mult: 2.2 },
  { id: "portrait", name: "Portrait", vram: 24, ram: 64, mult: 1.6 },
  { id: "sketch", name: "Sketch", vram: 12, ram: 32, mult: 1 },
];

// Memory boards. The mine runs on a mining motherboard: 2 slots of desktop
// DDR4, 32 GB at most (the 2017 B250 mining boards). The cluster runs on a
// dual-socket server board with 32 slots: DDR4 (EPYC "Rome" class, as in the
// 2020 A100 servers) until the first DDR5 stick, then a DDR5 board (as in the
// 2022 H100 servers). DDR4 and DDR5 sticks don't fit the same board, so the
// first DDR5 stick takes the DDR4 sticks out (sold back at half what they
// cost). When every slot is full, a bigger stick replaces the smallest one
// (also sold back at half); a stick no bigger than that can't be added.
export const BOARDS = {
  mine: { slots: 2, maxGb: 32, name: "DDR4 mining board (32 GB at most)" },
  cluster: { slots: 32, maxGb: Infinity, name: "server board" },
};
const SELL_BACK = 0.5;

export const FACILITIES = [
  {
    id: "mine",
    name: "BITBARK MINE",
    icon: "/icons/facilities/mine.png",
    blurb: "Graphics cards mint Bitbark, a game coin. It cannot be traded or taken out of the game.",
  },
  {
    id: "cluster",
    name: "TRAINING CLUSTER",
    icon: "/icons/facilities/cluster.png",
    blurb: "The cluster trains a model and bills the studio. A bigger model needs more memory.",
  },
  {
    id: "servers",
    name: "RESEARCH SERVERS",
    icon: "/icons/facilities/servers.png",
    blurb: "These racks make R&D points, the same points your eras make. Spend them on the Research tab and the tech timeline.",
  },
];

export const PARTS = [
  { id: "raster3060", kind: "gpu", name: "Raster 3060", icon: "/icons/parts/raster3060.png", fits: ["mine", "cluster"], cost: 3_200_000_000, coef: 1.55, watts: 170, vram: 12, work: 13, spec: "12 GB GDDR6, 170 W, 12.7 TFLOPS FP32. A 3060-class card." },
  { id: "raster3090", kind: "gpu", name: "Raster 3090", icon: "/icons/parts/raster3090.png", fits: ["mine", "cluster"], cost: 28_000_000_000, coef: 1.55, watts: 350, vram: 24, work: 36, spec: "24 GB GDDR6X, 350 W, 35.6 TFLOPS FP32. A 3090-class card." },
  { id: "raster4090", kind: "gpu", name: "Raster 4090", icon: "/icons/parts/raster4090.png", fits: ["mine", "cluster"], cost: 90_000_000_000, coef: 1.55, watts: 450, vram: 24, work: 83, spec: "24 GB GDDR6X, 450 W, 82.6 TFLOPS FP32. A 4090-class card." },
  { id: "tensorA100", kind: "gpu", name: "Tensor A100", icon: "/icons/parts/tensorA100.png", fits: ["cluster"], cost: 220_000_000_000, coef: 1.55, watts: 400, vram: 80, work: 78, spec: "80 GB HBM2e, 400 W, 19.5 TFLOPS FP32 and 156 TFLOPS TF32. An A100 80 GB." },
  { id: "tensorH100", kind: "gpu", name: "Tensor H100", icon: "/icons/parts/tensorH100.png", fits: ["cluster"], cost: 700_000_000_000, coef: 1.55, watts: 700, vram: 80, work: 160, spec: "80 GB HBM3, 700 W, 67 TFLOPS FP32 and about 990 TFLOPS TF32. An H100 SXM." },
  { id: "tensorB200", kind: "gpu", name: "Tensor B200", icon: "/icons/parts/tensorB200.png", fits: ["cluster"], cost: 2_200_000_000_000, coef: 1.55, watts: 1000, vram: 192, work: 400, spec: "192 GB HBM3e, about 1,000 W, two dies on one package. A B200-class board." },
  { id: "ddr4_16", kind: "ram", gen: "DDR4", name: "16 GB DDR4-2400", icon: "/icons/parts/ddr4_32.png", fits: ["mine"], cost: 150_000_000, coef: 1.4, gb: 16, spec: "16 GB DDR4-2400 desktop stick (unbuffered), PC4-19200." },
  { id: "ddr4_32", kind: "ram", gen: "DDR4", name: "32 GB DDR4-3200", icon: "/icons/parts/ddr4_32.png", fits: ["cluster"], cost: 600_000_000, coef: 1.4, gb: 32, spec: "32 GB DDR4-3200 registered server stick (RDIMM), PC4-25600." },
  { id: "ddr5_64", kind: "ram", gen: "DDR5", name: "64 GB DDR5-5600", icon: "/icons/parts/ddr5_64.png", fits: ["cluster"], cost: 4_000_000_000, coef: 1.4, gb: 64, spec: "64 GB DDR5-5600 registered server stick (RDIMM), PC5-44800." },
  { id: "ddr5_128", kind: "ram", gen: "DDR5", name: "128 GB DDR5-6400", icon: "/icons/parts/ddr5_128.png", fits: ["cluster"], cost: 20_000_000_000, coef: 1.4, gb: 128, spec: "128 GB DDR5-6400 registered server stick (RDIMM), PC5-51200." },
  { id: "fans", kind: "cool", name: "Case fans", icon: "/icons/parts/fans.png", fits: ["mine", "cluster"], cost: 200_000_000, coef: 1.35, cool: 250, spec: "Moves 250 W of heat." },
  { id: "labfan", kind: "cool", name: "Lab fan", icon: "/icons/parts/labfan.png", fits: ["servers"], cost: 1_000_000, coef: 2, cool: 300, spec: "A 120 mm fan. Moves about 300 W of heat." },
  { id: "tower", kind: "cool", name: "Tower cooler", icon: "/icons/parts/tower.png", fits: ["mine", "cluster"], cost: 1_500_000_000, coef: 1.35, cool: 350, spec: "A dual-tower air cooler, 350 W." },
  { id: "liquid", kind: "cool", name: "360 mm liquid", icon: "/icons/parts/liquid.png", fits: ["mine", "cluster"], cost: 6_000_000_000, coef: 1.35, cool: 700, spec: "A 360 mm liquid loop, 700 W." },
  { id: "immersion", kind: "cool", name: "Immersion tank", icon: "/icons/parts/immersion.png", fits: ["mine", "cluster"], cost: 40_000_000_000, coef: 1.35, cool: 2000, spec: "The whole rack sits in a dielectric bath. 2,000 W." },
  { id: "psu750", kind: "power", name: "750 W supply", icon: "/icons/parts/psu750.png", fits: ["mine", "cluster"], cost: 800_000_000, coef: 1.35, power: 750, spec: "750 W ATX supply, 80 Plus Gold." },
  { id: "psu1200", kind: "power", name: "1200 W supply", icon: "/icons/parts/psu1200.png", fits: ["mine", "cluster"], cost: 3_500_000_000, coef: 1.35, power: 1200, spec: "1,200 W ATX supply, 80 Plus Platinum." },
  { id: "psu1600", kind: "power", name: "1600 W supply", icon: "/icons/parts/psu1600.png", fits: ["mine", "cluster"], cost: 12_000_000_000, coef: 1.35, power: 1600, spec: "1,600 W, 80 Plus Titanium, for a rack of data-center cards." },
  { id: "rack1", kind: "server", name: "Foundry Rack R1", icon: "/icons/parts/rack1.png", fits: ["servers"], cost: 10_000_000, coef: 5, watts: 200, work: 8, spec: "1U, two 8-core chips, 200 W. A small research server." },
  { id: "rack4", kind: "server", name: "Foundry Rack R4", icon: "/icons/parts/rack4.png", fits: ["servers"], cost: 400_000_000, coef: 5, watts: 500, work: 24, spec: "4U, four sockets, 500 W." },
  { id: "psu400", kind: "power", name: "400 W supply", icon: "/icons/parts/psu400.png", fits: ["servers"], cost: 2_000_000, coef: 2, power: 450, spec: "400 W ATX supply for a single rack." },
  { id: "hdd1t", kind: "disk", name: "1 TB disk", icon: "/icons/parts/hdd1t.png", fits: ["servers"], cost: 1_000_000, coef: 2, gb: 1000, spec: "1 TB, 7200 rpm." },
  { id: "ssd2t", kind: "disk", name: "2 TB SSD", icon: "/icons/parts/ssd2t.png", fits: ["servers"], cost: 100_000_000, coef: 2, gb: 2000, spec: "2 TB NAND, SATA." },
];

const STARTER = {
  mine: ["raster3060", "psu750", "fans", "ddr4_16"],
  cluster: ["raster3060", "psu750", "fans", "ddr4_32"],
  servers: ["rack1", "psu400", "labfan", "hdd1t"],
};

// Research server parts are priced so each extra rack costs 5x the last: a
// player adds a rack or two per era instead of filling the plant at once, so
// R&D grows with the company.
const PART_NEWS = {
  raster3060: "RASTER 3060 BOLTED INTO A SIDE RACK",
  raster3090: "RASTER 3090 RUMORED ON THE PLANT FLOOR",
  raster4090: "RASTER 4090 DRAWS MORE POWER THAN THE BREAK ROOM",
  tensorA100: "TENSOR A100 TAKES THE OVERNIGHT TRAINING SHIFT",
  tensorH100: "TENSOR H100 ARRIVES UNDER ARMED ESCORT",
  ddr4_16: "DESKTOP DDR4 STICK SLOTTED INTO THE MINING BOARD",
  ddr4_32: "DDR4-3200 STICKS REACH THE RACK",
  ddr5_64: "DDR5-5600 STICKS CLEAR THE LOADING DOCK",
  fans: "CASE FANS AUDIBLE FROM THE CAR PARK",
  labfan: "A LAB FAN STARTS UNDER THE RESEARCH RACK",
  tower: "TOWER COOLER ENDS THE THERMAL THROTTLE RUMOR",
  liquid: "360 MM LOOP PLUMBED BESIDE THE CARDS",
  psu750: "750 W SUPPLY LANDED FOR THE SIDE PLANT",
  psu1200: "1200 W SUPPLY QUIETS THE BREAKER TRIPS",
  rack1: "FOUNDRY RACK R1 TAKES THE RESEARCH SHIFT",
  rack4: "FOUNDRY RACK R4 DOUBLES THE LAB FLOOR",
  psu400: "400 W SUPPLY LANDS UNDER THE RESEARCH RACK",
  hdd1t: "A 1 TB DISK IS RACKED FOR THE LAB",
  ssd2t: "A 2 TB SSD REPLACES THE LAB'S SPINNING DISK",
};

const byId = Object.fromEntries(PARTS.map((part) => [part.id, part]));

export function blankFacilities() {
  return { mine: {}, cluster: {}, servers: {} };
}

// (Saves are read with up to 32 of a stick anywhere, so migrateFacilities can
// refund what's over a board's slots.)
// The most of one part a plant can hold: a memory stick is limited by the
// board's slots (32 on a server board), anything else by MAX_PART.
export function partMax(part, facilityId) {
  if (part?.kind === "ram") return facilityId === "mine" ? 2 : 32;
  return MAX_PART;
}

export function readFacilities(raw) {
  const out = blankFacilities();
  if (!raw || typeof raw !== "object") return out;
  for (const facilityId of Object.keys(out)) {
    const src = raw[facilityId];
    if (!src || typeof src !== "object") continue;
    for (const part of PARTS) {
      if (!part.fits.includes(facilityId)) continue;
      const n = Math.floor(Number(src[part.id]));
      if (Number.isFinite(n) && n > 0) out[facilityId][part.id] = Math.min(partMax(part, "cluster"), n);
    }
  }
  return out;
}

// Parts a save holds in a plant they no longer fit (the 64 and 128 GB sticks
// left the mine in 0.0.28, where they never added anything). Refund what
// they cost so nobody loses money to the change.
export function unfitRefund(raw) {
  let refund = 0;
  if (!raw || typeof raw !== "object") return 0;
  for (const facilityId of Object.keys(blankFacilities())) {
    const src = raw[facilityId];
    if (!src || typeof src !== "object") continue;
    for (const part of PARTS) {
      if (part.fits.includes(facilityId)) continue;
      const n = Math.min(partMax(part, "cluster"), Math.floor(Number(src[part.id])) || 0);
      for (let i = 0; i < n; i++) refund += partCost(part, i);
    }
  }
  return Number.isFinite(refund) ? refund : 0;
}

export function readNews(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const row of raw) {
    if (!row || typeof row.id !== "string" || typeof row.text !== "string") continue;
    const id = row.id.slice(0, 80);
    const text = row.text.slice(0, 140);
    if (!id || !text || out.some((entry) => entry.id === id)) continue;
    out.push({ id, text });
  }
  return out.slice(-40);
}

export function recentNews(state, count = 3) {
  return readNews(state?.news).slice(-count).reverse().map((entry) => entry.text);
}

// One line per id. Repeats are dropped, and only the latest few stay on the ticker.
export function pushHeadline(state, id, text) {
  if (!state || typeof id !== "string" || typeof text !== "string") return false;
  const news = readNews(state.news);
  if (news.some((entry) => entry.id === id)) return false;
  news.push({ id: id.slice(0, 80), text: text.slice(0, 140) });
  state.news = news.slice(-40);
  return true;
}

function ownedId(state, id) {
  const index = BUSINESSES.findIndex((cfg) => cfg.id === id);
  return index >= 0 ? (state?.biz?.[index]?.owned || 0) : 0;
}

export function facilityUnlocked(state, facilityId) {
  if (facilityId === "servers") return ownedId(state, "cpu") >= 1;
  return ownedId(state, "ai") >= 1;
}

// The Facilities screen opens with its first plant (the research servers).
export function anyFacilityOpen(state) {
  return facilityUnlocked(state, "servers") || facilityUnlocked(state, "mine");
}

export function facilitiesOpen(state) {
  return facilityUnlocked(state, "mine");
}

export function partCost(part, owned) {
  const n = Math.max(0, Math.floor(Number(owned) || 0));
  const cost = part.cost * Math.pow(part.coef, n);
  return Number.isFinite(cost) ? Math.round(cost) : Infinity;
}

function countsOf(state, facilityId) {
  return state?.facilities?.[facilityId] || {};
}

function stock(counts, facilityId) {
  let watts = 0;
  let power = 0;
  let cool = 0;
  let vram = 0;
  let ram = 0;
  let work = 0;
  let gpus = 0;
  let storage = 0;
  for (const part of PARTS) {
    if (!part.fits.includes(facilityId)) continue;
    const n = counts[part.id] || 0;
    if (n <= 0) continue;
    if (part.kind === "gpu" || part.kind === "server") {
      watts += part.watts * n;
      vram += (part.vram || 0) * n;
      work += part.work * n;
      gpus += n;
    } else if (part.kind === "power") power += part.power * n;
    else if (part.kind === "cool") cool += part.cool * n;
    else if (part.kind === "ram") ram += part.gb * n;
    else if (part.kind === "disk") storage += part.gb * n;
  }
  const speed = watts <= 0 ? 0 : Math.min(1, Math.min(power, cool) / watts);
  return { watts, power, cool, vram, ram, work, gpus, speed, storage };
}

function memoryFactor(facilityId, stocked) {
  if (facilityId === "servers") return { factor: 1, limit: null };
  if (facilityId === "mine") {
    if (stocked.ram >= MINE_RAM_GB) return { factor: 1, limit: null };
    return { factor: 0.25, limit: "Needs more RAM" };
  }
  const fit = TIERS.find((tier) => stocked.vram >= tier.vram && stocked.ram >= tier.ram);
  if (fit) return { factor: fit.mult, limit: null, tier: fit.name };
  return { factor: 0.2, limit: stocked.ram < 32 ? "Needs more RAM" : "Needs more VRAM", tier: null };
}

// RAM for the next model up that the cards' memory already allows, or null.
function nextTierRam(stocked) {
  const fit = TIERS.find((tier) => stocked.vram >= tier.vram && stocked.ram >= tier.ram);
  const higher = TIERS.filter((tier) => (!fit || tier.mult > fit.mult) && stocked.vram >= tier.vram && stocked.ram < tier.ram);
  if (!higher.length) return null;
  return Math.min(...higher.map((tier) => tier.ram));
}

function hardwareLimit(stocked, mem) {
  const powerFactor = stocked.gpus <= 0 ? 0 : stocked.speed;
  const memFactor = mem.factor >= 1 ? 1 : mem.factor;
  if (stocked.gpus <= 0) return "Add a GPU";
  if (powerFactor < 0.999 && powerFactor <= memFactor) {
    return stocked.power <= stocked.cool ? "Power limited" : "Cooling limited";
  }
  if (mem.limit && memFactor < 0.999) return mem.limit;
  return "Running full";
}

function rowOf(facilityId, counts) {
  const stocked = stock(counts, facilityId);
  const mem = memoryFactor(facilityId, stocked);
  const running = stocked.gpus > 0 && stocked.work > 0 && stocked.speed > 0;
  const power = running ? (stocked.work * stocked.speed * mem.factor) / REFERENCE_WORK : 0;
  const share = running ? STARTER_SHARE * Math.sqrt(power) : 0;
  return {
    share,
    limit: hardwareLimit(stocked, mem),
    tier: mem.tier || null,
    speed: stocked.speed,
    watts: stocked.watts,
    power: stocked.power,
    cool: stocked.cool,
    vram: stocked.vram,
    ram: stocked.ram,
    gpus: stocked.gpus,
    board: boardOf(facilityId, counts),
  };
}

export function facilityReport(state, businessPerSecond) {
  const biz = Number.isFinite(businessPerSecond) && businessPerSecond > 0 ? businessPerSecond : 0;
  const mine = rowOf("mine", countsOf(state, "mine"));
  const cluster = rowOf("cluster", countsOf(state, "cluster"));
  const servers = rowOf("servers", countsOf(state, "servers"));
  const uncapped = mine.share + cluster.share;
  const share = Math.min(SHARE_CAP, uncapped);
  const scale = uncapped > 0 ? share / uncapped : 0;
  const capped = uncapped > share + 0.0001;
  const dress = (row) => ({
    ...row,
    share: row.share * scale,
    perSecond: row.share * scale * biz,
    limit: capped && row.limit === "Running full" ? "At the income share cap" : row.limit,
  });
  return {
    perSecond: share * biz,
    share,
    capped,
    mine: dress(mine),
    cluster: dress(cluster),
    servers: { ...servers, share: 0, perSecond: 0 },
  };
}

function cheapest(facilityId, kind, counts) {
  let best = null;
  for (const part of PARTS) {
    if (part.soon || part.kind !== kind || !part.fits.includes(facilityId)) continue;
    const owned = counts[part.id] || 0;
    if (owned >= partMax(part, facilityId)) continue;
    if (fitPart(counts, facilityId, part.id).reason) continue;
    const cost = partCost(part, owned);
    if (!best || cost < best.cost) best = { part, cost };
  }
  return best;
}

function hintFor(facilityId, counts, limit) {
  const kind = limit === "Power limited" ? "power"
    : limit === "Cooling limited" ? "cool"
      : limit === "Needs more RAM" ? "ram"
        : limit === "Needs more VRAM" || limit === "Add a GPU" || limit === "Running full" ? "gpu"
          : null;
  if (!kind) return null;
  return cheapest(facilityId, kind, counts);
}

function starterNext(facilityId, counts) {
  for (const id of STARTER[facilityId]) {
    if ((counts[id] || 0) > 0) continue;
    const part = byId[id];
    return { facilityId, partId: id, name: part.name, cost: partCost(part, 0), limit: "starter" };
  }
  return null;
}

// --- Memory boards ---------------------------------------------------------

const RAM_PARTS = PARTS.filter((p) => p.kind === "ram");

// What a plant's board holds now: slots used, total GB, DDR generation.
export function boardOf(facilityId, counts) {
  const board = BOARDS[facilityId];
  if (!board) return null;
  let used = 0;
  let gb = 0;
  let ddr5 = false;
  for (const part of RAM_PARTS) {
    const n = counts?.[part.id] || 0;
    if (!n || !part.fits.includes(facilityId)) continue;
    used += n;
    gb += n * part.gb;
    if (part.gen === "DDR5") ddr5 = true;
  }
  const gen = ddr5 ? "DDR5" : "DDR4";
  const name = facilityId === "cluster" ? `${gen} ${board.name}` : board.name;
  return { slots: board.slots, used, gb, gen, maxGb: board.maxGb, name };
}

// Half of what the last sticks bought (from count `from` down to `to`) cost.
function soldBack(part, from, to) {
  let total = 0;
  for (let i = to; i < from; i++) total += partCost(part, i);
  return total * SELL_BACK;
}

// Add one part under the board rules. Returns { counts, refund, note } or
// { reason } when it can't go in.
export function fitPart(counts, facilityId, partId) {
  const part = byId[partId];
  const owned = counts?.[partId] || 0;
  if (!part) return { reason: "Unknown part." };
  if (part.kind !== "ram" && owned >= MAX_PART) return { reason: "At the most you can own." };
  const next = { ...counts, [partId]: owned + 1 };
  const board = BOARDS[facilityId];
  if (part.kind !== "ram" || !board) return { counts: next, refund: 0, note: null };
  let refund = 0;
  const notes = [];
  const otherGen = RAM_PARTS.filter((p) => p.gen !== part.gen && (counts?.[p.id] || 0) > 0);
  if (otherGen.length) {
    if (part.gen === "DDR4") return { reason: "This board takes DDR5 now." };
    let sticks = 0;
    for (const other of otherGen) {
      refund += soldBack(other, counts[other.id], 0);
      sticks += counts[other.id];
      delete next[other.id];
    }
    notes.push(`switches to a DDR5 board (${sticks} DDR4 stick${sticks === 1 ? "" : "s"} sold back)`);
  }
  const used = RAM_PARTS.reduce((sum, p) => sum + (next[p.id] || 0), 0);
  if (used > board.slots) {
    const smallest = RAM_PARTS.filter((p) => (next[p.id] || 0) > (p.id === partId ? 1 : 0)).sort((a, b) => a.gb - b.gb)[0];
    if (!smallest || smallest.gb >= part.gb) return { reason: `All ${board.slots} memory slots are full.` };
    refund += soldBack(smallest, next[smallest.id], next[smallest.id] - 1);
    next[smallest.id] -= 1;
    if (!next[smallest.id]) delete next[smallest.id];
    notes.push(`replaces a ${smallest.gb} GB stick`);
  }
  const gb = RAM_PARTS.reduce((sum, p) => sum + (next[p.id] || 0) * p.gb, 0);
  if (gb > board.maxGb) return { reason: `The board takes ${board.maxGb} GB at most.` };
  return { counts: next, refund, note: notes.join("; ") || null };
}

// Old saves: drop parts that no longer fit their plant, DDR4 sticks sharing a
// board with DDR5, and sticks beyond a board's slots or size, refunding what
// they cost in full (the rules changed, not the player).
export function migrateFacilities(raw) {
  const facilities = readFacilities(raw);
  let refund = unfitRefund(raw);
  for (const facilityId of Object.keys(BOARDS)) {
    const counts = facilities[facilityId];
    const board = BOARDS[facilityId];
    const full = (part, n) => {
      let total = 0;
      for (let i = 0; i < n; i++) total += partCost(part, i);
      return total;
    };
    if (RAM_PARTS.some((p) => p.gen === "DDR5" && counts[p.id]) && RAM_PARTS.some((p) => p.gen === "DDR4" && counts[p.id])) {
      for (const p of RAM_PARTS.filter((x) => x.gen === "DDR4" && counts[x.id])) {
        refund += full(p, counts[p.id]);
        delete counts[p.id];
      }
    }
    const order = RAM_PARTS.filter((p) => counts[p.id]).sort((a, b) => a.gb - b.gb);
    for (const p of order) {
      while (counts[p.id] && (boardOf(facilityId, counts).used > board.slots || boardOf(facilityId, counts).gb > board.maxGb)) {
        refund += partCost(p, counts[p.id] - 1);
        counts[p.id] -= 1;
        if (!counts[p.id]) delete counts[p.id];
      }
    }
  }
  return { facilities, refund: Number.isFinite(refund) ? refund : 0 };
}

function applyPart(state, facilityId, partId) {
  const facilities = readFacilities(state?.facilities);
  const fit = fitPart(facilities[facilityId], facilityId, partId);
  if (fit.reason) return null;
  facilities[facilityId] = fit.counts;
  return { state: { ...state, facilities }, refund: fit.refund, note: fit.note };
}

function withPart(state, facilityId, partId) {
  return applyPart(state, facilityId, partId)?.state || null;
}

export function nextPurchase(state, businessPerSecond) {
  if (!facilitiesOpen(state)) return null;
  const mineStarter = starterNext("mine", countsOf(state, "mine"));
  if (mineStarter) return mineStarter;
  const clusterStarter = starterNext("cluster", countsOf(state, "cluster"));
  if (clusterStarter) {
    const added = marginal(state, clusterStarter, businessPerSecond);
    if (added > 0 && clusterStarter.cost / added <= 15 * 60) return clusterStarter;
  }
  let best = null;
  for (const facilityId of ["mine", "cluster"]) {
    const counts = countsOf(state, facilityId);
    for (const part of PARTS) {
      if (part.soon || !part.fits.includes(facilityId)) continue;
      const owned = counts[part.id] || 0;
      if (owned >= partMax(part, facilityId)) continue;
      const offer = { facilityId, partId: part.id, name: part.name, cost: partCost(part, owned) };
      // A part is worth what it adds once the plant has the power, cooling
      // and memory to run it; a card alone may only be throttled, and a power
      // supply alone does nothing while cooling is short. Judge each part with
      // the cheapest extras it needs, so the suggestion never stalls.
      const plan = withSupport(state, facilityId, part.id);
      if (!plan) continue;
      const before = facilityReport(state, businessPerSecond).perSecond;
      const added = facilityReport(plan.state, businessPerSecond).perSecond - before;
      if (!(added > 0)) continue;
      const payback = plan.cost / added;
      if (payback > 15 * 60) continue;
      if (!best || payback < best.payback) best = { ...offer, payback, bundleCost: plan.cost, extras: plan.extras };
    }
  }
  return best;
}

// Add one part, then the cheapest power, cooling and memory until the plant
// runs at full speed (at most a few parts). Returns the new state, the total cost and
// the names of the extra parts, or null if it can't be supported.
export function supportPlan(state, facilityId, partId) {
  return withSupport(state, facilityId, partId);
}

function withSupport(state, facilityId, partId) {
  const first = applyPart(state, facilityId, partId);
  if (!first) return null;
  let next = first.state;
  let cost = partCost(byId[partId], countsOf(state, facilityId)[partId] || 0) - first.refund;
  const extras = [];
  const notes = first.note ? [first.note] : [];
  const add = (id) => {
    const owned = countsOf(next, facilityId)[id] || 0;
    const step = applyPart(next, facilityId, id);
    if (!step) return false;
    next = step.state;
    cost += partCost(byId[id], owned) - step.refund;
    extras.push(byId[id].name);
    if (step.note && !notes.includes(step.note)) notes.push(step.note);
    return true;
  };
  // A memory stick for the cluster is judged as the sticks it takes to reach
  // the next model the cards' memory allows; one stick on its own often adds
  // nothing until the set is complete.
  if (facilityId === "cluster" && byId[partId]?.kind === "ram") {
    const goal = nextTierRam(stock(countsOf(state, facilityId), facilityId));
    for (let i = 0; goal && i < BOARDS.cluster.slots; i++) {
      if (stock(countsOf(next, facilityId), facilityId).ram >= goal) break;
      if (!add(partId)) return null;
    }
  }
  for (let i = 0; i < 8; i++) {
    const counts = countsOf(next, facilityId);
    const stocked = stock(counts, facilityId);
    const mem = memoryFactor(facilityId, stocked);
    let kind = null;
    if (stocked.power < stocked.watts) kind = "power";
    else if (stocked.cool < stocked.watts) kind = "cool";
    else if (mem.limit === "Needs more RAM") kind = "ram";
    else if (facilityId === "servers" && stocked.storage < 1000) kind = "disk";
    if (!kind) return { state: next, cost, extras, notes };
    const pick = cheapest(facilityId, kind, counts);
    if (!pick || !add(pick.part.id)) return null;
  }
  return null;
}

function marginal(state, offer, businessPerSecond) {
  const before = facilityReport(state, businessPerSecond).perSecond;
  const next = withPart(state, offer.facilityId, offer.partId);
  if (!next) return 0;
  const after = facilityReport(next, businessPerSecond).perSecond;
  return Math.max(0, after - before);
}

export function facilityHint(state, facilityId, businessPerSecond) {
  if (!facilityUnlocked(state, facilityId)) {
    return facilityId === "servers" ? "Requires 1971" : "Own an AI Accelerator to open the plant.";
  }
  const counts = countsOf(state, facilityId);
  const row = facilityReport(state, businessPerSecond)[facilityId];
  const starter = starterNext(facilityId, counts);
  if (starter) return `Next: ${starter.name}`;
  const hinted = hintFor(facilityId, counts, row.limit);
  if (!hinted || row.limit === "Running full" || row.limit === "At the income share cap") {
    return row.limit === "At the income share cap"
      ? "The businesses set the ceiling. A richer company lets this plant pay more."
      : "Next: add another graphics card when you can power and cool it.";
  }
  return `Next: ${hinted.part.name}`;
}

const PLANT_NAME = { mine: "BITBARK MINE", cluster: "TRAINING CLUSTER", servers: "RESEARCH SERVERS" };

// Headlines fire once each. Part copies after the first do not make news.
export function noteFacilityNews(state, businessPerSecond) {
  if (!state) return false;
  let added = false;
  const push = (id, text) => {
    if (pushHeadline(state, id, text)) added = true;
  };
  if (facilitiesOpen(state)) push("plant-open", "SIDE PLANT CLEARED BESIDE THE AI ACCELERATORS");
  if (facilityUnlocked(state, "servers")) push("servers-open", "RESEARCH SERVERS CLEARED BESIDE THE MICROPROCESSORS");
  const report = facilityReport(state, businessPerSecond);
  for (const facilityId of ["mine", "cluster", "servers"]) {
    const counts = countsOf(state, facilityId);
    if (facilityId === "servers" ? (counts.rack1 || 0) > 0 : report[facilityId].perSecond > 0) {
      const live = facilityId === "mine"
        ? "BITBARK MINE POURS ITS FIRST COIN"
        : facilityId === "cluster"
          ? "TRAINING CLUSTER BOOKS AN OVERNIGHT RUN"
          : "RESEARCH SERVERS START MAKING R&D POINTS";
      push(`${facilityId}-live`, live);
    }
    for (const [partId, count] of Object.entries(counts)) {
      if (!(count > 0) || !PART_NEWS[partId]) continue;
      push(`part-${facilityId}-${partId}`, `${PART_NEWS[partId]} · ${PLANT_NAME[facilityId]}`);
    }
  }
  if (report.share >= SHARE_CAP - 0.0001) push("share-full", "SIDE PLANT HITS ITS FULL SHARE OF THE TAKE");
  return added;
}

// --- Rebuild ---------------------------------------------------------------
// Plants start empty after a prestige or fork. The last run's layout is kept
// (state.lastPlants) so one button can buy it back as far as cash allows.

export function plantsHaveParts(facilities) {
  const f = readFacilities(facilities);
  return Object.values(f).some((counts) => Object.values(counts).some((n) => n > 0));
}

// The parts still missing from the last layout, in the mine and cluster.
// The research servers aren't rebuilt: the sim showed last run's racks cost
// more early in a run than the extra R&D is worth (Quantum came 0.4 h later).
export const REBUILD_PLANTS = ["mine", "cluster"];

export function rebuildList(state) {
  const target = readFacilities(state?.lastPlants);
  const now = readFacilities(state?.facilities);
  const list = [];
  for (const facilityId of REBUILD_PLANTS) {
    if (!facilityUnlocked(state, facilityId)) continue;
    for (const [partId, want] of Object.entries(target[facilityId])) {
      const part = byId[partId];
      if (!part || part.soon || !part.fits.includes(facilityId)) continue;
      const have = now[facilityId]?.[partId] || 0;
      const goal = Math.min(partMax(part, facilityId), want);
      if (goal <= have) continue;
      if (fitPart(now[facilityId], facilityId, partId).reason) continue;
      list.push({ facilityId, partId, have, want: goal });
    }
  }
  return list;
}

// What the rest of the rebuild would cost, and how many parts it is.
export function rebuildCost(state) {
  let cost = 0;
  let parts = 0;
  for (const row of rebuildList(state)) {
    for (let n = row.have; n < row.want; n++) cost += partCost(byId[row.partId], n);
    parts += row.want - row.have;
  }
  return { cost, parts };
}

// Rebuild only buys what's worth it at this point of the run: a part waits
// until it pays for itself within PAYBACK_SECONDS, the rule the
// best-next-part suggestion uses. (REBUILD_SECONDS is the cost limit for a
// server part, kept for if servers join the rebuild.) Early in a run, last run's
// dearest parts would otherwise drain the cash the businesses need (the sim
// showed a slower run when it bought them anyway).
export const REBUILD_SECONDS = 300;
export const PAYBACK_SECONDS = 15 * 60;

function rebuildOk(state, row, cost, limits) {
  if (!limits) return true;
  if (row.facilityId === "servers") return cost <= limits.maxCost;
  const plan = withSupport(state, row.facilityId, row.partId);
  if (!plan) return false;
  const biz = limits.businessPerSecond || 0;
  const added = facilityReport(plan.state, biz).perSecond - facilityReport(state, biz).perSecond;
  return added > 0 && plan.cost / added <= PAYBACK_SECONDS;
}

// How many missing parts are worth buying right now.
export function rebuildReady(state, limits) {
  let parts = 0;
  let cheapestCost = null;
  for (const row of rebuildList(state)) {
    const cost = partCost(byId[row.partId], row.have);
    if (!rebuildOk(state, row, cost, limits)) continue;
    parts += 1;
    if (cheapestCost == null || cost < cheapestCost) cheapestCost = cost;
  }
  return { parts, cheapestCost };
}

// Buy the missing parts that are worth it, cheapest first (so power and
// cooling arrive with the cards), until cash runs out or nothing else is worth
// it yet. Returns how many parts and how much was spent.
export function rebuildPlants(state, limits = null) {
  let bought = 0;
  let spent = 0;
  for (let guard = 0; guard < 500; guard++) {
    let best = null;
    for (const row of rebuildList(state)) {
      const cost = partCost(byId[row.partId], row.have);
      if (best && cost >= best.cost) continue;
      if (!rebuildOk(state, row, cost, limits)) continue;
      best = { ...row, cost };
    }
    if (!best || !(state.cash >= best.cost)) break;
    const done = purchasePart(state, best.facilityId, best.partId);
    if (!done.ok) break;
    bought++;
    spent += done.cost;
  }
  return { bought, spent };
}

export function purchasePart(state, facilityId, partId) {
  if (!state || !facilityUnlocked(state, facilityId)) return { ok: false };
  const part = byId[partId];
  if (!part || part.soon || !part.fits.includes(facilityId)) return { ok: false };
  const facilities = readFacilities(state.facilities);
  const owned = facilities[facilityId][partId] || 0;
  const fit = fitPart(facilities[facilityId], facilityId, partId);
  if (fit.reason) return { ok: false, reason: fit.reason };
  const cost = partCost(part, owned);
  if (!Number.isFinite(state.cash) || !(state.cash >= cost)) return { ok: false };
  state.cash -= cost;
  state.cash += fit.refund;
  facilities[facilityId] = fit.counts;
  state.facilities = facilities;
  return { ok: true, cost, refund: fit.refund, note: fit.note };
}
