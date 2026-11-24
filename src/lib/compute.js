// Compute power and Moore's Law.
//
// Compute power: every supercomputer cabinet and compute card in your plants
// at its double-precision (FP64) peak, the measure the TOP500 list uses. As it
// grows it passes the real record holders, each worth a few era tokens.
//
// Moore's Law: real transistor counts for the PC chips in the game, against
// the line that starts at the 4004 and doubles every two years.
import { PARTS } from "./facilities.js";

const M = 1e6;
const G = 1e9;
const T = 1e12;
const P = 1e15;

// FP64 peak for one of each part. From each part's own spec line where it
// gives one; the cabinets from their real systems' totals.
export const PART_FLOPS = {
  cray1: 160 * M, // 160 MFLOPS
  xmp: 800 * M, // X-MP/48: four processors, 200 MFLOPS each
  cray2: 1.9 * G, // four processors, 1.9 GFLOPS
  ymp: 2.664 * G, // eight processors, 333 MFLOPS each
  c90: 16 * G, // sixteen processors, 16 GFLOPS
  cm5: 131 * G, // 1,024 nodes, 128 MFLOPS each with their vector units
  t3d: 307 * G, // 2,048 Alpha chips at 150 MFLOPS
  t90: 58 * G, // 32 vector processors, 58 GFLOPS
  t3e: 1.2 * T, // 2,048 processors, 1.2 TFLOPS
  xt3: 461 * G, // one cabinet: 96 Opteron sockets at 2.4 GHz, 4.8 GFLOPS each
  xt5: 6.9 * T, // one cabinet: Jaguar's 1.38 PFLOPS over 200 cabinets
  xc30: 99.5 * T, // one cabinet: 384 twelve-core 2.7 GHz chips, 259 GFLOPS each
  crayex: 22.8 * P, // one cabinet: Frontier's 1.685 EFLOPS peak over 74 cabinets
  raster1080: 0.277 * T,
  tensorP100: 5.3 * T,
  tensorV100: 7.8 * T,
  raster3060: 0.199 * T,
  raster3090: 0.556 * T,
  raster4090: 1.29 * T,
  tensorA100: 9.7 * T,
  tensorH100: 34 * T,
  tensorB200: 37 * T,
};

export function computePower(state) {
  let total = 0;
  for (const counts of Object.values(state?.facilities || {})) {
    if (!counts || typeof counts !== "object") continue;
    for (const [id, n] of Object.entries(counts)) {
      const flops = PART_FLOPS[id];
      if (flops && n > 0) total += flops * Math.floor(n);
    }
  }
  return total;
}

// The record holders, at their measured (Linpack) speed where there is one.
// Company names are parody; lab machines keep their real names.
export const COMPUTE_RECORDS = [
  { id: "chippewa1", name: "Chippewa 1", year: 1976, flops: 160 * M, text: "The 1976 Chippewa 1 ran at 160 MFLOPS. Its C-shaped frame kept the wires short, and the bench round it hid the power supplies." },
  { id: "gigaflop", name: "Chippewa 2", year: 1985, flops: 1.41 * G, text: "In 1985 the Chippewa 2 measured 1.41 GFLOPS, the first machine past a billion operations a second. Its boards sat in a bath of Fluorinert." },
  { id: "asci-red", name: "ASCI Red", year: 1997, flops: 1.068 * T, text: "In June 1997 ASCI Red at Sandia measured 1.068 TFLOPS, the first teraflop: thousands of ordinary PC processors working together." },
  { id: "earth-sim", name: "Earth Simulator", year: 2002, flops: 35.86 * T, text: "In 2002 Japan's Earth Simulator measured 35.86 TFLOPS, about five times the machine before it, to model the climate and earthquakes." },
  { id: "roadrunner", name: "Roadrunner", year: 2008, flops: 1.026 * P, text: "In 2008 Roadrunner at Los Alamos measured 1.026 PFLOPS, the first petaflop. It paired ordinary server chips with game-console chips." },
  { id: "summit", name: "Summit", year: 2018, flops: 122.3 * P, text: "In June 2018 Summit at Oak Ridge measured 122.3 PFLOPS, with six graphics cards beside every pair of server chips." },
];

