import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { applyBriefing } from "@/lib/briefing";
import {
  AWAY_GRACE_MS,
  AWAY_MODAL_MS,
  BUSINESSES,
  COMMISSION_MS,
  FOREMAN_COST,
  MAX_BUY,
  MILESTONES,
  OFFLINE_CAP_MS,
  OFFLINE_RATE,
  buyCount,
  cappedTick,
  costOf,
  normalizeBuyMode,
  investorsFor,
  money,
} from "@/lib/gameConfig";
import {
  CHALLENGES,
  PROJECTS,
  scaledChallengeGoal,
  beginResearch,
  blankMeta,
  collectBadges,
  legacyBadgeIds,
  buyShopItem,
  buyLabProject,
  cleanLab,
  buyUpgrade,
  canBuyIndex,
  canHireIndex,
  replayAway,
  failChallenge,
  empireFactors,
  investorPeak,
  INVESTOR_MILESTONES,
  nextInvestorMilestone,
  peakFromSave,
  offlineCapMs,
  startingBiz,
  autoBuyUpgrade,
  businessIncomePerSecond,
  incomePerSecond,
  creditAmount,
  creditCycles,
  dataPerSecond,
  effectiveCycleMs,
  ensureSupply,
  finishTimedWork,
  managerPrice,
  notePurchase,
  resolveDilemma,
  DILEMMAS,
  forkCost,
  singularityMult,
  snapshotMeta,
  tickDilemma,
} from "@/lib/empire";
import { blankTutorial, readTutorial, TUTORIAL_STEPS, tutorialCleared } from "@/lib/tutorial";
import { cashOutBubble, cleanBubble, tickBubble } from "@/lib/bubble";
import { collectHistory, isHistoryCardId } from "@/lib/history";
import { generationAt } from "@/lib/generations";
import { REBUILD_SECONDS, facilityReport, noteFacilityNews, purchasePart, readFacilities, readNews, migrateFacilities, rebuildPlants, settleClosedParts } from "@/lib/facilities";
import { advanceResearch, fillResearchGaps, grantOwnedResearch, readResearchData, readTechDone, readTechJob, startResearch } from "@/lib/research";
import { currentGoal, readGoalsDone, settleGoals } from "@/lib/goals";
import { applyOrientation } from "@/lib/orientation";
import { SAVE_VERSION, clearSaveData, getSaveData, remapBestEra, writeSaveData } from "@/lib/gameSave";
import { encodeSave } from "@/lib/saveCode";
import { isPageHidden } from "@/lib/pageVisibility";
import { playBuy, playCollect } from "@/lib/sfx";
import { buzzLight, buzzStrong } from "@/lib/haptics";
import { cancelCapNotification, scheduleCapNotification } from "@/lib/capNotify";
import { noteMilestones, pushRun, readMilestones, readRuns, eraReachedIndex, startMilestones } from "@/lib/records";
import { noteProgress } from "@/lib/achievements";

const SAVE_INTERVAL_MS = 5000;
// The live game tick. Payouts follow each business's own cycle clock (and a
// timer per row lands each lap on time), so the tick only settles laps and
// updates the screen: 4 a second is plenty and was 10, which cost battery.
const TICK_MS = 250;
const RENDER_MS = 250;
// Cash and R&D points move every tick, but the screen only needs a fresh
// number about once a second. Payouts and finished projects still paint immediately.
const DISPLAY_MS = 1000;
// 24 hours / 720 = 2 minute slices at the cap; shorter absences slice finer.

function freshBiz(mode) {
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

function freshState() {
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
    trackedSince: Date.now(),
    trackedFromStart: true,
  };
}

function num(n, fallback = 0) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : fallback;
}

