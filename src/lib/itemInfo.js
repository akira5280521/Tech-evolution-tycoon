// What every "?" button says. One place to edit all item descriptions.
//
// Each entry is one or two plain sentences: what the thing is (a real
// hardware fact where it fits; company names are parody, model numbers are
// real) and what it does in the game, with the player's current numbers.
// Sheets that cover a strip of small things (materials, the money panel)
// list one short line per thing in `rows`.
//
// itemInfo(kind, id, state) returns { title, text, rows? } or null.
// Locked "???" items never name what is coming.

import {
  BUSINESSES,
  ERA_GATE,
  FOREMAN_COST,
  PRESTIGE_UNIT,
  RESEARCH_MS,
  SUPPLY_KEYS,
  UPGRADE_MS,
  count,
  formatFlow,
  investorsFor,
  managerNeed,
  milestoneMult,
  money,
  nextMilestone,
  pluralName,
  prestigeMult,
} from "./gameConfig.js";
import {
  CHALLENGES,
  INVESTOR_MILESTONES,
  PROJECTS,
  activeChallengeGoal,
  projectRevealed,
  scaledChallengeGoal,
  LAB_PROJECTS,
  SHOP,
  SPECIALTIES,
  businessIncomePerSecond,
  dataPerSecond,
  effectiveCycleMs,
  empireFactors,
  forkCost,
  incomePerSecond,
  investorPeak,
  makesOf,
  managerPrice,
  masteryNeed,
  overclockOn,
  pettyCost,
  singularityMult,
  supplyFactor,
  upgradeOffer,
  upgradesOf,
} from "./empire.js";
import { GENERATIONS, GENERATION_BONUS, generationAt, generationIndex, generationPayMult } from "./generations.js";
import { RESEARCH, RESEARCH_TABS, awayBankCap, awayBankHours, playerYear, researchCost, researchItem, researchLock, researchSpeed, researchUnlocks, serverOutput } from "./research.js";
import { FACILITIES, PARTS, SHARE_CAP, facilityReport, diskSize, facilityUnlocked, partCost, partLock } from "./facilities.js";

export const LOCKED_TEXT = "Unlocks later in the timeline.";
export const SOON_TEXT = "Coming soon: it isn't in the game yet.";

// ---------------------------------------------------------------------------
// Hand-written facts. Edit these freely; numbers in the game sentence are
// filled in from the live game.

// What each era is. CPU and GPU use the current chip's line instead.
export const ERA_FACTS = {
  timber: "Wood pulp became the main source of paper in the late 1800s, so every card and ledger starts as a log.",
  paper: "A paper mill grinds logs to pulp and presses it into sheets; the stiff card stock is what punch cards were cut from.",
  loom: "The Jacquard loom of 1804 read a chain of punched cards to pick which threads to lift: the first machine run by stored instructions.",
  punchcards: "Punched cards and electric tabulators counted the 1890 US census in a fraction of the time the 1880 count took.",
  relay: "Relay computers of the early 1940s did arithmetic by clicking thousands of telephone relays, a few operations a second.",
  sand: "Silica sand is mostly silicon dioxide: the raw stuff of glass, and much later of silicon chips.",
  copper: "Copper carries current better than any common metal, so it became the wire inside almost every machine.",
  glass: "Glass is melted sand; blown into a bulb, it held the vacuum that made a tube work.",
  filament: "Tungsten wire glows white-hot without melting, which made it the heater inside every vacuum tube.",
  tubes: "A vacuum tube switches current with no moving parts; the first electronic computers of the mid-1940s used about 17,000 of them.",
  mainframes: "The first computers sold to businesses arrived in 1951; Irwell Electrics' Mark 1 kept its memory as dots on cathode-ray tubes.",
  germanium: "Germanium is a semiconductor; the first transistor, built in 1947, was a sliver of it.",
  transistors: "A transistor does a tube's switching job in a crystal the size of a grain of rice: cooler, smaller and far more reliable.",
  silicon: "Silicon copes with heat better than germanium and comes from ordinary sand, so it took over by the 1960s.",
  wafers: "One big silicon crystal is pulled from the melt and sliced into thin wafers; each wafer holds many chips.",
  ics: "An integrated circuit puts transistors and their wiring on one chip; the first ones, in 1958 and 1959, held only a handful.",
  minis: "Minicomputers like Maynard Equipment's 8 (1965) were 12-bit machines small and cheap enough for one lab.",
  homepc: "In 1977 ready-built home computers went on sale with a keyboard, a few KB of memory and a TV or monitor.",
  consoles: "Paddle Arts' 2600 (1977) played games from swappable cartridges on the family TV.",
  dialup: "A dial-up modem sends data over a phone call, 300 bit/s at first and 56 kbit/s by 1998; the first web page went up at CERN in 1991.",
  cloud: "Cloud datacenters rent storage and servers by the hour; Canopy's bucket storage and rentable instances launched in 2006.",
  phones: "The Orchard Handset (2007) was a touchscreen phone: a 3.5-inch display, a 412 MHz chip and 128 MB of memory.",
  rgb: "RGB battlestations are gaming PCs with lit fans, glass sides and fast graphics cards, everywhere from the mid-2010s.",
  ai: "Tensor Foundry's T1 (2016) is a chip built for neural networks: a 256 by 256 grid of 8-bit multiply-accumulators.",
  quantum: "Quantum computers keep qubits near absolute zero under a gold-plated 'chandelier'; in 2019 a 53-qubit chip ran a test in minutes.",
  vr: "Visor's Q2 (2020) is a headset that needs no PC or cable: 1832 by 1920 pixels for each eye, with cameras that track the room.",
  chatbots: "Parlance (2022) put a chat window on a large language model, and a million people signed up in five days.",
  supercluster: "AI superclusters (2024) wire tens of thousands of Tensor cards into one network to train a single model.",
};

