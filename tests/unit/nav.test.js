import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { blankMeta, snapshotMeta } from "../../src/lib/empire.js";
import { STARTER_GOALS } from "../../src/lib/goals.js";
import { eraChipLabel, eraChips } from "../../src/lib/eraChips.js";
import { matchesSearch, revealedHaystack, searchHaystack } from "../../src/lib/searchText.js";
import { rowFullyUpgraded, shouldCollapseRow } from "../../src/lib/rowCollapse.js";
import { nextGoal, nextGoalLabel } from "../../src/lib/nextGoal.js";
import { blankReadySeen, hqCardHasDot, markReadySeen, readyDots, readyKeys, readReadySeen, seedReadySeen, tabHasDot } from "../../src/lib/ready.js";
import { labSummary, specialtySummary } from "../../src/lib/rdSummary.js";
import { normalizePrefs } from "../../src/lib/gamePrefs.js";

function biz(owned = {}, extras = {}) {
  return BUSINESSES.map((cfg) => ({
    owned: owned[cfg.id] || 0,
    manager: !!extras.manager?.[cfg.id],
    managerOff: !!extras.managerOff?.[cfg.id],
  }));
}

function base(over = {}) {
  return {
    ...blankMeta(),
    cash: 0,
    lifetime: 0,
    investors: 0,
    upgrades: {},
    specialties: [],
    supply: {},
    facilities: { servers: { "tab601": 1 } },
    starterGranted: true,
    goalsDone: STARTER_GOALS.map((g) => g.id),
    biz: biz({ timber: 1 }),
    readySeen: { seeded: true, boost: [], research: [], tech: [], hq: [] },
    ...over,
  };
}

test("era chips: short names, unlocked eras, one trailing ???", () => {
  assert.equal(eraChipLabel(BUSINESSES.find((c) => c.id === "glass")), "Glass");
  assert.equal(eraChipLabel(BUSINESSES.find((c) => c.id === "radios")), "Radios");
  const onlyFirst = base();
  const chips = eraChips(onlyFirst);
  assert.equal(chips[0].id, "timber");
  assert.equal(chips[0].locked, false);
  assert.equal(chips[1].label, "???");
  assert.equal(chips[1].locked, true);
  assert.equal(chips.filter((c) => c.locked).length, 1);

  const two = base({
    biz: biz({ timber: 10, paper: 1 }),
    lifetime: 1e12,
    erasOpened: ["paper"],
  });
  const opened = eraChips(two).filter((c) => !c.locked).map((c) => c.id);
  assert.deepEqual(opened, ["timber", "paper"]);
  assert.equal(eraChips(two).at(-1).label, "???");
});

test("search: empty query matches all; empty haystack hides locked names", () => {
  assert.equal(matchesSearch("", "anything"), true);
  assert.equal(matchesSearch("", ""), true);
  assert.equal(matchesSearch("model m", searchHaystack(["Inland Model M", "1985"])), true);
  assert.equal(matchesSearch("model m", revealedHaystack(false, "Inland Model M")), false);
  assert.equal(matchesSearch("wootin", revealedHaystack(true, "Wootin 60HE")), true);
  assert.equal(matchesSearch("wootin", revealedHaystack(false, "Wootin 60HE")), false);
});

test("collapse: only when managed, both upgrades bought, pref on, and not expanded", () => {
  const state = base({
    biz: biz({ timber: 25 }, { manager: { timber: true } }),
    upgrades: { timber: { rev: true, spd: true } },
  });
  assert.equal(rowFullyUpgraded(state, 0), true);
  assert.equal(shouldCollapseRow(state, 0, { collapseMaxed: true }, false), true);
  assert.equal(shouldCollapseRow(state, 0, { collapseMaxed: false }, false), false);
  assert.equal(shouldCollapseRow(state, 0, { collapseMaxed: true }, true), false);
  const noMgr = base({ biz: biz({ timber: 25 }), upgrades: { timber: { rev: true, spd: true } } });
  assert.equal(rowFullyUpgraded(noMgr, 0), false);
  const half = base({
    biz: biz({ timber: 25 }, { manager: { timber: true } }),
    upgrades: { timber: { rev: true, spd: false } },
  });
  assert.equal(rowFullyUpgraded(half, 0), false);
  const off = base({
    biz: biz({ timber: 25 }, { manager: { timber: true }, managerOff: { timber: true } }),
    upgrades: { timber: { rev: true, spd: true } },
  });
  assert.equal(rowFullyUpgraded(off, 0), false);
});

