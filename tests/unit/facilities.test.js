// The mine and cluster: every card adds pay until the cap, and the "best next
// part" suggestion never stalls on a card that needs power or cooling.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PARTS, SHARE_CAP, STARTER_SHARE, facilityReport, nextPurchase, purchasePart } from "../../src/lib/facilities.js";

const BIZ = 1e12;
const open = (cluster = {}, mine = {}) => ({ biz: [{ id: "cpu", owned: 1 }], facilities: { mine, cluster, servers: {} }, cash: 1e30, supply: { wafers: 1e8, glass: 1e8, copper: 1e8, polysilicon: 1e8, ofcopper: 1e8 }, });
// facilityUnlocked looks the AI row up by id in BUSINESSES order, so give it a full row list.
import { BUSINESSES } from "../../src/lib/gameConfig.js";
// Every era reached and everything researched, so every part is open.
import { RESEARCH } from "../../src/lib/research.js";
const withAi = (state) => ({ ...state, biz: BUSINESSES.map((b) => ({ id: b.id, owned: 1 })), techDone: RESEARCH.map((e) => e.id) });

test("one running 3060 is the starter share, well under the cap", () => {
  const r = facilityReport(withAi(open({ raster3060: 1, psu750: 1, fans: 1, ddr4_32: 1 })), BIZ);
  assert.ok(Math.abs(r.cluster.share - STARTER_SHARE) < 1e-9, `share ${r.cluster.share}`);
  assert.ok(r.share < SHARE_CAP / 10);
});

test("each better card adds pay until the cap", () => {
  const ladder = [
    { raster3060: 1, psu750: 1, fans: 1, ddr4_32: 1 },
    { raster3060: 4, psu750: 3, fans: 3, ddr4_32: 2 },
    { raster3060: 4, raster4090: 2, psu750: 3, psu1200: 2, fans: 3, liquid: 2, ddr5_64: 1 },
    { raster3060: 4, raster4090: 2, tensorH100: 4, psu750: 3, psu1200: 6, fans: 3, liquid: 6, ddr5_64: 2 },
  ];
  let last = 0;
  for (const cluster of ladder) {
    const share = facilityReport(withAi(open(cluster)), BIZ).share;
    assert.ok(share > last, `share should rise: ${last} -> ${share}`);
    last = share;
  }
  const full = Object.fromEntries(PARTS.filter((p) => p.fits.includes("cluster") && !p.soon).map((p) => [p.id, 24]));
  assert.ok(Math.abs(facilityReport(withAi(open(full, full)), BIZ).share - SHARE_CAP) < 1e-12, "a full build reaches the cap");
});

test("following the best-next-part suggestion keeps the plant growing", () => {
  let s = withAi(open());
  let bought = 0;
  for (let i = 0; i < 500; i++) {
    const next = nextPurchase(s, BIZ * 1e4);
    if (!next) break;
    assert.ok(purchasePart(s, next.facilityId, next.partId).ok, `couldn't buy ${next.partId}`);
    bought++;
  }
  const share = facilityReport(s, BIZ).share;
  assert.ok(bought > 20, `only ${bought} parts suggested`);
  assert.ok(share > SHARE_CAP * 0.5, `stalled at ${(share * 100).toFixed(2)}%`);
});

import { partCost, rebuildCost, rebuildPlants, unfitRefund } from "../../src/lib/facilities.js";
import { partValue } from "../../src/lib/plantValue.js";
import { snapshotMeta } from "../../src/lib/empire.js";

const layout = { cluster: { raster3060: 3, psu750: 2, fans: 3, ddr4_32: 1 }, mine: { raster3060: 2, psu750: 1, fans: 2, ddr4_16: 1 }, servers: {} };

test("a prestige remembers the plants for REBUILD, and an empty run keeps the older layout", () => {
  const s = withAi(open());
  s.facilities = JSON.parse(JSON.stringify(layout));
  const meta = snapshotMeta(s);
  assert.equal(meta.lastPlants.cluster.raster3060, 3);
  const meta2 = snapshotMeta({ ...withAi(open()), lastPlants: meta.lastPlants });
  assert.equal(meta2.lastPlants.cluster.raster3060, 3, "an empty run doesn't wipe the layout");
});

test("REBUILD buys cheapest first, stops when cash runs out, and finishes on a second tap", () => {
  const s = withAi(open());
  s.lastPlants = layout;
  const all = rebuildCost(s);
  assert.equal(all.parts, 15);
  s.cash = all.cost / 3;
  const first = rebuildPlants(s);
  assert.ok(first.bought > 0 && first.bought < 15, `bought ${first.bought}`);
  assert.ok(s.cash >= 0);
  s.cash = 1e30;
  rebuildPlants(s);
  assert.equal(rebuildCost(s).parts, 0);
  assert.deepEqual(s.facilities.cluster, layout.cluster);
});

test("each part's value: positive for a card, 'not needed' for spare power, the cap when full", () => {
  const s = withAi(open({ raster3060: 1, psu750: 1, fans: 1, ddr4_32: 1 }));
  const card = partValue(s, "cluster", "raster3090", BIZ);
  assert.ok(card.added > 0 && card.payback > 0);
  const psu = partValue(withAi(open({ raster3060: 1, psu750: 3, fans: 3, ddr4_32: 1 })), "cluster", "psu750", BIZ);
  assert.equal(psu.added, 0);
  assert.match(psu.why, /power to spare/);
  const full = Object.fromEntries(PARTS.filter((p) => p.fits.includes("cluster") && !p.soon).map((p) => [p.id, 23]));
  const capped = partValue(withAi(open(full, full)), "cluster", "raster3060", BIZ);
  assert.match(capped.why, /cap/);
});

