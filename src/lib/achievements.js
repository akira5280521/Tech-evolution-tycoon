import { BUSINESSES } from "@/lib/gameConfig";
import { SPECIALTIES, investorPeak } from "@/lib/empire";
import { HISTORY_CARDS } from "@/lib/history";

// Play Console achievement ids. Points are set in the console; the game only
// unlocks. See docs/play-games-achievements.md.

export const ACHIEVEMENTS = [
  {
    id: "first-business",
    playId: "CgkI7-b2jZ8bEAIQAg",
    points: 25,
    name: "Open for business",
    description: "Buy your first business.",
  },
  {
    id: "first-manager",
    playId: "CgkI7-b2jZ8bEAIQAw",
    points: 25,
    name: "Hired help",
    description: "Hire your first manager.",
  },
  {
    id: "era-punchcards",
    playId: "CgkI7-b2jZ8bEAIQBA",
    points: 25,
    name: "Holes in the card",
    description: "Reach the Punch Cards era.",
  },
  {
    id: "era-tubes",
    playId: "CgkI7-b2jZ8bEAIQBQ",
    points: 25,
    name: "Warm glass",
    description: "Reach the Vacuum Tubes era.",
  },
  {
    id: "era-transistors",
    playId: "CgkI7-b2jZ8bEAIQBg",
    points: 25,
    name: "Solid state",
    description: "Reach the Transistors era.",
  },
  {
    id: "era-cpu",
    playId: "CgkI7-b2jZ8bEAIQBw",
    points: 25,
    name: "On one chip",
    description: "Reach the Microprocessors era.",
  },
  {
    id: "era-quantum",
    playId: "CgkI7-b2jZ8bEAIQCA",
    points: 25,
    name: "Both at once",
    description: "Reach the Quantum era.",
  },
  {
    id: "first-prestige",
    playId: "CgkI7-b2jZ8bEAIQCQ",
    points: 25,
    name: "Backers",
    description: "Prestige for the first time.",
  },
  {
    id: "first-investor",
    playId: "CgkI7-b2jZ8bEAIQCg",
    points: 25,
    name: "Head start",
    description: "Reach your first investor milestone.",
  },
  {
    id: "first-challenge",
    playId: "CgkI7-b2jZ8bEAIQCw",
    points: 25,
    name: "House rules",
    description: "Win your first challenge.",
  },
  { id: "era-loom", playId: "CgkI7-b2jZ8bEAIQDA", points: 10, name: "Woven code", description: "Reach the Jacquard Loom era." },
  { id: "era-ics", playId: "CgkI7-b2jZ8bEAIQDQ", points: 10, name: "Many on one", description: "Reach the Integrated Circuits era." },
  { id: "era-homepc", playId: "CgkI7-b2jZ8bEAIQDg", points: 10, name: "A computer on every desk", description: "Reach the Home Computers era." },
  { id: "era-gpu", playId: "CgkI7-b2jZ8bEAIQDw", points: 10, name: "Pixel pusher", description: "Reach the Graphics Cards era." },
  { id: "every-era", playId: "CgkI7-b2jZ8bEAIQEA", points: 100, name: "Full history", description: "Unlock every era." },
  { id: "own-100", playId: "CgkI7-b2jZ8bEAIQEQ", points: 10, name: "Mass production", description: "Own 100 of one business." },
  { id: "own-200", playId: "CgkI7-b2jZ8bEAIQEg", points: 45, name: "Industrial scale", description: "Own 200 of one business." },
  { id: "every-manager", playId: "CgkI7-b2jZ8bEAIQEw", points: 45, name: "Full staff", description: "Hire every manager." },
  { id: "earn-billion", playId: "CgkI7-b2jZ8bEAIQFA", points: 10, name: "Billion-dollar startup", description: "Earn your first $1 billion." },
  { id: "earn-trillion", playId: "CgkI7-b2jZ8bEAIQFQ", points: 45, name: "Trillionaire", description: "Earn your first $1 trillion." },
  { id: "prestige-10", playId: "CgkI7-b2jZ8bEAIQFg", points: 45, name: "Serial founder", description: "Prestige 10 times." },
  { id: "investors-1000", playId: "CgkI7-b2jZ8bEAIQFw", points: 45, name: "Board of directors", description: "Hold 1,000 investors." },
  { id: "fork-1", playId: "CgkI7-b2jZ8bEAIQGA", points: 45, name: "Spin-off", description: "Fork for the first time." },
  { id: "fork-5", playId: "CgkI7-b2jZ8bEAIQGQ", points: 100, name: "Conglomerate", description: "Fork 5 times." },
  { id: "bubble", playId: "CgkI7-b2jZ8bEAIQGg", points: 10, name: "Bubble survivor", description: "Live through the Dot-com Bubble." },
  { id: "y2k", playId: "CgkI7-b2jZ8bEAIQGw", points: 10, name: "Midnight, 2000", description: "Survive Y2K." },
  { id: "museum", playId: "CgkI7-b2jZ8bEAIQHA", points: 100, name: "Curator", description: "Fill the Museum." },
  { id: "specialties", playId: "CgkI7-b2jZ8bEAIQHQ", points: 45, name: "Lab coat", description: "Fill every research specialty." },
  { id: "lab-10", playId: "CgkI7-b2jZ8bEAIQHg", points: 10, name: "Side projects", description: "Finish 10 lab projects." },
  { id: "challenges-5", playId: "CgkI7-b2jZ8bEAIQHw", points: 45, name: "House champion", description: "Win 5 challenges." },
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
  return i >= 0 && ((state?.biz?.[i]?.owned || 0) > 0 || (state?.bestEra || 0) >= i);
}

