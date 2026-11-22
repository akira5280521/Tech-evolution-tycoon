// First-session tutorial: a short guided start for players new to idle games.
//
// Each step points at one thing on the Game screen and finishes when the
// player does that thing (checked from the game state, so it also works after
// offline catch-up or loading a save). It never blocks play: taps pass
// through, and an experienced player who just plays sees finished steps skip.
// A replay waits for a tap on each step so nothing flies past.
//
// The tutorial adds no money or speed; it only explains.

import { BUSINESSES, costOf, eraOpen, managerNeed } from "./gameConfig.js";
import { HUB_LABEL } from "./hub.js";

const indexOf = (id) => BUSINESSES.findIndex((cfg) => cfg.id === id);
const ownedOf = (state, id) => state?.biz?.[indexOf(id)]?.owned || 0;
const managerOf = (state, id) => !!state?.biz?.[indexOf(id)]?.manager;

// Same price hire() charges, without importing empire.js (that file imports
// this one). A free-manager token makes the next hire cost nothing.
function managerCash(state, index) {
  if (state?.shop?.freeManager) return 0;
  const cost = BUSINESSES[index]?.managerCost;
  return Number.isFinite(cost) ? cost : Infinity;
}

function canAfford(state, id) {
  const index = indexOf(id);
  const cfg = BUSINESSES[index];
  if (!cfg) return false;
  const cost = costOf(cfg, ownedOf(state, id), 1);
  return Number.isFinite(cost) && (state?.cash || 0) >= cost;
}

const paperOpen = (state) => eraOpen(state, indexOf("paper"));

// target: a CSS selector, or a function of state when the thing to tap changes
// (the picture until a button lights, then the button). text works the same way.
export const TUTORIAL_STEPS = [
  {
    id: "run",
    title: "RUN IT",
    text: "Tap the Timber Camp picture to run the business. The bar fills, then it pays you cash.",
    target: '[data-tile="timber"]',
    done: (s) => (s.lifetime || 0) > 0 || (s.careerEarnings || 0) > 0,
  },
  {
    id: "buy",
    title: "BUY",
    text: (s) => (canAfford(s, "timber")
      ? "Tap BUY to get another one of this business. It spends cash, the big CASH number, not what you earned this run."
      : "Tap the picture again until BUY lights up. BUY spends cash, the big CASH number, not what you earned this run."),
    target: (s) => (canAfford(s, "timber") ? '[data-buy="timber"]' : '[data-tile="timber"]'),
    done: (s) => ownedOf(s, "timber") >= 2,
  },
  {
    id: "modes",
    title: "HOW MANY",
    text: "Tap the buy button to change how many you buy per tap: X1, X10, X25, X50, X75, X100, then MAX, which spends all your cash.",
    target: "[data-buy-modes]",
  },
  {
    id: "hire",
    title: "HIRE",
    text: (s) => {
      const index = indexOf("timber");
      const owned = ownedOf(s, "timber");
      if (owned < managerNeed(index)) {
        return canAfford(s, "timber")
          ? "Tap BUY until you own 5. Then Hire spends cash, and a manager runs this business for you."
          : "Tap the picture until BUY lights up. You need 5 of this business, then a manager runs it for you.";
      }
      if ((s?.cash || 0) < managerCash(s, index)) return "Tap the picture to earn cash, then tap Hire. Hire spends the CASH number, not what you earned this run.";
      return "Tap Hire. It spends cash, and a manager runs this business for you.";
    },
    target: (s) => {
      const index = indexOf("timber");
      if (ownedOf(s, "timber") < managerNeed(index)) return canAfford(s, "timber") ? '[data-buy="timber"]' : '[data-tile="timber"]';
      if ((s?.cash || 0) < managerCash(s, index)) return '[data-tile="timber"]';
      return '[data-hire="timber"]';
    },
    done: (s) => managerOf(s, "timber"),
  },
  {
    id: "next",
    title: "NEXT BUSINESS",
    text: (s) => {
      if (!paperOpen(s)) {
        return canAfford(s, "timber")
          ? "Tap BUY. At 10 of this business, the next one opens."
          : "Tap the picture until BUY lights up. At 10 of this business, the next one opens.";
      }
      if (!canAfford(s, "paper")) return "Tap the Timber Camp picture to earn cash, then tap BUY on the new business. Its manager needs 10, and a different cash price than Timber's 5.";
      return "Tap BUY on the new business. Its manager needs 10 owned, and a different cash price than Timber's 5.";
    },
    target: (s) => {
      if (!paperOpen(s)) return canAfford(s, "timber") ? '[data-buy="timber"]' : '[data-tile="timber"]';
      if (!canAfford(s, "paper")) return '[data-tile="timber"]';
      return '[data-buy="paper"]';
    },
    done: (s) => ownedOf(s, "paper") >= 1,
  },
  {
    id: "materials",
    title: "MATERIALS",
    text: "Tap the wood count up top. This business uses wood that Timber Camp makes, and stops paying if the wood runs out.",
    target: "[data-supply]",
  },
  {
    id: "later",
    title: "WHAT'S AHEAD",
    text: `The ??? buttons open later. TECH is research: timed projects paid with R&D points. ${HUB_LABEL} holds the research machines that make R&D points, and other plants. A tip explains each one when it opens.`,
    target: "[data-open-research]",
    manual: true,
    button: "DONE",
  },
];

