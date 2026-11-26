// Timed research, paid in R&D points: the one research currency (state.data),
// made only by research machines (the starter punch-card machine, the server
// plant and the PC bench); eras stopped making them in 0.0.29. Projects keep
// running while the app is closed; earnings while away are at the away rate. A project can start only after the
// company's newest era is at least as new as the project's real year, and
// after its prerequisite is done. Locked rows say "Requires 2020", never an
// era name.
//
// CPU and GPU pay bonuses still follow how many of that row you own, and
// also this list once researchDone is present. The first generation of a row
// stays free so a new microprocessor works before any project.

import { BUSINESSES } from "./gameConfig.js";
import { companyCaps } from "./company.js";
import { GENERATIONS } from "./generations.js";
import { PARTS, benchStock, pushHeadline, readFacilities, serverStock, starterRate } from "./facilities.js";
import { playerYear } from "./eraYear.js";
import { AWAY_SHIFTS, awayShifts } from "./empire.js";
import { calendarYearAt } from "./calendar.js";
import { RELEASE_MONTH, monthName } from "./releaseMonths.js";

export { playerYear };

export const RESEARCH_TABS = [
  { id: "cpu", label: "CPU" },
  { id: "gpu", label: "GPU" },
  { id: "memory", label: "MEMORY" },
  { id: "storage", label: "STORAGE" },
  { id: "cooling", label: "COOLING" },
  { id: "power", label: "POWER" },
  { id: "network", label: "NETWORK" },
  { id: "servers", label: "SERVERS" },
  { id: "boards", label: "BOARDS" },
  { id: "sound", label: "SOUND" },
  { id: "cases", label: "CASES" },
];



// R&D points a second per unit of server work. The starter punch-card
// machine makes a flat 0.001 a second each (up to 6); one Irwell Mark 1
// (work 2) makes 0.01, so the servers soon outclass it.
const RD_PER_WORK = 0.005;
const RD_CAP = 1e9;
// Project price in R&D points: the table's rd x RD_COST_SCALE, doubling every
// RD_DOUBLING_YEARS of the project's year, so later chips cost more as the
// servers grow. 4004 = 67, 486 = 539, DDR = 768, the 2017-19 projects about
// 3,400-4,200; 53,433 for all 47.
export const RD_COST_SCALE = 8;
const RD_BASE_YEAR = 1970;
const RD_DOUBLING_YEARS = 15;

export function researchCost(entry) {
  if (!entry) return 0;
  // A few early teaching projects set a fixed cost so the first research
  // is reachable with the starter machine, instead of the later-year curve.
  if (Number.isFinite(entry.fixedCost) && entry.fixedCost > 0) return Math.round(entry.fixedCost);
  const year = Number(entry.year) || RD_BASE_YEAR;
  return Math.round((entry.rd || 0) * RD_COST_SCALE * Math.pow(2, (year - RD_BASE_YEAR) / RD_DOUBLING_YEARS));
}

function item(row) {
  return row;
}

