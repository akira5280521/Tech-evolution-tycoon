// Hardware opens in its real year, once researched; the research servers go
// back to 1951; the eras after Quantum carry the newer hardware.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { ERA_YEAR, playerYear } from "../../src/lib/eraYear.js";
import { PARTS, facilityUnlocked, openParts, partLock, partOpen, purchasePart, settleClosedParts, settleStages, partCost } from "../../src/lib/facilities.js";
import { RESEARCH, researchItem, researchLock, serverOutput, awayBankHours, AWAY_BANK } from "../../src/lib/research.js";

const upTo = (id, techDone = []) => ({
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= BUSINESSES.findIndex((x) => x.id === id) ? 1 : 0 })),
  techDone,
  facilities: { mine: {}, cluster: {}, servers: {} },
  cash: 1e30,
  supply: { wafers: 1e8, glass: 1e8, copper: 1e8, polysilicon: 1e8, ofcopper: 1e8 },
});

test("every era has a year, in order, and the last is 2024", () => {
  for (const b of BUSINESSES) assert.ok(ERA_YEAR[b.id] != null, b.id);
  assert.equal(playerYear(upTo(BUSINESSES.at(-1).id)), 2024);
});

test("each part's research exists, has the part's year, and nothing opens before its year", () => {
  for (const part of PARTS) {
    if (!part.research) continue;
    const item = researchItem(part.research);
    assert.ok(item, `${part.id}: no research ${part.research}`);
    assert.equal(item.year, part.year, `${part.id} year ${part.year} vs research ${item.year}`);
  }
  // With everything researched, a 1971 company has nothing newer than 1971.
  const s = upTo("cpu", RESEARCH.map((e) => e.id));
  for (const id of openParts(s)) assert.ok(PARTS.find((p) => p.id === id).year <= 1971, id);
});

test("every research project can be finished once the last era is reached", () => {
  const s = upTo(BUSINESSES.at(-1).id, RESEARCH.map((e) => e.id));
  s.techDone = [];
  for (const e of RESEARCH) {
    if (e.soon) continue;
    const lock = researchLock({ ...s, techDone: RESEARCH.map((x) => x.id).filter((x) => x !== e.id) }, e);
    assert.equal(lock, null, `${e.id}: ${lock}`);
  }
});

test("the research servers open with Mainframes; the Mark 1, its room kit, and tape need TECH research", () => {
  const s = upTo("mainframes");
  assert.ok(facilityUnlocked(s, "servers"));
  for (const id of ["mgset", "roomac", "mark1", "tape"]) {
    assert.equal(purchasePart(s, "servers", id).ok, false, id);
    assert.match(partLock(s, PARTS.find((x) => x.id === id)) || "", /Research .+ in TECH/);
  }
  s.techDone = ["srv-mark1", "store-tape"];
  for (const id of ["mgset", "roomac", "mark1", "tape"]) assert.ok(purchasePart(s, "servers", id, 1e12).ok, id);
  // The Mark 1 comes online after its install (T5 item 61).
  assert.equal(serverOutput(s).perSecond, 0);
  settleStages(s, 1e12 + 3 * 60e3);
  assert.ok(serverOutput(s).perSecond > 0);
  // The 7090 waits for 1959, then for its research.
  const p = PARTS.find((x) => x.id === "ibm7090");
  assert.equal(partLock(s, p), "Requires 1959");
  const later = upTo("silicon");
  assert.match(partLock(later, p), /Research/);
  later.techDone = ["srv-7090"];
  assert.ok(partOpen(later, p));
});

test("machine-room computers each need a generator and an air conditioner; racks need watts", () => {
  const s = upTo(BUSINESSES.at(-1).id, RESEARCH.map((e) => e.id));
  s.facilities.servers = { mark1: 2, mgset: 1, roomac: 2, tape: 1 };
  assert.ok(Math.abs(serverOutput(s).speed - 0.5) < 1e-9, "one of two machines powered");
  s.facilities.servers = { mark1: 2, mgset: 2, roomac: 2, tape: 1, towerT4: 1, psuAT: 2, labfan: 1, disk3380: 1, "l-synoptix": 1 };
  assert.ok(Math.abs(serverOutput(s).speed - 1) < 1e-9, "both rooms running");
});

test("each machine needs the disk of its day, and the away bank counts sets of it", () => {
  const s = upTo(BUSINESSES.at(-1).id, RESEARCH.map((e) => e.id));
  s.facilities.servers = { rack1: 1, psu400: 1, labfan: 2, disk3380: 1 };
  const short = serverOutput(s);
  s.facilities.servers.hdd1t = 1;
  assert.ok(serverOutput(s).perSecond > short.perSecond * 1.9, "1 TB disk brings a 2012 rack to full speed");
  assert.ok(Math.abs(awayBankHours(s) - (AWAY_BANK.baseHours + 1.00252)) < 1e-6);
});

