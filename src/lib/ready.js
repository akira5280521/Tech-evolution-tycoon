// Ready dots on the BOOST and R&D tabs, the TECH button, and HQ cards.
// A key is "ready" until the player views that screen or the thing goes away.
import { BUSINESSES, eraOpen } from "./gameConfig.js";
import { LAB_PROJECTS, SPECIALTIES, canCommit, labQuote, upgradeOffer, upgradesOf } from "./empire.js";
import { facilityUnlocked } from "./facilities.js";
import { researchUnlocks } from "./research.js";

const BUCKETS = ["boost", "research", "tech", "hq"];

export function blankReadySeen() {
  return { seeded: false, boost: [], research: [], tech: [], hq: [] };
}

export function readReadySeen(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const list = (arr) => (Array.isArray(arr) ? arr.filter((id) => typeof id === "string").slice(0, 400) : []);
  return {
    seeded: !!src.seeded,
    boost: list(src.boost),
    research: list(src.research),
    tech: list(src.tech),
    hq: list(src.hq),
  };
}

function boostKeys(state) {
  const out = [];
  const cash = Number(state?.cash) || 0;
  BUSINESSES.forEach((cfg, i) => {
    if (!eraOpen(state, i) || !((state?.biz?.[i]?.owned || 0) > 0)) return;
    const offer = upgradeOffer(i);
    const up = upgradesOf(state, cfg.id);
    for (const kind of ["rev", "spd"]) {
      const piece = offer[kind];
      if (up[kind] || (state?.biz?.[i]?.owned || 0) < piece.need) continue;
      if (Number.isFinite(piece.cost) && cash >= piece.cost) out.push(`${cfg.id}:${kind}`);
    }
  });
  return out;
}

function researchKeys(state, now) {
  const out = [];
  for (const spec of SPECIALTIES) {
    if (canCommit(state, spec.id)) out.push(`specialty:${spec.id}`);
  }
  for (const item of LAB_PROJECTS) {
    if (labQuote(state, item.id, now).ok) out.push(`lab:${item.id}`);
  }
  return out;
}

function techKeys(state) {
  return [...(state?.techDone || [])].filter((id) => typeof id === "string");
}

function hqKeys(state) {
  const out = [];
  const done = new Set(state?.techDone || []);
  for (const id of done) {
    for (const part of researchUnlocks(id)) {
      if (!part?.fits) continue;
      for (const fac of part.fits) {
        if (!facilityUnlocked(state, fac) && fac !== "servers") continue;
        const owned = state?.facilities?.[fac]?.[part.id] || 0;
        if (owned > 0) continue;
        out.push(`${fac}:${part.id}`);
      }
    }
  }
  return out;
}

export function readyKeys(state, now = Date.now()) {
  if (!state) return { boost: [], research: [], tech: [], hq: [] };
  return {
    boost: boostKeys(state),
    research: researchKeys(state, now),
    tech: techKeys(state),
    hq: hqKeys(state),
  };
}

function unseen(keys, seen) {
  const have = new Set(seen || []);
  return keys.filter((id) => !have.has(id));
}

// Dots to show right now (keys the player has not viewed yet).
export function readyDots(state, now = Date.now()) {
  const keys = readyKeys(state, now);
  const seen = state?.readySeen || blankReadySeen();
  return {
    boost: unseen(keys.boost, seen.boost),
    research: unseen(keys.research, seen.research),
    tech: unseen(keys.tech, seen.tech),
    hq: unseen(keys.hq, seen.hq),
  };
}

export function tabHasDot(dots, tab) {
  if (tab === "boost") return (dots.boost || []).length > 0;
  if (tab === "research") return (dots.research || []).length > 0;
  return false;
}

export function hqCardHasDot(dots, facilityId) {
  const prefix = `${facilityId}:`;
  return (dots.hq || []).some((id) => id.startsWith(prefix));
}

// Mark the current ready keys in a bucket as viewed. True if anything changed.
export function markReadySeen(state, bucket, now = Date.now(), prefix = "") {
  if (!state || !BUCKETS.includes(bucket)) return false;
  const rec = { ...blankReadySeen(), ...(state.readySeen || {}) };
  const keys = (readyKeys(state, now)[bucket] || []).filter((id) => !prefix || id.startsWith(prefix));
  const have = new Set(rec[bucket] || []);
  let changed = false;
  for (const id of keys) {
    if (!have.has(id)) {
      have.add(id);
      changed = true;
    }
  }
  if (!changed && rec.seeded) return false;
  rec[bucket] = [...have].slice(-400);
  rec.seeded = true;
  state.readySeen = rec;
  return true;
}

// Existing saves shouldn't light up with dots for things they already use.
export function seedReadySeen(state, now = Date.now()) {
  if (!state) return false;
  const rec = readReadySeen(state.readySeen);
  if (rec.seeded) {
    state.readySeen = rec;
    return false;
  }
  const keys = readyKeys(state, now);
  state.readySeen = {
    seeded: true,
    boost: keys.boost,
    research: keys.research,
    tech: keys.tech,
    hq: keys.hq,
  };
  return true;
}

