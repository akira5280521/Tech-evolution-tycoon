import { readPrefs, writePrefs } from "@/lib/gamePrefs";
import { NOTE_IDS, notifyPlan } from "@/lib/notifyPlan";

// One local notification for the moment away-time stops paying. Off unless
// the player turns it on. Permission is requested only from that switch.
// Opening the app cancels the pending one.

const NOTE_ID = NOTE_IDS.cap;
const ALL_IDS = Object.values(NOTE_IDS);
const CHANNEL_ID = "away-cap";

function native() {
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  return !!(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform());
}

// Why the last permission step failed, for the help line and the error log.
let lastReason = "";
export function notifyFailReason() {
  return lastReason;
}

async function plugin() {
  if (!native()) return null;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    return LocalNotifications;
  } catch (e) {
    lastReason = `plugin: ${e?.message || e}`;
    return null;
  }
}

async function ensureChannel(notes) {
  if (typeof notes.createChannel !== "function") return;
  try {
    await notes.createChannel({
      id: CHANNEL_ID,
      name: "Away time",
      description: "A reminder when away time fills up",
      importance: 3,
      visibility: 1,
    });
  } catch {
    /* the channel already exists, or this platform has no channels */
  }
}

// "granted" the app may post. "denied" Android will not show the prompt again
// (or the player just said no). "unavailable" this build has no notifier.
export async function requestNotifyPermission() {
  const notes = await plugin();
  if (!notes) return native() ? "unavailable" : "granted";
  try {
    const current = await notes.checkPermissions();
    if (current?.display === "granted") {
      await ensureChannel(notes);
      return "granted";
    }
    // Android 13+ shows the POST_NOTIFICATIONS prompt here.
    const next = await notes.requestPermissions();
    if (next?.display === "granted") {
      await ensureChannel(notes);
      return "granted";
    }
    lastReason = `permission: ${next?.display || "none"}`;
    return "denied";
  } catch (e) {
    lastReason = `request: ${e?.message || e}`;
    return "unavailable";
  }
}

export async function notificationPermission() {
  const notes = await plugin();
  if (!notes) return native() ? "unavailable" : "granted";
  try {
    const current = await notes.checkPermissions();
    return current?.display === "granted" ? "granted" : "denied";
  } catch {
    return "unavailable";
  }
}

export async function openNotificationSettings() {
  if (!native()) return false;
  try {
    const { registerPlugin } = await import("@capacitor/core");
    const InstallSource = registerPlugin("InstallSource");
    await InstallSource.openNotificationSettings();
    return true;
  } catch {
    return false;
  }
}

export async function cancelCapNotification() {
  const notes = await plugin();
  if (!notes) return;
  try {
    await notes.cancel({ notifications: ALL_IDS.map((id) => ({ id })) });
  } catch {
    /* nothing scheduled */
  }
}

// Schedule cap, research-done and bins-full reminders for the time away.
// No permission prompt here. One of each, with a cooldown so they do not spam.
export async function scheduleCapNotification(state) {
  const prefs = readPrefs();
  if (!prefs.notifyCap && !prefs.notifyResearch && !prefs.notifyBins) {
    await cancelCapNotification();
    return;
  }
  const notes = await plugin();
  if (!notes) return;
  try {
    const perm = await notes.checkPermissions();
    if (perm.display !== "granted") return;
    await ensureChannel(notes);
    const now = Date.now();
    const plan = notifyPlan(state, prefs, now);
    await notes.cancel({ notifications: ALL_IDS.map((id) => ({ id })) });
    if (!plan.length) return;
    await notes.schedule({
      notifications: plan.map((item) => ({
        id: item.id,
        channelId: CHANNEL_ID,
        title: item.title,
        body: item.body,
        schedule: {
          at: new Date(item.at),
          allowWhileIdle: true,
          // Inexact on purpose: it can be a few minutes late, and it does
          // not need the exact-alarm permission.
          isExactNotification: false,
        },
      })),
    });
    const notifyAt = { ...(prefs.notifyAt || {}) };
    for (const item of plan) notifyAt[item.type] = now;
    writePrefs({ notifyAt });
  } catch {
    /* scheduling failed; the game still pays when it opens */
  }
}
