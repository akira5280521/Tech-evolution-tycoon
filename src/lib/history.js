// History cards for the Museum. Two per era: one at 25 owned, one at 100.
// Cards are kept forever (they survive prestige, forks and challenges).
// Finding both cards of an era pays a one-time token bonus.
// Company names are parody. Model numbers and specs stay real.
import { BUSINESSES } from "./gameConfig.js";
import { furthestRevealedEra, grantTokens } from "./empire.js";

export const MUSEUM_SET_TOKENS = 3;

export const HISTORY_CARDS = [
  { id: "sand-1", era: "sand", need: 25, title: "SAND TO SILICON",
    text: "Silicon is the second most common element in Earth's crust, after oxygen. Most of it is locked up in sand and rock as silicon dioxide." },
  { id: "sand-2", era: "sand", need: 100, title: "QUARTZ, NOT BEACH SAND",
    text: "Chipmakers start from high-purity quartz, a crystal form of silicon dioxide. Ordinary beach sand carries too many impurities." },
  { id: "copper-1", era: "copper", need: 25, title: "WIRING THE WORLD",
    text: "Copper conducts electricity better than any metal except silver, which is why it carries the current in nearly every circuit." },
  { id: "copper-2", era: "copper", need: 100, title: "COPPER ON THE CHIP",
    text: "For decades chips were wired with aluminum. In 1997 Inland Business Machines announced copper wiring inside chips, which let signals move faster." },
  { id: "timber-1", era: "timber", need: 25, title: "PAPER FROM TREES",
    text: "Paper was made from cotton and linen rags until the mid-1800s. Grinding wood into pulp, worked out in the 1840s, made paper cheap enough to use by the ton." },
  { id: "timber-2", era: "timber", need: 100, title: "THE LOG DRIVE",
    text: "Before roads and railways reached the woods, loggers floated their logs down rivers to the mills, often on the spring floods." },
  { id: "paper-1", era: "paper", need: 25, title: "CARD STOCK",
    text: "Punched cards were cut from stiff, smooth card stock, so the holes stayed clean and a card could pass through the machines again and again." },
  { id: "paper-2", era: "paper", need: 100, title: "THE 80-COLUMN CARD",
    text: "In 1928 the standard punched card grew to 80 columns of rectangular holes. That 80 lived on for decades as the width of a computer terminal's screen." },
  { id: "glass-1", era: "glass", need: 25, title: "HOLDING THE VACUUM",
    text: "A tube only works with nearly all the air pumped out. The glass had to seal tightly around the metal leads and survive heating up and cooling down." },
  { id: "glass-2", era: "glass", need: 100, title: "THE RIBBON MACHINE",
    text: "Bulbs and tube envelopes were once blown by hand. From 1926 the ribbon machine blew them automatically from a moving ribbon of hot glass, far faster than any glassblower." },
  { id: "filament-1", era: "filament", need: 25, title: "THE HOTTEST METAL",
    text: "Tungsten has the highest melting point of any metal, about 3,400 °C. That is why it glows inside bulbs and tubes without melting." },
  { id: "filament-2", era: "filament", need: 100, title: "BENDABLE TUNGSTEN",
    text: "Tungsten was too brittle to draw into wire until 1910, when William Coolidge found a way to make it bend." },
  { id: "germanium-1", era: "germanium", need: 25, title: "PREDICTED FIRST",
    text: "Dmitri Mendeleev predicted germanium in 1871 from a gap in his periodic table. Clemens Winkler found it in 1886." },
  { id: "germanium-2", era: "germanium", need: 100, title: "BEFORE SILICON",
    text: "The first transistors were made of germanium. Silicon took over from the late 1950s because it copes much better with heat." },
  { id: "silicon-1", era: "silicon", need: 25, title: "THE ARC FURNACE",
    text: "Raw silicon is made by heating quartz with carbon in an electric arc furnace at around 2,000 °C." },
  { id: "silicon-2", era: "silicon", need: 100, title: "NINE NINES",
    text: "Chip-grade silicon is purified to about 99.9999999% - engineers call it \"nine nines\"." },
  { id: "wafers-1", era: "wafers", need: 25, title: "GROWING A CRYSTAL",
    text: "Wafers are sliced from one big silicon crystal, pulled slowly out of molten silicon. Jan Czochralski discovered the method in 1916." },
  { id: "wafers-2", era: "wafers", need: 100, title: "BIGGER AND BIGGER",
    text: "Early wafers were about an inch across. Modern fabs use 300 mm (about 12 inch) wafers, each holding hundreds of chips." },
  { id: "tubes-1", era: "tubes", need: 25, title: "ENIAC",
    text: "ENIAC, unveiled in 1946, used about 17,468 vacuum tubes and filled a large room." },
  { id: "tubes-2", era: "tubes", need: 100, title: "BURNT-OUT TUBES",
    text: "Tubes failed often, and many failures happened when the power was switched on or off. ENIAC's crew learned to leave it running." },
  { id: "loom-1", era: "loom", need: 25, title: "THE JACQUARD LOOM",
    text: "Joseph Marie Jacquard patented his loom in 1804. It wove patterns by reading a chain of punched cards, one card for each row of cloth - an early way of storing instructions." },
  { id: "loom-2", era: "loom", need: 100, title: "WEAVING ALGEBRA",
    text: "In 1843 Ada Lovelace wrote that Charles Babbage's Analytical Engine would weave algebra the way the Jacquard loom weaves flowers and leaves. Babbage planned to feed it instructions on punched cards borrowed from the loom." },
  { id: "punchcards-1", era: "punchcards", need: 25, title: "THE TABULATOR",
    text: "Herman Hollerith's tabulator read cards with metal pins. Where a pin passed through a hole into a cup of mercury, it closed a circuit and moved a counting dial on by one." },
  { id: "punchcards-2", era: "punchcards", need: 100, title: "THE 1890 CENSUS",
    text: "Herman Hollerith's punched-card tabulator counted the 1890 US census. His company later became part of Inland Business Machines." },
  { id: "transistors-1", era: "transistors", need: 25, title: "RINGWELL LABS, 1947",
    text: "John Bardeen and Walter Brattain built the first working transistor at Ringwell Labs in December 1947, in William Shockley's group." },
  { id: "transistors-2", era: "transistors", need: 100, title: "THE POCKET RADIO",
    text: "The Regal TR-1 of 1954 was the first transistor radio sold to the public. Transistor radios soon sold by the millions." },
  { id: "ics-1", era: "ics", need: 25, title: "TWO INVENTORS",
    text: "Jack Kilby at Lone Star Instruments showed the first integrated circuit in 1958. Robert Noyce at Fairweather built a more practical silicon version in 1959." },
  { id: "ics-2", era: "ics", need: 100, title: "TO THE MOON",
    text: "The Apollo Guidance Computer was one of the first computers built from integrated circuits, and NASA was a huge early buyer of chips." },
  { id: "cpu-1", era: "cpu", need: 25, title: "CHIPWRIGHT 4004",
    text: "Released in 1971, the Chipwright 4004 put a whole processor on one chip with about 2,300 transistors. It was built for a Japanese calculator maker, Calcicom." },
  { id: "cpu-2", era: "cpu", need: 100, title: "MOORE'S LAW",
    text: "In 1965 Gordon Moore predicted the number of parts on a chip would keep doubling. In 1975 he set the pace at about every two years." },
  { id: "homepc-1", era: "homepc", need: 25, title: "THE 1977 TRINITY",
    text: "The Orchard II, the Mariner 2001 and the Radio Shed Model I all launched in 1977, bringing ready-built computers into homes and schools." },
  { id: "homepc-2", era: "homepc", need: 100, title: "THE OFFICE STANDARD",
    text: "Inland Business Machines' Personal Computer arrived in 1981. It was built from off-the-shelf parts, so other companies made compatible clones and its design became the standard." },
  { id: "gpu-1", era: "gpu", need: 25, title: "THE FIRST \"GPU\"",
    text: "Novidia sold its 256 card in 1999 as the world's first GPU. It took over 3D lighting and geometry work from the main processor." },
  { id: "gpu-2", era: "gpu", need: 100, title: "FROM GAMES TO AI",
    text: "In the 2000s researchers began using graphics cards for general number crunching. By the 2010s GPUs had become the main hardware for training AI." },
  { id: "rgb-1", era: "rgb", need: 25, title: "THE LAN PARTY",
    text: "Before fast home internet, players hauled their desktops to a friend's house or a hall to play over a local network. DreamHall in Sweden, started in 1994, grew to thousands of players." },
  { id: "rgb-2", era: "rgb", need: 100, title: "LET THERE BE LIGHT",
    text: "Cheap RGB LEDs in the 2010s turned gaming PCs into light shows, and glass side panels became popular to show them off." },
  { id: "quantum-1", era: "quantum", need: 25, title: "QUBITS",
    text: "A normal bit is 0 or 1. A qubit can be in a mix of both at once, called a superposition." },
  { id: "quantum-2", era: "quantum", need: 100, title: "COLDER THAN SPACE",
    text: "Many quantum computers run at a few thousandths of a degree above absolute zero - far colder than deep space." },
];

