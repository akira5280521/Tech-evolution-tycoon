// One short "Next:" line under the cash box: the single most useful next goal.
import { BUSINESSES, costOf, eraCanOpen, eraOpen, money, nextMilestone, isManaged, managerNeed } from "./gameConfig.js";
import { managerPrice } from "./empire.js";
import { starterHint } from "./hub.js";
import { currentGoal } from "./goals.js";
import { sectionOfId } from "./sections.js";
import { canStartResearch, FIRST_RESEARCH_ID, researchItem, researchLock } from "./research.js";

function milestoneLine(cfg, next) {
  const bonus = next.speed ? `${next.speed}× speed` : `${next.mult}× pay`;
  return `${cfg.name} ${next.owned} for ${bonus}`;
}

function jumpForRow(id) {
  return { to: "/", rowId: id, section: sectionOfId(id) };
}

// The single best next step, or null when nothing useful is queued.
export function nextGoal(state) {
  if (!state) return null;

  const starter = starterHint(state);
  if (starter) {
    return { id: "starter", text: "Buy the Inland 601 in HQ", to: "/facilities/servers", rowId: null, section: null };
  }

  const goal = currentGoal(state);
  if (goal) {
    const rowId = { paper: "paper", punch: "punchcards" }[goal.id] || "timber";
    return { id: `goal-${goal.id}`, text: goal.title, to: goal.id === "museum" ? "/museum" : "/", rowId: goal.id === "museum" ? null : rowId, section: goal.id === "museum" ? null : sectionOfId(rowId) };
  }

  const biz = state.biz || [];
  const cash = Number(state.cash) || 0;

  // Open or buy the next era if that is already affordable.
  for (let i = 1; i < BUSINESSES.length; i++) {
    if (!eraOpen(state, i) && eraCanOpen(state, i)) {
      return { id: `open-${BUSINESSES[i].id}`, text: `Open ${BUSINESSES[i].name}`, to: "/", rowId: BUSINESSES[i].id, section: sectionOfId(BUSINESSES[i].id) };
    }
    if (eraOpen(state, i) && !(biz[i]?.owned > 0)) {
      const cost = costOf(BUSINESSES[i], 0, 1);
      if (Number.isFinite(cost) && cash >= cost) {
        return { id: `buy-${BUSINESSES[i].id}`, text: `Buy ${BUSINESSES[i].name}`, ...jumpForRow(BUSINESSES[i].id) };
      }
      break;
    }
  }

  // Closest remaining milestone on an owned row.
  let bestMs = null;
  BUSINESSES.forEach((cfg, i) => {
    const owned = biz[i]?.owned || 0;
    if (owned <= 0) return;
    const next = nextMilestone(owned);
    if (!next) return;
    const left = next.owned - owned;
    if (!bestMs || left < bestMs.left || (left === bestMs.left && i > bestMs.i)) {
      bestMs = { i, cfg, next, left };
    }
  });
  if (bestMs) {
    return { id: `ms-${bestMs.cfg.id}-${bestMs.next.owned}`, text: milestoneLine(bestMs.cfg, bestMs.next), ...jumpForRow(bestMs.cfg.id) };
  }

  // An affordable hire.
  for (let i = BUSINESSES.length - 1; i >= 0; i--) {
    const st = biz[i];
    if (!st || st.manager || (st.owned || 0) < managerNeed(i)) continue;
    if (state.challenge?.id === "noboss") continue;
    const price = managerPrice(state, i);
    if (Number.isFinite(price) && cash >= price && !isManaged(st)) {
      return { id: `hire-${BUSINESSES[i].id}`, text: `Hire ${BUSINESSES[i].managerName}`, ...jumpForRow(BUSINESSES[i].id) };
    }
  }

  // A first TECH project the player can start.
  const first = researchItem(FIRST_RESEARCH_ID);
  if (first && canStartResearch(state, first.id) && !researchLock(state, first)) {
    return { id: `tech-${first.id}`, text: `Research ${first.name}`, to: "/tech", rowId: null, section: null, hash: first.id };
  }

  return null;
}

export function nextGoalLabel(goal) {
  if (!goal) return "";
  const text = String(goal.text || "").replace(/\s+/g, " ").trim();
  return text ? `Next: ${text}` : "";
}
