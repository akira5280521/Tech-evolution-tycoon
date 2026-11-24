// The run calendar: "ahead of history".
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { ERA_YEAR } from "../../src/lib/eraYear.js";
import { snapshotMeta } from "../../src/lib/empire.js";
import {
  CALENDAR_START, HISTORY_PACE_MS, aheadLabel, calendarSpeed, calendarYear, calendarYearAt, historyRows,
  noteCalendar, readCalendar, readHistoryBest, yearsAhead,
} from "../../src/lib/calendar.js";

const T0 = 1_700_000_000_000;
const idx = (id) => BUSINESSES.findIndex((b) => b.id === id);
function run({ owned = ["timber"], investors = 0, singularities = 0, start = T0 } = {}) {
  return {
    investors,
    singularities,
    runStartedAt: start,
    biz: BUSINESSES.map((b) => ({ owned: owned.includes(b.id) ? 1 : 0 })),
  };
}
const own = (s, id) => {
  s.biz[idx(id)].owned = 1;
};

test("every paced era is a real era with a real year, and the pace only moves forward in game order", () => {
  let last = 0;
  for (const b of BUSINESSES) {
    const ms = HISTORY_PACE_MS[b.id];
    if (ms == null) continue;
    assert.ok(ERA_YEAR[b.id] != null, b.id);
    assert.ok(ms > last, `${b.id} after the era before it`);
    last = ms;
  }
  for (const id of Object.keys(HISTORY_PACE_MS)) assert.ok(idx(id) >= 0, id);
});

test("scored eras' real years never go backwards in game order, so on pace reads as on time", () => {
  let year = -Infinity;
  for (const b of BUSINESSES) {
    if (HISTORY_PACE_MS[b.id] == null) continue;
    assert.ok(ERA_YEAR[b.id] >= year, b.id);
    year = ERA_YEAR[b.id];
    assert.equal(yearsAhead(run(), b.id, T0 + HISTORY_PACE_MS[b.id]), 0, b.id);
  }
});

test("the calendar starts at its start year and reaches each era's year at its pace", () => {
  const s = run();
  assert.equal(calendarYear(s, T0), CALENDAR_START);
  // At the pace time of an era, the calendar shows at least that era's year
  // (years never go backwards, so an out-of-order era can show later).
  for (const [id, ms] of Object.entries(HISTORY_PACE_MS)) {
    assert.ok(calendarYearAt(s, T0 + ms) >= ERA_YEAR[id] - 1e-9, id);
  }
  assert.equal(yearsAhead(s, "cpu", T0 + HISTORY_PACE_MS.cpu), 0);
});

test("the calendar never goes backwards and keeps going past the last era", () => {
  const s = run();
  let prev = -Infinity;
  for (let h = 0; h <= 600; h += 0.5) {
    const y = calendarYearAt(s, T0 + h * 3600e3);
    assert.ok(y >= prev, `hour ${h}`);
    prev = y;
  }
  assert.ok(prev > ERA_YEAR.supercluster);
});

test("opening early is years ahead, late is behind", () => {
  const s = run();
  const half = T0 + HISTORY_PACE_MS.cpu / 2;
  assert.ok(yearsAhead(s, "cpu", half) > 0);
  assert.ok(yearsAhead(s, "cpu", T0 + HISTORY_PACE_MS.cpu * 2) < 0);
});

test("stronger runs move the calendar faster", () => {
  const weak = run();
  const strong = run({ investors: 20000, singularities: 1 });
  assert.equal(calendarSpeed(weak), 1);
  assert.ok(calendarSpeed(strong) > 10);
  const t = T0 + 30 * 60e3;
  assert.ok(calendarYearAt(strong, t) > calendarYearAt(weak, t));
});

test("no tracked run start means no calendar and nothing scored", () => {
  const s = run({ start: 0 });
  assert.equal(calendarYear(s, T0), null);
  noteCalendar(s, T0);
  own(s, "paper");
  assert.deepEqual(noteCalendar(s, T0 + 1000), []);
});

test("eras owned when the run starts aren't scored; new ones are, once", () => {
  const s = run({ owned: ["timber", "paper", "loom", "punchcards"] });
  assert.deepEqual(noteCalendar(s, T0), []);
  assert.deepEqual(s.calendar, { timber: null, paper: null, loom: null, punchcards: null });
  own(s, "relay");
  const t = T0 + HISTORY_PACE_MS.relay / 2;
  const got = noteCalendar(s, t);
  assert.equal(got.length, 1);
  assert.equal(got[0].id, "relay");
  assert.equal(got[0].ahead, yearsAhead(s, "relay", t));
  assert.ok(got[0].ahead > 0);
  assert.equal(got[0].newBest, true);
  assert.equal(s.historyBest.relay, got[0].ahead);
  assert.deepEqual(noteCalendar(s, t + 60e3), []);
});

test("the best result is kept through prestige; the run calendar starts over", () => {
  const s = run({ owned: ["timber"] });
  noteCalendar(s, T0);
  own(s, "paper");
  own(s, "loom");
  noteCalendar(s, T0 + HISTORY_PACE_MS.loom / 3);
  const best = s.historyBest.loom;
  assert.ok(best > 0);
  const meta = snapshotMeta(s, { resetRunUpgrades: true });
  assert.equal(meta.historyBest.loom, best);
  assert.equal(meta.calendar, undefined);
  // A slower run later doesn't lower the best.
  const next = { ...run({ owned: ["timber"], start: T0 + 1e9 }), historyBest: meta.historyBest };
  noteCalendar(next, T0 + 1e9);
  own(next, "paper");
  own(next, "loom");
  const [r] = noteCalendar(next, T0 + 1e9 + HISTORY_PACE_MS.loom * 3).filter((x) => x.id === "loom");
  assert.ok(r.ahead < best);
  assert.equal(r.best, best);
  assert.equal(r.newBest, false);
  assert.equal(next.historyBest.loom, best);
});

test("old saves: unknown eras and bad numbers are dropped on load", () => {
  assert.equal(readCalendar(null), null);
  assert.deepEqual(readCalendar({ cpu: 3.4, nope: 2, gpu: "x", ics: null }), { cpu: 3, gpu: null, ics: null });
  assert.deepEqual(readHistoryBest(undefined), {});
  assert.deepEqual(readHistoryBest({ cpu: -2, nope: 5, gpu: NaN }), { cpu: -2 });
});

test("labels read plainly", () => {
  assert.equal(aheadLabel(0), "RIGHT ON HISTORY");
  assert.equal(aheadLabel(1), "1 YEAR AHEAD OF HISTORY");
  assert.equal(aheadLabel(-3), "3 YEARS BEHIND HISTORY");
  assert.equal(aheadLabel(null), "");
});

test("the Runs table lists eras reached this run or before, oldest first", () => {
  const s = run();
  s.calendar = { timber: null, loom: 4 };
  s.historyBest = { loom: 9, cpu: -2 };
  const rows = historyRows(s);
  assert.deepEqual(rows.map((r) => r.id), ["loom", "cpu"]);
  assert.deepEqual(rows[0], { id: "loom", name: BUSINESSES[idx("loom")].name, year: 1804, run: 4, best: 9 });
  assert.equal(rows[1].run, null);
});