export const RESEARCH = [
  item({ id: "cpu-4bit", tab: "cpu", year: 1971, name: "Chipwright 4004", spec: "4-bit, 740 kHz, about 2,300 transistors", rd: 8, durationMs: 20_000, prereq: null }),
  item({ id: "cpu-8080", tab: "cpu", year: 1974, name: "Chipwright 8080", spec: "8-bit, 2 MHz, 40-pin package", rd: 12, durationMs: 30_000, prereq: "cpu-4bit" }),
  item({ id: "cpu-8086", tab: "cpu", year: 1978, name: "Chipwright 8086", spec: "16-bit, 5–10 MHz, about 29,000 transistors", rd: 16, durationMs: 40_000, prereq: "cpu-8080" }),
  item({ id: "cpu-286", tab: "cpu", year: 1982, name: "Chipwright 286", spec: "16-bit, 6–12 MHz, 24-bit addresses", rd: 20, durationMs: 50_000, prereq: "cpu-8086" }),
  item({ id: "cpu-386", tab: "cpu", year: 1985, name: "Chipwright 386", spec: "32-bit, first sold at 16 MHz, about 275,000 transistors", rd: 24, durationMs: 60_000, prereq: "cpu-286" }),
  item({ id: "cpu-486", tab: "cpu", year: 1989, name: "Chipwright 486", spec: "25–50 MHz, cache and floating point on the chip", rd: 28, durationMs: 70_000, prereq: "cpu-386" }),
  item({ id: "cpu-pentium", tab: "cpu", year: 1993, name: "Chipwright 586", spec: "Superscalar, 60 MHz at launch, about 3.1 million transistors", rd: 32, durationMs: 80_000, prereq: "cpu-486" }),
  item({ id: "cpu-alder64", tab: "cpu", year: 2003, name: "Alder 64", spec: "64-bit PC chip, 130 nm", rd: 40, durationMs: 90_000, prereq: "cpu-pentium" }),
  item({ id: "cpu-dual", tab: "cpu", year: 2005, name: "Chipwright Dual", spec: "Two cores, first desktop parts at 2.8 GHz", rd: 48, durationMs: 100_000, prereq: "cpu-alder64" }),
  item({ id: "cpu-alder32", tab: "cpu", year: 2017, name: "Alder 32", spec: "Up to 32 cores, four chips on one package", rd: 60, durationMs: 120_000, prereq: "cpu-dual" }),

  item({ id: "gpu-2d", tab: "gpu", year: 1990, name: "Rasterline 4000", spec: "2D SVGA, ISA, up to 1024×768", rd: 16, durationMs: 40_000, prereq: null }),
  item({ id: "gpu-3d", tab: "gpu", year: 1996, name: "Threefold Add-in", spec: "3D only, PCI, 4 MB, beside a 2D card", rd: 20, durationMs: 50_000, prereq: "gpu-2d" }),
  item({ id: "gpu-256", tab: "gpu", year: 1999, name: "Raster 256", spec: "Hardware transform and lighting", rd: 24, durationMs: 60_000, prereq: "gpu-3d" }),
  item({ id: "gpu-3", tab: "gpu", year: 2001, name: "Raster 3", spec: "Programmable vertex and pixel shaders", rd: 28, durationMs: 70_000, prereq: "gpu-256" }),
  item({ id: "gpu-8800", tab: "gpu", year: 2006, name: "Raster 8800", spec: "128 unified processors, 768 MB", rd: 36, durationMs: 80_000, prereq: "gpu-3" }),
  item({ id: "gpu-100", tab: "gpu", year: 2017, name: "Raster 100", spec: "Tensor cores, 16 GB stacked memory", rd: 48, durationMs: 90_000, prereq: "gpu-8800" }),
  item({ id: "gpu-2080", tab: "gpu", year: 2018, name: "Raster 2080", spec: "First consumer card with ray-tracing cores", rd: 56, durationMs: 100_000, prereq: "gpu-100" }),

  // Cards for the mine and cluster. Each opens its part on the Facilities page.
  item({ id: "card-1080", tab: "gpu", year: 2016, name: "Raster 1080", spec: "8 GB GDDR5X, 180 W, 8.9 TFLOPS FP32", rd: 16, durationMs: 60_000, prereq: null }),
  item({ id: "card-p100", tab: "gpu", year: 2016, name: "Tensor P100", spec: "16 GB HBM2, the first data-center card with stacked memory", rd: 48, durationMs: 70_000, prereq: "card-1080" }),
  item({ id: "card-v100", tab: "gpu", year: 2017, name: "Tensor V100", spec: "16 GB HBM2 and the first tensor cores", rd: 56, durationMs: 80_000, prereq: "card-p100" }),
  item({ id: "card-3090", tab: "gpu", year: 2020, name: "Raster 3090", spec: "24 GB GDDR6X, 350 W", rd: 56, durationMs: 80_000, prereq: "card-v100" }),
  item({ id: "card-a100", tab: "gpu", year: 2020, name: "Tensor A100", spec: "80 GB HBM2e by 2020's end, 400 W", rd: 64, durationMs: 90_000, prereq: "card-3090" }),
  item({ id: "card-3060", tab: "gpu", year: 2021, name: "Raster 3060", spec: "12 GB GDDR6, 170 W, a mid-range card", rd: 48, durationMs: 70_000, prereq: "card-3090" }),
  item({ id: "card-4090", tab: "gpu", year: 2022, name: "Raster 4090", spec: "24 GB GDDR6X, 450 W, 82.6 TFLOPS FP32", rd: 64, durationMs: 90_000, prereq: "card-3090" }),
  item({ id: "card-h100", tab: "gpu", year: 2022, name: "Tensor H100", spec: "80 GB HBM3, 700 W", rd: 72, durationMs: 100_000, prereq: "card-a100" }),
  item({ id: "card-b200", tab: "gpu", year: 2024, name: "Tensor B200", spec: "192 GB HBM3e, two dies on one package", rd: 80, durationMs: 110_000, prereq: "card-h100" }),

  item({ id: "mem-dram", tab: "memory", year: 1970, name: "1K DRAM", spec: "1 kilobit dynamic RAM, the chip that replaced cores", rd: 8, durationMs: 20_000, prereq: null }),
  item({ id: "mem-simm", tab: "memory", year: 1988, name: "30-pin SIMM", spec: "8-bit module, typically 1–4 MB", rd: 16, durationMs: 40_000, prereq: "mem-dram" }),
  item({ id: "mem-sdram", tab: "memory", year: 1993, name: "SDRAM", spec: "Synchronous DRAM, 66–133 MHz", rd: 20, durationMs: 50_000, prereq: "mem-simm" }),
  item({ id: "mem-ddr", tab: "memory", year: 2000, name: "DDR-266", spec: "DDR SDRAM, PC2100, 2.1 GB/s", rd: 24, durationMs: 55_000, prereq: "mem-sdram" }),
  item({ id: "mem-ddr2", tab: "memory", year: 2003, name: "DDR2-533", spec: "DDR2, PC2-4200, the launch speed", rd: 28, durationMs: 60_000, prereq: "mem-ddr" }),
  item({ id: "mem-ddr3", tab: "memory", year: 2007, name: "DDR3-1066", spec: "DDR3, PC3-8500, the launch speed", rd: 32, durationMs: 70_000, prereq: "mem-ddr2" }),
  item({ id: "mem-ddr4", tab: "memory", year: 2014, name: "DDR4-2133", spec: "DDR4, PC4-17000, 17 GB/s at launch", rd: 40, durationMs: 80_000, prereq: "mem-ddr3" }),
  item({ id: "mem-ddr5", tab: "memory", year: 2020, name: "DDR5-4800", spec: "DDR5, PC5-38400, 38.4 GB/s", rd: 64, durationMs: 120_000, prereq: "mem-ddr4" }),
  item({ id: "mem-ddr5-64", tab: "memory", year: 2022, name: "64 GB DDR5 RDIMM", spec: "Registered DDR5 for the first DDR5 servers", rd: 64, durationMs: 120_000, prereq: "mem-ddr5" }),
  item({ id: "mem-ddr5-128", tab: "memory", year: 2024, name: "128 GB DDR5-6400", spec: "Registered DDR5 at 6400 MT/s", rd: 72, durationMs: 130_000, prereq: "mem-ddr5-64" }),
  item({ id: "mem-ddr6", tab: "memory", year: 2024, name: "DDR6", spec: "Next memory module", rd: 0, durationMs: 0, prereq: "mem-ddr5", soon: true }),

  item({ id: "tab-hollerith", tab: "storage", year: 1, name: "Hollerith tabulator", spec: "1890: punched cards count a census in months, not years.", rd: 1, fixedCost: 1, durationMs: 20_000, prereq: null }),
  item({ id: "store-tape", tab: "storage", year: 1951, name: "Magnetic tape", spec: "Half-inch metal tape on a reel, about a megabyte a reel.", rd: 4, durationMs: 25_000, prereq: null }),
  item({ id: "store-hdd", tab: "storage", year: 1956, name: "5 MB disk", spec: "The first commercial disk drive: fifty platters, 5 million characters", rd: 8, durationMs: 25_000, prereq: "store-tape" }),
  item({ id: "store-pack", tab: "storage", year: 1964, name: "Disk pack", spec: "Inland 2311: a stack of six platters you lift out, 7.25 MB", rd: 5, durationMs: 25_000, prereq: "store-hdd" }),
  item({ id: "store-3330", tab: "storage", year: 1970, name: "100 MB disk pack", spec: "Inland 3330: eleven platters, 100 MB a pack", rd: 6, durationMs: 30_000, prereq: "store-pack" }),
  item({ id: "store-3380", tab: "storage", year: 1980, name: "2.5 GB disk", spec: "Inland 3380: the first disk to hold gigabytes, 2.52 GB a unit", rd: 14, durationMs: 35_000, prereq: "store-3330" }),
  item({ id: "store-floppy", tab: "storage", year: 1971, name: "8-inch floppy", spec: "About 80 KB on the first disks", rd: 12, durationMs: 30_000, prereq: "store-3330" }),
  item({ id: "store-scsi", tab: "storage", year: 1986, name: "SCSI", spec: "Parallel bus for disks, later 5–10 MB/s", rd: 16, durationMs: 40_000, prereq: "store-floppy" }),
  item({ id: "store-10k", tab: "storage", year: 1996, name: "10,000 rpm disk", spec: "9 GB SCSI, the first 10,000 rpm drive", rd: 20, durationMs: 45_000, prereq: "store-scsi" }),
  item({ id: "store-sata", tab: "storage", year: 2003, name: "SATA", spec: "Serial ATA, 1.5 Gbit/s at launch", rd: 24, durationMs: 50_000, prereq: "store-scsi" }),
  item({ id: "store-ssd", tab: "storage", year: 2008, name: "SSD", spec: "NAND flash disk, no spinning platter", rd: 32, durationMs: 60_000, prereq: "store-sata" }),
  item({ id: "store-1tb", tab: "storage", year: 2007, name: "1 TB disk", spec: "The first terabyte drive: five platters, 7200 rpm", rd: 28, durationMs: 55_000, prereq: "store-sata" }),
  item({ id: "store-ssd2t", tab: "storage", year: 2015, name: "2 TB SSD", spec: "2 TB of NAND flash on SATA", rd: 36, durationMs: 65_000, prereq: "store-ssd" }),
  item({ id: "store-nvme", tab: "storage", year: 2013, name: "NVMe", spec: "Flash on PCI Express, not a SATA bridge", rd: 40, durationMs: 70_000, prereq: "store-ssd" }),

  item({ id: "cool-crac", tab: "cooling", year: 1970, name: "Computer-room air unit", spec: "A floor-standing air conditioner built for machine rooms, cooling several computers", rd: 5, durationMs: 25_000, prereq: null }),
  item({ id: "cool-sink", tab: "cooling", year: 1982, name: "Clip heatsink", spec: "Aluminium block clipped to a 286-class chip", rd: 8, durationMs: 20_000, prereq: null }),
  item({ id: "cool-labfan", tab: "cooling", year: 1989, name: "Rack fan", spec: "A 120 mm fan for a server rack, about 300 W of airflow.", rd: 10, durationMs: 25_000, prereq: "cool-sink" }),
  item({ id: "cool-fan", tab: "cooling", year: 1994, name: "Case fan", spec: "80 mm fan, a few watts of airflow", rd: 12, durationMs: 30_000, prereq: "cool-sink" }),
  item({ id: "cool-pipe", tab: "cooling", year: 2001, name: "Heatpipe tower", spec: "Heatpipes into a fin stack", rd: 20, durationMs: 45_000, prereq: "cool-fan" }),
  item({ id: "cool-liquid", tab: "cooling", year: 2008, name: "360 mm loop", spec: "External radiator, about 700 W of heat", rd: 28, durationMs: 60_000, prereq: "cool-pipe" }),
  item({ id: "cool-immersion", tab: "cooling", year: 2022, name: "Immersion bath", spec: "The rack sits in a dielectric bath", rd: 64, durationMs: 100_000, prereq: "cool-liquid" }),

  item({ id: "pwr-ups", tab: "power", year: 1967, name: "Battery UPS", spec: "Rectifier, batteries and inverter: the machine room rides through a power cut", rd: 4, durationMs: 25_000, prereq: null }),
  item({ id: "pwr-switch", tab: "power", year: 1977, name: "Switch-mode supply", spec: "A small switching supply that runs cool, as in the first home computers", rd: 5, durationMs: 25_000, prereq: "pwr-ups" }),
  item({ id: "pwr-at", tab: "power", year: 1984, name: "AT supply", spec: "Hard-switched AT box, typically under 200 W", rd: 8, durationMs: 20_000, prereq: "pwr-switch" }),
  item({ id: "pwr-atx", tab: "power", year: 1995, name: "ATX supply", spec: "Soft power, 20-pin then 24-pin", rd: 14, durationMs: 35_000, prereq: "pwr-at" }),
  item({ id: "pwr-80", tab: "power", year: 2004, name: "80 Plus", spec: "80% efficient at 20, 50 and 100% load", rd: 20, durationMs: 45_000, prereq: "pwr-atx" }),
  item({ id: "pwr-gold", tab: "power", year: 2008, name: "80 Plus Gold", spec: "87–90% efficient", rd: 28, durationMs: 55_000, prereq: "pwr-80" }),
  item({ id: "pwr-plat", tab: "power", year: 2009, name: "80 Plus Platinum", spec: "90–94% efficient", rd: 36, durationMs: 65_000, prereq: "pwr-gold" }),
  item({ id: "pwr-titan", tab: "power", year: 2015, name: "80 Plus Titanium", spec: "Up to 96% efficient, a rating set in 2012", rd: 44, durationMs: 75_000, prereq: "pwr-plat" }),

  item({ id: "net-imp", tab: "network", year: 1969, name: "ARPANET IMP", spec: "A packet switch the size of a refrigerator links the first computers on the network", rd: 4, durationMs: 25_000, prereq: null }),
  item({ id: "net-eth", tab: "network", year: 1980, name: "10BASE5", spec: "10 Mbit/s over thick coaxial", rd: 8, durationMs: 25_000, prereq: "net-imp" }),
  item({ id: "net-10baset", tab: "network", year: 1990, name: "10BASE-T", spec: "10 Mbit/s Ethernet over twisted pair", rd: 10, durationMs: 30_000, prereq: "net-eth" }),
  item({ id: "net-100", tab: "network", year: 1995, name: "100BASE-TX", spec: "100 Mbit/s over twisted pair", rd: 14, durationMs: 35_000, prereq: "net-eth" }),
  item({ id: "net-wifi", tab: "network", year: 1997, name: "802.11", spec: "First Wi-Fi, 1–2 Mbit/s", rd: 18, durationMs: 40_000, prereq: "net-100" }),
  item({ id: "net-gige", tab: "network", year: 1999, name: "1000BASE-T", spec: "Gigabit Ethernet over copper", rd: 22, durationMs: 50_000, prereq: "net-wifi" }),
  item({ id: "net-10g", tab: "network", year: 2008, name: "10 GbE switching", spec: "10 Gbit/s Ethernet at every port", rd: 28, durationMs: 60_000, prereq: "net-gige" }),
  item({ id: "net-ibqdr", tab: "network", year: 2008, name: "InfiniBand QDR", spec: "40 Gbit/s, microseconds of delay", rd: 30, durationMs: 60_000, prereq: "net-gige" }),
  item({ id: "net-n", tab: "network", year: 2009, name: "Wi-Fi 4", spec: "802.11n, up to 600 Mbit/s", rd: 30, durationMs: 60_000, prereq: "net-gige" }),
  item({ id: "net-ac", tab: "network", year: 2013, name: "Wi-Fi 5", spec: "802.11ac, gigabit wireless", rd: 36, durationMs: 70_000, prereq: "net-n" }),
  item({ id: "net-ibedr", tab: "network", year: 2014, name: "InfiniBand EDR", spec: "100 Gbit/s", rd: 38, durationMs: 75_000, prereq: "net-ibqdr" }),
  item({ id: "net-nvlink", tab: "network", year: 2016, name: "NVLink", spec: "Cards linked directly, 160 GB/s", rd: 40, durationMs: 80_000, prereq: "net-ibedr" }),
  item({ id: "net-ibhdr", tab: "network", year: 2018, name: "InfiniBand HDR", spec: "200 Gbit/s", rd: 42, durationMs: 80_000, prereq: "net-ibedr" }),
  item({ id: "net-nvswitch", tab: "network", year: 2018, name: "NVSwitch", spec: "Every card linked to every other", rd: 44, durationMs: 85_000, prereq: "net-nvlink" }),
  item({ id: "net-ax", tab: "network", year: 2019, name: "Wi-Fi 6", spec: "802.11ax, OFDMA", rd: 44, durationMs: 80_000, prereq: "net-ac" }),
  item({ id: "net-be", tab: "network", year: 2024, name: "Wi-Fi 7", spec: "802.11be", rd: 48, durationMs: 90_000, prereq: "net-ax" }),

  // Research servers, from the machine room to the rack. The Irwell Mark 1
  // (1951) needs no research; each later machine does.
  item({ id: "srv-mark1", tab: "servers", year: 1951, name: "Irwell Mark 1", spec: "A stored-program machine, 1951: about 3,500 valves, a 17-foot-long cabinet, your first research server.", rd: 3, fixedCost: 2, durationMs: 25_000, prereq: null }),
  item({ id: "srv-7090", tab: "servers", year: 1959, name: "Inland 7090", spec: "Transistors instead of valves, about six times the speed", rd: 4, durationMs: 25_000, prereq: "srv-mark1" }),
  item({ id: "srv-360", tab: "servers", year: 1965, name: "Inland 360/50", spec: "One family of compatible machines, from small to large", rd: 5, durationMs: 30_000, prereq: "srv-7090" }),
  item({ id: "srv-1120", tab: "servers", year: 1970, name: "Maynard 11/20", spec: "A 16-bit minicomputer that fits in one cabinet", rd: 6, durationMs: 35_000, prereq: "srv-360" }),
  item({ id: "srv-780", tab: "servers", year: 1977, name: "Maynard 11/780", spec: "32-bit, the yardstick for '1 MIPS'", rd: 8, durationMs: 40_000, prereq: "srv-1120" }),
  item({ id: "srv-cray1", tab: "servers", year: 1976, name: "Chippewa 1", spec: "A Freon-cooled supercomputer, 160 MFLOPS", rd: 10, durationMs: 45_000, prereq: "srv-1120" }),
  item({ id: "srv-xmp", tab: "servers", year: 1982, name: "Chippewa X-MP/48", spec: "Up to four processors sharing one memory", rd: 12, durationMs: 50_000, prereq: "srv-cray1" }),
  item({ id: "srv-cray2", tab: "servers", year: 1985, name: "Chippewa 2", spec: "1.9 GFLOPS, boards bathed in Fluorinert", rd: 14, durationMs: 55_000, prereq: "srv-xmp" }),
  item({ id: "srv-ymp", tab: "servers", year: 1988, name: "Chippewa Y-MP", spec: "Eight processors, liquid-cooled", rd: 16, durationMs: 60_000, prereq: "srv-cray2" }),
  item({ id: "srv-c90", tab: "servers", year: 1991, name: "Chippewa C90", spec: "Sixteen processors, 16 GFLOPS", rd: 18, durationMs: 65_000, prereq: "srv-ymp" }),
  item({ id: "srv-t3d", tab: "servers", year: 1993, name: "Chippewa T3D", spec: "Thousands of small processors in one machine", rd: 20, durationMs: 70_000, prereq: "srv-c90" }),
  item({ id: "srv-t90", tab: "servers", year: 1995, name: "Chippewa T90", spec: "32 vector processors, 58 GFLOPS", rd: 22, durationMs: 75_000, prereq: "srv-t3d" }),
  item({ id: "srv-t3e", tab: "servers", year: 1996, name: "Chippewa T3E", spec: "Up to 2,048 processors, 1.2 TFLOPS", rd: 24, durationMs: 80_000, prereq: "srv-t90" }),
  item({ id: "srv-xt3", tab: "servers", year: 2004, name: "Chippewa XT3", spec: "Cabinets of 64-bit PC chips on a custom network", rd: 30, durationMs: 85_000, prereq: "srv-t3e" }),
  item({ id: "srv-xt5", tab: "servers", year: 2008, name: "Chippewa XT5", spec: "The line behind the first petaflop systems", rd: 36, durationMs: 90_000, prereq: "srv-xt3" }),
  item({ id: "srv-xc30", tab: "servers", year: 2012, name: "Chippewa XC30", spec: "Water-cooled cabinets on a new network", rd: 40, durationMs: 95_000, prereq: "srv-xt5" }),
  item({ id: "srv-crayex", tab: "servers", year: 2021, name: "Chippewa EX", spec: "The line behind the first exascale machine", rd: 48, durationMs: 100_000, prereq: "srv-xc30" }),
  item({ id: "srv-cm5", tab: "servers", year: 1991, name: "Thinking Engines CM-5", spec: "Up to 1,024 processors on a fat-tree network", rd: 18, durationMs: 65_000, prereq: "srv-780" }),
  item({ id: "srv-alpha", tab: "servers", year: 1995, name: "Maynard AlphaServer 8400", spec: "64-bit Alpha chips, up to twelve", rd: 22, durationMs: 75_000, prereq: "srv-780" }),
  item({ id: "srv-origin", tab: "servers", year: 1996, name: "Silicon Pictures Origin 2000", spec: "Modules joined into one shared memory", rd: 24, durationMs: 80_000, prereq: "srv-780" }),
  item({ id: "srv-e10k", tab: "servers", year: 1997, name: "Sunrise Enterprise 10000", spec: "64 processors in one cabinet", rd: 24, durationMs: 80_000, prereq: "srv-780" }),
  item({ id: "srv-tower", tab: "servers", year: 1989, name: "Foundry Tower T4", spec: "A tower server with a 486 chip", rd: 18, durationMs: 50_000, prereq: "srv-780" }),
  item({ id: "srv-2u", tab: "servers", year: 1999, name: "Foundry 2U", spec: "Two 500 MHz chips in a 2U rack box", rd: 24, durationMs: 60_000, prereq: "srv-tower" }),
  item({ id: "srv-blade", tab: "servers", year: 2006, name: "Foundry Blade B2", spec: "Two dual-core chips on a blade", rd: 30, durationMs: 70_000, prereq: "srv-2u" }),
  item({ id: "srv-r1", tab: "servers", year: 2012, name: "Foundry Rack R1", spec: "1U, two 8-core chips", rd: 36, durationMs: 80_000, prereq: "srv-blade" }),
  item({ id: "srv-r4", tab: "servers", year: 2012, name: "Foundry Rack R4", spec: "4U, four 8-core chips", rd: 44, durationMs: 90_000, prereq: "srv-r1" }),
  item({ id: "arm-arm1", tab: "cpu", year: 1985, name: "Akorn ARM1", spec: "A 32-bit RISC chip with 25,000 transistors, built for a home computer", rd: 22, durationMs: 50_000, prereq: "cpu-286" }),
  item({ id: "arm-7tdmi", tab: "cpu", year: 1994, name: "Arem ARM7TDMI", spec: "The low-power core inside phones and music players for a decade", rd: 26, durationMs: 60_000, prereq: "arm-arm1" }),
  item({ id: "arm-a9", tab: "cpu", year: 2010, name: "Arem Cortex-A9", spec: "Two cores at 1 GHz in the first big tablets", rd: 34, durationMs: 75_000, prereq: "arm-7tdmi" }),
  item({ id: "arm-a15", tab: "cpu", year: 2012, name: "Arem Cortex-A15", spec: "Out-of-order cores fast enough to think about servers", rd: 38, durationMs: 80_000, prereq: "arm-a9" }),
  item({ id: "arm-n1", tab: "cpu", year: 2019, name: "Arem Neoverse N1", spec: "An ARM core designed for data centres", rd: 46, durationMs: 95_000, prereq: "arm-a15" }),
  item({ id: "srv-calx", tab: "servers", year: 2012, name: "Calxedon EnergyCore box", spec: "Low-power ARM servers by the dozen in one box", rd: 38, durationMs: 80_000, prereq: "arm-a9" }),
  item({ id: "srv-altra", tab: "servers", year: 2020, name: "Amperion Altra 1U", spec: "80 ARM cores in one server socket", rd: 50, durationMs: 100_000, prereq: "arm-n1" }),
  item({ id: "case-s100", tab: "cases", year: 1975, name: "S-100 cabinet", spec: "A blue steel box with a card cage and a front panel of switches", rd: 4, durationMs: 25_000, prereq: null }),
  item({ id: "case-plastic", tab: "cases", year: 1977, name: "Moulded plastic case", spec: "A home computer in one light plastic shell, keyboard built in", rd: 5, durationMs: 25_000, prereq: "case-s100" }),
  item({ id: "store-symm", tab: "storage", year: 1990, name: "EMZ Symmetrix 4200", spec: "A cabinet of small disks working as one, with a big cache", rd: 18, durationMs: 45_000, prereq: "store-scsi" }),
  item({ id: "store-thumper", tab: "storage", year: 2006, name: "Sunrise Fire X4500", spec: "48 disks in one 4U server", rd: 28, durationMs: 55_000, prereq: "store-sata" }),
  item({ id: "store-pod", tab: "storage", year: 2009, name: "Backblayz Storage Pod", spec: "45 cheap disks in a box anyone could build", rd: 30, durationMs: 60_000, prereq: "store-thumper" }),
  item({ id: "store-flasharray", tab: "storage", year: 2015, name: "Purely FlashArray//m", spec: "A whole array of flash in 3U", rd: 38, durationMs: 70_000, prereq: "store-pod" }),
];

