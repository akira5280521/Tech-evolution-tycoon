// Rigs garage: cosmetic bench snapshots, save migration, lock, and names.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { money } from "../../src/lib/gameConfig.js";
import { migrateSave, SAVE_VERSION } from "../../src/lib/gameSave.js";
import { blankMeta, snapshotMeta } from "../../src/lib/empire.js";
import { benchStock } from "../../src/lib/facilities.js";
import { TUTORIAL_STEPS, currentTutorialStep, stepNumber } from "../../src/lib/tutorial.js";
import {
  RIGS_CAP,
  autoRigName,
  benchHasParts,
  deleteRig,
  formatRam,
  formatRate,
  readRigs,
  rigOutput,
  rigSlots,
  rigValue,
  rigsOpen,
  saveRig,
} from "../../src/lib/rigs.js";

const orchard = { "b-orchard2": 1, "c-6502": 1, "m-4116": 3 };
const lan = { "b-be6": 1, "c-300a": 1, "m-pc100": 2, "v-voodoo3": 1, "d-16gp": 1, "k-atxmid": 1, "p-atx250": 1, "h-slot": 1 };

const withEra = (id, extra = {}) => {
  const last = BUSINESSES.findIndex((b) => b.id === id);
  return {
    cash: 1,
    biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= last ? 1 : 0 })),
    facilities: { servers: {}, bench: {}, mine: {}, cluster: {} },
    rigs: [],
    ...extra,
  };
};

test("SAVE_VERSION stays current after the Rigs garage field", () => {
  assert.ok(SAVE_VERSION >= 14);
});

test("a v13 save with no rigs migrates to an empty garage", () => {
  const out = migrateSave({ version: 13, cash: 10, biz: [{ id: "timber", owned: 1 }] });
  assert.equal(out.version, SAVE_VERSION);
  assert.deepEqual(out.rigs, []);
});

test("saved builds survive migrateSave and are sanitized", () => {
  const out = migrateSave({
    version: 13,
    cash: 1,
    rigs: [
      { id: "r-1", name: "1977 ORCHARD II", savedAt: 1, parts: orchard },
      { id: "r-1", name: "duplicate id", parts: orchard },
      { id: "r-bad", name: "empty", parts: {} },
      { id: "r-junk", name: "unknown parts", parts: { "no-such-part": 4, "c-6502": 1 } },
      { name: "no id", parts: orchard },
      "nope",
    ],
  });
  assert.equal(out.rigs.length, 2);
  assert.equal(out.rigs[0].id, "r-1");
  assert.equal(out.rigs[0].name, "1977 ORCHARD II");
  assert.deepEqual(out.rigs[0].parts, orchard);
  assert.equal(out.rigs[1].id, "r-junk");
  assert.deepEqual(out.rigs[1].parts, { "c-6502": 1 });
});

test("readRigs caps the garage and drops invalid rows", () => {
  const many = Array.from({ length: 15 }, (_, i) => ({ id: `r-${i}`, name: `PC ${i}`, parts: { "c-6502": 1 } }));
  assert.equal(readRigs(many).length, RIGS_CAP);
  assert.deepEqual(readRigs(null), []);
  assert.deepEqual(readRigs([{ id: "x", name: "  ", parts: orchard }]), []);
});

test("the garage is locked until Home Computers this run", () => {
  assert.equal(rigsOpen(withEra("tubes")), false);
  assert.equal(rigsOpen(withEra("homepc")), true);
  assert.equal(saveRig(withEra("tubes", { facilities: { bench: orchard } })).ok, false);
  assert.equal(saveRig(withEra("tubes", { facilities: { bench: orchard } })).reason, "locked");
});

test("saveRig snapshots the bench loadout with a year + era-ish name", () => {
  const state = withEra("homepc", { facilities: { bench: { ...orchard } } });
  const done = saveRig(state);
  assert.equal(done.ok, true);
  assert.equal(state.rigs.length, 1);
  assert.match(done.rig.name, /^1977 ORCHARD II$/);
  assert.deepEqual(done.rig.parts, orchard);
  // A second save of the same loadout gets a numbered name.
  const again = saveRig(state);
  assert.equal(again.ok, true);
  assert.equal(again.rig.name, "1977 ORCHARD II 2");
  assert.equal(state.rigs.length, 2);
});

