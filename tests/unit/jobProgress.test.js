// Progress bar helper (src/lib/progress.js): percent and time left for timed jobs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatLeft, progressLabel, techProgress, timedProgress } from "../../src/lib/progress.js";

test("formatLeft reads hours, minutes and seconds", () => {
  assert.equal(formatLeft(0), "0s");
  assert.equal(formatLeft(12_000), "12s");
  assert.equal(formatLeft(245_000), "4m 05s");
  assert.equal(formatLeft((72 * 60) * 1000), "1h 12m");
  assert.equal(formatLeft(NaN), "0s");
});

test("techProgress uses research speed for time left", () => {
  const job = { id: "x", progressMs: 42_000, durationMs: 100_000 };
  assert.deepEqual(techProgress(job, 1), { pct: 42, leftMs: 58_000 });
  assert.deepEqual(techProgress(job, 2), { pct: 42, leftMs: 29_000 });
  assert.equal(techProgress(null, 1), null);
  // Never shows 100% before it is done, and never runs past it.
  assert.equal(techProgress({ progressMs: 99_999, durationMs: 100_000 }, 1).pct, 99);
  assert.deepEqual(techProgress({ progressMs: 200_000, durationMs: 100_000 }, 1), { pct: 100, leftMs: 0 });
});

test("timedProgress follows the wall clock", () => {
  assert.deepEqual(timedProgress(1000, 20_000, 6000), { pct: 25, leftMs: 15_000 });
  assert.deepEqual(timedProgress(1000, 20_000, 500), { pct: 0, leftMs: 20_000 });
  assert.deepEqual(timedProgress(1000, 20_000, 99_000), { pct: 100, leftMs: 0 });
  assert.equal(timedProgress(1000, 0, 2000), null);
});

test("progressLabel reads like the card", () => {
  assert.equal(progressLabel({ pct: 42, leftMs: (72 * 60 + 5) * 1000 }), "42% · 1h 12m left");
  assert.equal(progressLabel(null), "");
});