function applySavedMeta(state, raw) {
  const m = raw?.meta || {};
  state.careerEarnings = num(m.careerEarnings);
  state.singularities = Math.floor(num(m.singularities));
  state.tokens = num(m.tokens);
  state.grants = Array.isArray(m.grants) ? m.grants.filter((id) => typeof id === "string").slice(0, 800) : [];
  state.data = num(m.data);
  state.specialties = Array.isArray(m.specialties)
    ? m.specialties.filter((id) => id === "scale" || id === "velocity" || id === "signal")
    : [];
  state.upgrades = {};
  if (m.upgrades && typeof m.upgrades === "object") {
    for (const cfg of BUSINESSES) {
      const row = m.upgrades[cfg.id];
      if (row && typeof row === "object") state.upgrades[cfg.id] = { rev: !!row.rev, spd: !!row.spd };
    }
  }
  // Only real, distinct ids: each one is a permanent income bonus, so a
  // hand-edited code must not repeat or invent them.
  const known = (list, ids) => (Array.isArray(list) ? [...new Set(list.filter((id) => ids.includes(id)))] : []);
  state.challengesDone = known(m.challengesDone, CHALLENGES.map((c) => c.id));
  state.projectsDone = known(m.projectsDone, PROJECTS.map((p) => p.id));
  const shop = m.shop && typeof m.shop === "object" ? m.shop : {};
  state.shop = {
    freeManager: !!shop.freeManager,
    cashBuys: Math.floor(num(shop.cashBuys)),
    samples: Math.floor(num(shop.samples)),
    crateDay: typeof shop.crateDay === "string" ? shop.crateDay : null,
  };
  state.boostUntil = num(m.boostUntil);
  state.lab = cleanLab(m.lab);
  state.dilemmaDeferUntil = num(m.dilemmaDeferUntil);
  state.nextDilemmaAt = num(m.nextDilemmaAt);
  state.lastDilemma = typeof m.lastDilemma === "string" ? m.lastDilemma : null;
  state.nextWindfallAt = num(m.nextWindfallAt);
  state.prestiged = !!m.prestiged;
  // Investor milestones go by the most investors ever held; older saves add
  // back the investors spent on forks.
  state.investorPeak = Math.max(Math.floor(num(m.investorPeak)), peakFromSave(num(raw?.investors), num(m.singularities)));
  state.autoUpgrades = !!m.autoUpgrades;
  // Saves from before the tutorial: anyone with real progress has played already.
  state.tutorial = readTutorial(m.tutorial, num(m.careerEarnings) > 0 || num(raw?.investors) > 0 || (raw?.biz || []).some((b, i) => (b?.owned || 0) > (i === 0 ? 1 : 0)));
  state.badgesEarned = Array.isArray(m.badgesEarned) ? m.badgesEarned.filter((id) => typeof id === "string") : [];
  state.museum = Array.isArray(m.museum) ? m.museum.filter((id) => isHistoryCardId(id)) : [];
  state.bubble = cleanBubble(m.bubble);
  state.eventsDone = Array.isArray(m.eventsDone) ? [...new Set(m.eventsDone.filter((id) => typeof id === "string"))] : [];
  state.nextBubbleAt = num(m.nextBubbleAt);
  state.modStamp = 1;
  const orient = raw?.orientation;
  state.orientation = orient === "portrait" || orient === "landscape" || orient === "auto" ? orient : "auto";
  state.challenge = readChallenge(m.challenge);
  state.dilemma =
    m.dilemma && Number(m.dilemma.expiresAt) > Date.now()
      ? { id: DILEMMAS.some((d) => d.id === m.dilemma.id) ? m.dilemma.id : "grant", expiresAt: Number(m.dilemma.expiresAt) }
      : null;
  state.businessesBought = m.businessesBought == null ? null : Math.floor(num(m.businessesBought));
  state.managersHired = m.managersHired == null ? null : Math.floor(num(m.managersHired));
  state.prestigeCount = m.prestigeCount == null ? null : Math.floor(num(m.prestigeCount));
  state.playMs = m.playMs == null ? null : num(m.playMs);
  state.runStartedAt = m.runStartedAt == null ? 0 : num(m.runStartedAt);
  state.bestEra = m.bestEra == null ? null : Math.floor(num(m.bestEra));
  state.runs = readRuns(m.runs);
  state.milestones = readMilestones(m.milestones);
  state.lastPlants = migrateFacilities(m.lastPlants).facilities;
  state.trackedSince = m.trackedSince == null ? 0 : num(m.trackedSince);
  state.trackedFromStart = !!m.trackedFromStart;
  // Parts that no longer fit their plant or its memory board are refunded
  // (see migrateFacilities).
  const { facilities, refund } = migrateFacilities(m.facilities);
  state.facilities = facilities;
  if (refund > 0) state.cash = (state.cash || 0) + refund;
  state.news = readNews(m.news);
  // Older saves kept server output separately; it joins the one R&D pool.
  state.data = (Number.isFinite(state.data) ? state.data : 0) + readResearchData(m.researchData);
  state.techDone = readTechDone(m.techDone);
  state.techJob = readTechJob(m.techJob);
  state.techJob2 = readTechJob(m.techJob2);
  state.goalsDone = readGoalsDone(m.goalsDone);
  state.boughtX10 = !!m.boughtX10;
  state.benchOc = m.benchOc !== false;
  state.restartSeen = !!m.restartSeen;
}

function readChallenge(raw) {
  if (!raw || typeof raw.id !== "string") return null;
  const spec = CHALLENGES.find((entry) => entry.id === raw.id);
  const stored = raw.goal;
  const goal = typeof stored === "number" && Number.isFinite(stored) && stored > 0 ? stored : spec?.goal || 0;
  return { id: raw.id, startedAt: num(raw.startedAt), earnings: num(raw.earnings), goal };
}

function pack(s) {
  collectBadges(s);
  return {
    version: SAVE_VERSION,
    cash: Number.isFinite(s.cash) && s.cash >= 0 ? s.cash : 0,
    lifetime: Number.isFinite(s.lifetime) && s.lifetime >= 0 ? s.lifetime : 0,
    investors: Number.isFinite(s.investors) && s.investors >= 0 ? Math.floor(s.investors) : 0,
    investorPeak: investorPeak(s),
    autoUpgrades: !!s.autoUpgrades,
    briefingDay: s.briefingDay,
    streak: s.streak || 1,
    careerEarnings: s.careerEarnings || 0,
    singularities: s.singularities || 0,
    tokens: s.tokens || 0,
    grants: s.grants || [],
    data: s.data || 0,
    specialties: s.specialties || [],
    upgrades: s.upgrades || {},
    challengesDone: s.challengesDone || [],
    projectsDone: s.projectsDone || [],
    shop: s.shop,
    boostUntil: s.boostUntil || 0,
    lab: s.lab || null,
    dilemmaDeferUntil: s.dilemmaDeferUntil || 0,
    nextDilemmaAt: s.nextDilemmaAt || 0,
    lastDilemma: s.lastDilemma || null,
    nextWindfallAt: s.nextWindfallAt || 0,
    prestiged: !!s.prestiged,
    badgesEarned: s.badgesEarned || [],
    museum: s.museum || [],
    eventsDone: s.eventsDone || [],
    bubble: s.bubble || null,
    nextBubbleAt: s.nextBubbleAt || 0,
    supply: s.supply,
    erasOpened: s.erasOpened || [],
    foreman: !!s.foreman,
    sawPit: !!s.sawPit,
    goalsDone: Array.isArray(s.goalsDone) ? s.goalsDone : [],
    boughtX10: !!s.boughtX10,
    benchOc: s.benchOc !== false,
    restartSeen: !!s.restartSeen,
    tutorial: s.tutorial || null,
    orientation: s.orientation || "auto",
    buyMode: normalizeBuyMode(s.buyMode),
    // While the app is in the background nothing is paid live, so a reload
    // must replay from the moment it was hidden.
    lastSeen: s.hiddenAt || Date.now(),
    researchJob: s.researchJob || null,
    upgradeJob: s.upgradeJob || null,
    projectJob: s.projectJob || null,
    challenge: s.challenge,
    dilemma: s.dilemma,
    businessesBought: Math.floor(s.businessesBought || 0),
    managersHired: Math.floor(s.managersHired || 0),
    prestigeCount: Math.floor(s.prestigeCount || 0),
    playMs: s.playMs || 0,
    runStartedAt: s.runStartedAt || 0,
    bestEra: Math.max(0, Math.floor(s.bestEra || 0)),
    runs: Array.isArray(s.runs) ? s.runs.slice(-40) : [],
    milestones: s.milestones || {},
    lastPlants: s.lastPlants || undefined,
    trackedSince: s.trackedSince || 0,
    trackedFromStart: !!s.trackedFromStart,
    facilities: readFacilities(s.facilities),
    news: readNews(s.news),
    techDone: readTechDone(s.techDone),
    techJob: readTechJob(s.techJob),
    techJob2: readTechJob(s.techJob2),
    biz: s.biz.map((b, i) => ({
      id: BUSINESSES[i].id,
      owned: b.owned,
      manager: b.manager,
      running: b.running,
      progress: b.progress,
      activeMs: b.activeMs,
      commissionUntil: b.commissionUntil || 0,
    })),
  };
}

