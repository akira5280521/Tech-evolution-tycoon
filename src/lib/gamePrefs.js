// Phone settings live outside the empire save so a reset of the businesses
// does not also flip sound, text size, or the away-time reminder.

const KEY = "pc-tycoon-prefs-v1";
export const PREFS_EVENT = "pc-tycoon-prefs";

function pct(n, fallback) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function normalizePrefs(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const numberFormat = src.numberFormat === "scientific" || src.numberFormat === "words" ? src.numberFormat : "short";
  const textSize = src.textSize === "large" || src.textSize === "xl" ? src.textSize : "normal";
  return {
    sound: src.sound !== false,
    compact: src.compact === true,
    musicVolume: pct(src.musicVolume, 70),
    musicMuted: src.musicMuted === true,
    effectsVolume: pct(src.effectsVolume, 100),
    effectsMuted: src.effectsMuted === true,
    haptics: src.haptics !== false,
    notifyCap: src.notifyCap === true,
    numberFormat,
    textSize,
    contrast: src.contrast === true,
    colorblind: src.colorblind === true,
    goalsHidden: src.goalsHidden === true,
    // The game screen section last shown: "tech" (default) or "supply".
    gameSection: src.gameSection === "supply" ? "supply" : "tech",
  };
}

export function readPrefs() {
  try {
    return normalizePrefs(JSON.parse(window.localStorage.getItem(KEY) || "{}"));
  } catch {
    return normalizePrefs({});
  }
}

export function writePrefs(partial) {
  const next = normalizePrefs({ ...readPrefs(), ...partial });
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — the change still applies for this visit */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PREFS_EVENT));
  return next;
}
