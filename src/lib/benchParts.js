// The PC build bench: one PC at a time, built from parts that really fit
// together. A board takes one CPU socket and one memory type; a CPU needs a
// board with its socket; memory sticks go in the board's slots. Each part
// opens in its real year once researched on TECH. Company names are parody
// (Chipwright for Intel, Alder for AMD); model numbers, years and specs are
// the real ones.
//
// perf is a game number (roughly the fourth root of the chip's MIPS), not a
// real benchmark. ramMb is the memory a PC of that chip's day ran with.

import { BUSINESSES } from "./gameConfig.js";
import { ERA_YEAR } from "./eraYear.js";

// What a part of a given year costs: the base cost of the era of that year,
// so a 1977 board costs about as much as a Home Computer, and a 2024 board
// about as much as an AI Supercluster.
function eraCostAt(year) {
  const points = BUSINESSES.map((b) => [ERA_YEAR[b.id], b.baseCost]).filter(([y]) => y >= 1970).sort((a, b) => a[0] - b[0]);
  let lo = points[0];
  let hi = points[points.length - 1];
  for (let i = 0; i < points.length - 1; i++) {
    if (year >= points[i][0] && year <= points[i + 1][0]) {
      lo = points[i];
      hi = points[i + 1];
      break;
    }
  }
  if (year <= lo[0]) return lo[1];
  if (year >= hi[0]) return hi[1];
  const t = hi[0] === lo[0] ? 0 : (year - lo[0]) / (hi[0] - lo[0]);
  return Math.exp(Math.log(lo[1]) + t * (Math.log(hi[1]) - Math.log(lo[1])));
}

export const price = (year, share) => {
  const raw = eraCostAt(year) * share;
  const digits = Math.pow(10, Math.max(0, Math.floor(Math.log10(raw)) - 1));
  return Math.round(raw / digits) * digits;
};

const base = { fits: ["bench"], coef: 1 };
const icon = (id) => `/icons/bench/${id}.png`;

// A board: its socket, the CPU families its chipset supports (BIOS updates
// included where the maker shipped them), memory type and slots, the fastest
// memory it runs (memMax, MT/s; 0 before SDRAM), whether it can overclock the
// CPU (oc) and whether memory is held to the CPU's rated speed (memLock), the
// graphics slot (gpuSlot) and its PCI Express generation (pcie).
function board(id, name, year, socket, supports, mem, slots, memMax, flags, gpuSlot, pcie, spec) {
  return {
    ...base, id, kind: "board", name, year, research: `board-${id.slice(2)}`, socket, supports, mem, slots, memMax,
    oc: flags.includes("oc"), memLock: flags.includes("lock"), gpuSlot, pcie, icon: icon(id), cost: price(year, 0.3), spec,
  };
}
// A CPU: socket(s), family (gen, what chipsets list), perf, the memory a PC
// of its day ran with (ramMb), the memory types and rated speeds of its own
// memory controller (memSpeed; null when the board's chipset drives memory),
// whether it's unlocked for overclocking, and its PCI Express generation.
function cpu(id, name, year, research, sockets, gen, perf, ramMb, memSpeed, unlocked, pcie, spec) {
  const list = Array.isArray(sockets) ? sockets : [sockets];
  return {
    ...base, id, kind: "cpu", name, year, research, socket: list[0], sockets: list, gen, perf, ramMb,
    memSpeed: memSpeed || null, unlocked: !!unlocked, pcie: pcie || 0, icon: icon(id), cost: price(year, 0.5), spec,
  };
}
function stick(id, name, year, research, mem, mb, speed, spec) {
  return { ...base, id, kind: "stick", name, year, research, mem, mb, speed, icon: icon(id), cost: price(year, 0.06), spec };
}

const S7 = ["s7-single", "s7-split", "k62"];
const AM4 = ["zen1", "zen+", "zen2", "zen3"];
const LGA1700 = ["adl", "rpl", "rpl-r"];

export const BENCH_BOARDS = [
  board("b-altair", "Mitts Altair 8800 board", 1975, "8080", ["8080"], "dip", 4, 0, [], "s100", 0, "1975: the kit computer on the S-100 bus that started the hobby."),
  board("b-orchard2", "Orchard II board", 1977, "6502", ["6502"], "dip", 3, 0, [], "apple", 0, "1977: three banks of 16 KB chips, 48 KB at most, and eight card slots."),
  board("b-trs80", "Radio Shed Model I board", 1977, "z80", ["z80"], "dip", 2, 0, [], "none", 0, "1977: the Z80 board under the Model I's keyboard."),
  board("b-5150", "Inland PC board", 1981, "8088", ["8088"], "dip", 4, 0, [], "isa8", 0, "1981: the Inland PC's board, five 8-bit ISA slots, four banks of memory chips."),
  board("b-at", "Inland PC/AT board", 1984, "286", ["286"], "dip", 2, 0, [], "isa16", 0, "1984: 16-bit ISA slots and 512 KB on the board."),
  board("b-deskpro", "Compass Deskpro 386 board", 1986, "386", ["386"], "dip", 4, 0, [], "isa16", 0, "1986: the first 386 PC, beating Inland to the chip."),
  board("b-vlb", "486 VL-Bus board", 1992, "486", ["486"], "simm30", 8, 0, [], "vlb", 0, "1992: a 486 socket, eight 30-pin SIMM slots and the VESA local bus."),
  board("b-430lx", "Chipwright 430LX board", 1993, "socket4", ["p5"], "simm72", 4, 0, [], "pci", 0, "1993: the first 586 boards, PCI slots and 72-pin SIMMs."),
  board("b-nxvl", "NextGen NxVL board", 1994, "nx586", ["nx586"], "simm72", 4, 0, [], "vlb", 0, "1994: NextGen's own chipset, because the Nx586 fit no other board."),
  board("b-430fx", "Chipwright 430FX board", 1995, "socket7", ["s7-single"], "simm72", 4, 0, [], "pci", 0, "1995: Socket 7 and EDO, but one CPU voltage only, so no MMX-era chips."),
  board("b-440fx", "Chipwright 440FX board", 1996, "socket8", ["p6"], "simm72", 4, 0, [], "pci", 0, "1996: Socket 8 for the 586 Pro."),
  board("b-430tx", "Chipwright 430TX board", 1997, "socket7", ["s7-single", "s7-split", "k62"], "sdram", 3, 66, [], "pci", 0, "1997: split CPU voltage for MMX-era chips, and SDRAM."),
  board("b-440lx", "Chipwright 440LX board", 1997, "slot1", ["p2"], "sdram", 3, 66, [], "agp-3.3", 0, "1997: Slot 1, SDRAM and the first AGP slot, at a 66 MHz bus."),
  board("b-mvp3", "Viatek MVP3 board", 1998, "socket7", S7, "sdram", 3, 100, [], "agp-3.3", 0, "1998: Super Socket 7, a 100 MHz bus and AGP."),
  board("b-440bx", "Chipwright 440BX board", 1998, "slot1", ["p2", "p3"], "sdram", 4, 100, [], "agp-3.3", 0, "1998: Slot 1, a 100 MHz bus and PC100 SDRAM."),
  board("b-be6", "Abacus BE6 board", 1998, "slot1", ["p2", "p3"], "sdram", 3, 133, ["oc"], "agp-3.3", 0, "1998: a 440BX board known for changing clocks without jumpers."),
  board("b-amd750", "Alder 750 board", 1999, "slota", ["k7"], "sdram", 3, 100, [], "agp-3.3", 0, "1999: Slot A for the first K7 chips."),
  board("b-kt7", "Abacus KT7 board", 2000, "socketa", ["tbird"], "sdram", 3, 133, ["oc"], "agp-1.5", 0, "2000: Socket A with PC133, for chips on a 100 MHz bus."),
  board("b-845", "Chipwright 845 board", 2001, "s478", ["p4-400"], "sdram", 3, 133, [], "agp-1.5", 0, "2001: the first Socket 478 board, still on PC133 SDRAM."),
  board("b-kt266a", "Viatek KT266A board", 2001, "socketa", ["tbird", "xp"], "ddr", 3, 266, [], "agp-1.5", 0, "2001: Socket A with DDR and a 133 MHz bus."),
  board("b-8rda", "Epox 8RDA+ board", 2002, "socketa", ["tbird", "xp"], "ddr", 3, 400, ["oc"], "agp-1.5", 0, "2002: nForce2, dual-channel DDR for Socket A."),
  board("b-875p", "Chipwright 875P board", 2003, "s478", ["p4-400", "p4-800"], "ddr", 4, 400, [], "agp-1.5", 0, "2003: an 800 MHz bus, dual-channel DDR-400 and AGP 8x."),
  board("b-ic7", "Abacus IC7-MAX3 board", 2003, "s478", ["p4-400", "p4-800"], "ddr", 4, 400, ["oc"], "agp-1.5", 0, "2003: an 875P board built for overclocking."),
  board("b-nf3", "Raster nForce3 Ultra board", 2004, "s939", ["k8", "k8x2"], "ddr", 4, 400, ["oc"], "agp-1.5", 0, "2004: Socket 939 with an AGP slot."),
  board("b-nf4", "Raster nForce4 board", 2004, "s939", ["k8", "k8x2"], "ddr", 4, 400, ["oc"], "pcie", 1, "2004: Socket 939 with PCI Express graphics."),
  board("b-lanparty", "DFX LanParty nF4 board", 2005, "s939", ["k8", "k8x2"], "ddr", 4, 500, ["oc"], "pcie", 1, "2005: a glowing nForce4 board for overclockers."),
  board("b-915btx", "Chipwright D915GUX board", 2004, "lga775", ["p4-775"], "ddr2", 4, 533, [], "pcie", 1, "2004: a BTX board, built for the layout that was meant to replace ATX."),
  board("b-945p", "Chipwright 945P board", 2005, "lga775", ["p4-775", "pd"], "ddr2", 4, 667, [], "pcie", 1, "2005: LGA775 and DDR2 for the first dual cores."),
  board("b-p965", "Chipwright P965 board", 2006, "lga775", ["p4-775", "pd", "c2"], "ddr2", 4, 800, ["oc"], "pcie", 1, "2006: DDR2-800 and support for the new two-core chips."),
  board("b-p35", "Chipwright P35 board", 2007, "lga775", ["c2", "c2-45"], "ddr2", 4, 1066, ["oc"], "pcie", 1, "2007: the 45 nm chips, but no more NetBurst ones."),
  board("b-790fx", "Alder 790FX board", 2007, "am2", ["phenom", "ph2", "ph2-am3"], "ddr2", 4, 1066, ["oc"], "pcie", 2, "2007: AM2+, DDR2 and PCI Express 2.0."),
  board("b-x48", "Chipwright X48 board", 2008, "lga775", ["c2", "c2-45"], "ddr3", 4, 1600, ["oc"], "pcie", 2, "2008: LGA775 with DDR3 and PCI Express 2.0."),
  board("b-x58", "Chipwright X58 board", 2008, "lga1366", ["nehalem"], "ddr3", 6, 2000, ["oc"], "pcie", 2, "2008: LGA1366 and triple-channel DDR3 in six slots."),
  board("b-x58c", "EVGO X58 Classified", 2009, "lga1366", ["nehalem"], "ddr3", 6, 2200, ["oc"], "pcie", 2, "2009: an E-ATX board with room for four graphics cards; it needs a full tower."),
  board("b-p55", "Chipwright P55 board", 2009, "lga1156", ["lynnfield"], "ddr3", 4, 2133, ["oc"], "pcie", 2, "2009: LGA1156, the first board with no northbridge."),
  board("b-890fx", "Alder 890FX board", 2010, "am3", ["ph2-am3"], "ddr3", 4, 1600, ["oc"], "pcie", 2, "2010: AM3 and DDR3; FX chips came later, on the next boards."),
  board("b-p67", "Chipwright P67 board", 2011, "lga1155", ["snb", "ivb"], "ddr3", 4, 2133, ["oc"], "pcie", 2, "2011: LGA1155 for overclocking, with no use for on-chip graphics."),
  board("b-h67", "Chipwright H67 board", 2011, "lga1155", ["snb", "ivb"], "ddr3", 4, 1333, ["lock"], "pcie", 2, "2011: on-chip graphics, no overclocking, memory at rated speed."),
  board("b-z68", "Chipwright Z68 board", 2011, "lga1155", ["snb", "ivb"], "ddr3", 4, 2133, ["oc"], "pcie", 2, "2011: overclocking and on-chip graphics together."),
  board("b-990fx", "Alder 990FX board", 2011, "am3", ["ph2-am3", "bulldozer"], "ddr3", 4, 1866, ["oc"], "pcie", 2, "2011: AM3+ for the FX chips."),
  board("b-z77", "Chipwright Z77 board", 2012, "lga1155", ["snb", "ivb"], "ddr3", 4, 2800, ["oc"], "pcie", 3, "2012: PCI Express 3.0 with the 3000-series chips."),
  board("b-z87", "Chipwright Z87 board", 2013, "lga1150", ["hsw"], "ddr3", 4, 3000, ["oc"], "pcie", 3, "2013: LGA1150, but not the 2014 4790K."),
  board("b-h87", "Chipwright H87 board", 2013, "lga1150", ["hsw"], "ddr3", 4, 1600, ["lock"], "pcie", 3, "2013: no overclocking, memory at rated speed."),
  board("b-z97", "Chipwright Z97 board", 2014, "lga1150", ["hsw", "hsw-r"], "ddr3", 4, 3200, ["oc"], "pcie", 3, "2014: the 4790K, and an M.2 slot."),
  board("b-z170", "Chipwright Z170 board", 2015, "lga1151", ["skl", "kbl"], "ddr4", 4, 3600, ["oc"], "pcie", 3, "2015: LGA1151, DDR4 and M.2."),
  board("b-z170i", "Abacus Z170I mini-ITX board", 2015, "lga1151", ["skl", "kbl"], "ddr4", 2, 3600, ["oc"], "pcie", 3, "2015: the whole board in 17 cm square, two memory slots and one card slot."),
  board("b-b150", "Chipwright B150 board", 2015, "lga1151", ["skl", "kbl"], "ddr4", 4, 2133, ["lock"], "pcie", 3, "2015: a budget board: no overclocking, memory held at 2133."),
  board("b-z270", "Chipwright Z270 board", 2017, "lga1151", ["skl", "kbl"], "ddr4", 4, 4000, ["oc"], "pcie", 3, "2017: more lanes for the 7000-series chips."),
  board("b-a320", "Alder A320 board", 2017, "am4", AM4, "ddr4", 2, 2667, ["lock"], "pcie", 3, "2017: the cheapest AM4 board, no overclocking."),
  board("b-b350", "Alder B350 board", 2017, "am4", AM4, "ddr4", 4, 3200, ["oc"], "pcie", 3, "2017: AM4 with overclocking at a mid price."),
  board("b-x370", "Alder X370 board", 2017, "am4", AM4, "ddr4", 4, 3200, ["oc"], "pcie", 3, "2017: AM4's first top board; later chips came by BIOS update."),
  board("b-x399", "Alder X399 board", 2017, "tr4", ["zen1-tr", "zen+-tr"], "ddr4", 8, 3600, ["oc"], "pcie", 3, "2017: the 4,094-pin TR4 socket and eight DDR4 slots."),
  board("b-zenith", "Abacus Zenith Extreme", 2017, "tr4", ["zen1-tr", "zen+-tr"], "ddr4", 8, 3600, ["oc"], "pcie", 3, "2017: an E-ATX X399 board, wider than ATX, for a full tower."),
  board("b-z370", "Chipwright Z370 board", 2017, "lga1151v2", ["cfl", "cfl-r"], "ddr4", 4, 4000, ["oc"], "pcie", 3, "2017: the same socket shape as Z170, but only 8000-series chips and later."),
  board("b-b360", "Chipwright B360 board", 2018, "lga1151v2", ["cfl", "cfl-r"], "ddr4", 4, 2666, ["lock"], "pcie", 3, "2018: no overclocking, memory held at 2666."),
  board("b-z390", "Chipwright Z390 board", 2018, "lga1151v2", ["cfl", "cfl-r"], "ddr4", 4, 4400, ["oc"], "pcie", 3, "2018: the board for the 9900K."),
  board("b-b450", "Alder B450 board", 2018, "am4", AM4, "ddr4", 4, 3466, ["oc"], "pcie", 3, "2018: the long-lived budget AM4 board."),
  board("b-x470", "Alder X470 board", 2018, "am4", AM4, "ddr4", 4, 3600, ["oc"], "pcie", 3, "2018: AM4's top board for the 2000-series."),
  board("b-x570", "Alder X570 board", 2019, "am4", ["zen+", "zen2", "zen3"], "ddr4", 4, 4400, ["oc"], "pcie", 4, "2019: PCI Express 4.0; no 1000-series chips."),
  board("b-b550", "Alder B550 board", 2020, "am4", ["zen2", "zen3"], "ddr4", 4, 4400, ["oc"], "pcie", 4, "2020: PCI Express 4.0 for the graphics slot; 3000-series chips and later only."),
  board("b-b550i", "Alder B550-I mini-ITX board", 2020, "am4", ["zen2", "zen3"], "ddr4", 2, 4400, ["oc"], "pcie", 4, "2020: a small AM4 board for shoebox cases."),
  board("b-z690", "Chipwright Z690 board", 2021, "lga1700", LGA1700, "ddr5", 4, 6400, ["oc"], "pcie", 5, "2021: LGA1700, DDR5 and PCI Express 5.0."),
  board("b-z690d4", "Chipwright Z690 DDR4 board", 2021, "lga1700", LGA1700, "ddr4", 4, 4000, ["oc"], "pcie", 5, "2021: the same chipset with DDR4 slots instead."),
  board("b-b660", "Chipwright B660 board", 2022, "lga1700", LGA1700, "ddr5", 4, 5600, [], "pcie", 4, "2022: no CPU overclocking, but memory can run past rated speed."),
  board("b-h610", "Chipwright H610 board", 2022, "lga1700", LGA1700, "ddr4", 2, 3200, ["lock"], "pcie", 4, "2022: the cheapest LGA1700 board, two DDR4 slots."),
  board("b-z790", "Chipwright Z790 board", 2022, "lga1700", LGA1700, "ddr5", 4, 7200, ["oc"], "pcie", 5, "2022: faster DDR5 for the 13000-series."),
  board("b-z790i", "Abacus Z790-I mini-ITX board", 2022, "lga1700", LGA1700, "ddr5", 2, 7600, ["oc"], "pcie", 5, "2022: DDR5 on a mini-ITX board, with M.2 slots stacked on top."),
  board("b-x670e", "Alder X670E board", 2022, "am5", ["zen4", "zen5"], "ddr5", 4, 6400, ["oc"], "pcie", 5, "2022: AM5, DDR5 only, PCI Express 5.0 graphics."),
  board("b-b650", "Alder B650 board", 2022, "am5", ["zen4", "zen5"], "ddr5", 4, 6400, ["oc"], "pcie", 4, "2022: AM5 with PCI Express 4.0 graphics."),
  board("b-a620", "Alder A620 board", 2023, "am5", ["zen4", "zen5"], "ddr5", 2, 6000, [], "pcie", 4, "2023: the cheapest AM5 board, no CPU overclocking."),
  board("b-z890", "Chipwright Z890 board", 2024, "lga1851", ["arl"], "ddr5", 4, 8000, ["oc"], "pcie", 5, "2024: LGA1851."),
];

