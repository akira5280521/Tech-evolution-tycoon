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

const price = (year, share) => {
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
  board("b-945p", "Chipwright 945P board", 2005, "lga775", ["pd"], "ddr2", 4, 667, [], "pcie", 1, "2005: LGA775 and DDR2 for the first dual cores."),
  board("b-p965", "Chipwright P965 board", 2006, "lga775", ["pd", "c2"], "ddr2", 4, 800, ["oc"], "pcie", 1, "2006: DDR2-800 and support for the new two-core chips."),
  board("b-p35", "Chipwright P35 board", 2007, "lga775", ["c2", "c2-45"], "ddr2", 4, 1066, ["oc"], "pcie", 1, "2007: the 45 nm chips, but no more NetBurst ones."),
  board("b-790fx", "Alder 790FX board", 2007, "am2", ["phenom", "ph2", "ph2-am3"], "ddr2", 4, 1066, ["oc"], "pcie", 2, "2007: AM2+, DDR2 and PCI Express 2.0."),
  board("b-x48", "Chipwright X48 board", 2008, "lga775", ["c2", "c2-45"], "ddr3", 4, 1600, ["oc"], "pcie", 2, "2008: LGA775 with DDR3 and PCI Express 2.0."),
  board("b-x58", "Chipwright X58 board", 2008, "lga1366", ["nehalem"], "ddr3", 6, 2000, ["oc"], "pcie", 2, "2008: LGA1366 and triple-channel DDR3 in six slots."),
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
  board("b-b150", "Chipwright B150 board", 2015, "lga1151", ["skl", "kbl"], "ddr4", 4, 2133, ["lock"], "pcie", 3, "2015: a budget board: no overclocking, memory held at 2133."),
  board("b-z270", "Chipwright Z270 board", 2017, "lga1151", ["skl", "kbl"], "ddr4", 4, 4000, ["oc"], "pcie", 3, "2017: more lanes for the 7000-series chips."),
  board("b-a320", "Alder A320 board", 2017, "am4", AM4, "ddr4", 2, 2667, ["lock"], "pcie", 3, "2017: the cheapest AM4 board, no overclocking."),
  board("b-b350", "Alder B350 board", 2017, "am4", AM4, "ddr4", 4, 3200, ["oc"], "pcie", 3, "2017: AM4 with overclocking at a mid price."),
  board("b-x370", "Alder X370 board", 2017, "am4", AM4, "ddr4", 4, 3200, ["oc"], "pcie", 3, "2017: AM4's first top board; later chips came by BIOS update."),
  board("b-x399", "Alder X399 board", 2017, "tr4", ["zen1-tr", "zen+-tr"], "ddr4", 8, 3600, ["oc"], "pcie", 3, "2017: the 4,094-pin TR4 socket and eight DDR4 slots."),
  board("b-z370", "Chipwright Z370 board", 2017, "lga1151v2", ["cfl", "cfl-r"], "ddr4", 4, 4000, ["oc"], "pcie", 3, "2017: the same socket shape as Z170, but only 8000-series chips and later."),
  board("b-b360", "Chipwright B360 board", 2018, "lga1151v2", ["cfl", "cfl-r"], "ddr4", 4, 2666, ["lock"], "pcie", 3, "2018: no overclocking, memory held at 2666."),
  board("b-z390", "Chipwright Z390 board", 2018, "lga1151v2", ["cfl", "cfl-r"], "ddr4", 4, 4400, ["oc"], "pcie", 3, "2018: the board for the 9900K."),
  board("b-b450", "Alder B450 board", 2018, "am4", AM4, "ddr4", 4, 3466, ["oc"], "pcie", 3, "2018: the long-lived budget AM4 board."),
  board("b-x470", "Alder X470 board", 2018, "am4", AM4, "ddr4", 4, 3600, ["oc"], "pcie", 3, "2018: AM4's top board for the 2000-series."),
  board("b-x570", "Alder X570 board", 2019, "am4", ["zen+", "zen2", "zen3"], "ddr4", 4, 4400, ["oc"], "pcie", 4, "2019: PCI Express 4.0; no 1000-series chips."),
  board("b-b550", "Alder B550 board", 2020, "am4", ["zen2", "zen3"], "ddr4", 4, 4400, ["oc"], "pcie", 4, "2020: PCI Express 4.0 for the graphics slot; 3000-series chips and later only."),
  board("b-z690", "Chipwright Z690 board", 2021, "lga1700", LGA1700, "ddr5", 4, 6400, ["oc"], "pcie", 5, "2021: LGA1700, DDR5 and PCI Express 5.0."),
  board("b-z690d4", "Chipwright Z690 DDR4 board", 2021, "lga1700", LGA1700, "ddr4", 4, 4000, ["oc"], "pcie", 5, "2021: the same chipset with DDR4 slots instead."),
  board("b-b660", "Chipwright B660 board", 2022, "lga1700", LGA1700, "ddr5", 4, 5600, [], "pcie", 4, "2022: no CPU overclocking, but memory can run past rated speed."),
  board("b-h610", "Chipwright H610 board", 2022, "lga1700", LGA1700, "ddr4", 2, 3200, ["lock"], "pcie", 4, "2022: the cheapest LGA1700 board, two DDR4 slots."),
  board("b-z790", "Chipwright Z790 board", 2022, "lga1700", LGA1700, "ddr5", 4, 7200, ["oc"], "pcie", 5, "2022: faster DDR5 for the 13000-series."),
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
  cpu("c-1950x", "Alder 1950X", 2017, "cpu-alder32", "tr4", "zen1-tr", 28, 32768, { ddr4: 2667 }, true, 3, "2017: sixteen cores on a desktop."),
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

export const BENCH_PARTS = [...BENCH_BOARDS, ...BENCH_CPUS, ...BENCH_STICKS];

// R&D a second for each point of CPU perf at full memory. Tuned in the
// simulation so the bench adds about a tenth of what the research servers make.
export const BENCH_RD = 0.03;
