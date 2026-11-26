// The hardware hub behind the top button beside TECH: it lists every
// facility, and RESEARCH SERVERS opens from the first era.
import { test } from "node:test";
import assert from "node:assert/strict";
import { HUB_ITEMS, HUB_LABEL, HUB_ROUTE, hubEvidence, hubOpen, noteHubSeen } from "../../src/lib/hub.js";
import { blankMeta, snapshotMeta } from "../../src/lib/empire.js";
import { FACILITIES, anyFacilityOpen, facilityNeed } from "../../src/lib/facilities.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const CPU = BUSINESSES.findIndex((b) => b.id === "mainframes"); // the first plant business
const withCpu = (n) => ({ biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i === CPU ? n : 0 })) });

test("hub label and route are set", () => {
  assert.equal(typeof HUB_LABEL, "string");
  assert.ok(HUB_LABEL.length > 0);
  assert.equal(HUB_ROUTE, "/rigs");
});

test("HQ lists Rigs first, then every facility, then the Museum", () => {
  assert.deepEqual(HUB_ITEMS.map((item) => item.id), ["rigs", ...FACILITIES.map((fac) => fac.id), "museum"]);
  assert.equal(HUB_ITEMS[0].id, "rigs");
  assert.equal(HUB_ITEMS[0].label, "RIGS");
  assert.equal(HUB_ITEMS[0].to, "/garage");
  const servers = HUB_ITEMS.find((item) => item.id === "servers");
  assert.equal(servers.label, "RESEARCH SERVERS");
  assert.equal(servers.to, "/facilities/$facilityId");
  assert.equal(servers.params.facilityId, "servers");
  assert.equal(HUB_ITEMS.at(-1).id, "museum");
  assert.equal(HUB_ITEMS.at(-1).to, "/museum");
  assert.equal(HUB_ITEMS.at(-1).open({}), true);
  for (const item of HUB_ITEMS) {
    assert.ok(item.label && item.to && item.text && typeof item.open === "function");
  }
  assert.equal(HUB_ITEMS.find((item) => item.id === "rigs").need(), facilityNeed("bench"));
  for (const item of HUB_ITEMS.filter((row) => row.id !== "museum" && row.id !== "rigs")) {
    assert.equal(item.need(), facilityNeed(item.id));
  }
});

test("HQ is open from the first era so the starter machine is reachable", () => {
  assert.equal(hubOpen(null), false);
  assert.equal(hubOpen({}), true);
  assert.equal(hubOpen({ biz: [] }), true);
  assert.equal(hubOpen(withCpu(0)), true);
  assert.equal(hubOpen(withCpu(1)), true);
  assert.equal(HUB_ITEMS.find((item) => item.id === "servers").open(withCpu(0)), true);
});

test("research servers stay open with no Mainframes; later plants stay locked", () => {
  const early = withCpu(0);
  assert.equal(HUB_ITEMS.find((item) => item.id === "servers").open(early), true);
  assert.equal(HUB_ITEMS.find((item) => item.id === "rigs").open(early), false);
  assert.equal(HUB_ITEMS.find((item) => item.id === "bench").open(early), false);
  assert.equal(HUB_ITEMS.find((item) => item.id === "mine").open(early), false);
  assert.equal(HUB_ITEMS.find((item) => item.id === "cluster").open(early), false);
  assert.match(HUB_ITEMS.find((item) => item.id === "bench").need(), /Home Computers/);
  assert.match(HUB_ITEMS.find((item) => item.id === "mine").need(), /AI Accelerators/);
  const later = { biz: BUSINESSES.map((b) => ({ id: b.id, owned: 1 })) };
  assert.equal(HUB_ITEMS.find((item) => item.id === "rigs").open(later), true);
  assert.equal(HUB_ITEMS.find((item) => item.id === "bench").open(later), true);
  assert.equal(HUB_ITEMS.find((item) => item.id === "mine").open(later), true);
  assert.equal(HUB_ITEMS.find((item) => item.id === "cluster").open(later), true);
});

test("hubSeen keeps HQ open with no Mainframes owned", () => {
  assert.equal(hubOpen({ ...withCpu(0), hubSeen: true }), true);
  assert.equal(HUB_ITEMS.find((item) => item.id === "servers").open({ ...withCpu(0), hubSeen: true }), true);
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
  // After a prestige the servers card stays open so the starter is reachable.
  assert.equal(HUB_ITEMS.find((item) => item.id === "servers").open(next), true);
  assert.equal(HUB_ITEMS.find((item) => item.id === "mine").open(next), false);
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

test("Rigs stays locked until Home Computers this run, same as the Bench", () => {
  const early = withCpu(0);
  const rigs = HUB_ITEMS.find((item) => item.id === "rigs");
  assert.equal(rigs.open(early), false);
  assert.match(rigs.need(), /Home Computers/);
  const home = BUSINESSES.findIndex((b) => b.id === "homepc");
  const unlocked = { biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i === home ? 1 : 0 })) };
  assert.equal(rigs.open(unlocked), true);
  assert.equal(HUB_ITEMS.find((item) => item.id === "bench").open(unlocked), true);
});