function boughtABusiness(state) {
  if ((state?.businessesBought || 0) > 0) return true;
  return (state?.biz || []).some((row, i) => (row?.owned || 0) > (i === 0 ? 1 : 0));
}

function maxOwned(state) {
  const now = (state?.biz || []).reduce((n, row) => Math.max(n, row?.owned || 0), 0);
  return Math.max(state?.maxOwned || 0, now);
}

export function achievementIdsFor(state) {
  const ids = [];
  const events = new Set(state?.eventsDone || []);
  if (boughtABusiness(state)) ids.push("first-business");
  if ((state?.biz || []).some((row) => row?.manager)) ids.push("first-manager");
  if (owned(state, "loom")) ids.push("era-loom");
  if (owned(state, "punchcards")) ids.push("era-punchcards");
  if (owned(state, "tubes")) ids.push("era-tubes");
  if (owned(state, "transistors")) ids.push("era-transistors");
  if (owned(state, "ics")) ids.push("era-ics");
  if (owned(state, "cpu")) ids.push("era-cpu");
  if (owned(state, "homepc")) ids.push("era-homepc");
  if (owned(state, "gpu")) ids.push("era-gpu");
  if (owned(state, "quantum")) ids.push("era-quantum");
  if (BUSINESSES.every((cfg) => owned(state, cfg.id))) ids.push("every-era");
  if (maxOwned(state) >= 100) ids.push("own-100");
  if (maxOwned(state) >= 200) ids.push("own-200");
  if ((state?.biz || []).length === BUSINESSES.length && state.biz.every((row) => row?.manager)) ids.push("every-manager");
  if ((state?.careerEarnings || 0) >= 1e9) ids.push("earn-billion");
  if ((state?.careerEarnings || 0) >= 1e12) ids.push("earn-trillion");
  if (state?.prestiged || (state?.prestigeCount || 0) > 0 || (state?.investors || 0) > 0) ids.push("first-prestige");
  if ((state?.prestigeCount || 0) >= 10) ids.push("prestige-10");
  if (investorPeak(state) >= 10) ids.push("first-investor");
  if (investorPeak(state) >= 1000) ids.push("investors-1000");
  if ((state?.singularities || 0) >= 1) ids.push("fork-1");
  if ((state?.singularities || 0) >= 5) ids.push("fork-5");
  // The bubble is recorded when it starts. Living through it means it has
  // since popped or been cashed out.
  if (events.has("dotcom") && !state?.bubble) ids.push("bubble");
  // The Millennium Bug dilemma, recorded when it appears. Not the Y2K Patch project.
  if (events.has("y2k")) ids.push("y2k");
  const museum = new Set(state?.museum || []);
  if (HISTORY_CARDS.length > 0 && HISTORY_CARDS.every((card) => museum.has(card.id))) ids.push("museum");
  const specs = new Set(state?.specialties || []);
  if (SPECIALTIES.length > 0 && SPECIALTIES.every((spec) => specs.has(spec.id))) ids.push("specialties");
  if ((state?.labFinished || 0) >= 10) ids.push("lab-10");
  if ((state?.challengesDone || []).length > 0) ids.push("first-challenge");
  // Three challenges exist today, each once, so five waits on future challenges.
  if ((state?.challengesDone || []).length >= 5) ids.push("challenges-5");
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
      if (!spec || !spec.playId) {
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
