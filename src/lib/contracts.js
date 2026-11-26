// Early-era historical contracts, step 1. One at a time, fixed order, offered
// when that era is reached. The deadline only runs while the app is open.

import { indexOfBusiness } from "./gameConfig.js";

export const CONTRACTS = [
  {
    id: "census",
    era: "punchcards",
    title: "CENSUS OFFICE",
    text: "The census office needs 200 punch cards in 10 minutes to finish the count.",
    need: 200,
    minutes: 10,
    reward: { tokens: 2, cash: 120 },
  },
  {
    id: "codebreak",
    era: "relay",
    title: "WARTIME CODE-BREAKING",
    text: "The ministry needs 80 relay-computer runs in 10 minutes for a code-breaking hut.",
    need: 80,
    minutes: 10,
    reward: { tokens: 2, cash: 120 },
  },
  {
    id: "ballistics",
    era: "tubes",
    title: "WARTIME BALLISTICS",
    text: "The army needs 100 vacuum-tube firing tables in 10 minutes.",
    need: 100,
    minutes: 10,
    reward: { tokens: 2, cash: 150 },
  },
];

function eraReached(state, eraId) {
  const i = indexOfBusiness(eraId);
  return i >= 0 && (state?.biz?.[i]?.owned || 0) > 0;
}

function nextSpec(state) {
  const done = new Set(state?.contractsDone || []);
  return CONTRACTS.find((spec) => !done.has(spec.id) && eraReached(state, spec.era)) || null;
}

export function contractSpec(id) {
  return CONTRACTS.find((row) => row.id === id) || null;
}

export function readContract(raw) {
  if (!raw || typeof raw !== "object") return null;
  const spec = contractSpec(raw.id);
  if (!spec) return null;
  const status = raw.status === "active" || raw.status === "offered" ? raw.status : "offered";
  return {
    id: spec.id,
    status,
    progress: Number.isFinite(raw.progress) && raw.progress > 0 ? raw.progress : 0,
    acceptedAt: Number.isFinite(raw.acceptedAt) ? raw.acceptedAt : 0,
    deadlineAt: Number.isFinite(raw.deadlineAt) ? raw.deadlineAt : 0,
    remainMs: Number.isFinite(raw.remainMs) ? raw.remainMs : spec.minutes * 60 * 1000,
  };
}

export function offerNextContract(state, now = Date.now()) {
  if (state.contract) return false;
  if ((state.contractDeferUntil || 0) > now) return false;
  const spec = nextSpec(state);
  if (!spec) return false;
  state.contract = {
    id: spec.id,
    status: "offered",
    progress: 0,
    acceptedAt: 0,
    deadlineAt: 0,
    remainMs: spec.minutes * 60 * 1000,
  };
  return true;
}

export function acceptContract(state, now = Date.now()) {
  const live = readContract(state.contract);
  const spec = live && contractSpec(live.id);
  if (!live || !spec || live.status !== "offered") return false;
  state.contract = {
    ...live,
    status: "active",
    acceptedAt: now,
    deadlineAt: now + spec.minutes * 60 * 1000,
    remainMs: spec.minutes * 60 * 1000,
    progress: 0,
  };
  return true;
}

export function skipContract(state, now = Date.now()) {
  if (!state.contract) return false;
  state.contract = null;
  state.contractDeferUntil = now + 10 * 60 * 1000;
  return true;
}

export function failContract(state, now = Date.now()) {
  if (!state.contract) return false;
  state.contract = null;
  state.contractDeferUntil = now + 5 * 60 * 1000;
  return true;
}

export function finishContract(state) {
  const live = readContract(state.contract);
  const spec = live && contractSpec(live.id);
  if (!live || !spec) return null;
  state.contractsDone = [...new Set([...(state.contractsDone || []), spec.id])];
  state.contract = null;
  if (spec.reward.tokens) state.tokens = (state.tokens || 0) + spec.reward.tokens;
  state.modStamp = (state.modStamp || 0) + 1;
  return spec;
}

export function noteContractProgress(state, index, cycles, owned) {
  const live = readContract(state.contract);
  if (!live || live.status !== "active") return;
  if (state.awayReplay) return;
  const spec = contractSpec(live.id);
  if (!spec) return;
  if (indexOfBusiness(spec.era) !== index || !(cycles > 0)) return;
  const units = cycles * (Number(owned) || 0);
  if (!(units > 0)) return;
  state.contract = { ...live, progress: (live.progress || 0) + units };
}

export function tickContracts(state, now, { hidden = false } = {}) {
  const notes = [];
  if (hidden) return notes;
  offerNextContract(state, now);
  const live = readContract(state.contract);
  if (!live) return notes;
  const spec = contractSpec(live.id);
  if (!spec) {
    state.contract = null;
    return notes;
  }
  if (live.status === "active") {
    if (live.progress >= spec.need) {
      notes.push({ type: "contract-done", id: spec.id, spec });
      return notes;
    }
    if (live.deadlineAt && now >= live.deadlineAt) {
      failContract(state, now);
      notes.push({ type: "contract-fail", id: spec.id, spec });
    }
  }
  return notes;
}
