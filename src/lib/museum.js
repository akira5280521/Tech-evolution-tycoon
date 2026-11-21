// The Hardware Museum: every piece of hardware in the game, plus keyboards
// and mice that are only exhibits, sorted into wings and rooms. View-only:
// nothing here changes the game.
import { PARTS, partOpen, partRetired } from "./facilities.js";
import { playerYear } from "./eraYear.js";

// Keyboards and mice: how they changed over the years. They open when the
// player's year reaches theirs. Company names are parody; model names,
// years and details are real.
export const PERIPHERALS = [
  { id: "kb-asr33", kind: "keyboard", name: "Teletipe Model 33 ASR", year: 1963, spec: "1963: a printing terminal with a paper-tape punch; many early computers were run from one." },
  { id: "kb-modelf", kind: "keyboard", name: "Inland Model F", year: 1981, spec: "1981: the PC's first keyboard, buckling springs under every key, 83 keys." },
  { id: "kb-modelm", kind: "keyboard", name: "Inland Model M", year: 1985, spec: "1985: the 101-key layout most keyboards still follow, built like a tank." },
  { id: "kb-extended", kind: "keyboard", name: "Orchard Extended Keyboard", year: 1987, spec: "1987: a heavy, loved keyboard on the Desktop Bus." },
  { id: "kb-natural", kind: "keyboard", name: "Macrohard Natural Keyboard", year: 1994, spec: "1994: split down the middle and tilted to ease the wrists." },
  { id: "kb-g15", kind: "keyboard", name: "Logitek G15", year: 2005, spec: "2005: a gaming keyboard with a small screen above the keys." },
  { id: "kb-blackwidow", kind: "keyboard", name: "Razor BlackWidow", year: 2010, spec: "2010: brought clicky mechanical switches back to the shops." },
  { id: "kb-k70", kind: "keyboard", name: "Corsar K70", year: 2013, spec: "2013: an aluminium plate with a light under every key." },
  { id: "kb-magic", kind: "keyboard", name: "Orchard Magic Keyboard", year: 2015, spec: "2015: thin, wireless and charged over its cable." },
  { id: "kb-60he", kind: "keyboard", name: "Wootin 60HE", year: 2022, spec: "2022: magnetic switches that sense how far each key is pressed." },
  { id: "ms-wooden", kind: "mouse", name: "Stanfield wooden mouse", year: 1964, spec: "1964: a wooden box on two metal wheels, built for the first demo of a mouse." },
  { id: "ms-alto", kind: "mouse", name: "Xerux Alto mouse", year: 1973, spec: "1973: three buttons, for the first computer with windows on its screen." },
  { id: "ms-lisa", kind: "mouse", name: "Orchard Lisa mouse", year: 1983, spec: "1983: one button and a ball, for an office computer that cost $9,995." },
  { id: "ms-green", kind: "mouse", name: "Macrohard Mouse", year: 1983, spec: "1983: two green buttons, sold on a card for the PC." },
  { id: "ms-mouseman", kind: "mouse", name: "Logitek MouseMan", year: 1990, spec: "1990: shaped to the right hand, three buttons." },
  { id: "ms-intellimouse", kind: "mouse", name: "Macrohard IntelliMouse", year: 1996, spec: "1996: put a scroll wheel between the buttons." },
  { id: "ms-optical", kind: "mouse", name: "Macrohard IntelliMouse Optical", year: 1999, spec: "1999: a red light and a tiny camera instead of a ball to clean." },
  { id: "ms-mx518", kind: "mouse", name: "Logitek MX518", year: 2005, spec: "2005: a gaming mouse with a button to change its speed." },
  { id: "ms-deathadder", kind: "mouse", name: "Razor DeathAdder", year: 2006, spec: "2006: a shape so well liked it was sold for well over a decade." },
  { id: "ms-superlight", kind: "mouse", name: "Logitek G Pro X Superlight", year: 2020, spec: "2020: wireless and only 63 grams." },
].map((p) => ({ ...p, icon: `/icons/museum/${p.id}.png`, museumOnly: true }));

const benchKinds = (...kinds) => (p) => (p.fits || []).includes("bench") && kinds.includes(p.kind);

