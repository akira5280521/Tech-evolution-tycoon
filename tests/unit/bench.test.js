// The PC build bench: parts must fit, and the PC makes R&D.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { PARTS, benchPlans, benchStock, facilityUnlocked, fitPart, partCost, purchasePart } from "../../src/lib/facilities.js";
import { RESEARCH, researchItem, serverOutput } from "../../src/lib/research.js";
import { BENCH_PARTS } from "../../src/lib/benchParts.js";

const upTo = (id, done = RESEARCH.map((e) => e.id)) => ({
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= BUSINESSES.findIndex((x) => x.id === id) ? 1 : 0 })),
  techDone: done,
  facilities: { mine: {}, cluster: {}, servers: {}, bench: {} },
  cash: 1e40,
});
const part = (id) => PARTS.find((p) => p.id === id);

test("every bench part has a research project of its year, and every CPU has a board", () => {
  for (const p of BENCH_PARTS) {
    assert.equal(researchItem(p.research)?.year, p.year, p.id);
    if (p.kind === "cpu") assert.ok(BENCH_PARTS.some((b) => b.kind === "board" && b.socket === p.socket), `${p.id} has no board`);
    if (p.kind === "board") assert.ok(BENCH_PARTS.some((m) => m.kind === "stick" && m.mem === p.mem), `${p.id} has no memory`);
  }
});

test("the bench opens with Home Computers and a 1977 PC makes R&D", () => {
  const s = upTo("homepc");
  assert.ok(facilityUnlocked(s, "bench"));
  for (const id of ["b-orchard2", "c-6502", "m-4116"]) assert.ok(purchasePart(s, "bench", id).ok, id);
  const b = benchStock(s.facilities.bench);
  assert.equal(b.memory, 1);
  assert.ok(serverOutput(s).bench > 0);
  // Nothing from the 1980s yet.
  assert.equal(purchasePart(s, "bench", "b-5150").ok, false);
});

test("a CPU needs its socket, memory its slots", () => {
  const counts = { "b-440bx": 1 };
  assert.match(fitPart(counts, "bench", "c-k62").reason, /Socket 7/);
  assert.match(fitPart(counts, "bench", "m-edo").reason, /72-pin SIMM/);
  assert.ok(!fitPart(counts, "bench", "c-p2").reason);
  // The Z370 board looks like Z170 but takes only the newer chips.
  assert.ok(fitPart({ "b-z170": 1 }, "bench", "c-8700k").reason);
});

test("a new board takes out what doesn't fit, sold back at half", () => {
  const counts = { "b-440bx": 1, "c-p3": 1, "m-pc133": 2 };
  const fit = fitPart(counts, "bench", "b-kt266a");
  assert.equal(fit.counts["c-p3"] || 0, 0);
  assert.equal(fit.counts["m-pc133"] || 0, 0);
  assert.equal(fit.counts["b-440bx"] || 0, 0);
  const half = (id, n) => (partCost(part(id), 0) * n) / 2;
  assert.equal(fit.refund, half("b-440bx", 1) + half("c-p3", 1) + half("m-pc133", 2));
});

test("a new CPU replaces the old one, and memory short slows it", () => {
  const counts = { "b-440bx": 1, "c-p2": 1, "m-pc66": 1 };
  assert.equal(benchStock(counts).memory, 1);
  const fit = fitPart(counts, "bench", "c-p3");
  assert.equal(fit.counts["c-p2"] || 0, 0);
  assert.ok(benchStock(fit.counts).memory < 1, "a P-III wants 64 MB");
});

test("the upgrade plan buys a board, CPU and memory that work together", () => {
  const s = upTo("supercluster");
  const [best] = benchPlans(s);
  assert.ok(best);
  for (const id of best.steps) assert.ok(purchasePart(s, "bench", id).ok, id);
  assert.equal(benchStock(s.facilities.bench).memory, 1);
  assert.ok(benchStock(s.facilities.bench).perf > 0);
});

