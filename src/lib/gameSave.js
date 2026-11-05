// Shared access to the game's localStorage save slot, used by the game screen
// (read/write) and the settings screen (read-only analytics).

export const SAVE_KEY = "pc-tycoon-save-v1";

export function getSaveData() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSaveData(data) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — this session simply won't persist */
  }
}

export function clearSaveData() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* nothing stored */
  }
}