// Year and month as one number, for putting projects in date order.
function dateKey(id, year) {
  return (Number(year) || 0) * 12 + ((RELEASE_MONTH[id] || 6) - 1);
}
// The first part of a kind builds on a project from the main table.
const CHAIN_START = { "board-altair": "case-s100", "case-atdesk": "case-plastic", "mod-300": "net-imp", "net-3c501": "net-eth", "drv-st506": "store-3380", "mem-4116": "mem-dram", "vid-cga": "cpu-8088", "mon-5151": "cpu-8088", "snd-covox": "cpu-286", "cool-clip": "cool-sink", "pwr-at230": "pwr-at" };

// Bench parts that need a project of their own get one: CPUs on the CPU tab
// (each after the last chip of its maker), boards on BOARDS, sticks on MEMORY.
{
  const have = new Set(RESEARCH.map((entry) => entry.id));
  const tabOf = { cpu: "cpu", board: "boards", stick: "memory", cache: "memory", video: "gpu", monitor: "gpu", bridge: "gpu", accel: "gpu", addin: "boards", sound: "sound", psu: "power", case: "cases", fpu: "cpu", drive: "storage", media: "storage", net: "network", modem: "network", cooler: "cooling" };
  const brand = (name) => name.split(" ")[0];
  const added = PARTS.filter((part) => part.fits.includes("bench") && part.research && !have.has(part.research))
    .sort((a, b) => a.year - b.year);
  for (const part of added) {
    if (have.has(part.research)) continue;
    const tab = tabOf[part.kind];
    let prereq = null;
    const at = dateKey(part.research, part.year);
    if (tab === "cpu") {
      const earlier = RESEARCH.filter((e) => e.tab === "cpu" && dateKey(e.id, e.year) <= at && brand(e.name) === brand(part.name));
      prereq = earlier.sort((a, b) => dateKey(b.id, b.year) - dateKey(a.id, a.year))[0]?.id || null;
    } else {
      // Every other part follows the last earlier part of its kind, so a
      // 5.25-inch drive comes after the 8-inch one, never before it.
      // Same-month parts go in name order so the chain never loops.
      const order = (q) => [dateKey(q.research, q.year), q.research];
      const before = (a, b) => order(a)[0] - order(b)[0] || (order(a)[1] < order(b)[1] ? -1 : order(a)[1] > order(b)[1] ? 1 : 0);
      const earlier = PARTS.filter((q) => q.kind === part.kind && q.fits.includes("bench") && q.research && q.research !== part.research && before(q, part) < 0)
        .sort((a, b) => before(b, a));
      prereq = earlier[0]?.research || CHAIN_START[part.research] || null;
    }
    RESEARCH.push(item({
      id: part.research,
      tab,
      year: part.year,
      name: part.name,
      spec: part.spec.replace(/^\d{4}: /, "").replace(/\.$/, ""),
      rd: 6,
      durationMs: 40_000,
      prereq,
    }));
    have.add(part.research);
  }
}

