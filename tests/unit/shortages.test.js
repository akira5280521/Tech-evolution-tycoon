// Historical shortages: once each, in their era, never on top of another
// popup; paying costs cash, waiting halves a material for a while.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { SHORTAGES, creditCycles, dilemmaSpec, resolveDilemma, shortageOn, tickDilemma } from "../../src/lib/empire.js";
import { migrateSave } from "../../src/lib/gameSave.js";

const at = (id) => BUSINESSES.findIndex((b) => b.id === id);
function inEra(id, extra = {}) {
  const i = at(id);
  return { cash: 1e9, biz: BUSINESSES.map((_, k) => ({ owned: k <= i ? 10 : 0, manager: true })), supply: {}, eventsDone: [], nextDilemmaAt: 1, ...extra };
}

test("five real shortages, each in the era it happened", () => {
  assert.deepEqual(SHORTAGES.map((s) => s.id), ["short-dram", "short-taiwan", "short-thailand", "short-crypto", "short-chips"]);
  for (const s of SHORTAGES) assert.ok(at(s.from) > 0 && at(s.to) >= at(s.from), s.id);
});

test("a shortage comes first in its era, and only once a game", () => {
  const s = inEra("gpu");
  tickDilemma(s, 1000);
  assert.equal(s.dilemma?.id, "short-taiwan");
  resolveDilemma(s, "a", 2000);
  s.nextDilemmaAt = 1;
  tickDilemma(s, 3000);
  assert.notEqual(s.dilemma?.id, "short-taiwan");
});

test("no dilemma starts over Welcome Back, What's New or the fresh-start offer", () => {
  const s = inEra("gpu");
  tickDilemma(s, 1000, { blocked: true });
  assert.equal(s.dilemma, undefined);
  tickDilemma(s, 2000);
  assert.ok(s.dilemma);
});

test("paying costs cash; waiting halves the material for ten minutes; ignoring it still hits", () => {
  const paid = inEra("gpu");
  tickDilemma(paid, 1000);
  const cash = paid.cash;
  resolveDilemma(paid, "a", 2000);
  assert.ok(paid.cash < cash && paid.cash >= 0);
  assert.equal(shortageOn(paid, 3000), null);

  const waited = inEra("gpu");
  tickDilemma(waited, 1000);
  resolveDilemma(waited, "b", 2000);
  assert.equal(shortageOn(waited, 3000), "wafers");
  assert.equal(shortageOn(waited, 2000 + 10 * 60 * 1000 + 1), null);
  const wafersRow = at("wafers");
  const a = inEra("gpu", { supply: { wafers: 0, silicon: 1e6 } });
  const b = inEra("gpu", { supply: { wafers: 0, silicon: 1e6 }, shortage: { key: "wafers", until: 1e12 } });
  creditCycles(a, wafersRow, 1, 5000);
  creditCycles(b, wafersRow, 1, 5000);
  assert.ok(Math.abs(b.supply.wafers - a.supply.wafers / 2) < 1e-6);

  const ignored = inEra("gpu");
  tickDilemma(ignored, 1000);
  tickDilemma(ignored, ignored.dilemma.expiresAt + 1);
  assert.equal(shortageOn(ignored, ignored.shortage.until - 1), "wafers");
  assert.ok(dilemmaSpec("short-taiwan").shortage);
});

test("old saves load with no shortage", () => {
  assert.equal(migrateSave({ version: 12, cash: 1 }).shortage, null);
});