export const WINGS = [
  {
    id: "computers",
    name: "COMPUTERS & SERVERS",
    rooms: [
      { id: "rooms", name: "MACHINE ROOMS", match: (p) => p.kind === "server" && p.group === "room" },
      { id: "racks", name: "RACK SERVERS", match: (p) => p.kind === "server" && p.group === "rack" },
      { id: "compute", name: "COMPUTE CARDS", match: (p) => p.kind === "gpu" },
      { id: "store", name: "SERVER STORAGE", match: (p) => p.kind === "disk" },
      { id: "links", name: "NETWORKS", match: (p) => p.kind === "link" },
      { id: "plant", name: "POWER & COOLING", match: (p) => !!p.fits && !p.fits.includes("bench") && ["power", "cool", "ram"].includes(p.kind) },
    ],
  },
  {
    id: "parts",
    name: "PC PARTS",
    rooms: [
      { id: "boards", name: "BOARDS", match: benchKinds("board") },
      { id: "cpus", name: "CPUS", match: benchKinds("cpu", "fpu") },
      { id: "memory", name: "MEMORY", match: benchKinds("stick", "cache") },
      { id: "graphics", name: "GRAPHICS", match: benchKinds("video", "accel") },
      { id: "displays", name: "DISPLAYS", match: benchKinds("monitor") },
      { id: "sound", name: "SOUND", match: benchKinds("sound") },
      { id: "cards", name: "CARDS", match: benchKinds("addin") },
      { id: "power", name: "POWER", match: benchKinds("psu") },
      { id: "cases", name: "CASES", match: benchKinds("case") },
      { id: "drives", name: "DRIVES", match: benchKinds("drive", "media") },
      { id: "network", name: "NETWORK", match: benchKinds("net", "modem") },
      { id: "cooling", name: "COOLING", match: benchKinds("cooler") },
    ],
  },
  {
    id: "peripherals",
    name: "PERIPHERALS",
    rooms: [
      { id: "keyboards", name: "KEYBOARDS", match: (p) => p.kind === "keyboard" },
      { id: "mice", name: "MICE", match: (p) => p.kind === "mouse" },
    ],
  },
  { id: "history", name: "HISTORY CARDS", rooms: [] },
];

// The maker is the parody brand at the front of the name ("Corsar K70").
// Generic names ("4 MB 30-pin SIMM") have none.
export function makerOf(item) {
  const first = String(item.name || "").split(" ")[0];
  return /^[A-Z][a-z]/.test(first) || /^[A-Z]{2,}[a-z]*$/.test(first) ? first : null;
}

// One exhibit: on the bench or in a plant now, researched (open to buy),
// out of production, or still locked.
export function exhibitStatus(state, item) {
  if (item.museumOnly) return playerYear(state) >= item.year ? "seen" : "locked";
  const facilities = state?.facilities || {};
  const owned = Object.values(facilities).some((counts) => (counts?.[item.id] || 0) > 0);
  if (owned) return "owned";
  if (partRetired(state, item)) return "retired";
  if (partOpen(state, item)) return "open";
  return "locked";
}

export const STATUS_LABEL = { owned: "IN USE", open: "RESEARCHED", retired: "OUT OF PRODUCTION", seen: "ON DISPLAY", locked: "LOCKED" };

export function roomItems(roomId) {
  for (const wing of WINGS) {
    const room = wing.rooms.find((r) => r.id === roomId);
    if (room) return [...PARTS, ...PERIPHERALS].filter((p) => !p.soon && room.match(p)).sort((a, b) => a.year - b.year);
  }
  return [];
}

// Exhibits for a room with their status, filtered by decade and maker.
export function roomExhibits(state, roomId, { decade = null, maker = null } = {}) {
  return roomItems(roomId)
    .map((item) => ({ item, status: exhibitStatus(state, item), decade: Math.floor(item.year / 10) * 10, maker: makerOf(item) }))
    .filter((e) => (decade == null || e.decade === decade) && (maker == null || e.maker === maker));
}

export function roomCounts(state, roomId) {
  const all = roomExhibits(state, roomId);
  return { found: all.filter((e) => e.status !== "locked").length, total: all.length };
}

export function wingCounts(state, wing) {
  return wing.rooms.reduce(
    (sum, room) => {
      const c = roomCounts(state, room.id);
      return { found: sum.found + c.found, total: sum.total + c.total };
    },
    { found: 0, total: 0 },
  );
}

// Decades and makers in a room, for the filter chips. Makers come only from
// exhibits already found, so a filter never gives away a locked one.
export function roomFilters(state, roomId) {
  const all = roomExhibits(state, roomId);
  const decades = [...new Set(all.map((e) => e.decade))].sort((a, b) => a - b);
  const makers = [...new Set(all.filter((e) => e.status !== "locked" && e.maker).map((e) => e.maker))].sort();
  return { decades, makers };
}
