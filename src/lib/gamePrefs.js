// Sound and row density live outside the empire save so a reset of the
// businesses does not also flip the player's phone settings.

const KEY = "pc-tycoon-prefs-v1";

export function readPrefs() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "{}");
    return {
      sound: raw.sound !== false,
      compact: raw.compact === true,
    };
  } catch {
    return { sound: true, compact: false };
  }
}

export function writePrefs(partial) {
  const next = { ...readPrefs(), ...partial };
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ sound: next.sound !== false, compact: next.compact === true }));
  } catch {
    /* storage unavailable — the toggle still works for this visit */
  }
  return next;
}
