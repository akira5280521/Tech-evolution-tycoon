// First-session tutorial: a short guided start for players new to idle games.
//
// Each step points at one thing on the Game screen and finishes either when
// the player does it (checked from the game state, so it also works after
// offline catch-up or loading a save) or, for "manual" steps, when they tap
// the button in the bubble. It never blocks play: an experienced player who
// just plays sees the steps complete on their own.
//
// The tutorial adds no money or speed; it only explains.

import { BUSINESSES } from "./gameConfig.js";

const ownedOf = (state, id) => state?.biz?.[BUSINESSES.findIndex((cfg) => cfg.id === id)]?.owned || 0;
const managerOf = (state, id) => !!state?.biz?.[BUSINESSES.findIndex((cfg) => cfg.id === id)]?.manager;

// target: a CSS selector on the Game screen (the rows already carry
// data-tile / data-buy / data-hire labels). button: shown for manual steps.
export const TUTORIAL_STEPS = [
  {
    id: "welcome",
    title: "WELCOME, FOUNDER",
    text: "It's the 1800s and you're starting a company that will build the computer age. Let's earn your first dollar.",
    target: "[data-cash-panel]",
    manual: true,
    button: "LET'S GO",
  },
  {
    id: "tap",
    title: "TAP TO WORK",
    text: "Tap the Timber Camp. The bar fills up, then it pays you.",
    target: '[data-tile="timber"]',
    done: (s) => (s.lifetime || 0) > 0 || (s.careerEarnings || 0) > 0,
  },
  {
    id: "buy",
    title: "BUY MORE",
    text: "Buy another Timber Camp. Each one adds to every payout. The price goes up a little each time.",
    target: '[data-buy="timber"]',
    done: (s) => ownedOf(s, "timber") >= 2,
  },
  {
    id: "manager",
    title: "HIRE A MANAGER",
    text: "Own 5 Timber Camps, then hire its manager. A manager keeps the row running for you, even while the app is closed.",
    target: '[data-hire="timber"]',
    done: (s) => managerOf(s, "timber"),
  },
  {
    id: "next-row",
    title: "A NEW ROW",
    text: "Own 10 Timber Camps to open the next row, then buy a Paper Mill.",
    target: '[data-buy="paper"], [data-locked-era]',
    done: (s) => ownedOf(s, "paper") >= 1,
  },
  {
    id: "materials",
    title: "MATERIALS",
    text: "The Paper Mill turns wood from the Timber Camp into card stock. This strip shows what you have. If a row runs out, it pays much less.",
    target: "[data-supply]",
    manual: true,
    button: "GOT IT",
  },
  {
    id: "history",
    title: "REAL HISTORY",
    text: "Own 10 Paper Mills to open the Jacquard Loom (1804), the first machine run by instructions on punched cards. Each era you reach unlocks history cards in the Museum (MORE > BADGES).",
    target: '[data-buy="loom"], [data-locked-era]',
    done: (s) => ownedOf(s, "loom") >= 1,
  },
  {
    id: "finish",
    title: "YOU'VE GOT IT",
    text: "Tap, buy, hire, and keep reaching new eras. Tips will appear as new things unlock. Replay this any time from More > How to Play.",
    target: null,
    manual: true,
    button: "START PLAYING",
  },
];

// tips / tipsOff belong to the one-time feature tips (src/lib/tips.js).
export function blankTutorial() {
  return { seen: [], done: false, skipped: false, replay: false, tips: [], tipsOff: false };
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

export function stepNumber(step) {
  return TUTORIAL_STEPS.findIndex((s) => s.id === step?.id) + 1;
}
