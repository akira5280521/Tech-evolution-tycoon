// Timed research. Research Data comes only from the server plant. Projects
// keep running while the app is closed. A project can start only after the
// company's newest era is at least as new as the project's real year, and
// after its prerequisite is done. Locked rows say "Requires 2020", never an
// era name.
//
// CPU and GPU pay bonuses still follow how many of that row you own, and
// also this list once researchDone is present. The first generation of a row
// stays free so a new microprocessor works before any project.

import { BUSINESSES } from "./gameConfig.js";
import { GENERATIONS } from "./generations.js";
import { PARTS, pushHeadline, readFacilities } from "./facilities.js";

export const RESEARCH_TABS = [
  { id: "cpu", label: "CPU" },
  { id: "gpu", label: "GPU" },
  { id: "memory", label: "MEMORY" },
  { id: "storage", label: "STORAGE" },
  { id: "cooling", label: "COOLING" },
  { id: "power", label: "POWER" },
  { id: "network", label: "NETWORK" },
];

const ERA_YEAR = {
  timber: 1,
  paper: 105,
  loom: 1804,
  punchcards: 1890,
  relay: 1941,
  sand: 1943,
  copper: 1943,
  glass: 1945,
  filament: 1945,
  tubes: 1946,
  mainframes: 1951,
  germanium: 1948,
  transistors: 1954,
  silicon: 1959,
  wafers: 1960,
  ics: 1965,
  minis: 1965,
  cpu: 1971,
  homepc: 1977,
  consoles: 1977,
  dialup: 1991,
  gpu: 1999,
  cloud: 2006,
  phones: 2007,
  rgb: 2015,
  ai: 2016,
  quantum: 2019,
};

const RD_PER_WORK = 0.25;
const RD_CAP = 1e9;

function item(row) {
  return row;
}

