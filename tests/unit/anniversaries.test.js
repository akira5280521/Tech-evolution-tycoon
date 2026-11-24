// Anniversary weeks: real launch days, a week each, a small bonus for that
// era's row.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { ERA_YEAR } from "../../src/lib/eraYear.js";
import { businessIncomePerSecond, creditCycles } from "../../src/lib/empire.js";
import {
  ANNIVERSARIES, ANNIVERSARY_DAYS, ANNIVERSARY_MULT, anniversariesOn, anniversaryMult, nextAnniversary, ownedAnniversaries,
} from "../../src/lib/anniversaries.js";

const at = (id) => BUSINESSES.findIndex((b) => b.id === id);
const local = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();

test("every anniversary is a real era, once each, dated close to the era's year", () => {
  const seen = new Set();
  for (const a of ANNIVERSARIES) {
    assert.ok(at(a.era) >= 0, a.era);
    assert.ok(!seen.has(a.era), `${a.era} once`);
    seen.add(a.era);
    // The Transistors row is dated 1954 (the pocket radio); the anniversary is
    // the first transistor, 1947.
    assert.ok(Math.abs(a.year - ERA_YEAR[a.era]) <= 7, `${a.era}: ${a.year} vs ${ERA_YEAR[a.era]}`);
    assert.ok(a.month >= 1 && a.month <= 12 && a.day >= 1 && a.day <= 31, a.era);
    // A real calendar day.
    assert.equal(new Date(a.year, a.month - 1, a.day).getDate(), a.day, a.era);
  }
});

test("the week runs from the launch day for seven days, local time", () => {
  // The 4004: announced November 15, 1971.
  assert.equal(anniversaryMult("cpu", local(2026, 11, 14, 23)), 1);
  assert.equal(anniversaryMult("cpu", local(2026, 11, 15, 0)), ANNIVERSARY_MULT);
  assert.equal(anniversaryMult("cpu", local(2026, 11, 15 + ANNIVERSARY_DAYS - 1, 23)), ANNIVERSARY_MULT);
  assert.equal(anniversaryMult("cpu", local(2026, 11, 15 + ANNIVERSARY_DAYS)), 1);
  assert.equal(anniversaryMult("homepc", local(2026, 11, 16)), 1);
  const [a] = anniversariesOn(local(2026, 11, 16)).filter((x) => x.era === "cpu");
  assert.equal(a.years, 55);
  assert.equal(a.name, "Microprocessors");
  assert.equal(new Date(a.ends).getDate(), 21);
  assert.equal(anniversaryMult("cpu", 0), 1);
});

test("a week late in December ends on time", () => {
  // The transistor, December 23, 1947: the week covers December 29.
  assert.equal(anniversaryMult("transistors", local(2026, 12, 29)), ANNIVERSARY_MULT);
  assert.equal(anniversaryMult("transistors", local(2026, 12, 30)), 1);
});

test("the bonus lifts that row's pay, live and per cycle, and nothing else", () => {
  const i = at("cpu");
  const s = () => ({ cash: 0, lifetime: 0, biz: BUSINESSES.map((_, k) => ({ owned: k <= i ? 10 : 0, manager: true })), supply: {} });
  const on = local(2026, 11, 16);
  const off = local(2026, 11, 30);
  const a = creditCycles(s(), i, 1, off);
  const b = creditCycles(s(), i, 1, on);
  assert.ok(Math.abs(b - a * ANNIVERSARY_MULT) <= a * 1e-9);
  const other = at("ics");
  assert.equal(creditCycles(s(), other, 1, on), creditCycles(s(), other, 1, off));
  assert.ok(businessIncomePerSecond(s(), on) > businessIncomePerSecond(s(), off));
});

test("the banner only lists eras the company owns", () => {
  const on = local(2026, 11, 16);
  const owns = { biz: BUSINESSES.map((_, k) => ({ owned: k <= at("cpu") ? 1 : 0 })) };
  const early = { biz: BUSINESSES.map((_, k) => ({ owned: k < at("cpu") ? 1 : 0 })) };
  assert.deepEqual(ownedAnniversaries(owns, on).map((a) => a.era), ["cpu"]);
  assert.deepEqual(ownedAnniversaries(early, on), []);
});

test("the next one coming up wraps into next year", () => {
  const n = nextAnniversary(local(2026, 12, 31));
  assert.equal(n.era, "punchcards");
  assert.equal(n.years, 2027 - 1889);
});

test("an anniversary and a recall on the same row both apply", () => {
  const i = at("cpu");
  const s = (extra) => ({ cash: 0, lifetime: 0, biz: BUSINESSES.map((_, k) => ({ owned: k <= i ? 10 : 0, manager: true })), supply: {}, ...extra });
  const on = local(2026, 11, 16);
  const plain = creditCycles(s(), i, 1, local(2026, 11, 30));
  const both = creditCycles(s({ recall: { era: "cpu", until: on + 1e6 } }), i, 1, on);
  assert.ok(Math.abs(both - plain * ANNIVERSARY_MULT * 0.5) <= plain * 1e-9);
});