// Each project's real month.
for (const entry of RESEARCH) entry.month = RELEASE_MONTH[entry.id] || 6;

const byId = Object.fromEntries(RESEARCH.map((entry) => [entry.id, entry]));

// The Facilities parts a project opens.
export function researchUnlocks(id) {
  return PARTS.filter((part) => part.research === id);
}

export function researchItem(id) {
  return byId[id] || null;
}


// The tech timeline opens once the first project's year is reached.
export const FIRST_RESEARCH_ID = "tab-hollerith";

export const TECH_OPENS = Math.min(...RESEARCH.filter((entry) => !entry.soon).map((entry) => entry.year));

// The TECH page is reachable from the first era so the parts tree is
// always browsable. Individual projects still lock with researchLock
// until their year (the earliest open at TECH_OPENS).
export function techOpen(state) {
  return !!state;
}

export function readTechDone(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const id of raw) {
    if (typeof id === "string" && byId[id] && !out.includes(id)) out.push(id);
  }
  return out.slice(0, RESEARCH.length);
}

// Saves from before the merge kept server output in its own field. It's
// added to R&D points once, on load.
export function readResearchData(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(RD_CAP, n);
}

export function readTechJob(raw) {
  if (!raw || typeof raw !== "object") return null;
  const entry = byId[raw.id];
  if (!entry || entry.soon) return null;
  const durationMs = entry.durationMs;
  let progress = Number(raw.progressMs);
  if (!Number.isFinite(progress) || progress < 0) progress = 0;
  if (progress > durationMs) progress = durationMs;
  return { id: entry.id, progressMs: progress, durationMs };
}

