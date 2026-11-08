// Shared access to the game's localStorage save slot, used by the game screen
// (read/write) and the settings screen (read-only analytics).

import { BUSINESSES, blankSupply } from "./gameConfig.js";

export const SAVE_KEY = "pc-tycoon-save-v1";

// v1 banked investors with sqrt(lifetime / 1e6). v2 uses sqrt(lifetime / 1e12),
// which is exactly 1000× fewer investors for the same lifetime. Saves without
// a version are v1 and are rescaled once on read. v3 keeps every badge the
// older, easier rules had already granted. v4 inserts the sand → wafer chain
// in front of Vacuum Tubes and keeps the old nine rows behind it.
export const SAVE_VERSION = 4;
const MATERIAL_COUNT = 4;
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
  const progressed = investors > 0 || bizIn.some((row, i) => {
    const owned = finiteNumber(row?.owned, 0);
    return i === 0 ? owned > 1 : owned > 0;
  });
  const source = version < 4 ? Array.from({ length: MATERIAL_COUNT }, () => ({})).concat(bizIn) : bizIn;
  const starterOwned = [8, 4, 2, 1];
  const biz = BUSINESSES.map((cfg, i) => {
    const seeded = version < 4 && i < MATERIAL_COUNT;
    const row = !seeded && source[i] && typeof source[i] === "object" ? source[i] : {};
    const owned = seeded
      ? (progressed ? starterOwned[i] : i === 0 ? 1 : 0)
      : Math.floor(finiteNumber(row.owned, 0));
    return {
      owned,
      manager: seeded ? progressed : !!row.manager,
      running: seeded ? false : !!row.running,
      progress: seeded ? 0 : Math.min(finiteNumber(row.progress, 0), cfg.cycleMs),
      activeMs: seeded ? 0 : finiteNumber(row.activeMs, 0),
      commissionUntil: seeded ? 0 : finiteNumber(row.commissionUntil, 0),
    };
  });
  const supply = blankSupply();
  if (version < 4) {
    if (progressed) {
      supply.sand = 80;
      supply.copper = 40;
      supply.silicon = 24;
      supply.wafers = 12;
    }
  } else if (data.supply && typeof data.supply === "object") {
    for (const key of Object.keys(supply)) supply[key] = finiteNumber(data.supply[key], 0);
  }
  const job = (raw) => {
    if (!raw || typeof raw !== "object") return null;
    if (!Number.isFinite(raw.readyAt) || !Number.isFinite(raw.startedAt) || raw.readyAt < raw.startedAt) return null;
    return raw;
  };

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
    supply,
    foreman: version < 4 ? progressed : !!data.foreman,
    sawPit: version < 4 ? progressed : !!data.sawPit,
    researchJob: version < 4 ? null : job(data.researchJob),
    upgradeJob: version < 4 ? null : job(data.upgradeJob),
    projectJob: version < 4 ? null : job(data.projectJob),
    orientation: data.orientation === "portrait" || data.orientation === "landscape" ? data.orientation : "auto",
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
