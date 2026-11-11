// Shared access to the game's localStorage save slot, used by the game screen
// (read/write) and the settings screen (read-only analytics).

import { BUSINESSES, blankSupply, managerNeed } from "./gameConfig.js";

export const SAVE_KEY = "pc-tycoon-save-v1";

// v1 banked investors with sqrt(lifetime / 1e6). v2 uses sqrt(lifetime / 1e12),
// which is exactly 1000× fewer investors for the same lifetime. Saves without
// a version are v1 and are rescaled once on read. v3 keeps every badge the
// older, easier rules had already granted. v4 inserted the sand → wafer chain
// in front of Vacuum Tubes. v5 stores each row with its era id and puts the
// rows in historical order, adding the paper, glass, filament and germanium
// rows; older saves are matched to rows by their old position.
export const SAVE_VERSION = 5;
const V1_INVESTOR_DIVISOR = 1000;
// Row order of each older save version.
const V4_ORDER = ["sand", "copper", "silicon", "wafers", "tubes", "punchcards", "transistors", "ics", "cpu", "homepc", "gpu", "rgb", "quantum"];
const V3_ORDER = V4_ORDER.slice(4);
// Rows that did not exist in an older save, and the era that needs each one.
// A player who already reached that era gets the row started for them.
const V4_MATERIALS = ["sand", "copper", "silicon", "wafers"];
const NEW_IN_V5 = { paper: "punchcards", glass: "tubes", filament: "tubes", germanium: "transistors" };
const SEED_OWNED = { sand: 8, copper: 4, silicon: 2, wafers: 1, paper: 2, glass: 2, filament: 2, germanium: 2 };
const SEED_SUPPLY = { sand: 80, copper: 40, silicon: 24, wafers: 12, paper: 20, glass: 20, filament: 20, germanium: 20 };

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
  const order = version < 4 ? V3_ORDER : version < 5 ? V4_ORDER : null;
  const rowsById = {};
  bizIn.forEach((row, i) => {
    if (!row || typeof row !== "object") return;
    const id = order ? order[i] : typeof row.id === "string" ? row.id : BUSINESSES[i]?.id;
    if (id && !rowsById[id]) rowsById[id] = row;
  });
  const ownedOf = (id) => Math.floor(finiteNumber(rowsById[id]?.owned, 0));
  const progressed = investors > 0 || Object.entries(rowsById).some(([id, row]) => {
    const owned = finiteNumber(row?.owned, 0);
    return id === "sand" ? owned > 1 : owned > 0;
  });
  // Which rows to start for the player, so a row they already reached is not
  // stranded behind a material row they never had.
  const seed = new Set();
  if (version < 4 && progressed) V4_MATERIALS.forEach((id) => seed.add(id));
  if (version < 5) {
    for (const [id, needs] of Object.entries(NEW_IN_V5)) {
      if (ownedOf(needs) > 0 || (version < 4 && progressed)) seed.add(id);
    }
  }
  const biz = BUSINESSES.map((cfg, i) => {
    if (seed.has(cfg.id)) {
      // Enough owned that the started manager meets the hiring rule.
      return { id: cfg.id, owned: Math.max(SEED_OWNED[cfg.id] || 1, managerNeed(i)), manager: true, running: false, progress: 0, activeMs: 0, commissionUntil: 0 };
    }
    const row = rowsById[cfg.id] || {};
    const fallback = i === 0 && !rowsById[cfg.id] && version < 4 ? 1 : 0;
    return {
      id: cfg.id,
      owned: Math.max(fallback, Math.floor(finiteNumber(row.owned, 0))),
      manager: !!row.manager,
      running: !!row.running,
      progress: Math.min(finiteNumber(row.progress, 0), cfg.cycleMs),
      activeMs: finiteNumber(row.activeMs, 0),
      commissionUntil: finiteNumber(row.commissionUntil, 0),
    };
  });
  const supply = blankSupply();
  if (version >= 4 && data.supply && typeof data.supply === "object") {
    for (const key of Object.keys(supply)) supply[key] = finiteNumber(data.supply[key], 0);
  }
  for (const id of seed) if (SEED_SUPPLY[id]) supply[id] = Math.max(supply[id] || 0, SEED_SUPPLY[id]);
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
    upgradeJob: version < 4 ? null : upgradeJob(job(data.upgradeJob), version),
    projectJob: version < 4 ? null : job(data.projectJob),
    orientation: data.orientation === "portrait" || data.orientation === "landscape" ? data.orientation : "auto",
    meta: data,
    biz,
  };
}

// An upgrade being installed names its row by position. Older saves used the
// old order, so point it at the same era in the new order.
function upgradeJob(raw, version) {
  if (!raw) return null;
  const id = version < 5 ? V4_ORDER[raw.index] : BUSINESSES[raw.index]?.id;
  const index = BUSINESSES.findIndex((cfg) => cfg.id === id);
  if (index < 0 || (raw.kind !== "rev" && raw.kind !== "spd")) return null;
  return { ...raw, index };
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