// Drive connections, for the drive stage: fastest IDE mode (MB/s, 0 for none;
// 16 is PIO mode 4), SATA generation (1 = 1.5 Gbit/s, 2 = 3, 3 = 6) and M.2
// PCI Express generation. Drives run at the slower of drive and port.
const DRIVES = {
  "b-vlb": [16, 0, 0], "b-430lx": [16, 0, 0], "b-nxvl": [16, 0, 0], "b-430fx": [16, 0, 0], "b-440fx": [16, 0, 0],
  "b-430tx": [33, 0, 0], "b-440lx": [33, 0, 0], "b-mvp3": [66, 0, 0], "b-440bx": [33, 0, 0], "b-be6": [66, 0, 0],
  "b-amd750": [66, 0, 0], "b-kt7": [100, 0, 0], "b-845": [100, 0, 0], "b-kt266a": [100, 0, 0], "b-8rda": [133, 0, 0],
  "b-875p": [100, 1, 0], "b-ic7": [100, 1, 0], "b-nf3": [133, 1, 0], "b-nf4": [133, 2, 0], "b-lanparty": [133, 2, 0],
  "b-915btx": [100, 1, 0], "b-x58c": [133, 2, 0], "b-z170i": [0, 3, 3], "b-zenith": [0, 3, 3], "b-b550i": [0, 3, 4], "b-z790i": [0, 3, 4],
  "b-945p": [100, 2, 0], "b-p965": [133, 2, 0], "b-p35": [133, 2, 0], "b-790fx": [133, 2, 0], "b-x48": [133, 2, 0],
  "b-x58": [133, 2, 0], "b-p55": [133, 2, 0], "b-890fx": [133, 3, 0], "b-p67": [0, 3, 0], "b-h67": [0, 3, 0],
  "b-z68": [0, 3, 0], "b-990fx": [133, 3, 0], "b-z77": [0, 3, 0], "b-z87": [0, 3, 0], "b-h87": [0, 3, 0],
  "b-z97": [0, 3, 2], "b-z170": [0, 3, 3], "b-b150": [0, 3, 3], "b-z270": [0, 3, 3], "b-a320": [0, 3, 3],
  "b-b350": [0, 3, 3], "b-x370": [0, 3, 3], "b-x399": [0, 3, 3], "b-z370": [0, 3, 3], "b-b360": [0, 3, 3],
  "b-z390": [0, 3, 3], "b-b450": [0, 3, 3], "b-x470": [0, 3, 3], "b-x570": [0, 3, 4], "b-b550": [0, 3, 4],
  "b-z690": [0, 3, 4], "b-z690d4": [0, 3, 4], "b-b660": [0, 3, 4], "b-h610": [0, 3, 4], "b-z790": [0, 3, 4],
  "b-x670e": [0, 3, 5], "b-b650": [0, 3, 4], "b-a620": [0, 3, 4], "b-z890": [0, 3, 5],
};
for (const b of BENCH_BOARDS) {
  const [ide, sata, m2] = DRIVES[b.id] || [0, 0, 0];
  Object.assign(b, { ide, sata, m2 });
}

