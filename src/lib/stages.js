// Staged timers (T5 items 61 and 62). A server takes a while to come
// online, and so do a new HQ room, a finished bench PC, a business's first
// opening and an era change. The bar's label walks through what is
// happening. Every timer runs while the app is closed, several run side by
// side, and none can be skipped or paid down. Only big or first-time
// actions get one; ordinary buys stay instant. A repeat (something done in
// an earlier run) takes about half as long.

// Each set: [label, share of the time]. The shares add up to 1.
export const STAGE_SETS = {
  // Valve and early transistor mainframes, minis.
  mainframe: [["Truck delivering the cabinets…", 0.25], ["Raising the floor tiles…", 0.2], ["Running cables under the floor…", 0.2], ["Loading the operating system tapes…", 0.2], ["Burn-in test…", 0.15]],
  // Liquid- or Freon-cooled supercomputers.
  super: [["Freight truck delivering the cabinets…", 0.2], ["Plumbing the coolant loop…", 0.25], ["Running cables…", 0.2], ["Configuring the OS…", 0.2], ["Burn-in test…", 0.15]],
  // Rack and tower servers.
  rack: [["Courier delivering the boxes…", 0.3], ["Racking and cabling…", 0.3], ["Installing the OS…", 0.25], ["Burn-in test…", 0.15]],
  room: [["Clearing the floor…", 0.2], ["Framing the walls…", 0.3], ["Wiring and air ducts…", 0.3], ["Fitting out the room…", 0.2]],
  bench: [["Assembling the PC…", 0.4], ["Installing the OS…", 0.35], ["Running a benchmark…", 0.25]],
  opening: [["Hiring staff…", 0.35], ["Stocking up…", 0.35], ["Grand opening…", 0.3]],
  retool: [["Retooling the lines…", 0.4], ["Training the crews…", 0.35], ["First production run…", 0.25]],
};

export const ONLINE_LABEL = "Online!";

// Which label set a research machine uses.
export function installSet(part) {
  if (part?.group === "rack") return "rack";
  if (part?.coolant && part.coolant !== "air") return "super";
  return "mainframe";
}

// Where a job is now: { label, stage, stages, frac, leftMs, done }.
export function stageAt(job, now = Date.now()) {
  const set = STAGE_SETS[job?.set] || STAGE_SETS.room;
  const span = Math.max(1, (job?.readyAt || 0) - (job?.startedAt || 0));
  const frac = Math.max(0, Math.min(1, (now - (job?.startedAt || 0)) / span));
  const leftMs = Math.max(0, (job?.readyAt || 0) - now);
  if (frac >= 1) return { label: ONLINE_LABEL, stage: set.length, stages: set.length, frac: 1, leftMs: 0, done: true };
  let acc = 0;
  for (let i = 0; i < set.length; i++) {
    acc += set[i][1];
    if (frac < acc - 1e-9 || i === set.length - 1) return { label: set[i][0], stage: i, stages: set.length, frac, leftMs, done: false };
  }
  return { label: set[set.length - 1][0], stage: set.length - 1, stages: set.length, frac, leftMs, done: false };
}

// Field engineers (a BOOST perk bought with R&D points, never with money):
// installs take half as long.
export const FIELD_ENGINEERS = { cost: 40, mult: 0.5 };

// Server install time. Punch-card machines plug in at once. Machine-room
// computers grow with their size (power units) and their year: an early
// mainframe about 2 minutes, a 1976 Cray-1 about 8, the biggest
// supercomputers up to an hour. Racks and towers take a minute or two.
export const INSTALL = { roomBaseMs: 2 * 60e3, sizeStep: 1.9, yearSpan: 25, maxMs: 60 * 60e3, rackBaseMs: 60e3 };

export function installMs(part, { repeat = false, engineers = false } = {}) {
  if (!part || part.kind !== "server" || part.starter) return 0;
  let ms;
  if (part.group === "rack") ms = INSTALL.rackBaseMs * (1 + Math.max(0, (part.year || 1989) - 1989) / 30);
  else ms = INSTALL.roomBaseMs * INSTALL.sizeStep ** Math.max(0, (part.watts || 1) - 1) * (1 + Math.max(0, (part.year || 1951) - 1951) / INSTALL.yearSpan);
  ms = Math.min(INSTALL.maxMs, ms);
  if (repeat) ms *= 0.5;
  if (engineers) ms *= FIELD_ENGINEERS.mult;
  return Math.max(1000, Math.round(ms / 1000) * 1000);
}

// A new HQ room is built the first time its plant opens in a run.
export const ROOM_BUILD_MS = { servers: 3 * 60e3, bench: 90e3, mine: 2 * 60e3, cluster: 3 * 60e3 };
export function roomBuildMs(facilityId, repeat = false) {
  const ms = ROOM_BUILD_MS[facilityId] || 60e3;
  return repeat ? ms / 2 : ms;
}

// A bench PC with a new board or CPU is assembled, gets an OS and is
// benchmarked before it makes R&D points.
export const BENCH_BUILD_MS = 90e3;
export function benchBuildMs(repeat = false) {
  return repeat ? BENCH_BUILD_MS / 2 : BENCH_BUILD_MS;
}

// A business's first opening in a run: 8 seconds for the first eras, longer
// for later ones, up to 3 minutes the first time ever; half that (at least
// 8 seconds) once an earlier run reached it.
export const OPENING = { baseMs: 8000, step: 1.12, maxMs: 3 * 60e3 };
export function openingMs(index, repeat = false) {
  const first = Math.min(OPENING.maxMs, OPENING.baseMs * OPENING.step ** Math.max(0, index));
  return Math.round(Math.max(OPENING.baseMs, repeat ? first / 2 : first) / 1000) * 1000;
}

// Save reader for the run's jobs.
const KINDS = new Set(["install", "room", "bench"]);
export function readStages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((j) => j && typeof j === "object" && KINDS.has(j.kind) && typeof j.facilityId === "string" && Number.isFinite(j.startedAt) && Number.isFinite(j.readyAt) && j.readyAt >= j.startedAt)
    .map((j) => ({
      id: String(j.id || `${j.kind}-${j.startedAt}`),
      kind: j.kind,
      facilityId: j.facilityId,
      partId: typeof j.partId === "string" ? j.partId : null,
      set: STAGE_SETS[j.set] ? j.set : j.kind === "room" ? "room" : j.kind === "bench" ? "bench" : "mainframe",
      startedAt: j.startedAt,
      readyAt: Math.min(j.readyAt, j.startedAt + INSTALL.maxMs),
    }))
    .slice(0, 200);
}

export function formatLeft(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s >= 3600) return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  if (s >= 60) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return `${s}s`;
}
