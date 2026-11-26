// Evaluate a layered-room slot condition against live game state.
// Objects appear only when their generator count, owned part, research,
// upgrade, or era requirement is actually met — not merely reachable.
import { BUSINESSES, MILESTONES } from "../gameConfig.js";
import { eraReachedIndex } from "../records.js";
import { playerYear } from "../eraYear.js";
import { upgradesOf } from "../empire.js";
import { SERVERS_STAGE_DEFS } from "./serversRoom.js";

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

export function conditionMet(state, condition, fallbackFacilityId, ctx = {}) {
  if (!condition) return true;
  if (condition.generatorId) {
    const n = generatorOwned(state, condition.generatorId);
    if (condition.minOwned != null && n < condition.minOwned) return false;
    if (condition.maxOwned != null && n > condition.maxOwned) return false;
  }
  if (condition.partId) {
    const fac = condition.facilityId || fallbackFacilityId;
    const n = partOwned(state, fac, condition.partId);
    // slots.json uses minOwned for parts; minParts is the explicit alias.
    // When a generatorId is also present, minOwned applies to the generator.
    const min = condition.minParts != null
      ? condition.minParts
      : (condition.generatorId ? 1 : (condition.minOwned != null ? condition.minOwned : 1));
    if (n < min) return false;
    if (condition.maxParts != null && n > condition.maxParts) return false;
    if (!condition.generatorId && condition.maxOwned != null && n > condition.maxOwned) return false;
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
  if (needsStage(condition)) {
    const stage = ctx.stage || resolveServersStage(state);
    if (!stageMatches(condition, stage)) return false;
  }
  return true;
}

function needsStage(condition) {
  return !!(condition.stageId || condition.stages || condition.era || condition.minStage || condition.maxStage
    || condition.stageMinYear != null || condition.stageMaxYear != null);
}

export function serversTriggerMet(state, trigger) {
  if (!trigger) return true;
  if (trigger.anyParts) {
    return trigger.anyParts.some((id) => partOwned(state, "servers", id) >= 1);
  }
  if (trigger.partId) {
    const min = trigger.minParts != null ? trigger.minParts : 1;
    return partOwned(state, "servers", trigger.partId) >= min;
  }
  return true;
}

// Last matching stage in the approved 26-stage list wins.
export function resolveServersStage(state) {
  let current = SERVERS_STAGE_DEFS[0];
  for (const stage of SERVERS_STAGE_DEFS) {
    if (serversTriggerMet(state, stage.trigger)) current = stage;
  }
  return current;
}

function eraTagMatches(tag, stage) {
  if (!tag || !stage) return false;
  if (tag.endsWith("+")) {
    const year = parseInt(tag, 10);
    return Number.isFinite(year) && stage.year >= year;
  }
  const sub = /^(.*)-(start|mid|maxed)$/.exec(tag);
  if (sub) return stage.key === sub[1] && stage.stage === sub[2];
  return stage.key === tag || String(stage.year) === tag;
}

const SUB = { start: 0, mid: 1, maxed: 2 };

export function stageMatches(condition, stage) {
  if (!stage) return false;
  if (condition.stageId && condition.stageId !== stage.id) return false;
  if (condition.stages && !condition.stages.includes(stage.id)) return false;
  if (condition.era && !eraTagMatches(condition.era, stage)) return false;
  if (condition.minStage) {
    if ((SUB[stage.stage] ?? 0) < (SUB[condition.minStage] ?? 0)) return false;
  }
  if (condition.maxStage) {
    if ((SUB[stage.stage] ?? 0) > (SUB[condition.maxStage] ?? 0)) return false;
  }
  if (condition.stageMinYear != null && stage.year < condition.stageMinYear) return false;
  if (condition.stageMaxYear != null && stage.year > condition.stageMaxYear) return false;
  return true;
}

export function pickBase(room, state) {
  if (room?.bases) {
    const stage = resolveServersStage(state);
    return room.bases[stage.base] || room.base;
  }
  return room.base;
}

// Last matching variant wins, matching the approved slots.json rule.
export function pickVariant(state, slot, facilityId, ctx = {}) {
  const variants = slot?.variants || [];
  let picked = null;
  for (const variant of variants) {
    if (conditionMet(state, variant.condition, facilityId, ctx)) picked = variant;
  }
  return picked;
}

// tab601 (and any slot marked placeAll) can show several placements at once.
export function pickPlacements(state, slot, facilityId, ctx = {}) {
  const variants = slot?.variants || [];
  const matches = variants.filter((variant) => conditionMet(state, variant.condition, facilityId, ctx));
  if (!matches.length) return [];
  const rule = slot.variantRule || "";
  if (slot.placeAll || /all|per owned|per-owned/i.test(rule)) return matches;
  return [matches[matches.length - 1]];
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
