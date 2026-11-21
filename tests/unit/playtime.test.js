// Play time on old saves, and why some rows show little "active" time.
import { test } from "node:test";
import assert from "node:assert/strict";
import { earliestTracked, longestRowMs, playStep, settlePlayMs } from "../../src/lib/records.js";
import { startingBiz } from "../../src/lib/empire.js";
import { BUSINESSES, NORMAL_TICK_MS } from "../../src/lib/gameConfig.js";

const H = 3600e3;
const now = Date.parse("2026-11-21T12:00:00Z");
const rows = (hours) => hours.map((h) => ({ owned: 10, manager: true, activeMs: h * H }));

test("a save with no timer starts from the longest-running business, not the sum", () => {
  const s = { playMs: null, biz: rows([165, 120, 90, 40, 0]) };
  assert.equal(settlePlayMs(s, now), true);
  assert.equal(s.playMs, 165 * H);
});

test("the old summed start (49 days) is repaired once", () => {
  const biz = rows([165, 160, 150, 140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5]);
  const summed = biz.reduce((n, r) => n + r.activeMs, 0) + 2 * H;
  const s = {
    playMs: summed,
    biz,
    runStartedAt: now - 3 * 24 * H,
    runs: [],
    milestones: { "era:timber": { at: 0, play: 0, before: true }, "era:ai": { at: now - H, play: summed - H, before: false } },
  };
  assert.ok(summed > 49 * 24 * H);
  assert.equal(settlePlayMs(s, now, false), true);
  assert.equal(s.playMs, 165 * H);
  assert.equal(s.milestones["era:ai"].play, 165 * H - H, "a logged time moves down by the same amount");
  assert.equal(s.milestones["era:timber"].play, 0);
  // Already checked: never touched again.
  s.playMs = summed;
  assert.equal(settlePlayMs(s, now, true), false);
  assert.equal(s.playMs, summed);
});

test("an honest total is left alone", () => {
  const s = { playMs: 30 * H, biz: rows([20, 20, 5]), runStartedAt: now - 2 * 24 * H, runs: [{ at: now - 2 * 24 * H, lengthMs: 3 * 24 * H }] };
  assert.equal(earliestTracked(s), now - 5 * 24 * H);
  assert.equal(settlePlayMs(s, now, false), false);
  assert.equal(s.playMs, 30 * H);
  assert.equal(longestRowMs({ biz: [{ activeMs: NaN }, null, { activeMs: 5 }] }), 5);
});

test("only a normal tick counts as play; a frozen app does not add hours", () => {
  assert.equal(playStep(250, NORMAL_TICK_MS), 250);
  assert.equal(playStep(6 * H, NORMAL_TICK_MS), NORMAL_TICK_MS);
  assert.equal(playStep(NaN, NORMAL_TICK_MS), 0);
  assert.equal(playStep(-5, NORMAL_TICK_MS), 0);
});

test("INDUSTRIAL BASE gives the early product rows without managers, so they sit idle until hired", () => {
  const fresh = BUSINESSES.map((_, i) => ({ owned: i === 0 ? 1 : 0, manager: false, running: false, progress: 0, activeMs: 0 }));
  const prev = BUSINESSES.map(() => ({ owned: 150, manager: true }));
  const out = startingBiz({ investors: 10060, investorPeak: 18560 }, fresh, prev);
  const at = (id) => out[BUSINESSES.findIndex((c) => c.id === id)];
  for (const id of ["timber", "paper", "sand", "copper", "glass", "filament", "germanium", "silicon", "wafers"]) assert.ok(at(id).manager, `${id} keeps its crew`);
  for (const id of ["loom", "punchcards", "tubes", "transistors"]) {
    assert.equal(at(id).owned, 10, id);
    assert.equal(at(id).manager, false, `${id} starts manual`);
  }
});
