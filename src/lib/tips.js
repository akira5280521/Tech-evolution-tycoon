// One-time tips (tutorial part 2). After the first-session tutorial, each new
// feature explains itself the first time it shows up, in plain words, for
// players who have never played an idle game. A tip shows once, on the page
// it belongs to, one at a time; "GOT IT" marks it seen and "No more tips"
// turns them all off (More > How to Play turns them back on).
//
// Like the tutorial, tips add no money or speed. They only explain.

import { BUSINESSES, FOREMAN_COST, investorsFor, shortMaterial } from "./gameConfig.js";
import { dataPerSecond, forkCost, singularityMult, upgradeOffer, upgradesOf } from "./empire.js";
import { tutorialActive } from "./tutorial.js";

const maxOwned = (s) => Math.max(0, ...(s?.biz || []).map((b) => b?.owned || 0));

function upgradeAffordable(s) {
  return BUSINESSES.some((cfg, i) => {
    if ((s.biz?.[i]?.owned || 0) <= 0) return false;
    const up = upgradesOf(s, cfg.id);
    return !up.rev && s.cash >= upgradeOffer(i).rev.cost;
  });
}

function forkReady(s) {
  const pts = s.singularities || 0;
  return (s.investors || 0) >= forkCost(pts) && singularityMult(pts + 1) > singularityMult(pts);
}

// page: "game", "boost", "board", "runs", "research" or "more#<section>".
// target: optional CSS selector to outline while the tip is up.
// when: checked against the live game state; omitted means "on first visit".
export const TIPS = [
  // ---- Game screen, roughly in the order a new player meets them ----
  {
    id: "bubble",
    page: "game",
    title: "A STOCK BUBBLE",
    text: "This web stock grows every second, but it will pop when the timer runs out. Tap CASH OUT before then to keep the money.",
    target: "[data-bubble]",
    when: (s) => !!s.bubble,
  },
  {
    id: "prestige",
    page: "game",
    title: "YOU CAN PRESTIGE",
    text: "You can now recruit investors. A prestige starts you over: it wipes your machines, cash and upgrades, but every investor makes everything earn more, forever. Your next run goes much faster. Waiting a bit longer gets you more investors.",
    target: '[data-prestige="recruit"]',
    when: (s) => !s.challenge && !s.prestiged && investorsFor(s.lifetime) >= 1,
  },
  {
    id: "fork",
    page: "game",
    title: "A BIGGER RESET",
    text: "You have enough investors to fork the timeline on the BOARD tab. It's like a prestige, but it spends investors to give you a big multiplier that you keep forever, and opens another research slot.",
    target: '[data-tab="board"]',
    when: (s) => !s.challenge && forkReady(s),
  },
  {
    id: "running-low",
    page: "game",
    title: "RUNNING LOW",
    text: "A machine has run out of a material, so it pays much less. Buy more of the row that makes it, hire that row's manager, or buy its x3 upgrade on the BOOST tab to make 3 times as much.",
    target: "[data-supply]",
    when: (s) => !!shortMaterial(s) && (s.lifetime || 0) > 0,
  },
  {
    id: "foreman",
    page: "game",
    title: "HIRE THE FOREMAN",
    text: "You can afford the Foreman. He adds a RUN ALL button that starts every machine at once, so you don't have to tap each one.",
    target: "[data-buy-foreman]",
    when: (s) => !s.foreman && s.cash >= FOREMAN_COST,
  },
  {
    id: "buy-modes",
    page: "game",
    title: "BUY MORE AT ONCE",
    text: "These buttons set how many you buy per tap. X10 and X100 buy that many. NEXT buys just enough to reach the next goal, like a speed-up. MAX buys as many as you can afford.",
    target: "[data-buy-modes]",
    when: (s) => maxOwned(s) >= 10,
  },
  {
    id: "upgrades",
    page: "game",
    title: "UPGRADES",
    text: "You can afford an upgrade. Open the BOOST tab: upgrades make a machine pay more or run faster.",
    target: '[data-tab="boost"]',
    when: (s) => upgradeAffordable(s),
  },
  {
    id: "speedups",
    page: "game",
    title: "SPEED-UPS",
    text: "Owning 25, 50 or 100 of one machine makes it run twice as fast each time. Bigger counts after that make it pay more. The NEXT buy button aims for these.",
    target: "[data-buy-modes]",
    when: (s) => maxOwned(s) >= 25,
  },
  {
    id: "tokens",
    page: "game",
    title: "ERA TOKENS",
    text: "You earned era tokens. You get them for new eras, milestones and finished projects. Spend them in the shop on the BOARD tab. The Daily Crate there is free once a day.",
    target: '[data-tab="board"]',
    when: (s) => (s.tokens || 0) >= 1,
  },
  {
    id: "research",
    page: "game",
    title: "RESEARCH DATA",
    text: "Every era you own makes research data, slowly. Data is never lost, even when you prestige. Spend it on the RESEARCH tab on a bonus you keep forever.",
    target: '[data-tab="research"]',
    when: (s) => (s.data || 0) >= 1 && dataPerSecond(s) > 0,
  },
  {
    id: "after-prestige",
    page: "game",
    title: "FASTER THIS TIME",
    text: "Your investors boost all income now, so you'll get back to where you were much quicker. Prestige again whenever the button offers a good number of new investors.",
    target: '[data-prestige="recruit"]',
    when: (s) => !!s.prestiged && (s.investors || 0) > 0,
  },
  {
    id: "challenges",
    page: "game",
    title: "CHALLENGES",
    text: "The RUNS tab has optional challenges: one run with special rules, like no managers. Win one for +10% income forever.",
    target: '[data-tab="runs"]',
    when: (s) => !!s.prestiged,
  },

  // ---- First visit to each tab ----
  {
    id: "page-boost",
    page: "boost",
    title: "UPGRADES",
    text: "Each machine has two upgrades: one makes it pay 3 times as much, one makes it twice as fast. They cost cash and take a few seconds to install. A prestige removes them, so you buy them again each run.",
  },
  {
    id: "page-board",
    page: "board",
    title: "YOUR BONUSES",
    text: "This tab adds up everything that boosts your income: investors, forks and more. Tap a ? to see what each one is. The token shop is further down.",
  },
  {
    id: "page-runs",
    page: "runs",
    title: "CHALLENGES & PROJECTS",
    text: "Challenges are optional runs with special rules. Starting one resets your machines like prestige does, but you keep investors. Mega-projects finish on their own when you reach their goal. Both give bonuses you keep forever.",
  },
  {
    id: "page-research",
    page: "research",
    title: "THE RESEARCH LAB",
    text: "Spend research data on one company bonus. It's permanent, but you only get one slot at first, so pick the one you like. Forking the timeline opens another slot.",
  },
  {
    id: "page-badges",
    page: "more#badges",
    title: "BADGES & MUSEUM",
    text: "Badges are goals to aim for. The Museum fills with real history cards as you reach each era.",
  },
];

export function tipsOn(state) {
  return !state?.tutorial?.tipsOff;
}

// The tip to show on this page now, or null.
export function currentTip(state, page) {
  if (!state || !tipsOn(state) || tutorialActive(state)) return null;
  if (state.offlineReport || state.dilemma) return null;
  const seen = state.tutorial?.tips || [];
  for (const tip of TIPS) {
    if (tip.page !== page || seen.includes(tip.id)) continue;
    if (tip.when && !tip.when(state)) continue;
    return tip;
  }
  return null;
}
