// One run of a material row adds owned × (base make) × (x3 upgrade or 1)
// to the bins. Milestones and research raise cash, not the material count.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES, milestoneMult } from "../../src/lib/gameConfig.js";
import { creditCycles, runYield, supplyCap } from "../../src/lib/empire.js";

const sand = BUSINESSES.findIndex((b) => b.id === "sand");
const copper = BUSINESSES.findIndex((b) => b.id === "copper");
const glass = BUSINESSES.findIndex((b) => b.id === "glass");
const wafers = BUSINESSES.findIndex((b) => b.id === "wafers");
const tubes = BUSINESSES.findIndex((b) => b.id === "tubes");

function state(index, owned, extra = {}) {
  return {
    cash: 0,
    biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i === index ? owned : 0, manager: false })),
    supply: { sand: 0, copper: 0, glass: 0, wafers: 0, ...(extra.supply || {}) },
    storage: {},
    upgrades: extra.upgrades || {},
    techDone: extra.techDone || [],
  };
}

test("one copy makes its base amount, and copies stack", () => {
  assert.deepEqual(runYield(state(copper, 1), BUSINESSES[copper]), { copper: 1 });
  assert.deepEqual(runYield(state(copper, 3), BUSINESSES[copper]), { copper: 3 });
  assert.deepEqual(runYield(state(copper, 0), BUSINESSES[copper]), { copper: 0 });
});

test("the x3 revenue upgrade triples the material yield", () => {
  const s = state(copper, 4, { upgrades: { copper: { rev: true, spd: false } } });
  assert.deepEqual(runYield(s, BUSINESSES[copper]), { copper: 12 });
});

test("wafers make two each, and the upgrade triples that", () => {
  assert.deepEqual(runYield(state(wafers, 1), BUSINESSES[wafers]), { wafers: 2 });
  const s = state(wafers, 5, { upgrades: { wafers: { rev: true } } });
  assert.deepEqual(runYield(s, BUSINESSES[wafers]), { wafers: 30 });
});

test("milestones and research do not change material yield", () => {
  const plain = state(sand, 75);
  assert.ok(milestoneMult(75) > 1);
  assert.deepEqual(runYield(plain, BUSINESSES[sand]), { sand: 75 });
  const researched = state(sand, 75, { techDone: BUSINESSES.map((b) => b.id) });
  assert.deepEqual(runYield(researched, BUSINESSES[sand]), { sand: 75 });
});

test("a TECH row has no material yield", () => {
  assert.equal(runYield(state(tubes, 5), BUSINESSES[tubes]), null);
});

test("runYield matches one credited cycle when the bins have room", () => {
  const s = state(copper, 6, { upgrades: { copper: { rev: true } } });
  const want = runYield(s, BUSINESSES[copper]).copper;
  assert.equal(want, 18);
  assert.ok(supplyCap(s, "copper") > want);
  creditCycles(s, copper, 1, 0);
  assert.equal(s.supply.copper, want);
});

test("glass yield is the potential make, and a credited cycle needs sand", () => {
  const dry = state(glass, 2);
  assert.deepEqual(runYield(dry, BUSINESSES[glass]), { glass: 2 });
  creditCycles(dry, glass, 1, 0);
  assert.equal(dry.supply.glass, 0);
  const fed = state(glass, 2, { supply: { sand: 100 } });
  creditCycles(fed, glass, 1, 0);
  assert.equal(fed.supply.glass, 2);
});
