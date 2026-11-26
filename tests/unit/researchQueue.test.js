// T3: the research queue (items 23/24), Home PC vs server room (57/52) and
// server tiers (60).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  QUEUE_SLOTS, advanceResearch, buyQueueSlot, canQueueResearch, queueBlock, queueResearch, queueSlotQuote, queueSlots, queueWait,
  readTechQueue, researchCost, researchItem, researchSection, researchWhere, researchWhereLabel, serverTier, startResearch, unqueueResearch,
} from "../../src/lib/research.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { cleanLab } from "../../src/lib/empire.js";

const at = (eraId, extra = {}) => ({
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= BUSINESSES.findIndex((x) => x.id === eraId) ? 1 : 0 })),
  techDone: [], data: 1e9, facilities: {}, companyYear: null, lab: {}, ...extra,
});

test("queue slots: none at first, earned in their era with R&D, at most 4, kept by cleanLab", () => {
  assert.equal(QUEUE_SLOTS.length, 4);
  assert.deepEqual(QUEUE_SLOTS.map((s) => s.name), ["LAB NOTEBOOK", "PROJECT PLANNING OFFICE", "GANTT SOFTWARE", "ISSUE TRACKER"]);
  const early = at("timber");
  assert.equal(queueSlots(early), 0);
  assert.equal(queueSlotQuote(early).ok, false);
  assert.match(queueSlotQuote(early).reason, /Opens in 1951/);
  const s = at("mainframes", { data: 5 });
  assert.match(queueSlotQuote(s).reason, /Needs 6 R&D/);
  s.data = 10;
  assert.equal(buyQueueSlot(s).ok, true);
  assert.equal(queueSlots(s), 1);
  assert.equal(s.data, 4);
  // The 1960s slot waits for its year.
  assert.equal(queueSlotQuote(s).reason, "Opens in 1962.");
  assert.equal(cleanLab({ queueSlots: 9 }).queueSlots, 4);
  assert.equal(cleanLab({}).queueSlots, 0);
});

test("a queued project starts by itself when the running one ends, and pays then", () => {
  const s = at("homepc", { lab: { queueSlots: 2 } });
  const first = researchItem("srv-mark1");
  const second = researchItem("srv-7090");
  assert.equal(startResearch(s, first.id).ok, true);
  // srv-7090 needs srv-mark1: it may wait behind it in the queue.
  assert.equal(queueBlock(s, second.id), null);
  assert.equal(queueResearch(s, second.id).ok, true);
  assert.deepEqual(s.techQueue, ["srv-7090"]);
  const before = s.data;
  advanceResearch(s, first.durationMs + 10);
  assert.ok(s.techDone.includes("srv-mark1"));
  assert.equal(s.techJob?.id, "srv-7090");
  assert.deepEqual(s.techQueue, []);
  assert.ok(s.data <= before - researchCost(second) + 1e-6); // paid on start
});

test("the queue waits for points, and needs a slot and a running project", () => {
  const s = at("homepc", { lab: { queueSlots: 1 } });
  assert.match(queueBlock(s, "srv-mark1"), /start it instead/);
  startResearch(s, "srv-mark1");
  assert.equal(canQueueResearch(s, "store-tape"), true);
  queueResearch(s, "store-tape");
  assert.equal(queueBlock(s, "store-hdd"), "Queue full");
  s.data = 0;
  advanceResearch(s, researchItem("srv-mark1").durationMs + 10);
  assert.equal(s.techJob, null);
  assert.deepEqual(s.techQueue, ["store-tape"]);
  assert.match(queueWait(s), /Waiting for \d+ R&D/);
  s.data = 1e6;
  advanceResearch(s, 1000);
  assert.equal(s.techJob?.id, "store-tape");
  const none = at("homepc");
  startResearch(none, "srv-mark1");
  assert.equal(queueBlock(none, "store-tape"), "No queue slot yet");
});

test("removing a queued project drops what was queued behind it that needed it", () => {
  const s = at("homepc", { lab: { queueSlots: 3 } });
  startResearch(s, "store-tape");
  queueResearch(s, "srv-mark1");
  queueResearch(s, "srv-7090");
  queueResearch(s, "store-hdd");
  assert.equal(unqueueResearch(s, "srv-mark1").ok, true);
  assert.deepEqual(s.techQueue, ["store-hdd"]);
  assert.deepEqual(readTechQueue(["nope", "store-hdd", "store-hdd", 5]), ["store-hdd"]);
});

test("each project says where it is used: Home PC (bench) or the server room", () => {
  assert.deepEqual(researchWhere(researchItem("cpu-386")), ["bench"]);
  assert.deepEqual(researchWhere(researchItem("srv-mark1")), ["servers"]);
  assert.deepEqual(researchWhere(researchItem("tab-hollerith")), ["servers"]);
  assert.equal(researchWhereLabel(researchItem("cool-crac")), "Server room");
  assert.equal(researchWhereLabel(researchItem("board-5150")), "Bench");
  assert.equal(researchSection(researchItem("cpu-386"), "home"), true);
  assert.equal(researchSection(researchItem("cpu-386"), "room"), false);
  assert.equal(researchSection(researchItem("store-tape"), "room"), true);
});

test("server tiers: the Chippewa 1 is a supercomputer, the 11/780 a mini, both after the 11/20 mini", () => {
  assert.equal(serverTier(researchItem("srv-mark1")), "mainframe");
  assert.equal(serverTier(researchItem("srv-1120")), "mini");
  assert.equal(serverTier(researchItem("srv-780")), "mini");
  assert.equal(serverTier(researchItem("srv-cray1")), "super");
  assert.equal(researchItem("srv-cray1").prereq, "srv-1120");
  assert.equal(serverTier(researchItem("cpu-386")), null);
});
