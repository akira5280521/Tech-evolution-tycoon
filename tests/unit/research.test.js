// R&D: costs, locks, and what the servers bank while you're away.
import { test } from "node:test";
import assert from "node:assert/strict";
import { AWAY_BANK, TECH_OPENS, advanceResearch, awayBankCap, awayBankHours, playerYear, researchCost, researchItem, researchLock, researchRows, techOpen, serverOutput } from "../../src/lib/research.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { replayAway } from "../../src/lib/empire.js";
import { OFFLINE_RATE } from "../../src/lib/gameConfig.js";

const plant = (parts) => ({ facilities: { servers: parts }, data: 0, techDone: [], biz: [] });

test("prices rise along the timeline", () => {
  const ids = ["cpu-4bit", "cpu-8080", "cpu-8086", "cpu-486", "cpu-pentium"];
  const costs = ids.map((id) => researchCost(researchItem(id)));
  for (let i = 1; i < costs.length; i++) assert.ok(costs[i] > costs[i - 1], `${ids[i]} (${costs[i]}) should cost more than ${ids[i - 1]} (${costs[i - 1]})`);
});

test("live play isn't capped", () => {
  const s = plant({ rack1: 1, psu400: 1, labfan: 1, hdd1t: 1 });
  const rate = serverOutput(s).perSecond;
  assert.ok(rate > 0);
  advanceResearch(s, 48 * 3600e3);
  assert.ok(Math.abs(s.data - rate * 48 * 3600) < 1e-6);
});

test("away bank: base hours plus one per set of the newest machine's disk, up to the max", () => {
  assert.equal(awayBankHours(plant({ rack1: 1, psu400: 1, labfan: 1 })), AWAY_BANK.baseHours);
  assert.equal(awayBankHours(plant({ rack1: 1, psu400: 1, labfan: 1, hdd1t: 1 })), AWAY_BANK.baseHours + AWAY_BANK.hoursPerSet);
  assert.equal(awayBankHours(plant({ rack1: 1, psu400: 1, labfan: 1, hdd1t: 1, ssd2t: 1 })), AWAY_BANK.baseHours + 3 * AWAY_BANK.hoursPerSet);
  assert.equal(awayBankHours(plant({ rack1: 1, hdd1t: 24, ssd2t: 24 })), AWAY_BANK.maxHours);
});

test("a night away banks no more than the disks hold, and a short break isn't cut", () => {
  const night = plant({ rack1: 2, psu400: 1, labfan: 2, hdd1t: 1 });
  const cap = awayBankCap(night);
  replayAway(night, 10 * 3600e3, Date.now(), OFFLINE_RATE);
  assert.ok(Math.abs(night.data - cap) < 1e-6, `banked ${night.data}, cap ${cap}`);

  const lunch = plant({ rack1: 2, psu400: 1, labfan: 2, hdd1t: 1 });
  replayAway(lunch, 30 * 60e3, Date.now(), OFFLINE_RATE);
  const expected = serverOutput(lunch).perSecond * 30 * 60 * OFFLINE_RATE;
  assert.ok(Math.abs(lunch.data - expected) < 1e-6, "30 minutes away pays in full at the away rate");
});

test("the project timer still runs while away, even after the bank is full", () => {
  const s = plant({ rack1: 1, psu400: 1, labfan: 1, hdd1t: 1 });
  s.techJob = { id: "cpu-8080", progressMs: 0, durationMs: researchItem("cpu-8080").durationMs };
  replayAway(s, 10 * 3600e3, Date.now(), OFFLINE_RATE);
  assert.ok(s.techDone.includes("cpu-8080"), "the job finished while away");
});

test("R&D never goes below zero or turns into NaN", () => {
  const s = plant({});
  advanceResearch(s, 1000, 1, -5);
  advanceResearch(s, NaN);
  advanceResearch(s, -1000);
  assert.equal(s.data, 0);
});

test("TECH is reachable from the first era; projects still wait for their year", () => {
  const early = { biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i === 0 ? 1 : 0 })), techDone: [] };
  assert.ok(techOpen(early), "the TECH page itself is open from era 1");
  assert.ok(playerYear(early) < TECH_OPENS, `era 1 is before ${TECH_OPENS}`);
  const first = researchItem("store-hdd");
  assert.equal(first.year, TECH_OPENS);
  assert.equal(researchLock(early, first), `Requires ${TECH_OPENS}`);
  const cpu = researchRows("cpu").find((entry) => !entry.soon);
  assert.ok(cpu, "the CPU tab still lists hardware to research");
  assert.match(researchLock(early, cpu) || "", /^Requires /);
});

test("a year that has reached the first project can start it once prereqs are met", () => {
  const late = { biz: BUSINESSES.map((b) => ({ id: b.id, owned: 50 })), techDone: [] };
  assert.ok(playerYear(late) >= TECH_OPENS);
  assert.equal(techOpen(late), true);
  const first = researchItem("store-hdd");
  assert.equal(researchLock(late, first), null);
});
