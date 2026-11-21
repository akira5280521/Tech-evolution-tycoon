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

function board(id, name, year, research, socket, mem, slots, spec) {
  return { ...base, id, kind: "board", name, year, research, socket, mem, slots, icon: icon(id), cost: price(year, 0.3), spec };
}
function cpu(id, name, year, research, socket, perf, ramMb, spec) {
  return { ...base, id, kind: "cpu", name, year, research, socket, perf, ramMb, icon: icon(id), cost: price(year, 0.5), spec };
}
function stick(id, name, year, research, mem, mb, spec) {
  return { ...base, id, kind: "stick", name, year, research, mem, mb, icon: icon(id), cost: price(year, 0.06), spec };
}

export const BENCH_BOARDS = [
  board("b-altair", "Mitts Altair 8800 board", 1975, "board-altair", "8080", "dip", 4, "1975: the kit computer on the S-100 bus that started the hobby."),
  board("b-orchard2", "Orchard II board", 1977, "board-orchard2", "6502", "dip", 3, "1977: three banks of 16 KB chips, 48 KB at most, and eight card slots."),
  board("b-trs80", "Radio Shed Model I board", 1977, "board-trs80", "z80", "dip", 2, "1977: the Z80 board under the Model I's keyboard."),
  board("b-5150", "Inland PC board", 1981, "board-5150", "8088", "dip", 4, "1981: the Inland PC's board, five 8-bit ISA slots, four banks of memory chips."),
  board("b-at", "Inland PC/AT board", 1984, "board-at", "286", "dip", 2, "1984: 16-bit ISA slots and 512 KB on the board."),
  board("b-deskpro", "Compass Deskpro 386 board", 1986, "board-deskpro", "386", "dip", 4, "1986: the first 386 PC, beating Inland to the chip."),
  board("b-vlb", "486 VL-Bus board", 1992, "board-vlb", "486", "simm30", 8, "1992: a 486 socket, eight 30-pin SIMM slots and the VESA local bus."),
  board("b-430lx", "Chipwright 430LX board", 1993, "board-430lx", "socket4", "simm72", 4, "1993: the first 586 boards, PCI slots and 72-pin SIMMs."),
  board("b-430fx", "Chipwright 430FX board", 1995, "board-430fx", "socket7", "simm72", 4, "1995: Socket 7 and EDO memory."),
  board("b-440fx", "Chipwright 440FX board", 1996, "board-440fx", "socket8", "simm72", 4, "1996: Socket 8 for the 586 Pro."),
  board("b-mvp3", "Viatek MVP3 board", 1998, "board-mvp3", "socket7", "sdram", 3, "1998: Super Socket 7, a 100 MHz bus and AGP for the K6-2."),
  board("b-440bx", "Chipwright 440BX board", 1998, "board-440bx", "slot1", "sdram", 4, "1998: Slot 1, PC100 SDRAM and AGP 2x."),
  board("b-amd750", "Alder 750 board", 1999, "board-amd750", "slota", "sdram", 3, "1999: Slot A for the first K7 chips."),
  board("b-kt266a", "Viatek KT266A board", 2001, "board-kt266a", "socketa", "ddr", 3, "2001: Socket A with DDR memory."),
  board("b-875p", "Chipwright 875P board", 2003, "board-875p", "s478", "ddr", 4, "2003: Socket 478, dual-channel DDR-400, AGP 8x and SATA."),
  board("b-nf4", "Raster nForce4 board", 2004, "board-nf4", "s939", "ddr", 4, "2004: Socket 939 with PCI Express graphics."),
  board("b-p965", "Chipwright P965 board", 2006, "board-p965", "lga775", "ddr2", 4, "2006: LGA775 and DDR2."),
  board("b-790fx", "Alder 790FX board", 2007, "board-790fx", "am2", "ddr2", 4, "2007: AM2+ and DDR2."),
  board("b-x58", "Chipwright X58 board", 2008, "board-x58", "lga1366", "ddr3", 6, "2008: LGA1366 and triple-channel DDR3 in six slots."),
  board("b-z68", "Chipwright Z68 board", 2011, "board-z68", "lga1155", "ddr3", 4, "2011: LGA1155 and SATA at 6 Gbit/s."),
  board("b-990fx", "Alder 990FX board", 2011, "board-990fx", "am3", "ddr3", 4, "2011: AM3+ and DDR3."),
  board("b-z87", "Chipwright Z87 board", 2013, "board-z87", "lga1150", "ddr3", 4, "2013: LGA1150."),
  board("b-z170", "Chipwright Z170 board", 2015, "board-z170", "lga1151", "ddr4", 4, "2015: LGA1151, DDR4 and an M.2 slot."),
  board("b-x370", "Alder X370 board", 2017, "board-x370", "am4", "ddr4", 4, "2017: AM4, which took four generations of chips."),
  board("b-x399", "Alder X399 board", 2017, "board-x399", "tr4", "ddr4", 8, "2017: the 4,094-pin TR4 socket and eight DDR4 slots."),
  board("b-z370", "Chipwright Z370 board", 2017, "board-z370", "lga1151v2", "ddr4", 4, "2017: the same socket shape as Z170, but only 8000-series chips and later work."),
  board("b-x570", "Alder X570 board", 2019, "board-x570", "am4", "ddr4", 4, "2019: AM4 with PCI Express 4.0."),
  board("b-z690", "Chipwright Z690 board", 2021, "board-z690", "lga1700", "ddr5", 4, "2021: LGA1700, DDR5 and PCI Express 5.0."),
  board("b-x670e", "Alder X670E board", 2022, "board-x670e", "am5", "ddr5", 4, "2022: AM5 and DDR5 only."),
  board("b-z890", "Chipwright Z890 board", 2024, "board-z890", "lga1851", "ddr5", 4, "2024: LGA1851."),
];

