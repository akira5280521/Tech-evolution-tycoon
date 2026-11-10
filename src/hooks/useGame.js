import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { applyBriefing } from "@/lib/briefing";
import {
  AWAY_MODAL_MS,
  BUSINESSES,
  COMMISSION_MS,
  FOREMAN_COST,
  MAX_BUY,
  OFFLINE_CAP_MS,
  buyCount,
  cappedTick,
  costOf,
  investorsFor,
  money,
} from "@/lib/gameConfig";
import {
  CHALLENGES,
  scaledChallengeGoal,
  beginResearch,
  blankMeta,
  collectBadges,
  legacyBadgeIds,
  buyShopItem,
  buyUpgrade,
  canBuyIndex,
  canHireIndex,
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
  maxBuyCount,
  singularityMult,
  snapshotMeta,
  tickDilemma,
} from "@/lib/empire";
import { cashOutBubble, cleanBubble, tickBubble } from "@/lib/bubble";
import { HISTORY_CARDS, collectHistory } from "@/lib/history";
import { applyOrientation } from "@/lib/orientation";
import { SAVE_VERSION, clearSaveData, getSaveData, writeSaveData } from "@/lib/gameSave";
import { encodeSave } from "@/lib/saveCode";
import { isPageHidden } from "@/lib/pageVisibility";
import { playBuy, playCollect } from "@/lib/sfx";

const SAVE_INTERVAL_MS = 5000;
// 24 hours / 720 = 2 minute slices at the cap; shorter absences slice finer.
const OFFLINE_SLICES = 720;

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
  state.challengesDone = Array.isArray(m.challengesDone) ? m.challengesDone.filter((id) => typeof id === "string") : [];
  state.projectsDone = Array.isArray(m.projectsDone) ? m.projectsDone.filter((id) => typeof id === "string") : [];
  const shop = m.shop && typeof m.shop === "object" ? m.shop : {};
  state.shop = {
    freeManager: !!shop.freeManager,
    cashBuys: Math.floor(num(shop.cashBuys)),
    samples: Math.floor(num(shop.samples)),
    crateDay: typeof shop.crateDay === "string" ? shop.crateDay : null,
  };
  state.boostUntil = num(m.boostUntil);
  state.dilemmaDeferUntil = num(m.dilemmaDeferUntil);
  state.nextDilemmaAt = num(m.nextDilemmaAt);
  state.lastDilemma = typeof m.lastDilemma === "string" ? m.lastDilemma : null;
  state.nextWindfallAt = num(m.nextWindfallAt);
  state.prestiged = !!m.prestiged;
  state.badgesEarned = Array.isArray(m.badgesEarned) ? m.badgesEarned.filter((id) => typeof id === "string") : [];
  state.museum = Array.isArray(m.museum) ? m.museum.filter((id) => HISTORY_CARDS.some((c) => c.id === id)) : [];
  state.bubble = cleanBubble(m.bubble);
  state.nextBubbleAt = num(m.nextBubbleAt);
  state.modStamp = 1;
  const orient = raw?.orientation;
  state.orientation = orient === "portrait" || orient === "landscape" || orient === "auto" ? orient : "auto";
  state.challenge = readChallenge(m.challenge);
  state.dilemma =
    m.dilemma && Number(m.dilemma.expiresAt) > Date.now()
      ? { id: DILEMMAS.some((d) => d.id === m.dilemma.id) ? m.dilemma.id : "grant", expiresAt: Number(m.dilemma.expiresAt) }
      : null;
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
    lastSeen: Date.now(),
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
    dilemmaDeferUntil: s.dilemmaDeferUntil || 0,
    nextDilemmaAt: s.nextDilemmaAt || 0,
    lastDilemma: s.lastDilemma || null,
    nextWindfallAt: s.nextWindfallAt || 0,
    prestiged: !!s.prestiged,
    badgesEarned: s.badgesEarned || [],
    museum: s.museum || [],
    bubble: s.bubble || null,
    nextBubbleAt: s.nextBubbleAt || 0,
    supply: s.supply,
    foreman: !!s.foreman,
    sawPit: !!s.sawPit,
    orientation: s.orientation || "auto",
    researchJob: s.researchJob || null,
    upgradeJob: s.upgradeJob || null,
    projectJob: s.projectJob || null,
    challenge: s.challenge,
    dilemma: s.dilemma,
    biz: s.biz.map((b) => ({
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
    state.streak = data.streak || 1;
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
      state.biz[i].commissionUntil = Number.isFinite(b.commissionUntil) ? b.commissionUntil : 0;
    });
    state.supply = data.supply;
    ensureSupply(state);
    state.foreman = !!data.foreman;
    state.sawPit = !!data.sawPit;
    state.orientation = data.orientation === "portrait" || data.orientation === "landscape" ? data.orientation : "auto";
    state.researchJob = data.researchJob || null;
    state.upgradeJob = data.upgradeJob || null;
    state.projectJob = data.projectJob || null;
    const prior = Number.isFinite(data.meta?.version) ? data.meta.version : 1;
    if (prior < 3) {
      const held = new Set(state.badgesEarned || []);
      for (const id of legacyBadgeIds(state)) held.add(id);
      state.badgesEarned = [...held];
    }
    collectBadges(state);
    const elapsed = Math.min(Math.max(Date.now() - (data.lastSeen || Date.now()), 0), OFFLINE_CAP_MS);
    let offlineGain = 0;
    const rows = [];
    const now = Date.now();
    if (elapsed > 0) {
      state.data = (state.data || 0) + dataPerSecond(state) * (elapsed / 1000);
      // Replay the absence in slices so supply drains as it is used, the boost
      // only covers the slices it overlapped, and timed challenges see the
      // real moment each payout happened.
      const start = now - elapsed;
      const step = elapsed / OFFLINE_SLICES;
      const gains = new Array(BUSINESSES.length).fill(0);
      for (let k = 0; k < OFFLINE_SLICES; k++) {
        const mid = start + step * (k + 0.5);
        // Resolve an upgrade or project at the moment it finished, so the
        // rest of the absence pays at the new rate. The whole loop is still
        // bounded by the 24 hour cap applied above.
        finishTimedWork(state, mid);
        state.biz.forEach((st, i) => {
          if (!st.manager || st.owned <= 0) return;
          const cycle = effectiveCycleMs(BUSINESSES[i], state);
          if (!(cycle > 0)) return;
          st.activeMs += step;
          st.progress += step;
          const cycles = Math.floor(st.progress / cycle);
          if (cycles <= 0) return;
          st.progress = Math.max(0, st.progress - cycles * cycle);
          gains[i] += creditCycles(state, i, cycles, mid);
        });
      }
      gains.forEach((amount, i) => {
        if (amount > 0) {
          offlineGain += amount;
          rows.push({ name: BUSINESSES[i].name, amount });
        }
      });
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
      if (note.cards.length === 1) toast(`History card: ${note.cards[0].title}`, { description: "Added to the Museum on the Badges tab." });
      else toast(`${note.cards.length} history cards found`, { description: "Read them in the Museum on the Badges tab." });
    }
    if (note.type === "bubble") toast("DOT-COM BUBBLE!", { description: "Your web stock is soaring. The banner counts down to the pop." });
    if (note.type === "bubblepop") toast("The bubble popped", { description: "The web stock is worth nothing now. Sell sooner next time." });
  }
}

