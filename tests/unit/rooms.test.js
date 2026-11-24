// Facility rooms: slot conditions follow live ownership and milestones,
// later-era TECH is not shown, and every unlockId is a real part.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { PARTS } from "../../src/lib/facilities.js";
import { blankMeta } from "../../src/lib/empire.js";
import {
  BENCH_ROOM,
  SERVERS_ROOM,
  ROOM_MILESTONES,
  conditionMet,
  pickVariant,
  generatorOwned,
  partOwned,
  normalizeMonitorDisplay,
  resolveMonitorMode,
  screenKey,
  unknownUnlockIds,
} from "../../src/lib/rooms/index.js";
import { normalizePrefs } from "../../src/lib/gamePrefs.js";

const homepc = BUSINESSES.findIndex((b) => b.id === "homepc");
const at = (owned, parts = {}, extra = {}) => ({
  ...blankMeta(),
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i === homepc ? owned : 0 })),
  facilities: { servers: {}, bench: { ...parts }, mine: {}, cluster: {} },
  techDone: [],
  ...extra,
});

const slot = (id) => BENCH_ROOM.slots.find((s) => s.id === id);

test("room milestones match the game's first purchase plus 25/50/75/100/150/200", () => {
  assert.deepEqual(ROOM_MILESTONES, [1, 25, 50, 75, 100, 150, 200]);
});

test("every bench and servers unlockId is a real part", () => {
  assert.deepEqual(unknownUnlockIds(BENCH_ROOM), []);
  assert.deepEqual(unknownUnlockIds(SERVERS_ROOM), []);
  for (const id of ["tab601", "mark1", "mgset", "roomac", "tape", "cray1", "rack2u"]) {
    assert.ok(PARTS.some((p) => p.id === id), id);
  }
});

test("the bench room is ready; servers, mine and cluster wait on art", async () => {
  const { ROOMS } = await import("../../src/lib/rooms/index.js");
  assert.equal(BENCH_ROOM.ready, true);
  assert.equal(SERVERS_ROOM.ready, false);
  assert.equal(ROOMS.mine.ready, false);
  assert.equal(ROOMS.cluster.ready, false);
});

test("Start, Mid and Maxed bench rooms pick the in-era parts the player owns", () => {
  const start = at(1, { "k-atdesk": 1, "y-5151": 1, "c-286": 1, "b-at": 1, "p-at150": 1 });
  assert.equal(generatorOwned(start, "homepc"), 1);
  assert.equal(pickVariant(start, slot("case-primary"), "bench")?.unlockId, "k-atdesk");
  assert.equal(pickVariant(start, slot("monitor"), "bench")?.unlockId, "y-5151");
  assert.equal(pickVariant(start, slot("cat"), "bench")?.x, 177);
  assert.equal(pickVariant(start, slot("cat"), "bench")?.y, 88);
  assert.equal(pickVariant(start, slot("case-babyat"), "bench"), null);
  assert.equal(pickVariant(start, slot("mat"), "bench"), null);

  const mid = at(50, { "k-atdesk": 1, "k-attower": 1, "y-5151": 1, "y-8513": 1, "h-586fan": 1, "p-at230": 1 });
  assert.equal(pickVariant(mid, slot("case-primary"), "bench")?.unlockId, "k-attower");
  assert.equal(pickVariant(mid, slot("monitor"), "bench")?.unlockId, "y-8513");
  assert.equal(pickVariant(mid, slot("cat"), "bench")?.x, 266);
  assert.equal(pickVariant(mid, slot("mat"), "bench")?.sprite.includes("mat.png"), true);
  // Owning the later tower is not enough before the milestone, or without the part.
  const earlyTower = at(1, { "k-attower": 1, "y-5151": 1 });
  assert.equal(pickVariant(earlyTower, slot("case-primary"), "bench"), null);
  const midNoTower = at(50, { "k-atdesk": 1, "y-8513": 1 });
  assert.equal(pickVariant(midNoTower, slot("case-primary"), "bench")?.unlockId, "k-atdesk");

  const maxed = at(200, {
    "k-atdesk": 1, "k-attower": 1, "k-babyat": 1,
    "y-5151": 1, "y-8513": 1, "y-ms3d": 1,
    "r-360k": 1, "d-st225": 1, "r-144": 1, "d-cp3044": 1,
  });
  assert.equal(pickVariant(maxed, slot("monitor"), "bench")?.unlockId, "y-ms3d");
  assert.equal(pickVariant(maxed, slot("case-babyat"), "bench")?.unlockId, "k-babyat");
  assert.equal(pickVariant(maxed, slot("case-atdesk-closed"), "bench")?.unlockId, "k-atdesk");
  assert.equal(pickVariant(maxed, slot("drive-cp3044"), "bench")?.unlockId, "d-cp3044");
  assert.equal(pickVariant(maxed, slot("cat"), "bench")?.x, 266);
  assert.equal(pickVariant(maxed, slot("cat"), "bench")?.y, 84);
});