test("old saves keep parts bought fairly and refund the rest", () => {
  const s = upTo("ai");
  s.facilities = { mine: { raster3060: 2, raster1080: 1 }, cluster: {}, servers: { rack1: 1, pdp1120: 1 } };
  const refund = settleClosedParts(s);
  const p3060 = PARTS.find((p) => p.id === "raster3060");
  const r1 = PARTS.find((p) => p.id === "rack1");
  // The 3060 (2021) is too new for a 2016 company; the R1 (2012) isn't.
  assert.equal(s.facilities.mine.raster3060 || 0, 0);
  assert.equal(refund, partCost(p3060, 0) + partCost(p3060, 1));
  assert.equal(s.facilities.servers.rack1, 1);
  assert.ok(s.techDone.includes("card-1080") && s.techDone.includes("srv-r1") && s.techDone.includes("srv-1120"));
  assert.ok(r1);
});

test("racks need a network fast enough for their work, or run at half speed", () => {
  const s = { biz: BUSINESSES.map((b) => ({ id: b.id, owned: 1 })), techDone: RESEARCH.map((e) => e.id), facilities: { mine: {}, cluster: {}, servers: { rack1: 1, psu400: 1, labfan: 2, hdd1t: 1 } } };
  const alone = serverOutput(s).perSecond;
  s.facilities.servers["l-cat5000"] = 1; // 200 of the rack's 160 work
  const linked = serverOutput(s).perSecond;
  assert.ok(Math.abs(linked / alone - 2) < 1e-9, `${linked} vs ${alone}`);
});

import { migrateSave, remapBestEra } from "../../src/lib/gameSave.js";

test("a v11 save past a new era gets that row started, and its best era still points at the same era", () => {
  const ids = ["timber", "paper", "loom", "punchcards", "relay", "sand", "copper", "glass", "filament", "tubes", "mainframes", "germanium", "transistors", "silicon", "wafers", "ics", "minis", "cpu", "homepc", "consoles", "dialup", "gpu", "cloud", "phones", "rgb", "ai", "quantum"];
  const v11 = { version: 11, investors: 5, biz: ids.map((id) => ({ id, owned: id === "gpu" || id === "dialup" ? 3 : 1 })) };
  const out = migrateSave(v11);
  const row = (id) => out.biz[BUSINESSES.findIndex((b) => b.id === id)];
  for (const id of ["supercomputers", "workstations", "laptops", "multimedia", "accel3d"]) assert.ok(row(id).owned > 0, id);
  assert.equal(row("tablets").owned > 0, true, "past RGB Battlestations");
  // bestEra 21 was Graphics Cards in the v11 order.
  assert.equal(BUSINESSES[remapBestEra(21, 11)].id, "gpu");
});

test("a v12 save remaps bestEra by id and seeds Radio Valves if Relay is already owned", () => {
  const v12ids = ["timber", "paper", "loom", "punchcards", "relay", "sand", "copper", "glass", "filament", "tubes", "mainframes", "germanium", "transistors", "silicon", "wafers", "ics", "minis", "cpu", "homepc", "consoles", "supercomputers", "workstations", "laptops", "dialup", "multimedia", "accel3d", "gpu", "cloud", "phones", "tablets", "rgb", "ai", "quantum", "vr", "chatbots", "supercluster"];
  const v12 = { version: 12, investors: 3, biz: v12ids.map((id) => ({ id, owned: 1 })), bestEra: v12ids.indexOf("tubes") };
  const out = migrateSave(v12);
  const row = (id) => out.biz[BUSINESSES.findIndex((b) => b.id === id)];
  assert.ok(row("radios").owned > 0, "Radio Valves seeded because Relay was already owned");
  assert.equal(row("tubes").owned, 1, "Vacuum Tubes kept by id");
  assert.equal(row("relay").owned, 1);
  assert.equal(BUSINESSES[remapBestEra(v12ids.indexOf("tubes"), 12)].id, "tubes");
  assert.equal(BUSINESSES[remapBestEra(v12ids.indexOf("relay"), 12)].id, "relay");
  // A v12 player who has not yet reached Relay does not get the new era started.
  const early = migrateSave({ version: 12, investors: 0, biz: ["timber", "paper", "loom", "punchcards"].map((id) => ({ id, owned: 1 })) });
  assert.equal(early.biz[BUSINESSES.findIndex((b) => b.id === "radios")].owned, 0);
});
