import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { applyBriefing } from "@/lib/briefing";
import {
  AWAY_MODAL_MS,
  BUSINESSES,
  MAX_BUY,
  OFFLINE_CAP_MS,
  buyCount,
  cappedTick,
  costOf,
  investorsFor,
  money,
} from "@/lib/gameConfig";
import {
  blankMeta,
  collectBadges,
  legacyBadgeIds,
  buyShopItem,
  buyUpgrade,
  canBuyIndex,
  canHireIndex,
  commitSpecialty,
  completeProjects,
  creditAmount,
  creditCycles,
  dataPerSecond,
  effectiveCycleMs,
  managerPrice,
  notePurchase,
  resolveDilemma,
  forkCost,
  maxBuyCount,
  singularityMult,
  snapshotMeta,
  tickDilemma,
} from "@/lib/empire";
import { SAVE_VERSION, clearSaveData, getSaveData, writeSaveData } from "@/lib/gameSave";
import { isPageHidden } from "@/lib/pageVisibility";
import { playBuy, playCollect } from "@/lib/sfx";

const SAVE_INTERVAL_MS = 5000;

function freshBiz() {
  return BUSINESSES.map((_, i) => ({
    owned: i === 0 ? 1 : 0,
    manager: false,
    running: false,
    progress: 0,
    activeMs: 0,
    lastGain: null,
  }));
}

function freshState() {
  return {
    ...blankMeta(),
    cash: 4,
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
  state.nextWindfallAt = num(m.nextWindfallAt);
  state.prestiged = !!m.prestiged;
  state.badgesEarned = Array.isArray(m.badgesEarned) ? m.badgesEarned.filter((id) => typeof id === "string") : [];
  state.modStamp = 1;
  state.challenge =
    m.challenge && typeof m.challenge.id === "string"
      ? { id: m.challenge.id, startedAt: num(m.challenge.startedAt), earnings: num(m.challenge.earnings) }
      : null;
  state.dilemma =
    m.dilemma && Number(m.dilemma.expiresAt) > Date.now()
      ? { id: "grant", expiresAt: Number(m.dilemma.expiresAt) }
      : null;
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
    nextWindfallAt: s.nextWindfallAt || 0,
    prestiged: !!s.prestiged,
    badgesEarned: s.badgesEarned || [],
    challenge: s.challenge,
    dilemma: s.dilemma,
    biz: s.biz.map((b) => ({
      owned: b.owned,
      manager: b.manager,
      running: b.running,
      progress: b.progress,
      activeMs: b.activeMs,
    })),
  };
}