// What each material is.
export const MATERIAL_FACTS = {
  wood: "Logs, ground into pulp for paper.",
  paper: "Stiff card stock that takes a punch.",
  sand: "Silica sand, melted into glass and refined into silicon.",
  copper: "Copper, drawn into wire.",
  glass: "Clear glass, blown into tube bulbs.",
  filament: "Tungsten and nickel wire, the glowing heater in a tube.",
  germanium: "Germanium, the metal of the first transistors.",
  silicon: "Ultra-pure silicon, grown into crystals.",
  wafers: "Thin slices of silicon crystal that chips are made on.",
};

// What each plant is (the Facilities page).
export const FACILITY_FACTS = {
  servers: "A small room of rack servers that crunch numbers for your engineers.",
  mine: "A rack of graphics cards that mints Bitbark, a game coin that can't be traded or taken out of the game.",
  cluster: "A rack of graphics cards that trains a model and bills the studio for it.",
};

// ---------------------------------------------------------------------------

const indexOf = (id) => BUSINESSES.findIndex((cfg) => cfg.id === id);
const ownedOf = (state, id) => state?.biz?.[indexOf(id)]?.owned || 0;

function secs(ms) {
  const s = ms / 1000;
  if (s >= 120) return `${Math.round(s / 60)} min`;
  return `${s >= 10 ? Math.round(s) : Number(s.toFixed(1))}s`;
}

function duration(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m <= 0) return `${s} seconds`;
  return s ? `${m} min ${s} s` : `${m} min`;
}

function rd(n) {
  return Math.round(n).toLocaleString("en-US");
}

function rate(n) {
  return n >= 10 ? n.toFixed(1) : n.toFixed(2);
}

function pctOf(mult) {
  return `${Math.round((mult - 1) * 100)}%`;
}

// Pay of one unit of this row for one cycle, with everything applied.
function payOne(state, cfg, owned) {
  const n = Math.max(1, owned);
  const rev = upgradesOf(state, cfg.id).rev ? 3 : 1;
  return cfg.revenue * generationPayMult(cfg.id, n, state?.techDone) * rev * milestoneMult(n)
    * empireFactors(state, Date.now()).total;
}

// "Punch Cards'" rather than "Punch Cards's".
function possessive(name) {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

// First sentence of a blurb (the flavour line), for short sheets.
function firstSentence(text) {
  const m = String(text || "").match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : String(text || "")).trim();
}

function chipInfo(cfg, state, owned) {
  const gen = generationAt(cfg.id, Math.max(1, owned), state?.techDone);
  return gen ? `${gen.name} (${gen.year}): ${gen.tagline}` : null;
}