export const BENCH_CPUS = [
  cpu("c-8080", "Chipwright 8080", 1974, "cpu-8080", "8080", "8080", 0.74, 0.016, null, false, 0, "1974: 8-bit, 2 MHz."),
  cpu("c-6502", "Moss 6502", 1975, "cpu-6502", "6502", "6502", 0.81, 0.016, null, false, 0, "1975: 8-bit, about 1 MHz, sold for $25 when rivals cost $150 or more."),
  cpu("c-z80", "Zylar Z80", 1976, "cpu-z80", "z80", "z80", 0.87, 0.016, null, false, 0, "1976: 8-bit, runs 8080 programs, 2.5 MHz at launch."),
  cpu("c-8088", "Chipwright 8088", 1979, "cpu-8088", "8088", "8088", 0.76, 0.064, null, false, 0, "1979: a 16-bit chip on an 8-bit bus; the Inland PC ran it at 4.77 MHz."),
  cpu("c-286", "Chipwright 286", 1982, "cpu-286", "286", "286", 1.07, 0.512, null, false, 0, "1982: 16-bit, protected mode, 6 to 12 MHz."),
  cpu("c-386", "Chipwright 386", 1985, "cpu-386", "386", "386", 1.5, 2, null, false, 0, "1985: 32-bit, first sold at 16 MHz."),
  cpu("c-486", "Chipwright 486", 1989, "cpu-486", "486", "486", 2.6, 4, null, false, 0, "1989: cache and floating point on the chip, 25 MHz at launch."),
  cpu("c-am386", "Alder 386DX-40", 1991, "cpu-am386", "386", "386", 2.2, 4, null, false, 0, "1991: a 386 at 40 MHz, faster than any Chipwright 386."),
  cpu("c-cx486dlc", "Cyrus 486DLC", 1992, "cpu-cx486dlc", "386", "386", 2.3, 4, null, false, 0, "1992: 486 instructions on a chip that drops into a 386 board."),
  cpu("c-am486", "Alder 486DX2-66", 1993, "cpu-am486", "486", "486", 3, 8, null, false, 0, "1993: a 486 doubling its 33 MHz bus to 66 MHz inside."),
  cpu("c-586", "Chipwright 586", 1993, "cpu-pentium", "socket4", "p5", 3.4, 8, null, false, 0, "1993: superscalar, 60 MHz, about 3.1 million transistors."),
  cpu("c-nx586", "NextGen Nx586", 1994, "cpu-nx586", "nx586", "nx586", 3.3, 8, null, false, 0, "1994: a 586 rival that fit no other maker's board."),
  cpu("c-cx5x86", "Cyrus 5x86-100", 1995, "cpu-cx5x86", "486", "486", 3.4, 8, null, false, 0, "1995: close to a 586, on a 486 board."),
  cpu("c-586pro", "Chipwright 586 Pro", 1995, "cpu-586pro", "socket8", "p6", 4, 16, null, false, 0, "1995: out-of-order, with its cache in the same package."),
  cpu("c-k5", "Alder K5 PR100", 1996, "cpu-k5", "socket7", "s7-single", 3.7, 16, null, false, 0, "1996: Alder's own design, rated against a 100 MHz 586."),
  cpu("c-6x86", "Cyrus 6x86 PR166+", 1996, "cpu-6x86", "socket7", "s7-single", 3.9, 16, null, false, 0, "1996: runs at 133 MHz, rated against a 166 MHz 586."),
  cpu("c-586mmx", "Chipwright 586 MMX", 1997, "cpu-586mmx", "socket7", "s7-split", 4, 16, null, false, 0, "1997: 57 new instructions for media, and a split core voltage."),
  cpu("c-k6", "Alder K6-200", 1997, "cpu-k6", "socket7", "s7-split", 4.1, 16, null, false, 0, "1997: 200 MHz, MMX, on Socket 7."),
  cpu("c-6x86mx", "Cyrus 6x86MX PR233", 1997, "cpu-6x86mx", "socket7", "s7-split", 4.2, 32, null, false, 0, "1997: MMX and a bigger cache."),
  cpu("c-c6", "Centaurus C6-200", 1997, "cpu-c6", "socket7", "s7-single", 3.9, 16, null, false, 0, "1997: a small, cheap Socket 7 chip with one core voltage."),
  cpu("c-p2", "Chipwright P-II 300", 1997, "cpu-p2", "slot1", "p2", 4.5, 32, null, false, 0, "1997: a cartridge for Slot 1, 300 MHz."),
  cpu("c-300a", "Chipwright 300A", 1998, "cpu-300a", "slot1", "p2", 4.6, 32, null, true, 0, "1998: the budget chip famous for running at 450 MHz."),
  cpu("c-k62", "Alder K6-2 300", 1998, "cpu-k62", "socket7", "k62", 4.4, 32, null, false, 0, "1998: 3DNow instructions for 3D math and a 100 MHz bus."),
  cpu("c-mii", "Cyrus MII-300", 1998, "cpu-mii", "socket7", "s7-split", 4.4, 32, null, false, 0, "1998: the last chip Cyrus designed."),
  cpu("c-mp6", "Riser mP6 266", 1998, "cpu-mp6", "socket7", "s7-split", 4.1, 32, null, false, 0, "1998: a Socket 7 chip that reached few PCs before the company left the market."),
  cpu("c-k7", "Alder K7 600", 1999, "cpu-k7", "slota", "k7", 5.6, 64, null, false, 0, "1999: the first chip of its kind to beat Chipwright at the top."),
  cpu("c-p3", "Chipwright P-III 500", 1999, "cpu-p3", "slot1", "p3", 5.4, 64, null, false, 0, "1999: 500 MHz, a 100 MHz bus and SSE instructions."),
  cpu("c-tbird", "Alder T-1000", 2000, "cpu-tbird", "socketa", "tbird", 6.2, 128, null, false, 0, "2000: 1 GHz on Socket A, a 100 MHz bus."),
  cpu("c-p4a", "Chipwright P4 2.0", 2001, "cpu-p4a", "s478", "p4-400", 6.2, 256, null, false, 0, "2001: 2 GHz on a 400 MHz bus."),
  cpu("c-xp", "Alder 1800+", 2001, "cpu-xp", "socketa", "xp", 6.8, 256, null, false, 0, "2001: 1.53 GHz on a 133 MHz bus, rated against a 1.8 GHz rival."),
  cpu("c-p4", "Chipwright P4 3.0C", 2003, "cpu-p4", "s478", "p4-800", 7.3, 512, null, false, 0, "2003: 3 GHz, an 800 MHz bus and two threads on one core."),
  cpu("c-p4560", "Chipwright P4 560", 2004, "cpu-p4560", "lga775", "p4-775", 7.9, 1024, null, false, 0, "2004: 3.6 GHz on the new LGA775 socket, pins in the board instead of the chip."),
  cpu("c-a64", "Alder 64", 2003, "cpu-alder64", "s939", "k8", 7.6, 512, { ddr: 400 }, false, 0, "2003: the first 64-bit PC chip, memory controller on the chip."),
  cpu("c-x2", "Alder X2 4800+", 2005, "cpu-x2", "s939", "k8x2", 9.2, 1024, { ddr: 400 }, false, 0, "2005: two cores, 2.4 GHz."),
  cpu("c-dual", "Chipwright Dual", 2005, "cpu-dual", "lga775", "pd", 8.8, 1024, null, false, 0, "2005: two cores in one package, 2.8 GHz."),
  cpu("c-e6600", "Chipwright E6600", 2006, "cpu-e6600", "lga775", "c2", 10.5, 1024, null, false, 0, "2006: two cores, 2.4 GHz, far more done per clock."),
  cpu("c-q6600", "Chipwright Q6600", 2007, "cpu-q6600", "lga775", "c2", 12.6, 2048, null, false, 0, "2007: four cores at 2.4 GHz."),
  cpu("c-phenom", "Alder X4 9600", 2007, "cpu-phenom", "am2", "phenom", 11.8, 2048, { ddr2: 1066 }, false, 2, "2007: four cores on one die."),
  cpu("c-q9650", "Chipwright Q9650", 2008, "cpu-q9650", "lga775", "c2-45", 14, 4096, null, false, 0, "2008: four 45 nm cores at 3 GHz."),
  cpu("c-i7920", "Chipwright i7-920", 2008, "cpu-i7920", "lga1366", "nehalem", 15, 3072, { ddr3: 1066 }, false, 2, "2008: four cores, eight threads, memory controller on the chip."),
  cpu("c-ph2", "Alder X4 940", 2009, "cpu-ph2", "am2", "ph2", 14.5, 4096, { ddr2: 1066 }, true, 2, "2009: four cores at 3 GHz; an AM2+ chip only."),
  cpu("c-i7860", "Chipwright i7-860", 2009, "cpu-i7860", "lga1156", "lynnfield", 15.5, 4096, { ddr3: 1333 }, false, 2, "2009: PCI Express on the chip itself."),
  cpu("c-1100t", "Alder X6 1100T", 2010, "cpu-1100t", ["am3", "am2"], "ph2-am3", 16, 4096, { ddr2: 1066, ddr3: 1333 }, true, 2, "2010: six cores; fits AM2+ and AM3 boards, with DDR2 or DDR3."),
  cpu("c-2600k", "Chipwright i7-2600K", 2011, "cpu-2600k", "lga1155", "snb", 17, 8192, { ddr3: 1333 }, true, 2, "2011: graphics on the chip, 3.4 GHz, unlocked."),
  cpu("c-fx8150", "Alder FX-8150", 2011, "cpu-fx8150", "am3", "bulldozer", 17, 8192, { ddr3: 1866 }, true, 2, "2011: eight cores in four pairs."),
  cpu("c-3770k", "Chipwright i7-3770K", 2012, "cpu-3770k", "lga1155", "ivb", 18, 8192, { ddr3: 1600 }, true, 3, "2012: 22 nm, PCI Express 3.0 on Z77 boards."),
  cpu("c-4770k", "Chipwright i7-4770K", 2013, "cpu-4770k", "lga1150", "hsw", 19.5, 8192, { ddr3: 1600 }, true, 3, "2013: voltage regulation on the chip."),
  cpu("c-4790k", "Chipwright i7-4790K", 2014, "cpu-4790k", "lga1150", "hsw-r", 20, 8192, { ddr3: 1600 }, true, 3, "2014: 4 GHz out of the box; needs a 9-series board."),
  cpu("c-6700k", "Chipwright i7-6700K", 2015, "cpu-6700k", "lga1151", "skl", 20.5, 16384, { ddr4: 2133 }, true, 3, "2015: DDR4, 4 GHz."),
  cpu("c-7700k", "Chipwright i7-7700K", 2017, "cpu-7700k", "lga1151", "kbl", 21.5, 16384, { ddr4: 2400 }, true, 3, "2017: 4.2 GHz, the last four-core top chip."),
  cpu("c-1800x", "Alder 1800X", 2017, "cpu-1800x", "am4", "zen1", 23, 16384, { ddr4: 2667 }, true, 3, "2017: eight cores, sixteen threads, back in the race."),
  cpu("c-1950x", "Alder 1950X", 2017, "cpu-1950x", "tr4", "zen1-tr", 28, 32768, { ddr4: 2667 }, true, 3, "2017: sixteen cores on a desktop."),
  cpu("c-8700k", "Chipwright i7-8700K", 2017, "cpu-8700k", "lga1151v2", "cfl", 23, 16384, { ddr4: 2666 }, true, 3, "2017: six cores, the first six-core chip of its line."),
  cpu("c-2700x", "Alder 2700X", 2018, "cpu-2700x", "am4", "zen+", 24, 16384, { ddr4: 2933 }, true, 3, "2018: eight cores at 12 nm, clocked higher."),
  cpu("c-2990wx", "Alder 2990WX", 2018, "cpu-2990wx", "tr4", "zen+-tr", 31, 65536, { ddr4: 2933 }, true, 3, "2018: 32 cores on a desktop board."),
  cpu("c-9900k", "Chipwright i9-9900K", 2018, "cpu-9900k", "lga1151v2", "cfl-r", 25, 16384, { ddr4: 2666 }, true, 3, "2018: eight cores, up to 5 GHz."),
  cpu("c-3950x", "Alder 3950X", 2019, "cpu-3950x", "am4", "zen2", 30, 32768, { ddr4: 3200 }, true, 4, "2019: sixteen cores on AM4, made from small chiplets."),
  cpu("c-5950x", "Alder 5950X", 2020, "cpu-5950x", "am4", "zen3", 32, 32768, { ddr4: 3200 }, true, 4, "2020: sixteen cores, eight to each shared cache."),
  cpu("c-12900k", "Chipwright i9-12900K", 2021, "cpu-12900k", "lga1700", "adl", 33, 32768, { ddr4: 3200, ddr5: 4800 }, true, 5, "2021: big and small cores together, DDR4 or DDR5."),
  cpu("c-7950x", "Alder 7950X", 2022, "cpu-7950x", "am5", "zen4", 35, 32768, { ddr5: 5200 }, true, 5, "2022: sixteen cores, up to 5.7 GHz, on AM5."),
  cpu("c-13900k", "Chipwright i9-13900K", 2022, "cpu-13900k", "lga1700", "rpl", 35, 32768, { ddr4: 3200, ddr5: 5600 }, true, 5, "2022: 24 cores, up to 5.8 GHz."),
  cpu("c-14900k", "Chipwright i9-14900K", 2023, "cpu-14900k", "lga1700", "rpl-r", 36, 32768, { ddr4: 3200, ddr5: 5600 }, true, 5, "2023: 24 cores, up to 6 GHz."),
  cpu("c-9950x", "Alder 9950X", 2024, "cpu-9950x", "am5", "zen5", 38, 65536, { ddr5: 5600 }, true, 5, "2024: sixteen cores, wider cores than the 7950X."),
  cpu("c-285k", "Chipwright Ultra 9 285K", 2024, "cpu-285k", "lga1851", "arl", 37, 65536, { ddr5: 6400 }, true, 5, "2024: 24 cores and no second thread on any of them."),
];

