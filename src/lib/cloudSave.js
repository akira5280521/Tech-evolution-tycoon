// Google Play Games account and cloud save.
//
// The cloud copy is the same backup code the Save Backup panel makes, so a
// cloud save is checked by decodeSave/migrateSave exactly like a pasted code.
//
// Rules, so a cloud save never silently wipes progress:
// - Nothing is uploaded until this session has compared the cloud copy with
//   the phone's save (the "check"). A fresh install therefore can't overwrite
//   a better cloud save before the player sees it.
// - If the cloud copy has more career earnings than the phone, the player is
//   asked which one to keep. Loading always needs a tap.
// - Auto upload is a setting the player can turn off. Uploads are at most
//   once a minute: when the app goes to the background and every 5 minutes.
//
// On the web build, or a build without a Play Games project id, every call
// answers { configured: false } and the account panel says so.

import { decodeSave, summarize } from "./saveCode.js";
import { getSaveData } from "./gameSave.js";
import { loadNativePlugin } from "./nativePlugin.js";

const PREFS_KEY = "pc-tycoon-cloud-v1";
export const UPLOAD_EVERY_MS = 5 * 60 * 1000;
export const STATUS_TIMEOUT_MS = 8000;
const MIN_GAP_MS = 60 * 1000;

// { pg } so a Capacitor plugin proxy is never itself a promise value.
let pluginBox = null;
let pluginLoading = null;
let statusTimeoutMs = STATUS_TIMEOUT_MS;

function plugin() {
  if (pluginBox) return Promise.resolve(pluginBox);
  if (pluginLoading) return pluginLoading;
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  if (!cap || typeof cap.isNativePlatform !== "function" || !cap.isNativePlatform()) {
    pluginBox = { pg: null };
    return Promise.resolve(pluginBox);
  }
  pluginLoading = loadNativePlugin("PlayGames")
    .then(({ plugin: pg }) => {
      pluginBox = { pg };
      return pluginBox;
    })
    .catch(() => {
      pluginBox = { pg: null };
      return pluginBox;
    });
  return pluginLoading;
}

// Tests swap in a fake plugin. The fake is stored on a plain object, never
// passed to Promise.resolve, so a thenable proxy cannot hang the caller.
export function setPluginForTests(fake) {
  pluginBox = { pg: fake ?? null };
  pluginLoading = null;
}

export function setStatusTimeoutForTests(ms) {
  statusTimeoutMs = ms;
}

export function resetCloudForTests() {
  pluginBox = null;
  pluginLoading = null;
  statusTimeoutMs = STATUS_TIMEOUT_MS;
  state = blankState();
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function readPrefs() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(PREFS_KEY) || "{}");
    return { auto: raw.auto !== false, lastUpload: Number(raw.lastUpload) || 0 };
  } catch {
    return { auto: true, lastUpload: 0 };
  }
}

function writePrefs(partial) {
  const next = { ...readPrefs(), ...partial };
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: the setting lasts for this visit */
  }
  return next;
}

// Shared state for the account panel and the background sync.
// phase: "idle" (not checked yet) | "checking" | "ask" (waiting on the player)
//        | "ready" (checked; uploads allowed) | "off" (not available)
function blankState() {
  return {
    configured: null,
    signedIn: false,
    name: null,
    phase: "idle",
    busy: false,
    cloud: null, // { summary, code, modified } when the cloud copy is being offered
    lastUpload: 0,
    auto: true,
    error: "",
  };
}

let state = blankState();
const listeners = new Set();

function set(partial) {
  state = { ...state, ...partial };
  for (const fn of listeners) fn();
}

export function getCloudState() {
  return state;
}

