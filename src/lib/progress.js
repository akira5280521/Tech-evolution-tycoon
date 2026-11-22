// Progress bars for timed jobs: how far along, and how long is left.
// Display only; the jobs themselves are advanced by research.js / empire.js.

function finite(n) {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

// A whole percent that only reads 100 when the job is really done.
function pctOf(done, total) {
  if (!(total > 0)) return 0;
  const p = (Math.max(0, done) / total) * 100;
  if (p >= 100) return 100;
  return Math.min(99, Math.max(0, Math.floor(p)));
}

// A TECH job ({ progressMs, durationMs }) running at `speed` (researchSpeed).
export function techProgress(job, speed = 1) {
  if (!job) return null;
  const total = finite(job.durationMs);
  const done = Math.min(total, finite(job.progressMs));
  const rate = Math.max(0.25, finite(speed) || 1);
  return { pct: pctOf(done, total), leftMs: Math.max(0, (total - done) / rate) };
}

// A wall-clock job that started at `startedAt` and takes `totalMs`.
export function timedProgress(startedAt, totalMs, now = Date.now()) {
  const total = finite(totalMs);
  if (!(total > 0)) return null;
  const done = Math.min(total, Math.max(0, finite(now) - finite(startedAt)));
  return { pct: pctOf(done, total), leftMs: Math.max(0, total - done) };
}

// "1h 12m", "4m 05s", "12s".
export function formatLeft(ms) {
  const total = Math.max(0, Math.ceil(finite(ms) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

// "42% · 1h 12m left"
export function progressLabel(progress) {
  if (!progress) return "";
  return `${progress.pct}% · ${formatLeft(progress.leftMs)} left`;
}