function loadSave() {
  const data = getSaveData();
  const state = freshState();
  if (!data) {
    applyBriefing(state);
    applyOrientation(state.orientation);
    return { state, offlineReport: null };
  }
  try {
    if (Number.isFinite(data.cash) && data.cash >= 0) state.cash = data.cash;
    if (Number.isFinite(data.lifetime) && data.lifetime >= 0) state.lifetime = data.lifetime;
    if (Number.isFinite(data.investors) && data.investors >= 0) state.investors = Math.floor(data.investors);
    state.streak = Math.min(10000, Math.max(1, Math.floor(num(data.streak, 1))));
    state.briefingDay = data.briefingDay || null;
    applySavedMeta(state, data);
    (Array.isArray(data.biz) ? data.biz : []).forEach((b, i) => {
      if (!state.biz[i] || !b) return;
      const cfg = BUSINESSES[i];
      const owned = Number.isFinite(b.owned) && b.owned > 0 ? Math.floor(b.owned) : 0;
      state.biz[i].owned = owned;
      state.biz[i].manager = !!b.manager;
      const progress = Number.isFinite(b.progress) && b.progress > 0 ? b.progress : 0;
      state.biz[i].progress = Math.min(progress, cfg.cycleMs);
      state.biz[i].running = !!b.running && !state.biz[i].manager && owned > 0;
      state.biz[i].activeMs = Number.isFinite(b.activeMs) && b.activeMs > 0 ? b.activeMs : 0;
      // A start-up timer can't be longer than a real one (a bad clock or an
      // edited code would otherwise lock the row).
      state.biz[i].commissionUntil = Number.isFinite(b.commissionUntil) ? Math.min(b.commissionUntil, Date.now() + COMMISSION_MS) : 0;
    });
    // Parts now open by year and research: keep what was bought fairly, refund
    // the rest (see settleClosedParts).
    const closedRefund = settleClosedParts(state);
    if (closedRefund > 0) state.cash = (state.cash || 0) + closedRefund;
    state.supply = data.supply;
    ensureSupply(state);
    state.erasOpened = Array.isArray(data.erasOpened) ? data.erasOpened : [];
    state.foreman = !!data.foreman;
    state.sawPit = !!data.sawPit;
    state.buyMode = normalizeBuyMode(data.buyMode);
    if (state.businessesBought == null) {
      state.businessesBought = state.biz.reduce((n, row, i) => n + Math.max(0, (row.owned || 0) - (i === 0 ? 1 : 0)), 0);
    }
    if (state.managersHired == null) {
      state.managersHired = state.biz.reduce((n, row) => n + (row.manager ? 1 : 0), 0);
    }
    if (state.prestigeCount == null) state.prestigeCount = state.prestiged ? 1 : 0;
    if (state.playMs == null) state.playMs = state.biz.reduce((n, row) => n + (row.activeMs || 0), 0);
    const storedEra = state.bestEra;
    if (storedEra == null) state.bestEra = Math.max(0, eraReachedIndex(state));
    if (!state.runStartedAt) state.runStartedAt = Date.now();
    // Milestones for "Copy my stats": an older save starts the log now.
    if (!state.milestones || !state.trackedSince) startMilestones(state);
    state.orientation = data.orientation === "portrait" || data.orientation === "landscape" ? data.orientation : "auto";
    state.researchJob = data.researchJob || null;
    state.upgradeJob = data.upgradeJob || null;
    state.projectJob = data.projectJob || null;
    const prior = Number.isFinite(data.meta?.version) ? data.meta.version : 1;
    if (storedEra != null) state.bestEra = remapBestEra(storedEra, prior);
    // A save from before the hardware and era rework (v12): offer a fresh
    // start once. The save keeps working either way.
    state.restartSuggested = prior < 12 && ((state.lifetime || 0) > 0 || (state.investors || 0) > 0);
    if (prior < 3) {
      const held = new Set(state.badgesEarned || []);
      for (const id of legacyBadgeIds(state)) held.add(id);
      state.badgesEarned = [...held];
    }
    if (prior < 11) {
      grantOwnedResearch(state);
      fillResearchGaps(state);
    }
    collectBadges(state);
    if (state.goalsDone == null || prior < 9) {
      state.goalsDone = state.goalsDone || [];
      settleGoals(state, { pay: false, migrate: true });
    }
    const elapsed = Math.min(Math.max(Date.now() - (data.lastSeen || Date.now()), 0), offlineCapMs(state));
    let offlineGain = 0;
    let rows = [];
    if (elapsed > 0) {
      // Managers, plants and R&D earn at OFFLINE_RATE while the app is closed.
      const rate = elapsed < AWAY_GRACE_MS ? 1 : OFFLINE_RATE;
      state.data = (state.data || 0) + dataPerSecond(state) * (elapsed / 1000) * rate;
      ({ gain: offlineGain, rows } = replayAway(state, elapsed, Date.now(), rate));
    }
    if (offlineGain > 0 && elapsed >= AWAY_MODAL_MS) {
      state.offlineReport = { amount: offlineGain, awayMs: elapsed, rows };
    }
    applyBriefing(state);
    finishTimedWork(state, Date.now());
    applyOrientation(state.orientation);
    return { state };
  } catch {
    const fallback = freshState();
    applyBriefing(fallback);
    return { state: fallback, offlineReport: null };
  }
}

