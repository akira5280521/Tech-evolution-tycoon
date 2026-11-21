// History cards for the Museum. Two per era: one at 25 owned, one at 100.
// Cards are kept forever (they survive prestige, forks and challenges).
// Finding both cards of an era pays a one-time token bonus.
// Company names are parody. Model numbers and specs stay real.
import { BUSINESSES } from "./gameConfig.js";
import { furthestRevealedEra, grantTokens } from "./empire.js";
import { generationCardIds, generationCards } from "./generations.js";

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
    text: "Raster sold its 256 card in 1999 as the world's first GPU. It took over 3D lighting and geometry work from the main processor." },
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
  { id: "vr-1", era: "vr", need: 25, title: "VISOR Q2",
    text: "Visor's Q2 came out in October 2020: a headset with its own chip and battery, no PC, no cable. Four cameras on the front track the room and your hands." },
  { id: "vr-2", era: "vr", need: 100, title: "INSIDE-OUT TRACKING",
    text: "Early headsets needed boxes on the walls to track them. Inside-out tracking turns that around: cameras on the headset watch the room and work out where you are." },
  { id: "chatbots-1", era: "chatbots", need: 25, title: "PARLANCE",
    text: "Parlance opened to the public on 30 November 2022. It answered in plain sentences, and a million people signed up in five days." },
  { id: "chatbots-2", era: "chatbots", need: 100, title: "NEXT WORD",
    text: "A language model writes by guessing the next piece of a word, over and over. It learned those guesses from a huge amount of text." },
  { id: "supercluster-1", era: "supercluster", need: 25, title: "ONE MODEL, MANY CARDS",
    text: "By 2024 the largest training runs used tens of thousands of Tensor cards at once, linked by fast networks so they act like one machine." },
  { id: "supercluster-2", era: "supercluster", need: 100, title: "POWER STATIONS",
    text: "A big AI cluster draws as much power as a small town. New data centers were planned next to power stations, and some next to nuclear plants." },
  { id: "relay-1", era: "relay", need: 25, title: "CROSSBAR WORKS MODEL 3",
    text: "On 12 May 1941 Crossbar Works showed model 3 in Berlin. About 2,600 relays, binary floating point, 22-bit words, 64 words of memory, and a clock near 5 Hz. A multiply took about 3 seconds. The program was on punched film." },
  { id: "relay-2", era: "relay", need: 100, title: "INLAND AUTOMATIC SEQUENCER",
    text: "Inland Business Machines' Automatic Sequencer was presented at Harvard on 7 August 1944. It was 51 feet long, with about 3,500 relays, and it held 72 numbers of 23 decimal digits. About 3 additions a second. A multiply took about 6 seconds. Instructions came on punched tape." },
  { id: "mainframes-1", era: "mainframes", need: 25, title: "IRWELL MARK 1",
    text: "Irwell Electrics delivered the Mark 1 to Manchester in February 1951, the first commercial electronic computer to be installed. About 4,050 vacuum tubes. The working memory was Williams tubes, storing 40-bit words, two 20-bit instructions to a word. A magnetic drum held the rest." },
  { id: "mainframes-2", era: "mainframes", need: 100, title: "WILLIAMS TUBES",
    text: "A Williams tube stores bits as dots of charge on the face of a cathode-ray tube, and reads them back before they fade. The Irwell Mark 1 kept its working store that way, 40 bits to a word." },
  { id: "minis-1", era: "minis", need: 25, title: "MAYNARD EQUIPMENT 8",
    text: "Maynard Equipment introduced the 8 on 22 March 1965. A 12-bit machine, diode-transistor logic, about the size of a refrigerator, at an introductory price of about $18,500." },
  { id: "minis-2", era: "minis", need: 100, title: "MAYNARD EQUIPMENT 11",
    text: "The Maynard Equipment 11 arrived in 1970. 16-bit, with one Unibus linking the processor, the memory and the devices. A complete system was listed at $10,800." },
  { id: "consoles-1", era: "consoles", need: 25, title: "PADDLE ARTS 2600",
    text: "The Paddle Arts 2600 went on sale on 11 September 1977. A MOS 6507 at 1.19 MHz, 128 bytes of RAM, and games on cartridges. The introductory price was $189.95." },
  { id: "consoles-2", era: "consoles", need: 100, title: "KYOTO FAMILY DECK",
    text: "The Kyoto Family Deck launched in Japan on 15 July 1983, and the export Home Deck reached a New York test on 18 October 1985. A Ricoh 2A03, built on a 6502 core, at 1.79 MHz, with 2 KB of work RAM. In 1994 Silverdisc's Station moved games onto CD: a MIPS R3000A at 33.8688 MHz, 2 MB of main RAM and 1 MB of video RAM." },
  { id: "dialup-1", era: "dialup", need: 25, title: "THE FIRST PUBLIC PAGE",
    text: "On 6 August 1991 the first public website, info.cern.ch, went online. It was one page, served from Tim Berners-Lee's machine at CERN." },
  { id: "dialup-2", era: "dialup", need: 100, title: "MAINSAIL AND A 28.8",
    text: "Mainsail Navigator arrived in December 1994 and drew pictures and links in the page. A Stateside 28.8 modem, using V.34, moved 28.8 kbit/s over an ordinary phone line." },
  { id: "cloud-1", era: "cloud", need: 25, title: "CANOPY BUCKET",
    text: "On 14 March 2006 Canopy Bucket went on sale: rented storage, billed by the amount kept and the amount moved, reached over the web." },
  { id: "cloud-2", era: "cloud", need: 100, title: "CANOPY INSTANCES",
    text: "On 25 August 2006 Canopy Instances opened its public beta. Rented virtual computers, started and stopped by the hour." },
  { id: "phones-1", era: "phones", need: 25, title: "ORCHARD HANDSET",
    text: "Orchard announced the Handset on 9 January 2007 and put it on sale on 29 June 2007. 412 MHz ARM11, 128 MB of RAM, a 3.5-inch 320×480 screen, and 4, 8 or 16 GB of flash." },
  { id: "phones-2", era: "phones", need: 100, title: "GLASS AND A STORE",
    text: "The first Orchard Handset had a 2-megapixel camera and no 3G. Multi-touch on the glass, and a store that delivered software without a shop, are what the later machines were bought for." },
  { id: "ai-1", era: "ai", need: 25, title: "TENSOR FOUNDRY T1",
    text: "Tensor Foundry announced the T1 in May 2016, after it had already been running inside the company through 2015. It is an inference chip, not a general processor." },
  { id: "ai-2", era: "ai", need: 100, title: "A 256 BY 256 ARRAY",
    text: "The T1's working heart is a 256 by 256 array of 8-bit multiply-accumulators, laid out so a matrix step keeps the units busy." },
];

export function isHistoryCardId(id) {
  return HISTORY_CARDS.some((card) => card.id === id) || generationCardIds().has(id);
}

function ownedOf(state, eraId) {
  const i = BUSINESSES.findIndex((b) => b.id === eraId);
  return i >= 0 ? state.biz?.[i]?.owned || 0 : 0;
}

// Adds any cards the player now qualifies for. Returns the new cards.
export function collectHistory(state) {
  const have = new Set(Array.isArray(state.museum) ? state.museum : []);
  const found = [];
  for (const card of [...HISTORY_CARDS, ...generationCards()]) {
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
    cards: [...HISTORY_CARDS, ...generationCards()].filter((c) => c.era === cfg.id).map((c) => ({ ...c, found: have.has(c.id) })),
  }));
}