export const RESEARCH = [
  item({ id: "cpu-4bit", tab: "cpu", year: 1971, name: "Chipwright 4004", spec: "4-bit, 740 kHz, about 2,300 transistors", rd: 8, durationMs: 20_000, prereq: null }),
  item({ id: "cpu-8080", tab: "cpu", year: 1974, name: "Chipwright 8080", spec: "8-bit, 2 MHz, 40-pin package", rd: 12, durationMs: 30_000, prereq: "cpu-4bit" }),
  item({ id: "cpu-8086", tab: "cpu", year: 1978, name: "Chipwright 8086", spec: "16-bit, 5–10 MHz, about 29,000 transistors", rd: 16, durationMs: 40_000, prereq: "cpu-8080" }),
  item({ id: "cpu-286", tab: "cpu", year: 1982, name: "Chipwright 286", spec: "16-bit, 6–12 MHz, 24-bit addresses", rd: 20, durationMs: 50_000, prereq: "cpu-8086" }),
  item({ id: "cpu-386", tab: "cpu", year: 1985, name: "Chipwright 386", spec: "32-bit, first sold at 16 MHz, about 275,000 transistors", rd: 24, durationMs: 60_000, prereq: "cpu-286" }),
  item({ id: "cpu-486", tab: "cpu", year: 1989, name: "Chipwright 486", spec: "25–50 MHz, cache and floating point on the chip", rd: 28, durationMs: 70_000, prereq: "cpu-386" }),
  item({ id: "cpu-pentium", tab: "cpu", year: 1993, name: "Chipwright Pentium", spec: "Superscalar, 60 MHz at launch, about 3.1 million transistors", rd: 32, durationMs: 80_000, prereq: "cpu-486" }),
  item({ id: "cpu-alder64", tab: "cpu", year: 2003, name: "Alder 64", spec: "64-bit PC chip, 130 nm", rd: 40, durationMs: 90_000, prereq: "cpu-pentium" }),
  item({ id: "cpu-dual", tab: "cpu", year: 2005, name: "Chipwright Dual", spec: "Two cores, first desktop parts at 2.8 GHz", rd: 48, durationMs: 100_000, prereq: "cpu-alder64" }),
  item({ id: "cpu-alder32", tab: "cpu", year: 2017, name: "Alder 32", spec: "Up to 32 cores, four chips on one package", rd: 60, durationMs: 120_000, prereq: "cpu-dual" }),

  item({ id: "gpu-2d", tab: "gpu", year: 1990, name: "Rasterline 4000", spec: "2D SVGA, ISA, up to 1024×768", rd: 16, durationMs: 40_000, prereq: null }),
  item({ id: "gpu-3d", tab: "gpu", year: 1996, name: "Threefold Add-in", spec: "3D only, PCI, 4 MB", rd: 20, durationMs: 50_000, prereq: "gpu-2d" }),
  item({ id: "gpu-256", tab: "gpu", year: 1999, name: "Novidia 256", spec: "Hardware transform and lighting", rd: 24, durationMs: 60_000, prereq: "gpu-3d" }),
  item({ id: "gpu-3", tab: "gpu", year: 2001, name: "Novidia 3", spec: "Programmable vertex and pixel shaders", rd: 28, durationMs: 70_000, prereq: "gpu-256" }),
  item({ id: "gpu-8800", tab: "gpu", year: 2006, name: "Novidia 8800", spec: "128 unified processors, 768 MB", rd: 36, durationMs: 80_000, prereq: "gpu-3" }),
  item({ id: "gpu-100", tab: "gpu", year: 2017, name: "Novidia 100", spec: "Tensor cores, 16 GB stacked memory", rd: 48, durationMs: 90_000, prereq: "gpu-8800" }),
  item({ id: "gpu-2080", tab: "gpu", year: 2018, name: "Novidia 2080", spec: "First consumer card with ray-tracing cores", rd: 56, durationMs: 100_000, prereq: "gpu-100" }),

  item({ id: "mem-dram", tab: "memory", year: 1970, name: "1K DRAM", spec: "1 kilobit dynamic RAM, the chip that replaced cores", rd: 8, durationMs: 20_000, prereq: null }),
  item({ id: "mem-simm", tab: "memory", year: 1988, name: "30-pin SIMM", spec: "8-bit module, typically 1–4 MB", rd: 16, durationMs: 40_000, prereq: "mem-dram" }),
  item({ id: "mem-sdram", tab: "memory", year: 1993, name: "SDRAM", spec: "Synchronous DRAM, 66–133 MHz", rd: 20, durationMs: 50_000, prereq: "mem-simm" }),
  item({ id: "mem-ddr", tab: "memory", year: 2000, name: "DDR-266", spec: "DDR SDRAM, PC2100, 2.1 GB/s", rd: 24, durationMs: 55_000, prereq: "mem-sdram" }),
  item({ id: "mem-ddr2", tab: "memory", year: 2003, name: "DDR2-800", spec: "DDR2, PC2-6400, 6.4 GB/s", rd: 28, durationMs: 60_000, prereq: "mem-ddr" }),
  item({ id: "mem-ddr3", tab: "memory", year: 2007, name: "DDR3-1600", spec: "DDR3, PC3-12800, 12.8 GB/s", rd: 32, durationMs: 70_000, prereq: "mem-ddr2" }),
  item({ id: "mem-ddr4", tab: "memory", year: 2014, name: "DDR4-3200", spec: "DDR4, PC4-25600, 25.6 GB/s", rd: 40, durationMs: 80_000, prereq: "mem-ddr3" }),
  item({ id: "mem-ddr5", tab: "memory", year: 2020, name: "DDR5-4800", spec: "DDR5, PC5-38400, 38.4 GB/s", rd: 64, durationMs: 120_000, prereq: "mem-ddr4" }),
  item({ id: "mem-ddr6", tab: "memory", year: 2024, name: "DDR6", spec: "Next memory module", rd: 0, durationMs: 0, prereq: "mem-ddr5", soon: true }),

  item({ id: "store-hdd", tab: "storage", year: 1956, name: "5 MB disk", spec: "IBM 350-class disk, 5 million characters", rd: 8, durationMs: 25_000, prereq: null }),
  item({ id: "store-floppy", tab: "storage", year: 1971, name: "8-inch floppy", spec: "About 80 KB on the first disks", rd: 12, durationMs: 30_000, prereq: "store-hdd" }),
  item({ id: "store-scsi", tab: "storage", year: 1986, name: "SCSI", spec: "Parallel bus for disks, later 5–10 MB/s", rd: 16, durationMs: 40_000, prereq: "store-floppy" }),
  item({ id: "store-sata", tab: "storage", year: 2003, name: "SATA", spec: "Serial ATA, 1.5 Gbit/s at launch", rd: 24, durationMs: 50_000, prereq: "store-scsi" }),
  item({ id: "store-ssd", tab: "storage", year: 2008, name: "SSD", spec: "NAND flash disk, no spinning platter", rd: 32, durationMs: 60_000, prereq: "store-sata" }),
  item({ id: "store-nvme", tab: "storage", year: 2013, name: "NVMe", spec: "Flash on PCI Express, not a SATA bridge", rd: 40, durationMs: 70_000, prereq: "store-ssd" }),

  item({ id: "cool-sink", tab: "cooling", year: 1982, name: "Clip heatsink", spec: "Aluminium block clipped to a 286-class chip", rd: 8, durationMs: 20_000, prereq: null }),
  item({ id: "cool-fan", tab: "cooling", year: 1994, name: "Case fan", spec: "80 mm fan, a few watts of airflow", rd: 12, durationMs: 30_000, prereq: "cool-sink" }),
  item({ id: "cool-pipe", tab: "cooling", year: 2001, name: "Heatpipe tower", spec: "Heatpipes into a fin stack", rd: 20, durationMs: 45_000, prereq: "cool-fan" }),
  item({ id: "cool-liquid", tab: "cooling", year: 2008, name: "360 mm loop", spec: "External radiator, about 700 W of heat", rd: 28, durationMs: 60_000, prereq: "cool-pipe" }),
  item({ id: "cool-immersion", tab: "cooling", year: 2023, name: "Immersion bath", spec: "The rack sits in a dielectric bath", rd: 0, durationMs: 0, prereq: "cool-liquid", soon: true }),

  item({ id: "pwr-at", tab: "power", year: 1984, name: "AT supply", spec: "Hard-switched AT box, typically under 200 W", rd: 8, durationMs: 20_000, prereq: null }),
  item({ id: "pwr-atx", tab: "power", year: 1995, name: "ATX supply", spec: "Soft power, 20-pin then 24-pin", rd: 14, durationMs: 35_000, prereq: "pwr-at" }),
  item({ id: "pwr-80", tab: "power", year: 2004, name: "80 Plus", spec: "80% efficient at 20, 50 and 100% load", rd: 20, durationMs: 45_000, prereq: "pwr-atx" }),
  item({ id: "pwr-gold", tab: "power", year: 2008, name: "80 Plus Gold", spec: "87–90% efficient", rd: 28, durationMs: 55_000, prereq: "pwr-80" }),
  item({ id: "pwr-plat", tab: "power", year: 2009, name: "80 Plus Platinum", spec: "90–94% efficient", rd: 36, durationMs: 65_000, prereq: "pwr-gold" }),

  item({ id: "net-eth", tab: "network", year: 1980, name: "10BASE5", spec: "10 Mbit/s over thick coaxial", rd: 8, durationMs: 25_000, prereq: null }),
  item({ id: "net-100", tab: "network", year: 1995, name: "100BASE-TX", spec: "100 Mbit/s over twisted pair", rd: 14, durationMs: 35_000, prereq: "net-eth" }),
  item({ id: "net-wifi", tab: "network", year: 1997, name: "802.11", spec: "First Wi-Fi, 1–2 Mbit/s", rd: 18, durationMs: 40_000, prereq: "net-100" }),
  item({ id: "net-gige", tab: "network", year: 1999, name: "1000BASE-T", spec: "Gigabit Ethernet over copper", rd: 22, durationMs: 50_000, prereq: "net-wifi" }),
  item({ id: "net-n", tab: "network", year: 2009, name: "Wi-Fi 4", spec: "802.11n, up to 600 Mbit/s", rd: 30, durationMs: 60_000, prereq: "net-gige" }),
  item({ id: "net-ac", tab: "network", year: 2013, name: "Wi-Fi 5", spec: "802.11ac, gigabit wireless", rd: 36, durationMs: 70_000, prereq: "net-n" }),
  item({ id: "net-ax", tab: "network", year: 2019, name: "Wi-Fi 6", spec: "802.11ax, OFDMA", rd: 44, durationMs: 80_000, prereq: "net-ac" }),
  item({ id: "net-be", tab: "network", year: 2024, name: "Wi-Fi 7", spec: "802.11be", rd: 0, durationMs: 0, prereq: "net-ax", soon: true }),
];

