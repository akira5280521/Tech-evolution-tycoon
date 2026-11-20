// Tutorial and starter goals: an older save is never stuck or paid twice.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { STARTER_GOALS, currentGoal, settleGoals } from "../../src/lib/goals.js";
import { TUTORIAL_STEPS, tutorialActive } from "../../src/lib/tutorial.js";

const SAVES = JSON.parse(readFileSync(new URL("../fixtures/saves.json", import.meta.url), "utf8"));
const clone = (x) => JSON.parse(JSON.stringify(x));

test("a veteran save gets every goal it already meets without a pile of cash", () => {
  const s = clone(SAVES.late);
  s.goalsDone = [];
  const cash = s.cash;
  settleGoals(s, { pay: false, migrate: true });
  assert.ok(s.goalsDone.length >= STARTER_GOALS.length - 1, `marked ${s.goalsDone.length}`);
  assert.equal(s.cash, cash, "no cash for the backlog");
});

test("only the current goal pays, once", () => {
  const s = clone(SAVES.goals || SAVES.early);
  s.goalsDone = [];
  const first = settleGoals(s, { pay: true });
  const second = settleGoals(s, { pay: true });
  assert.ok(first.reward <= Math.max(...STARTER_GOALS.map((g) => g.reward)));
  assert.equal(second.reward, 0);
});

test("a new game is in the tutorial; goals wait until it ends", () => {
  // What the loader gives a brand-new player.
  const s = { ...clone(SAVES.newgame), tutorial: { seen: [], done: false, skipped: false, replay: false, tips: [], tipsOff: false } };
  assert.equal(tutorialActive(s), true);
  assert.deepEqual(settleGoals(s, { pay: true }), { reward: 0 });
  assert.equal(currentGoal(s)?.id, STARTER_GOALS[0].id);
});

test("the tutorial has 7 steps and ends on a button", () => {
  assert.equal(TUTORIAL_STEPS.length, 7);
  assert.equal(TUTORIAL_STEPS.at(-1).id, "later");
});
