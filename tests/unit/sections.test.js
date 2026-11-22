// The game screen's SUPPLY / TECH split: which rows go where, the view a
// player sees, the warning dot, and the rows a tutorial step points at.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { normalizePrefs } from "../../src/lib/gamePrefs.js";
import { supplyCap } from "../../src/lib/empire.js";
import {
  DEFAULT_SECTION, makerOf, normalizeSection, rowNamedLast, rowSection, rowShortOf, sectionOfId,
  sectionOfTarget, sectionRows, shownSection, supplyAlerts,
} from "../../src/lib/sections.js";

const idx = (id) => BUSINESSES.findIndex((b) => b.id === id);
const withOwned = (owned, supply = {}) => ({
  biz: BUSINESSES.map((b) => ({ id: b.id, owned: owned[b.id] || 0 })),
  supply,
});

test("SUPPLY holds exactly the rows that make a material", () => {
  const supply = BUSINESSES.filter((_, i) => rowSection(i) === "supply").map((b) => b.id);
  for (const id of ["timber", "paper", "sand", "copper", "glass", "filament", "germanium", "silicon", "wafers"]) {
    assert.ok(supply.includes(id), `${id} is a supply row`);
  }
  BUSINESSES.forEach((b, i) => assert.equal(rowSection(i), b.makes ? "supply" : "tech", b.id));
  assert.equal(sectionOfId("loom"), "tech");
  assert.equal(sectionOfId("tubes"), "tech");
  assert.equal(sectionOfId("nope"), null);
});

test("TECH is the default and the choice is kept in prefs", () => {
  assert.equal(DEFAULT_SECTION, "tech");
  assert.equal(normalizePrefs({}).gameSection, "tech");
  assert.equal(normalizePrefs({ gameSection: "supply" }).gameSection, "supply");
  assert.equal(normalizePrefs({ gameSection: "junk" }).gameSection, "tech");
  assert.equal(normalizeSection(undefined), "tech");
});

test("a new game with no TECH row open shows SUPPLY", () => {
  const fresh = withOwned({ timber: 1 });
  assert.deepEqual(sectionRows(fresh, "tech"), []);
  assert.equal(shownSection(fresh, "tech"), "supply");
  const later = withOwned({ timber: 20, paper: 10, loom: 1 });
  assert.equal(shownSection(later, "tech"), "tech");
  assert.equal(shownSection(later, "supply"), "supply");
  assert.deepEqual(sectionRows(later, "tech"), [idx("loom")]);
  assert.deepEqual(sectionRows(later, "supply"), [idx("timber"), idx("paper")]);
});

test("a TECH row short of a material names it and its maker", () => {
  const s = withOwned({ timber: 20, paper: 10, loom: 5 }, { paper: 0 });
  assert.deepEqual(rowShortOf(s, idx("loom")), ["paper"]);
  assert.equal(makerOf("paper"), idx("paper"));
  const fed = withOwned({ timber: 20, paper: 10, loom: 5 }, { paper: 1e6 });
  assert.deepEqual(rowShortOf(fed, idx("loom")), []);
});

test("the SUPPLY dot shows for an empty needed material or a FULL bin", () => {
  assert.deepEqual(supplyAlerts(withOwned({ timber: 5 }, { wood: 0 })), []); // nobody needs wood yet
  assert.deepEqual(supplyAlerts(withOwned({ timber: 5, paper: 1 }, { wood: 0 })), [{ key: "wood", kind: "empty" }]);
  const ok = withOwned({ timber: 5, paper: 1 }, { wood: 5 });
  assert.deepEqual(supplyAlerts(ok), []);
  const full = withOwned({ timber: 5, paper: 1 }, {});
  full.supply.wood = supplyCap(full, "wood");
  assert.deepEqual(supplyAlerts(full), [{ key: "wood", kind: "full" }]);
});

test("tutorial targets on a row map to that row's section", () => {
  assert.equal(sectionOfTarget('[data-tile="timber"]'), "supply");
  assert.equal(sectionOfTarget('[data-buy="paper"]'), "supply");
  assert.equal(sectionOfTarget('[data-hire="loom"]'), "tech");
  assert.equal(sectionOfTarget("[data-supply]"), null);
  assert.equal(sectionOfTarget(null), null);
});

test("NEXT MOVE acts on the last business it names", () => {
  assert.equal(rowNamedLast("Loom Works is short of paper. Buy another Paper Mill for $5."), "paper");
  assert.equal(rowNamedLast("Good time to prestige."), null);
  const name = BUSINESSES[idx("loom")].name;
  assert.equal(rowNamedLast(`Hire a manager for ${name}.`), "loom");
});

test("refined grades and shortage events light the SUPPLY dot", () => {
  const ics = idx("ics");
  const late = withOwned({ timber: 5, paper: 1, ics: 1 }, { wood: 5, polysilicon: 0 });
  late.bestEra = ics;
  assert.deepEqual(supplyAlerts(late).filter((a) => a.key === "polysilicon"), []); // none on hand yet
  late.supply.polysilicon = supplyCap(late, "polysilicon");
  assert.deepEqual(supplyAlerts(late).filter((a) => a.key === "polysilicon"), [{ key: "polysilicon", kind: "full" }]);
  const now = 1e12;
  const hit = withOwned({ timber: 5, paper: 1 }, { wood: 5 });
  hit.shortage = { key: "wood", until: now + 60000 };
  assert.deepEqual(supplyAlerts(hit, now), [{ key: "wood", kind: "shortage" }]);
  assert.deepEqual(supplyAlerts(hit, now + 120000), []);
  assert.equal(makerOf("polysilicon"), -1); // Needs opens its sheet instead
});
