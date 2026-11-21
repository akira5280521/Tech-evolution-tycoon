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
  assert.equal(benchStock(s.facilities.bench).cpu.id, best.cpu.id);
});
