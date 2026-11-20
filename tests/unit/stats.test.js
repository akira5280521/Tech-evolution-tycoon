// "Copy my stats": milestones and the text a tester pastes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { noteMilestones, startMilestones } from "../../src/lib/records.js";
import { statsText } from "../../src/lib/statsText.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const SAVES = JSON.parse(readFileSync(new URL("../fixtures/saves.json", import.meta.url), "utf8"));
const clone = (x) => JSON.parse(JSON.stringify(x));

test("an older save marks what it already did as 'before', then logs new steps with times", () => {
  const s = clone(SAVES.early);
  const t0 = Date.parse("2026-11-01T00:00:00Z");
  startMilestones(s, t0);
  assert.ok(Object.values(s.milestones).every((m) => m.before), "existing progress is 'before'");
  const reached = Object.keys(s.milestones).length;
  assert.equal(noteMilestones(s, t0 + 1000), false, "nothing new yet");

  const next = BUSINESSES[reached];
  s.biz[reached] = { id: next.id, owned: 1 };
  s.playMs = 2 * 3600e3;
  assert.equal(noteMilestones(s, t0 + 5 * 3600e3), true);
  assert.deepEqual(s.milestones[`era:${next.id}`], { at: t0 + 5 * 3600e3, play: 2 * 3600e3, before: false });

  s.prestigeCount = 1;
  s.singularities = 2;
  noteMilestones(s, t0 + 9 * 3600e3);
  for (const key of ["prestige:1", "fork:1", "fork:2"]) assert.ok(s.milestones[key], key);
});

test("the copied text has the key numbers and no personal fields", () => {
  const s = clone(SAVES.late);
  const t0 = Date.parse("2026-11-01T00:00:00Z");
  startMilestones(s, t0);
  s.companyName = "Private Name Co";
  const text = statsText(s, { version: "0.0.27", code: "27", now: t0 + 86400e3 });
  for (const want of ["Tech Evolution Tycoon 0.0.27 (27) stats", "Play time:", "Best era:", "Prestiges:", "R&D:", "Reached", ": before"]) {
    assert.ok(text.includes(want), `missing "${want}"`);
  }
  assert.ok(!text.includes("Private Name Co"), "company name stays private");
  assert.ok(!/undefined|NaN/.test(text), text);
});