export const BENCH_CPUS = [
  cpu("c-8080", "Chipwright 8080", 1974, "cpu-8080", "8080", 0.74, 0.016, "1974: 8-bit, 2 MHz."),
  cpu("c-6502", "Moss 6502", 1975, "cpu-6502", "6502", 0.81, 0.016, "1975: 8-bit, about 1 MHz, sold for $25 when rivals cost $150 or more."),
  cpu("c-z80", "Zylar Z80", 1976, "cpu-z80", "z80", 0.87, 0.016, "1976: 8-bit, runs 8080 programs, 2.5 MHz at launch."),
  cpu("c-8088", "Chipwright 8088", 1979, "cpu-8088", "8088", 0.76, 0.064, "1979: a 16-bit chip on an 8-bit bus; the Inland PC ran it at 4.77 MHz."),
  cpu("c-286", "Chipwright 286", 1982, "cpu-286", "286", 1.07, 0.512, "1982: 16-bit, protected mode, 6 to 12 MHz."),
  cpu("c-386", "Chipwright 386", 1985, "cpu-386", "386", 1.5, 2, "1985: 32-bit, first sold at 16 MHz."),
  cpu("c-am386", "Alder 386DX-40", 1991, "cpu-am386", "386", 2.2, 4, "1991: a 386 at 40 MHz, faster than any Chipwright 386."),
  cpu("c-486", "Chipwright 486", 1989, "cpu-486", "486", 2.6, 4, "1989: cache and floating point on the chip, 25 MHz at launch."),
  cpu("c-am486", "Alder 486DX2-66", 1993, "cpu-am486", "486", 3, 8, "1993: a 486 doubling its 33 MHz bus to 66 MHz inside."),
  cpu("c-586", "Chipwright 586", 1993, "cpu-pentium", "socket4", 3.4, 8, "1993: superscalar, 60 MHz, about 3.1 million transistors."),
  cpu("c-586pro", "Chipwright 586 Pro", 1995, "cpu-586pro", "socket8", 4, 16, "1995: out-of-order, with its cache in the same package."),
  cpu("c-k5", "Alder K5 PR100", 1996, "cpu-k5", "socket7", 3.7, 16, "1996: Alder's own design, rated against a 100 MHz 586."),
  cpu("c-586mmx", "Chipwright 586 MMX", 1997, "cpu-586mmx", "socket7", 4, 16, "1997: 57 new instructions for media."),
  cpu("c-k6", "Alder K6-200", 1997, "cpu-k6", "socket7", 4.1, 16, "1997: 200 MHz, MMX, on Socket 7."),
  cpu("c-p2", "Chipwright P-II 300", 1997, "cpu-p2", "slot1", 4.5, 32, "1997: a cartridge for Slot 1, 300 MHz."),
  cpu("c-300a", "Chipwright 300A", 1998, "cpu-300a", "slot1", 4.6, 32, "1998: the budget chip famous for running at 450 MHz."),
  cpu("c-k62", "Alder K6-2 300", 1998, "cpu-k62", "socket7", 4.4, 32, "1998: 3DNow instructions for 3D math and a 100 MHz bus."),
  cpu("c-k7", "Alder K7 600", 1999, "cpu-k7", "slota", 5.6, 64, "1999: the first chip of its kind to beat Chipwright at the top."),
  cpu("c-p3", "Chipwright P-III 500", 1999, "cpu-p3", "slot1", 5.4, 64, "1999: 500 MHz and SSE instructions."),
  cpu("c-xp", "Alder 1800+", 2001, "cpu-xp", "socketa", 6.8, 256, "2001: 1.53 GHz, rated against a 1.8 GHz rival."),
  cpu("c-p4", "Chipwright P4 3.0C", 2003, "cpu-p4", "s478", 7.3, 512, "2003: 3 GHz, an 800 MHz bus and two threads on one core."),
  cpu("c-a64", "Alder 64", 2003, "cpu-alder64", "s939", 7.6, 512, "2003: the first 64-bit PC chip, memory controller on the chip."),
  cpu("c-x2", "Alder X2 4800+", 2005, "cpu-x2", "s939", 9.2, 1024, "2005: two cores, 2.4 GHz."),
  cpu("c-dual", "Chipwright Dual", 2005, "cpu-dual", "lga775", 8.8, 1024, "2005: two cores in one package, 2.8 GHz."),
  cpu("c-e6600", "Chipwright E6600", 2006, "cpu-e6600", "lga775", 10.5, 1024, "2006: two cores, 2.4 GHz, far more done per clock."),
  cpu("c-q6600", "Chipwright Q6600", 2007, "cpu-q6600", "lga775", 12.6, 2048, "2007: four cores at 2.4 GHz."),
  cpu("c-phenom", "Alder X4 9600", 2007, "cpu-phenom", "am2", 11.8, 2048, "2007: four cores on one die."),
  cpu("c-i7920", "Chipwright i7-920", 2008, "cpu-i7920", "lga1366", 15, 3072, "2008: four cores, eight threads, memory controller on the chip."),
  cpu("c-ph2", "Alder X4 940", 2009, "cpu-ph2", "am2", 14.5, 4096, "2009: four cores at 3 GHz on AM2+."),
  cpu("c-2600k", "Chipwright i7-2600K", 2011, "cpu-2600k", "lga1155", 17, 8192, "2011: graphics on the chip, 3.4 GHz, unlocked."),
  cpu("c-fx8150", "Alder FX-8150", 2011, "cpu-fx8150", "am3", 17, 8192, "2011: eight cores in four pairs."),
  cpu("c-4770k", "Chipwright i7-4770K", 2013, "cpu-4770k", "lga1150", 19.5, 8192, "2013: voltage regulation on the chip."),
  cpu("c-6700k", "Chipwright i7-6700K", 2015, "cpu-6700k", "lga1151", 20.5, 16384, "2015: DDR4, 4 GHz."),
  cpu("c-1800x", "Alder 1800X", 2017, "cpu-1800x", "am4", 23, 16384, "2017: eight cores, sixteen threads, back in the race."),
  cpu("c-1950x", "Alder 1950X", 2017, "cpu-alder32", "tr4", 28, 32768, "2017: sixteen cores on a desktop."),
  cpu("c-8700k", "Chipwright i7-8700K", 2017, "cpu-8700k", "lga1151v2", 23, 16384, "2017: six cores, the first six-core chip of its line."),
  cpu("c-9900k", "Chipwright i9-9900K", 2018, "cpu-9900k", "lga1151v2", 25, 16384, "2018: eight cores, up to 5 GHz."),
  cpu("c-3950x", "Alder 3950X", 2019, "cpu-3950x", "am4", 30, 32768, "2019: sixteen cores on AM4, made from small chiplets."),
  cpu("c-5950x", "Alder 5950X", 2020, "cpu-5950x", "am4", 32, 32768, "2020: sixteen cores, eight to each shared cache."),
  cpu("c-12900k", "Chipwright i9-12900K", 2021, "cpu-12900k", "lga1700", 33, 32768, "2021: big and small cores together, 16 in all."),
  cpu("c-7950x", "Alder 7950X", 2022, "cpu-7950x", "am5", 35, 32768, "2022: sixteen cores, up to 5.7 GHz, on AM5."),
  cpu("c-13900k", "Chipwright i9-13900K", 2022, "cpu-13900k", "lga1700", 35, 32768, "2022: 24 cores, up to 5.8 GHz."),
  cpu("c-14900k", "Chipwright i9-14900K", 2023, "cpu-14900k", "lga1700", 36, 32768, "2023: 24 cores, up to 6 GHz."),
  cpu("c-9950x", "Alder 9950X", 2024, "cpu-9950x", "am5", 38, 65536, "2024: sixteen cores, wider cores than the 7950X."),
  cpu("c-285k", "Chipwright Ultra 9 285K", 2024, "cpu-285k", "lga1851", 37, 65536, "2024: 24 cores and no second thread on any of them."),
];