function announce(notes) {
  for (const note of notes) {
    if (note.type === "windfall") {
      toast("PATENT WINDFALL!", { description: `A licensing deal pays ${money(note.amount)}.` });
    }
    if (note.type === "speedfail") {
      const spec = CHALLENGES.find((entry) => entry.id === "speed");
      const minutes = spec ? Math.round(spec.limitMs / 60000) : 90;
      toast("Speedrun missed", { description: `${minutes} minutes ran out before ${money(note.goal || (spec ? spec.goal : 3.2e9))}.` });
    }
    if (note.type === "research") toast("Specialty committed", { description: "The other branches wait until the timeline is forked." });
    if (note.type === "upgrade") toast("Upgrade installed", { description: "The line is back up." });
    if (note.type === "projectstart") toast("Project started", { description: "Crews are on site. Give them a moment." });
    if (note.type === "project") toast("Project finished", { description: "The bonus is permanent." });
    if (note.type === "history") {
      if (note.cards.length === 1) toast(`History card: ${note.cards[0].title}`, { description: "Added to the Museum in MORE > MUSEUM." });
      else toast(`${note.cards.length} history cards found`, { description: "Read them in the Museum in MORE > MUSEUM." });
    }
    if (note.type === "bubble") toast("DOT-COM BUBBLE!", { description: "Your web stock is soaring. The banner counts down to the pop." });
    if (note.type === "bubblepop") toast("The bubble popped", { description: "The web stock is worth nothing now. Sell sooner next time." });
  }
}