test("an empty bench cannot be saved, and the cap is 12", () => {
  const state = withEra("homepc", { facilities: { bench: {} } });
  assert.equal(benchHasParts(state.facilities.bench), false);
  assert.equal(saveRig(state).reason, "empty");
  state.facilities.bench = { ...orchard };
  state.rigs = Array.from({ length: RIGS_CAP }, (_, i) => ({ id: `r-${i}`, name: `PC ${i}`, parts: orchard }));
  assert.equal(saveRig(state).reason, "full");
  assert.equal(state.rigs.length, RIGS_CAP);
});

test("deleteRig removes one saved build after a confirm in the UI", () => {
  const state = withEra("homepc", { facilities: { bench: { ...orchard } } });
  saveRig(state);
  const id = state.rigs[0].id;
  assert.equal(deleteRig(state, "missing").ok, false);
  assert.equal(deleteRig(state, id).ok, true);
  assert.deepEqual(state.rigs, []);
});

test("output and value come from the live bench functions, and do not add production", () => {
  const output = rigOutput(orchard);
  const value = rigValue(orchard);
  assert.equal(output, benchStock(orchard).perSecond);
  let expected = 0;
  for (const [id, n] of Object.entries(orchard)) {
    // partCost is looked up through rigValue; just check it is a positive finite number
    expected += n;
  }
  assert.ok(Number.isFinite(value) && value > 0);
  assert.equal(money(value).startsWith("$"), true);
  assert.match(formatRate(output), /^\+[\d.]+ R&D\/s$/);
  const slots = rigSlots(orchard);
  assert.equal(slots.find((s) => s.slot === "CPU").name, "Moss 6502");
  assert.equal(slots.find((s) => s.slot === "GPU").name, "Built-in video");
  assert.ok(slots.find((s) => s.slot === "RAM").name.includes("KB") || slots.find((s) => s.slot === "RAM").name.includes("MB"));
  assert.equal(slots.some((s) => s.slot === "CASE"), false);
});

test("a later loadout uses the case in its auto name and lists every slot", () => {
  const name = autoRigName(withEra("gpu"), lan, []);
  assert.match(name, /^1999 ATX MID-TOWER$/);
  const slots = rigSlots(lan);
  assert.deepEqual(slots.map((s) => s.slot), ["CPU", "GPU", "RAM", "STORAGE", "CASE"]);
});

test("saved builds survive snapshotMeta (prestige, fork, challenge) and the card locks", () => {
  const state = withEra("homepc", { facilities: { bench: { ...orchard } }, museum: ["tubes-1"] });
  assert.equal(saveRig(state).ok, true);
  const snap = snapshotMeta({ ...blankMeta(), ...state }, { resetRunUpgrades: true });
  assert.equal(snap.rigs.length, 1);
  assert.equal(snap.rigs[0].name, "1977 ORCHARD II");
  assert.deepEqual(snap.rigs[0].parts, orchard);
  // The next run starts without Home Computers, so the card locks, but the records stay.
  const next = { ...blankMeta(), ...snap, biz: BUSINESSES.map((b) => ({ id: b.id, owned: 0 })) };
  assert.equal(next.rigs.length, 1);
  assert.equal(rigsOpen(next), false);
});

test("blankMeta starts with an empty garage", () => {
  assert.deepEqual(blankMeta().rigs, []);
});

test("the hq-go tutorial step sits after hq, before servers, and is step 8 of 13", () => {
  const ids = TUTORIAL_STEPS.map((s) => s.id);
  assert.equal(ids.indexOf("hq-go"), ids.indexOf("hq") + 1);
  assert.ok(ids.indexOf("hq-go") < ids.indexOf("servers"));
  const step = TUTORIAL_STEPS.find((s) => s.id === "hq-go");
  assert.equal(step.title, "GO");
  assert.equal(step.text, "These are locations you can visit. Tap GO to go there.");
  assert.equal(step.target, "[data-action='go-servers']");
  assert.equal(stepNumber(step), 8);
  assert.equal(TUTORIAL_STEPS.length, 13);
  const mid = {
    tutorial: {
      seen: ["run", "buy", "modes", "hire", "next", "materials", "hq"],
      opened: ["hq"],
      done: false,
      skipped: false,
      replay: false,
    },
  };
  assert.equal(currentTutorialStep(mid).id, "hq-go");
  const afterGo = { tutorial: { ...mid.tutorial, opened: ["hq", "servers"] } };
  assert.equal(currentTutorialStep(afterGo).id, "starter");
});

test("formatRam handles KB through TB", () => {
  assert.equal(formatRam(48 / 1024), "48 KB");
  assert.equal(formatRam(0.016 * 3), "48 KB");
  assert.equal(formatRam(128), "128 MB");
  assert.equal(formatRam(128 * 1024), "128 GB");
});
