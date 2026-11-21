// The mine and cluster: every card adds pay until the cap, and the "best next
// part" suggestion never stalls on a card that needs power or cooling.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PARTS, SHARE_CAP, STARTER_SHARE, facilityReport, nextPurchase, purchasePart } from "../../src/lib/facilities.js";

const BIZ = 1e12;
const open = (cluster = {}, mine = {}) => ({ biz: [{ id: "cpu", owned: 1 }], facilities: { mine, cluster, servers: {} }, cash: 1e30 });
// facilityUnlocked looks the AI row up by id in BUSINESSES order, so give it a full row list.
import { BUSINESSES } from "../../src/lib/gameConfig.js";
const withAi = (state) => ({ ...state, biz: BUSINESSES.map((b) => ({ id: b.id, owned: b.id === "ai" || b.id === "cpu" ? 1 : 0 })) });

test("one running 3060 is the starter share, well under the cap", () => {
  const r = facilityReport(withAi(open({ raster3060: 1, psu750: 1, fans: 1, ddr4_32: 1 })), BIZ);
  assert.ok(Math.abs(r.cluster.share - STARTER_SHARE) < 1e-9, `share ${r.cluster.share}`);
  assert.ok(r.share < SHARE_CAP / 10);
});

test("each better card adds pay until the cap", () => {
  const ladder = [
    { raster3060: 1, psu750: 1, fans: 1, ddr4_32: 1 },
    { raster3060: 4, psu750: 3, fans: 3, ddr4_32: 2 },
    { raster3060: 4, raster4090: 2, psu750: 3, psu1200: 2, fans: 3, liquid: 2, ddr4_32: 2, ddr5_64: 1 },
    { raster3060: 4, raster4090: 2, tensorH100: 4, psu750: 3, psu1200: 6, fans: 3, liquid: 6, ddr4_32: 2, ddr5_64: 2 },
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
