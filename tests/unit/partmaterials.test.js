// RIGS parts take materials by type, and the button says what's missing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { PARTS, PART_GROUPS, partMaterials, partShort, purchasePart } from "../../src/lib/facilities.js";
import { RESEARCH } from "../../src/lib/research.js";

const part = (id) => PARTS.find((p) => p.id === id);
const all = () => ({
  biz: BUSINESSES.map((b) => ({ id: b.id, owned: 1 })),
  techDone: RESEARCH.map((r) => r.id),
  facilities: { mine: {}, cluster: {}, servers: {}, bench: {} },
  cash: 1e40,
  supply: {},
});

test("every part kind belongs to one material group", () => {
  const kinds = [...new Set(PARTS.map((p) => p.kind))];
  for (const k of kinds) assert.equal(Object.values(PART_GROUPS).filter((g) => g.kinds.includes(k)).length, 1, k);
});

test("chips take wafers, screens glass, power copper; late parts the refined grade", () => {
  assert.deepEqual(Object.keys(partMaterials(part("c-8088"))), ["wafers"]);
  assert.deepEqual(Object.keys(partMaterials(part("y-8513"))), ["glass"]);
  assert.deepEqual(Object.keys(partMaterials(part("p-at230"))), ["copper"]);
  assert.deepEqual(Object.keys(partMaterials(part("c-14900k"))), ["polysilicon"]);
  assert.ok(partMaterials(part("c-486")).wafers > partMaterials(part("c-8088")).wafers, "later parts take a little more");
});

test("buying takes the materials; short of them, nothing is spent and the reason names them", () => {
  const s = all();
  const p = part("b-z97");
  const need = partMaterials(p).wafers;
  s.supply.wafers = need - 1;
  const cash = s.cash;
  const no = purchasePart(s, "bench", p.id);
  assert.equal(no.ok, false);
  assert.match(no.reason, new RegExp(`Needs ${need} wafers`));
  assert.equal(s.cash, cash);
  assert.deepEqual(partShort(s, p), [{ key: "wafers", need, have: need - 1 }]);
  s.supply.wafers = need + 3;
  assert.ok(purchasePart(s, "bench", p.id).ok);
  assert.equal(s.supply.wafers, 3);
});
