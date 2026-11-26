// Short arrival cards when a new era or a CPU/GPU generation first lands.
// Queued one at a time; a fast offline catch-up is collapsed to one summary.

import { AWAY_MODAL_MS, BUSINESSES, eraYear } from "./gameConfig.js";
import { ERA_YEAR } from "./eraYear.js";
import { ERA_FACTS } from "./itemInfo.js";
import { generationList } from "./generations.js";

export const ARRIVAL_CATCHUP_MS = AWAY_MODAL_MS;

function firstSentence(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  const cut = raw.match(/^.*?[.!?](?=\s|$)/);
  return (cut ? cut[0] : raw).trim();
}

export function blankArrivals() {
  return { queue: [], catchup: [], summary: null, catchingUp: false };
}

export function ensureArrivals(state) {
  if (!state.arrivals || typeof state.arrivals !== "object") state.arrivals = blankArrivals();
  if (!Array.isArray(state.arrivals.queue)) state.arrivals.queue = [];
  if (!Array.isArray(state.arrivals.catchup)) state.arrivals.catchup = [];
  if (!state.arrivals.seen || typeof state.arrivals.seen !== "object") state.arrivals.seen = {};
  return state.arrivals;
}

export function eraArrivalYear(id) {
  const cfg = BUSINESSES.find((row) => row.id === id);
  if (!cfg) return null;
  return eraYear(cfg) || ERA_YEAR[id] || null;
}

function eraHistoryLine(id, cfg) {
  if (ERA_FACTS[id]) return firstSentence(ERA_FACTS[id]);
  const gen = generationList(id)?.[0];
  if (gen) return firstSentence(gen.card?.text || gen.tagline || "");
  const era = String(cfg?.era || "");
  if (!era || /^c\./i.test(era)) return "";
  return firstSentence(era);
}

export function eraArrivalCard(id) {
  const cfg = BUSINESSES.find((row) => row.id === id);
  if (!cfg) return null;
  return {
    kind: "era",
    id: `era:${id}`,
    eraId: id,
    year: eraArrivalYear(id),
    name: cfg.name,
    text: eraHistoryLine(id, cfg),
  };
}

export function generationArrivalCard(gen, eraId) {
  if (!gen) return null;
  return {
    kind: "generation",
    id: `gen:${gen.id}`,
    eraId,
    genId: gen.id,
    year: Number.parseInt(String(gen.year), 10) || eraArrivalYear(eraId),
    name: gen.name,
    text: firstSentence(gen.card?.text || gen.tagline || ""),
  };
}

function remember(state, key) {
  const arrivals = ensureArrivals(state);
  if (arrivals.seen[key]) return false;
  arrivals.seen[key] = true;
  return true;
}

function pushCard(state, card) {
  if (!card) return false;
  const arrivals = ensureArrivals(state);
  if (!remember(state, card.id)) return false;
  if (arrivals.catchingUp) {
    arrivals.catchup.push(card);
    return true;
  }
  arrivals.queue.push(card);
  return true;
}

export function queueEraArrival(state, eraId) {
  if (eraId === "timber") return false;
  return pushCard(state, eraArrivalCard(eraId));
}

export function queueGenerationArrival(state, eraId, gen) {
  // The first generation is the row as it already stands at 1 owned, not a new landing.
  if (!gen || gen.need <= 1) return false;
  return pushCard(state, generationArrivalCard(gen, eraId));
}

export function beginArrivalCatchup(state) {
  const arrivals = ensureArrivals(state);
  arrivals.catchingUp = true;
}

export function endArrivalCatchup(state, awayMs = 0) {
  const arrivals = ensureArrivals(state);
  arrivals.catchingUp = false;
  const caught = arrivals.catchup;
  arrivals.catchup = [];
  if (!caught.length) return null;
  if (!(awayMs >= ARRIVAL_CATCHUP_MS) && caught.length === 1) {
    arrivals.queue.push(caught[0]);
    return caught[0];
  }
  const summary = {
    kind: "summary",
    id: `summary:${caught.map((c) => c.id).join(",")}`,
    year: null,
    name: caught.length === 1 ? caught[0].name : `${caught.length} arrivals`,
    text: caught.length === 1
      ? caught[0].text
      : `While you were away: ${caught.map((c) => c.name).join(", ")}.`,
    items: caught,
  };
  arrivals.summary = summary;
  return summary;
}

export function currentArrival(state) {
  const arrivals = ensureArrivals(state);
  if (arrivals.summary) return arrivals.summary;
  return arrivals.queue[0] || null;
}

export function dismissArrival(state) {
  const arrivals = ensureArrivals(state);
  if (arrivals.summary) {
    arrivals.summary = null;
    return currentArrival(state);
  }
  if (arrivals.queue.length) arrivals.queue.shift();
  return currentArrival(state);
}

export function shouldSting(prefs, reducedMotion) {
  if (reducedMotion) return false;
  if (!prefs) return true;
  if (prefs.sound === false || prefs.effectsMuted) return false;
  return true;
}