export function serverOutput(state) {
  const counts = readFacilities(state?.facilities).servers || {};
  const { work, speed, storage, need } = serverStock(counts);
  // Each machine needs the disk of its day (part.diskGb) for full speed.
  const disk = need <= 0 ? 1 : storage >= need ? 1 : storage > 0 ? 0.5 : 0.25;
  // The PC build bench adds its own R&D.
  const bench = benchStock(readFacilities(state?.facilities).bench, { oc: state?.benchOc !== false }).perSecond;
  // The starter machine adds a flat rate: no power, cooling or disk needed.
  const starter = starterRate(counts);
  return { work, speed, storage, need, bench, starter, perSecond: work * speed * disk * RD_PER_WORK + bench + starter };
}

// While you're away the servers can only bank what their disks can hold:
// AWAY_BANK.baseHours of full output, plus AWAY_BANK.hoursPerSet for each
// full set of disk the newest machine needs (1 TB for a 2012 rack, 5 MB for a
// 1959 mainframe), up to AWAY_BANK.maxHours. The starter machine's punched
// cards just stack up (it banks all day, like the project timer); live play
// isn't capped either.
export const AWAY_BANK = { baseHours: 1, hoursPerSet: 1, maxHours: 8 };

export function awayBankHours(state) {
  const out = serverOutput(state);
  const sets = out.need > 0 ? out.storage / out.need : 0;
  return Math.min(AWAY_BANK.maxHours, AWAY_BANK.baseHours + AWAY_BANK.hoursPerSet * sets);
}

