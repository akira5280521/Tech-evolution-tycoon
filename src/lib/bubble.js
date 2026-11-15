// Dot-com bubble (c. 1999-2000). It happened once, so it comes once a game:
// while the player's furthest era is Home Computers or Graphics Cards, and not
// during a challenge, a web stock appears 5-15 minutes into that stretch.
// Once it has appeared it never comes back, even after prestige or a fork.
// Its value climbs toward 300 seconds of income, and it pops at a moment
// chosen when it appears. That moment is always on the banner as a countdown.
// Cashing out is a timing choice against a clock you can see.
//
// Value = BUBBLE_MAX_SECONDS of current income x (elapsed / BUBBLE_GROW_MS)^2.
// The pop lands somewhere between BUBBLE_MIN_POP_MS and BUBBLE_GROW_MS.
import { BUSINESSES } from "./gameConfig.js";
import { creditAmount, eventDone, inEraSpan, incomePerSecond, markEventDone } from "./empire.js";

export const BUBBLE_GROW_MS = 9 * 60 * 1000;
export const BUBBLE_MIN_POP_MS = 3 * 60 * 1000;
export const BUBBLE_MAX_SECONDS = 300;
const GAP_MIN_MS = 5 * 60 * 1000;
const GAP_MAX_MS = 15 * 60 * 1000;
const FIRST_ERA = "homepc";
const LAST_ERA = "gpu";
const EVENT_ID = "dotcom";

function nextGap(now) {
  return now + GAP_MIN_MS + Math.random() * (GAP_MAX_MS - GAP_MIN_MS);
}

export function bubbleUnlocked(state) {
  return !eventDone(state, EVENT_ID) && inEraSpan(state, FIRST_ERA, LAST_ERA);
}

export function bubbleSeconds(bubble, now) {
  if (!bubble) return 0;
  const t = Math.max(0, Math.min(1, (now - bubble.startedAt) / BUBBLE_GROW_MS));
  return BUBBLE_MAX_SECONDS * t * t;
}

export function bubbleValue(state, now) {
  return bubbleSeconds(state.bubble, now) * incomePerSecond(state, now);
}

export function bubblePopInMs(bubble, now) {
  if (!bubble) return 0;
  return Math.max(0, bubble.popAt - now);
}

// Called from the live tick only, so a bubble never starts while the app is closed.
export function tickBubble(state, now) {
  const notes = [];
  if (state.bubble) {
    if (state.challenge || now >= state.bubble.popAt) {
      state.bubble = null;
      state.modStamp = (state.modStamp || 0) + 1;
      notes.push({ type: "bubblepop" });
    }
    return notes;
  }
  if (!bubbleUnlocked(state) || state.challenge) {
    // Leaving the era unstarts the clock, so coming back starts a fresh one.
    if (!state.challenge) state.nextBubbleAt = 0;
    return notes;
  }
  // Older saves scheduled the next bubble up to 80 minutes out.
  if (!state.nextBubbleAt || state.nextBubbleAt > now + GAP_MAX_MS) {
    state.nextBubbleAt = nextGap(now);
    return notes;
  }
  if (now >= state.nextBubbleAt) {
    const span = BUBBLE_GROW_MS - BUBBLE_MIN_POP_MS;
    const popAt = now + BUBBLE_MIN_POP_MS + Math.random() * span;
    state.bubble = { startedAt: now, popAt };
    markEventDone(state, EVENT_ID);
    state.modStamp = (state.modStamp || 0) + 1;
    notes.push({ type: "bubble" });
  }
  return notes;
}

export function cashOutBubble(state, now) {
  if (!state.bubble || now >= state.bubble.popAt) return null;
  const amount = bubbleValue(state, now);
  state.bubble = null;
  if (amount > 0) creditAmount(state, amount, now);
  state.modStamp = (state.modStamp || 0) + 1;
  return { amount };
}

export function cleanBubble(raw) {
  if (!raw || typeof raw !== "object") return null;
  const startedAt = Number(raw.startedAt);
  const popAt = Number(raw.popAt);
  if (!Number.isFinite(startedAt) || !Number.isFinite(popAt) || popAt <= startedAt) return null;
  return { startedAt, popAt };
}
