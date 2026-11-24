import { readPrefs } from "@/lib/gamePrefs";
import { offlineCapMs } from "@/lib/empire";
import { researchFinishTimes } from "@/lib/research";

// One local notification for the moment away-time stops paying. Off unless
// the player turns it on. Permission is requested only from that switch.
// Opening the app cancels the pending one.

const NOTE_ID = 22022;
const CHANNEL_ID = "away-cap";
// One per research slot.
const RESEARCH_IDS = [22023, 22024];
const RESEARCH_CHANNEL = "research-done";

function native() {
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  return !!(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform());
}

async function plugin() {
  if (!native()) return null;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    return LocalNotifications;
  } catch {
    return null;
  }
}

async function ensureChannel(notes) {
  if (typeof notes.createChannel !== "function") return;
  const channels = [
    { id: CHANNEL_ID, name: "Away time", description: "A reminder when away time fills up" },
    { id: RESEARCH_CHANNEL, name: "Research done", description: "A reminder when a research project finishes" },
  ];
  for (const c of channels) {
    try {
      await notes.createChannel({ ...c, importance: 3, visibility: 1 });
    } catch {
      /* the channel already exists, or this platform has no channels */
    }
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
    const next = await notes.requestPermissions();
    if (next?.display === "granted") {
      await ensureChannel(notes);
      return "granted";
    }
    return "denied";
  } catch {
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
    await notes.cancel({ notifications: [{ id: NOTE_ID }] });
  } catch {
    /* nothing scheduled */
  }
}

// Schedule for the instant the away cap is hit. No permission prompt here.
export async function scheduleCapNotification(state) {
  if (!readPrefs().notifyCap) {
    await cancelCapNotification();
    return;
  }
  const notes = await plugin();
  if (!notes) return;
  try {
    const perm = await notes.checkPermissions();
    if (perm.display !== "granted") return;
    await ensureChannel(notes);
    const hiddenAt = state?.hiddenAt || Date.now();
    const when = hiddenAt + offlineCapMs(state);
    if (when <= Date.now() + 5000) {
      await cancelCapNotification();
      return;
    }
    await notes.cancel({ notifications: [{ id: NOTE_ID }] });
    await notes.schedule({
      notifications: [
        {
          id: NOTE_ID,
          channelId: CHANNEL_ID,
          title: "Away time is full",
          body: "Your managers have hit the away-time cap. Open Tech Evolution Tycoon to keep earning.",
          schedule: {
            at: new Date(when),
            allowWhileIdle: true,
            // Inexact on purpose: it can be a few minutes late, and it does
            // not need the exact-alarm permission.
            isExactNotification: false,
          },
        },
      ],
    });
  } catch {
    /* scheduling failed; the game still pays when it opens */
  }
}

export async function cancelResearchNotification() {
  const notes = await plugin();
  if (!notes) return;
  try {
    await notes.cancel({ notifications: RESEARCH_IDS.map((id) => ({ id })) });
  } catch {
    /* nothing scheduled */
  }
}

// One notification for each project that finishes while away (before the
// away cap stops research). No permission prompt here.
export async function scheduleResearchNotification(state) {
  if (!readPrefs().notifyResearch) {
    await cancelResearchNotification();
    return;
  }
  const notes = await plugin();
  if (!notes) return;
  try {
    const perm = await notes.checkPermissions();
    if (perm.display !== "granted") return;
    await ensureChannel(notes);
    const from = state?.hiddenAt || Date.now();
    const soon = researchFinishTimes(state, from, offlineCapMs(state)).filter((x) => x.at > Date.now() + 5000);
    await notes.cancel({ notifications: RESEARCH_IDS.map((id) => ({ id })) });
    if (!soon.length) return;
    await notes.schedule({
      notifications: soon.slice(0, RESEARCH_IDS.length).map((x, i) => ({
        id: RESEARCH_IDS[i],
        channelId: RESEARCH_CHANNEL,
        title: "Research done",
        body: `${x.name} research is finished. Open Tech Evolution Tycoon to start the next project.`,
        schedule: { at: new Date(x.at), allowWhileIdle: true, isExactNotification: false },
      })),
    });
  } catch {
    /* scheduling failed; the research still finishes when the game opens */
  }
}
