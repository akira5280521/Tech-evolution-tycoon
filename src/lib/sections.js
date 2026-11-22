// The game screen's two sections: SUPPLY (rows that make a material: the
// raw materials and refiners) and TECH (every other era row). Display only;
// no game math lives here.
import { BUSINESSES, REFINED, SUPPLY_KEYS, blockedByGlass, eraOpen } from "./gameConfig.js";
import { refiningOpen, shortageOn, supplyFull } from "./empire.js";

export const SECTIONS = [
  { id: "tech", label: "TECH" },
  { id: "supply", label: "SUPPLY" },
];
export const DEFAULT_SECTION = "tech";

export function normalizeSection(id) {
  return id === "supply" ? "supply" : "tech";
}

// SUPPLY for a row that makes a material, TECH for everything else.
export function rowSection(index) {
  return BUSINESSES[index]?.makes ? "supply" : "tech";
}

export function sectionOfId(id) {
  const i = BUSINESSES.findIndex((cfg) => cfg.id === id);
  return i < 0 ? null : rowSection(i);
}

// Rows of a section that are on screen this run, by index.
export function sectionRows(state, section) {
  const out = [];
  BUSINESSES.forEach((cfg, i) => {
    if (blockedByGlass(state, i) || !eraOpen(state, i)) return;
    if (rowSection(i) === section) out.push(i);
  });
  return out;
}

// The section to show: the saved choice, except that a new game with no TECH
// row open yet shows SUPPLY (Timber Camp is a supply row).
export function shownSection(state, saved) {
  const want = normalizeSection(saved);
  if (want === "tech" && sectionRows(state, "tech").length === 0) return "supply";
  return want;
}

// The row that makes a material, by index, or -1.
export function makerOf(key) {
  return BUSINESSES.findIndex((cfg) => cfg.makes && cfg.makes[key]);
}

// Materials a row is short of right now (each copy needs its own share).
export function rowShortOf(state, index) {
  const cfg = BUSINESSES[index];
  const owned = state?.biz?.[index]?.owned || 0;
  if (!cfg?.uses || !(owned > 0)) return [];
  if (state?.challenge?.id === "glass" && cfg.id === "tubes") return [];
  const supply = state?.supply || {};
  return Object.entries(cfg.uses)
    .filter(([key, need]) => (supply[key] || 0) < (Number(need) || 0) * owned)
    .map(([key]) => key);
}

// A material that wants attention: empty while an owned row needs it, FULL,
// or hit by a shortage event right now. Refined grades (no maker row) count
// once the refinery is open and some are on hand.
export function supplyAlerts(state, now = Date.now()) {
  const supply = state?.supply || {};
  const out = [];
  const short = shortageOn(state, now);
  for (const key of SUPPLY_KEYS) {
    if (REFINED[key]) {
      if (!refiningOpen(state) || !((supply[key] || 0) > 0)) continue;
      if (short === key) out.push({ key, kind: "shortage" });
      else if (supplyFull(state, key)) out.push({ key, kind: "full" });
      continue;
    }
    const maker = makerOf(key);
    if (maker < 0 || !eraOpen(state, maker)) continue;
    if (short === key) {
      out.push({ key, kind: "shortage" });
      continue;
    }
    const needed = BUSINESSES.some((cfg, i) => cfg.uses?.[key] && (state?.biz?.[i]?.owned || 0) > 0);
    if (needed && !((supply[key] || 0) > 0)) out.push({ key, kind: "empty" });
    else if (supplyFull(state, key)) out.push({ key, kind: "full" });
  }
  return out;
}

// The section a CSS target (a tutorial step or tip) lives in, if it names a
// business row: [data-tile="timber"], [data-buy="paper"], [data-hire="x"],
// [data-row="x"]. Null for anything else (top bar, tabs, the material strip).
export function sectionOfTarget(selector) {
  if (typeof selector !== "string") return null;
  const m = selector.match(/\[data-(?:tile|buy|hire|row)="([^"]+)"\]/);
  return m ? sectionOfId(m[1]) : null;
}

// The business row a NEXT MOVE line acts on: the last business it names
// ("X is short of wood. Buy another Timber Camp" acts on Timber Camp).
export function rowNamedLast(text) {
  if (typeof text !== "string") return null;
  let best = null;
  let at = -1;
  for (const cfg of BUSINESSES) {
    const i = text.lastIndexOf(cfg.name);
    if (i > at || (i === at && i >= 0 && best && cfg.name.length > best.name.length)) {
      at = i;
      best = cfg;
    }
  }
  return at >= 0 ? best.id : null;
}

// A row the game screen should scroll to next time it shows (set by NEXT
// MOVE's GO button before it opens the game screen).
let pendingRow = null;
export function focusRowLater(id) {
  pendingRow = id || null;
}
// Read without clearing: the screen may mount twice while it loads. The
// screen clears it with focusRowLater(null) once it has scrolled.
export function pendingRowId() {
  return pendingRow;
}