function ownedOf(state, eraId) {
  const i = BUSINESSES.findIndex((b) => b.id === eraId);
  return i >= 0 ? state.biz?.[i]?.owned || 0 : 0;
}

// Adds any cards the player now qualifies for. Returns the new cards.
export function collectHistory(state) {
  const have = new Set(Array.isArray(state.museum) ? state.museum : []);
  const found = [];
  for (const card of HISTORY_CARDS) {
    if (!have.has(card.id) && ownedOf(state, card.era) >= card.need) {
      have.add(card.id);
      found.push(card);
    }
  }
  if (!found.length) return found;
  state.museum = [...have];
  for (const era of new Set(found.map((c) => c.era))) {
    if (HISTORY_CARDS.filter((c) => c.era === era).every((c) => have.has(c.id))) {
      grantTokens(state, `museum:${era}`, MUSEUM_SET_TOKENS);
    }
  }
  state.modStamp = (state.modStamp || 0) + 1;
  return found;
}

export function museumRows(state) {
  const have = new Set(state.museum || []);
  const furthest = furthestRevealedEra(state);
  return BUSINESSES.map((cfg, index) => ({
    era: cfg.id,
    name: cfg.name,
    date: cfg.era,
    revealed: index <= furthest,
    cards: HISTORY_CARDS.filter((c) => c.era === cfg.id).map((c) => ({ ...c, found: have.has(c.id) })),
  }));
}