export function awayBankCap(state) {
  const out = serverOutput(state);
  return (out.perSecond - out.starter) * 3600 * awayBankHours(state) + out.starter * 24 * 3600;
}

export function researchSpeed(state, now = Date.now()) {
  const out = serverOutput(state);
  // The lab's clean room (a project that uses polysilicon) adds 25% for a while.
  const clean = now > 0 && now < (state?.lab?.cleanUntil || 0) ? 1.25 : 1;
  return Math.min(8, 1 + out.work * out.speed * 0.08) * clean;
}

export function researchRows(tab) {
  return RESEARCH.filter((entry) => entry.tab === tab).slice().sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));
}

// The in-game month. The company year comes from the newest era owned; its
// months then pass at a minute each of play (or faster when the run
// calendar is already past them). A save with no record has the whole year.
export const MONTH_MS = 60_000;
export function noteCompanyYear(state, now = Date.now()) {
  if (!state) return;
  const year = playerYear(state);
  const rec = state.companyYear;
  if (!rec || typeof rec !== "object" || !Number.isFinite(rec.at)) state.companyYear = { year, at: 0 };
  else if (rec.year !== year) state.companyYear = { year, at: now };
}
export function inGameMonth(state, now = Date.now()) {
  const year = playerYear(state);
  const rec = state?.companyYear;
  const since = rec && rec.year === year && Number.isFinite(rec.at) ? Math.max(0, now - rec.at) : Infinity;
  let month = 1 + Math.floor(since / MONTH_MS);
  const cal = calendarYearAt(state, now);
  if (cal != null && Math.floor(cal) > year) month = 12;
  else if (cal != null && Math.floor(cal) === year) month = Math.max(month, 1 + Math.floor((cal - year) * 12));
  return { year, month: Math.min(12, Math.max(1, month)) };
}

export function researchLock(state, entry, now = Date.now()) {
  if (!entry || entry.soon) return entry?.soon ? "Coming soon" : "Locked";
  const year = playerYear(state);
  if (year < entry.year) return `Requires ${entry.year}`;
  if (year === entry.year && (entry.month || 1) > 1 && inGameMonth(state, now).month < entry.month) return `Opens in ${monthName(entry.month)} ${entry.year}`;
  if (entry.prereq && !(state?.techDone || []).includes(entry.prereq)) {
    const prior = byId[entry.prereq];
    return prior ? `Research ${prior.name} first` : "Locked";
  }
  return null;
}

// A second project can run beside the first once the PC build bench has a
// CPU with four or more cores (and it's running).
// Since 0.0.31 only one project runs at a time (a save with two running
// lets both finish).
export function secondTechSlot() {
  return false;
}

export function techJobs(state) {
  return [state?.techJob, state?.techJob2].filter(Boolean);
}

// Late projects also need refined materials, taken when they start.
export const RESEARCH_MATERIALS = {
  "cpu-alder32": { polysilicon: 100 },
  "card-b200": { polysilicon: 400 },
  "mem-ddr5-128": { polysilicon: 200 },
  "net-ibhdr": { ofcopper: 100 },
  "net-nvswitch": { ofcopper: 150 },
  "srv-crayex": { ofcopper: 300 },
  "net-ac": { hpge: 40 },
  "net-be": { hpge: 100 },
};
export function researchMaterials(entry) {
  return RESEARCH_MATERIALS[entry?.id] || null;
}
export function hasResearchMaterials(state, entry) {
  const need = researchMaterials(entry);
  return !need || Object.entries(need).every(([key, n]) => (state?.supply?.[key] || 0) >= n);
}

export function canStartResearch(state, id) {
  const entry = byId[id];
  if (!entry || entry.soon) return false;
  if (techJobs(state).some((job) => job.id === id)) return false;
  if (state?.techJob && (state?.techJob2 || !secondTechSlot(state))) return false;
  if ((state?.techDone || []).includes(id)) return false;
  if (researchLock(state, entry)) return false;
  if (!hasResearchMaterials(state, entry)) return false;
  return (Number(state?.data) || 0) >= researchCost(entry);
}