function nextChip(cfg, state, owned) {
  const list = GENERATIONS[cfg.id];
  if (!list) return null;
  const at = generationIndex(cfg.id, Math.max(1, owned), state?.techDone);
  const next = list[at + 1];
  if (!next) return { label: "CHIPS", text: `All ${list.length} chips reached: +${Math.round((list.length - 1) * GENERATION_BONUS * 100)}% pay.` };
  const researched = (state?.techDone || []).includes(next.id);
  const need = researched ? `own ${next.need}` : `own ${next.need} and research it on TECH`;
  return { label: "NEXT CHIP", text: `${next.name}: ${need}. Each chip adds +${Math.round(GENERATION_BONUS * 100)}% pay.` };
}

function eraInfo(state, id) {
  const index = indexOf(id);
  const cfg = BUSINESSES[index];
  if (!cfg) return null;
  const row = state?.biz?.[index] || {};
  const owned = row.owned || 0;
  const what = chipInfo(cfg, state, owned) || ERA_FACTS[id] || cfg.tagline;
  const cycle = effectiveCycleMs(cfg, state);
  const flow = [];
  if (cfg.uses) flow.push(`uses ${formatFlow(cfg.uses)}`);
  if (cfg.makes) flow.push(`makes ${formatFlow(makesOf(state, cfg))}`);
  let does = `Each one pays ${money(payOne(state, cfg, owned))}${flow.length ? ` and ${flow.join(" and ")}` : ""} every ${secs(cycle)}`;
  if (owned > 0) {
    const perSec = (payOne(state, cfg, owned) * owned * 1000) / cycle;
    does += row.manager || row.running
      ? `; your ${count(owned)} make ${money(perSec)} a second.`
      : `; tap the picture to run your ${count(owned)}, or hire its manager.`;
  } else {
    does += ".";
  }
  const rows = [];
  const fed = supplyFactor(state, cfg);
  if (owned > 0 && cfg.uses && fed < 1) rows.push({ label: "SHORT", text: fed <= 0 ? "Out of materials: it pays nothing until more is made." : `Short of materials: running at ${Math.round(fed * 100)}%.` });
  const next = nextMilestone(owned);
  if (next) rows.push({ label: "NEXT MILESTONE", text: `${next.speed ? `${next.speed}× speed` : `${next.mult}× pay`} at ${next.owned} owned.` });
  const chip = nextChip(cfg, state, owned);
  if (chip) rows.push(chip);
  if (index + 1 < BUSINESSES.length && owned < ERA_GATE) rows.push({ label: "NEXT ERA", text: `Opens at ${ERA_GATE} owned. You have ${count(owned)}.` });
  if (cfg.placeholder) rows.push({ label: "ICON", text: "Its picture is a stand-in; the real art is coming soon." });
  return { title: (generationAt(cfg.id, Math.max(1, owned), state?.techDone)?.name || cfg.name).toUpperCase(), text: `${what} ${does}`, rows };
}

function lockedEraInfo(state, id) {
  const index = indexOf(id);
  const prev = BUSINESSES[index - 1];
  const have = prev ? ownedOf(state, prev.id) : 0;
  return {
    title: "??? NEXT ERA",
    text: `${LOCKED_TEXT} Own ${ERA_GATE} ${prev ? pluralName(prev.name) : "of the last era"} to open it (you have ${count(Math.min(have, ERA_GATE))}).`,
  };
}

function managerInfo(state, id) {
  const index = indexOf(id);
  const cfg = BUSINESSES[index];
  if (!cfg) return null;
  const row = state?.biz?.[index] || {};
  const owned = row.owned || 0;
  const need = managerNeed(index);
  const what = `The ${cfg.managerName} runs ${cfg.name} for you, every cycle, without a tap.`;
  let does;
  if (row.manager) does = "Hired: it keeps running while you're away, at half speed, and a prestige lets the manager go.";
  else if (state?.challenge?.id === "noboss") does = "This challenge run allows no managers.";
  else if (owned < need) does = `Hire one once you own ${need}; you have ${count(owned)}.`;
  else {
    const price = managerPrice(state, index);
    does = price > 0 ? `Hiring costs ${money(price)} of cash; it keeps running while you're away, at half speed.` : "Your Master Key makes this hire free.";
  }
  return { title: cfg.managerName.toUpperCase(), text: `${what} ${does}` };
}

