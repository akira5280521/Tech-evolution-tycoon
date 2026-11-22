// Every business row: the cycle text matches the real cycle clock
// (effectiveCycleMs) at 1, 25 and 50 owned and with the speed upgrade and
// Velocity, and a managed row pays exactly one lap per cycle while away.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES, cycleLabel } from "../../src/lib/gameConfig.js";
import { blankMeta, effectiveCycleMs, replayAway } from "../../src/lib/empire.js";

const CONFIGS = [
  ["owned 1", { owned: 1 }],
  ["owned 24", { owned: 24 }],
  ["owned 25", { owned: 25 }],
  ["owned 49", { owned: 49 }],
  ["owned 50", { owned: 50 }],
  ["speed upgrade", { owned: 1, spd: true }],
  ["velocity", { owned: 1, velocity: true }],
  ["both at 50", { owned: 50, spd: true, velocity: true }],
];
function make(id, { owned, spd = false, velocity = false, manager = false }) {
  const target = BUSINESSES.findIndex((b) => b.id === id);
  const supply = {};
  for (const b of BUSINESSES) for (const k of [...Object.keys(b.uses || {}), ...Object.keys(b.makes || {})]) supply[k] = 1e12;
  return {
    ...blankMeta(), cash: 0, lifetime: 0, supply,
    biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i === target ? owned : 0, manager: i === target && manager, running: false, progress: 0, activeMs: 0, commissionUntil: 0 })),
    upgrades: spd ? { [id]: { rev: false, spd: true } } : {},
    specialties: velocity ? ["velocity"] : [],
  };
}
const expected = (cfg, { owned, spd, velocity }) => cfg.cycleMs / ((spd ? 2 : 1) * (velocity ? 1.08 : 1) * (owned >= 50 ? 4 : owned >= 25 ? 2 : 1));

for (const cfg of BUSINESSES) {
  test(`${cfg.id}: cycle text and clock agree`, () => {
    for (const [label, opts] of CONFIGS) {
      const s = make(cfg.id, opts);
      const ms = effectiveCycleMs(cfg, s);
      assert.ok(Math.abs(ms - expected(cfg, opts)) < 1e-6, `${label}: ${ms}`);
      const shown = Number(cycleLabel(ms)) * 1000;
      const tol = ms < 1000 ? 5 : 50;
      assert.ok(Math.abs(shown - ms) <= tol + 1e-9, `${label}: shows ${cycleLabel(ms)}s for ${ms}ms`);
    }
  });
  test(`${cfg.id}: a managed row pays one lap per cycle away`, () => {
    for (const [label, opts] of [CONFIGS[0], CONFIGS[4]]) {
      const s = make(cfg.id, { ...opts, manager: true });
      const i = BUSINESSES.indexOf(cfg);
      const ms = effectiveCycleMs(cfg, s);
      const laps = 7;
      // Away replay runs in 720 slices; 7.5 cycles away pays 7.
      replayAway(s, ms * (laps + 0.5), Date.now() + 1e6);
      const leftover = s.biz[i].progress;
      assert.ok(Math.abs(leftover - ms * 0.5) < 1, `${label}: ${leftover} left of ${ms}`);
    }
  });
}
