// The lightbulb in the header (T3 item 64): one short next step for the
// screen you are on. It only answers when tapped; it never pops up by itself.
// `stuck` lets the bulb glow softly when nothing is earning on GAME.
import { BUSINESSES, FOREMAN_COST, eraOpen, investorsFor } from "./gameConfig.js";
import { forkCost, singularityMult, upgradeOffer, upgradesOf } from "./empire.js";
import { queueSlots, techJobs, techQueue } from "./research.js";
import { nextGoal } from "./nextGoal.js";
import { starterHint } from "./hub.js";

// Which hint set a route uses: the same keys the first-visit tips use.
export function hintPage(pathname, hash) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  if (path === "/") return "game";
  const name = path.slice(1).split("/")[0];
  const tab = (hash || "").replace("#", "");
  if (name === "boost") return `boost#${["now", "bonuses", "prestige"].includes(tab) ? tab : "upgrades"}`;
  if (name === "progress") return `progress#${["badges", "museum", "stats"].includes(tab) ? tab : "runs"}`;
  if (name === "research") return tab.startsWith("tech") ? "research#tech" : ["specialty", "lab"].includes(tab) ? `research#${tab}` : "research";
  if (name === "facilities") return "facilities";
  if (name === "rigs") return "hq";
  return name;
}

function upgradeReady(state) {
  return BUSINESSES.some((cfg, i) => {
    if (!eraOpen(state, i)) return false;
    const owned = state.biz?.[i]?.owned || 0;
    const offer = upgradeOffer(i);
    const up = upgradesOf(state, cfg.id);
    return ["rev", "spd"].some((k) => !up[k] && owned >= offer[k].need && (state.cash || 0) >= offer[k].cost);
  });
}

function idle(state) {
  const biz = state.biz || [];
  return biz.some((b) => (b?.owned || 0) > 0) && !biz.some((b) => b?.running || b?.manager);
}

export function screenHint(state, page) {
  if (!state) return { text: "", stuck: false };
  const stuck = page === "game" && idle(state);
  const text = hintText(state, page);
  return { text, stuck };
}

function hintText(state, page) {
  const investors = state.investors || 0;
  const claimable = investorsFor(state.lifetime);
  switch (page) {
    case "game": {
      if (idle(state)) return "Nothing is running: tap a business picture to start it.";
      const goal = nextGoal(state);
      return goal?.text ? `Next: ${goal.text}.` : "Buy more of your best business, then hire its manager.";
    }
    case "research":
    case "research#tech": {
      if (!state.techJob && !(techJobs(state) || []).length) return "The lab is idle: open TECH and START a project.";
      if (queueSlots(state) > techQueue(state).length) return "A queue slot is free: ADD TO QUEUE on TECH so the lab never waits.";
      return "Research runs by itself. More research servers in HQ make it faster.";
    }
    case "research#specialty": return "Pick one specialty: it is a bonus you keep for the whole run.";
    case "research#lab": return "Lab projects spend spare R&D points; queue slots let more research wait its turn.";
    case "boost#upgrades": {
      if (!state.foreman && (state.cash || 0) >= FOREMAN_COST) return "Hire the Foreman: RUN ALL starts every business at once.";
      if (upgradeReady(state)) return "You can afford an upgrade: the top cards are ready to buy.";
      return "Upgrades unlock as you own more of each business.";
    }
    case "boost#now": return "Overclock and the clean room in R&D > LAB add boosts on a timer.";
    case "boost#bonuses": {
      const bill = forkCost(state.singularities || 0);
      if (!state.challenge && investors >= bill && singularityMult((state.singularities || 0) + 1) > singularityMult(state.singularities || 0)) return "You can fork the timeline: a bigger reset for a multiplier you keep.";
      return (state.tokens || 0) >= 1 ? "Spend your era tokens in the shop below." : "The Daily Crate below is free once a day.";
    }
    case "boost#prestige": {
      if (state.challenge) return "Finish or abandon the challenge before you prestige.";
      if (claimable > 0 && claimable >= Math.max(1, investors)) return "Prestige now: it at least doubles your investors.";
      if (claimable > 0) return "Wait a little: prestige once it would at least double your investors.";
      return "Keep earning this run: investors come later.";
    }
    case "progress#runs": return !state.prestiged && !state.challenge ? "Challenges open after your first prestige." : "Win a challenge for +10% income forever.";
    case "progress#badges": return "Badges are goals to aim for; tap one to see what it needs.";
    case "progress#museum": return "Tap an exhibit to read about it. Finish a room for its badge.";
    case "progress#stats": return "Your company's numbers for this run and all time.";
    case "hq":
      if (starterHint(state)) return "Open RESEARCH SERVERS and buy the Inland 601.";
      return "Tap a room to go there. A red dot means something is ready.";
    case "facilities": return "Each plant says what holds it back: buy that next.";
    case "more": return "Change settings here. HOW TO PLAY explains every word.";
    default: return "Tap HQ to see every part of your company.";
  }
}
