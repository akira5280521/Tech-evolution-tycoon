// Lab projects that use materials: a fab test run and a clean room.
import { test } from "node:test";
import assert from "node:assert/strict";
import { LAB_CLEAN, LAB_FAB, buyLabProject, cleanLab, labQuote } from "../../src/lib/empire.js";
import { researchSpeed } from "../../src/lib/research.js";

const NOW = Date.UTC(2026, 10, 22, 12);
const player = (supply) => ({ data: 100, tokens: 0, supply, lab: null, facilities: {} });

test("the fab test run takes R&D and wafers for an era token, three a day", () => {
  const s = player({ wafers: 400 * 5 });
  assert.ok(buyLabProject(s, "fab", NOW).ok);
  assert.equal(s.tokens, 1);
  assert.equal(s.supply.wafers, 400 * 4);
  assert.equal(s.data, 100 - LAB_FAB.cost);
  buyLabProject(s, "fab", NOW);
  buyLabProject(s, "fab", NOW);
  assert.match(labQuote(s, "fab", NOW).reason, /No test runs left/);
});

test("short of the material, nothing is spent and the reason says what's missing", () => {
  const s = player({ wafers: 399 });
  const q = buyLabProject(s, "fab", NOW);
  assert.equal(q.ok, false);
  assert.match(q.reason, /Needs 400 wafers/);
  assert.equal(s.data, 100);
  assert.match(labQuote(player({}), "cleanroom", NOW).reason, /Needs 100 polysilicon/);
});

test("the clean room makes TECH research 25% faster for 15 minutes", () => {
  const s = player({ polysilicon: 100 });
  const before = researchSpeed(s, NOW);
  assert.ok(buyLabProject(s, "cleanroom", NOW).ok);
  assert.equal(s.supply.polysilicon, 0);
  assert.ok(Math.abs(researchSpeed(s, NOW + 1000) - before * LAB_CLEAN.speed) < 1e-9);
  assert.equal(researchSpeed(s, NOW + LAB_CLEAN.ms + 1), before);
  assert.match(labQuote({ ...s, supply: { polysilicon: 100 } }, "cleanroom", NOW + 1000).reason, /running/);
});

test("old lab saves get the new fields", () => {
  const lab = cleanLab({ overclockUntil: 0, patents: 2 }, NOW);
  assert.equal(lab.fabs, 0);
  assert.equal(lab.cleanUntil, 0);
});
