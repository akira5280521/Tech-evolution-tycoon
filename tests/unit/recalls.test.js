// Product recalls: famous hardware flaws, once each in their era. Recall and
// pay, or ride it out with that row earning half for ten minutes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { ERA_YEAR } from "../../src/lib/eraYear.js";
import {
  RECALLS, RECALL_MS, badgeList, businessIncomePerSecond, creditCycles, describeEffects, recallMult, resolveDilemma,
  snapshotMeta, tickDilemma,
} from "../../src/lib/empire.js";
import { migrateSave } from "../../src/lib/gameSave.js";

const at = (id) => BUSINESSES.findIndex((b) => b.id === id);
function inEra(id, extra = {}) {
  const i = at(id);
  // Every shortage already happened, so the recall is next in line.
  const shortages = ["short-dram", "short-taiwan", "short-thailand", "short-crypto", "short-chips"];
  return { cash: 1e12, biz: BUSINESSES.map((_, k) => ({ owned: k <= i ? 10 : 0, manager: true })), supply: {}, eventsDone: shortages, nextDilemmaAt: 1, ...extra };
}

test("five real flaws, each in its years, each hitting a row that's open by then", () => {
  assert.deepEqual(RECALLS.map((r) => r.id), ["recall-fdiv", "recall-caps", "recall-rrod", "recall-chipset", "recall-battery"]);
  const years = { "recall-fdiv": 1994, "recall-caps": 2002, "recall-rrod": 2007, "recall-chipset": 2011, "recall-battery": 2016 };
  for (const r of RECALLS) {
    assert.ok(at(r.from) > 0 && at(r.to) >= at(r.from), r.id);
    assert.ok(at(r.era) >= 0 && at(r.era) <= at(r.from), `${r.id} hits a row open by then`);
    // The event's year sits inside its span of eras.
    assert.ok(ERA_YEAR[r.from] <= years[r.id] && years[r.id] <= ERA_YEAR[r.to], r.id);
    assert.ok(r.title.startsWith(String(years[r.id])), r.id);
  }
});

test("a recall comes in its era after any shortage, and only once a game", () => {
  const s = inEra("multimedia", { eventsDone: [] });
  tickDilemma(s, 1000);
  assert.equal(s.dilemma?.id, "short-dram");
  resolveDilemma(s, "a", 2000);
  s.nextDilemmaAt = 1;
  tickDilemma(s, 3000);
  assert.equal(s.dilemma?.id, "recall-fdiv");
  resolveDilemma(s, "a", 4000);
  s.nextDilemmaAt = 1;
  tickDilemma(s, 5000);
  assert.ok(!String(s.dilemma?.id).startsWith("recall-"));
});

test("recalling costs cash and nothing else", () => {
  const s = inEra("multimedia");
  tickDilemma(s, 1000);
  const cash = s.cash;
  resolveDilemma(s, "a", 2000);
  assert.ok(s.cash < cash);
  assert.equal(s.recall, undefined);
  assert.equal(recallMult(s, "cpu", 3000), 1);
});

test("riding it out halves that row, live and in batches, for ten minutes", () => {
  const s = inEra("multimedia");
  tickDilemma(s, 1000);
  resolveDilemma(s, "b", 2000);
  assert.deepEqual(s.recall, { era: "cpu", until: 2000 + RECALL_MS });
  assert.equal(recallMult(s, "cpu", 3000), 0.5);
  assert.equal(recallMult(s, "homepc", 3000), 1);
  assert.equal(recallMult(s, "cpu", 2000 + RECALL_MS + 1), 1);

  const plain = inEra("multimedia");
  const hit = inEra("multimedia", { recall: { era: "cpu", until: 1e12 } });
  const a = creditCycles(plain, at("cpu"), 1, 5000);
  const b = creditCycles(hit, at("cpu"), 1, 5000);
  assert.ok(Math.abs(b - a / 2) <= a * 1e-9);
  // Other rows are untouched.
  assert.equal(creditCycles(inEra("multimedia"), at("homepc"), 1, 5000), creditCycles(inEra("multimedia", { recall: { era: "cpu", until: 1e12 } }), at("homepc"), 1, 5000));
  assert.ok(businessIncomePerSecond(hit, 5000) < businessIncomePerSecond(plain, 5000));
});

test("ignoring it rides it out", () => {
  const s = inEra("multimedia");
  tickDilemma(s, 1000);
  tickDilemma(s, s.dilemma.expiresAt + 1);
  assert.equal(s.recall?.era, "cpu");
});

test("choices read plainly", () => {
  const ride = RECALLS[0].choices.find((c) => c.key === "b");
  assert.equal(describeEffects(ride.effects), "Microprocessors earn half for 10 minutes");
  assert.equal(describeEffects(RECALLS[0].choices[0].effects), "Costs 60 seconds of income");
});

test("a recall under way survives a prestige save and a reload; bad ones are dropped", () => {
  const s = inEra("multimedia", { recall: { era: "cpu", until: 9e12 } });
  assert.deepEqual(snapshotMeta(s, {}).recall, { era: "cpu", until: 9e12 });
  const ok = migrateSave({ version: 12, biz: [], recall: { era: "cpu", until: 9e12 } });
  assert.deepEqual(ok.recall, { era: "cpu", until: 9e12 });
  assert.equal(migrateSave({ version: 12, biz: [], recall: { era: "nope", until: 1 } }).recall, null);
  assert.equal(migrateSave({ version: 12, biz: [] }).recall, null);
});

test("getting through all five earns a badge", () => {
  const s = inEra("quantum", { eventsDone: RECALLS.map((r) => r.id) });
  assert.equal(badgeList(s).find((b) => b.id === "recalls-all").earned, true);
  assert.equal(badgeList(inEra("quantum")).find((b) => b.id === "recalls-all").earned, false);
});
