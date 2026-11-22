// The hardware hub behind the top button beside TECH: its label lives in one
// place, and its RIGS section opens with the research servers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { HUB_ITEMS, HUB_LABEL, HUB_ROUTE, hubEvidence, hubOpen, noteHubSeen } from "../../src/lib/hub.js";
import { blankMeta, snapshotMeta } from "../../src/lib/empire.js";
import { anyFacilityOpen, facilityNeed } from "../../src/lib/facilities.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const CPU = BUSINESSES.findIndex((b) => b.id === "mainframes"); // the first plant business
const withCpu = (n) => ({ biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i === CPU ? n : 0 })) });

test("hub label and route are set", () => {
  assert.equal(typeof HUB_LABEL, "string");
  assert.ok(HUB_LABEL.length > 0);
  assert.equal(HUB_ROUTE, "/rigs");
});

test("RIGS is the first section and opens the facilities screen", () => {
  assert.equal(HUB_ITEMS[0].id, "rigs");
  assert.equal(HUB_ITEMS[0].label, "RIGS");
  assert.equal(HUB_ITEMS[0].to, "/facilities");
  for (const item of HUB_ITEMS) assert.ok(item.label && item.to && item.text && typeof item.open === "function");
});

test("hub stays locked until the plants open, same as before", () => {
  for (const state of [{}, { biz: [] }, withCpu(0), withCpu(1)]) {
    assert.equal(hubOpen(state), anyFacilityOpen(state));
  }
  assert.equal(hubOpen(withCpu(0)), false);
  assert.equal(hubOpen(withCpu(1)), true);
});

test("hubSeen keeps HQ open with no Mainframes owned", () => {
  assert.equal(hubOpen({ ...withCpu(0), hubSeen: true }), true);
  assert.equal(HUB_ITEMS[0].open({ ...withCpu(0), hubSeen: true }), true);
});

test("hubSeen defaults false and survives snapshotMeta (prestige, fork, challenge)", () => {
  assert.equal(blankMeta().hubSeen, false);
  const state = { ...blankMeta(), ...withCpu(1) };
  assert.equal(noteHubSeen(state), true);
  assert.equal(state.hubSeen, true);
  assert.equal(noteHubSeen(state), false);
  // A prestige builds the next run from snapshotMeta with no businesses.
  const next = { ...blankMeta(), ...snapshotMeta(state, { resetRunUpgrades: true }), ...withCpu(0) };
  assert.equal(next.hubSeen, true);
  assert.equal(hubOpen(next), true);
  assert.equal(anyFacilityOpen(next), false);
});

test("old saves get hubSeen from reliable evidence only", () => {
  const base = { ...withCpu(0), facilities: { servers: {}, mine: {}, cluster: {} }, news: [], bestEra: 3 };
  assert.equal(hubEvidence(base), false);
  assert.equal(noteHubSeen({ ...base }), false);
  assert.equal(hubEvidence({ ...base, ...withCpu(1) }), true);
  assert.equal(hubEvidence({ ...base, facilities: { servers: { rack1: 2 }, mine: {}, cluster: {} } }), true);
  assert.equal(hubEvidence({ ...base, news: [{ id: "servers-open", text: "x" }] }), true);
  assert.equal(hubEvidence({ ...base, bestEra: CPU }), true);
  assert.equal(hubEvidence({ ...base, bestEra: CPU - 1 }), false);
});

test("a locked plant names what it needs this run", () => {
  assert.equal(facilityNeed("servers"), "Needs Mainframes this run");
  assert.equal(facilityNeed("bench"), "Needs Home Computers this run");
  assert.equal(facilityNeed("mine"), "Needs AI Accelerators this run");
  assert.equal(facilityNeed("cluster"), "Needs AI Accelerators this run");
});
