// Starter goals, the company name, and historical contracts.
//
// Pure data and helpers only (no imports from empire.js), so empire.js can
// record contract progress from inside creditCycles without a circular import.
// Rewards are fixed and shown up front. Nothing here is left to chance.

import { BUSINESSES } from "./gameConfig.js";

const indexOf = (id) => BUSINESSES.findIndex((cfg) => cfg.id === id);
const ownedOf = (state, id) => state?.biz?.[indexOf(id)]?.owned || 0;

// ---- Company name ---------------------------------------------------------

export const COMPANY_NAME_MAX = 24;

// Letters (any language), digits, spaces and a few marks. Anything else is
// dropped, runs of spaces collapse, and the length is capped.
export function cleanCompanyName(raw) {
  if (typeof raw !== "string") return "";
  const kept = raw.normalize("NFC").replace(/[^\p{L}\p{N} &.,'\-!]/gu, "").replace(/\s+/g, " ").trim();
  return Array.from(kept).slice(0, COMPANY_NAME_MAX).join("").trim();
}

// ---- Starter goals --------------------------------------------------------

// A short first-session checklist. Each goal pays a fixed number of era
// tokens once, the moment it's met. The list is kept through prestige.
export const STARTER_GOALS = [
  { id: "camps5", label: "Buy 5 Timber Camps", tokens: 1, done: (s) => ownedOf(s, "timber") >= 5 },
  { id: "manager", label: "Hire your first manager", tokens: 2, done: (s) => (s.biz || []).some((b) => b?.manager) },
  { id: "paper", label: "Open the Paper Mill", tokens: 2, done: (s) => ownedOf(s, "paper") >= 1 },
  { id: "upgrade", label: "Install your first upgrade", tokens: 2, done: (s) => Object.values(s.upgrades || {}).some((u) => u?.rev || u?.spd) },
  { id: "loom", label: "Reach the Jacquard Loom era", tokens: 3, done: (s) => ownedOf(s, "loom") >= 1 },
];

export const STARTER_GOAL_TOKENS = STARTER_GOALS.reduce((sum, g) => sum + g.tokens, 0);

export function starterGoalsDone(state) {
  return Array.isArray(state?.goalsDone) ? state.goalsDone : [];
}

export function starterGoalsFinished(state) {
  const done = starterGoalsDone(state);
  return STARTER_GOALS.every((g) => done.includes(g.id));
}

// ---- Historical contracts -------------------------------------------------

// Real kinds of customers place a fixed order: make this many units of one
// business before the deadline. They come in a set order, one at a time, as
// the player reaches each era; never at random. A unit is one item from one
// business per batch (owned x batches), so buying more of that business and
// its speed-ups is how you hit the number. A missed contract costs nothing
// and the client asks again later.
export const CONTRACTS = [
  {
    id: "lyon",
    unit: "woven patterns",
    year: "1805",
    row: "loom",
    client: "Silk weavers of Lyon",
    text: "The silk weavers of Lyon want card-driven patterns for a new season of brocade.",
    units: 2500,
    minutes: 8,
    tokens: 3,
    data: 10,
    fact: "Lyon's weavers first fought the card-reading loom, then adopted it by the thousand.",
  },
  {
    id: "telegraph",
    unit: "spools of copper wire",
    year: "1861",
    row: "copper",
    client: "Transcontinental telegraph company",
    text: "A telegraph company is stringing wire coast to coast and needs copper fast.",
    units: 4000,
    minutes: 8,
    tokens: 3,
    data: 10,
    fact: "The first transcontinental telegraph line across the United States opened in October 1861.",
  },
  {
    id: "lighting",
    unit: "lamp filaments",
    year: "1882",
    row: "filament",
    client: "City electric lighting company",
    text: "The first city power station is wiring up streets of electric lamps.",
    units: 3000,
    minutes: 8,
    tokens: 3,
    data: 15,
    fact: "Pearl Street Station in New York began supplying electric light in 1882.",
  },
  {
    id: "census",
    unit: "punch cards",
    year: "1890",
    row: "punchcards",
    client: "Census office",
    text: "The census office wants punched cards to count the whole country by machine.",
    units: 6000,
    minutes: 10,
    tokens: 4,
    data: 15,
    fact: "Punched cards and tabulating machines counted the 1890 US census in a fraction of the time of the last one.",
  },
  {
    id: "codebreakers",
    unit: "vacuum tubes",
    year: "1944",
    row: "tubes",
    client: "Code-breaking office",
    text: "Code-breakers are building an electronic machine to crack enemy teleprinter traffic.",
    units: 2400,
    minutes: 8,
    tokens: 4,
    data: 20,
    fact: "The Colossus Mark 2 code-breaking computer of 1944 used about 2,400 vacuum tubes.",
  },
  {
    id: "ballistics",
    unit: "vacuum tubes",
    year: "1946",
    row: "tubes",
    client: "Army ballistics lab",
    text: "A ballistics lab wants a room-sized computer to work out firing tables.",
    units: 17500,
    minutes: 12,
    tokens: 5,
    data: 25,
    fact: "ENIAC, unveiled in 1946 to compute firing tables, held about 17,500 vacuum tubes.",
  },
  {
    id: "hearing",
    unit: "transistors",
    year: "1953",
    row: "transistors",
    client: "Hearing-aid maker",
    text: "A hearing-aid maker wants tiny transistors to replace hot, power-hungry tubes.",
    units: 3000,
    minutes: 10,
    tokens: 5,
    data: 25,
    fact: "Hearing aids were among the very first products sold with transistors, in the early 1950s.",
  },
];

// A row needs this many owned before its contract is offered.
export const CONTRACT_MIN_OWNED = 10;
// "Later" or a missed deadline: the same client asks again after this long.
export const CONTRACT_RETRY_MS = 10 * 60 * 1000;
// An offer that isn't answered waits; it never expires on its own.

export function contractSpec(id) {
  return CONTRACTS.find((c) => c.id === id) || null;
}

export function contractsDone(state) {
  return Array.isArray(state?.contractsDone) ? state.contractsDone : [];
}

// The next contract the player can be offered: the first unfinished one, in
// order, whose business they own enough of. Offers wait between retries.
export function contractOffer(state, now) {
  if (!state || state.contract || state.challenge) return null;
  if ((state.contractOfferAt || 0) > now) return null;
  const done = contractsDone(state);
  for (const spec of CONTRACTS) {
    if (done.includes(spec.id)) continue;
    if (ownedOf(state, spec.row) >= CONTRACT_MIN_OWNED) return spec;
  }
  return null;
}

// Called from creditCycles with the units a row just made.
export function recordContractUnits(state, rowId, units) {
  const c = state?.contract;
  if (!c || c.row !== rowId || !(units > 0) || !Number.isFinite(units)) return;
  c.made = (c.made || 0) + units;
}

export function acceptContract(state, now) {
  const spec = contractOffer(state, now);
  if (!spec) return null;
  state.contract = { id: spec.id, row: spec.row, startedAt: now, endsAt: now + spec.minutes * 60000, made: 0 };
  return spec;
}

export function snoozeContract(state, now) {
  state.contractOfferAt = now + CONTRACT_RETRY_MS;
}

// Clean an active contract read from a save. A deadline can't run longer than
// the contract allows (bad clock or edited code).
export function cleanContract(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object") return null;
  const spec = contractSpec(raw.id);
  if (!spec) return null;
  const startedAt = Number(raw.startedAt);
  const endsAt = Number(raw.endsAt);
  if (!Number.isFinite(startedAt) || !Number.isFinite(endsAt)) return null;
  const limit = spec.minutes * 60000;
  const end = Math.min(endsAt, startedAt + limit, now + limit);
  const made = Number(raw.made);
  return { id: spec.id, row: spec.row, startedAt, endsAt: end, made: Number.isFinite(made) && made > 0 ? Math.min(made, spec.units) : 0 };
}

// ---- Breakthroughs ----------------------------------------------------------

// Moore's Law (1965): bought once on the Research tab, kept forever. Every era
// after Integrated Circuits costs this much less.
export const MOORE = { cost: 150, discount: 0.9, needs: "ics", from: "cpu" };

export function mooreApplies(state, index) {
  return !!state?.lab?.moore && index >= indexOf(MOORE.from);
}

// The row config with any price cut applied; use wherever a price is shown or
// charged.
export function pricedRow(state, index) {
  const cfg = BUSINESSES[index];
  if (!cfg || !mooreApplies(state, index)) return cfg;
  return { ...cfg, baseCost: cfg.baseCost * MOORE.discount };
}