test("a flavor object uses the generator count, not a fake part id", () => {
  const s = at(50, {});
  assert.equal(conditionMet(s, { generatorId: "homepc", minOwned: 50 }, "bench"), true);
  assert.equal(pickVariant(s, slot("keyboard"), "bench")?.sprite.includes("keyboard.png"), true);
  assert.equal(partOwned(s, "bench", "keyboard"), 0);
});

test("monitor display resolves era to that cabinet's default and keys the glass overlay", () => {
  assert.equal(normalizeMonitorDisplay("nope"), "era");
  assert.equal(normalizeMonitorDisplay("amber"), "amber");
  assert.equal(resolveMonitorMode("era", "green"), "green");
  assert.equal(resolveMonitorMode("color", "green"), "color");
  assert.equal(screenKey("y-5151", "green"), "y-5151+green");
  const startMon = pickVariant(at(1, { "y-5151": 1 }), slot("monitor"), "bench");
  assert.equal(startMon.eraDefault, "green");
  assert.ok(startMon.screenVariants.green.sprite.includes("y-5151-green"));
  const midMon = pickVariant(at(50, { "y-8513": 1 }), slot("monitor"), "bench");
  assert.equal(resolveMonitorMode("era", midMon.eraDefault), "color");
  assert.ok(midMon.screenVariants.green.sprite.includes("y-8513-green"));
});

test("monitorDisplay is kept in phone prefs and survives a junk or missing value", () => {
  assert.equal(normalizePrefs({}).monitorDisplay, "era");
  assert.equal(normalizePrefs({ monitorDisplay: "green" }).monitorDisplay, "green");
  assert.equal(normalizePrefs({ monitorDisplay: "amber", textSize: "xl" }).monitorDisplay, "amber");
  assert.equal(normalizePrefs({ monitorDisplay: "color" }).monitorDisplay, "color");
  assert.equal(normalizePrefs({ monitorDisplay: "crt" }).monitorDisplay, "era");
  // Other prefs still survive a reset-shaped object.
  const kept = normalizePrefs({ sound: false, textSize: "large", contrast: true, monitorDisplay: "amber" });
  assert.equal(kept.sound, false);
  assert.equal(kept.textSize, "large");
  assert.equal(kept.contrast, true);
  assert.equal(kept.monitorDisplay, "amber");
});

test("the Inland 601 mapping counts each owned machine up to the cap of 6", () => {
  const slots = SERVERS_ROOM.slots.filter((s) => s.id.startsWith("tab601-"));
  assert.equal(slots.length, 6);
  const state = at(0, {});
  state.facilities.servers = { tab601: 3 };
  assert.equal(conditionMet(state, { facilityId: "servers", partId: "tab601", minParts: 3 }, "servers"), true);
  assert.equal(conditionMet(state, { facilityId: "servers", partId: "tab601", minParts: 4 }, "servers"), false);
});