function upgradeInfo(state, id, kind) {
  const index = indexOf(id);
  const cfg = BUSINESSES[index];
  if (!cfg) return null;
  const piece = upgradeOffer(index)[kind];
  const owned = ownedOf(state, id);
  const bought = !!upgradesOf(state, id)[kind];
  if (!bought && owned < piece.need) {
    return { title: "??? UPGRADE", text: `${LOCKED_TEXT} It shows once you own ${piece.need} ${pluralName(cfg.name)}; you have ${count(owned)}.` };
  }
  const effect = kind === "rev"
    ? `It triples what each ${cfg.name} pays${cfg.makes ? ", and the material it makes" : ""}`
    : `It halves ${possessive(cfg.name)} cycle, so it pays twice as often`;
  const status = bought
    ? "; owned for this run, and a prestige removes it."
    : `; it costs ${money(piece.cost)} and installs in ${Math.round(UPGRADE_MS / 1000)} seconds.`;
  return {
    title: piece.name.toUpperCase(),
    text: `${firstSentence(piece.blurb)} ${effect}${status}`,
    rows: [{ label: "MASTERY", text: `Both upgrades plus ${masteryNeed(index)} owned masters the era: +5% to all income this run.` }],
  };
}

function materialRows(state, shown) {
  return SUPPLY_KEYS.filter((key) => shown.includes(key)).map((key) => {
    const maker = BUSINESSES.find((cfg) => cfg.makes && cfg.makes[key]);
    const users = BUSINESSES.filter((cfg) => cfg.uses && cfg.uses[key]).map((cfg) => cfg.name);
    return {
      label: key.toUpperCase(),
      text: `${MATERIAL_FACTS[key] || ""} ${maker ? `${maker.name} makes it` : "Made earlier in the chain"}${users.length ? `; ${users.join(" and ")} ${users.length === 1 ? "uses" : "use"} it` : ""}.`,
    };
  });
}

function materialsInfo(state, shown = SUPPLY_KEYS) {
  return {
    title: "MATERIALS",
    text: "Some businesses use what an earlier one makes, one per cycle each. If a material runs out, the business that needs it slows or stops paying.",
    rows: materialRows(state, shown),
  };
}

function moneyInfo(state) {
  const now = Date.now();
  const cps = incomePerSecond(state, now);
  const claim = investorsFor(state?.lifetime || 0);
  const nextAt = Math.pow(claim + 1, 2) * PRESTIGE_UNIT;
  const rows = [
    { label: "CASH", text: `Money on hand: ${money(state?.cash || 0)}. BUY, Hire and upgrades spend it.` },
    { label: "INCOME", text: `What your businesses${incomePerSecond(state, now) > businessIncomePerSecond(state, now) ? " and plants" : ""} make each second right now: ${money(cps)}. Only rows that are running count.` },
    { label: "EARNED THIS RUN", text: `Everything earned since your last prestige: ${money(state?.lifetime || 0)}. It decides how many investors a prestige brings; the next comes at ${money(nextAt)}.` },
  ];
  if (overclockOn(state, now)) rows.push({ label: "OVERCLOCKED", text: "A lab project: all income ×1.5 until the timer runs out." });
  return { title: "MONEY PANEL", text: "Your cash, your income and this run's earnings.", rows };
}

function topBarInfo(state, { tech, rigs }) {
  return {
    title: "BUY AMOUNT AND SHORTCUTS",
    text: "Tap the buy-amount button to change how many one BUY gets: X1, X10, X25, X50, X75, X100, then MAX.",
    rows: [
      { label: "TECH", text: tech ? "The tech timeline: timed research projects paid with R&D points. CPU and GPU projects unlock new chips." : LOCKED_TEXT },
      { label: "RIGS", text: rigs ? "Facilities: research servers that make R&D points, and later a mine and a training cluster that pay cash." : LOCKED_TEXT },
    ],
  };
}

function foremanInfo(state) {
  return {
    title: "FOREMAN",
    text: state?.foreman
      ? "Hired: RUN ALL starts every business that has no manager yet, in one tap."
      : `A one-time hire for ${money(FOREMAN_COST)} that adds a RUN ALL button: one tap starts every business without a manager.`,
  };
}