export const COMPUTE_RECORD_TOKENS = 10;

// The next step past the records here: out of reach for one machine room.
export const EXAFLOP_NOTE = "In May 2022 Frontier at Oak Ridge measured 1.102 EFLOPS, the first exaflop: 74 cabinets, more than any one company's machine room here.";

// Records passed for the first time. They're kept forever, through prestige.
export function noteComputeRecords(state) {
  const have = computePower(state);
  const done = new Set(state.computeRecords || []);
  const out = [];
  for (const r of COMPUTE_RECORDS) {
    if (done.has(r.id) || have < r.flops) continue;
    done.add(r.id);
    out.push(r);
    state.tokens = (state.tokens || 0) + COMPUTE_RECORD_TOKENS;
  }
  if (out.length) state.computeRecords = COMPUTE_RECORDS.filter((r) => done.has(r.id)).map((r) => r.id);
  return out;
}

export function readComputeRecords(raw) {
  if (!Array.isArray(raw)) return [];
  return COMPUTE_RECORDS.filter((r) => raw.includes(r.id)).map((r) => r.id);
}

const UNITS = [
  [1e18, "EFLOPS"],
  [P, "PFLOPS"],
  [T, "TFLOPS"],
  [G, "GFLOPS"],
  [M, "MFLOPS"],
  [1e3, "KFLOPS"],
];
export function flopsLabel(n) {
  if (!(n > 0)) return "0 FLOPS";
  for (const [size, unit] of UNITS) {
    if (n >= size) {
      const v = n / size;
      return `${v >= 100 ? Math.round(v) : v >= 10 ? v.toFixed(1).replace(/\.0$/, "") : v.toFixed(2).replace(/\.?0+$/, "")} ${unit}`;
    }
  }
  return `${Math.round(n)} FLOPS`;
}

// --- Moore's Law -------------------------------------------------------------
// Transistor counts from Wikipedia's "Transistor count" table; years as the
// game dates each chip. The line starts at the 4004 (1971, about 2,250).
export const MOORE_START = { year: 1971, transistors: 2250, name: "Chipwright 4004" };

export const MOORE_CHIPS = [
  { id: "c-8080", transistors: 6000 },
  { id: "c-6502", transistors: 4528 },
  { id: "c-z80", transistors: 8500 },
  { id: "c-8088", transistors: 29000 },
  { id: "c-286", transistors: 134000 },
  { id: "c-386", transistors: 275000 },
  { id: "c-486", transistors: 1180235 },
  { id: "c-586", transistors: 3.1e6 },
  { id: "c-586pro", transistors: 5.5e6 },
  { id: "c-p2", transistors: 7.5e6 },
  { id: "c-p3", transistors: 9.5e6 },
  { id: "c-k7", transistors: 22e6 },
  { id: "c-a64", transistors: 105.9e6 },
  { id: "c-e6600", transistors: 291e6 },
  { id: "c-phenom", transistors: 463e6 },
  { id: "c-i7920", transistors: 731e6 },
  { id: "c-fx8150", transistors: 1.2e9 },
  { id: "c-4770k", transistors: 1.4e9 },
  { id: "c-1800x", transistors: 4.8e9 },
];

// The doubling line: transistors expected in a given year.
export function mooreLine(year) {
  return MOORE_START.transistors * 2 ** ((year - MOORE_START.year) / 2);
}

// The chart's points, each with its part (name, year) and whether the
// player has found it in the museum.
export function moorePoints(state, statusOf) {
  return MOORE_CHIPS.map((c) => {
    const part = PARTS.find((p) => p.id === c.id);
    const status = part && statusOf ? statusOf(state, part) : "locked";
    return { id: c.id, name: part?.name || c.id, year: part?.year || 0, transistors: c.transistors, found: status !== "locked" };
  });
}
