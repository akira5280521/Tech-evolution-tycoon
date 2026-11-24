// Compute power against the real records, and the Moore's Law chart.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PARTS, MAX_PART } from "../../src/lib/facilities.js";
import { exhibitStatus } from "../../src/lib/museum.js";
import { badgeList, snapshotMeta } from "../../src/lib/empire.js";
import {
  COMPUTE_RECORDS, COMPUTE_RECORD_TOKENS, MOORE_CHIPS, MOORE_START, PART_FLOPS, computePower, flopsLabel,
  mooreLine, moorePoints, noteComputeRecords, readComputeRecords,
} from "../../src/lib/compute.js";

test("every part with a compute figure is a real plant part, and specs that quote FP64 agree", () => {
  for (const id of Object.keys(PART_FLOPS)) {
    const part = PARTS.find((p) => p.id === id);
    assert.ok(part, id);
    assert.ok(part.fits?.some((f) => f !== "bench"), `${id} sits in a plant`);
  }
  // Supercomputer specs that give one total figure match it.
  const one = { cray1: 160e6, cray2: 1.9e9, c90: 16e9, t90: 58e9, t3e: 1.2e12 };
  for (const [id, n] of Object.entries(one)) assert.equal(PART_FLOPS[id], n, id);
});

test("compute adds up every plant and ignores parts without a figure", () => {
  const s = { facilities: { servers: { cray1: 2, xmp: 1, tape: 9 }, cluster: { tensorH100: 3 }, mine: { raster4090: 1 }, bench: { "c-486": 1 } } };
  assert.equal(computePower(s), 2 * 160e6 + 800e6 + 3 * 34e12 + 1.29e12);
  assert.equal(computePower({}), 0);
});

test("records are in time order and get bigger; the last is reachable with one plant full", () => {
  for (let i = 1; i < COMPUTE_RECORDS.length; i++) {
    assert.ok(COMPUTE_RECORDS[i].year > COMPUTE_RECORDS[i - 1].year);
    assert.ok(COMPUTE_RECORDS[i].flops > COMPUTE_RECORDS[i - 1].flops);
  }
  const best = Math.max(...Object.values(PART_FLOPS)) * MAX_PART;
  assert.ok(best >= COMPUTE_RECORDS.at(-1).flops);
  // ...but not an exaflop, even with every plant full of everything.
  const all = Object.values(PART_FLOPS).reduce((sum, n) => sum + n * MAX_PART, 0);
  assert.ok(all < 1.102e18);
});

test("passing records pays tokens once each and keeps them through prestige", () => {
  const s = { tokens: 5, facilities: { servers: { cray1: 1 } } };
  let got = noteComputeRecords(s);
  assert.deepEqual(got.map((r) => r.id), ["chippewa1"]);
  assert.equal(s.tokens, 5 + COMPUTE_RECORD_TOKENS);
  assert.deepEqual(noteComputeRecords(s), []);
  s.facilities = { servers: { t3e: 1 } };
  got = noteComputeRecords(s);
  assert.deepEqual(got.map((r) => r.id), ["gigaflop", "asci-red"]);
  assert.equal(s.tokens, 5 + 3 * COMPUTE_RECORD_TOKENS);
  const meta = snapshotMeta(s, { resetRunUpgrades: true });
  assert.deepEqual(meta.computeRecords, ["chippewa1", "gigaflop", "asci-red"]);
  // A fresh run with empty plants doesn't lose or re-pay them.
  const next = { ...meta, facilities: {} };
  assert.deepEqual(noteComputeRecords(next), []);
  const badges = badgeList({ ...next, biz: [] });
  assert.equal(badges.find((b) => b.id === "compute-asci-red").earned, true);
  assert.equal(badges.find((b) => b.id === "compute-summit").earned, false);
});

test("old saves read records safely", () => {
  assert.deepEqual(readComputeRecords(undefined), []);
  assert.deepEqual(readComputeRecords(["summit", "nope", "chippewa1"]), ["chippewa1", "summit"]);
});

test("FLOPS read plainly", () => {
  assert.equal(flopsLabel(160e6), "160 MFLOPS");
  assert.equal(flopsLabel(1.41e9), "1.41 GFLOPS");
  assert.equal(flopsLabel(35.86e12), "35.9 TFLOPS");
  assert.equal(flopsLabel(1.026e15), "1.03 PFLOPS");
  assert.equal(flopsLabel(0), "0 FLOPS");
});

test("Moore's Law: every chip is a real PC part, the line doubles every two years", () => {
  for (const c of MOORE_CHIPS) {
    const part = PARTS.find((p) => p.id === c.id);
    assert.ok(part, c.id);
    assert.equal(part.kind, "cpu", c.id);
    assert.ok(c.transistors > MOORE_START.transistors);
  }
  assert.equal(mooreLine(1971), 2250);
  assert.equal(mooreLine(1973), 4500);
  // The 486 sat almost exactly on the line.
  assert.ok(Math.abs(Math.log2(1180235 / mooreLine(1989))) < 0.1);
});

test("chart points are found when the museum has the chip", () => {
  const none = moorePoints({ facilities: {} }, exhibitStatus);
  assert.equal(none.length, MOORE_CHIPS.length);
  const owned = moorePoints({ facilities: { bench: { "c-486": 1 } } }, exhibitStatus);
  assert.equal(owned.find((p) => p.id === "c-486").found, true);
  assert.equal(owned.find((p) => p.id === "c-486").name, "Chipwright 486");
  assert.equal(owned.find((p) => p.id === "c-1800x").found, false);
});