// Research timeline projects.
function researchInfo(state, id) {
  const entry = researchItem(id);
  if (!entry) return null;
  const title = entry.name.toUpperCase();
  const what = `${entry.year}: ${entry.spec}.`;
  if (entry.soon) return { title, text: `${what} ${SOON_TEXT}` };
  const following = RESEARCH.find((other) => other.prereq === id && !other.soon);
  let gen = null;
  let row = null;
  for (const [rowId, list] of Object.entries(GENERATIONS)) {
    const i = list.findIndex((g) => g.id === id);
    if (i >= 0) {
      gen = { ...list[i], index: i };
      row = BUSINESSES[indexOf(rowId)];
    }
  }
  const opens = researchUnlocks(id);
  let effect;
  if (opens.length) {
    effect = `Finishing it opens the ${opens.map((p) => p.name).join(" and the ")} on the Facilities page.`;
  } else if (gen && gen.index > 0) {
    effect = `Finishing it switches ${row.name} to this chip once you own ${gen.need}: pay +${Math.round(gen.index * GENERATION_BONUS * 100)}% over the first chip.`;
  } else if (following) {
    effect = `Finishing it opens the next ${tabName(entry.tab)} project, ${following.name}.`;
  } else {
    effect = `It completes the ${tabName(entry.tab)} line so far.`;
  }
  const done = (state?.techDone || []).includes(id);
  const lock = researchLock(state, entry);
  let status;
  if (done) status = "Done.";
  else if (state?.techJob?.id === id) status = "In progress; it keeps going while the app is closed.";
  else if (lock) status = playerYear(state) < entry.year ? `Opens when your newest era reaches ${entry.year}.` : `${lock}.`;
  else status = `Costs ${rd(researchCost(entry))} R&D points and takes ${duration(entry.durationMs / researchSpeed(state))}.`;
  return { title, text: `${what} ${effect}`, rows: [{ label: "NOW", text: status }] };
}

function tabName(tab) {
  return (RESEARCH_TABS.find((t) => t.id === tab)?.label || tab).toUpperCase();
}

function facilityInfo(state, id) {
  const facility = FACILITIES.find((f) => f.id === id);
  if (!facility) return null;
  const open = facilityUnlocked(state, id);
  const what = FACILITY_FACTS[id] || facility.blurb;
  let does;
  if (!open) does = id === "servers" ? "It opens with your first Mainframe." : LOCKED_TEXT;
  else if (id === "servers") {
    const out = serverOutput(state);
    does = `It makes R&D points: ${rate(out.perSecond)} a second now (half while you're away), and it speeds up timed research ×${researchSpeed(state).toFixed(2)}.`;
  } else {
    const business = businessIncomePerSecond(state, Date.now());
    const row = facilityReport(state, business)[id];
    does = `It pays cash, ${money(row.perSecond)} a second now, and both plants together are capped at ${Math.round(SHARE_CAP * 100)}% of what your businesses make.`;
  }
  const rows = [];
  if (open && id === "servers" && serverOutput(state).perSecond > 0) rows.push({ label: "AWAY", text: awayLine(state) });
  return { title: facility.name, text: `${what} ${does}`, rows };
}

// How much the servers bank while you're away.
function awayLine(state, who = "they") {
  const hours = awayBankHours(state);
  const h = Number(hours.toFixed(1));
  return `While you're away ${who} bank at most ${h} ${h === 1 ? "hour" : "hours"} of full output (${rd(awayBankCap(state))} R&D points); each set of disk your newest machine needs holds another hour.`;
}

