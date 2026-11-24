// When running research finishes, for the "research done" notification.
import { test } from "node:test";
import assert from "node:assert/strict";
import { RESEARCH, researchFinishTimes, researchSpeed } from "../../src/lib/research.js";
import { normalizePrefs } from "../../src/lib/gamePrefs.js";

const items = RESEARCH.filter((r) => !r.soon);
const a = items[0];
const b = items[1];
const job = (r, progressMs = 0) => ({ id: r.id, progressMs, durationMs: r.durationMs });
const T = 1_000_000;

test("one project: what's left over the research speed, from when the app went away", () => {
  const s = { techJob: job(a, a.durationMs / 2), facilities: {} };
  const speed = researchSpeed(s, 0);
  const [x] = researchFinishTimes(s, T);
  assert.equal(x.id, a.id);
  assert.equal(x.name, a.name);
  assert.equal(x.at, T + Math.ceil(a.durationMs / 2 / speed));
});

test("two projects run side by side and come back soonest first", () => {
  const s = { techJob: job(b, 0), techJob2: job(a, a.durationMs - 1000), facilities: {} };
  const got = researchFinishTimes(s, T);
  assert.equal(got.length, 2);
  assert.ok(got[0].at <= got[1].at);
  assert.equal(got[0].id, a.id);
});

test("the clean room speeds the part of the wait it covers", () => {
  const plain = { techJob: job(a), facilities: {} };
  const clean = { techJob: job(a), facilities: {}, lab: { cleanUntil: T + 60_000 } };
  const p = researchFinishTimes(plain, T)[0].at - T;
  const c = researchFinishTimes(clean, T)[0].at - T;
  // 60 s at 1.25x saves 15 s of base-speed time (if the project runs that long).
  if (a.durationMs / researchSpeed(plain, 0) > 75_000) assert.ok(Math.abs(p - c - 15_000) <= 2);
  else assert.ok(c < p);
  // A clean room that already ended changes nothing.
  const over = { techJob: job(a), facilities: {}, lab: { cleanUntil: T - 1 } };
  assert.equal(researchFinishTimes(over, T)[0].at, researchFinishTimes(plain, T)[0].at);
});

test("projects that won't finish before away research stops aren't listed", () => {
  const s = { techJob: job(a), facilities: {} };
  const ms = researchFinishTimes(s, T)[0].at - T;
  assert.equal(researchFinishTimes(s, T, ms - 1).length, 0);
  assert.equal(researchFinishTimes(s, T, ms).length, 1);
  assert.deepEqual(researchFinishTimes({ facilities: {} }, T), []);
});

test("the switch is off unless turned on", () => {
  assert.equal(normalizePrefs({}).notifyResearch, false);
  assert.equal(normalizePrefs({ notifyResearch: true }).notifyResearch, true);
  assert.equal(normalizePrefs({ notifyResearch: "yes" }).notifyResearch, false);
});
