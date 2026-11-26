// Storage caps: bins hold so much, extra output is lost, stock is never
// thrown away, and bigger bins cost cash and survive prestige.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { STORAGE_BASE, buyStorage, creditBatch, creditCycles, snapshotMeta, storageCost, supplyCap, supplyFull } from "../../src/lib/empire.js";
import { migrateSave } from "../../src/lib/gameSave.js";

const sandRow = BUSINESSES.findIndex((b) => b.makes?.sand);
function state(sand = 0, owned = 1) {
  return {
    cash: 1e12,
    biz: BUSINESSES.map((b, i) => ({ owned: i === sandRow ? owned : 0, manager: true })),
    supply: { sand },
    storage: {},
    upgrades: {},
  };
}

test("the bins stop at the cap and show FULL", () => {
  const s = state(0);
  const cap = supplyCap(s, "sand");
  assert.ok(cap >= STORAGE_BASE);
  s.supply.sand = cap - 1;
  creditCycles(s, sandRow, 1, 0);
  creditCycles(s, sandRow, 1, 0);
  assert.equal(s.supply.sand, cap);
  assert.ok(supplyFull(s, "sand"));
});

test("stock already over the cap (an older save) is kept, just not added to", () => {
  const s = state(50_000);
  creditCycles(s, sandRow, 1, 0);
  assert.equal(s.supply.sand, 50_000);
  const due = BUSINESSES.map((_, i) => (i === sandRow ? 100 : 0));
  creditBatch(s, due, 0);
  assert.equal(s.supply.sand, 50_000);
});

test("the cap never drops below 100 cycles of what the rows make", () => {
  const s = state(0, 1000);
  assert.ok(supplyCap(s, "sand") >= 100 * 1000);
});

test("bigger bins cost cash, multiply the cap and stay through prestige", () => {
  const s = state(0);
  const cost = storageCost(s, "sand");
  assert.ok(buyStorage(s, "sand"));
  assert.equal(s.cash, 1e12 - cost);
  const floor = supplyCap(s, "sand", 0) - STORAGE_BASE;
  assert.equal(supplyCap(s, "sand"), STORAGE_BASE * 4 + floor);
  assert.ok(storageCost(s, "sand") > cost);
  assert.deepEqual(snapshotMeta(s, { resetRunUpgrades: true }).storage, { sand: 1 });
  const poor = state(0);
  poor.cash = 0;
  assert.ok(!buyStorage(poor, "sand"));
});

test("old saves load with no bigger bins; bad values are dropped", () => {
  const old = migrateSave({ version: 11, cash: 5, supply: { sand: 10 } });
  assert.deepEqual(old.storage, {});
  const odd = migrateSave({ version: 12, cash: 5, storage: { sand: 3, glass: -2, wafers: "x", nope: 4 } });
  assert.deepEqual(odd.storage, { sand: 3 });
});

import { ERA_MATERIAL } from "../../src/lib/gameConfig.js";
test("the bins always hold enough for each material the next era needs", () => {
  const s = state(0);
  s.erasPaid = BUSINESSES.filter((b) => ERA_MATERIAL[b.id] && b.id !== "supercluster").map((b) => b.id);
  for (const m of ERA_MATERIAL.supercluster) assert.ok(supplyCap(s, m.key) >= m.amount, m.key);
  // Before anything's paid, each bin fits the first era that asks for it.
  const fresh = state(0);
  assert.ok(supplyCap(fresh, "paper") >= 100);
  assert.ok(supplyCap(fresh, "polysilicon") >= ERA_MATERIAL.cpu[1].amount);
});