export const BENCH_STICKS = [
  stick("m-4116", "16 KB of 4116 chips", 1977, "mem-4116", "dip", 0.016, 0, "1977: eight 16 Kbit chips make one 16 KB bank."),
  stick("m-4164", "64 KB of 4164 chips", 1981, "mem-4164", "dip", 0.064, 0, "1981: 64 Kbit chips, one 64 KB bank."),
  stick("m-41256", "256 KB of 41256 chips", 1984, "mem-41256", "dip", 0.256, 0, "1984: 256 Kbit chips, one 256 KB bank."),
  stick("m-simm1", "1 MB 30-pin SIMM", 1988, "mem-simm", "simm30", 1, 0, "1988: memory chips on a small card, 8 bits wide."),
  stick("m-simm4", "4 MB 30-pin SIMM", 1991, "mem-simm4", "simm30", 4, 0, "1991: the same card with denser chips."),
  stick("m-simm72", "8 MB 72-pin SIMM", 1993, "mem-simm72", "simm72", 8, 0, "1993: 32 bits wide, so a 586 needs them in pairs."),
  stick("m-edo", "16 MB EDO SIMM", 1995, "mem-edo", "simm72", 16, 0, "1995: extended data out, a little faster on each read."),
  stick("m-pc66", "32 MB PC66 DIMM", 1997, "mem-pc66", "sdram", 32, 66, "1997: synchronous memory on a 168-pin DIMM."),
  stick("m-pc100", "64 MB PC100 DIMM", 1998, "mem-pc100", "sdram", 64, 100, "1998: SDRAM for the 100 MHz bus."),
  stick("m-pc133", "128 MB PC133 DIMM", 1999, "mem-pc133", "sdram", 128, 133, "1999: SDRAM at 133 MHz."),
  stick("m-ddr266", "256 MB DDR-266", 2000, "mem-ddr", "ddr", 256, 266, "2000: data on both edges of the clock."),
  stick("m-ddr400", "512 MB DDR-400", 2003, "mem-ddr400", "ddr", 512, 400, "2003: PC3200, DDR's fastest standard speed."),
  stick("m-ddr2-667", "512 MB DDR2-667", 2005, "mem-ddr2-667", "ddr2", 512, 667, "2005: PC2-5300."),
  stick("m-ddr2", "1 GB DDR2-800", 2006, "mem-ddr2-800", "ddr2", 1024, 800, "2006: PC2-6400."),
  stick("m-ddr2-1066", "2 GB DDR2-1066", 2007, "mem-ddr2-1066", "ddr2", 2048, 1066, "2007: PC2-8500."),
  stick("m-ddr3a", "2 GB DDR3-1333", 2008, "mem-ddr3-1333", "ddr3", 2048, 1333, "2008: PC3-10600."),
  stick("m-ddr3b", "8 GB DDR3-1600", 2012, "mem-ddr3-1600", "ddr3", 8192, 1600, "2012: PC3-12800."),
  stick("m-ddr3c", "8 GB DDR3-2133", 2013, "mem-ddr3-2133", "ddr3", 8192, 2133, "2013: a fast kit for overclocking boards."),
  stick("m-ddr4a", "8 GB DDR4-2133", 2014, "mem-ddr4", "ddr4", 8192, 2133, "2014: PC4-17000, the first DDR4 speed."),
  stick("m-ddr4-2666", "8 GB DDR4-2666", 2016, "mem-ddr4-2666", "ddr4", 8192, 2666, "2016: PC4-21300."),
  stick("m-ddr4b", "16 GB DDR4-3200", 2017, "mem-ddr4-3200", "ddr4", 16384, 3200, "2017: PC4-25600."),
  stick("m-ddr4c", "16 GB DDR4-3600", 2019, "mem-ddr4-3600", "ddr4", 16384, 3600, "2019: a fast kit that AM4 chips liked."),
  stick("m-ddr5a", "16 GB DDR5-4800", 2020, "mem-ddr5", "ddr5", 16384, 4800, "2020: two 32-bit channels on each stick."),
  stick("m-ddr5b", "32 GB DDR5-6000", 2022, "mem-ddr5-6000", "ddr5", 32768, 6000, "2022: PC5-48000."),
  stick("m-ddr5c", "32 GB DDR5-7200", 2023, "mem-ddr5-7200", "ddr5", 32768, 7200, "2023: a fast kit for boards that can run it."),
];

// --- Stage 2: power draw, form factors, card buses -------------------------

// CPU power (TDP, or the boost limit for the newest chips), in watts.
const CPU_WATTS = {
  "c-8080": 1, "c-6502": 1, "c-z80": 1, "c-8088": 2, "c-286": 3, "c-386": 3, "c-486": 5, "c-am386": 3, "c-cx486dlc": 3,
  "c-am486": 5, "c-586": 15, "c-nx586": 12, "c-cx5x86": 6, "c-586pro": 35, "c-k5": 15, "c-6x86": 20, "c-586mmx": 17,
  "c-k6": 20, "c-6x86mx": 20, "c-c6": 12, "c-p2": 43, "c-300a": 20, "c-k62": 17, "c-mii": 20, "c-mp6": 20, "c-k7": 50,
  "c-p3": 28, "c-tbird": 54, "c-p4a": 72, "c-xp": 66, "c-p4": 82, "c-p4560": 115, "c-a64": 89, "c-x2": 110, "c-dual": 130, "c-e6600": 65,
  "c-q6600": 105, "c-phenom": 125, "c-q9650": 95, "c-i7920": 130, "c-ph2": 125, "c-i7860": 95, "c-1100t": 125,
  "c-2600k": 95, "c-fx8150": 125, "c-3770k": 77, "c-4770k": 84, "c-4790k": 88, "c-6700k": 91, "c-7700k": 91,
  "c-1800x": 95, "c-1950x": 180, "c-8700k": 95, "c-2700x": 105, "c-2990wx": 250, "c-9900k": 95, "c-3950x": 105,
  "c-5950x": 105, "c-12900k": 241, "c-7950x": 170, "c-13900k": 253, "c-14900k": 253, "c-9950x": 170, "c-285k": 250,
};
// Cores (the real count; 1 for every chip before 2005).
const CORES = {
  "c-x2": 2, "c-dual": 2, "c-e6600": 2, "c-q6600": 4, "c-phenom": 4, "c-q9650": 4, "c-i7920": 4, "c-ph2": 4, "c-i7860": 4,
  "c-1100t": 6, "c-2600k": 4, "c-fx8150": 8, "c-3770k": 4, "c-4770k": 4, "c-4790k": 4, "c-6700k": 4, "c-7700k": 4,
  "c-1800x": 8, "c-1950x": 16, "c-8700k": 6, "c-2700x": 8, "c-2990wx": 32, "c-9900k": 8, "c-3950x": 16, "c-5950x": 16,
  "c-12900k": 16, "c-7950x": 16, "c-13900k": 24, "c-14900k": 24, "c-9950x": 16, "c-285k": 24,
};
// Chipwright chips with graphics on the chip (a weak stand-in for a card).
const ON_CHIP_GRAPHICS = ["c-2600k", "c-3770k", "c-4770k", "c-4790k", "c-6700k", "c-7700k", "c-8700k", "c-9900k", "c-12900k", "c-13900k", "c-14900k", "c-285k", "c-7950x", "c-9950x"];
for (const c of BENCH_CPUS) {
  c.watts = CPU_WATTS[c.id] || 10;
  c.cores = CORES[c.id] || 1;
  c.igpu = ON_CHIP_GRAPHICS.includes(c.id);
  if (["c-8088", "c-286", "c-386", "c-am386"].includes(c.id)) c.noFpu = true;
}

// Board form factor, the slots for add-in cards, and the math-coprocessor
// socket. The 1970s boards and the Inland PC came in their own case with
// their own supply and video (builtin).
const BUILTIN = { "b-altair": 0, "b-orchard2": 0, "b-trs80": 0, "b-5150": 64 };
const MICRO = ["b-a320", "b-h610", "b-b150", "b-h67", "b-h87", "b-a620"];
const ITX = ["b-z170i", "b-b550i", "b-z790i"];
const EATX = ["b-x58c", "b-zenith"];
const AT_FORM = ["b-at", "b-deskpro", "b-vlb", "b-430lx", "b-nxvl", "b-430fx", "b-440fx", "b-430tx", "b-mvp3"];
const FPU = { "b-5150": "8087", "b-at": "287", "b-deskpro": "387" };
for (const b of BENCH_BOARDS) {
  b.builtin = b.id in BUILTIN;
  b.builtinWatts = BUILTIN[b.id] || 0;
  b.form = b.builtin ? "own" : AT_FORM.includes(b.id) ? "at" : MICRO.includes(b.id) ? "matx" : ITX.includes(b.id) ? "itx" : EATX.includes(b.id) ? "eatx" : b.id === "b-915btx" ? "btx" : "atx";
  b.fpu = FPU[b.id] || null;
  const buses = [];
  if (b.gpuSlot === "isa8") buses.push("isa8");
  if (["isa16", "vlb"].includes(b.gpuSlot) || (b.year <= 1999 && ["pci", "agp-3.3"].includes(b.gpuSlot))) buses.push("isa8", "isa16");
  if (b.gpuSlot === "vlb") buses.push("vlb");
  if (["pci", "agp-3.3", "agp-1.5"].includes(b.gpuSlot) || (b.gpuSlot === "pcie" && b.year <= 2013)) buses.push("pci");
  if (b.gpuSlot.startsWith("agp")) buses.push(b.gpuSlot);
  if (b.gpuSlot === "pcie") buses.push("pcie");
  b.buses = buses;
  // Sound on the board: AC'97 from 1999, HD Audio from 2004.
  b.onboardSound = b.builtin ? 0 : b.year >= 2004 ? 0.02 : b.year >= 1999 ? 0.01 : 0;
}

// Board power plugs, as on the real boards: AT boards take the AT supply's
// pair of 6-pin plugs; ATX boards a 20-pin plug, then (from 2004) a 24-pin
// one; Pentium 4-era boards add a 4-pin 12 V CPU plug, later boards an 8-pin
// EPS plug. A 24-pin supply plug (20+4) still fits a 20-pin board, and an
// 8-pin (4+4) one a 4-pin socket, but nothing new fits an AT board.
const CPU4 = ["b-915btx", "b-845", "b-8rda", "b-875p", "b-ic7", "b-nf3", "b-nf4", "b-lanparty", "b-945p", "b-p965", "b-p35", "b-790fx", "b-h67", "b-h87", "b-b150", "b-a320", "b-b360", "b-h610", "b-a620"];
for (const b of BENCH_BOARDS) {
  if (b.builtin) continue;
  b.mainPlug = b.form === "at" ? "at" : b.year >= 2004 ? "atx24" : "atx20";
  b.cpuPlug = b.form === "at" || b.year < 2001 ? null : CPU4.includes(b.id) ? "p4" : b.year >= 2008 ? "eps8" : "p4";
}

