// 0.0.31 TECH fixes: date order (#48), 1970s rows (#56), release months and
// one project at a time (#59), the first research server (#58).
import { test } from "node:test";
import assert from "node:assert/strict";
import { RESEARCH, MONTH_MS, canStartResearch, inGameMonth, noteCompanyYear, playerYear, researchCost, researchItem, researchLock, researchRows, rescuePunchCardSave, startResearch } from "../../src/lib/research.js";
import { RELEASE_MONTH } from "../../src/lib/releaseMonths.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { techRevealed } from "../../src/lib/techFog.js";

const at = (eraId) => ({ biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= BUSINESSES.findIndex((x) => x.id === eraId) ? 1 : 0 })), techDone: [], data: 1e9, facilities: {} });
const key = (e) => e.year * 12 + e.month - 1;
const byId = Object.fromEntries(RESEARCH.map((e) => [e.id, e]));

test("every project has a real release month", () => {
  for (const e of RESEARCH) {
    assert.ok(Number.isInteger(RELEASE_MONTH[e.id]) && RELEASE_MONTH[e.id] >= 1 && RELEASE_MONTH[e.id] <= 12, e.id);
    assert.equal(e.month, RELEASE_MONTH[e.id]);
  }
});

test("every prerequisite exists, came out no later, and no chain loops", () => {
  for (const e of RESEARCH) {
    if (!e.prereq) continue;
    const p = byId[e.prereq];
    assert.ok(p, `${e.id} needs missing ${e.prereq}`);
    assert.ok(key(p) <= key(e), `${e.id} (${e.year}-${e.month}) needs later ${p.id} (${p.year}-${p.month})`);
    const seen = new Set();
    for (let x = e; x?.prereq; x = byId[x.prereq]) {
      assert.ok(!seen.has(x.id), `loop at ${e.id}`);
      seen.add(x.id);
    }
  }
});

test("the 8-inch floppy comes after the disk packs, and the 5.25-inch drive after it", () => {
  const chain = (id) => { const out = []; for (let x = byId[id]; x; x = byId[x.prereq]) out.push(x.id); return out; };
  assert.ok(chain("store-floppy").includes("store-pack"));
  assert.ok(chain("store-floppy").includes("store-3330"));
  assert.ok(chain("med-sa400").includes("store-floppy"));
});

test("the 1970s company sees power, cooling, case and network projects it can start", () => {
  const s = at("homepc");
  assert.ok(playerYear(s) >= 1977);
  for (const tab of ["power", "cooling", "cases", "network"]) {
    const open = researchRows(tab).filter((e) => techRevealed(s, e) && e.year <= 1977);
    assert.ok(open.length > 0, `${tab} has a 1970s project`);
  }
  assert.equal(researchLock(s, researchItem("pwr-ups")), null);
  assert.equal(researchLock(s, researchItem("case-s100")), null);
  assert.match(researchLock(s, researchItem("board-altair")), /S-100 cabinet/);
});

test("a project in the company's own year opens in its month", () => {
  const s = at("homepc");
  const now = 10_000_000;
  s.companyYear = { year: playerYear(s), at: now };
  const plastic = researchItem("case-plastic");
  assert.equal(plastic.year, playerYear(s));
  s.techDone = ["case-s100"];
  assert.equal(researchLock(s, plastic, now), "Opens in Jun 1977");
  assert.equal(inGameMonth(s, now).month, 1);
  assert.equal(researchLock(s, plastic, now + 5 * MONTH_MS), null);
  // A save without a record has the whole year.
  const old = at("homepc");
  old.techDone = ["case-s100"];
  noteCompanyYear(old);
  assert.equal(researchLock(old, plastic, now), null);
});

test("only one project at a time", () => {
  const s = at("supercluster");
  s.techDone = RESEARCH.map((e) => e.id).filter((id) => !["pwr-ups", "cool-crac"].includes(id));
  assert.ok(startResearch(s, "pwr-ups").ok);
  assert.equal(canStartResearch(s, "cool-crac"), false);
});

test("the first research server is cheap, and a late save stuck on punch cards gets one", () => {
  assert.ok(researchCost(researchItem("srv-mark1")) <= 2);
  const s = at("minis");
  s.facilities = { servers: { tab601: 6 } };
  assert.ok(rescuePunchCardSave(s));
  assert.ok(s.techDone.includes("srv-mark1"));
  assert.equal(s.facilities.servers.mark1, 1);
  assert.equal(s.facilities.servers.mgset, 1);
  assert.equal(s.facilities.servers.roomac, 1);
  assert.equal(rescuePunchCardSave(s), false, "only once");
  const early = at("mainframes");
  early.facilities = { servers: { tab601: 1 } };
  assert.equal(rescuePunchCardSave(early), false, "a 1950s save still builds its own");
});
