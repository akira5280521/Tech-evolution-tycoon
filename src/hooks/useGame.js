import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AWAY_MODAL_MS,
  BUSINESSES,
  MAX_BUY,
  OFFLINE_CAP_MS,
  buyCount,
  cappedTick,
  costOf,
  investorsFor,
  milestoneMult,
  prestigeMult,
} from "@/lib/gameConfig";
import { SAVE_VERSION, clearSaveData, getSaveData, writeSaveData } from "@/lib/gameSave";
import { playBuy, playCollect } from "@/lib/sfx";

const SAVE_INTERVAL_MS = 5000;

function freshState() {
  return {
    cash: 4,
    lifetime: 0,
    investors: 0,
    offlineReport: null,
    gainSeq: 0,
    biz: BUSINESSES.map((_, i) => ({
      owned: i === 0 ? 1 : 0,
      manager: false,
      running: false,
      progress: 0,
      activeMs: 0,
      lastGain: null,
    })),
  };
}

function loadSave() {
  const data = getSaveData();
  if (!data) return { state: freshState(), offlineReport: null };
  try {
    const state = freshState();
    if (Number.isFinite(data.cash) && data.cash >= 0) state.cash = data.cash;
    if (Number.isFinite(data.lifetime) && data.lifetime >= 0) state.lifetime = data.lifetime;
    if (Number.isFinite(data.investors) && data.investors >= 0) state.investors = Math.floor(data.investors);
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
    const elapsed = Math.min(Math.max(Date.now() - (data.lastSeen || Date.now()), 0), OFFLINE_CAP_MS);
    let offlineGain = 0;
    const rows = [];
    if (elapsed > 0) {
      state.biz.forEach((st, i) => {
        if (!st.manager || st.owned <= 0) return;
        const cfg = BUSINESSES[i];
        // The crew keeps a mid-cycle batch running while the game is closed, so
        // the partial cycle saved at shutdown counts toward the offline payout.
        st.activeMs += elapsed;
        const totalTime = elapsed + st.progress;
        const cycles = Math.floor(totalTime / cfg.cycleMs);
        st.progress = totalTime % cfg.cycleMs;
        if (cycles > 0) {
          const amount = cycles * cfg.revenue * st.owned * milestoneMult(st.owned) * prestigeMult(state.investors);
          if (Number.isFinite(amount) && amount > 0) {
            offlineGain += amount;
            rows.push({ name: cfg.name, amount });
          }
        }
      });
    }
    if (offlineGain > 0 && Number.isFinite(state.cash + offlineGain) && Number.isFinite(state.lifetime + offlineGain)) {
      state.cash += offlineGain;
      state.lifetime += offlineGain;
      // Short reloads still pay the crew; the welcome modal is only for a real absence.
      if (elapsed >= AWAY_MODAL_MS) {
        state.offlineReport = { amount: offlineGain, awayMs: elapsed, rows };
      }
    }
    return { state };
  } catch {
    return { state: freshState(), offlineReport: null };
  }
}