function loadSave() {
  const data = getSaveData();
  const state = freshState();
  if (!data) {
    applyBriefing(state);
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
    });
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
      const boostStart = now - elapsed;
      state.biz.forEach((st, i) => {
        if (!st.manager || st.owned <= 0) return;
        const cfg = BUSINESSES[i];
        st.activeMs += elapsed;
        const cycle = effectiveCycleMs(cfg, state);
        const totalTime = elapsed + st.progress;
        const cycles = Math.floor(totalTime / cycle);
        st.progress = totalTime % cycle;
        if (cycles <= 0) return;
        const boostMs = Math.max(0, Math.min(elapsed, (state.boostUntil || 0) - boostStart));
        const boostedCycles = Math.min(cycles, Math.floor(boostMs / cycle));
        const plainCycles = cycles - boostedCycles;
        const boosted = creditCycles(state, i, boostedCycles, state.boostUntil);
        const plain = creditCycles(state, i, plainCycles, 0);
        const amount = boosted + plain;
        if (amount > 0) {
          offlineGain += amount;
          rows.push({ name: cfg.name, amount });
        }
      });
    }
    if (offlineGain > 0 && elapsed >= AWAY_MODAL_MS) {
      state.offlineReport = { amount: offlineGain, awayMs: elapsed, rows };
    }
    applyBriefing(state);
    completeProjects(state);
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
      toast("Speedrun missed", { description: "Fifteen minutes ran out before $1.00M." });
    }
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
      s.biz = s.biz.map((st, i) => {
        if (st.owned <= 0) return st;
        if (!st.manager && !st.running) return st;
        const cfg = BUSINESSES[i];
        const cycle = effectiveCycleMs(cfg, s);
        const next = { ...st, progress: st.progress + dt, activeMs: st.activeMs + dt };
        const cycles = Math.floor(next.progress / cycle);
        dirty = true;
        if (cycles <= 0) return next;
        const paidCycles = st.manager ? cycles : 1;
        next.progress = st.manager ? next.progress % cycle : 0;
        if (!st.manager) {
          next.running = false;
          playCollect();
        }
        const gain = creditCycles(s, i, paidCycles, wall);
        if (gain > 0) next.lastGain = { id: ++s.gainSeq, amount: gain };
        return next;
      });
      s.data = (s.data || 0) + dataPerSecond(s) * (dt / 1000);
      const notes = tickDilemma(s, wall);
      if (notes.length) {
        announce(notes);
        dirty = true;
      }
      if (dirty) bump();
    }, 100);
    return () => clearInterval(iv);
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
      s.biz = s.biz.map((b, j) => (j === i ? { ...b, owned: b.owned + count } : b));
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
      const price = managerPrice(s, i);
      s.cash -= price;
      if (s.shop?.freeManager) s.shop = { ...s.shop, freeManager: false };
      s.biz = s.biz.map((b, j) => (j === i ? { ...b, manager: true, running: true } : b));
      saveNow();
      bump();
    },
    [bump]
  );

  const run = useCallback(
    (i) => {
      const s = stateRef.current;
      const st = s.biz[i];
      if (st.owned > 0 && !st.manager && !st.running) {
        s.biz = s.biz.map((b, j) => (j === i ? { ...b, running: true } : b));
        bump();
      }
    },
    [bump]
  );

  const runAll = useCallback(() => {
    const s = stateRef.current;
    let any = false;
    s.biz = s.biz.map((b) => {
      if (b.owned > 0 && !b.manager && !b.running) {
        any = true;
        return { ...b, running: true };
      }
      return b;
    });
    if (any) bump();
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
      if (!commitSpecialty(stateRef.current, id)) return;
      toast("Specialty committed", { description: "The other branches wait until the timeline is forked." });
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
    if (!window.confirm(`Start ${label}? This run's cash and machines reset. Permanent rewards stay.`)) return;
    const meta = snapshotMeta(s);
    const next = freshState();
    Object.assign(next, meta);
    next.biz = freshBiz();
    next.cash = 4;
    next.lifetime = 0;
    next.challenge = { id, startedAt: Date.now(), earnings: 0 };
    next.dilemma = null;
    stateRef.current = next;
    saveNow();
    bump();
  }, [bump, saveNow]);

  const chooseDilemma = useCallback(
    (choice) => {
      const result = resolveDilemma(stateRef.current, choice, Date.now());
      if (!result) return;
      if (result.type === "tokens") toast("Paperwork filed", { description: "+2 era tokens." });
      if (result.type === "boost") toast("Automation sold", { description: "Revenue x1.15 for 5 minutes." });
      if (result.type === "defer") toast("Deferred", { description: "The board will ask again in 5 minutes." });
      saveNow();
      bump();
    },
    [bump]
  );

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
    if (!window.confirm(`Reset your empire to recruit ${gained} ${noun}? Investor bonus, singularity, and the other empire bonuses share a soft ceiling.`)) return;
    const meta = snapshotMeta(s);
    const next = freshState();
    Object.assign(next, meta);
    next.biz = freshBiz();
    next.cash = 4;
    next.lifetime = 0;
    next.investors = nextInvestors;
    next.prestiged = true;
    next.dilemma = null;
    next.challenge = null;
    stateRef.current = next;
    saveNow();
    bump();
    toast(`${gained} ${noun} joined!`, { description: "Permanent boosts stayed. The machines did not." });
  }, [bump]);

  const forkTimeline = useCallback(() => {
    const s = stateRef.current;
    if (s.challenge) return;
    const bill = forkCost(s.singularities || 0);
    if ((s.investors || 0) < bill) return;
    if (singularityMult((s.singularities || 0) + 1) <= singularityMult(s.singularities || 0)) return;
    if (!window.confirm(`Fork the timeline? This spends ${bill} investors, resets the machines, and adds one singularity point (max x4). The income ceiling rises, but it never runs away. Research and tokens stay.`)) return;
    const meta = snapshotMeta(s);
    const next = freshState();
    Object.assign(next, meta);
    next.biz = freshBiz();
    next.cash = 4;
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
    prestige,
    reset,
    dismissOffline,
    purchaseUpgrade,
    purchaseShop,
    chooseSpecialty,
    startChallenge,
    chooseDilemma,
    forkTimeline,
    touchBriefing,
  };
}
