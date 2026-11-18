import { readPrefs } from "@/lib/gamePrefs";

// Light tap on a buy, a stronger one on a milestone or a prestige.
// The web build has no vibration motor, so these are no-ops there.

function native() {
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  return !!(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform());
}

async function impact(style) {
  if (!native() || readPrefs().haptics === false) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle[style] });
  } catch {
    /* the plugin isn't linked yet, or this device has no vibrator */
  }
}

export function buzzLight() {
  void impact("Light");
}

export function buzzStrong() {
  void impact("Medium");
}