// ---- Research queue (T3 item 23/24) ----
// One project runs at a time. Queue slots let more projects wait their turn;
// the next one starts by itself (and pays its R&D then) when the running one
// finishes. Slots are earned as Lab Projects in their era, never paid for
// with money.
export const QUEUE_SLOTS = [
  { id: "notebook", name: "LAB NOTEBOOK", year: 1951, cost: 6, blurb: "Write the next experiment down before this one ends: 1 research queue slot." },
  { id: "planning", name: "PROJECT PLANNING OFFICE", year: 1962, cost: 40, blurb: "A planning office schedules the lab's work: a 2nd queue slot." },
  { id: "gantt", name: "GANTT SOFTWARE", year: 1984, cost: 250, blurb: "Project charts on a desktop computer: a 3rd queue slot." },
  { id: "tracker", name: "ISSUE TRACKER", year: 1998, cost: 700, blurb: "Every task in one shared database: a 4th queue slot." },
];

export function queueSlots(state) {
  const n = Math.floor(Number(state?.lab?.queueSlots) || 0);
  return Math.max(0, Math.min(QUEUE_SLOTS.length, n));
}

export function readTechQueue(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const id of raw) {
    const entry = typeof id === "string" ? byId[id] : null;
    if (entry && !entry.soon && !out.includes(id)) out.push(id);
  }
  return out.slice(0, QUEUE_SLOTS.length);
}

export function techQueue(state) {
  return readTechQueue(state?.techQueue);
}

// The next slot to earn, with why it can't be bought yet (or ok).
export function queueSlotQuote(state) {
  const slot = QUEUE_SLOTS[queueSlots(state)];
  if (!slot) return { ok: false, slot: null, reason: "Every queue slot is open." };
  if (playerYear(state) < slot.year) return { ok: false, slot, reason: `Opens in ${slot.year}.` };
  if ((Number(state?.data) || 0) < slot.cost) return { ok: false, slot, reason: `Needs ${slot.cost} R&D points.` };
  return { ok: true, slot };
}

export function buyQueueSlot(state) {
  const quote = queueSlotQuote(state);
  if (!quote.ok) return quote;
  state.data = Math.max(0, (Number(state.data) || 0) - quote.slot.cost);
  state.lab = { ...(state.lab || {}), queueSlots: queueSlots(state) + 1 };
  pushHeadline(state, `rd-queue-${quote.slot.id}`, `${companyCaps(state)} R&D: ${quote.slot.name} OPENS A RESEARCH QUEUE SLOT`);
  return { ok: true, slot: quote.slot };
}

// The next away shift to earn (T4 item 42), with why it can't be bought yet.
export function awayShiftQuote(state) {
  const shift = AWAY_SHIFTS[awayShifts(state)];
  if (!shift) return { ok: false, shift: null, reason: "Every away shift is earned." };
  if (playerYear(state) < shift.year) return { ok: false, shift, reason: `Opens in ${shift.year}.` };
  if ((Number(state?.data) || 0) < shift.cost) return { ok: false, shift, reason: `Needs ${shift.cost} R&D points.` };
  return { ok: true, shift };
}

export function buyAwayShift(state) {
  const quote = awayShiftQuote(state);
  if (!quote.ok) return quote;
  state.data = Math.max(0, (Number(state.data) || 0) - quote.shift.cost);
  state.lab = { ...(state.lab || {}), awayShifts: awayShifts(state) + 1 };
  pushHeadline(state, `rd-away-${quote.shift.id}`, `${companyCaps(state)} R&D: ${quote.shift.name} KEEPS THE PLANT EARNING LONGER`);
  return { ok: true, shift: quote.shift };
}

// Why a project can't join the queue, or null. A project whose only lock is
// a prerequisite that is running or queued ahead of it may wait behind it.
export function queueBlock(state, id) {
  const entry = byId[id];
  if (!entry || entry.soon) return "Locked";
  if (!state?.techJob) return "Nothing is running: start it instead.";
  if ((state.techDone || []).includes(id)) return "Done";
  if (techJobs(state).some((job) => job.id === id)) return "Running";
  const queue = techQueue(state);
  if (queue.includes(id)) return "Queued";
  if (queue.length >= queueSlots(state)) return queueSlots(state) ? "Queue full" : "No queue slot yet";
  const ahead = new Set([...techJobs(state).map((job) => job.id), ...queue]);
  const lock = researchLock(state, entry);
  if (lock && !(entry.prereq && ahead.has(entry.prereq) && lock.startsWith("Research "))) return lock;
  return null;
}

export function canQueueResearch(state, id) {
  return queueBlock(state, id) === null;
}

export function queueResearch(state, id) {
  if (!canQueueResearch(state, id)) return { ok: false };
  state.techQueue = [...techQueue(state), id];
  return { ok: true };
}

export function unqueueResearch(state, id) {
  const queue = techQueue(state);
  if (!queue.includes(id)) return { ok: false };
  // Anything queued behind it that needed it goes too.
  const drop = new Set([id]);
  for (const qid of queue) if (byId[qid]?.prereq && drop.has(byId[qid].prereq)) drop.add(qid);
  state.techQueue = queue.filter((qid) => !drop.has(qid));
  return { ok: true };
}

// With nothing running, start the first queued project that can start. A
// project that can never start (done, gone) leaves the queue; one waiting on
// points or materials keeps its place and the queue waits.
export function startQueued(state) {
  if (!state || state.techJob) return false;
  let queue = techQueue(state);
  while (queue.length) {
    const id = queue[0];
    const entry = byId[id];
    if (!entry || entry.soon || (state.techDone || []).includes(id)) {
      queue = queue.slice(1);
      continue;
    }
    if (canStartResearch(state, id)) {
      state.techQueue = queue.slice(1);
      return startResearch(state, id).ok;
    }
    break;
  }
  state.techQueue = queue;
  return false;
}

// Why the head of the queue is waiting, or null.
export function queueWait(state) {
  if (state?.techJob) return null;
  const id = techQueue(state)[0];
  const entry = id && byId[id];
  if (!entry) return null;
  const lock = researchLock(state, entry);
  if (lock) return lock;
  if (!hasResearchMaterials(state, entry)) return "Waiting for materials";
  const cost = researchCost(entry);
  if ((Number(state.data) || 0) < cost) return `Waiting for ${cost.toLocaleString("en-US")} R&D`;
  return null;
}

