// A hired manager can be switched off: the row goes back to tap-to-run and
// is left out of income, time away, material use and NEXT MOVE.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES, isManaged, nextMove } from "../../src/lib/gameConfig.js";
import { blankMeta, businessIncomePerSecond, replayAway, startingBiz } from "../../src/lib/empire.js";

const idx = (id) => BUSINESSES.findIndex((b) => b.id === id);
const PAPER = idx("paper");
function state(off) {
  const biz = BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= PAPER ? 10 : 0, manager: i <= PAPER, managerOff: false, running: false, progress: 0, activeMs: 0, commissionUntil: 0 }));
  if (off) biz[PAPER].managerOff = true;
  return { ...blankMeta(), cash: 0, lifetime: 0, biz, supply: { wood: 500, paper: 0 }, upgrades: {}, specialties: [] };
}

test("isManaged: hired and on", () => {
  assert.equal(isManaged({ manager: true }), true);
  assert.equal(isManaged({ manager: true, managerOff: false }), true);
  assert.equal(isManaged({ manager: true, managerOff: true }), false);
  assert.equal(isManaged({ manager: false, managerOff: false }), false);
});

test("a paused manager's row drops out of income per second", () => {
  const on = businessIncomePerSecond(state(false));
  const off = businessIncomePerSecond(state(true));
  assert.ok(off < on, `${off} < ${on}`);
  const only = state(true);
  only.biz[idx("timber")].managerOff = true;
  assert.equal(businessIncomePerSecond(only), 0);
});

test("time away: a paused row earns nothing and uses no materials", () => {
  const on = state(false);
  const off = state(true);
  const now = Date.now();
  const a = replayAway(on, 60_000, now);
  const b = replayAway(off, 60_000, now);
  assert.ok(a.rows.length >= 0);
  const paperOn = on.supply.paper || 0;
  const paperOff = off.supply.paper || 0;
  assert.ok(paperOn > 0, "the running mill made paper");
  assert.equal(paperOff, 0, "the paused mill made none");
  // The paused mill took no wood; the camp kept adding it.
  assert.ok((off.supply.wood || 0) > (on.supply.wood || 0));
  assert.ok(b.gain < a.gain);
});

test("NEXT MOVE treats a paused row as a manual row, never as running", () => {
  const s = state(true);
  s.biz[idx("timber")].managerOff = true;
  const text = nextMove(s) || "";
  assert.doesNotMatch(text, /undefined|NaN/);
});

test("the switch survives a prestige with LOYAL CREWS, and resets otherwise", () => {
  const prev = state(true).biz;
  const fresh = BUSINESSES.map((b) => ({ id: b.id, owned: 0, manager: false, running: false, progress: 0 }));
  const kept = startingBiz({ investors: 50, upgrades: {} }, fresh, prev);
  const plain = startingBiz({ investors: 0, upgrades: {} }, fresh, prev);
  assert.equal(plain[PAPER].manager, false);
  assert.ok(!plain[PAPER].managerOff);
  // LOYAL CREWS (50 investors) keeps supply-row managers, switch and all.
  assert.equal(kept[PAPER].manager, true);
  assert.equal(kept[PAPER].managerOff, true);
  assert.equal(kept[idx("timber")].managerOff, false);
});