test("next goal: milestone line and label", () => {
  const state = base({
    biz: biz({ timber: 20 }),
    lifetime: 100,
    facilities: { servers: { "tab601": 1 } },
  });
  const goal = nextGoal(state);
  assert.ok(goal, "has a next goal");
  assert.match(goal.text, /Timber Camp 25 for 2× speed/);
  assert.equal(goal.rowId, "timber");
  assert.equal(nextGoalLabel(goal), "Next: Timber Camp 25 for 2× speed");
});

test("ready dots: seed existing saves, then only unseen keys light up", () => {
  const state = base({
    cash: 1e15,
    biz: biz({ timber: 25 }, { manager: { timber: true } }),
    upgrades: {},
    readySeen: { seeded: false },
  });
  const keys = readyKeys(state);
  assert.ok(keys.boost.includes("timber:rev") || keys.boost.includes("timber:spd"), `boost keys ${keys.boost}`);
  assert.equal(seedReadySeen(state), true);
  assert.equal(state.readySeen.seeded, true);
  const dots = readyDots(state);
  assert.equal(dots.boost.length, 0, "seeded save is not surprised");
  assert.equal(tabHasDot(dots, "boost"), false);

  const fresh = base({
    cash: 1e15,
    biz: biz({ timber: 25 }),
    upgrades: {},
    readySeen: { seeded: true, boost: [], research: [], tech: [], hq: [] },
  });
  const lit = readyDots(fresh);
  assert.ok(tabHasDot(lit, "boost"));
  assert.equal(markReadySeen(fresh, "boost"), true);
  assert.equal(tabHasDot(readyDots(fresh), "boost"), false);
});

test("ready dots: hq is per-facility, tech keys are finished projects", () => {
  const state = base({
    techDone: ["tab-hollerith", "srv-mark1"],
    facilities: { servers: {} },
    readySeen: { seeded: true, boost: [], research: [], tech: [], hq: [] },
  });
  const keys = readyKeys(state);
  assert.ok(keys.tech.includes("tab-hollerith"));
  assert.ok(keys.tech.includes("srv-mark1"));
  assert.ok(keys.hq.some((id) => id.startsWith("servers:")), `hq keys ${keys.hq}`);
  const dots = readyDots(state);
  assert.equal(hqCardHasDot(dots, "servers"), true);
  assert.equal(markReadySeen(state, "hq", Date.now(), "servers:"), true);
  assert.equal(hqCardHasDot(readyDots(state), "servers"), false);
});

test("R&D summaries and prefs / save packing", () => {
  assert.equal(specialtySummary(base({ specialties: [] })), "1 slot open");
  assert.equal(labSummary(base({ lab: { coolUntil: 0 } })), "0 ready");
  assert.equal(labSummary(base({ lab: { coolUntil: Date.now() + 60_000 } })), "Cooling down");
  const prefs = normalizePrefs({});
  assert.equal(prefs.collapseMaxed, true);
  assert.equal(normalizePrefs({ collapseMaxed: false }).collapseMaxed, false);
  const blank = blankMeta();
  assert.equal(blank.readySeen.seeded, true);
  const shot = snapshotMeta(base({ readySeen: { seeded: true, boost: ["timber:rev"], research: [], tech: [], hq: [] } }));
  assert.deepEqual(shot.readySeen.boost, ["timber:rev"]);
});

test("readReadySeen ignores junk", () => {
  assert.deepEqual(readReadySeen(null).boost, []);
  assert.equal(readReadySeen({ seeded: 1, boost: ["ok", 2, null] }).boost[0], "ok");
  assert.deepEqual(blankReadySeen().tech, []);
});
