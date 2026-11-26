// Shared new-game state and the player actions the live hook and the
// headless pacing sim both call, so the sim drives the real rules.

import {
  BUSINESSES,
  COMMISSION_MS,
  FOREMAN_COST,
  MAX_BUY,
  buyCount,
  costOf,
  investorsFor,
  isManaged,
  normalizeBuyMode,
} from "./gameConfig.js";
import {
  INVESTOR_MILESTONES,
  blankMeta,
  canBuyIndex,
  canHireIndex,
  effectiveCycleMs,
  empireFactors,
  ensureManagersHired,
  forkCost,
  investorPeak,
  managerPrice,
  nextInvestorMilestone,
  notePurchase,
  singularityMult,
  snapshotMeta,
  startingBiz,
  creditAmount,
  incomePerSecond,
} from "./empire.js";
import { currentGoal, settleGoals } from "./goals.js";
import { eraReachedIndex, pushRun } from "./records.js";
import { generationAt } from "./generations.js";
import { acceptContract, finishContract, tickContracts } from "./contracts.js";
import { resolveStoryEvent, tickStoryEvents } from "./storyEvents.js";

export function freshBiz(mode) {
  return BUSINESSES.map((cfg, i) => ({
    owned: mode === "glass" ? (cfg.id === "tubes" ? 1 : 0) : i === 0 ? 1 : 0,
    manager: false,
    running: false,
    progress: 0,
    activeMs: 0,
    lastGain: null,
    commissionUntil: 0,
  }));
}

export function freshState(now = Date.now()) {
  return {
    ...blankMeta(),
    cash: 0,
    lifetime: 0,
    investors: 0,
    streak: 1,
    briefingDay: null,
    offlineReport: null,
    gainSeq: 0,
    biz: freshBiz(),
    milestones: {},
    trackedSince: now,
    trackedFromStart: true,
    runStartedAt: now,
  };
}

export function buyBusiness(state, index, mode, now = Date.now()) {
  if (!canBuyIndex(state, index)) return { ok: false };
  const cfg = BUSINESSES[index];
  const st = state.biz[index];
  const count = Math.floor(buyCount(mode, cfg, st.owned, state.cash, state));
  if (!Number.isFinite(count) || count < 1 || count > MAX_BUY) return { ok: false };
  const cost = costOf(cfg, st.owned, count, state);
  if (!Number.isFinite(state.cash) || !Number.isFinite(cost) || !(state.cash >= cost)) return { ok: false };
  if (normalizeBuyMode(mode) === "x10" && currentGoal(state)?.id === "x10") state.boughtX10 = true;
  const before = st.owned;
  const after = before + count;
  const beforeGen = generationAt(cfg.id, before, state.techDone);
  state.cash -= cost;
  state.biz = state.biz.map((b, j) => (j === index ? {
    ...b,
    owned: after,
    commissionUntil: before === 0 ? now + COMMISSION_MS : b.commissionUntil,
  } : b));
  notePurchase(state, index, before, after);
  state.businessesBought = (state.businessesBought || 0) + count;
  const reachedEra = eraReachedIndex(state);
  if (reachedEra > (state.bestEra || 0)) state.bestEra = reachedEra;
  const afterGen = generationAt(cfg.id, after, state.techDone);
  const goalPay = settleGoals(state, { pay: true });
  return { ok: true, count, before, after, cost, beforeGen, afterGen, goalPay };
}

export function hireManager(state, index, now = Date.now()) {
  if (!canHireIndex(state, index)) return false;
  if ((state.biz[index].commissionUntil || 0) > now) return false;
  const price = managerPrice(state, index);
  state.cash -= price;
  if (state.shop?.freeManager) state.shop = { ...state.shop, freeManager: false };
  const cycle = effectiveCycleMs(BUSINESSES[index], state);
  state.biz = state.biz.map((b, j) => (j === index ? {
    ...b,
    manager: true,
    managerOff: false,
    running: true,
    progress: 0,
    cycleStart: now,
    cycleAt: cycle,
    paidLaps: 0,
    holdUntil: 0,
  } : b));
  state.managersHired = (state.managersHired || 0) + 1;
  ensureManagersHired(state);
  settleGoals(state, { pay: true });
  return true;
}

export function startRun(state, index, now = Date.now()) {
  const st = state.biz[index];
  if (!st) return false;
  if ((st.commissionUntil || 0) > now) return false;
  if (st.owned > 0 && !isManaged(st) && st.running) return false;
  if (!(st.owned > 0 && !isManaged(st) && !st.running)) return false;
  state.sawPit = true;
  settleGoals(state, { pay: true });
  const cycle = effectiveCycleMs(BUSINESSES[index], state);
  state.biz = state.biz.map((b, j) => (j === index ? {
    ...b,
    running: true,
    progress: 0,
    cycleStart: now,
    cycleAt: cycle,
    paidLaps: 0,
    holdUntil: 0,
  } : b));
  return true;
}

