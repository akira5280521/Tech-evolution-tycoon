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
import { FIRST_RESEARCH_ID } from "./research.js";
import { STARTER_PART_ID, facilityUnlocked } from "./facilities.js";

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
  const cost = costOf(cfg, ownedOf(state, id), 1, state);
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
    id: "hq",
    title: "HEADQUARTERS",
    text: `Tap ${HUB_LABEL} (beside BUY AMOUNT). It is the menu for research machines, later plants, and the Hardware Museum.`,
    target: "[data-open-facilities]",
    done: (s) => !!(s.tutorial?.opened || []).includes("hq"),
  },
  {
    id: "hq-go",
    title: "GO",
    text: "These are locations you can visit. Tap GO to go there.",
    target: "[data-action='go-servers']",
    done: (s) => !!(s.tutorial?.opened || []).includes("servers"),
  },
  {
    id: "servers",
    title: "RESEARCH SERVERS",
    text: "Tap RESEARCH SERVERS. This room holds the machines that make R&D points.",
    target: "[data-hub-item='servers']",
    done: (s) => !!(s.tutorial?.opened || []).includes("servers"),
  },
  {
    id: "starter",
    title: "THE PUNCH-CARD MACHINE",
    text: "Tap BUY on the Inland 601. It is cheap, and it starts making R&D points at once. You need those points to research hardware in R&D > TECH.",
    target: "[data-action='buy-tab601']",
    done: (s) => (s.facilities?.servers?.[STARTER_PART_ID] || 0) > 0,
  },
  {
    id: "tech",
    title: "THE TECH TIMELINE",
    text: "Tap R&D in the bar below, then the TECH tab. TECH lists real inventions to research with R&D points.",
    target: '[data-sub-tab="tech"], [data-tab="research"]',
    done: (s) => !!(s.tutorial?.opened || []).includes("tech"),
  },
  {
    id: "project",
    title: "FIRST RESEARCH",
    text: "Tap the Hollerith tabulator to start it. It is the first project, and it keeps going while the app is closed.",
    target: "[data-action='research-tab-hollerith']",
    done: (s) => (s.techDone || []).includes(FIRST_RESEARCH_ID) || s.techJob?.id === FIRST_RESEARCH_ID || s.techJob2?.id === FIRST_RESEARCH_ID,
  },
  {
    id: "later",
    title: "WHAT'S AHEAD",
    text: `Other plants open later: the PC Build Bench, the Bitbark Mine and the training cluster. A short guide walks you through each one when it unlocks. You can also read them in MORE > HOW TO PLAY.`,
    target: '[data-tab="research"]',
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
  return { seen: [], done: false, skipped: false, replay: false, tips: [], tipsOff: false, tipsShown: [], opened: [], toursSeen: [], toursSkipped: [], toursDone: [], toursReady: false };
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
    opened: Array.isArray(raw.opened) ? raw.opened.filter((id) => typeof id === "string").slice(0, 20) : [],
    toursSeen: Array.isArray(raw.toursSeen) ? raw.toursSeen.filter((id) => typeof id === "string").slice(0, 40) : [],
    toursSkipped: Array.isArray(raw.toursSkipped) ? raw.toursSkipped.filter((id) => typeof id === "string").slice(0, 20) : [],
    toursDone: Array.isArray(raw.toursDone) ? raw.toursDone.filter((id) => typeof id === "string").slice(0, 20) : [],
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

// Short guides that fire once when a facility first unlocks this career.
export const FACILITY_TOURS = [
  {
    id: "tour-servers",
    facilityId: "servers",
    when: (s) => facilityUnlocked(s, "servers"),
    route: "/facilities/servers",
    steps: [
      { id: "servers-room", title: "MACHINE ROOM", text: "Mainframes opened the rest of this room. Research a computer in R&D > TECH, then come back here to buy it.", target: "[data-facility='servers']", manual: true },
      { id: "servers-kit", title: "POWER AND COOLING", text: "Each machine-room computer needs its own motor-generator and air conditioner, and a tape or disk once you have researched one.", target: "[data-facility='servers']", manual: true, button: "DONE" },
    ],
  },
  {
    id: "tour-bench",
    facilityId: "bench",
    when: (s) => facilityUnlocked(s, "bench"),
    route: "/facilities/bench",
    steps: [
      { id: "bench-intro", title: "PC BUILD BENCH", text: "The lab builds one PC at a time. It needs a board, a CPU that fits that board's socket, and memory that fits its slots.", target: "[data-facility='bench']", manual: true },
      { id: "bench-parts", title: "FIT THE PARTS", text: "Start with a board, then a CPU for its socket, then memory for its slots. The bench tells you if something doesn't fit. The PC makes R&D points.", target: "[data-facility='bench']", manual: true, button: "DONE" },
    ],
  },
  {
    id: "tour-mine",
    facilityId: "mine",
    when: (s) => facilityUnlocked(s, "mine"),
    route: "/facilities/mine",
    steps: [
      { id: "mine-intro", title: "BITBARK MINE", text: "Graphics cards here mint Bitbark, a game coin that stays in the game. It adds a little extra income.", target: "[data-facility='mine']", manual: true },
      { id: "mine-run", title: "POWER AND COOLING", text: "Buy a card, then enough power and cooling. The plant runs slower if either can't keep up, and it tells you what to add next.", target: "[data-facility='mine']", manual: true, button: "DONE" },
    ],
  },
  {
    id: "tour-cluster",
    facilityId: "cluster",
    when: (s) => facilityUnlocked(s, "cluster"),
    route: "/facilities/cluster",
    steps: [
      { id: "cluster-intro", title: "TRAINING CLUSTER", text: "The cluster trains a model and bills the studio. A bigger model needs more memory.", target: "[data-facility='cluster']", manual: true },
      { id: "cluster-run", title: "CARDS AND MEMORY", text: "Buy graphics cards, memory, power and cooling. The cluster tells you if it needs more RAM or VRAM for the next model size.", target: "[data-facility='cluster']", manual: true, button: "DONE" },
    ],
  },
];

export function tourSteps() {
  return FACILITY_TOURS.flatMap((tour) => tour.steps);
}

// The coach to show now: the first-session tutorial first, then one facility
// tour at a time, in unlock order.
export function currentCoach(state) {
  const first = currentTutorialStep(state);
  if (first) {
    return { kind: "tutorial", tourId: null, step: first, index: stepNumber(first), total: TUTORIAL_STEPS.length, route: null };
  }
  if (tutorialActive(state)) return null;
  const rec = state?.tutorial;
  const skipped = rec?.toursSkipped || [];
  const done = rec?.toursDone || [];
  const seen = rec?.toursSeen || [];
  for (const tour of FACILITY_TOURS) {
    if (skipped.includes(tour.id) || done.includes(tour.id)) continue;
    if (!tour.when(state)) continue;
    for (let i = 0; i < tour.steps.length; i++) {
      const step = tour.steps[i];
      if (seen.includes(step.id)) continue;
      return { kind: "tour", tourId: tour.id, step, index: i + 1, total: tour.steps.length, route: tour.route };
    }
  }
  return null;
}

export function markOpened(state, id) {
  if (!state?.tutorial || !id) return false;
  const opened = state.tutorial.opened || [];
  if (opened.includes(id)) return false;
  state.tutorial = { ...state.tutorial, opened: [...opened, id] };
  return true;
}
