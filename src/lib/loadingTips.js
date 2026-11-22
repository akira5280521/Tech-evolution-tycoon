import { BUSINESSES } from "@/lib/gameConfig";
import { SAVE_KEY } from "@/lib/gameSave";

// Short facts for the loading screen. Company names follow the game's
// parody (Inland Business Machines, Ringwell Labs, and the rest). The
// history itself is the real one.

const GENERIC = [
  "The word computer once meant a person hired to do arithmetic.",
  "A vacuum tube is a switch with no moving parts: heat a filament, and electrons cross an empty glass bulb.",
  "A transistor does a tube's job inside a speck of crystal, with no glow and much less heat.",
  "Punched cards store a pattern as holes. The idea is older than electric computers.",
  "The silicon in a chip starts out as quartz, which is a kind of sand.",
];

const BY_ERA = {
  timber: "Paper was made from rags until the 1840s, when wood pulp made it cheap enough to use by the ton.",
  paper: "In 1928 the standard punched card settled at 80 columns. Screens kept that width for decades.",
  loom: "Joseph Marie Jacquard patented his card-reading loom in 1804. One card held one row of the pattern.",
  punchcards: "Herman Hollerith's tabulator counted the 1890 US census. His company later became part of Inland Business Machines.",
  sand: "Chip-grade silicon is purified to about 99.9999999 percent. Engineers call that nine nines.",
  copper: "Copper conducts electricity better than any metal except silver, which is why it wires almost every circuit.",
  glass: "From 1926 the ribbon machine blew bulbs from a moving ribbon of hot glass, faster than any glassblower.",
  filament: "Tungsten melts at about 3,400 °C, so it can glow inside a tube without melting.",
  tubes: "ENIAC, unveiled in 1946, used about 17,468 vacuum tubes and filled a large room.",
  relay: "Crossbar Works model 3, shown in 1941, used about 2,600 relays and a clock near 5 Hz.",
  mainframes: "Irwell Electrics delivered the Mark 1 to Manchester in February 1951. Its working memory was Williams tubes, 40 bits to a word.",
  minis: "The Maynard Equipment 8, introduced on 22 March 1965, was a 12-bit machine for about $18,500.",
  consoles: "The Paddle Arts 2600 went on sale on 11 September 1977 with 128 bytes of RAM and games on cartridges.",
  dialup: "The first public website, info.cern.ch, went online on 6 August 1991.",
  cloud: "Canopy Bucket, rented storage billed by the amount kept and moved, went on sale on 14 March 2006.",
  phones: "The Orchard Handset went on sale on 29 June 2007: 412 MHz, 128 MB of RAM, and a 3.5-inch 320×480 screen.",
  ai: "Tensor Foundry announced the T1 in May 2016: a 256 by 256 array of 8-bit multiply-accumulators.",
  germanium: "The first transistors were germanium. Silicon took over in the late 1950s because it handles heat better.",
  transistors: "John Bardeen and Walter Brattain showed the first working transistor at Ringwell Labs in December 1947.",
  silicon: "Raw silicon is made by heating quartz with carbon in an electric furnace at around 2,000 °C.",
  wafers: "Wafers are sliced from one silicon crystal. Jan Czochralski found the growing method in 1916.",
  ics: "Jack Kilby at Lone Star Instruments showed the first integrated circuit in 1958. Robert Noyce at Fairweather made a practical silicon one in 1959.",
  cpu: "The Chipwright 4004, released in 1971, put about 2,300 transistors on one chip for the calculator maker Calcicom.",
  homepc: "The Orchard II, the Mariner 2001 and the Radio Shed Model I all went on sale in 1977.",
  gpu: "Raster sold its 256 card in 1999 as a GPU, and moved 3D lighting off the main processor.",
  rgb: "Before fast home internet, players carried their computers to one room and played over a local network.",
  quantum: "The qubits in a superconducting quantum computer are kept colder than outer space, a fraction of a degree above absolute zero.",
  supercomputers: "The first Chippewa supercomputer was cooled by liquid Freon flowing through its frame.",
  workstations: "Many 1980s workstations had no disk of their own: they started up over the network from a server.",
  laptops: "Early laptops weighed over ten pounds; the battery alone could weigh as much as a modern laptop.",
  multimedia: "A CD-ROM holds about 650 MB, more than four hundred 1.44 MB floppy disks.",
  accel3d: "The first 3D-only cards passed the 2D card's picture through a short cable on the back.",
  tablets: "A capacitive touchscreen senses the charge in your finger, so a gloved hand doesn't work.",
  vr: "A standalone VR headset tracks the room with cameras on its front, so there are no base stations to set up.",
  chatbots: "A language model writes one piece of a word at a time, each time picking the likeliest next piece.",
  supercluster: "Training one large model can keep tens of thousands of graphics cards busy for months.",
};

function reachedIndex() {
  if (typeof window === "undefined") return -1;
  try {
    const raw = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "null");
    const rows = Array.isArray(raw?.biz) ? raw.biz : [];
    let best = -1;
    rows.forEach((row, i) => {
      const id = typeof row?.id === "string" ? row.id : BUSINESSES[i]?.id;
      const index = BUSINESSES.findIndex((cfg) => cfg.id === id);
      const at = index >= 0 ? index : i;
      if ((row?.owned || 0) > 0 && at > best) best = at;
    });
    // The free starter Timber Camp is not a reached era yet.
    if (best === 0 && (rows[0]?.owned || 0) <= 1 && rows.every((row, i) => i === 0 || !(row?.owned > 0))) return -1;
    return best;
  } catch {
    return -1;
  }
}

export function loadingFacts() {
  const best = reachedIndex();
  if (best < 0) return GENERIC.slice();
  const facts = GENERIC.slice();
  BUSINESSES.forEach((cfg, i) => {
    if (i <= best && BY_ERA[cfg.id]) facts.push(BY_ERA[cfg.id]);
  });
  return facts;
}