export function startAllRuns(state, now = Date.now()) {
  if (!state.foreman) return false;
  let any = false;
  state.biz = state.biz.map((b, j) => {
    if (b.owned > 0 && !isManaged(b) && !b.running && !((b.commissionUntil || 0) > now)) {
      any = true;
      return { ...b, running: true, progress: 0, cycleStart: now, cycleAt: effectiveCycleMs(BUSINESSES[j], state), paidLaps: 0, holdUntil: 0 };
    }
    return b;
  });
  if (any) {
    state.sawPit = true;
    settleGoals(state, { pay: true });
  }
  return any;
}

export function buyForeman(state) {
  if (state.foreman) return false;
  if (!(state.cash >= FOREMAN_COST) || !Number.isFinite(state.cash)) return false;
  state.cash -= FOREMAN_COST;
  state.foreman = true;
  return true;
}

export function prestigeGain(state) {
  if (state.challenge) return 0;
  const gained = investorsFor(state.lifetime);
  return Number.isFinite(gained) && gained >= 1 ? gained : 0;
}

export function prestigeWouldDouble(state) {
  const gained = prestigeGain(state);
  const have = Math.floor(state.investors || 0);
  return gained >= 1 && gained >= Math.max(1, have);
}

export function applyPrestige(state, now = Date.now()) {
  const gained = prestigeGain(state);
  if (!(gained >= 1)) return null;
  const nextInvestors = state.investors + gained;
  if (!Number.isFinite(nextInvestors) || nextInvestors < 0) return null;
  pushRun(state, { investorsGained: gained });
  state.prestigeCount = (state.prestigeCount || 0) + 1;
  const meta = snapshotMeta(state, { resetRunUpgrades: true });
  const next = freshState(now);
  Object.assign(next, meta);
  const firstTime = !state.prestiged;
  const incomeBefore = empireFactors(state, now).total;
  next.investors = nextInvestors;
  next.investorPeak = Math.max(investorPeak(state), nextInvestors);
  next.biz = startingBiz(next, freshBiz(), state.biz);
  ensureManagersHired(next);
  next.cash = 0;
  next.lifetime = 0;
  next.prestiged = true;
  next.runStartedAt = now;
  next.dilemma = null;
  next.challenge = null;
  if (firstTime) {
    next.prestigeReport = {
      gained,
      investors: nextInvestors,
      incomeBefore,
      incomeAfter: empireFactors(next, now).total,
      unlocked: INVESTOR_MILESTONES.filter((ms) => investorPeak(state) < ms.at && next.investorPeak >= ms.at).map((ms) => ({ title: ms.title, text: ms.text })),
      nextUnlock: nextInvestorMilestone(next),
    };
  }
  return { next, gained, nextInvestors, firstTime };
}

export function canFork(state) {
  if (state.challenge) return false;
  const bill = forkCost(state.singularities || 0);
  if ((state.investors || 0) < bill) return false;
  return singularityMult((state.singularities || 0) + 1) > singularityMult(state.singularities || 0);
}

export function applyFork(state, now = Date.now()) {
  if (!canFork(state)) return null;
  const bill = forkCost(state.singularities || 0);
  pushRun(state, { investorsGained: 0 });
  const meta = snapshotMeta(state, { resetRunUpgrades: true });
  const next = freshState(now);
  Object.assign(next, meta);
  next.investors = Math.max(0, (state.investors || 0) - bill);
  next.biz = startingBiz(next, freshBiz(), state.biz);
  ensureManagersHired(next);
  next.cash = 0;
  next.lifetime = 0;
  next.singularities = (state.singularities || 0) + 1;
  next.runStartedAt = now;
  next.dilemma = null;
  next.challenge = null;
  return { next, bill };
}

export function applyStoryChoice(state, key, now = Date.now()) {
  const result = resolveStoryEvent(state, key, now);
  if (!result || result.type !== "choice") return result;
  const fx = result.effects || {};
  if (fx.tokens) state.tokens = (state.tokens || 0) + fx.tokens;
  if (fx.data) state.data = (state.data || 0) + fx.data;
  if (fx.cash) creditAmount(state, Math.max(100, incomePerSecond(state, now) * fx.cash), now);
  if (fx.boost) state.boostUntil = Math.max(state.boostUntil || 0, now) + fx.boost * 60 * 1000;
  return result;
}

export function payoutContract(state, now = Date.now()) {
  const spec = finishContract(state);
  if (!spec) return null;
  if (spec.reward?.cash) {
    creditAmount(state, Math.max(100, incomePerSecond(state, now) * spec.reward.cash), now);
  }
  return spec;
}

export function playHistory(state, now = Date.now(), { blocked = false, hidden = false } = {}) {
  const notes = hidden || blocked ? [] : tickContracts(state, now, { hidden: false });
  if (!blocked && !hidden) tickStoryEvents(state, now, { blocked, hidden });
  const finished = [];
  for (const note of notes) {
    if (note.type === "contract-done") {
      const spec = payoutContract(state, now);
      if (spec) finished.push({ type: "contract-done", id: spec.id, spec });
    } else {
      finished.push(note);
    }
  }
  return finished;
}

export function botPlayHistory(state, now = Date.now()) {
  const notes = playHistory(state, now, { blocked: false, hidden: false });
  if (state.storyEvent) applyStoryChoice(state, "a", now);
  if (state.contract?.status === "offered") acceptContract(state, now);
  return notes;
}
