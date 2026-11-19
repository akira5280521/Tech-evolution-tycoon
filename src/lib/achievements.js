import { BUSINESSES } from "@/lib/gameConfig";
import { investorPeak } from "@/lib/empire";

// Play Console achievement ids. Replace each placeholder in Play Console,
// then paste the real id here. A placeholder is never sent to Play Games.
// See docs/play-games-achievements.md.

export const ACHIEVEMENTS = [
  {
    id: "first-business",
    playId: "REPLACE_IN_PLAY_CONSOLE_first_business",
    name: "Open for business",
    description: "Buy your first business.",
    icon: "A timber camp with a coin on the sign.",
  },
  {
    id: "first-manager",
    playId: "REPLACE_IN_PLAY_CONSOLE_first_manager",
    name: "Hired help",
    description: "Hire your first manager.",
    icon: "A clipboard and a hard hat.",
  },
  {
    id: "era-punchcards",
    playId: "REPLACE_IN_PLAY_CONSOLE_era_punchcards",
    name: "Holes in the card",
    description: "Reach the Punch Cards era.",
    icon: "A stiff card with a grid of holes.",
  },
  {
    id: "era-tubes",
    playId: "REPLACE_IN_PLAY_CONSOLE_era_tubes",
    name: "Warm glass",
    description: "Reach the Vacuum Tubes era.",
    icon: "A glowing vacuum tube.",
  },
  {
    id: "era-transistors",
    playId: "REPLACE_IN_PLAY_CONSOLE_era_transistors",
    name: "Solid state",
    description: "Reach the Transistors era.",
    icon: "A metal-can transistor with three leads.",
  },
  {
    id: "era-cpu",
    playId: "REPLACE_IN_PLAY_CONSOLE_era_cpu",
    name: "On one chip",
    description: "Reach the Microprocessors era.",
    icon: "A black chip with gold pins.",
  },
  {
    id: "era-quantum",
    playId: "REPLACE_IN_PLAY_CONSOLE_era_quantum",
    name: "Both at once",
    description: "Reach the Quantum era.",
    icon: "A golden chandelier of wires.",
  },
  {
    id: "first-prestige",
    playId: "REPLACE_IN_PLAY_CONSOLE_first_prestige",
    name: "Backers",
    description: "Prestige for the first time.",
    icon: "A small crowd with briefcases.",
  },
  {
    id: "first-investor",
    playId: "REPLACE_IN_PLAY_CONSOLE_first_investor",
    name: "Head start",
    description: "Reach your first investor milestone.",
    icon: "A ribbon on a stack of contracts.",
  },
  {
    id: "first-challenge",
    playId: "REPLACE_IN_PLAY_CONSOLE_first_challenge",
    name: "House rules",
    description: "Win your first challenge.",
    icon: "A checkered flag over a factory.",
  },
];

const KEY = "pc-tycoon-achievements-v1";
const CALL_TIMEOUT_MS = 15 * 1000;

function isPlaceholder(playId) {
  return !playId || playId.startsWith("REPLACE_IN_PLAY_CONSOLE");
}

// Real Play Console ids replace the placeholders. Until then nothing is sent
// and the settings button stays a dead "coming soon" control.
export function achievementsLive() {
  return ACHIEVEMENTS.some((entry) => !isPlaceholder(entry.playId));
}

function owned(state, id) {
  const i = BUSINESSES.findIndex((cfg) => cfg.id === id);
  return i >= 0 && (state?.biz?.[i]?.owned || 0) > 0;
}

function boughtABusiness(state) {
  if ((state?.businessesBought || 0) > 0) return true;
  return (state?.biz || []).some((row, i) => (row?.owned || 0) > (i === 0 ? 1 : 0));
}

export function achievementIdsFor(state) {
  const ids = [];
  if (boughtABusiness(state)) ids.push("first-business");
  if ((state?.biz || []).some((row) => row?.manager)) ids.push("first-manager");
  if (owned(state, "punchcards")) ids.push("era-punchcards");
  if (owned(state, "tubes")) ids.push("era-tubes");
  if (owned(state, "transistors")) ids.push("era-transistors");
  if (owned(state, "cpu")) ids.push("era-cpu");
  if (owned(state, "quantum")) ids.push("era-quantum");
  if (state?.prestiged || (state?.prestigeCount || 0) > 0 || (state?.investors || 0) > 0) ids.push("first-prestige");
  if (investorPeak(state) >= 10) ids.push("first-investor");
  if ((state?.challengesDone || []).length > 0) ids.push("first-challenge");
  return ids;
}

function readBook() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "{}");
    return {
      sent: Array.isArray(raw.sent) ? raw.sent.filter((id) => typeof id === "string") : [],
      queued: Array.isArray(raw.queued) ? raw.queued.filter((id) => typeof id === "string") : [],
    };
  } catch {
    return { sent: [], queued: [] };
  }
}

function writeBook(book) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(book));
  } catch {
    /* the queue lasts for this visit */
  }
}

function timed(promise, ms = CALL_TIMEOUT_MS) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

let flushing = false;

export function noteProgress(state) {
  if (!achievementsLive() || typeof window === "undefined" || !state) return;
  const book = readBook();
  const known = new Set([...book.sent, ...book.queued]);
  const fresh = achievementIdsFor(state).filter((id) => !known.has(id));
  if (fresh.length) {
    book.queued = [...book.queued, ...fresh];
    writeBook(book);
  }
  void flushAchievements();
}

export async function flushAchievements() {
  if (!achievementsLive() || flushing || typeof window === "undefined") return;
  flushing = true;
  try {
    const { getCloudState, playCall } = await import("./cloudSave.js");
    const cloud = getCloudState();
    if (!cloud.configured || !cloud.signedIn) return;
    const book = readBook();
    const left = [];
    let stop = false;
    for (const id of book.queued) {
      if (stop || book.sent.includes(id)) {
        if (stop) left.push(id);
        continue;
      }
      const spec = ACHIEVEMENTS.find((entry) => entry.id === id);
      if (!spec || isPlaceholder(spec.playId)) {
        left.push(id);
        continue;
      }
      try {
        const out = await timed(playCall("unlockAchievement", { id: spec.playId }));
        if (out && out.configured === false) return;
        book.sent = [...book.sent, id];
      } catch {
        left.push(id);
        stop = true;
      }
    }
    book.queued = left;
    writeBook(book);
  } catch {
    /* Play Games isn't available; the queue stays */
  } finally {
    flushing = false;
  }
}

export async function openAchievements() {
  if (!achievementsLive()) return { ok: false };
  const { getCloudState, signIn, playCall } = await import("./cloudSave.js");
  let cloud = getCloudState();
  if (!cloud.configured) return { ok: false, reason: "Achievements come with the Google Play version." };
  if (!cloud.signedIn) {
    cloud = await signIn();
    if (!cloud.signedIn) return { ok: false, reason: cloud.error || "Sign in to open achievements." };
  }
  try {
    const out = await timed(playCall("showAchievements", {}));
    if (!out || out.opened === false) return { ok: false, reason: "Couldn't open achievements." };
    void flushAchievements();
    return { ok: true };
  } catch {
    return { ok: false, reason: "Play Games didn't answer. Try again." };
  }
}