export function useGame() {
  const stateRef = useRef(null);
  if (!stateRef.current) stateRef.current = freshState();
  const [, force] = useState(0);
  const [buyMode, setBuyModeState] = useState("x1");
  const setBuyMode = useCallback((mode) => {
    const next = normalizeBuyMode(mode);
    if (stateRef.current) stateRef.current.buyMode = next;
    setBuyModeState(next);
  }, []);
  const [ready, setReady] = useState(false);
  const restoredRef = useRef(false);
  const bump = useCallback(() => {
    const s = stateRef.current;
    // Doing the last step finishes the tutorial. There is no extra Done button.
    if (s && tutorialCleared(s)) s.tutorial = { ...s.tutorial, done: true, replay: false };
    if (s) settleGoals(s, { pay: false });
    noteProgress(s);
    force((n) => n + 1);
  }, []);
  const saveNow = useCallback(() => {
    if (!restoredRef.current) return;
    const s = stateRef.current;
    if (s && tutorialCleared(s)) s.tutorial = { ...s.tutorial, done: true, replay: false };
    writeSaveData(pack(s));
  }, []);

  useEffect(() => {
    const { state } = loadSave();
    stateRef.current = state;
    setBuyModeState(normalizeBuyMode(state.buyMode));
    restoredRef.current = true;
    setReady(true);
    void cancelCapNotification();
    bump();
  }, [bump]);

  useEffect(() => {
    let lastWall = Date.now();
    let awayBudget = OFFLINE_CAP_MS;
    const dueTimers = new Map();

    const clearDue = (i) => {
      const entry = dueTimers.get(i);
      if (entry) clearTimeout(entry.id);
      dueTimers.delete(i);
    };

    // Pay from the cycle clock (cycleStart + cycleMs), not from summed ticks.
    // A late timer still pays the laps that already finished, and only once.
    const settleIndex = (i, dt) => {
      const s = stateRef.current;
      if (s.hiddenAt) return false;
      const st = s.biz[i];
      if (!st || st.owned <= 0) return false;
      const wall = Date.now();
      const cycle = effectiveCycleMs(BUSINESSES[i], s);
      if (!(cycle > 0)) return false;
      if (!st.manager && !st.running) {
        if (st.holdUntil && wall >= st.holdUntil) {
          s.biz[i] = { ...st, holdUntil: 0 };
          return true;
        }
        return false;
      }
      let next = st;
      if (!next.cycleStart) {
        const into = Math.min(Math.max(next.progress || 0, 0), Math.max(cycle - 1, 0));
        next = { ...next, cycleStart: wall - into, cycleAt: cycle, paidLaps: 0 };
      } else if (!next.cycleAt || Math.abs(next.cycleAt - cycle) > 0.5) {
        const old = next.cycleAt || cycle;
        const elapsedOld = wall - next.cycleStart;
        const frac = old > 0 ? (elapsedOld % old) / old : 0;
        next = { ...next, cycleStart: wall - frac * cycle, cycleAt: cycle, paidLaps: 0 };
      }
      const elapsed = Math.max(0, wall - next.cycleStart);
      next = { ...next, activeMs: next.activeMs + (dt || 0) };
      let paint = !st.cycleStart;
      if (next.manager) {
        const laps = Math.floor(elapsed / cycle);
        const already = next.paidLaps || 0;
        next.progress = elapsed % cycle;
        if (laps > already) {
          const gain = creditCycles(s, i, laps - already, wall);
          next.paidLaps = laps;
          if (gain > 0) next.lastGain = { id: ++s.gainSeq, amount: gain };
          paint = true;
        }
      } else if (elapsed >= cycle) {
        const gain = creditCycles(s, i, 1, wall);
        playCollect();
        next = {
          ...next,
          running: false,
          progress: 0,
          cycleStart: 0,
          paidLaps: 0,
          holdUntil: wall + 120,
        };
        if (gain > 0) next.lastGain = { id: ++s.gainSeq, amount: gain };
        paint = true;
      } else {
        next.progress = elapsed;
        paint = !st.cycleStart;
      }
      if (next !== st) s.biz[i] = next;
      return paint;
    };

    const armDue = (i) => {
      const st = stateRef.current.biz[i];
      if (!st?.cycleStart || !(st.manager || st.running)) {
        clearDue(i);
        return;
      }
      const cycle = effectiveCycleMs(BUSINESSES[i], stateRef.current);
      if (!(cycle > 0)) return;
      const key = `${st.cycleStart}:${Math.round(cycle)}`;
      const existing = dueTimers.get(i);
      if (existing?.key === key) return;
      clearDue(i);
      const elapsed = Math.max(0, Date.now() - st.cycleStart);
      const into = st.manager ? elapsed % cycle : elapsed;
      const remain = Math.max(0, cycle - into);
      const token = st.cycleStart;
      const id = setTimeout(() => {
        dueTimers.delete(i);
        requestAnimationFrame(() => {
          const live = stateRef.current.biz[i];
          if (!live || live.cycleStart !== token) return;
          if (settleIndex(i, 0)) bump();
          armDue(i);
        });
      }, remain);
      dueTimers.set(i, { key, id });
    };

    // In the background the game stops paying live. Coming back pays the
    // time away like a closed app: at OFFLINE_RATE (full for a quick look),
    // up to the 24 hour cap, with the welcome-back report for long absences.
    const onVisibility = () => {
      const s = stateRef.current;
      if (isPageHidden()) {
        if (!s.hiddenAt) s.hiddenAt = Date.now();
        void scheduleCapNotification(s);
        return;
      }
      void cancelCapNotification();
      if (!s.hiddenAt) return;
      const now = Date.now();
      const away = Math.min(Math.max(0, now - s.hiddenAt), offlineCapMs(s));
      s.hiddenAt = 0;
      // Start every row's clock from where the replay leaves it.
      s.biz = s.biz.map((st) => {
        if (!st.manager || !st.cycleStart) return st;
        const cycle = st.cycleAt || effectiveCycleMs(BUSINESSES[s.biz.indexOf(st)], s);
        const into = cycle > 0 ? Math.max(0, now - away - st.cycleStart) % cycle : 0;
        return { ...st, progress: into, cycleStart: 0, paidLaps: 0 };
      });
      if (away > 0) {
        const rate = away < AWAY_GRACE_MS ? 1 : OFFLINE_RATE;
        s.data = (s.data || 0) + dataPerSecond(s) * (away / 1000) * rate;
        const { gain, rows } = replayAway(s, away, now, rate);
        if (gain > 0 && away >= AWAY_MODAL_MS) s.offlineReport = { amount: gain, awayMs: away, rows };
      }
      lastWall = now;
      awayBudget = OFFLINE_CAP_MS;
      bump();
    };
    let lastRender = 0;
    let iv = 0;
    const stopTick = () => {
      if (iv) clearInterval(iv);
      iv = 0;
      dueTimers.forEach((entry) => clearTimeout(entry.id));
      dueTimers.clear();
    };
    const tick = () => {
      const wall = Date.now();
      if (stateRef.current.hiddenAt) return;
      collectBadges(stateRef.current);
      const raw = Math.max(0, wall - lastWall);
      lastWall = wall;
      const slice = cappedTick(raw, isPageHidden(), awayBudget);
      awayBudget = slice.budget;
      const dt = slice.dt;
      if (!(dt > 0)) return;
      const s = stateRef.current;
      let dirty = false;
      s.biz.forEach((st, i) => {
        if (st.owned <= 0) return;
        if ((st.commissionUntil || 0) > wall && !st.manager && !st.running) {
          dirty = true;
          return;
        }
        if (settleIndex(i, dt)) dirty = true;
        armDue(i);
      });
      s.data = (s.data || 0) + dataPerSecond(s) * (dt / 1000);
      const business = businessIncomePerSecond(s, wall);
      const plant = facilityReport(s, business).perSecond * (dt / 1000);
      if (plant > 0) creditAmount(s, plant, wall);
      if (noteFacilityNews(s, business)) dirty = true;
      const researchMoved = advanceResearch(s, dt);
      if (researchMoved === "done") dirty = true;
      if (!s.runStartedAt) s.runStartedAt = wall;
      s.playMs = (s.playMs || 0) + dt;
      if (noteMilestones(s, wall)) dirty = true;
      if (autoBuyUpgrade(s, wall)) dirty = true;
      const notes = tickDilemma(s, wall).concat(finishTimedWork(s, wall), tickBubble(s, wall));
      const cards = collectHistory(s);
      if (cards.length) notes.push({ type: "history", cards });
      if (notes.length) {
        announce(notes);
        dirty = true;
      }
      const pending = s.researchJob || s.upgradeJob || s.projectJob || s.biz.some((row) => (row.commissionUntil || 0) > wall || (row.holdUntil || 0) > wall);
      if (pending) dirty = true;
      const passive = plant > 0 || researchMoved === "gain";
      // Payouts and finished work paint on the short cadence. A plant or
      // research counter that is merely counting paints about once a second.
      if (dirty && wall - lastRender >= RENDER_MS) {
        lastRender = wall;
        bump();
      } else if (!dirty && passive && wall - lastRender >= DISPLAY_MS) {
        lastRender = wall;
        bump();
      }
    };
    const startTick = () => {
      if (iv) return;
      lastWall = Date.now();
      iv = setInterval(tick, TICK_MS);
    };
    const hideWork = () => {
      document.documentElement.dataset.paused = "1";
      stopTick();
    };
    const showWork = () => {
      delete document.documentElement.dataset.paused;
      startTick();
      stateRef.current.biz.forEach((_, i) => armDue(i));
    };
    const onVisibilityWrapped = () => {
      if (isPageHidden()) {
        onVisibility();
        hideWork();
        return;
      }
      onVisibility();
      showWork();
    };
    document.addEventListener("visibilitychange", onVisibilityWrapped);
    if (isPageHidden()) onVisibilityWrapped();
    else startTick();
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityWrapped);
      delete document.documentElement.dataset.paused;
      stopTick();
    };
  }, [bump]);

  useEffect(() => {
    const save = () => {
      const s = stateRef.current;
      if (!restoredRef.current) return;
      writeSaveData(pack(s));
    };
    const iv = setInterval(save, SAVE_INTERVAL_MS);
    const onHide = () => {
      if (isPageHidden()) save();
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      save();
      clearInterval(iv);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  const buy = useCallback(
    (i) => {
      const s = stateRef.current;
      if (!canBuyIndex(s, i)) return;
      const cfg = BUSINESSES[i];
      const st = s.biz[i];
      const count = Math.floor(buyCount(buyMode, cfg, st.owned, s.cash));
      if (!Number.isFinite(count) || count < 1 || count > MAX_BUY) return;
      const cost = costOf(cfg, st.owned, count);
      if (!Number.isFinite(s.cash) || !Number.isFinite(cost) || !(s.cash >= cost)) return;
      // Only a buy made while BUY X10 is the goal on screen. Cycling the button
      // during the tutorial, or buying X10 earlier, does not skip that goal.
      if (normalizeBuyMode(buyMode) === "x10" && currentGoal(s)?.id === "x10") s.boughtX10 = true;
      const before = st.owned;
      s.cash -= cost;
      const now = Date.now();
      s.biz = s.biz.map((b, j) => (j === i ? {
        ...b,
        owned: b.owned + count,
        commissionUntil: before === 0 ? now + COMMISSION_MS : b.commissionUntil,
      } : b));
      notePurchase(s, i, before, before + count);
      s.businessesBought = (s.businessesBought || 0) + count;
      const reachedEra = eraReachedIndex(s);
      if (reachedEra > (s.bestEra || 0)) s.bestEra = reachedEra;
      playBuy();
      // Celebrate each milestone this purchase reached.
      const reached = MILESTONES.filter((ms) => before < ms.owned && before + count >= ms.owned);
      if (reached.length) buzzStrong();
      else buzzLight();
      if (reached.length) {
        const what = reached.map((ms) => (ms.speed ? `${ms.speed}× speed` : `${ms.mult}× pay`)).join(", ");
        toast(`${cfg.name}: ${reached[reached.length - 1].owned} owned!`, { description: `${what} · +${2 * reached.length} era tokens` });
        s.biz[i] = { ...s.biz[i], milestoneAt: now };
      }
      const beforeGen = generationAt(cfg.id, before, s.techDone);
      const afterGen = generationAt(cfg.id, before + count, s.techDone);
      if (afterGen && afterGen.id !== beforeGen?.id && before > 0) {
        toast(afterGen.name, { description: `${afterGen.year}. ${afterGen.tagline}` });
      }
      const goalPay = settleGoals(s, { pay: true });
      if (goalPay.reward > 0) toast("Goal complete", { description: `+${money(goalPay.reward)} cash` });
      saveNow();
      bump();
    },
    [buyMode, bump]
  );

  const hire = useCallback(
    (i) => {
      const s = stateRef.current;
      if (!canHireIndex(s, i)) return;
      if ((s.biz[i].commissionUntil || 0) > Date.now()) return;
      const price = managerPrice(s, i);
      s.cash -= price;
      if (s.shop?.freeManager) s.shop = { ...s.shop, freeManager: false };
      const started = Date.now();
      const cycle = effectiveCycleMs(BUSINESSES[i], s);
      s.biz = s.biz.map((b, j) => (j === i ? { ...b, manager: true, running: true, progress: 0, cycleStart: started, cycleAt: cycle, paidLaps: 0, holdUntil: 0 } : b));
      s.managersHired = (s.managersHired || 0) + 1;
      const goalPay = settleGoals(s, { pay: true });
      if (goalPay.reward > 0) toast("Goal complete", { description: `+${money(goalPay.reward)} cash` });
      buzzLight();
      saveNow();
      bump();
    },
    [bump]
  );

  const run = useCallback(
    (i) => {
      const s = stateRef.current;
      const st = s.biz[i];
      if ((st.commissionUntil || 0) > Date.now()) return;
      if (st.owned > 0 && !st.manager && st.running) {
        s.biz = s.biz.map((b, j) => (j === i ? { ...b, shake: (b.shake || 0) + 1 } : b));
        bump();
        return;
      }
      if (st.owned > 0 && !st.manager && !st.running) {
        s.sawPit = true;
        const goalPay = settleGoals(s, { pay: true });
        if (goalPay.reward > 0) toast("Goal complete", { description: `+${money(goalPay.reward)} cash` });
        const started = Date.now();
        const cycle = effectiveCycleMs(BUSINESSES[i], s);
        s.biz = s.biz.map((b, j) => (j === i ? { ...b, running: true, progress: 0, cycleStart: started, cycleAt: cycle, paidLaps: 0, holdUntil: 0 } : b));
        saveNow();
        bump();
      }
    },
    [bump, saveNow]
  );

  const runAll = useCallback(() => {
    const s = stateRef.current;
    if (!s.foreman) return;
    const now = Date.now();
    let any = false;
    s.biz = s.biz.map((b, j) => {
      if (b.owned > 0 && !b.manager && !b.running && !((b.commissionUntil || 0) > now)) {
        any = true;
        return { ...b, running: true, progress: 0, cycleStart: now, cycleAt: effectiveCycleMs(BUSINESSES[j], s), paidLaps: 0, holdUntil: 0 };
      }
      return b;
    });
    if (any) {
      s.sawPit = true;
      const goalPay = settleGoals(s, { pay: true });
      if (goalPay.reward > 0) toast("Goal complete", { description: `+${money(goalPay.reward)} cash` });
      saveNow();
      bump();
    }
  }, [bump, saveNow]);

  const buyForeman = useCallback(() => {
    const s = stateRef.current;
    if (s.foreman) return;
    if (!(s.cash >= FOREMAN_COST) || !Number.isFinite(s.cash)) return;
    s.cash -= FOREMAN_COST;
    s.foreman = true;
    playBuy();
    saveNow();
    bump();
  }, [bump]);

  const purchaseUpgrade = useCallback(
    (index, kind) => {
      if (!buyUpgrade(stateRef.current, index, kind)) return;
      playBuy();
      saveNow();
      bump();
    },
    [bump]
  );

  const purchaseShop = useCallback(
    (id) => {
      const result = buyShopItem(stateRef.current, id, Date.now());
      if (!result.ok) return result;
      if (result.detail) toast(result.detail);
      saveNow();
      bump();
      return result;
    },
    [bump]
  );

  const runLabProject = useCallback(
    (id) => {
      const result = buyLabProject(stateRef.current, id, Date.now());
      if (!result.ok) return result;
      if (result.detail) toast(result.detail);
      saveNow();
      bump();
      return result;
    },
    [bump]
  );

  const chooseSpecialty = useCallback(
    (id) => {
      if (!beginResearch(stateRef.current, id, Date.now())) return;
      toast("Researching", { description: "The lab needs 20 seconds to finish." });
      saveNow();
      bump();
    },
    [bump]
  );

  // Leave the current challenge: no reward, and you keep playing this run as
  // a normal run.
  const abandonChallenge = useCallback(() => {
    const s = stateRef.current;
    const spec = CHALLENGES.find((entry) => entry.id === s.challenge?.id);
    if (!spec) return;
    if (!window.confirm(`Abandon the ${spec.name} challenge?\n\nYou won't get its reward this time. You keep playing this run as a normal run, and you can try the challenge again later.`)) return;
    failChallenge(s);
    s.modStamp = (s.modStamp || 0) + 1;
    saveNow();
    bump();
    toast("Challenge abandoned", { description: "This run carries on as a normal run." });
  }, [bump, saveNow]);

  const startChallenge = useCallback((id) => {
    const s = stateRef.current;
    if (s.challenge) return;
    // Challenges open after the first prestige.
    if (!s.prestiged) return;
    if ((s.challengesDone || []).includes(id)) return;
    const label = id === "glass" ? "Glass Ceiling" : id === "noboss" ? "No Bosses" : "Speedrun";
    if (!window.confirm(`Start the ${label} challenge?\n\nYou lose this run's cash, businesses, managers, upgrades and facility parts.\nYou keep investors, research, tokens and badges.`)) return;
    pushRun(s, { investorsGained: 0 });
    const meta = snapshotMeta(s, { resetRunUpgrades: true });
    const next = freshState();
    Object.assign(next, meta);
    next.biz = freshBiz(id === "glass" ? "glass" : undefined);
    next.cash = 0;
    next.lifetime = 0;
    const spec = CHALLENGES.find((entry) => entry.id === id);
    next.challenge = { id, startedAt: Date.now(), earnings: 0, goal: scaledChallengeGoal(spec, next) };
    next.dilemma = null;
    stateRef.current = next;
    saveNow();
    bump();
  }, [bump, saveNow]);

  const chooseDilemma = useCallback(
    (choice) => {
      const result = resolveDilemma(stateRef.current, choice, Date.now());
      if (!result) return;
      if (result.type === "choice") toast(result.title, { description: `${result.summary}.` });
      if (result.type === "defer") toast("Deferred", { description: "The board will ask again in 5 minutes." });
      saveNow();
      bump();
    },
    [bump]
  );

  const cashOut = useCallback(() => {
    const result = cashOutBubble(stateRef.current, Date.now());
    if (!result) return;
    playCollect();
    toast("Sold at the top", { description: `Your web stock paid ${money(result.amount)}.` });
    saveNow();
    bump();
  }, [bump, saveNow]);

  const dismissPrestigeReport = useCallback(() => {
    const s = stateRef.current;
    if (!s.prestigeReport) return;
    s.prestigeReport = null;
    bump();
  }, [bump]);

  const dismissOffline = useCallback(() => {
    const s = stateRef.current;
    if (!s.offlineReport) return;
    s.offlineReport = null;
    playCollect();
    bump();
  }, [bump]);

  // Tutorial: a manual step's button, skipping, and replaying from Help.
  const tutorialNext = useCallback((id) => {
    const s = stateRef.current;
    const t = s.tutorial || blankTutorial();
    if (!TUTORIAL_STEPS.some((step) => step.id === id) || t.seen.includes(id)) return;
    const seen = [...t.seen, id];
    const finished = id === TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1].id;
    s.tutorial = { ...t, seen, done: finished || t.done, replay: finished ? false : t.replay };
    saveNow();
    bump();
  }, [bump, saveNow]);

  const tutorialSkip = useCallback(() => {
    const s = stateRef.current;
    s.tutorial = { ...(s.tutorial || blankTutorial()), skipped: true, replay: false };
    saveNow();
    bump();
  }, [bump, saveNow]);

  const tutorialReplay = useCallback(() => {
    const s = stateRef.current;
    const t = s.tutorial || blankTutorial();
    s.tutorial = { ...blankTutorial(), replay: true, tips: [...(t.tips || [])], tipsOff: !!t.tipsOff };
    saveNow();
    bump();
  }, [bump, saveNow]);

  // One-time tips: mark one seen, turn them all off, or bring them back.
  const tipSeen = useCallback((id) => {
    const s = stateRef.current;
    const t = s.tutorial || blankTutorial();
    if ((t.tips || []).includes(id)) return;
    s.tutorial = { ...t, tips: [...(t.tips || []), id] };
    saveNow();
    bump();
  }, [bump, saveNow]);

  const setAutoUpgrades = useCallback((on) => {
    const s = stateRef.current;
    s.autoUpgrades = !!on;
    saveNow();
    bump();
  }, [bump, saveNow]);

  const setTipsOff = useCallback((off) => {
    const s = stateRef.current;
    const t = s.tutorial || blankTutorial();
    // Turning tips back on shows them all again from the start.
    s.tutorial = { ...t, tipsOff: !!off, tips: off ? [...(t.tips || [])] : [] };
    saveNow();
    bump();
  }, [bump, saveNow]);

  const prestige = useCallback(() => {
    const s = stateRef.current;
    if (s.challenge) return;
    const gained = investorsFor(s.lifetime);
    if (!Number.isFinite(gained) || gained < 1) return;
    const nextInvestors = s.investors + gained;
    if (!Number.isFinite(nextInvestors) || nextInvestors < 0) return;
    const noun = gained === 1 ? "investor" : "investors";
    const now = Date.now();
    const incomeNow = empireFactors(s, now).total;
    const after = empireFactors({ ...s, investors: nextInvestors }, now).total;
    const have = s.investors || 0;
    const doubles = gained >= Math.max(1, have);
    const lines = [
      `Prestige and start over with ${gained} new ${noun}?`,
      "",
      `Investors: ${have} now → ${nextInvestors} after.`,
      `Income: ×${incomeNow.toFixed(2)} now → ×${after.toFixed(2)} after.`,
    ];
    if (!doubles && have > 0) {
      lines.push("", "This is less than double your investors. Most players wait until a prestige at least doubles them.");
    }
    lines.push("", "You lose your cash, businesses, managers, upgrades and facility parts.", "You keep your investors (each one boosts all income forever), research, tokens and badges.");
    if (!window.confirm(lines.join("\n"))) return;
    buzzStrong();
    pushRun(s, { investorsGained: gained });
    s.prestigeCount = (s.prestigeCount || 0) + 1;
    const meta = snapshotMeta(s, { resetRunUpgrades: true });
    const next = freshState();
    Object.assign(next, meta);
    const firstTime = !s.prestiged;
    const incomeBefore = empireFactors(s, Date.now()).total;
    next.investors = nextInvestors;
    next.investorPeak = Math.max(investorPeak(s), nextInvestors);
    next.biz = startingBiz(next, freshBiz(), s.biz);
    next.cash = 0;
    next.lifetime = 0;
    next.prestiged = true;
    next.dilemma = null;
    next.challenge = null;
    // The first prestige gets a screen that shows what changed.
    if (firstTime) {
      next.prestigeReport = {
        gained,
        investors: nextInvestors,
        incomeBefore,
        incomeAfter: empireFactors(next, Date.now()).total,
        unlocked: INVESTOR_MILESTONES.filter((ms) => investorPeak(s) < ms.at && next.investorPeak >= ms.at).map((ms) => ({ title: ms.title, text: ms.text })),
        nextUnlock: nextInvestorMilestone(next),
      };
    }
    stateRef.current = next;
    saveNow();
    bump();
    toast(`${gained} ${noun} joined!`, { description: "Everything now earns more. Rebuild faster than before." });
    // Investor milestones reached by this prestige.
    for (const ms of INVESTOR_MILESTONES) {
      if (investorPeak(s) < ms.at && next.investorPeak >= ms.at) toast(`Unlocked: ${ms.title}`, { description: ms.text });
    }
  }, [bump]);

  const forkTimeline = useCallback(() => {
    const s = stateRef.current;
    if (s.challenge) return;
    const bill = forkCost(s.singularities || 0);
    if ((s.investors || 0) < bill) return;
    if (singularityMult((s.singularities || 0) + 1) <= singularityMult(s.singularities || 0)) return;
    if (!window.confirm(`Fork the timeline?\n\nThis spends ${bill} investors and starts your run over (cash, businesses, managers, upgrades and facility parts).\nYou get: income x${singularityMult((s.singularities || 0) + 1).toFixed(1)} forever (now x${singularityMult(s.singularities || 0).toFixed(1)}) and another research slot.\nYou keep: your other investors, research, tokens and badges.`)) return;
    pushRun(s, { investorsGained: 0 });
    const meta = snapshotMeta(s, { resetRunUpgrades: true });
    const next = freshState();
    Object.assign(next, meta);
    next.investors = Math.max(0, (s.investors || 0) - bill);
    next.biz = startingBiz(next, freshBiz(), s.biz);
    next.cash = 0;
    next.lifetime = 0;
    next.singularities = (s.singularities || 0) + 1;
    next.dilemma = null;
    next.challenge = null;
    stateRef.current = next;
    saveNow();
    bump();
    toast("Timeline forked", { description: `Income x${singularityMult(next.singularities).toFixed(1)} forever. Another research slot is open.` });
  }, [bump]);

  const reset = useCallback(() => {
    clearSaveData();
    const next = freshState();
    applyBriefing(next);
    stateRef.current = next;
    bump();
  }, [bump]);

  // Backup code for the current empire. Saves first so the code is up to date.
  const exportSave = useCallback(async () => {
    const packed = pack(stateRef.current);
    writeSaveData(packed);
    return encodeSave(packed);
  }, []);

  // Replace the whole empire with a save from a backup code (already decoded
  // and checked by decodeSave). The normal loader runs on it, so it is cleaned
  // the same way as any save, and away time since the backup is paid as usual.
  const importSave = useCallback(
    (data) => {
      if (!data || typeof data !== "object") return false;
      writeSaveData(data);
      const { state } = loadSave();
      stateRef.current = state;
      saveNow();
      bump();
      return true;
    },
    [bump, saveNow]
  );

  const touchBriefing = useCallback(() => {
    if (applyBriefing(stateRef.current)) bump();
  }, [bump]);

  return {
    ready,
    state: stateRef.current,
    buyMode,
    setBuyMode,
    buy,
    hire,
    run,
    runAll,
    buyForeman,
    startTech: (id) => {
      const started = startResearch(stateRef.current, id);
      if (!started.ok) return;
      saveNow();
      bump();
    },
    dismissRestart: () => {
      const s = stateRef.current;
      s.restartSeen = true;
      s.restartSuggested = false;
      saveNow();
      bump();
    },
    toggleBenchOc: () => {
      const s = stateRef.current;
      s.benchOc = s.benchOc === false;
      saveNow();
      bump();
    },
    rebuildFacilities: () => {
      const s = stateRef.current;
      const now = Date.now();
      const done = rebuildPlants(s, { maxCost: Math.max(0, incomePerSecond(s, now)) * REBUILD_SECONDS, businessPerSecond: businessIncomePerSecond(s, now) });
      if (done.bought > 0) {
        noteFacilityNews(stateRef.current, businessIncomePerSecond(stateRef.current, Date.now()));
        buzzLight();
        playBuy();
        saveNow();
        bump();
      }
      return done;
    },
    buyFacilityPart: (facilityId, partId) => {
      const bought = purchasePart(stateRef.current, facilityId, partId);
      if (!bought.ok) return bought;
      noteFacilityNews(stateRef.current, businessIncomePerSecond(stateRef.current, Date.now()));
      buzzLight();
      playBuy();
      saveNow();
      bump();
      return bought;
    },
    setOrientation: (orientation) => {
      const s = stateRef.current;
      if (orientation !== "auto" && orientation !== "portrait" && orientation !== "landscape") return;
      s.orientation = orientation;
      applyOrientation(orientation);
      saveNow();
      bump();
    },
    prestige,
    reset,
    dismissOffline,
    purchaseUpgrade,
    purchaseShop,
    chooseSpecialty,
    runLabProject,
    startChallenge,
    abandonChallenge,
    dismissPrestigeReport,
    chooseDilemma,
    cashOut,
    forkTimeline,
    touchBriefing,
    exportSave,
    importSave,
    tutorialNext,
    tutorialSkip,
    tutorialReplay,
    tipSeen,
    setTipsOff,
    setAutoUpgrades,
  };
}
