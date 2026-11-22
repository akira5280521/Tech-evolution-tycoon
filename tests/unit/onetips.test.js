// A tip that has been shown stays up until GOT IT, so it can't vanish unread
// and come back every time its cause returns (RUNNING LOW on each shortage).
import { test } from "node:test";
import assert from "node:assert/strict";
import { TIPS, currentTip } from "../../src/lib/tips.js";
import { blankTutorial, readTutorial } from "../../src/lib/tutorial.js";

const base = (tutorial) => ({ biz: [], supply: {}, lifetime: 1, cash: 0, tutorial: { ...blankTutorial(), done: true, ...tutorial } });

test("a pinned tip stays on its page after its cause has passed", () => {
  const s = base({ tipsShown: ["running-low"] });
  assert.equal(currentTip(s, "game")?.id, "running-low");
  // Seen: gone for good.
  assert.equal(currentTip(base({ tipsShown: ["running-low"], tips: ["running-low"] }), "game")?.id === "running-low", false);
});

test("the pin survives save and load", () => {
  assert.deepEqual(readTutorial({ ...blankTutorial(), tipsShown: ["running-low"] }, true).tipsShown, ["running-low"]);
  assert.deepEqual(readTutorial({ seen: [] }, true).tipsShown, []);
});

test("a tip shown on another page doesn't hold back this page's tips", () => {
  const s = base({ tipsShown: ["running-low"] });
  assert.notEqual(currentTip(s, "more#settings")?.id, "running-low");
});

test("every tip id is unique (one-time by id)", () => {
  const ids = TIPS.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
});
