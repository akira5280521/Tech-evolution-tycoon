// T5 item 43: the mid-game milestone ladder.
import { test } from "node:test";
import assert from "node:assert/strict";
import { LADDER, currentRung, ladderOpen, settleLadder } from "../../src/lib/ladder.js";
import { forkCost } from "../../src/lib/empire.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

test("the ladder runs from the first prestige to the first fork, and its top is the fork bill", () => {
  assert.equal(LADDER[0].id, "prestige1");
  assert.equal(LADDER[LADDER.length - 1].id, "fork");
  assert.equal(LADDER[LADDER.length - 1].goal, forkCost(0));
  for (const rung of LADDER) assert.ok(rung.tokens > 0 && rung.title && rung.detail, rung.id);
  for (const rung of LADDER.filter((r) => r.id.startsWith("era-"))) assert.ok(!rung.title.includes("undefined"), rung.id);
  const inv = LADDER.filter((r) => r.id.startsWith("inv")).map((r) => r.goal);
  assert.deepEqual(inv, [...inv].sort((a, b) => a - b));
});

test("closed before the first prestige; pays rungs in order, once, in era tokens", () => {
  const s = { prestigeCount: 0, investors: 0, tokens: 0 };
  assert.equal(ladderOpen(s), false);
  assert.deepEqual(settleLadder(s), []);
  s.prestigeCount = 1;
  s.investors = 600;
  const paid = settleLadder(s);
  assert.deepEqual(paid.map((r) => r.id), ["prestige1", "inv100"], "stops at the first rung not met (Microprocessors)");
  assert.equal(s.tokens, 20);
  assert.deepEqual(settleLadder(s), [], "never twice");
  assert.equal(currentRung(s).id, "era-cpu");
  s.bestEra = BUSINESSES.findIndex((b) => b.id === "cpu");
  s.specialties = ["x"];
  settleLadder(s);
  assert.equal(currentRung(s).id, "era-super");
  assert.equal(s.tokens, 20 + 12 + 12 + 15);
});