// ---- Home PC vs server room (T3 item 57) ----
// Where a project's hardware is used: the PC Build Bench, the server room,
// or the mine and cluster plants. Projects that open nothing go by their tab.
const WHERE_LABEL = { bench: "Bench", servers: "Server room", mine: "Mine", cluster: "Training cluster" };
const ROOM_TABS = new Set(["servers"]);
const ROOM_IDS = new Set(["tab-hollerith", "pwr-switch", "net-imp"]);
export function researchWhere(entry) {
  if (!entry) return [];
  const fits = [...new Set(researchUnlocks(entry.id).flatMap((part) => part.fits || []))];
  if (fits.length) return ["bench", "servers", "mine", "cluster"].filter((id) => fits.includes(id));
  return ROOM_TABS.has(entry.tab) || ROOM_IDS.has(entry.id) ? ["servers"] : ["bench"];
}
export function researchWhereLabel(entry) {
  return researchWhere(entry).map((id) => WHERE_LABEL[id]).join(" + ");
}
// "home": the Home PC section; "room": the server room (and other plants).
export function researchSection(entry, section) {
  const where = researchWhere(entry);
  if (section === "home") return where.includes("bench");
  return where.some((id) => id !== "bench");
}

// Server tiers (T3 item 60): mainframes, then minicomputers and servers, and
// supercomputers as their own line.
export const SERVER_TIERS = [
  { id: "mainframe", label: "MAINFRAMES", note: "Valve and transistor machines that fill a room." },
  { id: "mini", label: "MINIS AND SERVERS", note: "Minicomputers, then rack and blade servers." },
  { id: "super", label: "SUPERCOMPUTERS", note: "The supercomputer line branches off the Maynard 11/20 minicomputer." },
];
export function serverTier(entry) {
  if (!entry || entry.tab !== "servers") return null;
  if (["srv-mark1", "srv-7090", "srv-360"].includes(entry.id)) return "mainframe";
  if (/^Chippewa/.test(entry.name) || entry.id === "srv-cm5") return "super";
  return "mini";
}

export function startResearch(state, id) {
  const entry = byId[id];
  if (!canStartResearch(state, id)) return { ok: false };
  state.data = Math.max(0, (Number(state.data) || 0) - researchCost(entry));
  const need = researchMaterials(entry);
  if (need) {
    const supply = { ...(state.supply || {}) };
    for (const [key, n] of Object.entries(need)) supply[key] = Math.max(0, (supply[key] || 0) - n);
    state.supply = supply;
  }
  const job = { id: entry.id, progressMs: 0, durationMs: entry.durationMs };
  if (!state.techJob) state.techJob = job;
  else state.techJob2 = job;
  pushHeadline(state, `rd-start-${entry.id}`, `${companyCaps(state)} R&D: ${entry.name.toUpperCase()} RESEARCH STARTS`);
  return { ok: true };
}

function finishResearch(state, id) {
  const entry = byId[id];
  if (!entry) return;
  const done = readTechDone(state.techDone);
  if (!done.includes(id)) done.push(id);
  state.techDone = done;
  if (state.techJob?.id === id) state.techJob = null;
  if (state.techJob2?.id === id) state.techJob2 = null;
  pushHeadline(state, `rd-done-${id}`, `${companyCaps(state)} R&D: ${entry.name.toUpperCase()} RESEARCH COMPLETE`);
}

// ms of real time. Servers make the bar move faster than the wall clock.
// rate: share of the plant's R&D output (OFFLINE_RATE while away). The
// project timer itself runs on the real clock, like upgrade installs.
// cap: the most R&D this call may add (awayBankCap for a stretch away).
export function advanceResearch(state, ms, rate = 1, cap = Infinity) {
  if (!state || !(ms > 0) || !Number.isFinite(ms)) return false;
  noteCompanyYear(state);
  const made = serverOutput(state).perSecond * (ms / 1000) * (rate > 0 ? rate : 0);
  const gain = Math.min(made, cap >= 0 ? cap : 0);
  if (gain > 0) state.data = Math.min(RD_CAP, (Number(state.data) || 0) + gain);
  let finished = false;
  for (const slot of ["techJob", "techJob2"]) {
    const job = readTechJob(state[slot]);
    state[slot] = job;
    if (!job) continue;
    job.progressMs = Math.min(job.durationMs, job.progressMs + ms * researchSpeed(state));
    if (job.progressMs >= job.durationMs - 0.001) {
      finishResearch(state, job.id);
      finished = true;
    }
  }
  // A second project only finishes into the first slot's place.
  if (!state.techJob && state.techJob2) {
    state.techJob = state.techJob2;
    state.techJob2 = null;
  }
  // The next queued project starts as soon as the lab is free.
  if (!state.techJob && startQueued(state)) finished = true;
  if (finished) return "done";
  return gain > 0 ? "gain" : false;
}

export function grantOwnedResearch(state) {
  const done = new Set(readTechDone(state?.techDone));
  const biz = state?.biz || [];
  for (const rowId of ["cpu", "gpu"]) {
    const index = BUSINESSES.findIndex((cfg) => cfg.id === rowId);
    const owned = index >= 0 ? (biz[index]?.owned || 0) : 0;
    for (const gen of GENERATIONS[rowId] || []) {
      if (owned >= gen.need && byId[gen.id]) done.add(gen.id);
    }
  }
  state.techDone = [...done];
}

// Prerequisites that are not themselves generation ids still block the chain.
// Owned-count grants only the generation ids, so a migrated 386 is done even
// if 286 was never a generation. Fill the gaps so the chain stays consistent.
export function fillResearchGaps(state) {
  const done = new Set(readTechDone(state?.techDone));
  let changed = true;
  while (changed) {
    changed = false;
    for (const entry of RESEARCH) {
      if (entry.soon || !done.has(entry.id) || !entry.prereq || done.has(entry.prereq)) continue;
      // Only back-fill a missing prerequisite when a later generation the
      // player already earned implies they passed that year.
      done.add(entry.prereq);
      changed = true;
    }
  }
  state.techDone = [...done];
}

// A save well past 1951 that never built a research server is stuck on the
// punch-card machine. Give it the Irwell Mark 1 project and one Mark 1 with
// its generator and air conditioner, free.
export function rescuePunchCardSave(state) {
  if (!state || playerYear(state) < 1965) return false;
  const facilities = readFacilities(state.facilities);
  const servers = facilities.servers || {};
  const hasServer = PARTS.some((part) => part.kind === "server" && (Number(servers[part.id]) || 0) > 0);
  if (hasServer) return false;
  const done = new Set(readTechDone(state.techDone));
  done.add(FIRST_RESEARCH_ID);
  done.add("srv-mark1");
  state.techDone = [...done];
  facilities.servers = { ...servers, mark1: 1, mgset: Math.max(1, Number(servers.mgset) || 0), roomac: Math.max(1, Number(servers.roomac) || 0) };
  state.facilities = facilities;
  pushHeadline(state, "rescue-mark1", "R&D: YOUR FIRST RESEARCH SERVER, AN IRWELL MARK 1, IS RUNNING");
  return true;
}
