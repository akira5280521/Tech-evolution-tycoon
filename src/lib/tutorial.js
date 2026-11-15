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
    text: "You run a company that grows through the real history of computing, from an 1800s timber camp to quantum computers. Your goal: make money, grow, and unlock each new invention in the order it really came.",
    target: null,
    manual: true,
    button: "NEXT",
  },
  {
    id: "goal",
    title: "YOUR GOAL",
    text: "This counts the eras you've unlocked, out of 19. Reach the last one. After that you can prestige: start over with investors who make everything earn more.",
    target: "[data-era-progress]",
    manual: true,
    button: "NEXT",
  },
  {
    id: "cash",
    title: "YOUR MONEY",
    text: "This is your cash. Under it: what you earn each second, and in total this run. You spend cash to grow your company.",
    target: "[data-cash-panel]",
    manual: true,
    button: "NEXT",
  },
  {
    id: "row",
    title: "YOUR FIRST BUSINESS",
    text: "Each row is one of your businesses. This is a Timber Camp. The picture on the left puts it to work, the bar shows the job in progress, and the number on the picture is how many you own.",
    target: '[data-row="timber"]',
    manual: true,
    button: "NEXT",
  },
  {
    id: "tap",
    title: "PUT IT TO WORK",
    text: "Tap the Timber Camp's picture. The crew cuts a load of wood, the bar fills, and you get paid.",
    target: '[data-tile="timber"]',
    done: (s) => (s.lifetime || 0) > 0 || (s.careerEarnings || 0) > 0,
  },
  {
    id: "buy",
    title: "GROW",
    text: "Tap BUY to get another Timber Camp. Every camp you own adds to each payment, so more camps means more money. The price goes up a little each time.",
    target: '[data-buy="timber"]',
    done: (s) => ownedOf(s, "timber") >= 2,
  },
  {
    id: "manager",
    title: "HIRE A MANAGER",
    text: "Tapping every time gets old. Own 5 Timber Camps, then hire their manager. A manager keeps them working for you, and even while the app is closed they earn at half speed.",
    target: '[data-hire="timber"]',
    done: (s) => managerOf(s, "timber"),
  },
  {
    id: "next-row",
    title: "THE NEXT INVENTION",
    text: "Own 10 Timber Camps to unlock the next business in history, the Paper Mill. Then buy one.",
    target: '[data-buy="paper"], [data-locked-era]',
    done: (s) => ownedOf(s, "paper") >= 1,
  },
  {
    id: "materials",
    title: "MATERIALS",
    text: "The Paper Mill turns wood from your Timber Camps into card stock. This strip shows what you have. If a business runs out of what it needs, it stops making money, so keep the earlier rows growing too.",
    target: "[data-supply]",
    manual: true,
    button: "GOT IT",
  },
  {
    id: "history",
    title: "REAL HISTORY",
    text: "Own 10 Paper Mills to unlock the Jacquard Loom (1804), the first machine run by instructions on punched cards. Each era you reach adds history cards to the Museum (MORE > BADGES).",
    target: '[data-buy="loom"], [data-locked-era]',
    done: (s) => ownedOf(s, "loom") >= 1,
  },
  {
    id: "finish",
    title: "THE ROAD AHEAD",
    text: "That's the whole loop: tap, buy, hire, unlock. Next come punch cards, vacuum tubes, transistors, chips, PCs and more. Tips explain new things when they appear, and any ? explains a word. Replay this from More > How to Play.",
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
