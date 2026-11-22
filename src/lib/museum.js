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
      { id: "graphics", name: "GRAPHICS", match: benchKinds("video", "bridge", "accel") },
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
// Generic names ("ATX mid-tower", "Tape drive") have none.
const GENERIC = new Set(["AT", "ATX", "Airflow", "Baby", "Blu-ray", "Case", "Chilled-water", "Clip-on", "Fluorinert", "Freon", "HD", "Immersion", "Mesh", "Micro-ATX", "Mini-ITX", "Motor-generator", "Rack", "Room", "Slot", "Tape", "Tower"]);
const TWO_WORD = ["Alpha Novatek", "Be Calm", "Cooler Mister", "Danger Din", "Ess Three", "Lyan Lee", "Media Visia", "Quantum Graphics", "Radio Shed", "Silicon Pictures", "Thinking Engines", "Tortoise Beach", "US Robots", "Western Data"];
export function makerOf(item) {
  const name = String(item.name || "");
  const two = TWO_WORD.find((b) => name.startsWith(`${b} `));
  if (two) return two;
  const first = name.split(" ")[0];
  if (GENERIC.has(first) || !name.includes(" ")) return null;
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

// Room badges: a room is complete when every exhibit in it is found.
// Checked every tick for the badges, so cached until what it depends on
// (research, the player's year, parts held) changes.
const completeCache = new Map();
export function roomComplete(state, roomId) {
  const sig = `${(state?.techDone || []).join(",")}|${playerYear(state)}|${Object.values(state?.facilities || {})
    .map((c) => Object.keys(c || {}).filter((k) => c[k] > 0).join(","))
    .join(";")}`;
  const hit = completeCache.get(roomId);
  if (hit && hit.sig === sig) return hit.done;
  const c = roomCounts(state, roomId);
  const done = c.total > 0 && c.found === c.total;
  completeCache.set(roomId, { sig, done });
  return done;
}
export const ROOMS = WINGS.flatMap((w) => w.rooms.map((r) => ({ ...r, wing: w.id })));

// Today in history: real launch days of pieces in the museum.
export const LAUNCH_DAYS = [
  { id: "ms-alto", date: "1973-03-01", text: "the first Xerux Alto worked, with its three-button mouse" },
  { id: "b-orchard2", date: "1977-06-10", text: "the Orchard II began shipping" },
  { id: "b-5150", date: "1981-08-12", text: "the Inland PC was announced" },
  { id: "kb-modelf", date: "1981-08-12", text: "the Model F keyboard arrived with the Inland PC" },
  { id: "ms-lisa", date: "1983-01-19", text: "the Orchard Lisa and its mouse were announced" },
  { id: "ms-wooden", date: "1968-12-09", text: "the wooden mouse was shown to the public for the first time" },
  { id: "c-586", date: "1993-03-22", text: "the Chipwright 586 launched" },
  { id: "v-gf256", date: "1999-10-11", text: "the Raster 256 went on sale" },
  { id: "c-a64", date: "2003-09-23", text: "the Alder 64 brought 64-bit to home PCs" },
  { id: "c-e6600", date: "2006-07-27", text: "the Chipwright E6600 and its dual-core family launched" },
  { id: "v-8800", date: "2006-11-08", text: "the Raster 8800 launched" },
  { id: "c-i7920", date: "2008-11-17", text: "the Chipwright i7-920 launched" },
  { id: "v-5870", date: "2009-09-23", text: "the Artix 5870 launched" },
  { id: "v-gtx680", date: "2012-03-22", text: "the Raster GTX 680 launched" },
  { id: "v-290x", date: "2013-10-24", text: "the Alder 290X launched" },
  { id: "v-gtx980", date: "2014-09-18", text: "the Raster GTX 980 launched" },
  { id: "c-6700k", date: "2015-08-05", text: "the Chipwright i7-6700K launched" },
  { id: "v-1080", date: "2016-05-27", text: "the Raster 1080 went on sale" },
  { id: "c-1800x", date: "2017-03-02", text: "the Alder 1800X went on sale" },
  { id: "v-vega64", date: "2017-08-14", text: "the Alder Vega 64 went on sale" },
  { id: "v-2080", date: "2018-09-20", text: "the Raster 2080 went on sale" },
  { id: "c-9900k", date: "2018-10-19", text: "the Chipwright i9-9900K went on sale" },
  { id: "raster3090", date: "2020-09-24", text: "the Raster 3090 went on sale" },
  { id: "c-5950x", date: "2020-11-05", text: "the Alder 5950X went on sale" },
  { id: "v-4090", date: "2022-10-12", text: "the Raster 4090 went on sale" },
  { id: "c-14900k", date: "2023-10-17", text: "the Chipwright i9-14900K went on sale" },
];

// The launch days that fall on today's date, or the next ones coming up.
// A piece the player hasn't found shows only its year.
export function todayInHistory(state, now = Date.now()) {
  const d = new Date(now);
  const md = (m, day) => m * 100 + day;
  const today = md(d.getMonth() + 1, d.getDate());
  const days = LAUNCH_DAYS.map((x) => {
    const [y, m, day] = x.date.split("-").map(Number);
    const item = [...PARTS, ...PERIPHERALS].find((p) => p.id === x.id);
    return { ...x, year: y, month: m, day, md: md(m, day), item };
  }).filter((x) => x.item);
  const hits = days.filter((x) => x.md === today);
  const pick = hits.length ? hits : (() => {
    const ahead = days.filter((x) => x.md > today).sort((a, b) => a.md - b.md);
    const next = ahead.length ? ahead[0].md : Math.min(...days.map((x) => x.md));
    return days.filter((x) => x.md === next);
  })();
  return {
    today: hits.length > 0,
    entries: pick.map((x) => ({ ...x, found: exhibitStatus(state, x.item) !== "locked" })),
  };
}

// Which room an exhibit is in.
export function roomOf(item) {
  return ROOMS.find((r) => r.match(item))?.id || null;
}
