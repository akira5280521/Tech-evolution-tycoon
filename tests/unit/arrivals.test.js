import { test } from "node:test";
import assert from "node:assert/strict";
import { generationAt } from "../../src/lib/generations.js";
import {
  beginArrivalCatchup,
  currentArrival,
  dismissArrival,
  endArrivalCatchup,
  eraArrivalCard,
  queueEraArrival,
  queueGenerationArrival,
  shouldSting,
} from "../../src/lib/arrivals.js";
import { freshState } from "../../src/lib/playState.js";
import { SIM_START } from "../../src/lib/paceSim.js";

test("an era card has the year, parody name, and a real history line", () => {
  const card = eraArrivalCard("tubes");
  assert.equal(card.year, 1946);
  assert.equal(card.name, "Vacuum Tubes");
  assert.match(card.text, /vacuum tube/i);
  assert.ok(card.text.length < 220);
});

test("the starting timber camp is not queued", () => {
  const s = freshState(SIM_START);
  assert.equal(queueEraArrival(s, "timber"), false);
  assert.equal(currentArrival(s), null);
});

test("era and generation arrivals queue, then dismiss in order", () => {
  const s = freshState(SIM_START);
  assert.equal(queueEraArrival(s, "cpu"), true);
  const gen = generationAt("cpu", 25);
  assert.ok(gen && gen.id === "cpu-8080");
  assert.equal(queueGenerationArrival(s, "cpu", gen), true);
  const first = currentArrival(s);
  assert.equal(first.kind, "era");
  assert.equal(first.name, "Microprocessors");
  assert.match(first.text, /chip|processor|4004/i);
  dismissArrival(s);
  const second = currentArrival(s);
  assert.equal(second.kind, "generation");
  assert.equal(second.name, "Chipwright 8080");
  assert.match(second.name, /8080/);
  assert.match(second.text, /1974|8-bit/i);
  dismissArrival(s);
  assert.equal(currentArrival(s), null);
});

test("the first generation is the row as it stands, so it is not an arrival", () => {
  const s = freshState(SIM_START);
  const first = generationAt("cpu", 1);
  assert.equal(queueGenerationArrival(s, "cpu", first), false);
});

test("a fast offline catch-up becomes one summary instead of a stack of cards", () => {
  const s = freshState(SIM_START);
  beginArrivalCatchup(s);
  queueEraArrival(s, "homepc");
  queueEraArrival(s, "gpu");
  assert.equal(currentArrival(s), null);
  endArrivalCatchup(s, 60 * 60 * 1000);
  const card = currentArrival(s);
  assert.equal(card.kind, "summary");
  assert.match(card.text, /Home Computers/);
  assert.match(card.text, /Graphics Cards/);
  dismissArrival(s);
  assert.equal(currentArrival(s), null);
});

test("the same era is only announced once", () => {
  const s = freshState(SIM_START);
  assert.equal(queueEraArrival(s, "relay"), true);
  assert.equal(queueEraArrival(s, "relay"), false);
  assert.equal(currentArrival(s).name, "Relay Computers");
});

test("the sting respects sound settings and reduced motion", () => {
  assert.equal(shouldSting({ sound: true, effectsMuted: false }, false), true);
  assert.equal(shouldSting({ sound: false, effectsMuted: false }, false), false);
  assert.equal(shouldSting({ sound: true, effectsMuted: true }, false), false);
  assert.equal(shouldSting({ sound: true, effectsMuted: false }, true), false);
});
