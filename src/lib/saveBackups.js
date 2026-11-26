// Rolling local backups of the save: the last 3 snapshots, at most one every
// 10 minutes, plus one taken just before a restore or reset replaces the save.
// Kept in their own localStorage key so a bad write to the main slot can be
// undone from MORE > Settings > Save Backup.
export const BACKUP_KEY = "pc-tycoon-save-backups-v1";
export const BACKUP_MAX = 3;
export const BACKUP_EVERY_MS = 10 * 60 * 1000;

function store() {
  return typeof window !== "undefined" ? window.localStorage : null;
}

export function readBackups() {
  try {
    const list = JSON.parse(store()?.getItem(BACKUP_KEY) || "[]");
    return Array.isArray(list) ? list.filter((b) => b && typeof b.at === "number" && b.data && typeof b.data === "object") : [];
  } catch {
    return [];
  }
}

function summary(data) {
  return {
    lifetime: Number(data.lifetime) || 0,
    investors: Number(data.investors) || 0,
    eras: Array.isArray(data.biz) ? data.biz.filter((b) => (b?.owned || 0) > 0).length : 0,
  };
}

// Pure: the list after adding `data` at `now`. `force` skips the 10-minute gap.
export function nextBackups(list, data, now, force = false) {
  if (!data || typeof data !== "object") return list;
  const last = list[0];
  if (!force && last && now - last.at < BACKUP_EVERY_MS) return list;
  return [{ at: now, ...summary(data), data }, ...list].slice(0, BACKUP_MAX);
}

// Last backup time, cached so the every-few-seconds autosave doesn't re-read
// the backups on every write.
let lastAt = null;
export function backupDue(now = Date.now()) {
  if (lastAt == null) lastAt = readBackups()[0]?.at || 0;
  return now - lastAt >= BACKUP_EVERY_MS;
}

export function backupSave(data, now = Date.now(), force = false) {
  const s = store();
  if (!s) return;
  const list = readBackups();
  const next = nextBackups(list, data, now, force);
  if (next === list) return;
  // Drop the oldest until it fits if storage is nearly full.
  for (let keep = next.length; keep > 0; keep--) {
    try {
      s.setItem(BACKUP_KEY, JSON.stringify(next.slice(0, keep)));
      lastAt = now;
      return;
    } catch {
      /* quota: try with fewer */
    }
  }
}