const icon2 = icon;
// Graphics card: bus (isa8, isa16, vlb, pci, agp, pcie), AGP keying (3.3,
// 1.5 or universal), PCIe generation, gfx (game number on the CPU's perf
// scale), board power in watts, the power plug it needs, and length in mm.
function card(id, name, year, research, bus, key, pcie, gfx, watts, plug, length, spec) {
  return { ...base, id, kind: "video", name, year, research, bus, agpKey: key, pcie, gfx, watts, plug, length, icon: icon2(id), cost: price(year, 0.35), spec };
}
export const BENCH_CARDS = [
  card("v-cga", "Inland CGA card", 1981, "vid-cga", "isa8", null, 0, 0.6, 5, "none", 300, "1981: four colors at 320 by 200, sixteen in text."),
  card("v-herc", "Herakles Graphics Card", 1982, "vid-herc", "isa8", null, 0, 0.65, 5, "none", 300, "1982: sharp 720 by 348 monochrome, from a maker long gone."),
  card("v-ega", "Inland EGA card", 1984, "vid-ega", "isa8", null, 0, 0.9, 8, "none", 300, "1984: sixteen colors at 640 by 350."),
  card("v-vga", "Inland VGA card", 1987, "vid-vga", "isa16", null, 0, 1.2, 8, "none", 250, "1987: 256 colors at 320 by 200, sixteen at 640 by 480."),
  card("v-et4000", "Tsang ET4000", 1989, "vid-et4000", "isa16", null, 0, 1.8, 8, "none", 200, "1989: one of the fastest ISA cards, from a maker that left the market in 1997."),
  card("v-r4000", "Rasterline 4000", 1990, "gpu-2d", "isa16", null, 0, 2, 8, "none", 200, "1990: 2D SVGA, up to 1024 by 768."),
  card("v-928", "Ess Three 928", 1992, "vid-928", "vlb", null, 0, 2.6, 10, "none", 200, "1992: a fast 2D card for the VESA local bus."),
  card("v-virge", "Ess Three ViRGE", 1995, "vid-virge", "pci", null, 0, 3, 8, "none", 180, "1995: one of the first cards with 3D, slower at it than doing it in software."),
  card("v-verite", "Rendix V1000", 1996, "vid-verite", "pci", null, 0, 3.2, 15, "none", 200, "1996: a programmable 3D chip, from a maker bought out in 1998."),
  card("v-riva128", "Raster 128", 1997, "vid-riva128", "agp", "3.3", 0, 4, 15, "none", 190, "1997: 2D and fast 3D on one chip, on AGP."),
  card("v-ragepro", "Artix Rage Pro", 1997, "vid-ragepro", "agp", "3.3", 0, 3.8, 12, "none", 190, "1997: a card found in many PCs of its day."),
  card("v-tnt", "Raster TNT", 1998, "vid-tnt", "agp", "3.3", 0, 4.6, 15, "none", 200, "1998: two pixels per clock, 16 MB."),
  card("v-voodoo3", "Threefold 3000", 1999, "vid-voodoo3", "agp", "3.3", 0, 5.6, 20, "none", 200, "1999: Threefold's own 2D and 3D card."),
  card("v-gf256", "Raster 256", 1999, "gpu-256", "agp", "universal", 0, 6, 25, "none", 210, "1999: transform and lighting on the card, sold as the first GPU."),
  card("v-radeon", "Artix Radeon DDR", 2000, "vid-radeon", "agp", "universal", 0, 6.4, 25, "none", 210, "2000: 32 MB of DDR."),
  card("v-voodoo5", "Threefold 5500", 2000, "vid-voodoo5", "agp", "universal", 0, 6.2, 60, "molex", 240, "2000: two chips and its own power plug; Threefold's last card."),
  card("v-gf3", "Raster 3", 2001, "gpu-3", "agp", "1.5", 0, 7.5, 35, "none", 210, "2001: programmable shaders."),
  card("v-9700", "Artix 9700 Pro", 2002, "vid-9700", "agp", "1.5", 0, 9, 50, "molex", 220, "2002: DirectX 9 a few months early, with a power plug on the card."),
  card("v-6800", "Raster 6800 Ultra", 2004, "vid-6800", "pcie", null, 1, 10.5, 110, "6pin", 220, "2004: one of the first PCI Express cards."),
  card("v-x1800", "Artix X1800 XT", 2005, "vid-x1800", "pcie", null, 1, 11.5, 115, "6pin", 230, "2005: 512 MB and a 6-pin plug."),
  card("v-8800", "Raster 8800", 2006, "gpu-8800", "pcie", null, 1, 14, 155, "6pin", 270, "2006: unified shaders, two 6-pin plugs."),
  card("v-gtx280", "Raster GTX 280", 2008, "vid-gtx280", "pcie", null, 2, 16, 236, "8pin", 267, "2008: PCI Express 2.0, a 6-pin and an 8-pin plug."),
  card("v-5870", "Artix 5870", 2009, "vid-5870", "pcie", null, 2, 18, 188, "6pin", 280, "2009: the first DirectX 11 card."),
  card("v-gtx480", "Raster GTX 480", 2010, "vid-gtx480", "pcie", null, 2, 19, 250, "8pin", 267, "2010: fast, hot and loud."),
  card("v-7970", "Alder 7970", 2012, "vid-7970", "pcie", null, 3, 21, 250, "8pin", 275, "2012: the first PCI Express 3.0 card."),
  card("v-gtx680", "Raster GTX 680", 2012, "vid-gtx680", "pcie", null, 3, 21, 195, "6pin", 254, "2012: two 6-pin plugs, PCI Express 3.0."),
  card("v-290x", "Alder 290X", 2013, "vid-290x", "pcie", null, 3, 23, 290, "8pin", 275, "2013: 4 GB and a fan you could hear."),
  card("v-gtx980", "Raster GTX 980", 2014, "vid-gtx980", "pcie", null, 3, 24, 165, "6pin", 267, "2014: far more done per watt."),
  card("v-1080", "Raster 1080", 2016, "card-1080", "pcie", null, 3, 27, 180, "8pin", 267, "2016: 8 GB GDDR5X, one 8-pin plug."),
  card("v-vega64", "Alder Vega 64", 2017, "vid-vega64", "pcie", null, 3, 26, 295, "8pin", 280, "2017: stacked HBM2 memory, two 8-pin plugs."),
  card("v-2080", "Raster 2080", 2018, "gpu-2080", "pcie", null, 3, 29, 215, "8pin", 267, "2018: ray-tracing cores."),
  card("v-5700xt", "Alder 5700 XT", 2019, "vid-5700xt", "pcie", null, 4, 28, 225, "8pin", 272, "2019: the first PCI Express 4.0 card."),
  card("v-3080", "Raster 3080", 2020, "vid-3080", "pcie", null, 4, 33, 320, "8pin", 285, "2020: 10 GB GDDR6X, 320 W."),
  card("v-6800xt", "Alder 6800 XT", 2020, "vid-6800xt", "pcie", null, 4, 33, 300, "8pin", 267, "2020: 16 GB and a big on-chip cache."),
  card("v-a770", "Chipwright A770", 2022, "vid-a770", "pcie", null, 4, 28, 225, "8pin", 270, "2022: Chipwright's first desktop card in 24 years."),
  card("v-4090", "Raster 4090", 2022, "card-4090", "pcie", null, 4, 40, 450, "12vhpwr", 304, "2022: 450 W through the new 16-pin plug, 304 mm long."),
  card("v-7900xtx", "Alder 7900 XTX", 2022, "vid-7900xtx", "pcie", null, 4, 37, 355, "8pin", 287, "2022: a chiplet graphics card."),
  card("v-b580", "Chipwright B580", 2024, "vid-b580", "pcie", null, 4, 30, 190, "8pin", 272, "2024: 12 GB on eight PCI Express 4.0 lanes."),
];

// 3D-only add-in cards: they sit in a PCI slot beside a 2D card and pass its
// picture through, so they need a graphics card too.
function accel(id, name, year, research, gfx, spec) {
  return { ...base, id, kind: "accel", name, year, research, bus: "pci", gfx, watts: 15, icon: icon2(id), cost: price(year, 0.3), spec };
}
// 3D-only add-ins were made from 1996 until combined 2D/3D cards took over
// in 1999; once those are researched (retiredBy), makers stop selling them,
// though one already on the bench keeps working.
export const BENCH_ACCELS = [
  accel("a-righteous", "Orchis Righteous 3D", 1996, "gpu-3d", 2.2, "1996: the first Threefold 3D chip on a card, with a relay that clicked as games started."),
  accel("a-monster", "Diamant Monster 3D", 1996, "gpu-3d", 2.2, "1996: the same Threefold chip on a popular board."),
  accel("a-apoc3d", "VideoLogique Apocalypse 3D", 1996, "vid-pcx1", 1.8, "1996: a 3D-only card that sent finished frames to the 2D card over PCI."),
  accel("a-apocalypse", "VideoLogique Apocalypse 3Dx", 1997, "vid-apocalypse", 2.6, "1997: the second, faster chip of the same kind."),
  accel("a-m3d", "Matrix m3D", 1997, "vid-apocalypse", 2.6, "1997: the same 3D-only chip on another maker's board."),
  accel("a-voodoo2", "Diamant Monster 3D II", 1998, "vid-voodoo2", 3.2, "1998: 3D only; two could split the work over a ribbon cable."),
  accel("a-blaster2", "Creatix 3D Blaster V2", 1998, "vid-voodoo2", 3.2, "1998: the same chip set, 12 MB; two could also be linked."),
  accel("a-obsidian", "Quantum Graphics Obsidian2 X-24", 1998, "vid-obsidian", 5.4, "1998: two linked 3D chip sets on one card, from a maker long gone."),
];
const RETIRED_BY = {
  "a-righteous": "vid-voodoo3", "a-monster": "vid-voodoo3", "a-voodoo2": "vid-voodoo3", "a-blaster2": "vid-voodoo3", "a-obsidian": "vid-voodoo3",
  "a-apoc3d": "gpu-256", "a-apocalypse": "gpu-256", "a-m3d": "gpu-256",
};
for (const a of BENCH_ACCELS) a.retiredBy = RETIRED_BY[a.id] || null;

function sound(id, name, year, research, bus, bonus, spec) {
  return { ...base, id, kind: "sound", name, year, research, bus, bonus, watts: 5, icon: icon2(id), cost: price(year, 0.08), spec };
}
export const BENCH_SOUND = [
  sound("s-covox", "Covax Speech Thing", 1986, "snd-covox", "lpt", 0.015, "1986: a resistor ladder on the printer port that played digital sound."),
  sound("s-adlib", "AdLab Music Card", 1987, "snd-adlib", "isa8", 0.02, "1987: FM music on an 8-bit card, from a maker gone by 1992."),
  sound("s-lapc", "Rowland LAPC-I", 1989, "snd-lapc", "isa8", 0.03, "1989: a studio synthesizer's sound on a card, for games that supported it."),
  sound("s-sb", "Creatix Blaster 1.0", 1989, "snd-sb", "isa8", 0.03, "1989: FM music plus digital sound effects."),
  sound("s-dss", "Castle Sound Source", 1990, "snd-dss", "lpt", 0.02, "1990: a little speaker box on the printer port."),
  sound("s-pas", "Media Visia Pro Audio Spectrum", 1991, "snd-pas", "isa16", 0.035, "1991: from a maker that collapsed in 1994."),
  sound("s-sbpro", "Creatix Blaster Pro", 1991, "snd-sbpro", "isa8", 0.035, "1991: stereo, two FM chips."),
  sound("s-sb16", "Creatix Blaster 16", 1992, "snd-sb16", "isa16", 0.04, "1992: 16-bit CD-quality sound."),
  sound("s-gus", "Gravitas UltraSound", 1992, "snd-gus", "isa16", 0.045, "1992: real instrument samples on the card; the company is long gone."),
  sound("s-awe32", "Creatix AWE32", 1994, "snd-awe32", "isa16", 0.05, "1994: 32 voices of sampled instruments."),
  sound("s-soundscape", "Ensonix Soundscape", 1994, "snd-soundscape", "isa16", 0.05, "1994: sampled instruments from a synthesizer maker."),
  sound("s-tropez", "Tortoise Beach Tropez", 1995, "snd-tropez", "isa16", 0.05, "1995: wavetable sound with room for more samples."),
  sound("s-awe64", "Creatix AWE64", 1996, "snd-awe64", "isa16", 0.052, "1996: 64 voices, one of the last ISA sound cards."),
  sound("s-vortex", "Aurora Vortex", 1997, "snd-vortex", "pci", 0.052, "1997: 3D sound on PCI."),
  sound("s-audiopci", "Ensonix AudioPCI", 1997, "snd-audiopci", "pci", 0.05, "1997: a cheap PCI card that sold in huge numbers."),
  sound("s-mx300", "Diamant Monster Sound MX300", 1998, "snd-mx300", "pci", 0.058, "1998: Aurora's second chip on a popular board."),
  sound("s-vortex2", "Aurora Vortex2", 1998, "snd-vortex2", "pci", 0.06, "1998: 3D sound from two speakers; the maker went bankrupt in 2000."),
  sound("s-live", "Creatix Live", 1998, "snd-live", "pci", 0.055, "1998: effects worked out on the card's own chip."),
  sound("s-audigy", "Creatix Audigy", 2001, "snd-audigy", "pci", 0.06, "2001: 24-bit sound and a FireWire port."),
  sound("s-audigy2", "Creatix Audigy 2", 2002, "snd-audigy2", "pci", 0.062, "2002: 24-bit, 96 kHz, 6.1 surround."),
  sound("s-xfi", "Creatix X-Fi", 2005, "snd-xfi", "pci", 0.065, "2005: a sound chip with more transistors than a 586."),
  sound("s-xmeridian", "Auzentek X-Meridian", 2007, "snd-xmeridian", "pci", 0.066, "2007: a card for listeners, from a maker gone by 2011."),
  sound("s-stx", "Astra Xonar Essence STX", 2008, "snd-stx", "pcie", 0.068, "2008: a shielded card with a headphone amplifier."),
  sound("s-z", "Creatix Z", 2012, "snd-z", "pcie", 0.065, "2012: PCI Express, with a red glow."),
  sound("s-zxr", "Creatix ZxR", 2013, "snd-zxr", "pcie", 0.07, "2013: two cards in one, with a daughterboard."),
  sound("s-ae5", "Creatix AE-5", 2018, "snd-ae5", "pcie", 0.07, "2018: a headphone amplifier and lights on the card."),
  sound("s-ae7", "Creatix AE-7", 2019, "snd-ae7", "pcie", 0.07, "2019: a high-end card with an outboard control box."),
];

// Power supplies: form (at or atx), watts, and the plugs graphics cards need.
function psu(id, name, year, research, form, watts, plugs, spec) {
  // Board plugs by era: AT; ATX 20-pin; ATX12V adds a 4-pin CPU plug (2000);
  // 24-pin main plug (2004); 8-pin EPS CPU plug (2008).
  const mainPlug = form === "at" ? "at" : year >= 2004 ? "atx24" : "atx20";
  const cpuPlugs = form === "at" || year < 2000 ? [] : year >= 2008 ? ["p4", "eps8"] : ["p4"];
  return { ...base, id, kind: "psu", name, year, research, form, supply: watts, plugs, mainPlug, cpuPlugs, icon: icon2(id), cost: price(year, 0.1), spec };
}
export const BENCH_PSUS = [
  psu("p-at150", "150 W AT supply", 1984, "pwr-at", "at", 150, ["none", "molex"], "1984: two 6-pin plugs to the board and a big mains switch."),
  psu("p-at230", "230 W AT supply", 1990, "pwr-at230", "at", 230, ["none", "molex"], "1990: enough for a 486 with a few drives."),
  psu("p-atx250", "250 W ATX supply", 1995, "pwr-atx", "atx", 250, ["none", "molex"], "1995: one 20-pin plug, and the PC can switch itself off."),
  psu("p-atx400", "400 W ATX supply", 2002, "pwr-atx400", "atx", 400, ["none", "molex"], "2002: adds the 4-pin 12 V plug Pentium 4-era boards need."),
  psu("p-500", "500 W 80 Plus supply", 2004, "pwr-80", "atx", 500, ["none", "molex", "6pin"], "2004: 80% efficient, with a 6-pin plug for PCI Express cards."),
  psu("p-750", "750 W 80 Plus Gold", 2008, "pwr-gold", "atx", 750, ["none", "molex", "6pin", "8pin"], "2008: 87-90% efficient, a 24-pin and an 8-pin CPU plug, 6- and 8-pin card plugs."),
  psu("p-1000", "1000 W 80 Plus Platinum", 2009, "pwr-plat", "atx", 1000, ["none", "molex", "6pin", "8pin"], "2009: 90-94% efficient."),
  psu("p-sfx450", "Silverstoner 450 W SFX supply", 2013, "pwr-sfx", "sfx", 450, ["none", "molex", "6pin", "8pin"], "2013: a supply a third smaller than ATX, for mini-ITX cases."),
  psu("p-sf750", "Corsar SF750", 2019, "pwr-sf750", "sfx", 750, ["none", "molex", "6pin", "8pin"], "2019: 750 W in the small SFX size, 80 Plus Platinum."),
  psu("p-sf1000", "Corsar SF1000", 2023, "pwr-sf1000", "sfx", 1000, ["none", "molex", "6pin", "8pin", "12vhpwr"], "2023: 1000 W SFX with the 16-pin card plug."),
  psu("p-1200", "1200 W 80 Plus Titanium", 2015, "pwr-titan", "atx", 1200, ["none", "molex", "6pin", "8pin"], "2015: up to 96% efficient."),
  psu("p-atx3", "1000 W ATX 3.0 supply", 2022, "pwr-atx3", "atx", 1000, ["none", "molex", "6pin", "8pin", "12vhpwr"], "2022: the 16-pin plug for 450 W cards, built for their power spikes."),
  psu("p-1600", "1600 W ATX 3.1 supply", 2024, "pwr-atx31", "atx", 1600, ["none", "molex", "6pin", "8pin", "12vhpwr"], "2024: the revised 16-pin plug."),
];

