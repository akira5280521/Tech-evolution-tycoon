// The Rigs garage: cosmetic snapshots of the PC on the Build Bench.
// Saved builds do not add production or change balance. They are kept
// through prestige, forks and challenges, like museum cards. The HQ card
// still waits for Home Computers this run, same as the Bench.

import { BUSINESSES, money } from "./gameConfig.js";
import { ERA_YEAR, playerYear } from "./eraYear.js";
import { PARTS, benchLimit, benchStock, facilityUnlocked, partCost } from "./facilities.js";

export const RIGS_CAP = 12;
export const RIGS_ROUTE = "/garage";
export const RIGS_ICON = "/icons/facilities/rigs.png";

const BENCH_PART = new Map(PARTS.filter((p) => (p.fits || []).includes("bench")).map((p) => [p.id, p]));

export function benchCounts(state) {
  const raw = state?.facilities?.bench;
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const [id, n] of Object.entries(raw)) {
    const count = Math.floor(Number(n) || 0);
    if (count > 0 && BENCH_PART.has(id)) out[id] = count;
  }
  return out;
}

export function benchHasParts(counts) {
  return Object.values(counts || {}).some((n) => n > 0);
}

function ownedParts(counts) {
  const list = [];
  for (const [id, n] of Object.entries(counts || {})) {
    const part = BENCH_PART.get(id);
    if (part && n > 0) list.push({ part, count: n });
  }
  return list;
}

export function formatRam(mb) {
  const n = Number(mb) || 0;
  const pretty = (value, unit) => {
    const rounded = Math.round(value * 1000) / 1000;
    const text = Number.isInteger(rounded) ? String(rounded) : String(rounded);
    return `${text} ${unit}`;
  };
  if (n >= 1024 * 1024) return pretty(n / (1024 * 1024), "TB");
  if (n >= 1024) return pretty(n / 1024, "GB");
  if (n >= 1) return pretty(n, "MB");
  // Early bench sticks store 16 KB as 0.016 (16 × 0.001), not 16/1024.
  const kbDecimal = n * 1000;
  const kbBinary = n * 1024;
  const kb = Math.abs(kbDecimal - Math.round(kbDecimal)) < 1e-6 ? kbDecimal : kbBinary;
  if (kb >= 1) return pretty(kb, "KB");
  return pretty(n * 1024 * 1024, "B");
}

export function formatRate(n) {
  const rate = Number(n) || 0;
  const text = rate >= 10 ? rate.toFixed(1) : rate >= 0.1 ? rate.toFixed(2) : rate.toFixed(3);
  return `+${text} R&D/s`;
}

export function rigValue(counts) {
  let total = 0;
  for (const { part, count } of ownedParts(counts)) {
    for (let i = 0; i < count; i++) {
      const cost = partCost(part, i);
      if (Number.isFinite(cost)) total += cost;
    }
  }
  return total;
}

export function rigOutput(counts) {
  return benchStock(counts || {}).perSecond || 0;
}

export function rigLimit(counts) {
  return benchLimit(counts || {}) || "";
}

export function rigSlots(counts) {
  const owned = ownedParts(counts);
  const ofKind = (kind) => owned.filter((row) => row.part.kind === kind);
  const slots = [];
  const cpu = ofKind("cpu")[0];
  slots.push(cpu
    ? { slot: "CPU", name: cpu.part.name, icon: cpu.part.icon, id: cpu.part.id }
    : { slot: "CPU", name: "—", icon: "", id: "" });
  const gpu = ofKind("video")[0] || ofKind("accel")[0];
  slots.push(gpu
    ? { slot: "GPU", name: gpu.part.name, icon: gpu.part.icon, id: gpu.part.id }
    : { slot: "GPU", name: "Built-in video", icon: "", id: "" });
  const sticks = ofKind("stick");
  if (sticks.length) {
    const ramMb = sticks.reduce((sum, row) => sum + (row.part.mb || 0) * row.count, 0);
    slots.push({ slot: "RAM", name: formatRam(ramMb), icon: sticks[0].part.icon, id: sticks[0].part.id });
  }
  const drive = ofKind("drive")[0];
  if (drive) slots.push({ slot: "STORAGE", name: drive.part.name, icon: drive.part.icon, id: drive.part.id });
  const crate = ofKind("case")[0];
  if (crate) slots.push({ slot: "CASE", name: crate.part.name, icon: crate.part.icon, id: crate.part.id });
  return slots;
}

