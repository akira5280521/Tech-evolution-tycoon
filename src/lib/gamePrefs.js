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
    // Shrink fully upgraded, auto-run rows to one line. Default on.
    collapseMaxed: src.collapseMaxed !== false,
    musicVolume: pct(src.musicVolume, 70),
    musicMuted: src.musicMuted === true,
    effectsVolume: pct(src.effectsVolume, 100),
    effectsMuted: src.effectsMuted === true,
    haptics: src.haptics !== false,
    notifyCap: src.notifyCap === true,
    notifyResearch: src.notifyResearch === true,
    notifyBins: src.notifyBins === true,
    notifyAt: {
      cap: Number.isFinite(Number(src.notifyAt?.cap)) ? Number(src.notifyAt.cap) : 0,
      research: Number.isFinite(Number(src.notifyAt?.research)) ? Number(src.notifyAt.research) : 0,
      bins: Number.isFinite(Number(src.notifyAt?.bins)) ? Number(src.notifyAt.bins) : 0,
    },
    numberFormat,
    textSize,
    // Facility room monitor glass: era-accurate (default), or a forced phosphor.
    monitorDisplay: src.monitorDisplay === "green" || src.monitorDisplay === "amber" || src.monitorDisplay === "color" ? src.monitorDisplay : "era",
    contrast: src.contrast === true,
    colorblind: src.colorblind === true,
    goalsHidden: src.goalsHidden === true,
    // The game screen section last shown: "tech" (default) or "supply".
    gameSection: src.gameSection === "supply" ? "supply" : "tech",
    // Museum exhibits the player has opened. Stored in prefs so viewing
    // never rewrites the empire save.
    museumViewed: Array.isArray(src.museumViewed)
      ? [...new Set(src.museumViewed.map((id) => String(id)).filter(Boolean))].slice(0, 2500)
      : [],
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