const byId = Object.fromEntries(RESEARCH.map((entry) => [entry.id, entry]));

export function researchItem(id) {
  return byId[id] || null;
}

export function playerYear(state) {
  let year = 0;
  const biz = state?.biz || [];
  BUSINESSES.forEach((cfg, index) => {
    if ((biz[index]?.owned || 0) > 0) year = Math.max(year, ERA_YEAR[cfg.id] || 0);
  });
  return year;
}

export function readTechDone(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const id of raw) {
    if (typeof id === "string" && byId[id] && !out.includes(id)) out.push(id);
  }
  return out.slice(0, RESEARCH.length);
}

export function readResearchData(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(RD_CAP, n);
}

export function readTechJob(raw) {
  if (!raw || typeof raw !== "object") return null;
  const entry = byId[raw.id];
  if (!entry || entry.soon) return null;
  const durationMs = entry.durationMs;
  let progress = Number(raw.progressMs);
  if (!Number.isFinite(progress) || progress < 0) progress = 0;
  if (progress > durationMs) progress = durationMs;
  return { id: entry.id, progressMs: progress, durationMs };
}

export function serverOutput(state) {
  const counts = readFacilities(state?.facilities).servers || {};
  let watts = 0;
  let power = 0;
  let cool = 0;
  let work = 0;
  let storage = 0;
  for (const part of PARTS) {
    if (!part.fits?.includes("servers")) continue;
    const n = counts[part.id] || 0;
    if (n <= 0) continue;
    if (part.kind === "server") {
      watts += (part.watts || 0) * n;
      work += (part.work || 0) * n;
    } else if (part.kind === "power") power += (part.power || 0) * n;
    else if (part.kind === "cool") cool += (part.cool || 0) * n;
    else if (part.kind === "disk") storage += (part.gb || 0) * n;
  }
  const speed = watts <= 0 ? 0 : Math.min(1, Math.min(power, cool) / watts);
  const disk = storage >= 1000 ? 1 : storage > 0 ? 0.5 : 0.25;
  return { work, speed, storage, perSecond: work * speed * disk * RD_PER_WORK };
}

