// Storage and later server parts need TECH research; the starter 601 does not.
// How to Play guides stay locked until the plant has been reached this career.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PARTS, STARTER_PART_ID, facilityEverUnlocked, partLock, partOpen, purchasePart } from "../../src/lib/facilities.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { blankMeta } from "../../src/lib/empire.js";
import { HOWTO_GUIDES, guideLocked } from "../../src/lib/howto.js";
import { FACILITY_TOURS, currentCoach, TUTORIAL_STEPS } from "../../src/lib/tutorial.js";
import { FIRST_RESEARCH_ID } from "../../src/lib/research.js";

const owning = (ids, n = 50) => BUSINESSES.map((b) => ({ id: b.id, owned: ids.includes(b.id) ? n : 0, manager: true }));
const at = (ids, extra = {}) => ({ ...blankMeta(), biz: owning(ids), techDone: [], facilities: { servers: {}, bench: {}, mine: {}, cluster: {} }, cash: 1e12, supply: { wood: 20, glass: 20 }, ...extra });

test("the tape drive and other non-starter server parts need their TECH project", () => {
  const s = at(["timber", "mainframes"]);
  const tape = PARTS.find((p) => p.id === "tape");
  const mark1 = PARTS.find((p) => p.id === "mark1");
  const labfan = PARTS.find((p) => p.id === "labfan");
  const starter = PARTS.find((p) => p.id === STARTER_PART_ID);
  assert.equal(starter.research, null);
  assert.equal(partLock(s, starter), null);
  assert.equal(partOpen(s, starter), true);
  assert.match(partLock(s, tape) || "", /Research|Tech/i);
  assert.equal(partOpen(s, tape), false);
  assert.equal(purchasePart({ ...s, facilities: { servers: {}, bench: {}, mine: {}, cluster: {} } }, "servers", "tape").ok, false);
  const researched = { ...s, techDone: ["store-tape"] };
  assert.equal(partLock(researched, tape), null);
  assert.equal(partOpen(researched, tape), true);
  assert.match(partLock(s, mark1) || "", /Research|Tech/i);
  assert.match(partLock({ ...s, biz: owning(["timber", "laptops"]) }, labfan) || "", /Research|Requires|Tech/i);
  for (const id of ["mgset", "roomac"]) {
    const part = PARTS.find((p) => p.id === id);
    assert.equal(part.research, "srv-mark1");
    assert.match(partLock(s, part) || "", /Research .+ in TECH/);
    assert.equal(purchasePart(s, "servers", id).ok, false);
  }
});

test("buying the first Inland 601 grants one R&D point so the first TECH project can start", () => {
  const s = at(["timber"], 1);
  s.cash = 20;
  s.data = 0;
  s.biz = owning(["timber"], 1);
  const r = purchasePart(s, "servers", STARTER_PART_ID);
  assert.equal(r.ok, true, r.reason);
  assert.equal(s.facilities.servers[STARTER_PART_ID], 1);
  assert.equal(s.data, 1);
  const again = purchasePart(s, "servers", STARTER_PART_ID);
  assert.equal(again.ok, true, again.reason);
  assert.equal(s.data, 1, "only the first machine grants the point");
});

test("non-starter buyable parts all name a TECH project", () => {
  const leaks = PARTS.filter((p) => !p.soon && !p.starter && !p.research);
  assert.deepEqual(leaks.map((p) => p.id), [], "buyable parts must need research");
});

test("How to Play facility guides stay locked until that era has been reached", () => {
  const early = at(["timber"]);
  early.bestEra = 0;
  assert.equal(guideLocked(early, HOWTO_GUIDES.find((g) => g.id === "howto-starter")), false);
  assert.equal(guideLocked(early, HOWTO_GUIDES.find((g) => g.id === "howto-museum")), false);
  assert.equal(guideLocked(early, HOWTO_GUIDES.find((g) => g.id === "howto-bench")), true);
  assert.equal(guideLocked(early, HOWTO_GUIDES.find((g) => g.id === "howto-mine")), true);
  const afterPc = at(["timber", "homepc"]);
  afterPc.bestEra = BUSINESSES.findIndex((b) => b.id === "homepc");
  assert.equal(guideLocked(afterPc, HOWTO_GUIDES.find((g) => g.id === "howto-bench")), false);
  const afterPrestige = at(["timber"]);
  afterPrestige.bestEra = BUSINESSES.findIndex((b) => b.id === "homepc");
  assert.equal(guideLocked(afterPrestige, HOWTO_GUIDES.find((g) => g.id === "howto-bench")), false, "stays readable after prestige");
});

test("a facility tour starts once the plant unlocks, and can be skipped", () => {
  const s = at(["timber", "homepc"]);
  s.tutorial = { seen: TUTORIAL_STEPS.map((step) => step.id), done: true, skipped: false, replay: false, tips: [], toursSeen: [], toursSkipped: [], toursDone: [] };
  const coach = currentCoach(s);
  assert.equal(coach?.tourId, "tour-bench");
  assert.equal(coach.step.id, "bench-intro");
  const skipped = { ...s, tutorial: { ...s.tutorial, toursSkipped: ["tour-bench"] } };
  assert.equal(currentCoach(skipped)?.tourId === "tour-bench", false);
});

test("the first-session tutorial includes HQ, the starter machine and the first TECH project", () => {
  const ids = TUTORIAL_STEPS.map((step) => step.id);
  for (const id of ["hq", "hq-go", "servers", "starter", "tech", "project", "later"]) assert.ok(ids.includes(id), id);
  assert.equal(ids.indexOf("hq-go"), ids.indexOf("hq") + 1);
  assert.ok(ids.indexOf("hq-go") < ids.indexOf("servers"));
  assert.equal(FIRST_RESEARCH_ID, "tab-hollerith");
  assert.ok(FACILITY_TOURS.map((t) => t.id).includes("tour-mine"));
});