// Cases: which board sizes fit, which supply, the longest graphics card, and
// (for the cooling stage) the radiator sizes it can mount, in mm.
function pcCase(id, name, year, research, boards, form, maxGpu, radiators, spec) {
  return { ...base, id, kind: "case", name, year, research, boards, form, maxGpu, radiators, maxCooler: CASE_COOLER[id] || 160, icon: icon2(id), cost: price(year, 0.05), spec };
}
// The tallest air cooler each case takes, in mm.
const CASE_COOLER = {
  "k-atdesk": 70, "k-attower": 110, "k-babyat": 100, "k-atxmid": 160, "k-matx": 130, "k-pc60": 160, "k-xaser": 165, "k-atxfull": 170,
  "k-stacker": 175, "k-sonata": 160, "k-btx": 150, "k-p180": 165, "k-cosmos": 175, "k-haf932": 190, "k-800d": 180, "k-phantom": 180,
  "k-torture": 999, "k-airflow": 165, "k-r4": 170, "k-900d": 200, "k-itx": 70, "k-h440": 180, "k-m1": 130, "k-defines": 180,
  "k-570x": 170, "k-meshifyc": 172, "k-mesh": 185, "k-o11": 155, "k-o11xl": 167, "k-nr200": 155, "k-lancool": 176, "k-north": 170,
  "k-y60": 160, "k-o11v": 167, "k-northxl": 185,
};
export const BENCH_CASES = [
  pcCase("k-atdesk", "AT desktop case", 1984, "case-atdesk", ["at"], "at", 340, [], "1984: a flat steel box the monitor sat on."),
  pcCase("k-attower", "AT tower case", 1990, "case-attower", ["at"], "at", 340, [], "1990: stood on the floor, with room for more drives."),
  pcCase("k-babyat", "Baby AT mini-tower", 1993, "case-babyat", ["at"], "at", 300, [], "1993: a small beige tower for the smaller Baby AT boards."),
  pcCase("k-atxmid", "ATX mid-tower", 1996, "case-atxmid", ["atx", "matx"], "atx", 280, [], "1996: ports on the board's back panel; drive cages limit card length."),
  pcCase("k-matx", "Micro-ATX case", 1997, "case-matx", ["matx", "itx"], "atx", 250, [], "1997: a small case for small boards."),
  pcCase("k-pc60", "Lyan Lee PC-60", 2000, "case-pc60", ["atx", "matx"], "atx", 300, [], "2000: brushed aluminium, light enough to carry to a LAN party."),
  pcCase("k-xaser", "Thermaltech Xaser III", 2002, "case-xaser", ["atx", "matx"], "atx", 300, [], "2002: a side window, blue lights and a fan controller on the front."),
  pcCase("k-atxfull", "ATX full tower", 2003, "case-atxfull", ["atx", "matx", "eatx"], "atx", 330, [120], "2003: tall, with a 120 mm fan mount at the back."),
  pcCase("k-stacker", "Cooler Mister Stacker", 2004, "case-stacker", ["atx", "matx", "eatx"], "atx", 330, [120], "2004: a full front of 5.25-inch bays to fill with drives and fans."),
  pcCase("k-sonata", "Antek Sonata", 2004, "case-sonata", ["atx", "matx"], "atx", 280, [120], "2004: a quiet glossy-black mid-tower."),
  pcCase("k-btx", "Chipwright BTX tower", 2004, "case-btx", ["btx"], "atx", 300, [], "2004: the layout meant to replace ATX, airflow straight through; almost no one used it."),
  pcCase("k-p180", "Antek P180", 2005, "case-p180", ["atx", "matx"], "atx", 320, [120], "2005: the supply in its own cooled chamber at the bottom."),
  pcCase("k-cosmos", "Cooler Mister Cosmos 1000", 2007, "case-cosmos", ["atx", "matx", "eatx"], "atx", 330, [120], "2007: aluminium rails like handles along the top."),
  pcCase("k-haf932", "Cooler Mister HAF 932", 2008, "case-haf932", ["atx", "matx", "eatx"], "atx", 340, [120, 240, 360], "2008: huge 230 mm fans moving air at low speed."),
  pcCase("k-800d", "Corsar Obsidian 800D", 2009, "case-800d", ["atx", "matx", "eatx"], "atx", 340, [120, 240, 360], "2009: a black brushed tower with hot-swap drive bays."),
  pcCase("k-phantom", "NZXZ Phantom", 2010, "case-phantom", ["atx", "matx", "eatx"], "atx", 340, [120, 240, 280, 360], "2010: a curvy full tower with a fan controller."),
  pcCase("k-torture", "Danger Din Torture Rack", 2010, "case-torture", ["atx", "matx", "eatx", "itx"], "atx", 500, [120, 240, 280, 360, 420], "2010: an open test bench, no case at all, from a maker gone by 2012."),
  pcCase("k-airflow", "Airflow mid-tower", 2012, "case-airflow", ["atx", "matx", "itx"], "atx", 330, [120, 240, 280, 360], "2012: a mesh front and mounts for 360 mm radiators."),
  pcCase("k-r4", "Fractel Define R4", 2012, "case-r4", ["atx", "matx", "itx"], "atx", 295, [120, 240, 280], "2012: sound-damped panels for a quiet room."),
  pcCase("k-900d", "Corsar 900D", 2013, "case-900d", ["atx", "matx", "eatx"], "atx", 450, [120, 240, 280, 360, 420], "2013: a super tower with room for several radiators."),
  pcCase("k-itx", "Mini-ITX case", 2014, "case-itx", ["itx"], "sfx", 300, [120, 240], "2014: a shoebox that still takes a full-length card."),
  pcCase("k-h440", "NZXZ H440", 2014, "case-h440", ["atx", "matx", "itx"], "atx", 406, [120, 240, 280, 360], "2014: no drive bays at all, and a cover over the cables."),
  pcCase("k-m1", "NKase M1", 2014, "case-m1", ["itx"], "sfx", 317, [120, 240], "2014: a 12.6-litre box made by a few enthusiasts with crowd funding."),
  pcCase("k-defines", "Fractel Define S", 2015, "case-defines", ["atx", "matx", "itx"], "atx", 425, [120, 240, 280, 360, 420], "2015: no drive cages, built around a water loop."),
  pcCase("k-570x", "Corsar Crystal 570X", 2016, "case-570x", ["atx", "matx", "itx"], "atx", 370, [120, 240, 280, 360], "2016: tempered glass on all four sides."),
  pcCase("k-meshifyc", "Fractel Meshify C", 2017, "case-meshifyc", ["atx", "matx", "itx"], "atx", 315, [120, 240, 280, 360], "2017: a faceted mesh front for airflow."),
  pcCase("k-mesh", "Mesh full tower", 2018, "case-mesh", ["atx", "matx", "eatx", "itx"], "atx", 400, [120, 240, 280, 360, 420], "2018: room for 420 mm radiators and the longest cards."),
  pcCase("k-o11", "Lyan Lee O11 Dynamic", 2018, "case-o11", ["atx", "matx", "eatx", "itx"], "atx", 420, [120, 240, 280, 360], "2018: two glass sides and the supply hidden in a second chamber."),
  pcCase("k-o11xl", "Lyan Lee O11 Dynamic XL", 2019, "case-o11xl", ["atx", "matx", "eatx", "itx"], "atx", 446, [120, 240, 280, 360, 420], "2019: the same idea, bigger, for E-ATX boards."),
  pcCase("k-nr200", "Cooler Mister NR200", 2020, "case-nr200", ["itx"], "sfx", 330, [120, 240, 280], "2020: a cheap small case that still fits big coolers."),
  pcCase("k-lancool", "Lyan Lee Lancool II Mesh", 2020, "case-lancool", ["atx", "matx", "eatx", "itx"], "atx", 384, [120, 240, 280, 360], "2020: a mesh front and fans included."),
  pcCase("k-north", "Fractel North", 2022, "case-north", ["atx", "matx", "itx"], "atx", 355, [120, 240, 280, 360], "2022: a wooden front panel, like furniture."),
  pcCase("k-y60", "Hite Y60", 2022, "case-y60", ["atx", "matx", "itx"], "atx", 375, [120, 240, 280, 360], "2022: a glass corner showing the card standing upright."),
  pcCase("k-o11v", "Lyan Lee O11 Vision", 2023, "case-o11v", ["atx", "matx", "itx"], "atx", 455, [120, 240, 280, 360], "2023: glass on three sides with no corner posts."),
  pcCase("k-northxl", "Fractel North XL", 2024, "case-northxl", ["atx", "matx", "eatx", "itx"], "atx", 413, [120, 240, 280, 360, 420], "2024: the wooden-front case, bigger."),
];
// How well each case moves air: it scales what the cooler can handle.
const CASE_AIRFLOW = {
  "k-atdesk": 0.85, "k-attower": 0.9, "k-babyat": 0.85, "k-atxmid": 0.9, "k-matx": 0.85, "k-pc60": 0.95, "k-xaser": 0.95,
  "k-atxfull": 1, "k-stacker": 1.05, "k-sonata": 0.95, "k-btx": 1.1, "k-p180": 1, "k-cosmos": 1, "k-haf932": 1.15, "k-800d": 1.05,
  "k-phantom": 1.05, "k-torture": 1.2, "k-airflow": 1.1, "k-r4": 0.95, "k-900d": 1.1, "k-itx": 0.85, "k-h440": 1, "k-m1": 0.95,
  "k-defines": 1.05, "k-570x": 0.95, "k-meshifyc": 1.12, "k-mesh": 1.15, "k-o11": 1.05, "k-o11xl": 1.08, "k-nr200": 1,
  "k-lancool": 1.12, "k-north": 1.08, "k-y60": 1.0, "k-o11v": 1.05, "k-northxl": 1.1,
};
for (const k of BENCH_CASES) {
  k.airflow = CASE_AIRFLOW[k.id] || 1;
  k.open = k.id === "k-torture";
}

// Math coprocessors for boards with their socket; they speed up a CPU that
// has no floating point of its own.
function fpu(id, name, year, research, socket, spec) {
  return { ...base, id, kind: "fpu", name, year, research, fpu: socket, watts: 2, icon: icon2(id), cost: price(year, 0.2), spec };
}
export const BENCH_FPUS = [
  fpu("f-8087", "Chipwright 8087", 1980, "fpu-8087", "8087", "1980: floating-point math for the 8088 and 8086, about 50 kFLOPS."),
  fpu("f-287", "Chipwright 287", 1984, "fpu-287", "287", "1984: the math partner for the 286."),
  fpu("f-387", "Chipwright 387", 1987, "fpu-387", "387", "1987: the math partner for the 386."),
  fpu("f-fasmath", "Cyrus FasMath 83D87", 1989, "fpu-fasmath", "387", "1989: a faster 387 from Cyrus's first product line."),
];

// --- Stage 3: drives, removable media, network, modems --------------------