export function researchSpeed(state) {
  const out = serverOutput(state);
  return Math.min(8, 1 + out.work * out.speed * 0.08);
}

export function researchRows(tab) {
  return RESEARCH.filter((entry) => entry.tab === tab).slice().sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));
}

export function researchLock(state, entry) {
  if (!entry || entry.soon) return entry?.soon ? "Coming soon" : "Locked";
  const year = playerYear(state);
  if (year < entry.year) return `Requires ${entry.year}`;
  if (entry.prereq && !(state?.techDone || []).includes(entry.prereq)) {
    const prior = byId[entry.prereq];
    return prior ? `Requires ${prior.year}` : "Locked";
  }
  return null;
}

export function canStartResearch(state, id) {
  const entry = byId[id];
  if (!entry || entry.soon) return false;
  if (state?.techJob) return false;
  if ((state?.techDone || []).includes(id)) return false;
  if (researchLock(state, entry)) return false;
  return readResearchData(state?.researchData) >= entry.rd;
}

export function startResearch(state, id) {
  const entry = byId[id];
  if (!canStartResearch(state, id)) return { ok: false };
  state.researchData = readResearchData(state.researchData) - entry.rd;
  state.techJob = { id: entry.id, progressMs: 0, durationMs: entry.durationMs };
  pushHeadline(state, `rd-start-${entry.id}`, `R&D: ${entry.name.toUpperCase()} RESEARCH STARTS`);
  return { ok: true };
}

function finishResearch(state, id) {
  const entry = byId[id];
  if (!entry) return;
  const done = readTechDone(state.techDone);
  if (!done.includes(id)) done.push(id);
  state.techDone = done;
  state.techJob = null;
  pushHeadline(state, `rd-done-${id}`, `R&D: ${entry.name.toUpperCase()} RESEARCH COMPLETE`);
}

// ms of real time. Servers make the bar move faster than the wall clock.
// Research Data accrues at the plant's full rate, online or offline.
export function advanceResearch(state, ms) {
  if (!state || !(ms > 0) || !Number.isFinite(ms)) return false;
  const gain = serverOutput(state).perSecond * (ms / 1000);
  if (gain > 0) state.researchData = Math.min(RD_CAP, readResearchData(state.researchData) + gain);
  const job = readTechJob(state.techJob);
  if (!job) {
    state.techJob = null;
    return gain > 0;
  }
  state.techJob = job;
  job.progressMs = Math.min(job.durationMs, job.progressMs + ms * researchSpeed(state));
  if (job.progressMs >= job.durationMs - 0.001) {
    finishResearch(state, job.id);
    return true;
  }
  return gain > 0;
}

export function grantOwnedResearch(state) {
  const done = new Set(readTechDone(state?.techDone));
  const biz = state?.biz || [];
  for (const rowId of ["cpu", "gpu"]) {
    const index = BUSINESSES.findIndex((cfg) => cfg.id === rowId);
    const owned = index >= 0 ? (biz[index]?.owned || 0) : 0;
    for (const gen of GENERATIONS[rowId] || []) {
      if (owned >= gen.need && byId[gen.id]) done.add(gen.id);
    }
  }
  state.techDone = [...done];
}

// Prerequisites that are not themselves generation ids still block the chain.
// Owned-count grants only the generation ids, so a migrated 386 is done even
// if 286 was never a generation. Fill the gaps so the chain stays consistent.
export function fillResearchGaps(state) {
  const done = new Set(readTechDone(state?.techDone));
  let changed = true;
  while (changed) {
    changed = false;
    for (const entry of RESEARCH) {
      if (entry.soon || !done.has(entry.id) || !entry.prereq || done.has(entry.prereq)) continue;
      // Only back-fill a missing prerequisite when a later generation the
      // player already earned implies they passed that year.
      done.add(entry.prereq);
      changed = true;
    }
  }
  state.techDone = [...done];
}
