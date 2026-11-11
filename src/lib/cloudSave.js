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

const PREFS_KEY = "pc-tycoon-cloud-v1";
export const UPLOAD_EVERY_MS = 5 * 60 * 1000;
const MIN_GAP_MS = 60 * 1000;

let pluginPromise = null;
function plugin() {
  if (pluginPromise) return pluginPromise;
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  if (!cap || typeof cap.isNativePlatform !== "function" || !cap.isNativePlatform()) {
    pluginPromise = Promise.resolve(null);
  } else {
    pluginPromise = import("@capacitor/core")
      .then(({ registerPlugin }) => registerPlugin("PlayGames"))
      .catch(() => null);
  }
  return pluginPromise;
}

// Tests swap in a fake plugin.
export function setPluginForTests(fake) {
  pluginPromise = Promise.resolve(fake);
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
let state = {
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

/** Ask the plugin whether we're signed in. Never shows Google UI. */
export async function refreshStatus() {
  const p = await plugin();
  const prefs = typeof window !== "undefined" ? readPrefs() : { auto: true, lastUpload: 0 };
  if (!p) {
    set({ configured: false, signedIn: false, phase: "off", auto: prefs.auto, lastUpload: prefs.lastUpload });
    return state;
  }
  try {
    const out = await p.status();
    set({
      configured: !!out?.configured,
      signedIn: !!out?.signedIn,
      name: out?.name || null,
      phase: out?.configured ? state.phase : "off",
      auto: prefs.auto,
      lastUpload: prefs.lastUpload,
    });
  } catch {
    set({ configured: false, signedIn: false, phase: "off" });
  }
  return state;
}

export async function signIn() {
  const p = await plugin();
  if (!p) return state;
  set({ busy: true, error: "" });
  try {
    const out = await p.signIn();
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
  const p = await plugin();
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
  const p = await plugin();
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
  const p = await plugin();
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
