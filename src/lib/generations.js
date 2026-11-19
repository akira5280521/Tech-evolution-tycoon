// Chip generations for the Microprocessors and Graphics Cards rows.
// Company names are parody. Years, model numbers and specs are real.
// The first generation is the row as it stands at 1 owned. Each later one
// adds about 5% to that row's revenue. Icons stay the row's own icon until
// the generation art exists.

export const GENERATION_BONUS = 0.05;

export const GENERATIONS = {
  cpu: [
    { id: "cpu-4bit", need: 1, year: "1971", name: "Chipwright 4004", tagline: "A 4-bit calculator chip, about 2,300 transistors, running at 740 kHz for Calcicom.",
      card: { title: "CHIPWRIGHT 4004", text: "Released in 1971, the Chipwright 4004 put a whole processor on one chip: 4-bit, about 2,300 transistors, 740 kHz. It was built for the calculator maker Calcicom." } },
    { id: "cpu-8080", need: 25, year: "1974", name: "Chipwright 8080", tagline: "An 8-bit chip at 2 MHz, in a 40-pin package. The processor in the first hobby kits.",
      card: { title: "CHIPWRIGHT 8080", text: "The Chipwright 8080 arrived in April 1974. It is an 8-bit NMOS chip at 2 MHz in a 40-pin package, and it ran the first widely sold computer kits." } },
    { id: "cpu-8086", need: 50, year: "1978", name: "Chipwright 8086", tagline: "16-bit, 5 to 10 MHz, about 29,000 transistors.",
      card: { title: "CHIPWRIGHT 8086", text: "On 8 June 1978 the Chipwright 8086 made the processor 16-bit. The first parts ran at 5 to 10 MHz and held about 29,000 transistors." } },
    { id: "cpu-386", need: 100, year: "1985", name: "Chipwright 386", tagline: "A 32-bit chip, first sold at 16 MHz, with about 275,000 transistors.",
      card: { title: "CHIPWRIGHT 386", text: "The Chipwright 386, introduced on 17 October 1985, was a 32-bit processor. The first ones ran at 16 MHz and carried about 275,000 transistors." } },
    { id: "cpu-alder64", need: 200, year: "2003", name: "Alder 64", tagline: "Alder Micro Devices' first 64-bit PC chip, at 130 nm. Desktops followed that September.",
      card: { title: "ALDER 64", text: "In April 2003 Alder Micro Devices shipped the first chips to run the 64-bit extension of the PC instruction set, at 130 nm. The desktop version followed in September." } },
    { id: "cpu-dual", need: 300, year: "2005", name: "Chipwright Dual", tagline: "Two cores in one package. The first desktop parts ran at 2.8 GHz.",
      card: { title: "CHIPWRIGHT DUAL", text: "In May 2005 the Chipwright Dual put two cores in one package. The first desktop parts ran at 2.8 GHz. Alder shipped a two-core chip the same month." } },
    { id: "cpu-alder32", need: 400, year: "2017", name: "Alder 32", tagline: "Up to 32 cores, four chips on one package. The 2019 follow-on split off a separate I/O chip.",
      card: { title: "ALDER 32", text: "On 20 June 2017 Alder Micro Devices shipped a server chip with up to 32 cores: four chips on one package, with DDR4 memory. The 2019 follow-on put the compute chips beside a separate I/O chip." } },
  ],
  gpu: [
    { id: "gpu-2d", need: 1, year: "1990", name: "Rasterline 4000", tagline: "A 2D SVGA card on the ISA bus, up to 1024×768.",
      card: { title: "RASTERLINE 4000", text: "Around 1990 the Rasterline 4000 was a fast 2D card: SVGA, an ISA bus, and modes up to 1024×768." } },
    { id: "gpu-3d", need: 25, year: "1996", name: "Threefold Add-in", tagline: "3D only, on PCI, with 4 MB. It sat beside a separate 2D card.",
      card: { title: "THREEFOLD ADD-IN", text: "In 1996 the Threefold Add-in did only 3D. It used a PCI slot and 4 MB, and the picture still came from a separate 2D card beside it." } },
    { id: "gpu-256", need: 50, year: "1999", name: "Novidia 256", tagline: "Hardware transform and lighting. The card that was sold as a GPU.",
      card: { title: "NOVIDIA 256", text: "In October 1999 Novidia sold its 256 card as a GPU. It took transform and lighting off the main processor." } },
    { id: "gpu-3", need: 100, year: "2001", name: "Novidia 3", tagline: "Programmable vertex and pixel shaders.",
      card: { title: "NOVIDIA 3", text: "In February 2001 the Novidia 3 added programmable vertex and pixel shaders, so a game could run its own small programs on the card." } },
    { id: "gpu-8800", need: 200, year: "2006", name: "Novidia 8800", tagline: "Unified shaders, 128 processors, 768 MB, and general computing on the card.",
      card: { title: "NOVIDIA 8800", text: "In November 2006 the Novidia 8800 replaced separate shader types with one pool: 128 processors and 768 MB. The same hardware started doing general computing, not only graphics." } },
    { id: "gpu-100", need: 300, year: "2017", name: "Novidia 100", tagline: "Tensor cores for matrix math, with 16 GB of stacked memory. A data-center card.",
      card: { title: "NOVIDIA 100", text: "In May 2017 the Novidia 100 added tensor cores for matrix math and 16 GB of stacked memory. It was a data-center card. Consumer cards with tensor cores came the next year." } },
    { id: "gpu-2080", need: 400, year: "2018", name: "Novidia 2080", tagline: "The first consumer card with hardware ray-tracing cores.",
      card: { title: "NOVIDIA 2080", text: "On 20 September 2018 the Novidia 2080 went on sale. It was the first consumer graphics card with hardware cores for ray tracing." } },
  ],
};

export function generationList(id) {
  return GENERATIONS[id] || null;
}

// `done` is the researched ids. When it is an array, a later generation also
// has to be researched. Omit it and the old owned-count rule is used, so a
// tool that never heard of research still prices the rows the same way.
export function generationIndex(id, owned, done) {
  const list = generationList(id);
  if (!list) return -1;
  let index = -1;
  const have = Number.isFinite(owned) ? owned : 0;
  const gate = Array.isArray(done);
  list.forEach((gen, i) => {
    if (have < gen.need) return;
    if (gate && i > 0 && !done.includes(gen.id)) return;
    index = i;
  });
  return index;
}

export function generationAt(id, owned, done) {
  const list = generationList(id);
  const index = generationIndex(id, owned, done);
  return index >= 0 ? list[index] : null;
}

// The first generation is the row's ordinary pay. Each later one adds 5%.
export function generationPayMult(id, owned, done) {
  const index = generationIndex(id, owned, done);
  if (index <= 0) return 1;
  return 1 + index * GENERATION_BONUS;
}

export function generationCards() {
  const cards = [];
  for (const [era, list] of Object.entries(GENERATIONS)) {
    for (const gen of list) {
      cards.push({ id: gen.id, era, need: gen.need, title: gen.card.title, text: gen.card.text, generation: true });
    }
  }
  return cards;
}

export function generationCardIds() {
  return new Set(generationCards().map((card) => card.id));
}
