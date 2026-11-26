import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES, costOf, maxAffordable, MOORE_MULT } from "../../src/lib/gameConfig.js";
import { CABLE_NEED, MAINFRAME_NEED, PROJECTS, creditCycles, describeEffects, replayAway } from "../../src/lib/empire.js";
import { freshState, payoutContract } from "../../src/lib/playState.js";
import { acceptContract, failContract, offerNextContract, readContract, skipContract, tickContracts, noteContractProgress, CONTRACTS } from "../../src/lib/contracts.js";
import { MOORE_ID, MOTH_ID, deferStoryEvent, resolveStoryEvent, tickStoryEvents, storyEventSpec } from "../../src/lib/storyEvents.js";
import { migrateSave, SAVE_VERSION } from "../../src/lib/gameSave.js";
import { SIM_START } from "../../src/lib/paceSim.js";

function own(state, id, n = 1) {
  const i = BUSINESSES.findIndex((cfg) => cfg.id === id);
  state.biz[i].owned = n;
  return i;
}

test("SAVE_VERSION is 17 (research queue from 17, contracts and story events from 15)", () => {
  assert.equal(SAVE_VERSION, 17);
  const out = migrateSave({ version: 14, cash: 10, biz: [{ id: "timber", owned: 1 }] });
  assert.equal(out.version, 17);
});

test("the census office is offered after Punch Cards, and only one contract runs at a time", () => {
  const now = SIM_START;
  const s = freshState(now);
  assert.equal(offerNextContract(s, now), false);
  own(s, "punchcards", 10);
  own(s, "relay", 10);
  assert.equal(tickContracts(s, now).length, 0);
  const live = readContract(s.contract);
  assert.equal(live.id, "census");
  assert.equal(live.status, "offered");
  assert.equal(offerNextContract(s, now), false);
});

test("accepting a contract tracks progress, and away catch-up does not count", () => {
  const now = SIM_START;
  const s = freshState(now);
  const i = own(s, "punchcards", 10);
  offerNextContract(s, now);
  assert.equal(acceptContract(s, now), true);
  assert.equal(s.contract.status, "active");
  noteContractProgress(s, i, 5, 10);
  assert.equal(s.contract.progress, 50);
  s.awayReplay = true;
  noteContractProgress(s, i, 5, 10);
  assert.equal(s.contract.progress, 50);
  s.awayReplay = false;
  creditCycles(s, i, 2, now, 1);
  assert.equal(s.contract.progress, 70);
});

test("replayAway with alsoManual still counts contract progress; a true away does not", () => {
  const now = SIM_START + 60_000;
  const s = freshState(now);
  const i = own(s, "punchcards", 20);
  s.biz[i].manager = true;
  s.biz[i].progress = 0;
  offerNextContract(s, now - 1000);
  acceptContract(s, now - 1000);
  replayAway(s, 20_000, now, 1, { alsoManual: true, slices: 12 });
  assert.ok(s.contract.progress > 0, "active session should count");
  const mid = s.contract.progress;
  replayAway(s, 20_000, now + 20_000, 1, { slices: 12 });
  assert.equal(s.contract.progress, mid, "true away should pause");
});

test("fail and skip lose nothing and the contract comes back later", () => {
  const now = SIM_START;
  const s = freshState(now);
  own(s, "punchcards", 10);
  offerNextContract(s, now);
  const tokens = s.tokens;
  const cash = s.cash;
  skipContract(s, now);
  assert.equal(s.contract, null);
  assert.equal(s.tokens, tokens);
  assert.equal(s.cash, cash);
  assert.equal(offerNextContract(s, now + 60_000), false);
  assert.equal(offerNextContract(s, now + 10 * 60 * 1000), true);
  acceptContract(s, now + 10 * 60 * 1000);
  failContract(s, now + 10 * 60 * 1000);
  assert.equal((s.contractsDone || []).length, 0);
  assert.equal(s.tokens, tokens);
});

test("tickContracts reports done once the need is met", () => {
  const now = SIM_START;
  const s = freshState(now);
  const i = own(s, "punchcards", 20);
  offerNextContract(s, now);
  acceptContract(s, now);
  noteContractProgress(s, i, 20, 20);
  const notes = tickContracts(s, now + 1000);
  assert.equal(notes[0]?.type, "contract-done");
  assert.equal(notes[0]?.id, "census");
});