export function stepTarget(step, state) {
  if (!step) return null;
  const target = typeof step.target === "function" ? step.target(state) : step.target;
  return target || null;
}

export function stepText(step, state) {
  if (!step) return "";
  return typeof step.text === "function" ? step.text(state) : step.text;
}

// tips / tipsOff belong to the one-time feature tips (src/lib/tips.js).
export function blankTutorial() {
  return { seen: [], done: false, skipped: false, replay: false, tips: [], tipsOff: false, tipsShown: [] };
}

// Read a saved tutorial record. A save from before the tutorial existed counts
// as finished when it has any real progress, so existing players aren't shown it.
export function readTutorial(raw, hasProgress) {
  if (!raw || typeof raw !== "object") {
    return { ...blankTutorial(), done: !!hasProgress };
  }
  const ids = new Set(TUTORIAL_STEPS.map((step) => step.id));
  return {
    seen: Array.isArray(raw.seen) ? raw.seen.filter((id) => ids.has(id)) : [],
    done: !!raw.done,
    skipped: !!raw.skipped,
    replay: !!raw.replay,
    tips: Array.isArray(raw.tips) ? raw.tips.filter((id) => typeof id === "string").slice(0, 100) : [],
    tipsOff: !!raw.tipsOff,
    tipsShown: Array.isArray(raw.tipsShown) ? raw.tipsShown.filter((id) => typeof id === "string").slice(0, 100) : [],
  };
}

export function tutorialActive(state) {
  const t = state?.tutorial;
  return !!t && !t.done && !t.skipped;
}

// The step to show now, or null. Steps already done (by action or by tap)
// are passed over, so a player who is ahead skips straight to where they are.
// On a replay every step waits for a tap, so nothing flies past.
export function currentTutorialStep(state) {
  if (!tutorialActive(state)) return null;
  const t = state.tutorial;
  for (const step of TUTORIAL_STEPS) {
    if (t.seen.includes(step.id)) continue;
    if (!t.replay && !step.manual && step.done?.(state)) continue;
    return step;
  }
  return null;
}

// True once every step is satisfied and the replay isn't holding them open.
// The last step has no separate Done button: doing it finishes the tutorial.
export function tutorialCleared(state) {
  if (!tutorialActive(state) || state.tutorial.replay) return false;
  return currentTutorialStep(state) == null;
}

export function stepNumber(step) {
  return TUTORIAL_STEPS.findIndex((s) => s.id === step?.id) + 1;
}