export function subscribeCloud(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function errorText(e, fallback) {
  const message = e && typeof e.message === "string" ? e.message : "";
  return message && message.length < 120 ? message : fallback;
}

function prefsNow() {
  return typeof window !== "undefined" ? readPrefs() : { auto: true, lastUpload: 0 };
}

function markUnavailable(prefs) {
  set({
    configured: false,
    signedIn: false,
    name: null,
    phase: "unavailable",
    busy: false,
    auto: prefs.auto,
    lastUpload: prefs.lastUpload,
    error: "Play Games didn't answer.",
  });
}

/** Ask the plugin whether we're signed in. Never shows Google UI. */
export async function refreshStatus() {
  const prefs = prefsNow();
  let box = null;
  try {
    box = await withTimeout(plugin(), statusTimeoutMs);
  } catch {
    markUnavailable(prefs);
    return state;
  }
  const p = box?.pg ?? null;
  if (!p) {
    set({ configured: false, signedIn: false, phase: "off", auto: prefs.auto, lastUpload: prefs.lastUpload, error: "" });
    return state;
  }
  try {
    const out = await withTimeout(p.status(), statusTimeoutMs);
    set({
      configured: !!out?.configured,
      signedIn: !!out?.signedIn,
      name: out?.name || null,
      phase: out?.configured ? (state.phase === "unavailable" ? "idle" : state.phase) : "off",
      auto: prefs.auto,
      lastUpload: prefs.lastUpload,
      error: "",
    });
  } catch {
    markUnavailable(prefs);
  }
  return state;
}

export async function signIn() {
  const box = await plugin();
  const p = box?.pg ?? null;
  if (!p) return state;
  set({ busy: true, error: "" });
  try {
    const out = await withTimeout(p.signIn(), statusTimeoutMs);
    set({ configured: !!out?.configured, signedIn: !!out?.signedIn, name: out?.name || null, busy: false });
  } catch (e) {
    set({ busy: false, error: errorText(e, "Sign-in didn't finish. Try again.") });
  }
  return state;
}

export function setAutoUpload(on) {
  const prefs = writePrefs({ auto: !!on });
  set({ auto: prefs.auto });
}

/** Read the cloud copy and check it like a pasted backup code. */
async function readCloud(p) {
  const out = await p.loadCloud();
  if (!out?.configured || !out.found || !out.data) return { found: false };
  const decoded = await decodeSave(out.data);
  if (!decoded.ok) return { found: true, bad: true };
  return { found: true, code: out.data, data: decoded.data, summary: decoded.summary, modified: Number(out.modified) || null };
}

/**
 * The once-per-session comparison. `localSummary` is summarize() of the
 * phone's save. Returns "ask" when the cloud copy is ahead and the player
 * must choose; otherwise uploads become allowed.
 */
export async function checkCloud(localSummary) {
  if (state.phase === "checking" || state.phase === "ask" || state.phase === "ready") return state.phase;
  const box = await plugin();
  const p = box?.pg ?? null;
  if (!p || !state.configured || !state.signedIn) return state.phase;
  set({ phase: "checking", error: "" });
  try {
    const cloud = await readCloud(p);
    if (cloud.found && !cloud.bad && cloud.summary.career > (localSummary?.career || 0)) {
      set({ phase: "ask", cloud });
      return "ask";
    }
    set({ phase: "ready", cloud: null });
    return "ready";
  } catch (e) {
    // Try again on the next refresh; don't upload over something we couldn't read.
    set({ phase: "idle", error: errorText(e, "Couldn't reach the Play Games save.") });
    return "idle";
  }
}

/** The player chose to keep the phone's save over the cloud copy. */
export function keepLocal() {
  set({ phase: "ready", cloud: null });
}

/** Offer the cloud copy again from the account panel (manual load). */
export async function fetchCloudForLoad() {
  const box = await plugin();
  const p = box?.pg ?? null;
  if (!p) return null;
  set({ busy: true, error: "" });
  try {
    const cloud = await readCloud(p);
    set({ busy: false });
    if (!cloud.found) {
      set({ error: "There's no cloud save on this Google account yet." });
      return null;
    }
    if (cloud.bad) {
      set({ error: "The cloud save couldn't be read." });
      return null;
    }
    return cloud;
  } catch (e) {
    set({ busy: false, error: errorText(e, "Couldn't reach the Play Games save.") });
    return null;
  }
}

/** After the player loaded a cloud copy, uploads are allowed again. */
export function cloudLoaded() {
  set({ phase: "ready", cloud: null });
}

/**
 * Upload `code` (a backup code). `force` is a tap on SAVE TO CLOUD NOW,
 * which still needs the session check to have happened.
 */
export async function upload(code, { force = false, label = "" } = {}) {
  const box = await plugin();
  const p = box?.pg ?? null;
  if (!p || !state.configured || !state.signedIn || state.phase !== "ready") return false;
  if (!force && !state.auto) return false;
  const now = Date.now();
  if (!force && now - state.lastUpload < MIN_GAP_MS) return false;
  if (!code) return false;
  if (force) set({ busy: true, error: "" });
  try {
    await p.saveCloud({ data: code, description: label || "Tech Evolution Tycoon save" });
    const prefs = writePrefs({ lastUpload: now });
    set({ lastUpload: prefs.lastUpload, busy: false });
    return true;
  } catch (e) {
    set({ busy: false, error: force ? errorText(e, "Couldn't save to Play Games.") : state.error });
    return false;
  }
}

/** summarize() of the save on this phone, for the session check. */
export function localSummary() {
  const saved = getSaveData();
  return saved ? summarize(saved) : { career: 0 };
}
