// Era gates: owning enough of the era before, earning enough this run, and
// strong runs needing more. Eras already open stay open.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES, ERA_EARN, ERA_GATE, eraDecadeLabel, eraEarnNeed, eraNeeds, eraOpen, eraYear, reachedEraLabel, runBonus } from "../../src/lib/gameConfig.js";
import { migrateSave } from "../../src/lib/gameSave.js";

const gated = BUSINESSES.findIndex((b, i) => i > 0 && ERA_EARN[b.id] > 0);
function run({ prevOwned = ERA_GATE, lifetime = 0, investors = 0, singularities = 0 } = {}) {
  return {
    lifetime,
    investors,
    singularities,
    // Era materials are covered by their own test.
    erasPaid: BUSINESSES.map((b) => b.id),
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
  assert.deepEqual(needs.filter((n) => n.kind === "own" || n.kind === "earn").map((n) => [n.kind, n.met]), [["own", false], ["earn", false]]);
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
  assert.ok(eraOpen({ ...ready, techDone: [ERA_RESEARCH.quantum.id], erasPaid: ["quantum"] }, index));
});

import { ERA_MATERIAL, eraCanOpen, openEra } from "../../src/lib/gameConfig.js";
test("opening an era takes its material only on the tap, and only once", () => {
  const index = BUSINESSES.findIndex((b) => b.id === "cpu");
  const cost = ERA_MATERIAL.cpu;
  assert.equal(cost.key, "wafers");
  const s = { lifetime: 1e300, techDone: [], supply: { wafers: cost.amount - 1 }, biz: BUSINESSES.map((_, i) => ({ owned: i < index ? 25 : 0 })) };
  // Every other need met, but the material is short: no OPEN, nothing taken.
  assert.ok(!eraOpen(s, index));
  assert.ok(!eraCanOpen(s, index));
  assert.ok(!openEra(s, index));
  assert.equal(s.supply.wafers, cost.amount - 1);
  // Enough on hand: still not open and nothing taken until the tap.
  s.supply.wafers = cost.amount + 5;
  assert.ok(!eraOpen(s, index));
  assert.equal(s.supply.wafers, cost.amount + 5);
  assert.ok(eraCanOpen(s, index));
  assert.ok(openEra(s, index));
  assert.equal(s.supply.wafers, 5);
  assert.ok(eraOpen(s, index));
  // Next run: paid already, so it opens by itself once the other needs are met.
  const next = { ...s, erasOpened: [], supply: { wafers: 0 } };
  assert.ok(eraOpen(next, index));
  const needs = eraNeeds(next, index);
  assert.ok(needs.find((n) => n.kind === "material").paid);
  // Later eras cost more.
  assert.ok(ERA_MATERIAL.supercluster.amount > ERA_MATERIAL.minis.amount);
});

import { incomeCeiling, softenMultiplier } from "../../src/lib/empire.js";
test("the income ceiling is lower but still rises with every fork", () => {
  assert.equal(incomeCeiling(0), 42);
  assert.ok(incomeCeiling(0) < 50 && incomeCeiling(15) < 140);
  for (let n = 1; n <= 15; n++) assert.ok(incomeCeiling(n) > incomeCeiling(n - 1));
  // Income still approaches the ceiling and never passes it.
  assert.ok(softenMultiplier(1e9, 0) <= 42 && softenMultiplier(1e9, 0) > 41);
});

test("the first eras need only 10 of the one before, so the tutorial is unchanged", () => {
  const ics = BUSINESSES.findIndex((b) => b.id === "ics");
  for (let i = 1; i < ics; i++) assert.equal(eraEarnNeed(run(), i), 0, BUSINESSES[i].id);
  const paper = BUSINESSES.findIndex((b) => b.id === "paper");
  const s = { lifetime: 0, biz: BUSINESSES.map((_, i) => ({ owned: i === 0 ? 10 : 0 })) };
  assert.ok(eraOpen(s, paper));
});

test("dated eras become a compact decade, and material rows use the next dated era", () => {
  const glass = BUSINESSES.findIndex((b) => b.id === "glass");
  const radios = BUSINESSES.findIndex((b) => b.id === "radios");
  const tubes = BUSINESSES.findIndex((b) => b.id === "tubes");
  const relay = BUSINESSES.findIndex((b) => b.id === "relay");
  const timber = BUSINESSES.findIndex((b) => b.id === "timber");
  const loom = BUSINESSES.findIndex((b) => b.id === "loom");
  const phones = BUSINESSES.findIndex((b) => b.id === "phones");
  assert.equal(glass + 1, 7, "Glassworks is era 7, feeding Radio Valves");
  assert.equal(radios + 1, 9, "Radio Valves is era 9");
  assert.ok(radios > BUSINESSES.findIndex((b) => b.id === "punchcards"));
  assert.ok(radios < relay && relay < tubes);
  assert.equal(eraYear(BUSINESSES[radios]), 1920);
  assert.equal(eraYear(BUSINESSES[tubes]), 1946);
  assert.equal(eraYear(BUSINESSES[glass]), null);
  assert.equal(eraDecadeLabel(glass), "1920s");
  assert.equal(eraDecadeLabel(radios), "1920s");
  assert.equal(eraDecadeLabel(relay), "1940s");
  assert.equal(eraDecadeLabel(tubes), "1940s");
  assert.equal(eraDecadeLabel(timber), "1800s");
  assert.equal(eraDecadeLabel(loom), "1800s");
  assert.equal(eraDecadeLabel(phones), "2000s");
});

test("the header label follows the newest era the player owns", () => {
  const glass = BUSINESSES.findIndex((b) => b.id === "glass");
  const phones = BUSINESSES.findIndex((b) => b.id === "phones");
  const empty = { biz: BUSINESSES.map((b) => ({ id: b.id, owned: 0 })) };
  assert.equal(reachedEraLabel(empty), "1800s");
  const atGlass = { biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= glass ? 1 : 0 })) };
  assert.equal(reachedEraLabel(atGlass), "1920s");
  const atPhones = { biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i === phones ? 1 : 0 })) };
  assert.equal(reachedEraLabel(atPhones), "2000s");
});

test("the Superclusters earn gate is hours, not days, at a late run's income (#51)", () => {
  // The 0.0.30 tester: $265.45Qi needed at 5.8e18 base means a run bonus near 21.3.
  const bonus = (265.45e18 / 5.8e18) ** (1 / 1.25);
  const need = ERA_EARN.supercluster * bonus ** 1.25;
  const hours = need / 713e12 / 3600;
  assert.ok(hours < 12, `supercluster gate takes ${hours.toFixed(1)} h at $713T/s`);
  assert.ok(ERA_EARN.supercluster > ERA_EARN.chatbots, "still more than Chatbots");
});