// Drives: interface (mfm, ide, sata, nvme), the link it speaks (IDE mode in
// MB/s, SATA generation 1-3, NVMe PCIe generation), its own top speed (MB/s)
// and size (GB). A drive runs at the slowest of itself and the board's port.
function drive(id, name, year, research, iface, link, mbs, gb, spec) {
  return { ...base, id, kind: "drive", name, year, research, iface, link, mbs, gb, bus: iface === "pcie" ? "pcie" : null, watts: 8, icon: icon2(id), cost: price(year, 0.12), spec };
}
export const BENCH_DRIVES = [
  drive("d-st506", "Seabird ST-506", 1980, "drv-st506", "mfm", 0, 0.6, 0.005, "1980: the first 5.25-inch hard disk, 5 MB."),
  drive("d-st225", "Seabird ST-225", 1984, "drv-st225", "mfm", 0, 0.6, 0.02, "1984: 20 MB, the common PC drive of the 1980s."),
  drive("d-ro352", "Rodima RO352", 1983, "drv-ro352", "mfm", 0, 0.6, 0.01, "1983: the first 3.5-inch hard disk, 10 MB, from a maker gone by 1991."),
  drive("d-cp3044", "Connor CP-3044", 1989, "drv-cp3044", "ide", 16, 1.5, 0.04, "1989: a 40 MB 3.5-inch IDE drive from a maker that merged away in 1996."),
  drive("d-lps540", "Quanta ProDrive LPS 540", 1994, "drv-lps540", "ide", 16, 5, 0.54, "1994: 540 MB, from a drive maker sold off in 2001."),
  drive("d-caviar", "Western Data Caviar 21600", 1996, "drv-caviar", "ide", 16, 8, 1.6, "1996: 1.6 GB on IDE."),
  drive("d-16gp", "Inland Deskstar 16GP", 1997, "drv-16gp", "ide", 33, 12, 16.8, "1997: 16.8 GB on ATA-33."),
  drive("d-fireball", "Quanta Fireball Plus KA", 1999, "drv-fireball", "ide", 66, 22, 13.6, "1999: 13.6 GB on ATA-66."),
  drive("d-75gxp", "Inland Deskstar 75GXP", 2000, "drv-75gxp", "ide", 100, 37, 75, "2000: 75 GB on ATA-100, remembered for failing."),
  drive("d-mpg", "Fujitsa MPG3409AT", 2000, "drv-mpg", "ide", 100, 30, 40.9, "2000: 40 GB on ATA-100, from a maker that left hard disks in 2009."),
  drive("d-dm9", "Maxtel DiamondMax Plus 9", 2003, "drv-dm9", "ide", 133, 55, 200, "2003: 200 GB on ATA-133, from a maker bought in 2006."),
  drive("d-raptor", "Western Data Raptor", 2003, "drv-raptor", "sata", 1, 72, 36, "2003: 10,000 rpm on the first SATA, 1.5 Gbit/s."),
  drive("d-7k1000", "Hikari Deskstar 7K1000", 2007, "drv-7k1000", "sata", 2, 85, 1000, "2007: the first 1 TB drive, SATA at 3 Gbit/s."),
  drive("d-spinpoint", "Sunsung SpinPoint F1", 2008, "drv-spinpoint", "sata", 2, 110, 1000, "2008: 1 TB on three platters; the maker sold its disk business in 2011."),
  drive("d-vraptor", "Western Data VelociRaptor", 2008, "drv-vraptor", "sata", 2, 120, 300, "2008: a 2.5-inch 10,000 rpm drive in a heatsink frame."),
  drive("d-3tb", "Seabird Barracuda XT 3TB", 2010, "drv-3tb", "sata", 3, 150, 3000, "2010: 3 TB on SATA at 6 Gbit/s."),
  drive("d-10tb", "Seabird 10TB", 2016, "drv-10tb", "sata", 3, 250, 10000, "2016: helium-filled, 10 TB."),
  drive("d-18tb", "Seabird Exos 18TB", 2020, "drv-18tb", "sata", 3, 270, 18000, "2020: 18 TB."),
  drive("d-24tb", "Seabird 24TB", 2023, "drv-24tb", "sata", 3, 285, 24000, "2023: 24 TB of spinning disk."),
  drive("d-x25m", "Chipwright X25-M", 2008, "ssd-x25m", "sata", 2, 250, 80, "2008: an 80 GB SSD that made spinning disks feel slow."),
  drive("d-vertex", "OXZ Vertex", 2009, "ssd-vertex", "sata", 2, 230, 120, "2009: an early SSD from a maker that went bankrupt in 2016."),
  drive("d-840pro", "Sunsung 840 Pro", 2012, "ssd-840pro", "sata", 3, 540, 256, "2012: as fast as 6 Gbit/s SATA allows."),
  drive("d-850evo", "Sunsung 850 Evo", 2014, "ssd-850evo", "sata", 3, 540, 500, "2014: stacked 3D flash on SATA."),
  drive("d-950pro", "Sunsung 950 Pro", 2015, "ssd-950pro", "nvme", 3, 2500, 512, "2015: an M.2 NVMe drive on four PCIe 3.0 lanes."),
  drive("d-900p", "Chipwright Optane 900P", 2017, "ssd-900p", "pcie", 3, 2500, 280, "2017: not flash but a new memory, on a PCIe card; the line ended in 2022."),
  drive("d-mx500", "Critical MX500", 2018, "ssd-mx500", "sata", 3, 560, 1000, "2018: a cheap, popular SATA SSD."),
  drive("d-mp600", "Corsar MP600", 2019, "ssd-mp600", "nvme", 4, 4950, 1000, "2019: one of the first PCIe 4.0 drives, out with the X570 boards."),
  drive("d-970evo", "Sunsung 970 Evo Plus", 2019, "ssd-970evo", "nvme", 3, 3500, 1000, "2019: 3.5 GB/s, the PCIe 3.0 limit."),
  drive("d-980pro", "Sunsung 980 Pro", 2020, "ssd-980pro", "nvme", 4, 7000, 1000, "2020: PCIe 4.0, 7 GB/s."),
  drive("d-sn850", "Western Data Black SN850", 2020, "ssd-sn850", "nvme", 4, 7000, 1000, "2020: PCIe 4.0, 7 GB/s."),
  drive("d-990pro", "Sunsung 990 Pro", 2022, "ssd-990pro", "nvme", 4, 7450, 2000, "2022: 7.45 GB/s."),
  drive("d-t700", "Critical T700", 2023, "ssd-t700", "nvme", 5, 12400, 2000, "2023: PCIe 5.0, 12.4 GB/s, with a big heatsink."),
];

// Floppy, optical and cartridge drives: how they connect, and a small bonus.
function media(id, name, year, research, iface, bonus, spec) {
  return { ...base, id, kind: "media", name, year, research, iface, bonus, watts: 5, icon: icon2(id), cost: price(year, 0.05), spec };
}
export const BENCH_MEDIA = [
  media("r-8inch", "Inland 8-inch floppy drive", 1971, "store-floppy", "floppy", 0.015, "1971: about 80 KB on a floppy disk eight inches across."),
  media("r-sa400", "Sugart SA-400", 1976, "med-sa400", "floppy", 0.018, "1976: the first 5.25-inch floppy drive, from a maker long gone."),
  media("r-disk2", "Orchard Disk II", 1978, "med-disk2", "floppy", 0.02, "1978: a 5.25-inch floppy drive, 140 KB a disk."),
  media("r-360k", "5.25-inch 360 KB drive", 1982, "med-360k", "floppy", 0.02, "1982: double-sided disks for the Inland PC."),
  media("r-144", "3.5-inch 1.44 MB drive", 1987, "med-144", "floppy", 0.025, "1987: a disk in a hard shell with a metal shutter."),
  media("r-cd2x", "Creatix CD-ROM 2x", 1993, "med-cd2x", "isa", 0.03, "1993: 650 MB discs, wired to a sound card."),
  media("r-zip", "Ioma Zip 100", 1995, "med-zip", "ide", 0.03, "1995: 100 MB cartridges, from a maker long gone."),
  media("r-ez135", "SyQuist EZ135", 1995, "med-ez135", "lpt", 0.028, "1995: 135 MB cartridges on the printer port, from a maker bankrupt in 1998."),
  media("r-jaz", "Ioma Jaz", 1996, "med-jaz", "ide", 0.035, "1996: 1 GB removable hard-disk cartridges."),
  media("r-ls120", "Imagin LS-120", 1997, "med-ls120", "ide", 0.03, "1997: 120 MB disks that also read 1.44 MB floppies."),
  media("r-dvd", "DVD-ROM drive", 1997, "med-dvd", "ide", 0.035, "1997: 4.7 GB discs."),
  media("r-cdrw", "CD-RW drive", 1998, "med-cdrw", "ide", 0.035, "1998: discs you could write, wipe and write again."),
  media("r-cd52", "52x CD-ROM drive", 2000, "med-cd52", "ide", 0.035, "2000: about as fast as a spinning disc can go."),
  media("r-dvdrw", "DVD-RW drive", 2003, "med-dvdrw", "ide", 0.038, "2003: writes 4.7 GB discs in both rival formats."),
  media("r-hddvd", "HD DVD drive", 2006, "med-hddvd", "sata", 0.038, "2006: the high-definition disc that lost to Blu-ray in 2008."),
  media("r-bd", "Blu-ray drive", 2006, "med-bd", "sata", 0.04, "2006: 25 GB a layer, read by a blue-violet laser."),
];

// Network cards plug into a bus; modems sit on the serial port.
function net(id, name, year, research, bus, bonus, spec) {
  return { ...base, id, kind: "net", name, year, research, bus, bonus, watts: 5, icon: icon2(id), cost: price(year, 0.06), spec };
}
function modem(id, name, year, research, bonus, spec) {
  return { ...base, id, kind: "modem", name, year, research, bonus, watts: 3, icon: icon2(id), cost: price(year, 0.04), spec };
}
export const BENCH_NET = [
  net("n-3c501", "TriCom EtherLink", 1982, "net-3c501", "isa8", 0.02, "1982: Ethernet on an 8-bit card, from a maker gone since 2010."),
  net("n-tokenring", "Inland Token Ring card", 1985, "net-tokenring", "isa8", 0.02, "1985: a network that passed a token from machine to machine; Ethernet won."),
  net("n-3c509", "TriCom EtherLink III", 1994, "net-3c509", "isa16", 0.03, "1994: the ISA network card nearly every office had."),
  net("n-3c595", "TriCom Fast EtherLink", 1995, "net-100", "pci", 0.04, "1995: 100 Mbit/s on PCI."),
  net("n-pro1000", "Chipwright PRO/1000", 1999, "net-gige", "pci", 0.045, "1999: gigabit Ethernet on PCI."),
  net("n-orinoco", "Lucid Orinoco", 1999, "net-orinoco", "pci", 0.04, "1999: 11 Mbit/s Wi-Fi, from a maker gone by 2006."),
  net("n-wmp54g", "Linksis WMP54G", 2003, "net-wmp54g", "pci", 0.045, "2003: 54 Mbit/s Wi-Fi in a PCI slot."),
  net("n-killer", "Bigfeet Killer NIC", 2006, "net-killer", "pci", 0.045, "2006: a network card with its own processor, for gamers."),
  net("n-7260", "Chipwright 7260 Wi-Fi", 2013, "net-ac", "pcie", 0.05, "2013: Wi-Fi 5, 867 Mbit/s."),
  net("n-aqc107", "Aquanta AQC107", 2017, "net-aqc107", "pcie", 0.06, "2017: 10 Gbit/s Ethernet, from a chip maker bought in 2019."),
  net("n-ax200", "Chipwright AX200", 2019, "net-ax", "pcie", 0.06, "2019: Wi-Fi 6."),
  net("n-be200", "Chipwright BE200", 2024, "net-be", "pcie", 0.065, "2024: Wi-Fi 7."),
];
export const BENCH_MODEMS = [
  modem("o-300", "Hays Smartmodem 300", 1981, "mod-300", 0.01, "1981: 300 bit/s; programs could dial it, from a maker gone by 1999."),
  modem("o-1200", "Hays Smartmodem 1200", 1982, "mod-1200", 0.012, "1982: 1,200 bit/s."),
  modem("o-2400", "Hays Smartmodem 2400", 1985, "mod-2400", 0.015, "1985: 2,400 bit/s."),
  modem("o-14k", "US Robots Sportster 14,400", 1991, "mod-14k", 0.02, "1991: V.32bis, 14,400 bit/s."),
  modem("o-28k", "US Robots Sportster 28,800", 1994, "mod-28k", 0.025, "1994: V.34, 28,800 bit/s."),
  modem("o-56k", "US Robots 56K", 1998, "mod-56k", 0.03, "1998: V.90, the fastest a phone line carries."),
];

// --- Stage 4: coolers -------------------------------------------------------

