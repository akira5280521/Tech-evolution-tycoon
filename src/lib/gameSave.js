// Shared access to the game's localStorage save slot, used by the game screen
// (read/write) and the settings screen (read-only analytics).

import { BUSINESSES } from "./gameConfig.js";

export const SAVE_KEY = "pc-tycoon-save-v1";

// v1 banked investors with sqrt(lifetime / 1e6). v2 uses sqrt(lifetime / 1e12),
// which is exactly 1000× fewer investors for the same lifetime. Saves without
// a version are v1 and are rescaled once on read.
export const SAVE_VERSION = 2;
const V1_INVESTOR_DIVISOR = 1000;

function finiteNumber(n, fallback = 0) {
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return fallback;
  return n;
}

// Return a save the game can load: finite, non-negative fields, progress kept
// inside one cycle, and v1 investor banks divided by 1000. Null when the
// payload isn't an object.
export function migrateSave(data) {
  if (!data || typeof data !== "object") return null;
  const version = Number.isFinite(data.version) ? data.version : 1;
  let investors = finiteNumber(data.investors, 0);
  if (version < 2) investors = Math.floor(investors / V1_INVESTOR_DIVISOR);
  else investors = Math.floor(investors);

  const bizIn = Array.isArray(data.biz) ? data.biz : [];
  const biz = BUSINESSES.map((cfg, i) => {
    const row = bizIn[i] && typeof bizIn[i] === "object" ? bizIn[i] : {};
    return {
      owned: Math.floor(finiteNumber(row.owned, 0)),
      manager: !!row.manager,
      running: !!row.running,
      progress: Math.min(finiteNumber(row.progress, 0), cfg.cycleMs),
      activeMs: finiteNumber(row.activeMs, 0),
    };
  });

  const lastSeen = typeof data.lastSeen === "number" && Number.isFinite(data.lastSeen) ? data.lastSeen : undefined;
  const briefingDay = typeof data.briefingDay === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.briefingDay) ? data.briefingDay : null;
  return {
    version: SAVE_VERSION,
    cash: finiteNumber(data.cash, 0),
    lifetime: finiteNumber(data.lifetime, 0),
    investors,
    lastSeen,
    briefingDay,
    streak: Math.max(1, Math.floor(finiteNumber(data.streak, 1))),
    meta: data,
    biz,
  };
}

export function getSaveData() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const migrated = migrateSave(JSON.parse(raw));
    return migrated;
  } catch {
    return null;
  }
}

export function writeSaveData(data) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — this session simply won't persist */
  }
}

export function clearSaveData() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* nothing stored */
  }
}
