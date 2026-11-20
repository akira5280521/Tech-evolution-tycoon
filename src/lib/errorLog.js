// The last few errors, kept on this phone only so a tester's "it froze" can
// come with what actually broke. Shown in Copy my stats and attached to
// feedback; never sent on its own. Messages are cut short and stripped of
// long paths so they stay small.

const KEY = "pc-tycoon-errors-v1";
const MAX = 10;
const MAX_LEN = 180;

function clean(text) {
  return String(text || "Unknown error")
    .replace(/\s+/g, " ")
    .replace(/(https?|capacitor|file):\/\/[^\s)]+\/([^/\s)]+)/g, "$2")
    .slice(0, MAX_LEN);
}

export function readErrors() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((row) => row && typeof row.msg === "string")
      .slice(-MAX)
      .map((row) => ({ at: Number(row.at) || 0, msg: clean(row.msg), page: String(row.page || "").slice(0, 40), v: String(row.v || "").slice(0, 12), n: Math.max(1, Math.floor(Number(row.n) || 1)) }));
  } catch {
    return [];
  }
}

export function recordError(error, version = "") {
  try {
    if (typeof window === "undefined") return;
    const msg = clean(error?.message || error?.reason?.message || error?.reason || error);
    const page = (window.location?.pathname || "/") + (window.location?.hash || "");
    const list = readErrors();
    const last = list[list.length - 1];
    // The same error over and over (a render loop) counts once.
    if (last && last.msg === msg && last.page === page) {
      last.n += 1;
      last.at = Date.now();
    } else {
      list.push({ at: Date.now(), msg, page, v: version, n: 1 });
    }
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
  } catch {
    /* storage full or blocked: nothing to do */
  }
}

export function clearErrors() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing stored */
  }
}

let installed = false;
export function installErrorLog(version = "") {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (event) => recordError(event.error || event.message, version));
  window.addEventListener("unhandledrejection", (event) => recordError(event.reason, version));
}