test("the mine takes only its 16 GB desktop stick; server sticks a save held there are refunded", () => {
  for (const id of ["ddr4_32", "ddr5_64", "ddr5_128"]) assert.ok(!PARTS.find((p) => p.id === id).fits.includes("mine"), id);
  const refund = unfitRefund({ mine: { ddr5_64: 2 }, cluster: { ddr5_64: 2 } });
  const p = PARTS.find((x) => x.id === "ddr5_64");
  assert.equal(refund, partCost(p, 0) + partCost(p, 1));
});

import { REBUILD_SECONDS, rebuildReady } from "../../src/lib/facilities.js";

test("REBUILD waits on parts that aren't worth it yet", () => {
  const s = withAi(open());
  s.lastPlants = { cluster: { raster3060: 1, tensorB200: 1, psu750: 2, fans: 2, ddr4_32: 1 }, mine: {}, servers: {} };
  s.cash = 1e30;
  // Low business income: a $2.2T card can't pay for itself in 15 minutes.
  const limits = { maxCost: 1e7 * REBUILD_SECONDS, businessPerSecond: 1e10 };
  const ready = rebuildReady(s, limits);
  assert.ok(ready.parts >= 1 && ready.parts < 7, `ready ${ready.parts}`);
  rebuildPlants(s, limits);
  assert.equal(s.facilities.cluster.tensorB200 || 0, 0, "the B200 waits");
  // Rich enough: everything is worth it.
  rebuildPlants(s);
  assert.equal(rebuildCost(s).parts, 0);
});

test("big memory sticks count toward the Frontier model as a set", () => {
  // Enough card memory for Frontier (3 B200 = 576 GB), 128 GB of RAM (Mural).
  const cluster = { tensorB200: 3, psu1600: 2, immersion: 2, ddr5_128: 1 };
  const s = withAi(open(cluster));
  const r = facilityReport(s, BIZ).cluster;
  assert.equal(r.tier, "Mural");
  const v = partValue(s, "cluster", "ddr5_128", BIZ);
  assert.ok(v.added > 0, "a 128 GB stick shows its value toward Frontier");
  assert.ok(v.extras.filter((n) => /128 GB/.test(n)).length >= 2, "judged with the other sticks it takes");
  const done = facilityReport(withAi(open({ ...cluster, ddr5_128: 4 })), BIZ).cluster;
  assert.equal(done.tier, "Frontier");
});

import { BOARDS, boardOf, fitPart, migrateFacilities } from "../../src/lib/facilities.js";

const cost = (id, from, to) => {
  const p = PARTS.find((x) => x.id === id);
  let t = 0;
  for (let i = from; i < to; i++) t += partCost(p, i);
  return t;
};

test("the mining board holds 2 DDR4 sticks, 32 GB at most", () => {
  assert.equal(BOARDS.mine.slots, 2);
  let counts = {};
  for (let i = 0; i < 2; i++) counts = fitPart(counts, "mine", "ddr4_16").counts;
  assert.equal(boardOf("mine", counts).gb, 32);
  assert.match(fitPart(counts, "mine", "ddr4_16").reason, /full|32 GB/);
});

test("the first DDR5 stick swaps the cluster to a DDR5 board, selling DDR4 back at half", () => {
  const s = withAi(open({ ddr4_32: 3 }));
  s.cash = 1e15;
  const before = s.cash;
  const done = purchasePart(s, "cluster", "ddr5_64");
  assert.ok(done.ok);
  assert.equal(s.facilities.cluster.ddr4_32 || 0, 0);
  assert.equal(s.facilities.cluster.ddr5_64, 1);
  assert.equal(done.refund, cost("ddr4_32", 0, 3) / 2);
  assert.equal(before - s.cash, done.cost - done.refund);
  assert.match(fitPart(s.facilities.cluster, "cluster", "ddr4_32").reason, /DDR5/);
  assert.equal(boardOf("cluster", s.facilities.cluster).gen, "DDR5");
});

test("a full board swaps its smallest stick for a bigger one, and refuses same-size sticks", () => {
  let counts = { ddr5_64: 20, ddr5_128: 12 };
  assert.equal(boardOf("cluster", counts).used, 32);
  assert.match(fitPart(counts, "cluster", "ddr5_64").reason, /32 memory slots/);
  const fit = fitPart(counts, "cluster", "ddr5_128");
  assert.equal(fit.counts.ddr5_64, 19);
  assert.equal(fit.counts.ddr5_128, 13);
  assert.equal(fit.refund, cost("ddr5_64", 19, 20) / 2);
  assert.match(fit.note, /64 GB/);
});

test("2 TB of RAM (Foundation) needs a DDR5 board; DDR4 tops out at 1 TB", () => {
  assert.equal(boardOf("cluster", { ddr4_32: 24 }).gb, 768);
  const s = withAi(open({ tensorB200: 8, psu1600: 8, immersion: 8, ddr5_128: 16 }));
  assert.equal(facilityReport(s, BIZ).cluster.tier, "Foundation");
});

test("old saves with mixed or overfull boards are fixed with a full refund", () => {
  const { facilities, refund } = migrateFacilities({
    mine: { ddr4_32: 1, ddr4_16: 3 },
    cluster: { ddr4_32: 2, ddr5_64: 1 },
    servers: {},
  });
  assert.equal(facilities.mine.ddr4_16, 2);
  assert.equal(facilities.mine.ddr4_32 || 0, 0);
  assert.equal(facilities.cluster.ddr4_32 || 0, 0);
  assert.equal(facilities.cluster.ddr5_64, 1);
  assert.equal(refund, cost("ddr4_32", 0, 1) + cost("ddr4_16", 2, 3) + cost("ddr4_32", 0, 2));
});
