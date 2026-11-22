// The Hardware Museum: every part is in exactly one room, and status follows
// the game without changing it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { PARTS } from "../../src/lib/facilities.js";
import { PERIPHERALS, WINGS, exhibitStatus, makerOf, roomExhibits, roomFilters } from "../../src/lib/museum.js";
import { RESEARCH } from "../../src/lib/research.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const everyEra = BUSINESSES.map((b) => ({ id: b.id, owned: 1 }));

const rooms = WINGS.flatMap((w) => w.rooms);

test("every part and peripheral is in exactly one room, with a picture", () => {
  for (const p of [...PARTS.filter((x) => !x.soon), ...PERIPHERALS]) {
    const homes = rooms.filter((r) => r.match(p));
    assert.equal(homes.length, 1, `${p.id} is in ${homes.map((r) => r.id).join(", ") || "no room"}`);
    assert.ok(existsSync(new URL(`../../public${p.icon}`, import.meta.url)), `${p.id} picture`);
  }
});

test("status: locked, researched, in use, out of production; peripherals by year", () => {
  const fresh = { biz: [], techDone: [], facilities: {} };
  const corsair = PERIPHERALS.find((p) => p.id === "kb-k70");
  assert.equal(exhibitStatus(fresh, corsair), "locked");
  const all = { biz: everyEra, techDone: RESEARCH.map((r) => r.id), facilities: { bench: { "b-z690": 1 } } };
  const part = (id) => PARTS.find((p) => p.id === id);
  assert.equal(exhibitStatus(all, part("b-z690")), "owned");
  assert.equal(exhibitStatus(all, part("b-z790")), "open");
  assert.equal(exhibitStatus(all, part("k-btx")), "retired");
  assert.equal(exhibitStatus(fresh, part("b-z790")), "locked");
});

test("filters: decades and makers; makers only from found exhibits", () => {
  const fresh = { biz: [], techDone: [], facilities: {} };
  assert.deepEqual(roomFilters(fresh, "cases").makers, []);
  const all = { biz: everyEra, techDone: RESEARCH.map((r) => r.id), facilities: {} };
  const { decades, makers } = roomFilters(all, "cases");
  assert.ok(decades.includes(1980) && decades.includes(2020));
  assert.ok(makers.includes("Fractel"));
  const fractel = roomExhibits(all, "cases", { maker: "Fractel" });
  assert.ok(fractel.length >= 4 && fractel.every((e) => e.item.name.startsWith("Fractel")));
  assert.equal(makerOf({ name: "4 MB 30-pin SIMM" }), null);
});

import { LAUNCH_DAYS, ROOMS, roomComplete, roomOf, todayInHistory } from "../../src/lib/museum.js";
import { badgeList, collectBadges } from "../../src/lib/empire.js";

test("every room has a badge, earned once every exhibit in it is found", () => {
  const all = { biz: everyEra, techDone: RESEARCH.map((r) => r.id), facilities: {} };
  const fresh = { biz: [], techDone: [], facilities: {} };
  assert.ok(roomComplete(all, "keyboards"));
  assert.ok(!roomComplete(fresh, "keyboards"));
  const ids = badgeList(fresh).filter((b) => b.group === "MUSEUM").map((b) => b.id);
  assert.equal(ids.length, ROOMS.length);
  const s = { ...all, badgesEarned: [] };
  collectBadges(s);
  assert.ok(s.badgesEarned.includes("room-mice"));
});

test("today in history: real launch days, found pieces named, the rest by year", () => {
  for (const x of LAUNCH_DAYS) {
    assert.match(x.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok([...PARTS, ...PERIPHERALS].some((p) => p.id === x.id), x.id);
  }
  const fresh = { biz: [], techDone: [], facilities: {} };
  const ibm = todayInHistory(fresh, new Date(2026, 7, 12, 12).getTime());
  assert.ok(ibm.today);
  assert.ok(ibm.entries.some((e) => e.id === "b-5150" && !e.found));
  // A day with nothing shows the next one coming up.
  const next = todayInHistory(fresh, new Date(2026, 0, 2, 12).getTime());
  assert.equal(next.today, false);
  assert.ok(next.entries.length > 0);
  assert.equal(roomOf(PARTS.find((p) => p.id === "v-1080")), "graphics");
});