test("a missed deadline fails the contract and offers it again later", () => {
  const now = SIM_START;
  const s = freshState(now);
  own(s, "punchcards", 10);
  offerNextContract(s, now);
  acceptContract(s, now);
  const notes = tickContracts(s, now + 11 * 60 * 1000);
  assert.equal(notes[0]?.type, "contract-fail");
  assert.equal(s.contract, null);
  assert.equal(offerNextContract(s, now + 11 * 60 * 1000), false);
  assert.equal(offerNextContract(s, now + 16 * 60 * 1000), true);
});

test("the 1947 moth is a once-a-game story event in the relay window", () => {
  const now = SIM_START;
  const s = freshState(now);
  assert.equal(tickStoryEvents(s, now), null);
  own(s, "relay", 1);
  const spec = tickStoryEvents(s, now);
  assert.equal(spec.id, MOTH_ID);
  assert.equal(s.storyEvent.id, MOTH_ID);
  assert.equal((s.eventsDone || []).includes(MOTH_ID), false);
  deferStoryEvent(s, now);
  assert.equal(s.storyEvent, null);
  assert.equal(tickStoryEvents(s, now + 1000), null);
  const again = tickStoryEvents(s, now + 5 * 60 * 1000);
  assert.equal(again.id, MOTH_ID);
  const result = resolveStoryEvent(s, "a", now + 5 * 60 * 1000);
  assert.equal(result.type, "choice");
  assert.equal(result.effects.data, 4);
  assert.ok(s.eventsDone.includes(MOTH_ID));
  s.storyEvent = null;
  assert.equal(tickStoryEvents(s, now + 10 * 60 * 1000), null);
});

test("Moore's Law is a 15% discount on eras dated 1965 or later", () => {
  const now = SIM_START;
  const s = freshState(now);
  own(s, "ics", 1);
  const spec = tickStoryEvents(s, now);
  assert.equal(spec.id, MOORE_ID);
  const accepted = resolveStoryEvent(s, "a", now);
  assert.equal(accepted.effects.moore, true);
  assert.ok(s.eventsDone.includes(MOORE_ID));
  const cpu = BUSINESSES.find((cfg) => cfg.id === "cpu");
  const timber = BUSINESSES.find((cfg) => cfg.id === "timber");
  const ics = BUSINESSES.find((cfg) => cfg.id === "ics");
  const baseCpu = costOf(cpu, 0, 1);
  const cheapCpu = costOf(cpu, 0, 1, s);
  assert.ok(Math.abs(cheapCpu - baseCpu * MOORE_MULT) < 1e-6);
  assert.equal(costOf(timber, 0, 1, s), costOf(timber, 0, 1));
  assert.ok(Math.abs(costOf(ics, 0, 1, s) - costOf(ics, 0, 1) * MOORE_MULT) < 1e-6);
  assert.ok(maxAffordable(cpu, 0, baseCpu, s) >= 1);
  assert.match(describeEffects({ moore: true }), /15%/);
  assert.ok(storyEventSpec(MOORE_ID).text.includes("15%"));
});

test("mega-projects are in historical order and the cable is first and cheapest", () => {
  assert.deepEqual(PROJECTS.map((row) => row.id), [
    "cable", "mainframe", "arpanet", "apollo", "homebrew", "y2k", "lan", "orbital", "timeline",
  ]);
  assert.equal(CABLE_NEED, 5e6);
  assert.equal(MAINFRAME_NEED, 1e8);
  assert.equal(PROJECTS[0].check({ careerEarnings: 4.9e6 }), false);
  assert.equal(PROJECTS[0].check({ careerEarnings: 5e6 }), true);
  assert.equal(PROJECTS[1].check({ careerEarnings: 9.9e7 }), false);
  assert.equal(PROJECTS[1].check({ careerEarnings: 1e8 }), true);
  assert.ok(CABLE_NEED < MAINFRAME_NEED);
  assert.match(PROJECTS[0].blurb, /\$5\.00M/);
  assert.ok(CONTRACTS.map((row) => row.id).join() === "census,codebreak,ballistics");
});

test("a finished contract pays tokens and is not offered again", () => {
  const now = SIM_START;
  const s = freshState(now);
  const i = own(s, "punchcards", 20);
  const tokens = s.tokens || 0;
  offerNextContract(s, now);
  acceptContract(s, now);
  noteContractProgress(s, i, 20, 20);
  const notes = tickContracts(s, now + 1000);
  assert.equal(notes[0]?.type, "contract-done");
  const spec = payoutContract(s, now + 1000);
  assert.equal(spec.id, "census");
  assert.equal(s.tokens, tokens + 2);
  assert.ok(s.contractsDone.includes("census"));
  assert.equal(s.contract, null);
  assert.equal(offerNextContract(s, now + 1000), false);
});
