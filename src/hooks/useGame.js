import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BUSINESSES, buyCount, costOf, investorsFor, milestoneMult, prestigeMult } from "@/lib/gameConfig";
import { clearSaveData, getSaveData, writeSaveData } from "@/lib/gameSave";
import { playBuy, playCollect } from "@/lib/sfx";

const SAVE_INTERVAL_MS = 5000;
const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;

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
    if (typeof data.cash === "number") state.cash = data.cash;
    if (typeof data.lifetime === "number") state.lifetime = data.lifetime;
    if (typeof data.investors === "number") state.investors = data.investors;
    (Array.isArray(data.biz) ? data.biz : []).forEach((b, i) => {
      if (!state.biz[i]) return;
      state.biz[i].owned = Number(b.owned) || 0;
      state.biz[i].manager = !!b.manager;
      state.biz[i].progress = Math.max(0, Number(b.progress) || 0);
      state.biz[i].running = !!b.running && !state.biz[i].manager && state.biz[i].owned > 0;
      state.biz[i].activeMs = Math.max(0, Number(b.activeMs) || 0);
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
          offlineGain += amount;
          rows.push({ name: cfg.name, amount });
        }
      });
    }
    if (offlineGain > 0) {
      state.cash += offlineGain;
      state.lifetime += offlineGain;
      state.offlineReport = { amount: offlineGain, awayMs: elapsed, rows };
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
  useEffect(() => {
    let last = performance.now();
    const iv = setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
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
        s.cash += gain;
        s.lifetime += gain;
        next.lastGain = { id: ++s.gainSeq, amount: gain };
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
        cash: s.cash,
        lifetime: s.lifetime,
        investors: s.investors,
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
      const count = buyCount(buyMode, cfg, st.owned, s.cash);
      const cost = costOf(cfg, st.owned, count);
      if (s.cash < cost) return;
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
    if (st.manager || st.owned <= 0 || s.cash < cfg.managerCost) return;
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
    if (gained < 1) return;
    const noun = gained === 1 ? "investor" : "investors";
    if (!window.confirm(`Reset your empire to recruit ${gained} ${noun}? Each adds a permanent +5% profit.`)) return;
    const next = freshState();
    next.investors = s.investors + gained;
    stateRef.current = next;
    force((n) => n + 1);
    toast(`${gained} ${noun} joined!`, {
      description: "Profits permanently boosted. Rebuild — faster this time.",
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