// Icons for the composed thumbnail: a case or board, then a GPU or CPU, then RAM or storage.
export function rigThumbParts(counts) {
  const owned = ownedParts(counts);
  const pick = (...kinds) => owned.find((row) => kinds.includes(row.part.kind))?.part;
  return [pick("case", "board"), pick("video", "accel", "cpu"), pick("stick", "drive", "monitor")].filter(Boolean);
}

function eraNameAt(year) {
  let name = BUSINESSES[0]?.name || "RIG";
  let best = -Infinity;
  for (const cfg of BUSINESSES) {
    const at = ERA_YEAR[cfg.id];
    if (at != null && at <= year && at >= best) {
      best = at;
      name = cfg.name;
    }
  }
  return name;
}

export function autoRigName(state, counts, taken = []) {
  const owned = ownedParts(counts);
  const year = Math.max(0, ...owned.map((row) => row.part.year || 0), 0) || playerYear(state) || 0;
  const crate = owned.find((row) => row.part.kind === "case")?.part;
  const board = owned.find((row) => row.part.kind === "board")?.part;
  let label = (crate || board)?.name || eraNameAt(year);
  label = label.replace(/\s+board$/i, "").trim() || eraNameAt(year);
  const base = `${year} ${label}`.toUpperCase();
  const have = new Set((taken || []).map((name) => String(name).toUpperCase()));
  if (!have.has(base)) return base;
  for (let n = 2; n <= RIGS_CAP + 1; n++) {
    const next = `${base} ${n}`;
    if (!have.has(next)) return next;
  }
  return `${base} ${Date.now()}`;
}

export function readRigs(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    if (out.length >= RIGS_CAP) break;
    const id = typeof row.id === "string" ? row.id.slice(0, 40).trim() : "";
    const name = typeof row.name === "string" ? row.name.replace(/\s+/g, " ").trim().slice(0, 48) : "";
    if (!id || !name || seen.has(id)) continue;
    const parts = {};
    if (row.parts && typeof row.parts === "object") {
      for (const [partId, n] of Object.entries(row.parts)) {
        const count = Math.floor(Number(n) || 0);
        if (count > 0 && BENCH_PART.has(partId)) parts[partId] = Math.min(count, 16);
      }
    }
    if (!benchHasParts(parts)) continue;
    seen.add(id);
    out.push({
      id,
      name,
      savedAt: Number.isFinite(row.savedAt) ? row.savedAt : 0,
      parts,
    });
  }
  return out;
}

export function rigsOpen(state) {
  return facilityUnlocked(state, "bench");
}

function nextRigId(existing) {
  const have = new Set((existing || []).map((row) => row.id));
  for (let i = 0; i < 50; i++) {
    const id = `r-${Date.now().toString(36)}${i ? i.toString(36) : ""}`;
    if (!have.has(id)) return id;
  }
  return `r-${Math.random().toString(36).slice(2, 10)}`;
}

// Snapshot the PC on the bench into the garage. Cosmetic only: no production.
export function saveRig(state) {
  if (!state) return { ok: false, reason: "no-state" };
  if (!rigsOpen(state)) return { ok: false, reason: "locked" };
  const parts = benchCounts(state);
  if (!benchHasParts(parts)) return { ok: false, reason: "empty" };
  const list = readRigs(state.rigs);
  if (list.length >= RIGS_CAP) return { ok: false, reason: "full" };
  const rig = {
    id: nextRigId(list),
    name: autoRigName(state, parts, list.map((row) => row.name)),
    savedAt: Date.now(),
    parts: { ...parts },
  };
  state.rigs = [...list, rig];
  return { ok: true, rig };
}

export function deleteRig(state, id) {
  if (!state || typeof id !== "string") return { ok: false, reason: "no-state" };
  const list = readRigs(state.rigs);
  const next = list.filter((row) => row.id !== id);
  if (next.length === list.length) return { ok: false, reason: "missing" };
  state.rigs = next;
  return { ok: true };
}

export function rigStats(counts) {
  const output = rigOutput(counts);
  return {
    output,
    outputLabel: formatRate(output),
    value: rigValue(counts),
    valueLabel: money(rigValue(counts)),
    limit: rigLimit(counts),
    slots: rigSlots(counts),
    thumbs: rigThumbParts(counts),
  };
}