// Air coolers and AIOs: the sockets their mounting kits fit, how much heat
// they move (cap, watts), and their height or radiator size, which the case
// has to take. CPUs up to the 386 needed no cooler.
function cooler(id, name, year, research, sockets, cap, height, spec) {
  return { ...base, id, kind: "cooler", name, year, research, sockets, cap, height, watts: 3, icon: icon2(id), cost: price(year, 0.06), spec };
}
function aio(id, name, year, research, sockets, cap, radiator, spec) {
  return { ...base, id, kind: "cooler", aio: true, name, year, research, sockets, cap, radiator, height: 30, watts: 8, icon: icon2(id), cost: price(year, 0.1), spec };
}
const LGA_OLD = ["lga775", "lga1366", "lga1156", "lga1155", "lga1150"];
const LGA_NEW = ["lga1151", "lga1151v2", "lga1700", "lga1851"];
export const BENCH_COOLERS = [
  cooler("h-clip", "Clip-on heatsink", 1989, "cool-clip", ["386", "486"], 10, 20, "1989: an aluminium block clipped to the chip, no fan."),
  cooler("h-586fan", "586 heatsink and fan", 1993, "cool-586fan", ["486", "socket4", "nx586", "socket7", "socket8"], 35, 40, "1993: a small fan on a heatsink, which the 586 needed."),
  cooler("h-slot", "Slot cartridge cooler", 1997, "cool-slot", ["slot1", "slota"], 60, 40, "1997: a heatsink and fans bolted to the CPU cartridge."),
  cooler("h-orb", "Thermaltech Golden Orb", 1999, "cool-orb", ["socket7", "socketa"], 70, 45, "1999: a round gold heatsink with a fan sunk in the middle."),
  cooler("h-pal8045", "Alpha Novatek PAL8045", 2000, "cool-pal8045", ["socketa", "s478"], 95, 60, "2000: a tall copper-based heatsink for Socket A, from a maker long gone."),
  cooler("h-cnps7000", "Zalmon CNPS7000", 2003, "cool-cnps7000", ["socketa", "s478", "s939", "lga775"], 115, 105, "2003: a copper flower of fins, from a maker that went bankrupt in 2014."),
  cooler("h-ninja", "Scythie Ninja", 2005, "cool-ninja", ["s939", "lga775", "am2"], 130, 155, "2005: a heatpipe tower quiet enough to run with no fan."),
  cooler("h-212", "Cooler Mister Hyper 212", 2008, "cool-212", ["lga775", "lga1366", "lga1156", "am2", "am3"], 150, 160, "2008: a cheap heatpipe tower that sold for over a decade."),
  cooler("h-d14", "Noctuo NH-D14", 2009, "cool-d14", [...LGA_OLD, "am2", "am3", "lga1151", "lga1151v2", "am4"], 190, 160, "2009: two towers and two fans; new mounting kits kept it going."),
  cooler("h-d15", "Noctuo NH-D15", 2014, "cool-d15", ["lga1155", "lga1150", "lga1366", ...LGA_NEW, "am3", "am4", "am5"], 220, 165, "2014: the big twin tower many water coolers couldn't beat."),
  cooler("h-tr4", "Noctuo NH-U14S TR4-SP3", 2017, "cool-tr4", ["tr4"], 250, 165, "2017: a cold plate as big as the Threadripper chip."),
  cooler("h-wraith", "Alder Wraith Prism", 2018, "cool-wraith", ["am4", "am5"], 105, 90, "2018: the boxed cooler that came with the 2700X, with a lit ring."),
  cooler("h-drp4", "Be Calm Dark Rock Pro 4", 2018, "cool-drp4", ["lga1150", "lga1151", "lga1151v2", "lga1700", "am4", "am5"], 240, 163, "2018: a black twin tower built to be quiet."),
  cooler("h-pa120", "Thermalwrite Peerless Assassin 120", 2021, "cool-pa120", ["lga1151v2", "lga1700", "lga1851", "am4", "am5"], 245, 155, "2021: a cheap twin tower that cooled like the dear ones."),
  cooler("h-d15g2", "Noctuo NH-D15 G2", 2024, "cool-d15g2", ["lga1700", "lga1851", "am4", "am5"], 260, 168, "2024: the twin tower redone for hotter chips."),
  aio("a-h50", "Corsar H50", 2009, "cool-h50", ["lga775", "lga1366", "lga1156", "lga1155", "am2", "am3"], 150, 120, "2009: a sealed water loop with a 120 mm radiator, nothing to fill."),
  aio("a-h100", "Corsar H100", 2011, "cool-h100", ["lga775", "lga1366", "lga1156", "lga1155", "lga1150", "am3"], 220, 240, "2011: a 240 mm radiator."),
  aio("a-x61", "NZXZ Kraken X61", 2014, "cool-x61", ["lga1150", "lga1155", "lga1151", "lga1366", "am3"], 250, 280, "2014: a 280 mm radiator."),
  aio("a-h150", "Corsar H150i Pro", 2018, "cool-h150", ["lga1150", "lga1151", "lga1151v2", "am4", "tr4"], 300, 360, "2018: a 360 mm radiator."),
  aio("a-lf420", "Arktik Liquid Freezer II 420", 2019, "cool-lf420", ["lga1151", "lga1151v2", "lga1700", "am4", "am5", "tr4"], 350, 420, "2019: a 420 mm radiator with a fan on the pump for the board."),
  aio("a-x73", "NZXZ Kraken X73", 2019, "cool-x73", ["lga1151v2", "lga1700", "am4", "am5", "tr4"], 300, 360, "2019: a 360 mm radiator."),
  aio("a-lf3", "Arktik Liquid Freezer III 360", 2024, "cool-lf3", ["lga1700", "lga1851", "am4", "am5"], 330, 360, "2024: a 360 mm radiator with a contact frame for LGA1700."),
];

// --- Stage 5: odd expansion cards --------------------------------------------
// Cards for one job each: a TV tuner, a RAID controller, a physics chip, a
// game capture card. Two fit in the spare slots; each adds a little.
function addin(id, name, year, research, bus, bonus, job, spec) {
  return { ...base, id, kind: "addin", name, year, research, bus, bonus, job, watts: 10, icon: icon2(id), cost: price(year, 0.06), spec };
}
export const BENCH_ADDINS = [
  addin("x-wintv", "Happaug WinTV", 1993, "add-wintv", "isa16", 0.005, "tv", "1993: TV in a window on the desktop, from an analog tuner."),
  addin("x-wintvpci", "Happaug WinTV PCI", 1997, "add-wintvpci", "pci", 0.006, "tv", "1997: the TV card moved to PCI and could record to disk."),
  addin("x-fasttrak", "Promys FastTrak66", 1999, "add-fasttrak", "pci", 0.01, "raid", "1999: two IDE disks as one, striped for speed or mirrored for safety."),
  addin("x-physx", "Agea PhysX P1", 2006, "add-physx", "pci", 0.015, "physics", "2006: a chip just for game physics; Raster bought the maker in 2008 and moved it onto graphics cards."),
  addin("x-raid5805", "Adapto RAID 5805", 2008, "add-raid5805", "pcie", 0.012, "raid", "2008: eight SATA disks on one card, with its own cache memory."),
  addin("x-wintvhd", "Happaug WinTV-HVR-2250", 2009, "add-wintvhd", "pcie", 0.006, "tv", "2009: two digital TV tuners after the analog shutoff."),
  addin("x-hd60", "Elgatto HD60 Pro", 2015, "add-hd60", "pcie", 0.008, "capture", "2015: records and streams a console's 1080p picture."),
  addin("x-4k60", "Elgatto 4K60 Pro", 2018, "add-4k60", "pcie", 0.01, "capture", "2018: captures 4K at 60 frames a second."),
];
// The PhysX chip went out of production when its maker's buyer put it on
// graphics cards.
BENCH_ADDINS.find((x) => x.id === "x-physx").retiredBy = "vid-gtx280";

// --- Stage 5: monitors ----------------------------------------------------
// A monitor shows only so much: past its resolution and refresh rate, a
// faster card is wasted (cap, on the graphics scale). It needs a port in
// common with the card: digital TTL (MDA, CGA, EGA), analog VGA, DVI, HDMI
// or DisplayPort.
function monitor(id, name, year, research, ports, cap, spec) {
  return { ...base, id, kind: "monitor", name, year, research, ports, cap, icon: icon2(id), cost: price(year, 0.12), spec };
}
export const BENCH_MONITORS = [
  monitor("y-5151", "Inland 5151 display", 1981, "mon-5151", ["ttl"], 0.7, "1981: green text on black, 80 columns, no graphics with the plain card."),
  monitor("y-5153", "Inland 5153 color display", 1983, "mon-5153", ["ttl"], 0.8, "1983: sixteen colors for CGA."),
  monitor("y-5154", "Inland 5154 enhanced display", 1984, "mon-5154", ["ttl"], 1.1, "1984: 640 by 350 for EGA."),
  monitor("y-8513", "Inland 8513 color display", 1987, "mon-8513", ["vga"], 1.6, "1987: the first VGA monitor, analog, 640 by 480."),
  monitor("y-ms3d", "NEZ MultiSync 3D", 1989, "mon-ms3d", ["vga"], 2.8, "1989: locks onto any refresh rate, up to 1024 by 768."),
  monitor("y-17sf", "Sunrise Multiscan 17sf", 1995, "mon-17sf", ["vga"], 4.4, "1995: a 17-inch Trinitron tube, flat from top to bottom."),
  monitor("y-fw900", "Sunrise GDM-FW900", 2000, "mon-fw900", ["vga"], 8, "2000: a 24-inch widescreen tube weighing 42 kg, still sought after."),
  monitor("y-2001fp", "Dellwood 2001FP", 2003, "mon-2001fp", ["vga", "dvi"], 10, "2003: a 20-inch flat panel at 1600 by 1200."),
  monitor("y-3007", "Dellwood 3007WFP", 2006, "mon-3007", ["dvi"], 17, "2006: 30 inches at 2560 by 1600, over a dual-link DVI cable only."),
  monitor("y-vg236h", "Abacus VG236H", 2010, "mon-vg236h", ["dvi", "hdmi"], 20, "2010: 120 Hz, sold with 3D glasses."),
  monitor("y-pg278q", "Abacus ROG Swift PG278Q", 2014, "mon-pg278q", ["dp"], 26, "2014: 1440p at 144 Hz with G-Sync, DisplayPort only."),
  monitor("y-p2715q", "Dellwood P2715Q", 2015, "mon-p2715q", ["hdmi", "dp"], 28, "2015: a cheap 27-inch 4K screen at 60 Hz."),
  monitor("y-pg27uq", "Abacus ROG Swift PG27UQ", 2018, "mon-pg27uq", ["hdmi", "dp"], 34, "2018: 4K at 144 Hz with HDR, and a fan inside."),
  monitor("y-aw3423", "Alienwhere AW3423DW", 2022, "mon-aw3423", ["hdmi", "dp"], 42, "2022: a curved quantum-dot OLED at 175 Hz."),
  monitor("y-pg32", "Abacus ROG Swift PG32UCDM", 2024, "mon-pg32", ["hdmi", "dp"], 48, "2024: 4K OLED at 240 Hz."),
];
// The ports on each card, as on the real ones: TTL until VGA (1987); VGA
// until the 2016 cards dropped it; DVI from 2000 to 2016; HDMI from 2009;
// DisplayPort from the 2009 Radeon (most cards from 2012).
for (const card of BENCH_CARDS) {
  const y = card.year;
  const ports = [];
  if (y < 1987) ports.push("ttl");
  if (y >= 1987 && y <= 2015) ports.push("vga");
  if (y >= 2000 && y <= 2016) ports.push("dvi");
  if (y >= 2009) ports.push("hdmi");
  if (y >= 2012 || card.id === "v-5870") ports.push("dp");
  card.ports = ports;
}
// Boards with graphics on the CPU: VGA, DVI and HDMI to 2016, then HDMI and
// DisplayPort.
for (const b of BENCH_BOARDS) b.ports = b.year >= 2017 ? ["hdmi", "dp"] : b.year >= 2011 ? ["vga", "dvi", "hdmi"] : [];

// Formats and networks that lost: out of production once the winner is
// researched. BTX boards and cases stopped around 2008.
const LOST_TO = { "r-hddvd": "med-bd", "n-tokenring": "net-100", "b-915btx": "case-haf932", "k-btx": "case-haf932" };

export const BENCH_PARTS = [...BENCH_BOARDS, ...BENCH_CPUS, ...BENCH_STICKS, ...BENCH_CARDS, ...BENCH_MONITORS, ...BENCH_ACCELS, ...BENCH_ADDINS, ...BENCH_SOUND, ...BENCH_PSUS, ...BENCH_CASES, ...BENCH_FPUS, ...BENCH_DRIVES, ...BENCH_MEDIA, ...BENCH_NET, ...BENCH_MODEMS, ...BENCH_COOLERS];
for (const part of BENCH_PARTS) if (LOST_TO[part.id]) part.retiredBy = LOST_TO[part.id];

// R&D a second for each point of CPU perf at full memory. Tuned in the
// simulation so the bench adds about a tenth of what the research servers make.
export const BENCH_RD = 0.03;
