// One-time tips (tutorial part 2). After the first-session tutorial, each new
// feature explains itself the first time it shows up, in plain words, for
// players who have never played an idle game. A tip shows once, on the page
// it belongs to, one at a time; "GOT IT" marks it seen and "No more tips"
// turns them all off (More > How to Play turns them back on).
//
// Like the tutorial, tips add no money or speed. They only explain.

import { BUSINESSES, FOREMAN_COST, investorsFor, managerNeed, shortMaterial } from "./gameConfig.js";
import { dataPerSecond, forkCost, managerPrice, singularityMult, upgradeOffer, upgradesOf } from "./empire.js";
import { tutorialActive } from "./tutorial.js";
import { facilitiesOpen, facilityUnlocked } from "./facilities.js";
import { techOpen } from "./research.js";
import { HUB_LABEL } from "./hub.js";

const maxOwned = (s) => Math.max(0, ...(s?.biz || []).map((b) => b?.owned || 0));

function upgradeAffordable(s) {
  return BUSINESSES.some((cfg, i) => {
    if ((s.biz?.[i]?.owned || 0) <= 0) return false;
    const up = upgradesOf(s, cfg.id);
    return !up.rev && s.cash >= upgradeOffer(i).rev.cost;
  });
}

// Owned enough to hire, but the cash on hand (not a free-manager token) is short.
function hireBlockedByCash(s) {
  if (!s || s.challenge?.id === "noboss") return false;
  return BUSINESSES.some((_, i) => {
    const st = s.biz?.[i];
    if (!st || st.manager) return false;
    if ((st.owned || 0) < managerNeed(i)) return false;
    const price = managerPrice(s, i);
    return price > 0 && (Number(s.cash) || 0) < price;
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
    text: "You can now recruit investors. A prestige starts you over: it wipes your businesses, cash and upgrades, but every investor makes everything earn more, forever. Your next run goes much faster. Waiting a bit longer gets you more investors.",
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
    text: "A business has run out of a material, so it has stopped paying. Buy more of the row that makes it, hire that row's manager, or buy its x3 upgrade on the BOOST tab to make 3 times as much.",
    target: "[data-supply]",
    when: (s) => !!shortMaterial(s) && (s.lifetime || 0) > 0,
  },
  {
    id: "hire-cash",
    page: "game",
    title: "HIRE WITH CASH",
    text: "The Hire button lights when you own enough of that business and have the cash on hand: the big CASH number at the top, not what you've earned this run. A manager keeps that business running by itself, even while you're away.",
    target: "[data-cash-panel]",
    when: (s) => hireBlockedByCash(s),
  },
  {
    id: "foreman",
    page: "game",
    title: "HIRE THE FOREMAN",
    text: "You can afford the Foreman. He adds a RUN ALL button that starts every business at once, so you don't have to tap each one.",
    target: "[data-buy-foreman]",
    when: (s) => !s.foreman && s.cash >= FOREMAN_COST,
  },
  {
    id: "buy-modes",
    page: "game",
    title: "BUY MORE AT ONCE",
    text: "Tap the buy-amount button to change how many one BUY gets. It cycles X1, X10, X25, X50, X75, X100, then MAX, which spends all your cash.",
    target: "[data-buy-modes]",
    when: (s) => maxOwned(s) >= 10 && !(s.tutorial?.seen || []).includes("modes"),
  },
  {
    id: "upgrades",
    page: "game",
    title: "UPGRADES",
    text: "Tap BOOST. An upgrade makes one business pay more or run faster, and it costs cash.",
    target: '[data-tab="boost"]',
    when: (s) => upgradeAffordable(s),
  },
  {
    id: "speedups",
    page: "game",
    title: "SPEED-UPS",
    text: "Milestones come at 25, 50, 75, 100, 150 and 200. At 25, 50 and 100 a business runs twice as fast; at 75, 150 and 200 it pays more.",
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
    title: "R&D POINTS",
    text: "Your eras make a trickle of R&D points. Tap R&D and spend them on a bonus you keep. Research servers make far more later.",
    target: '[data-tab="research"]',
    when: (s) => (s.data || 0) >= 1 && dataPerSecond(s) > 0,
  },
  {
    id: "tech",
    page: "game",
    title: "THE TECH TIMELINE",
    text: "TECH lists real inventions to research with R&D points. One runs at a time, on a timer that keeps going while the app is closed. \"Requires 1985\" means your company hasn't reached that year yet. \"Research X first\" means finish the one before it.",
    target: "[data-open-research]",
    when: (s) => techOpen(s),
  },
  {
    id: "servers",
    page: "game",
    title: "RESEARCH SERVERS",
    text: `Tap ${HUB_LABEL} (beside TECH), then RIGS, for research servers. They make most of your R&D points, far more than your eras. Buy a rack, then give it power and cooling.`,
    target: '[data-open-facilities]',
    when: (s) => facilityUnlocked(s, "servers"),
  },
  {
    id: "facilities",
    page: "game",
    title: "MINE AND CLUSTER",
    text: `Two more plants opened under ${HUB_LABEL} > RIGS: the Bitbark mine and the AI training cluster. Buy graphics cards, memory, power and cooling. They add a small extra income, and run slower if power or cooling can't keep up.`,
    target: '[data-open-facilities]',
    when: (s) => facilitiesOpen(s),
  },
  {
    id: "challenges",
    page: "game",
    title: "CHALLENGES",
    text: "Tap RUNS for an optional challenge, one run with special rules. Win it for +10% income forever.",
    target: '[data-tab="runs"]',
    when: (s) => !!s.prestiged,
  },
  {
    id: "more-tab",
    page: "game",
    title: "A BADGE",
    text: "You earned a badge. Tap MORE, then Badges, to see it.",
    target: '[data-tab="more"]',
    when: (s) => (s.badgesEarned || []).length > 0,
  },

  // ---- First visit to each tab ----
  {
    id: "page-boost",
    page: "boost",
    title: "UPGRADES",
    text: "Each business has two upgrades. One pays 3 times as much, one runs twice as fast. They cost cash.",
  },
  {
    id: "page-board",
    page: "board",
    title: "YOUR BONUSES",
    text: "This adds up what boosts your income. Tap a ? for any word. The token shop is further down.",
  },
  {
    id: "page-runs",
    page: "runs",
    title: "CHALLENGES & PROJECTS",
    text: "A challenge is one optional run with special rules. Mega-projects finish on their own when you reach their goal. Both pay a bonus you keep.",
  },
  {
    id: "page-research",
    page: "research",
    title: "RESEARCH",
    text: "Spend R&D points on one bonus you keep. You start with one slot. Spare points go to the lab projects below.",
  },
  {
    id: "page-tech",
    page: "tech",
    title: "RESEARCH, ONE AT A TIME",
    text: "Pick a project and tap START. It costs R&D points and finishes on its own, even with the app closed. More servers make the timer run faster. Processor and graphics projects unlock the next chip generation's pay.",
  },
  {
    id: "page-facilities",
    page: "facilities",
    title: "YOUR PLANTS",
    text: "Each plant shows what's holding it back: power, cooling, memory or more cards. Research servers make R&D points; the mine and cluster add a little income. Parts are lost when you prestige.",
  },
  {
    id: "page-badges",
    page: "more#badges",
    title: "BADGES",
    text: "Badges are goals to aim for. History cards are in the Museum, the next button.",
  },
  {
    id: "page-museum",
    page: "more#museum",
    title: "THE MUSEUM",
    text: "Every piece of hardware in the game, room by room. Tap one to read about it; dark ones are still to find.",
  },
  {
    id: "page-more",
    page: "more#settings",
    title: "MORE",
    text: "Change sound and text size here. How to Play explains any word, and Badges are the next button.",
  },
];

export function tipsOn(state) {
  return !state?.tutorial?.tipsOff;
}

// The tip to show on this page now, or null.
export function currentTip(state, page) {
  if (!state || !tipsOn(state) || tutorialActive(state)) return null;
  if (state.offlineReport || state.dilemma || state.prestigeReport) return null;
  const seen = state.tutorial?.tips || [];
  for (const tip of TIPS) {
    if (tip.page !== page || seen.includes(tip.id)) continue;
    if (tip.when && !tip.when(state)) continue;
    return tip;
  }
  return null;
}