function partInfo(state, facilityId, partId) {
  const part = PARTS.find((p) => p.id === partId);
  if (!part) return null;
  const title = part.name.toUpperCase();
  if (part.soon) return { title, text: `${firstSentence(part.spec)} ${SOON_TEXT}` };
  const owned = state?.facilities?.[facilityId]?.[partId] || 0;
  const plantOpen = facilityUnlocked(state, facilityId);
  const servers = facilityId === "servers";
  const who = servers ? "racks" : "cards";
  const room = part.group === "room";
  let effect;
  if (part.kind === "server" && room) effect = `Each adds ${part.work} work and needs its own generator and air conditioner, and ${diskSize(part.diskGb)} of disk for full speed.`;
  else if (part.kind === "server") effect = `Each adds ${part.work} work and draws ${part.watts} W from the rack supplies and fans, and needs ${diskSize(part.diskGb)} of disk for full speed.`;
  else if (part.kind === "power" && room) effect = "Each powers one machine-room computer.";
  else if (part.kind === "cool" && room) effect = "Each cools one machine-room computer.";
  else if (part.kind === "gpu") effect = `Each adds ${part.work} work and ${part.vram} GB of card memory, and draws ${part.watts} W.`;
  else if (part.kind === "power") effect = `Each supplies ${part.power} W; ${who} slow down when they draw more than the supplies give.`;
  else if (part.kind === "cool") effect = `Each removes ${part.cool} W of heat; ${who} slow down when they make more than the fans remove.`;
  else if (part.kind === "disk") effect = `Each adds ${diskSize(part.gb)}; your newest machine needs its day's disk for full speed, and each set banks another hour of R&D while you're away.`;
  else if (part.kind === "ram") effect = `Each adds ${part.gb} GB of RAM; ${facilityId === "mine" ? "the mine needs 16 GB" : "the cluster needs enough memory for its model"}.`;
  else effect = "";
  const lock = plantOpen ? partLock(state, part, researchItem(part.research)?.name) : null;
  const status = !plantOpen
    ? servers ? "Opens with your first Mainframe." : LOCKED_TEXT
    : lock
      ? `${lock}.`
      : `You have ${owned}; the next costs ${money(partCost(part, owned))}.`;
  const rows = [{ label: "NOW", text: status }];
  if (part.kind === "ram") rows.push({ label: "BOARD", text: boardText(facilityId, part) });
  return { title, text: `${firstSentence(part.spec)} ${effect}`, rows };
}

// The memory board's rules, as on the real hardware: a 2017 mining board took
// two desktop DDR4 sticks; A100-era servers had 32 DDR4 slots, H100-era
// servers 32 DDR5 slots, and the two kinds don't fit the same slots.

function boardText(facilityId, part) {
  if (facilityId === "mine") return "The mining board has 2 DDR4 slots and takes 32 GB at most.";
  if (part.gen === "DDR5") return "32 slots. The first DDR5 stick swaps in a DDR5 board and sells the DDR4 sticks back at half price; when the slots are full, a bigger stick replaces the smallest.";
  return "The DDR4 server board has 32 slots, so DDR4 tops out at 1 TB; the 2 TB Foundation model needs DDR5.";
}

function prestigeInfo(state) {
  const investors = state?.investors || 0;
  const claim = investorsFor(state?.lifetime || 0);
  const nextAt = Math.pow(claim + 1, 2) * PRESTIGE_UNIT;
  const now = claim > 0
    ? `Prestige now for ${count(claim)} more; the next comes at ${money(nextAt)} earned this run.`
    : `The first comes at ${money(PRESTIGE_UNIT)} earned in one run.`;
  return {
    title: "PRESTIGE",
    text: "Trade in this run for investors: cash, businesses, managers and upgrades reset, and each investor raises all income forever.",
    rows: [
      { label: "YOU HAVE", text: `${count(investors)} investors: +${pctOf(prestigeMult(investors))} income.` },
      { label: "NEXT", text: now },
    ],
  };
}

function forkInfo(state) {
  const points = state?.singularities || 0;
  const bill = forkCost(points);
  const next = singularityMult(points + 1);
  const maxed = next <= singularityMult(points);
  return {
    title: "FORK THE TIMELINE",
    text: maxed
      ? "A bigger reset that spends investors. You've reached the ×4 cap, so forking adds no more income."
      : `A bigger reset: spend ${count(bill)} investors to restart the run for income ×${next.toFixed(1)} forever, a higher income limit and another specialty slot. You have ${count(state?.investors || 0)} investors.`,
  };
}

function shopInfo(state, id) {
  const item = SHOP.find((s) => s.id === id);
  if (!item) return null;
  const cost = id === "petty" ? pettyCost(state) : item.cost;
  const tokens = Math.floor(state?.tokens || 0);
  const rest = item.blurb.slice(firstSentence(item.blurb).length).trim();
  return {
    title: item.name.toUpperCase(),
    text: `${firstSentence(item.blurb)} ${cost > 0 ? `It costs ${cost} era tokens; you have ${tokens}.` : `It's free; you have ${tokens} tokens.`}`,
    rows: rest ? [{ label: "RULES", text: rest }] : [],
  };
}

