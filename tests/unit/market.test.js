// The material market: tiny era-based prices that drift slowly; selling and
// swapping take stock the player has, and swaps lose a fee.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { SWAP_FEE, materialPrice, sellMaterial, swapMaterial, swapQuote } from "../../src/lib/empire.js";

const NOW = Date.UTC(2026, 10, 22, 12);
const player = (supply) => ({ cash: 0, supply, storage: {}, biz: BUSINESSES.map(() => ({ owned: 1 })) });

test("prices are tiny, set by the era, and drift only a little", () => {
  assert.ok(materialPrice("wafers", NOW) > materialPrice("wood", NOW), "later materials are worth more");
  const wafers = BUSINESSES.find((b) => b.makes?.wafers);
  assert.ok(materialPrice("wafers", NOW) < wafers.revenue * 0.06, "a unit is worth a twentieth of a cycle");
  const prices = Array.from({ length: 24 }, (_, h) => materialPrice("copper", NOW + h * 3600e3));
  assert.ok(Math.max(...prices) / Math.min(...prices) < 1.4);
  assert.ok(Math.abs(materialPrice("copper", NOW) - materialPrice("copper", NOW + 60e3)) / materialPrice("copper", NOW) < 0.01, "slow");
  assert.ok(materialPrice("polysilicon", NOW) > materialPrice("silicon", NOW) * 8, "a refined grade is priced at about twelve of its raw material");
});

test("selling turns stock into cash, never more than you have", () => {
  const s = player({ copper: 150 });
  const cash = sellMaterial(s, "copper", 100, NOW);
  assert.ok(cash > 0 && s.cash === cash);
  assert.equal(s.supply.copper, 50);
  sellMaterial(s, "copper", 100, NOW);
  assert.equal(s.supply.copper, 0);
  assert.equal(sellMaterial(s, "copper", 100, NOW), 0);
});

test("swapping loses the fee and fits the bins", () => {
  const s = player({ wafers: 1000, silicon: 0 });
  const q = swapQuote(s, "wafers", "silicon", 100, NOW);
  const fair = (100 * materialPrice("wafers", NOW)) / materialPrice("silicon", NOW);
  assert.ok(q.get <= fair * (1 - SWAP_FEE) + 1 && q.get > 0);
  assert.ok(swapMaterial(s, "wafers", "silicon", 100, NOW));
  assert.equal(s.supply.silicon, q.get);
  assert.equal(s.supply.wafers, 1000 - q.give);
  assert.equal(swapQuote(player({ wood: 1 }), "wood", "wafers", 100, NOW).get, 0, "too little to buy one");
});
