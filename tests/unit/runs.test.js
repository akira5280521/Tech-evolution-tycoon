// Run records, career totals, and the managers-hired count.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  closedRunEarnings,
  ensureRunStartedAt,
  formatDuration,
  longestRun,
  pushRun,
  readRuns,
  runLengthMs,
  settleCareerEarnings,
  settleRunRecords,
} from "../../src/lib/records.js";
import { creditAmount, countManagers, ensureManagersHired, failChallenge } from "../../src/lib/empire.js";

const now = Date.parse("2026-11-21T19:00:00Z");

test("a close with no start time stores unknown length, then starts the next clock", () => {
  const s = { lifetime: 453.6e6, biz: [], runs: [], runStartedAt: 0, bestEra: 0 };
  pushRun(s, { investorsGained: 0 }, now);
  assert.equal(s.runs[0].earnings, 453.6e6);
  assert.equal(s.runs[0].lengthMs, null);
  assert.equal(s.runStartedAt, now);
  assert.equal(formatDuration(s.runs[0].lengthMs), "unknown");
});

test("a close with a tracked start stores the real length", () => {
  const s = { lifetime: 1e9, biz: [], runs: [], runStartedAt: now - 2 * 3600e3, bestEra: 0 };
  pushRun(s, { investorsGained: 5 }, now);
  assert.equal(s.runs[0].lengthMs, 2 * 3600e3);
  assert.equal(formatDuration(s.runs[0].lengthMs), "2h 0m");
  assert.equal(s.runs[0].investorsGained, 5);
  assert.equal(s.runStartedAt, now);
});

test("a challenge start clock can stand in when runStartedAt was never set", () => {
  const s = { runStartedAt: 0, challenge: { id: "noboss", startedAt: now - 90_000 } };
  assert.equal(runLengthMs(s, now), 90_000);
  assert.equal(ensureRunStartedAt(s, now), true);
  assert.equal(s.runStartedAt, now - 90_000);
  assert.equal(ensureRunStartedAt(s, now), false);
});

test("old 0s run lengths are marked unknown, and Longest skips them when a known length exists", () => {
  const s = {
    runs: [
      { earnings: 453.6e6, lengthMs: 0, eraName: "Vacuum Tubes", eraId: "tubes", investorsGained: 0, at: now },
      { earnings: 100, lengthMs: 60_000, eraName: "Timber Camp", eraId: "timber", investorsGained: 0, at: now },
    ],
  };
  assert.equal(settleRunRecords(s), true);
  assert.equal(s.runs[0].lengthMs, null);
  assert.equal(s.runs[1].lengthMs, 60_000);
  assert.equal(longestRun(s.runs).eraName, "Timber Camp");
  assert.equal(formatDuration(longestRun(s.runs).lengthMs), "1m");
  const only = [{ earnings: 453.6e6, lengthMs: null, eraName: "Vacuum Tubes" }];
  assert.equal(longestRun(only).eraName, "Vacuum Tubes");
  assert.equal(formatDuration(longestRun(only).lengthMs), "unknown");
});

test("readRuns keeps an unknown length instead of turning it into 0s", () => {
  const rows = readRuns([{ earnings: 10, lengthMs: null, eraId: "tubes", eraName: "Vacuum Tubes", investorsGained: 0, at: now }]);
  assert.equal(rows[0].lengthMs, null);
  assert.equal(formatDuration(-1), "unknown");
  assert.equal(formatDuration(0), "0s");
});

test("career earnings are raised to this run plus closed runs, never lowered", () => {
  // The tester: $1.14B career vs $749.63M this run + $453.60M finished.
  const s = {
    lifetime: 749_630_000,
    careerEarnings: 1_140_000_000,
    runs: [{ earnings: 453_600_000, lengthMs: 0, eraName: "Vacuum Tubes", investorsGained: 0 }],
  };
  assert.equal(settleCareerEarnings(s), true);
  assert.equal(s.careerEarnings, 749_630_000 + 453_600_000);
  assert.equal(settleCareerEarnings(s), false);
  s.careerEarnings = 2e9;
  assert.equal(settleCareerEarnings(s), false);
  assert.equal(s.careerEarnings, 2e9);
});

test("a challenge-complete row that overlapped the current run is not added twice", () => {
  const s = {
    lifetime: 1000,
    careerEarnings: 1000,
    runs: [
      { earnings: 400, lengthMs: 1000, eraName: "Vacuum Tubes" },
      { earnings: 600, lengthMs: 1000, eraName: "Vacuum Tubes", challenge: "No Bosses" },
    ],
  };
  assert.equal(closedRunEarnings(s), 400);
  assert.equal(settleCareerEarnings(s), true);
  assert.equal(s.careerEarnings, 1400);
});

test("finishing a challenge keeps this run going and does not log a finished run", () => {
  const s = {
    cash: 0,
    lifetime: 100,
    careerEarnings: 100,
    runStartedAt: now - 60_000,
    runs: [],
    challengesDone: [],
    grants: [],
    tokens: 0,
    challenge: { id: "noboss", startedAt: now - 60_000, earnings: 0, goal: 50 },
    biz: [],
  };
  creditAmount(s, 50, now);
  assert.equal(s.challenge, null);
  assert.deepEqual(s.challengesDone, ["noboss"]);
  assert.equal(s.tokens, 12);
  assert.equal(s.runs.length, 0);
  assert.equal(s.lifetime, 150);
  assert.equal(s.careerEarnings, 150);
  assert.equal(s.runStartedAt, now - 60_000);
});

test("abandoning a challenge also leaves the run open, with no finished run", () => {
  const s = { challenge: { id: "speed", startedAt: now, earnings: 10, goal: 1e12 }, runs: [] };
  assert.equal(failChallenge(s), true);
  assert.equal(s.challenge, null);
  assert.equal(s.runs.length, 0);
});

test("Managers hired is raised to the number currently hired, and never lowered", () => {
  const s = { managersHired: 1, biz: [{ manager: true }, { manager: true }, { manager: false }, { manager: true }] };
  assert.equal(countManagers(s), 3);
  assert.equal(ensureManagersHired(s), true);
  assert.equal(s.managersHired, 3);
  assert.equal(ensureManagersHired(s), false);
  s.managersHired = 10;
  assert.equal(ensureManagersHired(s), false);
  assert.equal(s.managersHired, 10);
  const empty = { managersHired: null, biz: [] };
  assert.equal(ensureManagersHired(empty), true);
  assert.equal(empty.managersHired, 0);
});
