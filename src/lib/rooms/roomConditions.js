// Evaluate a layered-room slot condition against live game state.
// Objects appear only when their generator count, owned part, research,
// upgrade, or era requirement is actually met — not merely reachable.
import { BUSINESSES, MILESTONES } from "../gameConfig.js";
import { eraReachedIndex } from "../records.js";
import { playerYear } from "../eraYear.js";
import { upgradesOf } from "../empire.js";

// First purchase (owned >= 1) plus the real business milestones.
export const ROOM_MILESTONES = [1, ...MILESTONES.map((m) => m.owned)];

export function generatorOwned(state, id) {
  if (!id) return 0;
  const index = BUSINESSES.findIndex((b) => b.id === id);
  if (index < 0) return 0;
  return Math.max(0, Math.floor(Number(state?.biz?.[index]?.owned) || 0));
}

export function partOwned(state, facilityId, partId) {
  if (!facilityId || !partId) return 0;
  return Math.max(0, Math.floor(Number(state?.facilities?.[facilityId]?.[partId]) || 0));
}

export function researchDone(state, id) {
  return !!(id && (state?.techDone || []).includes(id));
}

// Home Computers upgrades are stored as { rev, spd } on the business id.
export function upgradeOn(state, businessId, kind) {
  const up = upgradesOf(state, businessId);
  if (kind === "rev" || kind === "Bundled Software") return !!up.rev;
  if (kind === "spd" || kind === "Assembly Jig") return !!up.spd;
  return !!up[kind];
}

export function conditionMet(state, condition, fallbackFacilityId) {
  if (!condition) return true;
  if (condition.generatorId) {
    const n = generatorOwned(state, condition.generatorId);
    if (condition.minOwned != null && n < condition.minOwned) return false;
    if (condition.maxOwned != null && n > condition.maxOwned) return false;
  }
  if (condition.partId) {
    const fac = condition.facilityId || fallbackFacilityId;
    const n = partOwned(state, fac, condition.partId);
    const min = condition.minParts != null ? condition.minParts : 1;
    if (n < min) return false;
    if (condition.maxParts != null && n > condition.maxParts) return false;
  }
  const research = condition.researchId || condition.research;
  if (research && !researchDone(state, research)) return false;
  if (condition.upgradeId || condition.upgradeKind) {
    const biz = condition.generatorId || condition.eraId;
    if (!upgradeOn(state, biz, condition.upgradeId || condition.upgradeKind)) return false;
  }
  if (condition.eraId) {
    const index = BUSINESSES.findIndex((b) => b.id === condition.eraId);
    if (index < 0 || eraReachedIndex(state) < index) return false;
  }
  if (condition.minYear != null && playerYear(state) < condition.minYear) return false;
  if (condition.maxYear != null && playerYear(state) > condition.maxYear) return false;
  return true;
}

// Last matching variant wins, matching the approved slots.json rule.
export function pickVariant(state, slot, facilityId) {
  const variants = slot?.variants || [];
  let picked = null;
  for (const variant of variants) {
    if (conditionMet(state, variant.condition, facilityId)) picked = variant;
  }
  return picked;
}

export const MONITOR_MODES = ["era", "green", "amber", "color"];

export function normalizeMonitorDisplay(value) {
  return MONITOR_MODES.includes(value) ? value : "era";
}

// resolvedMode = (pref === "era") ? monitor.eraDefault : pref
export function resolveMonitorMode(pref, eraDefault) {
  const mode = normalizeMonitorDisplay(pref);
  if (mode === "era") return eraDefault || "color";
  return mode;
}

export function screenKey(unlockId, resolvedMode) {
  return `${unlockId}+${resolvedMode}`;
}

export function monitorFlickerKind(panel, resolvedMode) {
  const text = String(panel || "").toLowerCase();
  if (text.includes("no flicker") || text.includes("lcd") || text.includes("oled") || text.includes("ips") || text.includes("tn,") || text.includes("flat panel")) {
    if (resolvedMode === "green" || resolvedMode === "amber") return resolvedMode;
    return "lcd_oled";
  }
  if (resolvedMode === "green" || resolvedMode === "amber") return resolvedMode;
  return "color";
}
