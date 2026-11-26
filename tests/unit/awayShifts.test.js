import { test } from "node:test";
import assert from "node:assert/strict";
import { AWAY_SHIFTS, cleanLab, offlineCapMs } from "../../src/lib/empire.js";
import { awayShiftQuote, buyAwayShift } from "../../src/lib/research.js";
import { awayCap } from "../../src/lib/awayReport.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const H = 3600e3;

test("away shifts add hours to the away cap and cost R&D, not money (item 42)", () => {
  const early = { biz: BUSINESSES.map((b) => ({ id: b.id, owned: 0 })), data: 1000, cash: 5, lab: cleanLab({}) };
  assert.match(awayShiftQuote(early).reason, /Opens in 1959/);
  const state = { biz: BUSINESSES.map((b) => ({ id: b.id, owned: 1 })), data: 1000, cash: 5, lab: cleanLab({}), facilities: {} };
  assert.equal(offlineCapMs(state), 24 * H);
  assert.equal(buyAwayShift(state).ok, true);
  assert.equal(state.cash, 5);
  assert.equal(state.data, 1000 - AWAY_SHIFTS[0].cost);
  assert.equal(offlineCapMs(state), 28 * H);
  state.data = 0;
  assert.match(awayShiftQuote(state).reason, /Needs 90 R&D/);
});

test("the cap counts earned shifts; old saves have none and need no migration", () => {
  assert.equal(cleanLab({}).awayShifts, 0);
  assert.equal(cleanLab({ awayShifts: 99 }).awayShifts, AWAY_SHIFTS.length);
  assert.equal(offlineCapMs({ lab: { awayShifts: 2 } }), 32 * H);
  const cap = awayCap({ lab: { awayShifts: 1 } }, 40 * H);
  assert.equal(cap.capMs, 28 * H);
  assert.equal(cap.capped, true);
  assert.equal(cap.shift.id, AWAY_SHIFTS[1].id);
});
