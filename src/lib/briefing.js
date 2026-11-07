// Daily briefing clock. The set rolls at local midnight. A visit on the next
// calendar day continues the streak; a missed day starts it over at 1.

export const DAILY_TIPS = [
  "Hire a manager and that era keeps paying while the tab is closed.",
  "The first investor arrives at $1T lifetime earnings.",
  "Milestones at 25, 50, 100, 150, 200, and 220 multiply a whole era.",
  "Run All fires every machine that still needs a click.",
  "A hidden tab keeps earning, but only for eight hours.",
  "Later eras cost more up front and pay more once they are running.",
];

export function localDayKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function previousDayKey(dayKey) {
  const [y, m, d] = dayKey.split("-").map((n) => Number(n));
  if (!y || !m || !d) return null;
  return localDayKey(new Date(y, m - 1, d - 1));
}

export function msUntilNextLocalMidnight(now = Date.now()) {
  const d = new Date(now);
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return Math.max(0, next.getTime() - now);
}

export function formatCountdown(ms) {
  const totalMin = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 1) return `${h}h ${m}m`;
  return `${m}m`;
}

export function dailyTip(dayKey) {
  let n = 0;
  const key = String(dayKey || "");
  for (let i = 0; i < key.length; i++) n = (n + key.charCodeAt(i)) % DAILY_TIPS.length;
  return DAILY_TIPS[n];
}

// Mutates the save slice. Returns true when the calendar day changed.
export function applyBriefing(state, now = Date.now()) {
  const today = localDayKey(now);
  const prev = state.briefingDay;
  if (prev === today) return false;
  if (prev && prev === previousDayKey(today)) state.streak = Math.max(1, Math.floor(state.streak) || 1) + 1;
  else state.streak = 1;
  state.briefingDay = today;
  return true;
}