export const BENCH_STICKS = [
  stick("m-4116", "16 KB of 4116 chips", 1977, "mem-4116", "dip", 0.016, "1977: eight 16 Kbit chips make one 16 KB bank."),
  stick("m-4164", "64 KB of 4164 chips", 1981, "mem-4164", "dip", 0.064, "1981: 64 Kbit chips, one 64 KB bank."),
  stick("m-41256", "256 KB of 41256 chips", 1984, "mem-41256", "dip", 0.256, "1984: 256 Kbit chips, one 256 KB bank."),
  stick("m-simm1", "1 MB 30-pin SIMM", 1988, "mem-simm", "simm30", 1, "1988: memory chips on a small card, 8 bits wide."),
  stick("m-simm4", "4 MB 30-pin SIMM", 1991, "mem-simm4", "simm30", 4, "1991: the same card with denser chips."),
  stick("m-simm72", "8 MB 72-pin SIMM", 1993, "mem-simm72", "simm72", 8, "1993: 32 bits wide, so a 586 needs them in pairs."),
  stick("m-edo", "16 MB EDO SIMM", 1995, "mem-edo", "simm72", 16, "1995: extended data out, a little faster on each read."),
  stick("m-pc66", "32 MB PC66 DIMM", 1997, "mem-pc66", "sdram", 32, "1997: synchronous memory on a 168-pin DIMM."),
  stick("m-pc133", "128 MB PC133 DIMM", 1999, "mem-pc133", "sdram", 128, "1999: SDRAM at 133 MHz."),
  stick("m-ddr266", "256 MB DDR-266", 2000, "mem-ddr", "ddr", 256, "2000: data on both edges of the clock."),
  stick("m-ddr400", "512 MB DDR-400", 2003, "mem-ddr400", "ddr", 512, "2003: PC3200, DDR's fastest standard speed."),
  stick("m-ddr2", "1 GB DDR2-800", 2006, "mem-ddr2-800", "ddr2", 1024, "2006: PC2-6400."),
  stick("m-ddr3a", "2 GB DDR3-1333", 2008, "mem-ddr3-1333", "ddr3", 2048, "2008: PC3-10600."),
  stick("m-ddr3b", "8 GB DDR3-1600", 2012, "mem-ddr3-1600", "ddr3", 8192, "2012: PC3-12800."),
  stick("m-ddr4a", "8 GB DDR4-2133", 2014, "mem-ddr4", "ddr4", 8192, "2014: PC4-17000, the first DDR4 speed."),
  stick("m-ddr4b", "16 GB DDR4-3200", 2017, "mem-ddr4-3200", "ddr4", 16384, "2017: PC4-25600."),
  stick("m-ddr5a", "16 GB DDR5-4800", 2020, "mem-ddr5", "ddr5", 16384, "2020: two 32-bit channels on each stick."),
  stick("m-ddr5b", "32 GB DDR5-6000", 2022, "mem-ddr5-6000", "ddr5", 32768, "2022: PC5-48000."),
];

export const BENCH_PARTS = [...BENCH_BOARDS, ...BENCH_CPUS, ...BENCH_STICKS];

// R&D a second for each point of CPU perf at full memory. Tuned in the
// simulation so the bench adds about a tenth of what the research servers make.
export const BENCH_RD = 0.03;
