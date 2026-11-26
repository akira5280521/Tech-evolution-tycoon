import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { blankMeta } from "../../src/lib/empire.js";
import { binFillIn, NOTE_IDS, NOTIFY_COOLDOWN_MS, notifyPlan, researchReadyIn } from "../../src/lib/notifyPlan.js";
import { freshBiz, freshState } from "../../src/lib/playState.js";
import { SIM_START } from "../../src/lib/paceSim.js";

const now = SIM_START;

function prefs(extra = {}) {
  return { notifyCap: false, notifyResearch: false, notifyBins: false, notifyAt: { cap: 0, research: 0, bins: 0 }, ...extra };
}

test("a research job that will finish is planned once, with a cooldown", () => {
  const s = freshState(now);
  s.hiddenAt = now;
  s.techJob = { id: "gpu-2d", progressMs: 0, durationMs: 40_000 };
  const plan = notifyPlan(s, prefs({ notifyResearch: true }), now);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].type, "research");
  assert.equal(plan[0].id, NOTE_IDS.research);
  assert.equal(plan[0].title, "Research is done");
  assert.ok(plan[0].at > now + 2000);
  const again = notifyPlan(s, prefs({ notifyResearch: true, notifyAt: { research: now - 1000, cap: 0, bins: 0 } }), now);
  assert.equal(again.length, 0);
  const later = notifyPlan(s, prefs({ notifyResearch: true, notifyAt: { research: now - NOTIFY_COOLDOWN_MS - 1, cap: 0, bins: 0 } }), now);
  assert.equal(later.length, 1);
});

test("research notices stay off unless that toggle is on", () => {
  const s = freshState(now);
  s.techJob = { id: "gpu-2d", progressMs: 0, durationMs: 40_000 };
  assert.equal(notifyPlan(s, prefs({ notifyCap: true }), now).some((p) => p.type === "research"), false);
  const cap = notifyPlan(s, prefs({ notifyCap: true }), now);
  assert.equal(cap.length, 1);
  assert.equal(cap[0].type, "cap");
});

test("a filling bin is planned, and two bins due together are one notice", () => {
  const s = { ...blankMeta(), ...freshState(now), cash: 0, biz: freshBiz() };
  const timber = BUSINESSES.findIndex((b) => b.id === "timber");
  s.biz[timber] = { owned: 50, manager: true, managerOff: false };
  s.supply = { ...(s.supply || {}), wood: 10 };
  const fill = binFillIn(s, now);
  assert.ok(fill && fill.ms > 0 && fill.keys.includes("wood"));
  const plan = notifyPlan(s, prefs({ notifyBins: true }), now);
  assert.equal(plan.filter((p) => p.type === "bins").length, 1);
  assert.match(plan[0].body, /wood/i);
  const cooled = notifyPlan(s, prefs({ notifyBins: true, notifyAt: { bins: now, cap: 0, research: 0 } }), now);
  assert.equal(cooled.some((p) => p.type === "bins"), false);
});

test("researchReadyIn uses the remaining job time", () => {
  const s = freshState(now);
  s.techJob = { id: "gpu-2d", progressMs: 20_000, durationMs: 40_000 };
  const ready = researchReadyIn(s, now);
  assert.ok(ready.ms > 0);
  assert.ok(ready.ms <= 40_000);
});
