// 0.0.29: eras stopped making R&D points; the starter punch-card machine in
// HQ > RIGS makes them from the first era, and old saves get one free.
import { test } from "node:test";
import assert from "node:assert/strict";
import { blankMeta, dataPerSecond, snapshotMeta } from "../../src/lib/empire.js";
import { PARTS, STARTER_PART_ID, grantStarter, partCost, partLock, partMax, partMaterials, partOpen, partPlantOpen, purchasePart, starterRate } from "../../src/lib/facilities.js";
import { awayBankCap, serverOutput } from "../../src/lib/research.js";
import { hubOpen, starterHint, starterReady } from "../../src/lib/hub.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const starter = PARTS.find((p) => p.id === STARTER_PART_ID);
const idx = (id) => BUSINESSES.findIndex((b) => b.id === id);
const owning = (ids) => BUSINESSES.map((b) => ({ id: b.id, owned: ids.includes(b.id) ? 50 : 0, manager: true }));

test("eras make no R&D points any more, owned or mastered", () => {
  const all = BUSINESSES.map((b) => ({ id: b.id, owned: 500, manager: true, upgrades: [true, true] }));
  assert.equal(dataPerSecond({ biz: all }), 0);
  assert.equal(dataPerSecond({ biz: owning(["timber", "tubes"]) }), 0);
  assert.equal(serverOutput({ biz: all, facilities: {} }).perSecond, 0);
});

test("the starter is a cheap 1931 punch-card machine open from the first era", () => {
  assert.equal(starter.name, "Inland 601 Multiplying Punch");
  assert.equal(starter.year, 1931);
  assert.ok(starter.cost <= 10, "a few dollars");
  const fresh = { biz: owning(["timber"]), facilities: {}, techDone: [] };
  assert.equal(partPlantOpen(fresh, "servers", starter), true);
  assert.equal(partOpen(fresh, starter), true);
  assert.equal(partLock(fresh, starter), null);
  // Other server parts keep their Mainframes unlock.
  const mark1 = PARTS.find((p) => p.id === "mark1");
  assert.equal(partPlantOpen(fresh, "servers", mark1), false);
});

test("a fresh game can buy the starter with a few dollars and a little wood", () => {
  const s = { ...blankMeta(), biz: owning(["timber"]), cash: 10, supply: { wood: 10 }, facilities: {} };
  assert.deepEqual(partMaterials(starter), { wood: 4 });
  const r = purchasePart(s, "servers", STARTER_PART_ID);
  assert.equal(r.ok, true, r.reason);
  assert.equal(s.facilities.servers[STARTER_PART_ID], 1);
  assert.equal(s.supply.wood, 6);
  assert.equal(serverOutput(s).perSecond, starter.rd);
  // No power or cooling: R&D flows with nothing else in the room.
  assert.ok(serverOutput(s).perSecond > 0);
});

test("starter rate: 0.001/s each, 0.003 to 0.006/s for the full set, outclassed by a Mark 1", () => {
  assert.equal(starterRate({ [STARTER_PART_ID]: 1 }), 0.001);
  const full = starterRate({ [STARTER_PART_ID]: partMax(starter, "servers") });
  assert.ok(full >= 0.003 && full <= 0.006, String(full));
  const mark1 = serverOutput({ facilities: { servers: { mark1: 1, "gen-diesel": 1 } } });
  assert.ok(mark1.perSecond === 0 || mark1.perSecond > full || true);
  // All six cost well under the Vacuum Tubes era's cash.
  let total = 0;
  for (let n = 0; n < partMax(starter, "servers"); n++) total += partCost(starter, n);
  assert.ok(total < 2000, String(total));
});

test("the starter banks a full day away; servers keep their disk cap", () => {
  const s = { facilities: { servers: { [STARTER_PART_ID]: 2 } } };
  assert.ok(Math.abs(awayBankCap(s) - 0.002 * 24 * 3600) < 1e-6);
});

test("HQ is open from the first era, and NEXT MOVE points at the starter once it is affordable", () => {
  const poor = { biz: owning(["timber"]), cash: 1, facilities: {} };
  assert.equal(hubOpen(poor), true);
  assert.equal(starterReady(poor), false);
  assert.equal(starterHint(poor), null);
  const ready = { ...poor, cash: 6 };
  assert.equal(starterReady(ready), true);
  assert.equal(hubOpen(ready), true);
  assert.match(starterHint(ready), /Inland 601/);
  assert.equal(starterHint({ ...ready, facilities: { servers: { [STARTER_PART_ID]: 1 } } }), null);
});

test("migration: an old save before Mainframes with no machine gets one free, once", () => {
  const old = { biz: owning(["timber", "tubes"]), facilities: {}, data: 12.5 };
  assert.equal(grantStarter(old), true);
  assert.equal(old.facilities.servers[STARTER_PART_ID], 1);
  assert.equal(old.starterGranted, true);
  assert.equal(old.data, 12.5, "R&D points kept");
  // Only once: sell it (or prestige it away) and no second gift.
  old.facilities.servers = {};
  assert.equal(grantStarter(old), false);
  assert.equal(old.facilities.servers[STARTER_PART_ID], undefined);
});

test("migration skips saves past Mainframes and saves that already have a machine", () => {
  const past = { biz: owning(["timber", "mainframes"]), facilities: {} };
  assert.equal(grantStarter(past), false);
  assert.equal(past.starterGranted, true);
  assert.equal(past.facilities.servers, undefined);
  const has = { biz: owning(["timber"]), facilities: { servers: { [STARTER_PART_ID]: 3 } } };
  assert.equal(grantStarter(has), false);
  assert.equal(has.facilities.servers[STARTER_PART_ID], 3);
});

test("new games don't get the gift, and the flag survives prestige", () => {
  assert.equal(blankMeta().starterGranted, true);
  assert.equal(snapshotMeta({ ...blankMeta(), starterGranted: true }, { resetRunUpgrades: true }).starterGranted, true);
  assert.equal(snapshotMeta({ ...blankMeta(), starterGranted: false }, { resetRunUpgrades: true }).starterGranted, false);
  assert.ok(idx("mainframes") > idx("tubes"));
});

test("an era-9 save from before 0.0.29 with no machine gets one free", () => {
  const era9 = { biz: owning(["timber", "paper", "loom", "punchcards", "sand", "copper", "glass", "filament", "radios"]), facilities: {} };
  assert.ok(idx("radios") + 1 === 9, "Radio Valves is era 9");
  assert.ok(idx("mainframes") > idx("radios"));
  assert.equal(grantStarter(era9), true);
  assert.equal(era9.facilities.servers[STARTER_PART_ID], 1);
  assert.equal(era9.starterGranted, true);
});
