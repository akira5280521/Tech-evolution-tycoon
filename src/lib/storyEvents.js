// One-time early-era story events, step 1: the 1947 moth, and Moore's Law
// as a cheaper-eras upgrade. These have no 45-second timer; they wait
// until the player chooses or defers.

import { BUSINESSES, MOORE_ID, MOORE_MULT, MOORE_YEAR } from "./gameConfig.js";

export { MOORE_ID, MOORE_MULT, MOORE_YEAR };
export const MOTH_ID = "moth";

export const STORY_EVENTS = [
  {
    id: MOTH_ID,
    title: "THE FIRST BUG",
    year: 1947,
    text: "A moth is stuck in a Relay Mark II. The operators have taped it into the logbook: the first real computer bug.",
    eraFrom: "relay",
    eraTo: "mainframes",
    choices: [
      { key: "a", label: "PIN IT IN THE LOGBOOK", effects: { data: 4 } },
      { key: "b", label: "CLEAR THE RELAY AND KEEP GOING", effects: { boost: 5 } },
    ],
  },
  {
    id: MOORE_ID,
    title: "MOORE'S LAW",
    year: 1965,
    text: "In 1965 Gordon Moore predicted the number of parts on a chip would keep doubling. Research it, and each newer era will be 15% cheaper to buy.",
    eraFrom: "ics",
    eraTo: null,
    choices: [
      { key: "a", label: "RESEARCH MOORE'S LAW", effects: { moore: true } },
    ],
  },
];

function eraReachedIndex(state) {
  let best = -1;
  (state?.biz || []).forEach((row, i) => {
    if ((row?.owned || 0) > 0) best = i;
  });
  return best;
}

function inEraSpan(state, from, to) {
  const reached = eraReachedIndex(state);
  const start = from ? BUSINESSES.findIndex((cfg) => cfg.id === from) : 0;
  const end = to ? BUSINESSES.findIndex((cfg) => cfg.id === to) : BUSINESSES.length - 1;
  return reached >= 0 && start >= 0 && end >= 0 && reached >= start && reached <= end;
}

export function storyEventSpec(id) {
  return STORY_EVENTS.find((row) => row.id === id) || null;
}

export function readStoryEvent(raw) {
  if (!raw || typeof raw !== "object") return null;
  return storyEventSpec(raw.id) ? { id: raw.id } : null;
}

export function tickStoryEvents(state, now, { blocked = false, hidden = false } = {}) {
  if (hidden || blocked || state.storyEvent) return null;
  if ((state.storyDeferUntil || 0) > now) return null;
  for (const spec of STORY_EVENTS) {
    if ((state.eventsDone || []).includes(spec.id)) continue;
    if (!inEraSpan(state, spec.eraFrom, spec.eraTo)) continue;
    state.storyEvent = { id: spec.id };
    return spec;
  }
  return null;
}

export function deferStoryEvent(state, now = Date.now()) {
  if (!state.storyEvent) return false;
  state.storyEvent = null;
  state.storyDeferUntil = now + 5 * 60 * 1000;
  return true;
}

export function resolveStoryEvent(state, key, now = Date.now()) {
  const spec = storyEventSpec(state.storyEvent?.id);
  if (!spec) return null;
  if (key === "defer") {
    deferStoryEvent(state, now);
    return { type: "defer" };
  }
  const choice = spec.choices.find((row) => row.key === key) || spec.choices[0];
  if (!choice) {
    deferStoryEvent(state, now);
    return { type: "defer" };
  }
  state.storyEvent = null;
  if (!(state.eventsDone || []).includes(spec.id)) {
    state.eventsDone = [...(state.eventsDone || []), spec.id];
  }
  state.modStamp = (state.modStamp || 0) + 1;
  return { type: "choice", spec, choice, effects: choice.effects || {}, title: choice.label };
}
