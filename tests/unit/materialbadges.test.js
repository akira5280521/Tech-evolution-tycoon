// Lifetime material badges: made, refined, sold, and every shortage.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { SHORTAGES, badgeList, collectBadges, creditCycles, sellMaterial, snapshotMeta } from "../../src/lib/empire.js";
import { migrateSave } from "../../src/lib/gameSave.js";

const wafers = BUSINESSES.findIndex((b) => b.makes?.wafers);
const player = (extra = {}) => ({ cash: 0, supply: { silicon: 1e9 }, storage: {}, biz: BUSINESSES.map((_, i) => ({ owned: i <= wafers ? 10 : 0, manager: true })), ...extra });

test("making material counts for good, and earns its badge", () => {
  const s = player();
  creditCycles(s, wafers, 3, 0);
  assert.ok(s.materialsMade.wafers > 0);
  assert.equal(snapshotMeta(s).materialsMade.wafers, s.materialsMade.wafers, "kept through prestige");
  s.materialsMade.wafers = 100000;
  collectBadges(s);
  assert.ok(s.badgesEarned.includes("made-wafers"));
});

test("selling and the shortages have badges too", () => {
  const s = player({ supply: { copper: 20000 } });
  sellMaterial(s, "copper", 10000, Date.now());
  s.eventsDone = SHORTAGES.map((x) => x.id);
  collectBadges(s);
  assert.ok(s.badgesEarned.includes("materials-sold"));
  assert.ok(s.badgesEarned.includes("shortages-all"));
  const group = badgeList(s).filter((b) => b.group === "MATERIALS");
  assert.ok(group.length >= 14);
});

test("old saves start the totals at zero", () => {
  const save = migrateSave({ version: 12, cash: 1 });
  assert.deepEqual(save.materialsMade, {});
  assert.equal(save.materialsSold, 0);
});
