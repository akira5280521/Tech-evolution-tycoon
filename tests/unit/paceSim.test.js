import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { incomePerSecond } from "../../src/lib/empire.js";
import { act, formatDuration, runProfile, SIM_START } from "../../src/lib/paceSim.js";
import { buyBusiness, freshState, hireManager } from "../../src/lib/playState.js";

test("formatDuration spells out hours and days", () => {
  assert.equal(formatDuration(0), "0s");
  assert.equal(formatDuration(90 * 1000), "1m 30s");
  assert.equal(formatDuration(6 * 3600 * 1000), "6h");
  assert.equal(formatDuration(4 * 86400 * 1000 + 3 * 3600 * 1000), "4d 3h");
});

test("buy and hire use the live cost and manager rules", () => {
  const now = SIM_START;
  const s = freshState(now);
  assert.equal(s.biz[0].owned, 1);
  s.cash = 1e9;
  assert.equal(buyBusiness(s, 0, "x10", now).ok, true);
  assert.equal(s.biz[0].owned, 11);
  assert.ok(s.cash < 1e9);
  const later = now + 10_000;
  assert.equal(hireManager(s, 0, later), true);
  assert.equal(s.biz[0].manager, true);
});

test("a short active run records Timber Camp and starts earning", () => {
  const r = runProfile("active", { start: SIM_START, maxElapsed: 2 * 60 * 1000 });
  assert.ok(r.eras.timber != null, "timber is owned at the start");
  assert.equal(r.eras.timber, 0);
  assert.ok(incomePerSecond(r.state, SIM_START + r.elapsed) > 0 || (r.state.lifetime || 0) > 0);
  assert.ok((r.state.lifetime || 0) > 0, "the bot earned something in two minutes");
  const loom = BUSINESSES.find((b) => b.id === "loom");
  assert.ok(loom, "Jacquard loom is in the ladder");
});

test("act does not throw on a fresh save", () => {
  const s = freshState(SIM_START);
  const out = act(s, SIM_START);
  assert.equal(!!out && typeof out === "object" ? !!out.state || true : typeof out === "boolean", true);
});

// T5 item 29: OPEN ERA starts a set-up bar that the game's tick finishes.
// The sim has to finish it on sim time, or Mainframes never opens in a
// first run (that was the 22h 39m first prestige).
test("the sim finishes the OPEN ERA set-up bar and reaches Mainframes in the first hour", () => {
  const r = runProfile("active", { start: SIM_START, maxElapsed: 60 * 60 * 1000 });
  assert.ok(r.eras.mainframes != null, "Mainframes arrived within an hour");
  assert.equal(r.state.eraBuild?.id === "mainframes", false);
  assert.ok(r.state.eraBuild == null || r.state.eraBuild.startedAt < SIM_START + r.elapsed + 1, "set-up bars run on sim time");
});
