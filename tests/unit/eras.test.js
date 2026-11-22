// Era gates: owning enough of the era before, earning enough this run, and
// strong runs needing more. Eras already open stay open.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES, ERA_EARN, ERA_GATE, eraEarnNeed, eraNeeds, eraOpen, runBonus } from "../../src/lib/gameConfig.js";
import { migrateSave } from "../../src/lib/gameSave.js";

const gated = BUSINESSES.findIndex((b, i) => i > 0 && ERA_EARN[b.id] > 0);
function run({ prevOwned = ERA_GATE, lifetime = 0, investors = 0, singularities = 0 } = {}) {
  return {
    lifetime,
    investors,
    singularities,
    biz: BUSINESSES.map((_, i) => ({ owned: i < gated - 1 ? 25 : i === gated - 1 ? prevOwned : 0 })),
  };
}

test("an era needs both: enough of the one before, and earnings this run", () => {
  assert.ok(gated > 0, "some era has an earnings threshold");
  const need = eraEarnNeed(run(), gated);
  assert.ok(!eraOpen(run({ lifetime: need * 0.9 }), gated));
  assert.ok(!eraOpen(run({ prevOwned: ERA_GATE - 1, lifetime: need }), gated));
  assert.ok(eraOpen(run({ lifetime: need }), gated));
  const needs = eraNeeds(run({ prevOwned: 4, lifetime: need / 2 }), gated);
  assert.deepEqual(needs.map((n) => [n.kind, n.met]), [["own", false], ["earn", false]]);
  assert.match(needs[0].label, new RegExp(`Own ${ERA_GATE} `));
  assert.match(needs[1].label, /^Earn \$.* this run$/);
});

test("thresholds rise faster than the investor and fork bonus", () => {
  const weak = run();
  const strong = run({ investors: 20000, singularities: 1 });
  const ratio = eraEarnNeed(strong, gated) / eraEarnNeed(weak, gated);
  assert.ok(ratio > runBonus(strong) * 1.5, `threshold ×${ratio.toFixed(1)} vs bonus ×${runBonus(strong).toFixed(1)}`);
});

test("later eras need more than earlier ones", () => {
  let last = 0;
  BUSINESSES.forEach((b, i) => {
    const n = eraEarnNeed(run(), i);
    if (n > 0) {
      assert.ok(n >= last, `${b.id} needs ${n}, less than before`);
      last = n;
    }
  });
});

test("an older save keeps every era that was open, even short of the new threshold", () => {
  const biz = BUSINESSES.map((_, i) => ({ owned: i < gated ? 25 : 0 }));
  const save = migrateSave({ version: 12, cash: 1, lifetime: 0, biz });
  assert.ok(save.erasOpened.includes(BUSINESSES[gated].id));
  assert.ok(eraOpen({ ...save, lifetime: 0 }, gated));
  // A new run (after prestige) has none recorded, so the threshold applies.
  assert.ok(!eraOpen({ ...save, erasOpened: [], lifetime: 0 }, gated));
});

import { INVESTOR_MILESTONES as PERKS, startingBiz } from "../../src/lib/empire.js";
test("INDUSTRIAL BASE starts runs with 10 of each business through Vacuum Tubes, no further", () => {
  const perk = PERKS.find((p) => p.id === "start-ics");
  assert.match(perk.text, /through Vacuum Tubes/);
  const holder = { investors: 20000, investorPeak: 20000 };
  const blank = BUSINESSES.map((_, i) => ({ owned: i === 0 ? 1 : 0 }));
  const biz = startingBiz(holder, blank);
  const tubes = BUSINESSES.findIndex((b) => b.id === "tubes");
  BUSINESSES.forEach((b, i) => assert.ok(i <= tubes ? biz[i].owned >= ERA_GATE : biz[i].owned === 0, b.id));
  // Below the perk, nothing extra.
  assert.equal(startingBiz({ investors: 10, investorPeak: 10 }, blank)[1].owned, 0);
});

import { ERA_RESEARCH } from "../../src/lib/gameConfig.js";
import { RESEARCH } from "../../src/lib/research.js";
import { ERA_YEAR } from "../../src/lib/eraYear.js";
test("late eras need a TECH project that can be done before them", () => {
  for (const id of ["gpu", "rgb", "quantum", "vr", "chatbots", "supercluster"]) assert.ok(ERA_RESEARCH[id], `${id} has a project`);
  for (const [era, project] of Object.entries(ERA_RESEARCH)) {
    const entry = RESEARCH.find((r) => r.id === project.id);
    assert.ok(entry && !entry.soon, `${project.id} exists`);
    assert.equal(entry.name, project.name);
    const index = BUSINESSES.findIndex((b) => b.id === era);
    assert.ok(entry.year <= ERA_YEAR[BUSINESSES[index - 1].id], `${project.id} (${entry.year}) is researchable in the era before ${era}`);
  }
  const index = BUSINESSES.findIndex((b) => b.id === "quantum");
  const ready = { lifetime: 1e300, techDone: [], biz: BUSINESSES.map((_, i) => ({ owned: i < index ? 25 : 0 })) };
  assert.ok(!eraOpen(ready, index));
  assert.ok(eraOpen({ ...ready, techDone: [ERA_RESEARCH.quantum.id] }, index));
});