export function useGame() {
  const stateRef = useRef(null);
  if (!stateRef.current) stateRef.current = freshState();
  const [, force] = useState(0);
  const [buyMode, setBuyMode] = useState("x1");
  const restoredRef = useRef(false);
  const bump = useCallback(() => force((n) => n + 1), []);
  const saveNow = useCallback(() => {
    if (!restoredRef.current) return;
    writeSaveData(pack(stateRef.current));
  }, []);

  useEffect(() => {
    const { state } = loadSave();
    stateRef.current = state;
    restoredRef.current = true;
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
      if (next.manager) {
        const laps = Math.floor(elapsed / cycle);
        const already = next.paidLaps || 0;
        next.progress = elapsed % cycle;
        if (laps > already) {
          const gain = creditCycles(s, i, laps - already, wall);
          next.paidLaps = laps;
          if (gain > 0) next.lastGain = { id: ++s.gainSeq, amount: gain };
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
      } else {
        next.progress = elapsed;
      }
      s.biz[i] = next;
      return next !== st;
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

    const iv = setInterval(() => {
      const wall = Date.now();
      collectBadges(stateRef.current);
      const raw = Math.max(0, wall - lastWall);
      lastWall = wall;
      const tick = cappedTick(raw, isPageHidden(), awayBudget);
      awayBudget = tick.budget;
      const dt = tick.dt;
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
      const notes = tickDilemma(s, wall).concat(finishTimedWork(s, wall), tickBubble(s, wall));
      const cards = collectHistory(s);
      if (cards.length) notes.push({ type: "history", cards });
      if (notes.length) {
        announce(notes);
        dirty = true;
      }
      const pending = s.researchJob || s.upgradeJob || s.projectJob || s.biz.some((row) => (row.commissionUntil || 0) > wall || (row.holdUntil || 0) > wall);
      if (pending) dirty = true;
      if (dirty) bump();
    }, 100);
    return () => {
      clearInterval(iv);
      dueTimers.forEach((entry) => clearTimeout(entry.id));
      dueTimers.clear();
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
      const count = Math.floor(buyCount(buyMode, cfg, st.owned, s.cash, maxBuyCount(st.owned, i)));
      if (!Number.isFinite(count) || count < 1 || count > MAX_BUY) return;
      const cost = costOf(cfg, st.owned, count);
      if (!Number.isFinite(s.cash) || !Number.isFinite(cost) || !(s.cash >= cost)) return;
      const before = st.owned;
      s.cash -= cost;
      const now = Date.now();
      s.biz = s.biz.map((b, j) => (j === i ? {
        ...b,
        owned: b.owned + count,
        commissionUntil: before === 0 ? now + COMMISSION_MS : b.commissionUntil,
      } : b));
      notePurchase(s, i, before, before + count);
      playBuy();
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
        const started = Date.now();
        const cycle = effectiveCycleMs(BUSINESSES[i], s);
        s.biz = s.biz.map((b, j) => (j === i ? { ...b, running: true, progress: 0, cycleStart: started, cycleAt: cycle, paidLaps: 0, holdUntil: 0 } : b));
        bump();
      }
    },
    [bump]
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
      bump();
    }
  }, [bump]);

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

  const chooseSpecialty = useCallback(
    (id) => {
      if (!beginResearch(stateRef.current, id, Date.now())) return;
      toast("Calibrating", { description: "The lab needs 20 seconds on this branch." });
      saveNow();
      bump();
    },
    [bump]
  );

  const startChallenge = useCallback((id) => {
    const s = stateRef.current;
    if (s.challenge) return;
    if ((s.challengesDone || []).includes(id)) return;
    const label = id === "glass" ? "Glass Ceiling" : id === "noboss" ? "No Bosses" : "Speedrun";
    if (!window.confirm(`Start ${label}? This run's cash, machines and cash upgrades reset. Investors, research and singularity stay.`)) return;
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

  const dismissOffline = useCallback(() => {
    const s = stateRef.current;
    if (!s.offlineReport) return;
    s.offlineReport = null;
    playCollect();
    bump();
  }, [bump]);

  const prestige = useCallback(() => {
    const s = stateRef.current;
    if (s.challenge) return;
    const gained = investorsFor(s.lifetime);
    if (!Number.isFinite(gained) || gained < 1) return;
    const nextInvestors = s.investors + gained;
    if (!Number.isFinite(nextInvestors) || nextInvestors < 0) return;
    const noun = gained === 1 ? "investor" : "investors";
    if (!window.confirm(`Reset your empire to recruit ${gained} ${noun}? Cash upgrades are bought again next run. Investors, research and singularity stay.`)) return;
    const meta = snapshotMeta(s, { resetRunUpgrades: true });
    const next = freshState();
    Object.assign(next, meta);
    next.biz = freshBiz();
    next.cash = 0;
    next.lifetime = 0;
    next.investors = nextInvestors;
    next.prestiged = true;
    next.dilemma = null;
    next.challenge = null;
    stateRef.current = next;
    saveNow();
    bump();
    toast(`${gained} ${noun} joined!`, { description: "Investors stayed. Cash upgrades reset with the machines." });
  }, [bump]);

  const forkTimeline = useCallback(() => {
    const s = stateRef.current;
    if (s.challenge) return;
    const bill = forkCost(s.singularities || 0);
    if ((s.investors || 0) < bill) return;
    if (singularityMult((s.singularities || 0) + 1) <= singularityMult(s.singularities || 0)) return;
    if (!window.confirm(`Fork the timeline? This spends ${bill} investors, resets the machines and cash upgrades, and adds one singularity point (max x4). Research and tokens stay.`)) return;
    const meta = snapshotMeta(s, { resetRunUpgrades: true });
    const next = freshState();
    Object.assign(next, meta);
    next.biz = freshBiz();
    next.cash = 0;
    next.lifetime = 0;
    next.investors = Math.max(0, (s.investors || 0) - bill);
    next.singularities = (s.singularities || 0) + 1;
    next.dilemma = null;
    next.challenge = null;
    stateRef.current = next;
    saveNow();
    bump();
    toast("Timeline forked", { description: `Singularity x${singularityMult(next.singularities).toFixed(1)}. Another research branch can be committed.` });
  }, [bump]);

  const reset = useCallback(() => {
    if (!window.confirm("Reset your empire? All progress saved in this browser will be erased.")) return;
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
    state: stateRef.current,
    buyMode,
    setBuyMode,
    buy,
    hire,
    run,
    runAll,
    buyForeman,
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
    startChallenge,
    chooseDilemma,
    cashOut,
    forkTimeline,
    touchBriefing,
    exportSave,
    importSave,
  };
}
