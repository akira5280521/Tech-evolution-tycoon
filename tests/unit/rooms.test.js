// Facility rooms: slot conditions follow live ownership and milestones,
// later-era TECH is not shown, and every unlockId is a real part.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { PARTS } from "../../src/lib/facilities.js";
import { blankMeta } from "../../src/lib/empire.js";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  BENCH_ROOM,
  SERVERS_ROOM,
  ROOM_MILESTONES,
  conditionMet,
  pickVariant,
  pickPlacements,
  pickBase,
  resolveServersStage,
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

test("the bench and servers rooms are ready; mine and cluster wait on art", async () => {
  const { ROOMS } = await import("../../src/lib/rooms/index.js");
  assert.equal(BENCH_ROOM.ready, true);
  assert.equal(SERVERS_ROOM.ready, true);
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


const publicFile = (url) => fileURLToPath(new URL(`../../public${url}`, import.meta.url));

const serverAt = (parts, tech = true) => {
  const research = tech
    ? Object.keys(parts).map((id) => PARTS.find((p) => p.id === id)?.research).filter(Boolean)
    : [];
  return at(0, {}, { facilities: { servers: { ...parts }, bench: {}, mine: {}, cluster: {} }, techDone: research });
};

const serverShown = (state) => {
  const ctx = { stage: resolveServersStage(state) };
  const items = [];
  for (const slot of SERVERS_ROOM.slots) {
    for (const variant of pickPlacements(state, slot, "servers", ctx)) {
      items.push({ id: slot.id, unlockId: variant.unlockId, sprite: variant.sprite, x: variant.x, y: variant.y });
    }
  }
  return { stage: ctx.stage, base: pickBase(SERVERS_ROOM, state), items };
};

test("the Inland 601 room lays out 1, 3 or 6 punches on the 1930s stages", () => {
  const start = serverShown(serverAt({ tab601: 1 }));
  assert.equal(start.stage.id, "era-1930s-start");
  assert.ok(start.base.sprite.includes("base-1930s"));
  assert.equal(start.items.filter((i) => i.unlockId === "tab601").length, 1);
  assert.equal(start.items.find((i) => i.id === "cat-1930s")?.x, 269);

  const mid = serverShown(serverAt({ tab601: 3 }));
  assert.equal(mid.stage.id, "era-1930s-mid");
  assert.equal(mid.items.filter((i) => i.unlockId === "tab601").length, 3);
  assert.ok(mid.items.some((i) => i.id === "desk-1930s"));

  const maxed = serverShown(serverAt({ tab601: 6 }));
  assert.equal(maxed.stage.id, "era-1930s-maxed");
  assert.equal(maxed.items.filter((i) => i.unlockId === "tab601").length, 6);
  assert.equal(maxed.items.some((i) => i.id === "desk-1930s"), false);
});

test("servers era bases switch at 1951, 1976 and 1999, and roomac-floor is used on the later stages", () => {
  const s1951 = serverShown(serverAt({ tab601: 1, mark1: 1, mgset: 1, roomac: 1, tape: 1 }));
  assert.equal(s1951.stage.id, "era-1951-start");
  assert.ok(s1951.base.sprite.includes("base-1950s"));
  assert.ok(s1951.items.some((i) => i.unlockId === "mark1"));
  assert.ok(s1951.items.some((i) => i.sprite.includes("roomac.png") && !i.sprite.includes("roomac-floor")));
  assert.ok(s1951.items.some((i) => i.id === "lamp-motes"));
  assert.equal(s1951.items.some((i) => i.unlockId === "tab601"), false);

  const cray = serverShown(serverAt({ cray1: 1, mgset: 1, roomac: 1, pack3330: 1, freon: 1 }));
  assert.equal(cray.stage.id, "era-1976-cray1");
  assert.ok(cray.base.sprite.includes("base-raised"));
  assert.ok(cray.items.some((i) => i.unlockId === "cray1"));
  assert.ok(cray.items.some((i) => i.sprite.includes("roomac-floor.png")));
  assert.ok(cray.items.some((i) => i.unlockId === "pack3330"));
  assert.ok(cray.items.some((i) => i.id === "cat-later"));

  const racks = serverShown(serverAt({ rack2u: 1, roomac: 1, "l-cat6500": 1, psu400: 1, labfan: 1 }));
  assert.equal(racks.stage.id, "era-1999-racks");
  assert.ok(racks.base.sprite.includes("base-datacenter"));
  assert.ok(racks.items.some((i) => i.unlockId === "rack2u"));
  assert.ok(racks.items.some((i) => i.sprite.includes("roomac-floor.png")));
  assert.equal(racks.items.some((i) => i.unlockId === "cray1"), false);

  const ex = serverShown(serverAt({ crayex: 1, altra: 1, flasharray: 1, ssd2t: 1, "l-edr": 1, "l-quantum": 1, roomac: 1 }));
  assert.equal(ex.stage.id, "era-2021-ex");
  assert.ok(ex.base.sprite.includes("base-datacenter"));
  assert.ok(ex.items.some((i) => i.unlockId === "crayex"));
  assert.ok(ex.items.some((i) => i.unlockId === "altra"));
  assert.ok(ex.items.some((i) => i.unlockId === "flasharray"));
});

test("every room sprite, strip and base file is in public/", async () => {
  const { ROOMS } = await import("../../src/lib/rooms/index.js");
  const urls = [];
  for (const room of Object.values(ROOMS)) {
    if (room.base?.sprite) urls.push(room.base.sprite);
    for (const base of Object.values(room.bases || {})) {
      if (base.sprite) urls.push(base.sprite);
    }
    for (const slot of room.slots || []) {
      for (const variant of slot.variants || []) {
        if (variant.sprite) urls.push(variant.sprite);
        if (variant.strip) urls.push(variant.strip);
        for (const screen of Object.values(variant.screenVariants || {})) {
          if (screen.sprite) urls.push(screen.sprite);
        }
      }
    }
  }
  const missing = [...new Set(urls)].filter((url) => !existsSync(publicFile(url)));
  assert.deepEqual(missing, []);
});
