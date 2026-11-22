// The hardware hub behind the top button beside TECH: its label lives in one
// place, and its RIGS section opens with the research servers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { HUB_ITEMS, HUB_LABEL, HUB_ROUTE, hubOpen } from "../../src/lib/hub.js";
import { anyFacilityOpen } from "../../src/lib/facilities.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const CPU = BUSINESSES.findIndex((b) => b.id === "cpu");
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
