// TECH lists only this era and earlier ones. A later-era project stays ???
// until that era is reached (kept after prestige). Search must not leak names.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { RESEARCH, researchItem } from "../../src/lib/research.js";
import { eraReachedIndex } from "../../src/lib/records.js";
import { eraIndexForYear, techRevealed, yearReachedAt } from "../../src/lib/techFog.js";
import { matchesSearch, revealedHaystack } from "../../src/lib/searchText.js";
import { blankMeta } from "../../src/lib/empire.js";

const owning = (throughId) => {
  const last = BUSINESSES.findIndex((b) => b.id === throughId);
  return BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= last ? 1 : 0 }));
};
const at = (throughId, extra = {}) => ({ ...blankMeta(), biz: owning(throughId), techDone: [], ...extra });

test("a project's reveal era is the first ladder step whose company year covers it", () => {
  assert.equal(BUSINESSES[eraIndexForYear(1)].id, "timber");
  assert.equal(BUSINESSES[eraIndexForYear(1951)].id, "mainframes");
  // 1956 sits between transistors (1954) and silicon (1959).
  assert.equal(BUSINESSES[eraIndexForYear(1956)].id, "silicon");
  assert.equal(BUSINESSES[eraIndexForYear(1959)].id, "silicon");
  assert.ok(yearReachedAt(BUSINESSES.findIndex((b) => b.id === "mainframes")) >= 1951);
  assert.ok(yearReachedAt(BUSINESSES.findIndex((b) => b.id === "glass")) < 1951);
});

test("at glass, only the Hollerith project is revealed; later eras stay hidden", () => {
  const s = at("glass");
  assert.equal(techRevealed(s, researchItem("tab-hollerith")), true);
  for (const id of ["store-tape", "srv-mark1", "store-hdd", "srv-7090", "srv-360", "cpu-p2"]) {
    assert.equal(techRevealed(s, researchItem(id)), false, id);
  }
});

test("Mainframes reveals that era's projects, not Silicon's or later", () => {
  const s = at("mainframes");
  assert.equal(techRevealed(s, researchItem("tab-hollerith")), true);
  assert.equal(techRevealed(s, researchItem("store-tape")), true);
  assert.equal(techRevealed(s, researchItem("srv-mark1")), true);
  // Next era (and everything after) stays ??? — no peek at 1959 or 1997.
  for (const id of ["store-hdd", "srv-7090", "srv-360", "cpu-p2"]) {
    assert.equal(techRevealed(s, researchItem(id)), false, id);
  }
});

test("reaching an era keeps those projects revealed after prestige", () => {
  const s = at("timber", { bestEra: BUSINESSES.findIndex((b) => b.id === "mainframes") });
  assert.ok(eraReachedIndex(s) >= BUSINESSES.findIndex((b) => b.id === "mainframes"));
  assert.equal(techRevealed(s, researchItem("srv-mark1")), true);
  assert.equal(techRevealed(s, researchItem("store-tape")), true);
  assert.equal(techRevealed(s, researchItem("srv-7090")), false);
});

test("search matches a revealed name and never a hidden one", () => {
  const s = at("mainframes");
  const mark1 = researchItem("srv-mark1");
  const p2 = researchItem("cpu-p2");
  assert.equal(matchesSearch("mark 1", revealedHaystack(techRevealed(s, mark1), mark1.name, mark1.spec, mark1.year)), true);
  assert.equal(matchesSearch("pentium", revealedHaystack(techRevealed(s, p2), p2.name, p2.spec, p2.year)), false);
  assert.equal(matchesSearch("chipwright", revealedHaystack(techRevealed(s, p2), p2.name, p2.spec, p2.year)), false);
  // An empty query still lists the hidden row (as ???); a name query must not.
  assert.equal(matchesSearch("", revealedHaystack(false, p2.name)), true);
  assert.ok(RESEARCH.some((e) => e.id === "cpu-p2"));
});
