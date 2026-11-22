// The refinery: 10 raw make 1 refined on a timer; late research needs them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES, REFINED, REFINE_BATCH, REFINE_MS, SUPPLY_KEYS } from "../../src/lib/gameConfig.js";
import { finishTimedWork, refineAmount, refiningOpen, snapshotMeta, startRefine } from "../../src/lib/empire.js";
import { RESEARCH, RESEARCH_MATERIALS, canStartResearch, startResearch } from "../../src/lib/research.js";
import { migrateSave } from "../../src/lib/gameSave.js";

const NOW = 2e12;
const ics = BUSINESSES.findIndex((b) => b.id === "ics");
function player(supply = {}, reached = ics) {
  return { cash: 1e30, data: 1e12, bestEra: reached, techDone: [], supply, biz: BUSINESSES.map((_, i) => ({ owned: i <= reached ? 10 : 0 })) };
}

test("three refined grades, made from silicon, copper and germanium", () => {
  assert.deepEqual(Object.keys(REFINED), ["polysilicon", "ofcopper", "hpge"]);
  for (const [k, v] of Object.entries(REFINED)) assert.ok(SUPPLY_KEYS.includes(k) && SUPPLY_KEYS.includes(v.from));
});

test("the refinery opens at Integrated Circuits", () => {
  assert.ok(!refiningOpen(player({}, ics - 1)));
  assert.ok(refiningOpen(player()));
});

test("ten raw make one refined, a batch at a time, after the timer", () => {
  const s = player({ silicon: 5005 });
  assert.equal(refineAmount(s, "polysilicon"), REFINE_BATCH);
  assert.ok(startRefine(s, "polysilicon", NOW));
  assert.equal(s.supply.silicon, 5005 - REFINE_BATCH * 10);
  assert.equal(refineAmount(s, "polysilicon"), 0, "one batch at a time");
  finishTimedWork(s, NOW + REFINE_MS - 1);
  assert.equal(s.supply.polysilicon || 0, 0);
  finishTimedWork(s, NOW + REFINE_MS);
  assert.equal(s.supply.polysilicon, REFINE_BATCH);
  const few = player({ copper: 45 });
  assert.equal(refineAmount(few, "ofcopper"), 4);
  assert.ok(!startRefine(player({ germanium: 9 }), "hpge", NOW));
});

test("a batch under way survives prestige; old saves have none", () => {
  const s = player({ silicon: 1000 });
  startRefine(s, "polysilicon", NOW);
  assert.equal(snapshotMeta(s).refineJob.amount, 100);
  assert.equal(migrateSave({ version: 12, cash: 1 }).refineJob, null);
});

test("late research needs refined materials and takes them when it starts", () => {
  for (const id of Object.keys(RESEARCH_MATERIALS)) assert.ok(RESEARCH.some((r) => r.id === id), id);
  const entry = RESEARCH.find((r) => r.id === "net-nvswitch");
  const s = player({ ofcopper: 149 }, BUSINESSES.length - 1);
  s.techDone = RESEARCH.map((r) => r.id).filter((id) => id !== entry.id);
  assert.equal(canStartResearch(s, entry.id), false);
  s.supply.ofcopper = 150;
  assert.ok(canStartResearch(s, entry.id));
  assert.ok(startResearch(s, entry.id).ok);
  assert.equal(s.supply.ofcopper, 0);
});
