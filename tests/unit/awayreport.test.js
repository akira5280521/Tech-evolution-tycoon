// Time away pays income x time x rate exactly when nothing runs short, and
// says which material ran short (and for how long) when it does: the owner's
// save (era 5, Loom 10, 23 min away) paid ~20% under "income x time" because
// paper ran out part-way.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { blankMeta, businessIncomePerSecond, replayAway } from "../../src/lib/empire.js";

function save(counts, supply) {
  return {
    ...blankMeta(), cash: 0, lifetime: 1e6, investors: 0, upgrades: {}, specialties: [], supply: { ...supply },
    biz: BUSINESSES.map((b) => ({ id: b.id, owned: counts[b.id] || 0, manager: !!counts[b.id], running: false, progress: 0, activeMs: 0, commissionUntil: 0 })),
  };
}
const OWNER = { timber: 52, paper: 10, loom: 10, punchcards: 10 };
const AWAY = 23 * 60_000;

test("with materials to spare, time away pays income x time x half rate (no slice loss)", () => {
  const s = save(OWNER, { wood: 1e9, paper: 1e9 });
  const now = Date.now();
  const live = businessIncomePerSecond(s, now);
  const r = replayAway(s, AWAY, now + AWAY, 0.5);
  const expected = live * (AWAY / 1000) * 0.5;
  assert.ok(Math.abs(r.gain - expected) / expected < 0.002, `${r.gain} vs ${expected}`);
  assert.deepEqual(r.short, []);
});

test("the owner's bins: paper runs out, the users pay less, and the report says so", () => {
  const s = save(OWNER, { wood: 3490, paper: 1361 });
  const now = Date.now();
  const live = businessIncomePerSecond(s, now);
  const r = replayAway(s, AWAY, now + AWAY, 0.5);
  const expected = live * (AWAY / 1000) * 0.5;
  assert.ok(r.gain < expected * 0.9, "paid well under income x time");
  const paper = r.short.find((x) => x.key === "paper");
  assert.ok(paper, "paper ran short");
  assert.ok(paper.ms > 5 * 60_000 && paper.ms < AWAY, String(paper.ms));
  assert.deepEqual(paper.rows.sort(), ["Jacquard Loom", "Punch Cards"]);
  // The makers still pay in full: Timber and Paper earn the same as with plenty.
  const plenty = replayAway(save(OWNER, { wood: 1e9, paper: 1e9 }), AWAY, now + AWAY, 0.5);
  const byName = (rep, n) => rep.rows.find((x) => x.name === n)?.amount || 0;
  assert.ok(Math.abs(byName(r, "Paper Mill") - byName(plenty, "Paper Mill")) < 1);
  assert.ok(byName(r, "Jacquard Loom") < byName(plenty, "Jacquard Loom") * 0.9);
});

test("a FULL bin is reported, and a paused manager's row is left out", () => {
  const s = save({ timber: 52 }, { wood: 1e7 });
  const r = replayAway(s, AWAY, Date.now() + AWAY, 0.5);
  assert.ok(r.full.some((x) => x.key === "wood"));
  const off = save(OWNER, { wood: 1e9, paper: 1e9 });
  off.biz[BUSINESSES.findIndex((b) => b.id === "loom")].managerOff = true;
  const r2 = replayAway(off, AWAY, Date.now() + AWAY, 0.5);
  assert.equal(r2.rows.find((x) => x.name === "Jacquard Loom"), undefined);
});
