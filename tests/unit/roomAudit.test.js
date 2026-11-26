// Room art audit (GD-10 item 28): every room's art loads, is drawn at its own
// proportions and sits inside the banner, in every era; the server room has
// no desk; and a change of owned machines changes what is drawn.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { SERVERS_ROOM, BENCH_ROOM, SERVERS_STAGE_DEFS, pickPlacements, pickBase, resolveServersStage } from "../../src/lib/rooms/index.js";

// PNG width and height from the header.
function pngSize(path) {
  const b = readFileSync(path);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
const file = (url) => new URL(`../../public${url}`, import.meta.url);

for (const room of [SERVERS_ROOM, BENCH_ROOM]) {
  test(`${room.facilityId} room: every sprite exists, keeps its proportions and sits inside the banner`, () => {
    for (const base of Object.values(room.bases || { base: room.base })) {
      assert.ok(existsSync(file(base.sprite)), base.sprite);
      assert.deepEqual(pngSize(file(base.sprite)), { w: room.width, h: room.height }, `${base.sprite} is the banner's size`);
    }
    for (const slot of room.slots) {
      for (const v of slot.variants || []) {
        const where = `${slot.id} at ${v.x},${v.y}`;
        assert.ok(v.x >= 0 && v.y >= 0 && v.x + v.w <= room.width && v.y + v.h <= room.height, `${where} is inside the banner`);
        const art = v.strip || v.sprite;
        if (!art) continue;
        assert.ok(existsSync(file(art)), `${art} exists`);
        const size = pngSize(file(art));
        const frame = v.strip ? size.w / (v.animation?.frames || 24) : size.w;
        const drawn = v.w / v.h;
        const own = frame / size.h;
        assert.ok(Math.abs(own - drawn) / drawn < 0.06, `${where}: ${art} is drawn at ${v.w}x${v.h}, not its own ${frame}x${size.h}`);
      }
    }
  });
}

const serverAt = (parts) => ({ biz: [], techDone: ["srv-mark1"], facilities: { servers: parts } });
const drawnIds = (state) => {
  const ctx = { stage: resolveServersStage(state) };
  return SERVERS_ROOM.slots.flatMap((slot) => pickPlacements(state, slot, "servers", ctx).map(() => slot.id));
};

test("no stage of the server room shows a desk, a desk lamp or a phone", () => {
  for (const stage of SERVERS_STAGE_DEFS) {
    const t = stage.trigger;
    const parts = t?.anyParts ? { [t.anyParts[0]]: 1 } : t ? { tab601: 1, [t.partId]: t.minParts || 1 } : { tab601: 1 };
    const ids = drawnIds(serverAt(parts));
    assert.equal(ids.filter((id) => /desk|lamp-desk|phone/.test(id)).length, 0, stage.id);
  }
});

test("the base and the machines both follow the owned machines", () => {
  const before = serverAt({ tab601: 1 });
  const after = serverAt({ tab601: 1, mark1: 1, mgset: 1, roomac: 1 });
  assert.notEqual(pickBase(SERVERS_ROOM, before).sprite, pickBase(SERVERS_ROOM, after).sprite);
  assert.ok(!drawnIds(before).includes("mark1"));
  assert.ok(drawnIds(after).includes("mark1"));
  // The same object, changed in place the way the game does it.
  const live = serverAt({ tab601: 1 });
  const first = drawnIds(live);
  live.facilities.servers.mark1 = 1;
  assert.notDeepEqual(drawnIds(live), first);
});

// Sized from photos of the real IBM 601 (about 50-52 in tall) against the
// room's 80 in door (about 85 px): the full 52x63 sprite (T3 extra).
test("the Inland 601 machines are drawn at the real machine's size, all on the floor", () => {
  const six = serverAt({ tab601: 6 });
  const ctx = { stage: resolveServersStage(six) };
  for (const slot of SERVERS_ROOM.slots.filter((s) => s.unlockId === "tab601")) {
    for (const v of pickPlacements(six, slot, "servers", ctx)) {
      assert.ok(v.w === 52 && v.h === 63, `${slot.id} is ${v.w}x${v.h}`);
      assert.ok(v.y + v.h >= 140 && v.y + v.h <= 156, `${slot.id} bottom ${v.y + v.h} is on the floor`);
    }
  }
});