function labInfo(state, id) {
  const item = LAB_PROJECTS.find((l) => l.id === id);
  if (!item) return null;
  return {
    title: item.name,
    text: item.blurb,
    rows: [{ label: "COST", text: `${item.cost} R&D points; you have ${rd(state?.data || 0)}.` }],
  };
}

function specialtyInfo(state, id) {
  const spec = SPECIALTIES.find((s) => s.id === id);
  if (!spec) return null;
  const mine = (state?.specialties || []).includes(id);
  return {
    title: spec.name,
    text: `A company focus you keep through every prestige: ${spec.blurb.replace(/\.$/, "")}. ${mine ? "It's yours." : `Costs ${spec.cost} R&D points and ${Math.round(RESEARCH_MS / 1000)} seconds of research.`}`,
  };
}

function milestoneInfo(state, id) {
  const peak = investorPeak(state);
  const i = INVESTOR_MILESTONES.findIndex((m) => m.id === id);
  const m = INVESTOR_MILESTONES[i];
  if (!m) return null;
  const nextIndex = INVESTOR_MILESTONES.findIndex((x) => peak < x.at);
  const hidden = peak < m.at && i !== nextIndex;
  if (hidden) return { title: "???", text: `${LOCKED_TEXT} It shows once you reach the milestone before it.` };
  return {
    title: m.title,
    text: m.text,
    rows: [{ label: "NOW", text: peak >= m.at ? "Unlocked for good." : `Reach ${count(m.at)} investors at once; your best is ${count(peak)}.` }],
  };
}

function rdInfo(state) {
  return {
    title: "R&D POINTS",
    text: `The one research currency: your eras make ${rate(dataPerSecond(state))} a second and research servers ${rate(serverOutput(state).perSecond)} a second, at half rate while away. Spend them on research, the TECH timeline and lab projects; they're never lost.`,
    rows: serverOutput(state).perSecond > 0 ? [{ label: "AWAY", text: awayLine(state, "the servers") }] : [],
  };
}

function challengeInfo(state, id) {
  const c = CHALLENGES.find((x) => x.id === id);
  if (!c) return null;
  const active = state?.challenge?.id === id;
  const goal = active ? activeChallengeGoal(state) : scaledChallengeGoal(c, state);
  const won = (state?.challengesDone || []).includes(id);
  return {
    title: c.name,
    text: `${c.blurb} Reach ${money(goal)} in that run to win +${Math.round(c.reward * 100)}% all income forever; starting one resets cash and businesses like a prestige, but investors stay.`,
    rows: [{ label: "NOW", text: won ? "Won." : active ? "Running now." : state?.prestiged ? "Ready to start." : "Opens after your first prestige." }],
  };
}

function projectInfo(state, id) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return null;
  if (!projectRevealed(state, p)) return { title: "???", text: `${LOCKED_TEXT} Reach more eras to reveal this project.` };
  const done = (state?.projectsDone || []).includes(id);
  return {
    title: p.name,
    text: `A big goal that finishes on its own: ${p.blurb.replace(/\.$/, "").replace(/^./, (c) => c.toLowerCase())}. It pays +${Math.round(p.reward * 100)}% all income forever and ${p.tokens} era tokens.`,
    rows: [{ label: "NOW", text: done ? "Finished." : "Not reached yet." }],
  };
}

const KINDS = {
  challenge: challengeInfo,
  project: projectInfo,
  era: eraInfo,
  "locked-era": lockedEraInfo,
  manager: managerInfo,
  "upgrade-rev": (state, id) => upgradeInfo(state, id, "rev"),
  "upgrade-spd": (state, id) => upgradeInfo(state, id, "spd"),
  materials: (state, shown) => materialsInfo(state, shown),
  money: moneyInfo,
  topbar: (state, opts) => topBarInfo(state, opts || {}),
  foreman: foremanInfo,
  research: researchInfo,
  facility: facilityInfo,
  part: (state, id) => {
    const [facilityId, partId] = String(id).split(":");
    return partInfo(state, facilityId, partId);
  },
  prestige: prestigeInfo,
  fork: forkInfo,
  shop: shopInfo,
  lab: labInfo,
  specialty: specialtyInfo,
  milestone: milestoneInfo,
  rd: rdInfo,
};

export function itemInfo(kind, id, state) {
  const fn = KINDS[kind];
  if (!fn) return null;
  try {
    return fn(state || {}, id) || null;
  } catch {
    return null;
  }
}