test("chipsets support only their real CPUs", () => {
  // A 430FX board is single-voltage: no K6; the 430TX takes it.
  assert.match(fitPart({ "b-430fx": 1 }, "bench", "c-k6").reason, /chipset/);
  assert.ok(!fitPart({ "b-430tx": 1 }, "bench", "c-k6").reason);
  // B550 doesn't take a first-generation AM4 chip; X370 does.
  assert.match(fitPart({ "b-b550": 1 }, "bench", "c-1800x").reason, /chipset/);
  assert.ok(!fitPart({ "b-x370": 1 }, "bench", "c-1800x").reason);
  // The 4790K needs a 9-series board.
  assert.match(fitPart({ "b-z87": 1 }, "bench", "c-4790k").reason, /chipset/);
  // A DDR4 Z690 board takes the 12900K; an AM5 chip can't use DDR4 at all.
  assert.ok(!fitPart({ "b-z690d4": 1 }, "bench", "c-12900k").reason);
});

test("memory speed, memory locks and overclocking change the PC's speed", () => {
  const fast = benchStock({ "b-z390": 1, "c-9900k": 1, "m-ddr4c": 1, "p-750": 1 });
  const locked = benchStock({ "b-b360": 1, "c-9900k": 1, "m-ddr4c": 1, "p-750": 1 });
  assert.equal(locked.memSpeed, 2666, "B360 holds memory to the CPU's rating");
  assert.equal(fast.memSpeed, 3600);
  assert.equal(fast.overclock, 1.1);
  assert.equal(locked.overclock, 1);
  assert.ok(fast.perf > locked.perf * 1.1);
  // Slow memory holds a CPU back a little.
  const slow = benchStock({ "b-z390": 1, "c-9900k": 1, "m-ddr4a": 2, "p-750": 1 });
  assert.ok(slow.perf < fast.perf && slow.perf > fast.perf * 0.8);
});

test("every board lists its drive connections", () => {
  for (const b of BENCH_PARTS.filter((p) => p.kind === "board")) {
    assert.ok(Number.isFinite(b.ide) && Number.isFinite(b.sata) && Number.isFinite(b.m2), b.id);
  }
  assert.equal(BENCH_PARTS.find((p) => p.id === "b-x670e").m2, 5);
});

test("supplies have the board plugs of their day", () => {
  // A 1995 ATX supply has no 4-pin or 8-pin CPU plug for a 2010-era board.
  assert.match(fitPart({ "b-z68": 1 }, "bench", "p-atx250").reason, /24-pin/);
  assert.match(fitPart({ "b-875p": 1 }, "bench", "p-atx250").reason, /4-pin 12 V CPU plug/);
  // A modern supply has no AT plugs for a 486 board.
  assert.match(fitPart({ "b-vlb": 1 }, "bench", "p-750").reason, /AT power plugs/);
  // A 24-pin (20+4) plug still fits a 20-pin board.
  assert.ok(!fitPart({ "b-440bx": 1 }, "bench", "p-750").reason);
  // A card needs its power plug.
  assert.match(fitPart({ "b-z690": 1, "p-750": 1 }, "bench", "v-4090").reason, /16-pin/);
});

test("graphics: keyed AGP, PCIe generations and the CPU/GPU bottleneck", () => {
  // A 3.3 V AGP card doesn't fit a 1.5 V-only slot; a universal one does.
  assert.match(fitPart({ "b-875p": 1 }, "bench", "v-tnt").reason, /keyed/);
  assert.ok(!fitPart({ "b-875p": 1 }, "bench", "v-gf256").reason);
  // A PCIe 4.0 card in a PCIe 3.0 board runs at 3.0.
  const b = benchStock({ "b-z390": 1, "c-9900k": 1, "m-ddr4c": 1, "p-750": 1, "v-3080": 1 });
  assert.equal(b.link, 3);
  // A top card on an old CPU: the CPU is the bottleneck.
  const slow = benchStock({ "b-z77": 1, "c-3770k": 1, "m-ddr3b": 1, "p-atx3": 1, "v-4090": 1 });
  assert.equal(slow.bottleneck, "cpu");
  const weak = benchStock({ "b-z790": 1, "c-14900k": 1, "m-ddr5c": 1, "p-750": 1, "v-gtx680": 1 });
  assert.equal(weak.bottleneck, "graphics");
});