export function useGame() {
  const stateRef = useRef(null);
  if (!stateRef.current) stateRef.current = freshState();
  const [, force] = useState(0);
  const [buyMode, setBuyMode] = useState("x1");
  const restoredRef = useRef(false);

  // Restore the previous session (and any offline earnings) once, on the client.
  useEffect(() => {
    const { state } = loadSave();
    stateRef.current = state;
    restoredRef.current = true;
    force((n) => n + 1);
  }, []);

  // Main loop: advance production cycles and pay out.
  // Hidden and suspended ticks share one 8h budget — the same cap loadSave
  // applies when the tab is actually closed. A fresh absence refills it.
  useEffect(() => {
    let lastWall = Date.now();
    let awayBudget = OFFLINE_CAP_MS;
    const iv = setInterval(() => {
      const wall = Date.now();
      const raw = Math.max(0, wall - lastWall);
      lastWall = wall;
      const tick = cappedTick(raw, document.hidden, awayBudget);
      awayBudget = tick.budget;
      const dt = tick.dt;
      if (!(dt > 0)) return;
      const s = stateRef.current;
      let dirty = false;
      // Each tick clones only the business records that advanced, so the
      // memoized rows can detect their own changes by reference.
      s.biz = s.biz.map((st, i) => {
        if (st.owned <= 0) return st;
        if (!st.manager && !st.running) return st;
        const cfg = BUSINESSES[i];
        const next = { ...st, progress: st.progress + dt, activeMs: st.activeMs + dt };
        const cycles = Math.floor(next.progress / cfg.cycleMs);
        dirty = true;
        if (cycles <= 0) return next;
        const paidCycles = st.manager ? cycles : 1;
        const gain = paidCycles * cfg.revenue * st.owned * milestoneMult(st.owned) * prestigeMult(s.investors);
        next.progress = st.manager ? next.progress % cfg.cycleMs : 0;
        if (!st.manager) {
          next.running = false;
          playCollect(); // manual run finished — the player collected this batch
        }
        if (Number.isFinite(gain) && gain > 0 && Number.isFinite(s.cash) && Number.isFinite(s.lifetime)) {
          s.cash += gain;
          s.lifetime += gain;
          next.lastGain = { id: ++s.gainSeq, amount: gain };
        }
        return next;
      });
      if (dirty) force((n) => n + 1);
    }, 100);
    return () => clearInterval(iv);
  }, []);

  // Autosave every few seconds and whenever the tab is hidden or closed.
  useEffect(() => {
    const save = () => {
      const s = stateRef.current;
      if (!restoredRef.current) return; // never overwrite the real save with a fresh state
      writeSaveData({
        version: SAVE_VERSION,
        cash: Number.isFinite(s.cash) && s.cash >= 0 ? s.cash : 0,
        lifetime: Number.isFinite(s.lifetime) && s.lifetime >= 0 ? s.lifetime : 0,
        investors: Number.isFinite(s.investors) && s.investors >= 0 ? Math.floor(s.investors) : 0,
        lastSeen: Date.now(),
        biz: s.biz.map((b) => ({
          owned: b.owned,
          manager: b.manager,
          running: b.running,
          progress: b.progress,
          activeMs: b.activeMs,
        })),
      });
    };
    const iv = setInterval(save, SAVE_INTERVAL_MS);
    const onHide = () => {
      if (document.hidden) save();
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      save(); // leaving the game screen — persist the latest state
      clearInterval(iv);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  const buy = useCallback(
    (i) => {
      const s = stateRef.current;
      const cfg = BUSINESSES[i];
      const st = s.biz[i];
      const count = Math.floor(buyCount(buyMode, cfg, st.owned, s.cash));
      if (!Number.isFinite(count) || count < 1 || count > MAX_BUY) return;
      const cost = costOf(cfg, st.owned, count);
      if (!Number.isFinite(s.cash) || !Number.isFinite(cost) || !(s.cash >= cost)) return;
      s.cash -= cost;
      s.biz = s.biz.map((b, j) => (j === i ? { ...b, owned: b.owned + count } : b));
      playBuy();
      force((n) => n + 1);
    },
    [buyMode]
  );

  const hire = useCallback((i) => {
    const s = stateRef.current;
    const cfg = BUSINESSES[i];
    const st = s.biz[i];
    if (st.manager || st.owned <= 0 || !Number.isFinite(s.cash) || s.cash < cfg.managerCost) return;
    s.cash -= cfg.managerCost;
    s.biz = s.biz.map((b, j) => (j === i ? { ...b, manager: true, running: true } : b));
    force((n) => n + 1);
  }, []);

  const run = useCallback((i) => {
    const s = stateRef.current;
    const st = s.biz[i];
    if (st.owned > 0 && !st.manager && !st.running) {
      s.biz = s.biz.map((b, j) => (j === i ? { ...b, running: true } : b));
      force((n) => n + 1);
    }
  }, []);

  const dismissOffline = useCallback(() => {
    const s = stateRef.current;
    if (!s.offlineReport) return;
    s.offlineReport = null;
    playCollect();
    force((n) => n + 1);
  }, []);

  const prestige = useCallback(() => {
    const s = stateRef.current;
    const gained = investorsFor(s.lifetime);
    if (!Number.isFinite(gained) || gained < 1) return;
    const nextInvestors = s.investors + gained;
    if (!Number.isFinite(nextInvestors) || nextInvestors < 0) return;
    const noun = gained === 1 ? "investor" : "investors";
    if (!window.confirm(`Reset your empire to recruit ${gained} ${noun}? The profit bonus caps at ×10.`)) return;
    const next = freshState();
    next.investors = nextInvestors;
    stateRef.current = next;
    force((n) => n + 1);
    toast(`${gained} ${noun} joined!`, {
      description: "Profit bonus updated (capped at ×10). Rebuild — faster this time.",
    });
  }, []);

  const reset = useCallback(() => {
    if (!window.confirm("Reset your empire? All progress saved in this browser will be erased.")) return;
    clearSaveData();
    stateRef.current = freshState();
    force((n) => n + 1);
  }, []);

  return { state: stateRef.current, buyMode, setBuyMode, buy, hire, run, prestige, reset, dismissOffline };
}