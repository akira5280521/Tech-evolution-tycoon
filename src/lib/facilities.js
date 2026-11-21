// Two late-game plants. Pay is a share of current business income,
// capped at 5% for both together, so the plants never outgrow the businesses.
// While the game is minimized or closed they earn at the away rate
// (OFFLINE_RATE), like everything else.
// Bitbark is a game coin: nothing here is real currency, a wallet, or a link.
//
// speed = min(1, min(power watts, cooling watts) / GPU watts).
// A plant's power is its cards' work x speed x memory factor, in Raster 3060s.
// Its share of business income is STARTER_SHARE x sqrt(power): one full 3060
// is STARTER_SHARE, and each better card still adds, a little less each time,
// until both plants together reach SHARE_CAP.

import { BUSINESSES } from "./gameConfig.js";
import { playerYear } from "./eraYear.js";
import { BENCH_PARTS, BENCH_RD, price } from "./benchParts.js";

export const SHARE_CAP = 0.05;
export const STARTER_SHARE = 0.0009;
export const MAX_PART = 24;
const TWIN_ADDINS = ["a-voodoo2", "a-blaster2"];
const ROOM_UNITS = 60;
const REFERENCE_WORK = 13;
const MINE_RAM_GB = 16;

// The cluster trains the biggest model its memory allows. Frontier needs
// 512 GB of RAM (16 DDR4 sticks, or 8 DDR5); Foundation needs 2 TB, a full
// DDR5 board like an H100 server (32 x 64 GB), and about 1.4 TB on the cards,
// like an eight-card B200 server.
const TIERS = [
  { id: "foundation", name: "Foundation", vram: 1400, ram: 2048, mult: 3.5 },
  { id: "frontier", name: "Frontier", vram: 400, ram: 512, mult: 3 },
  { id: "mural", name: "Mural", vram: 80, ram: 128, mult: 2.2 },
  { id: "portrait", name: "Portrait", vram: 24, ram: 64, mult: 1.6 },
  { id: "sketch", name: "Sketch", vram: 12, ram: 32, mult: 1 },
];

// Memory boards. The mine runs on a mining motherboard: 2 slots of desktop
// DDR4, 32 GB at most (the 2017 B250 mining boards). The cluster runs on a
// dual-socket server board with 32 slots: DDR4 (EPYC "Rome" class, as in the
// 2020 A100 servers) until the first DDR5 stick, then a DDR5 board (as in the
// 2022 H100 servers). DDR4 and DDR5 sticks don't fit the same board, so the
// first DDR5 stick takes the DDR4 sticks out (sold back at half what they
// cost). When every slot is full, a bigger stick replaces the smallest one
// (also sold back at half); a stick no bigger than that can't be added.
export const BOARDS = {
  mine: { slots: 2, maxGb: 32, name: "DDR4 mining board (32 GB at most)" },
  cluster: { slots: 32, maxGb: Infinity, name: "server board" },
};
const SELL_BACK = 0.5;

export const FACILITIES = [
  {
    id: "mine",
    name: "BITBARK MINE",
    icon: "/icons/facilities/mine.png",
    blurb: "Graphics cards mint Bitbark, a game coin. It cannot be traded or taken out of the game.",
  },
  {
    id: "cluster",
    name: "TRAINING CLUSTER",
    icon: "/icons/facilities/cluster.png",
    blurb: "The cluster trains a model and bills the studio. A bigger model needs more memory.",
  },
  {
    id: "bench",
    name: "PC BUILD BENCH",
    icon: "/icons/facilities/bench.png",
    blurb: "One PC at a time, built from parts that fit: a board, a CPU for its socket, and memory for its slots. It makes R&D points.",
  },
  {
    id: "servers",
    name: "RESEARCH SERVERS",
    icon: "/icons/facilities/servers.png",
    blurb: "These racks make R&D points, the same points your eras make. Spend them on the Research tab and the tech timeline.",
  },
];

// Every part opens in its real year (the company's newest era must have
// reached it) and, past the first machine-room kit, once it's researched on
// the Tech page (part.research). Prices and output are game numbers; names
// are parodies with real model numbers, specs are the real hardware's.
//
// The research servers have two kinds of room. Machine-room computers
// (1951-1977) each need a motor-generator set and an air conditioner of their
// own (group "room", counted per machine). Rack servers (1989 on) draw watts
// from rack supplies and fans (group "rack"). Disks serve both: each machine
// needs the disk of its day (diskGb) for full speed.
export const PARTS = [
  // --- Mine and cluster ----------------------------------------------------
  { id: "raster1080", kind: "gpu", name: "Raster 1080", icon: "/icons/parts/raster1080.png", fits: ["mine", "cluster"], year: 2016, research: "card-1080", cost: 2_000_000_000, coef: 1.55, watts: 180, vram: 8, work: 9, spec: "8 GB GDDR5X, 180 W, 8.9 TFLOPS FP32. A 1080-class card." },
  { id: "tensorP100", kind: "gpu", name: "Tensor P100", icon: "/icons/parts/tensorP100.png", fits: ["cluster"], year: 2016, research: "card-p100", cost: 12_000_000_000, coef: 1.55, watts: 300, vram: 16, work: 21, spec: "16 GB HBM2, 300 W, 21 TFLOPS FP16. A P100 SXM2." },
  { id: "tensorV100", kind: "gpu", name: "Tensor V100", icon: "/icons/parts/tensorV100.png", fits: ["cluster"], year: 2017, research: "card-v100", cost: 80_000_000_000, coef: 1.55, watts: 300, vram: 16, work: 60, spec: "16 GB HBM2, 300 W, 125 TFLOPS on its tensor cores. A V100 SXM2." },
  { id: "raster3060", kind: "gpu", name: "Raster 3060", icon: "/icons/parts/raster3060.png", fits: ["mine", "cluster"], year: 2021, research: "card-3060", cost: 3_200_000_000, coef: 1.55, watts: 170, vram: 12, work: 13, spec: "12 GB GDDR6, 170 W, 12.7 TFLOPS FP32. A 3060-class card." },
  { id: "raster3090", kind: "gpu", name: "Raster 3090", icon: "/icons/parts/raster3090.png", fits: ["mine", "cluster"], year: 2020, research: "card-3090", cost: 28_000_000_000, coef: 1.55, watts: 350, vram: 24, work: 36, spec: "24 GB GDDR6X, 350 W, 35.6 TFLOPS FP32. A 3090-class card." },
  { id: "raster4090", kind: "gpu", name: "Raster 4090", icon: "/icons/parts/raster4090.png", fits: ["mine", "cluster"], year: 2022, research: "card-4090", cost: 90_000_000_000, coef: 1.55, watts: 450, vram: 24, work: 83, spec: "24 GB GDDR6X, 450 W, 82.6 TFLOPS FP32. A 4090-class card." },
  { id: "tensorA100", kind: "gpu", name: "Tensor A100", icon: "/icons/parts/tensorA100.png", fits: ["cluster"], year: 2020, research: "card-a100", cost: 220_000_000_000, coef: 1.55, watts: 400, vram: 80, work: 78, spec: "80 GB HBM2e, 400 W, 19.5 TFLOPS FP32 and 156 TFLOPS TF32. An A100 80 GB." },
  { id: "tensorH100", kind: "gpu", name: "Tensor H100", icon: "/icons/parts/tensorH100.png", fits: ["cluster"], year: 2022, research: "card-h100", cost: 700_000_000_000, coef: 1.55, watts: 700, vram: 80, work: 160, spec: "80 GB HBM3, 700 W, 67 TFLOPS FP32 and about 990 TFLOPS TF32. An H100 SXM." },
  { id: "tensorB200", kind: "gpu", name: "Tensor B200", icon: "/icons/parts/tensorB200.png", fits: ["cluster"], year: 2024, research: "card-b200", cost: 2_200_000_000_000, coef: 1.55, watts: 1000, vram: 192, work: 400, spec: "192 GB HBM3e, about 1,000 W, two dies on one package. A B200-class board." },
  { id: "ddr4_16", kind: "ram", gen: "DDR4", name: "16 GB DDR4-2400", icon: "/icons/parts/ddr4_32.png", fits: ["mine"], year: 2014, research: "mem-ddr4", cost: 150_000_000, coef: 1.4, gb: 16, spec: "16 GB DDR4-2400 desktop stick (unbuffered), PC4-19200." },
  { id: "ddr4_32", kind: "ram", gen: "DDR4", name: "32 GB DDR4-2400", icon: "/icons/parts/ddr4_32.png", fits: ["cluster"], year: 2014, research: "mem-ddr4", cost: 600_000_000, coef: 1.4, gb: 32, spec: "32 GB DDR4-2400 registered server stick (RDIMM), PC4-19200." },
  { id: "ddr5_64", kind: "ram", gen: "DDR5", name: "64 GB DDR5-4800", icon: "/icons/parts/ddr5_64.png", fits: ["cluster"], year: 2022, research: "mem-ddr5-64", cost: 4_000_000_000, coef: 1.4, gb: 64, spec: "64 GB DDR5-4800 registered server stick (RDIMM), PC5-38400." },
  { id: "ddr5_128", kind: "ram", gen: "DDR5", name: "128 GB DDR5-6400", icon: "/icons/parts/ddr5_128.png", fits: ["cluster"], year: 2024, research: "mem-ddr5-128", cost: 20_000_000_000, coef: 1.4, gb: 128, spec: "128 GB DDR5-6400 registered server stick (RDIMM), PC5-51200." },
  { id: "fans", kind: "cool", name: "Case fans", icon: "/icons/parts/fans.png", fits: ["mine", "cluster"], year: 1994, research: "cool-fan", cost: 200_000_000, coef: 1.35, cool: 250, spec: "Moves 250 W of heat." },
  { id: "tower", kind: "cool", name: "Tower cooler", icon: "/icons/parts/tower.png", fits: ["mine", "cluster"], year: 2001, research: "cool-pipe", cost: 1_500_000_000, coef: 1.35, cool: 350, spec: "A dual-tower air cooler, 350 W." },
  { id: "liquid", kind: "cool", name: "360 mm liquid", icon: "/icons/parts/liquid.png", fits: ["mine", "cluster"], year: 2008, research: "cool-liquid", cost: 6_000_000_000, coef: 1.35, cool: 700, spec: "A 360 mm liquid loop, 700 W." },
  { id: "immersion", kind: "cool", name: "Immersion tank", icon: "/icons/parts/immersion.png", fits: ["mine", "cluster"], year: 2022, research: "cool-immersion", cost: 40_000_000_000, coef: 1.35, cool: 2000, spec: "The whole rack sits in a dielectric bath. 2,000 W." },
  { id: "psu750", kind: "power", name: "750 W supply", icon: "/icons/parts/psu750.png", fits: ["mine", "cluster"], year: 2008, research: "pwr-gold", cost: 800_000_000, coef: 1.35, power: 750, spec: "750 W ATX supply, 80 Plus Gold." },
  { id: "psu1200", kind: "power", name: "1200 W supply", icon: "/icons/parts/psu1200.png", fits: ["mine", "cluster"], year: 2009, research: "pwr-plat", cost: 3_500_000_000, coef: 1.35, power: 1200, spec: "1,200 W ATX supply, 80 Plus Platinum." },
  { id: "psu1600", kind: "power", name: "1600 W supply", icon: "/icons/parts/psu1600.png", fits: ["mine", "cluster"], year: 2015, research: "pwr-titan", cost: 12_000_000_000, coef: 1.35, power: 1600, spec: "1,600 W, 80 Plus Titanium, for a rack of data-center cards." },

  // --- Research servers: machine room (one generator and one air conditioner each)
  { id: "mark1", kind: "server", group: "room", name: "Irwell Mark 1", icon: "/icons/parts/mark1.png", fits: ["servers"], year: 1951, research: null, cost: 30_000, coef: 5, watts: 1, work: 2, diskGb: 0.001, spec: "1951: about 4,000 valves, the first commercial computer to be installed." },
  { id: "ibm7090", kind: "server", group: "room", name: "Inland 7090", icon: "/icons/parts/ibm7090.png", fits: ["servers"], year: 1959, research: "srv-7090", cost: 300_000, coef: 5, watts: 1, work: 4, diskGb: 0.005, spec: "1959: more than 50,000 transistors, about six times the valve machine it replaced." },
  { id: "s360", kind: "server", group: "room", name: "Inland 360/50", icon: "/icons/parts/s360.png", fits: ["servers"], year: 1965, research: "srv-360", cost: 3_000_000, coef: 5, watts: 1, work: 6, diskGb: 0.00725, spec: "1965: one of a family of machines that all ran the same programs." },
  { id: "pdp1120", kind: "server", group: "room", name: "Maynard 11/20", icon: "/icons/parts/pdp1120.png", fits: ["servers"], year: 1970, research: "srv-1120", cost: 10_000_000, coef: 5, watts: 1, work: 8, diskGb: 0.1, spec: "1970: a 16-bit minicomputer in one cabinet." },
  { id: "vax780", kind: "server", group: "room", name: "Maynard 11/780", icon: "/icons/parts/vax780.png", fits: ["servers"], year: 1977, research: "srv-780", cost: 400_000_000, coef: 5, watts: 1, work: 24, diskGb: 0.1, spec: "1977: 32-bit; its speed became the yardstick called 1 MIPS." },
  // Supercomputers: machine-room computers with their own coolant. Each needs
  // two or more generators (watts here count generators) and coolers of its
  // kind: Freon, Fluorinert, or a chilled-water loop.
  { id: "cray1", kind: "server", group: "room", coolant: "freon", name: "Chippewa 1", icon: "/icons/parts/cray1.png", fits: ["servers"], year: 1976, research: "srv-cray1", cost: 1_000_000_000, coef: 5, watts: 2, work: 30, diskGb: 0.1, spec: "1976: 80 MHz, 160 MFLOPS, Freon-cooled, about 115 kW; the benches round it hide the power supplies." },
  { id: "xmp", kind: "server", group: "room", coolant: "freon", name: "Chippewa X-MP/48", icon: "/icons/parts/xmp.png", fits: ["servers"], year: 1982, research: "srv-xmp", cost: 5_000_000_000, coef: 5, watts: 2, work: 60, diskGb: 1, spec: "1982: up to four processors at 105 MHz, 200 MFLOPS each; about $15 million." },
  { id: "cray2", kind: "server", group: "room", coolant: "fluorinert", name: "Chippewa 2", icon: "/icons/parts/cray2.png", fits: ["servers"], year: 1985, research: "srv-cray2", cost: 20_000_000_000, coef: 5, watts: 2, work: 120, diskGb: 1, spec: "1985: four processors, 1.9 GFLOPS, its boards bathed in Fluorinert." },
  { id: "ymp", kind: "server", group: "room", coolant: "water", name: "Chippewa Y-MP", icon: "/icons/parts/ymp.png", fits: ["servers"], year: 1988, research: "srv-ymp", cost: 60_000_000_000, coef: 5, watts: 2, work: 200, diskGb: 2.52, spec: "1988: eight processors, 333 MFLOPS each, liquid-cooled." },
  { id: "c90", kind: "server", group: "room", coolant: "water", name: "Chippewa C90", icon: "/icons/parts/c90.png", fits: ["servers"], year: 1991, research: "srv-c90", cost: 200_000_000_000, coef: 5, watts: 3, work: 400, diskGb: 2.52, spec: "1991: sixteen processors, 16 GFLOPS at peak." },
  { id: "t3d", kind: "server", group: "room", coolant: "water", name: "Chippewa T3D", icon: "/icons/parts/t3d.png", fits: ["servers"], year: 1993, research: "srv-t3d", cost: 500_000_000_000, coef: 5, watts: 3, work: 600, diskGb: 2.52, spec: "1993: up to 2,048 small processors working together." },
  { id: "t90", kind: "server", group: "room", coolant: "water", name: "Chippewa T90", icon: "/icons/parts/t90.png", fits: ["servers"], year: 1995, research: "srv-t90", cost: 1_200_000_000_000, coef: 5, watts: 3, work: 900, diskGb: 2.52, spec: "1995: 32 vector processors, 58 GFLOPS at peak." },
  { id: "t3e", kind: "server", group: "room", coolant: "water", name: "Chippewa T3E", icon: "/icons/parts/t3e.png", fits: ["servers"], year: 1996, research: "srv-t3e", cost: 3_000_000_000_000, coef: 5, watts: 3, work: 1400, diskGb: 9, spec: "1996: up to 2,048 processors and 1.2 TFLOPS at peak." },
  { id: "xt3", kind: "server", group: "room", coolant: "water", name: "Chippewa XT3", icon: "/icons/parts/xt3.png", fits: ["servers"], year: 2004, research: "srv-xt3", cost: 15_000_000_000_000, coef: 5, watts: 4, work: 2500, diskGb: 9, spec: "2004: cabinets of Alder 64 chips on a custom network." },
  { id: "xt5", kind: "server", group: "room", coolant: "water", name: "Chippewa XT5", icon: "/icons/parts/xt5.png", fits: ["servers"], year: 2008, research: "srv-xt5", cost: 60_000_000_000_000, coef: 5, watts: 4, work: 5000, diskGb: 1000, spec: "2008: the line behind the first petaflop systems." },
  { id: "xc30", kind: "server", group: "room", coolant: "water", name: "Chippewa XC30", icon: "/icons/parts/xc30.png", fits: ["servers"], year: 2012, research: "srv-xc30", cost: 200_000_000_000_000, coef: 5, watts: 4, work: 9000, diskGb: 1000, spec: "2012: water-cooled cabinets on a new network." },
  { id: "crayex", kind: "server", group: "room", coolant: "water", name: "Chippewa EX", icon: "/icons/parts/crayex.png", fits: ["servers"], year: 2021, research: "srv-crayex", cost: 10_000_000_000_000_000, coef: 5, watts: 5, work: 20000, diskGb: 2000, spec: "2021: the line that ran the first exascale machine." },
  { id: "freon", kind: "cool", group: "room", coolant: "freon", name: "Freon cooling unit", icon: "/icons/parts/freon.png", fits: ["servers"], year: 1976, research: "srv-cray1", cost: 50_000_000, coef: 1.35, cool: 1, spec: "Liquid Freon through steel pipes in the frame, chilled below the machine." },
  { id: "fluorinert", kind: "cool", group: "room", coolant: "fluorinert", name: "Fluorinert exchanger", icon: "/icons/parts/fluorinert.png", fits: ["servers"], year: 1985, research: "srv-cray2", cost: 500_000_000, coef: 1.35, cool: 1, spec: "Pumps the inert liquid through the boards and chills it outside the box." },
  { id: "chiller", kind: "cool", group: "room", coolant: "water", name: "Chilled-water loop", icon: "/icons/parts/chiller.png", fits: ["servers"], year: 1988, research: "srv-ymp", cost: 2_000_000_000, coef: 1.35, cool: 1, spec: "Chilled water from the building plant, piped to the cabinets." },
  // Defunct makers' big machines, all air-cooled machine-room computers.
  { id: "cm5", kind: "server", group: "room", name: "Thinking Engines CM-5", icon: "/icons/parts/cm5.png", fits: ["servers"], year: 1991, research: "srv-cm5", cost: 150_000_000_000, coef: 5, watts: 2, work: 300, diskGb: 2.52, spec: "1991: black cabinets with walls of red lights, up to 1,024 processors." },
  { id: "alpha8400", kind: "server", group: "room", name: "Maynard AlphaServer 8400", icon: "/icons/parts/alpha8400.png", fits: ["servers"], year: 1995, research: "srv-alpha", cost: 800_000_000_000, coef: 5, watts: 2, work: 700, diskGb: 2.52, spec: "1995: up to twelve 64-bit Alpha chips, the fastest chips of their day." },
  { id: "origin2000", kind: "server", group: "room", name: "Silicon Pictures Origin 2000", icon: "/icons/parts/origin2000.png", fits: ["servers"], year: 1996, research: "srv-origin", cost: 2_000_000_000_000, coef: 5, watts: 2, work: 1100, diskGb: 9, spec: "1996: modules joined into one big shared-memory machine." },
  { id: "e10k", kind: "server", group: "room", name: "Sunrise Enterprise 10000", icon: "/icons/parts/e10k.png", fits: ["servers"], year: 1997, research: "srv-e10k", cost: 4_000_000_000_000, coef: 5, watts: 2, work: 1600, diskGb: 9, spec: "1997: up to 64 processors in one cabinet, the 'Starfire'." },
  { id: "mgset", kind: "power", group: "room", name: "Motor-generator set", icon: "/icons/parts/mgset.png", fits: ["servers"], year: 1951, research: null, cost: 10_000, coef: 1.35, power: 1, spec: "A motor turning a generator: steady power for one machine-room computer." },
  { id: "roomac", kind: "cool", group: "room", name: "Room air conditioner", icon: "/icons/parts/roomac.png", fits: ["servers"], year: 1951, research: null, cost: 10_000, coef: 1.35, cool: 1, spec: "Chilled air under the raised floor, enough for one machine-room computer." },

  // --- Research servers: racks (watts)
  { id: "towerT4", kind: "server", group: "rack", name: "Foundry Tower T4", icon: "/icons/parts/towerT4.png", fits: ["servers"], year: 1989, research: "srv-tower", cost: 4_000_000_000, coef: 5, watts: 300, work: 40, diskGb: 2.52, spec: "1989: a tower server with a 486 chip, 300 W." },
  { id: "rack2u", kind: "server", group: "rack", name: "Foundry 2U", icon: "/icons/parts/rack2u.png", fits: ["servers"], year: 1999, research: "srv-2u", cost: 30_000_000_000, coef: 5, watts: 300, work: 64, diskGb: 9, spec: "1999: two 500 MHz chips in a 2U box, 300 W." },
  { id: "bladeB2", kind: "server", group: "rack", name: "Foundry Blade B2", icon: "/icons/parts/bladeB2.png", fits: ["servers"], year: 2006, research: "srv-blade", cost: 200_000_000_000, coef: 5, watts: 250, work: 100, diskGb: 9, spec: "2006: two dual-core chips on a blade, 250 W." },
  { id: "rack1", kind: "server", group: "rack", name: "Foundry Rack R1", icon: "/icons/parts/rack1.png", fits: ["servers"], year: 2012, research: "srv-r1", cost: 1_000_000_000_000, coef: 5, watts: 350, work: 160, diskGb: 1000, spec: "2012: 1U, two 8-core chips, 350 W." },
  { id: "rack4", kind: "server", group: "rack", name: "Foundry Rack R4", icon: "/icons/parts/rack4.png", fits: ["servers"], year: 2012, research: "srv-r4", cost: 5_000_000_000_000, coef: 5, watts: 1000, work: 300, diskGb: 1000, spec: "2012: 4U, four 8-core chips, 1,000 W." },
  { id: "psuAT", kind: "power", group: "rack", name: "200 W AT supply", icon: "/icons/parts/psuAT.png", fits: ["servers"], year: 1984, research: "pwr-at", cost: 400_000_000, coef: 2, power: 200, spec: "A 200 W AT supply with a big mains switch." },
  { id: "psu400", kind: "power", group: "rack", name: "400 W supply", icon: "/icons/parts/psu400.png", fits: ["servers"], year: 1995, research: "pwr-atx", cost: 2_000_000_000, coef: 2, power: 450, spec: "400 W ATX supply for a single rack." },
  { id: "labfan", kind: "cool", group: "rack", name: "Rack fan", icon: "/icons/parts/labfan.png", fits: ["servers"], year: 1989, research: null, cost: 300_000_000, coef: 2, cool: 300, spec: "A 120 mm fan. Moves about 300 W of heat out of a rack." },

  // --- Networks: racks of research servers, and the training cluster's cards,
  // share work over a network. A slow one limits them (cap: work units).
  { id: "l-synoptix", kind: "link", group: "rack", name: "SynOptix 10BASE-T hub", icon: "/icons/parts/l-synoptix.png", fits: ["servers"], year: 1990, research: "net-10baset", cost: price(1990, 0.1), coef: 1, cap: 60, mbps: 10, spec: "1990: 10 Mbit/s Ethernet over phone-style cable, from a maker that merged away in 1994." },
  { id: "l-cat5000", kind: "link", group: "rack", name: "Sysco Catalyst 5000", icon: "/icons/parts/l-cat5000.png", fits: ["servers"], year: 1995, research: "net-100", cost: price(1995, 0.1), coef: 1, cap: 200, mbps: 100, spec: "1995: a switch for 100 Mbit/s Ethernet." },
  { id: "l-cat6500", kind: "link", group: "rack", name: "Sysco Catalyst 6500", icon: "/icons/parts/l-cat6500.png", fits: ["servers"], year: 1999, research: "net-gige", cost: price(1999, 0.1), coef: 1, cap: 800, mbps: 1000, spec: "1999: a gigabit chassis switch that ran for twenty years." },
  { id: "l-nexus5000", kind: "link", group: "rack", name: "Sysco Nexus 5000", icon: "/icons/parts/l-nexus5000.png", fits: ["servers"], year: 2008, research: "net-10g", cost: price(2008, 0.1), coef: 1, cap: 3000, mbps: 10000, spec: "2008: 10 Gbit/s Ethernet at every port." },
  { id: "l-is4", kind: "link", group: "rack", name: "Melanox InfiniScale IV", icon: "/icons/parts/l-is4.png", fits: ["servers"], year: 2008, research: "net-ibqdr", cost: price(2008, 0.14), coef: 1, cap: 5000, mbps: 40000, spec: "2008: 40 Gbit/s InfiniBand with very low delay, from a maker bought in 2020." },
  { id: "l-edr", kind: "link", name: "Melanox Switch-IB", icon: "/icons/parts/l-edr.png", fits: ["servers", "cluster"], year: 2014, research: "net-ibedr", cost: price(2014, 0.1), coef: 1, cap: 12000, mbps: 100000, spec: "2014: 100 Gbit/s InfiniBand." },
  { id: "l-nvlink", kind: "link", name: "Raster NVLink bridge", icon: "/icons/parts/l-nvlink.png", fits: ["cluster"], year: 2016, research: "net-nvlink", cost: price(2016, 0.05), coef: 1, cap: 4000, mbps: 160000, spec: "2016: cards talk to each other directly at 160 GB/s." },
  { id: "l-quantum", kind: "link", name: "Melanox Quantum", icon: "/icons/parts/l-quantum.png", fits: ["servers", "cluster"], year: 2018, research: "net-ibhdr", cost: price(2018, 0.1), coef: 1, cap: 40000, mbps: 200000, spec: "2018: 200 Gbit/s InfiniBand." },
  { id: "l-nvswitch", kind: "link", name: "Raster NVSwitch", icon: "/icons/parts/l-nvswitch.png", fits: ["cluster"], year: 2018, research: "net-nvswitch", cost: price(2018, 0.15), coef: 1, cap: 100000, mbps: 2400000, spec: "2018: every card in the box linked to every other." },

  // --- Research servers: storage
  { id: "tape", kind: "disk", name: "Tape drive", icon: "/icons/parts/tape.png", fits: ["servers"], year: 1951, research: null, cost: 5_000, coef: 2, gb: 0.001, spec: "Half-inch metal tape on a reel, about a megabyte a reel." },
  { id: "ramac", kind: "disk", name: "Inland 350 disk", icon: "/icons/parts/ramac.png", fits: ["servers"], year: 1956, research: "store-hdd", cost: 50_000, coef: 2, gb: 0.005, spec: "1956: fifty 24-inch platters, 5 million characters." },
  { id: "pack2311", kind: "disk", name: "Inland 2311 pack", icon: "/icons/parts/pack2311.png", fits: ["servers"], year: 1964, research: "store-pack", cost: 500_000, coef: 2, gb: 0.00725, spec: "1964: six platters you lift out by the handle, 7.25 MB." },
  { id: "pack3330", kind: "disk", name: "Inland 3330 pack", icon: "/icons/parts/pack3330.png", fits: ["servers"], year: 1970, research: "store-3330", cost: 3_000_000, coef: 2, gb: 0.1, spec: "1970: eleven platters, 100 MB a pack." },
  { id: "disk3380", kind: "disk", name: "Inland 3380 disk", icon: "/icons/parts/disk3380.png", fits: ["servers"], year: 1980, research: "store-3380", cost: 100_000_000, coef: 2, gb: 2.52, spec: "1980: the first gigabyte-class disk, 2.52 GB, the size of a fridge." },
  { id: "disk10k", kind: "disk", name: "9 GB SCSI disk", icon: "/icons/parts/disk10k.png", fits: ["servers"], year: 1996, research: "store-10k", cost: 1_000_000_000, coef: 2, gb: 9, spec: "1996: 9 GB at 10,000 rpm, the first drive to spin that fast." },
  { id: "hdd1t", kind: "disk", name: "1 TB disk", icon: "/icons/parts/hdd1t.png", fits: ["servers"], year: 2007, research: "store-1tb", cost: 10_000_000_000, coef: 2, gb: 1000, spec: "2007: 1 TB on five platters, 7200 rpm." },
  { id: "ssd2t", kind: "disk", name: "2 TB SSD", icon: "/icons/parts/ssd2t.png", fits: ["servers"], year: 2015, research: "store-ssd2t", cost: 100_000_000_000, coef: 2, gb: 2000, spec: "2015: 2 TB of NAND flash on SATA." },
  ...BENCH_PARTS,
];

const STARTER = {
  bench: [],
  mine: ["raster1080", "psu750", "fans", "ddr4_16"],
  cluster: ["raster1080", "psu750", "fans", "ddr4_32"],
  servers: ["mark1", "mgset", "roomac", "tape"],
};

// Research server parts are priced so each extra rack costs 5x the last: a
// player adds a rack or two per era instead of filling the plant at once, so
// R&D grows with the company.
const PART_NEWS = {
  raster3060: "RASTER 3060 BOLTED INTO A SIDE RACK",
  raster3090: "RASTER 3090 RUMORED ON THE PLANT FLOOR",
  raster4090: "RASTER 4090 DRAWS MORE POWER THAN THE BREAK ROOM",
  tensorA100: "TENSOR A100 TAKES THE OVERNIGHT TRAINING SHIFT",
  tensorH100: "TENSOR H100 ARRIVES UNDER ARMED ESCORT",
  ddr4_16: "DESKTOP DDR4 STICK SLOTTED INTO THE MINING BOARD",
  ddr4_32: "DDR4 SERVER STICKS REACH THE RACK",
  ddr5_64: "DDR5 STICKS CLEAR THE LOADING DOCK",
  raster1080: "RASTER 1080 BOLTED INTO A SIDE RACK",
  tensorP100: "TENSOR P100 STACKS ITS MEMORY ON THE CHIP",
  tensorV100: "TENSOR V100 BRINGS THE FIRST TENSOR CORES",
  mark1: "IRWELL MARK 1 WARMS ITS VALVES FOR THE LAB",
  ibm7090: "INLAND 7090 SWAPS VALVES FOR TRANSISTORS",
  s360: "INLAND 360 JOINS THE MACHINE ROOM",
  pdp1120: "MAYNARD 11/20 WHEELED INTO THE LAB",
  vax780: "MAYNARD 11/780 SETS THE MIPS YARDSTICK",
  towerT4: "FOUNDRY TOWER T4 STANDS UNDER A DESK",
  rack2u: "FOUNDRY 2U SLIDES INTO THE RACK",
  bladeB2: "FOUNDRY BLADES FILL A CHASSIS",
  tape: "TAPE REELS SPIN IN THE MACHINE ROOM",
  ramac: "A DISK THE SIZE OF TWO FRIDGES ARRIVES",
  disk3380: "A GIGABYTE DISK NEEDS A FORKLIFT",
  fans: "CASE FANS AUDIBLE FROM THE CAR PARK",
  labfan: "A LAB FAN STARTS UNDER THE RESEARCH RACK",
  tower: "TOWER COOLER ENDS THE THERMAL THROTTLE RUMOR",
  liquid: "360 MM LOOP PLUMBED BESIDE THE CARDS",
  psu750: "750 W SUPPLY LANDED FOR THE SIDE PLANT",
  psu1200: "1200 W SUPPLY QUIETS THE BREAKER TRIPS",
  rack1: "FOUNDRY RACK R1 TAKES THE RESEARCH SHIFT",
  rack4: "FOUNDRY RACK R4 DOUBLES THE LAB FLOOR",
  psu400: "400 W SUPPLY LANDS UNDER THE RESEARCH RACK",
  hdd1t: "A 1 TB DISK IS RACKED FOR THE LAB",
  ssd2t: "A 2 TB SSD REPLACES THE LAB'S SPINNING DISK",
};

const byId = Object.fromEntries(PARTS.map((part) => [part.id, part]));

export function blankFacilities() {
  return { mine: {}, cluster: {}, servers: {}, bench: {} };
}

// (Saves are read with up to 32 of a stick anywhere, so migrateFacilities can
// refund what's over a board's slots.)
// The most of one part a plant can hold: a memory stick is limited by the
// board's slots (32 on a server board), anything else by MAX_PART.
export function partMax(part, facilityId) {
  if (part?.kind === "ram") return facilityId === "mine" ? 2 : 32;
  // One generator and one air conditioner per machine-room computer, and
  // there can be more machines than 24.
  if (part?.group === "room" && (part.kind === "power" || part.kind === "cool")) return ROOM_UNITS;
  // One board and one CPU on the bench; sticks are limited by the board.
  if (TWIN_ADDINS.includes(part?.id)) return 2;
  if (part?.kind === "link") return 1;
  if (part?.kind === "board" || part?.kind === "cpu") return 1;
  if (part?.kind === "stick") return 8;
  return MAX_PART;
}

export function readFacilities(raw) {
  const out = blankFacilities();
  if (!raw || typeof raw !== "object") return out;
  for (const facilityId of Object.keys(out)) {
    const src = raw[facilityId];
    if (!src || typeof src !== "object") continue;
    for (const part of PARTS) {
      if (!part.fits.includes(facilityId)) continue;
      const n = Math.floor(Number(src[part.id]));
      if (Number.isFinite(n) && n > 0) out[facilityId][part.id] = Math.min(partMax(part, "cluster"), n);
    }
  }
  return out;
}

// Parts a save holds in a plant they no longer fit (the 64 and 128 GB sticks
// left the mine in 0.0.28, where they never added anything). Refund what
// they cost so nobody loses money to the change.
export function unfitRefund(raw) {
  let refund = 0;
  if (!raw || typeof raw !== "object") return 0;
  for (const facilityId of Object.keys(blankFacilities())) {
    const src = raw[facilityId];
    if (!src || typeof src !== "object") continue;
    for (const part of PARTS) {
      if (part.fits.includes(facilityId)) continue;
      const n = Math.min(partMax(part, "cluster"), Math.floor(Number(src[part.id])) || 0);
      for (let i = 0; i < n; i++) refund += partCost(part, i);
    }
  }
  return Number.isFinite(refund) ? refund : 0;
}

export function readNews(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const row of raw) {
    if (!row || typeof row.id !== "string" || typeof row.text !== "string") continue;
    const id = row.id.slice(0, 80);
    const text = row.text.slice(0, 140);
    if (!id || !text || out.some((entry) => entry.id === id)) continue;
    out.push({ id, text });
  }
  return out.slice(-40);
}

export function recentNews(state, count = 3) {
  return readNews(state?.news).slice(-count).reverse().map((entry) => entry.text);
}

// One line per id. Repeats are dropped, and only the latest few stay on the ticker.
export function pushHeadline(state, id, text) {
  if (!state || typeof id !== "string" || typeof text !== "string") return false;
  const news = readNews(state.news);
  if (news.some((entry) => entry.id === id)) return false;
  news.push({ id: id.slice(0, 80), text: text.slice(0, 140) });
  state.news = news.slice(-40);
  return true;
}

function ownedId(state, id) {
  const index = BUSINESSES.findIndex((cfg) => cfg.id === id);
  return index >= 0 ? (state?.biz?.[index]?.owned || 0) : 0;
}

export function facilityUnlocked(state, facilityId) {
  if (facilityId === "servers") return ownedId(state, "mainframes") >= 1;
  if (facilityId === "bench") return ownedId(state, "homepc") >= 1;
  return ownedId(state, "ai") >= 1;
}

// The Facilities screen opens with its first plant (the research servers).
export function anyFacilityOpen(state) {
  return facilityUnlocked(state, "servers") || facilityUnlocked(state, "bench") || facilityUnlocked(state, "mine");
}

export function facilitiesOpen(state) {
  return facilityUnlocked(state, "mine");
}

export function partCost(part, owned) {
  const n = Math.max(0, Math.floor(Number(owned) || 0));
  const cost = part.cost * Math.pow(part.coef, n);
  return Number.isFinite(cost) ? Math.round(cost) : Infinity;
}

function countsOf(state, facilityId) {
  return state?.facilities?.[facilityId] || {};
}

function stock(counts, facilityId) {
  let watts = 0;
  let power = 0;
  let cool = 0;
  let vram = 0;
  let ram = 0;
  let work = 0;
  let gpus = 0;
  let storage = 0;
  let need = 0;
  let linkCap = 0;
  const groups = { room: { watts: 0, power: 0, cool: 0, work: 0, by: {} }, rack: { watts: 0, power: 0, cool: 0, work: 0, by: {} } };
  for (const part of PARTS) {
    if (!part.fits.includes(facilityId)) continue;
    const n = counts?.[part.id] || 0;
    if (n <= 0) continue;
    const g = groups[part.group] || null;
    const coolant = part.coolant || "air";
    if (part.kind === "gpu" || part.kind === "server") {
      watts += part.watts * n;
      vram += (part.vram || 0) * n;
      work += part.work * n;
      gpus += n;
      if (g) {
        g.watts += part.watts * n;
        g.work += part.work * n;
        g.by[coolant] = g.by[coolant] || { watts: 0, cool: 0, work: 0 };
        g.by[coolant].watts += part.watts * n;
        g.by[coolant].work += part.work * n;
      }
      if (part.diskGb) need = Math.max(need, part.diskGb);
    } else if (part.kind === "power") {
      power += part.power * n;
      if (g) g.power += part.power * n;
    } else if (part.kind === "cool") {
      cool += part.cool * n;
      if (g) {
        g.cool += part.cool * n;
        g.by[coolant] = g.by[coolant] || { watts: 0, cool: 0, work: 0 };
        g.by[coolant].cool += part.cool * n;
      }
    } else if (part.kind === "ram") ram += part.gb * n;
    else if (part.kind === "disk") storage += part.gb * n;
    else if (part.kind === "link") linkCap = Math.max(linkCap, part.cap);
  }
  let speed = watts <= 0 ? 0 : Math.min(1, Math.min(power, cool) / watts);
  let netFactor = 1;
  let rawSpeed = speed;
  if (facilityId === "servers") {
    // Each kind of room runs on its own power and cooling.
    let running = 0;
    // Power is shared within a room; each coolant cools only its own machines.
    for (const g of Object.values(groups)) {
      const powered = g.watts <= 0 ? 0 : Math.min(1, g.power / g.watts);
      let groupRunning = 0;
      for (const c of Object.values(g.by)) {
        if (c.watts <= 0) continue;
        groupRunning += c.work * Math.min(powered, Math.min(1, c.cool / c.watts));
      }
      g.speed = g.work > 0 ? groupRunning / g.work : 0;
      running += groupRunning;
    }
    rawSpeed = work > 0 ? running / work : 0;
    // Racks share work over the network; without one each runs alone.
    const rack = groups.rack;
    if (rack.work > 0) {
      netFactor = 0.5 + 0.5 * Math.min(1, linkCap / rack.work);
      running -= rack.work * rack.speed * (1 - netFactor);
    }
    speed = work > 0 ? running / work : 0;
  } else if (facilityId === "cluster" && gpus > 1) {
    rawSpeed = speed;
    // Training across cards needs them linked.
    netFactor = 0.85 + 0.15 * Math.min(1, linkCap / work);
    speed *= netFactor;
  }
  return { watts, power, cool, vram, ram, work, gpus, speed, rawSpeed, storage, need, groups, linkCap, netFactor };
}

// What the plant is short of first: power or cooling (for the servers, per
// kind of room), then memory, then disk. { kind, group } or null.
function shortOf(facilityId, stocked) {
  if (facilityId === "bench") return null;
  if (facilityId === "servers") {
    for (const [group, g] of Object.entries(stocked.groups)) {
      if (g.watts <= 0) continue;
      if (g.power < g.watts) return { kind: "power", group };
      for (const [coolant, c] of Object.entries(g.by)) {
        if (c.watts > 0 && c.cool < c.watts) return { kind: "cool", group, coolant };
      }
    }
    if (stocked.netFactor < 0.999) return { kind: "link", group: null, need: stocked.groups.rack.work };
    if (stocked.need > 0 && stocked.storage < stocked.need) return { kind: "disk", group: null };
    return null;
  }
  if (stocked.power < stocked.watts) return { kind: "power", group: null };
  if (stocked.cool < stocked.watts) return { kind: "cool", group: null };
  if (memoryFactor(facilityId, stocked).limit === "Needs more RAM") return { kind: "ram", group: null };
  if (stocked.netFactor < 0.999) return { kind: "link", group: null, need: stocked.work };
  return null;
}

// What a plant needs next to run at full speed, and the cheapest open part
// that fills it (for the simulation and hints).
export function plantShort(state, facilityId) {
  const counts = countsOf(state, facilityId);
  const short = shortOf(facilityId, stock(counts, facilityId));
  if (!short) return null;
  const pick = cheapest(facilityId, short.kind, counts, openParts(state), short.group, short.coolant);
  return { ...short, part: pick?.part || null, cost: pick?.cost ?? null };
}

// The research servers' stock, for research.js.
export function serverStock(counts) {
  return stock(counts || {}, "servers");
}

function memoryFactor(facilityId, stocked) {
  if (facilityId === "servers") return { factor: 1, limit: null };
  if (facilityId === "mine") {
    if (stocked.ram >= MINE_RAM_GB) return { factor: 1, limit: null };
    return { factor: 0.25, limit: "Needs more RAM" };
  }
  const fit = TIERS.find((tier) => stocked.vram >= tier.vram && stocked.ram >= tier.ram);
  if (fit) return { factor: fit.mult, limit: null, tier: fit.name };
  return { factor: 0.2, limit: stocked.ram < 32 ? "Needs more RAM" : "Needs more VRAM", tier: null };
}

// RAM for the next model up that the cards' memory already allows, or null.
function nextTierRam(stocked) {
  const fit = TIERS.find((tier) => stocked.vram >= tier.vram && stocked.ram >= tier.ram);
  const higher = TIERS.filter((tier) => (!fit || tier.mult > fit.mult) && stocked.vram >= tier.vram && stocked.ram < tier.ram);
  if (!higher.length) return null;
  return Math.min(...higher.map((tier) => tier.ram));
}

function hardwareLimit(stocked, mem) {
  const powerFactor = stocked.gpus <= 0 ? 0 : stocked.rawSpeed ?? stocked.speed;
  const memFactor = mem.factor >= 1 ? 1 : mem.factor;
  if (stocked.gpus <= 0) return "Add a GPU";
  if (powerFactor < 0.999 && powerFactor <= memFactor) {
    if (stocked.groups && stocked.need !== undefined && Object.values(stocked.groups).some((g) => g.watts > 0 && g.speed < 0.999)) {
      const g = Object.values(stocked.groups).find((x) => x.watts > 0 && x.speed < 0.999);
      return g.power <= g.cool ? "Power limited" : "Cooling limited";
    }
    return stocked.power <= stocked.cool ? "Power limited" : "Cooling limited";
  }
  if (mem.limit && memFactor < 0.999) return mem.limit;
  if (stocked.netFactor < 0.999) return "Network-limited";
  return "Running full";
}

function rowOf(facilityId, counts) {
  const stocked = stock(counts, facilityId);
  const mem = memoryFactor(facilityId, stocked);
  const running = stocked.gpus > 0 && stocked.work > 0 && stocked.speed > 0;
  const power = running ? (stocked.work * stocked.speed * mem.factor) / REFERENCE_WORK : 0;
  const share = running ? STARTER_SHARE * Math.sqrt(power) : 0;
  return {
    share,
    limit: hardwareLimit(stocked, mem),
    tier: mem.tier || null,
    speed: stocked.speed,
    watts: stocked.watts,
    power: stocked.power,
    cool: stocked.cool,
    vram: stocked.vram,
    ram: stocked.ram,
    gpus: stocked.gpus,
    board: boardOf(facilityId, counts),
    groups: stocked.groups,
    linkCap: stocked.linkCap,
    netFactor: stocked.netFactor,
    storage: stocked.storage,
    need: stocked.need,
  };
}

export function facilityReport(state, businessPerSecond) {
  const biz = Number.isFinite(businessPerSecond) && businessPerSecond > 0 ? businessPerSecond : 0;
  const mine = rowOf("mine", countsOf(state, "mine"));
  const cluster = rowOf("cluster", countsOf(state, "cluster"));
  const servers = rowOf("servers", countsOf(state, "servers"));
  const uncapped = mine.share + cluster.share;
  const share = Math.min(SHARE_CAP, uncapped);
  const scale = uncapped > 0 ? share / uncapped : 0;
  const capped = uncapped > share + 0.0001;
  const dress = (row) => ({
    ...row,
    share: row.share * scale,
    perSecond: row.share * scale * biz,
    limit: capped && row.limit === "Running full" ? "At the income share cap" : row.limit,
  });
  return {
    perSecond: share * biz,
    share,
    capped,
    mine: dress(mine),
    cluster: dress(cluster),
    servers: { ...servers, share: 0, perSecond: 0 },
    bench: { ...benchStock(countsOf(state, "bench"), { oc: state?.benchOc !== false }), limit: benchLimit(countsOf(state, "bench"), { oc: state?.benchOc !== false }), share: 0 },
  };
}

function cheapest(facilityId, kind, counts, open = null, group = null, coolant = null) {
  if (kind === "disk") return diskFor(facilityId, counts, open);
  if (kind === "link") return linkFor(facilityId, counts, open);
  let best = null;
  for (const part of PARTS) {
    if (part.soon || part.kind !== kind || !part.fits.includes(facilityId)) continue;
    if (open && !open.has(part.id)) continue;
    if (group && part.group !== group) continue;
    if (coolant && (part.coolant || "air") !== coolant) continue;
    const owned = counts[part.id] || 0;
    if (owned >= partMax(part, facilityId)) continue;
    if (fitPart(counts, facilityId, part.id).reason) continue;
    const cost = partCost(part, owned);
    if (!best || cost < best.cost) best = { part, cost };
  }
  return best;
}

// The cheapest disk that covers what the newest machine still lacks, or the
// biggest one when none covers it alone.
function diskFor(facilityId, counts, open) {
  const stocked = stock(counts, facilityId);
  const gap = Math.max(0, stocked.need - stocked.storage);
  let best = null;
  let biggest = null;
  for (const part of PARTS) {
    if (part.soon || part.kind !== "disk" || !part.fits.includes(facilityId)) continue;
    if (open && !open.has(part.id)) continue;
    const owned = counts[part.id] || 0;
    if (owned >= partMax(part, facilityId)) continue;
    const cost = partCost(part, owned);
    if (part.gb >= gap && (!best || cost < best.cost)) best = { part, cost };
    if (!biggest || part.gb > biggest.part.gb) biggest = { part, cost };
  }
  return best || biggest;
}

// The cheapest network that carries all of the plant's work, or the biggest.
function linkFor(facilityId, counts, open) {
  const stocked = stock(counts, facilityId);
  const need = facilityId === "servers" ? stocked.groups.rack.work : stocked.work;
  let best = null;
  let biggest = null;
  for (const part of PARTS) {
    if (part.kind !== "link" || !part.fits.includes(facilityId) || (open && !open.has(part.id))) continue;
    if ((counts[part.id] || 0) > 0 || part.cap <= stocked.linkCap) continue;
    const cost = partCost(part, 0);
    if (part.cap >= need && (!best || cost < best.cost)) best = { part, cost };
    if (!biggest || part.cap > biggest.part.cap) biggest = { part, cost };
  }
  return best || biggest;
}

function hintFor(facilityId, counts, limit, open) {
  const short = shortOf(facilityId, stock(counts, facilityId));
  if (short && (limit === "Power limited" || limit === "Cooling limited" || limit === "Needs more RAM" || short.kind === "disk")) {
    return cheapest(facilityId, short.kind, counts, open, short.group, short.coolant);
  }
  const kind = limit === "Needs more VRAM" || limit === "Add a GPU" || limit === "Running full" ? (facilityId === "servers" ? "server" : "gpu") : null;
  if (!kind) return null;
  return cheapest(facilityId, kind, counts, open);
}

function starterNext(facilityId, counts, open) {
  for (const id of STARTER[facilityId]) {
    if ((counts[id] || 0) > 0) continue;
    const part = byId[id];
    if (open && !open.has(id)) return null;
    return { facilityId, partId: id, name: part.name, cost: partCost(part, 0), limit: "starter" };
  }
  return null;
}

// --- Which parts are open --------------------------------------------------

// A part opens once the company has reached its year and, for most parts, once
// it's researched on the Tech page. Research stays done across prestiges; the
// year has to be reached again each run.
export function diskSize(gb) {
  if (!(gb > 0)) return "0 MB";
  if (gb >= 1000) return `${Number((gb / 1000).toFixed(2))} TB`;
  if (gb >= 1) return `${Number(gb.toFixed(2))} GB`;
  return `${Number((gb * 1000).toFixed(2))} MB`;
}

// A part out of production: its successor has been researched. One already
// owned keeps working; it just can't be bought any more.
export function partRetired(state, part) {
  return !!part?.retiredBy && (state?.techDone || []).includes(part.retiredBy);
}

export function partOpen(state, part) {
  if (!part || part.soon) return false;
  if (playerYear(state) < (part.year || 0)) return false;
  return !part.research || (state?.techDone || []).includes(part.research);
}

// Why a part is still closed, or null when it's open.
export function partLock(state, part, researchName) {
  if (!part) return "Locked";
  if (playerYear(state) < (part.year || 0)) return `Requires ${part.year}`;
  if (part.research && !(state?.techDone || []).includes(part.research)) return `Research ${researchName || part.name} on the Tech page`;
  if (partRetired(state, part)) return part.kind === "accel" ? "Out of production: combined 2D and 3D cards replaced it" : ["b-915btx", "k-btx"].includes(part.id) ? "Out of production: makers went back to ATX" : part.id === "x-physx" ? "Out of production: graphics cards took over physics" : "Out of production: it lost to its rival";
  return null;
}

let openCache = { key: null, set: null };
export function openParts(state) {
  const done = state?.techDone || [];
  const key = `${playerYear(state)}|${done.length}|${done[done.length - 1] || ""}`;
  if (openCache.key === key) return openCache.set;
  const set = new Set(PARTS.filter((part) => partOpen(state, part) && !partRetired(state, part)).map((part) => part.id));
  openCache = { key, set };
  return set;
}

// --- Memory boards ---------------------------------------------------------

const RAM_PARTS = PARTS.filter((p) => p.kind === "ram");

// What a plant's board holds now: slots used, total GB, DDR generation.
export function boardOf(facilityId, counts) {
  const board = BOARDS[facilityId];
  if (!board) return null;
  let used = 0;
  let gb = 0;
  let ddr5 = false;
  for (const part of RAM_PARTS) {
    const n = counts?.[part.id] || 0;
    if (!n || !part.fits.includes(facilityId)) continue;
    used += n;
    gb += n * part.gb;
    if (part.gen === "DDR5") ddr5 = true;
  }
  const gen = ddr5 ? "DDR5" : "DDR4";
  const name = facilityId === "cluster" ? `${gen} ${board.name}` : board.name;
  return { slots: board.slots, used, gb, gen, maxGb: board.maxGb, name };
}

// Half of what the last sticks bought (from count `from` down to `to`) cost.
function soldBack(part, from, to) {
  let total = 0;
  for (let i = to; i < from; i++) total += partCost(part, i);
  return total * SELL_BACK;
}

// Add one part under the board rules. Returns { counts, refund, note } or
// { reason } when it can't go in.
export function fitPart(counts, facilityId, partId) {
  const part = byId[partId];
  const owned = counts?.[partId] || 0;
  if (!part) return { reason: "Unknown part." };
  if (facilityId === "bench") return fitBench(counts || {}, part);
  if (part.kind !== "ram" && owned >= partMax(part, facilityId)) return { reason: "At the most you can own." };
  const next = { ...counts, [partId]: owned + 1 };
  const board = BOARDS[facilityId];
  if (part.kind !== "ram" || !board) return { counts: next, refund: 0, note: null };
  let refund = 0;
  const notes = [];
  const otherGen = RAM_PARTS.filter((p) => p.gen !== part.gen && (counts?.[p.id] || 0) > 0);
  if (otherGen.length) {
    if (part.gen === "DDR4") return { reason: "This board takes DDR5 now." };
    let sticks = 0;
    for (const other of otherGen) {
      refund += soldBack(other, counts[other.id], 0);
      sticks += counts[other.id];
      delete next[other.id];
    }
    notes.push(`switches to a DDR5 board (${sticks} DDR4 stick${sticks === 1 ? "" : "s"} sold back)`);
  }
  const used = RAM_PARTS.reduce((sum, p) => sum + (next[p.id] || 0), 0);
  if (used > board.slots) {
    const smallest = RAM_PARTS.filter((p) => (next[p.id] || 0) > (p.id === partId ? 1 : 0)).sort((a, b) => a.gb - b.gb)[0];
    if (!smallest || smallest.gb >= part.gb) return { reason: `All ${board.slots} memory slots are full.` };
    refund += soldBack(smallest, next[smallest.id], next[smallest.id] - 1);
    next[smallest.id] -= 1;
    if (!next[smallest.id]) delete next[smallest.id];
    notes.push(`replaces a ${smallest.gb} GB stick`);
  }
  const gb = RAM_PARTS.reduce((sum, p) => sum + (next[p.id] || 0) * p.gb, 0);
  if (gb > board.maxGb) return { reason: `The board takes ${board.maxGb} GB at most.` };
  return { counts: next, refund, note: notes.join("; ") || null };
}

// --- The PC build bench ----------------------------------------------------

export const SOCKET_NAMES = {
  8080: "8080", 6502: "6502", z80: "Z80", 8088: "8088", 286: "286", 386: "386", 486: "486",
  socket4: "Socket 4", nx586: "Nx586", socket7: "Socket 7", socket8: "Socket 8", slot1: "Slot 1", slota: "Slot A",
  socketa: "Socket A", s478: "Socket 478", s939: "Socket 939", lga775: "LGA775", am2: "AM2+",
  lga1366: "LGA1366", lga1155: "LGA1155", am3: "AM3+", lga1150: "LGA1150", lga1151: "LGA1151",
  am4: "AM4", tr4: "TR4", lga1156: "LGA1156", lga1151v2: "LGA1151 (300-series)", lga1700: "LGA1700", am5: "AM5", lga1851: "LGA1851",
};
export const MEM_NAMES = {
  dip: "memory-chip", simm30: "30-pin SIMM", simm72: "72-pin SIMM", sdram: "SDRAM DIMM",
  ddr: "DDR", ddr2: "DDR2", ddr3: "DDR3", ddr4: "DDR4", ddr5: "DDR5",
};

// Whether a CPU works in a board: the socket, the chipset's CPU list, and,
// for a CPU with its own memory controller, the board's memory type.
export function cpuFitsBoard(chip, board) {
  if (!chip || !board) return "none";
  if (!(chip.sockets || [chip.socket]).includes(board.socket)) return "socket";
  if (!(board.supports || []).includes(chip.gen)) return "chipset";
  if (chip.memSpeed && chip.memSpeed[board.mem] == null) return "memory";
  return null;
}

function cpuMisfit(chip, board) {
  const why = cpuFitsBoard(chip, board);
  if (!why) return null;
  if (why === "socket") return `Needs a board with a ${SOCKET_NAMES[chip.socket]} socket; this board has ${SOCKET_NAMES[board.socket]}.`;
  if (why === "chipset") return `The ${board.name}'s chipset doesn't support this CPU.`;
  return `This CPU can't use the ${MEM_NAMES[board.mem]} memory on this board.`;
}

function benchHas(counts, kind) {
  return PARTS.filter((p) => p.kind === kind && p.fits.includes("bench") && (counts[p.id] || 0) > 0);
}

// The bench's rules, as on real PCs: a CPU goes only in a board with its
// socket, memory only in a board with its kind of slot. A new board takes out
// the CPU and memory that don't fit it, and a new CPU replaces the old one;
// whatever comes out is sold back at half what it cost. When every memory
// slot is full, a bigger stick replaces the smallest.
function fitBench(counts, part) {
  const next = { ...counts };
  let refund = 0;
  const notes = [];
  const takeOut = (p, why) => {
    const n = next[p.id] || 0;
    if (!n) return;
    refund += soldBack(p, n, 0);
    delete next[p.id];
    if (why) notes.push(why);
  };
  const [boardNow] = benchHas(counts, "board");
  if (part.kind === "board") {
    if ((counts[part.id] || 0) > 0) return { reason: "Already on the bench." };
    if (boardNow) takeOut(boardNow, `replaces the ${boardNow.name}`);
    for (const c of benchHas(counts, "cpu")) if (cpuFitsBoard(c, part)) takeOut(c, `takes out the ${c.name} (it doesn't fit)`);
    let sticks = 0;
    for (const m of benchHas(counts, "stick")) {
      if (m.mem === part.mem) continue;
      sticks += counts[m.id];
      takeOut(m, null);
    }
    if (sticks) notes.push(`takes out ${sticks} memory ${sticks === 1 ? "stick" : "sticks"} that don't fit`);
    for (const k of ["video", "accel", "sound"]) {
      for (const x of benchHas(counts, k)) if (busMisfit(x, part)) takeOut(x, `takes out the ${x.name} (no slot for it)`);
    }
    for (const f of benchHas(counts, "fpu")) if (part.fpu !== f.fpu) takeOut(f, `takes out the ${f.name}`);
    for (const k of benchHas(counts, "cooler")) if (!k.sockets.includes(part.socket)) takeOut(k, `takes out the ${k.name} (no mount for this socket)`);
    for (const k of benchHas(counts, "case")) if (part.builtin || !k.boards.includes(part.form)) takeOut(k, `takes out the ${k.name} (the board doesn't fit it)`);
    for (const ps of benchHas(counts, "psu")) if (psuMisfit(ps, part)) takeOut(ps, `takes out the ${ps.name} (it doesn't have the board's plugs)`);
    next[part.id] = 1;
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  if (part.kind === "cpu") {
    if ((counts[part.id] || 0) > 0) return { reason: "Already on the bench." };
    if (!boardNow) return { reason: `Needs a board with a ${SOCKET_NAMES[part.socket]} socket.` };
    const misfit = cpuMisfit(part, boardNow);
    if (misfit) return { reason: misfit };
    for (const c of benchHas(counts, "cpu")) takeOut(c, `replaces the ${c.name}`);
    next[part.id] = 1;
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  if (part.kind === "stick") {
    if (!boardNow) return { reason: `Needs a board with ${MEM_NAMES[part.mem]} slots.` };
    if (boardNow.mem !== part.mem) return { reason: `Needs a board with ${MEM_NAMES[part.mem]} slots; this board takes ${MEM_NAMES[boardNow.mem]}.` };
    next[part.id] = (next[part.id] || 0) + 1;
    const used = benchHas(next, "stick").reduce((n, m) => n + next[m.id], 0);
    if (used > boardNow.slots) {
      const smallest = benchHas(next, "stick").filter((m) => next[m.id] > (m.id === part.id ? 1 : 0)).sort((a, b) => a.mb - b.mb)[0];
      if (!smallest || smallest.mb >= part.mb) return { reason: `All ${boardNow.slots} memory slots are full.` };
      refund += soldBack(smallest, next[smallest.id], next[smallest.id] - 1);
      next[smallest.id] -= 1;
      if (!next[smallest.id]) delete next[smallest.id];
      notes.push(`replaces a ${smallest.name}`);
    }
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  // Two of the same 1998 add-in could split the work over a ribbon cable.
  if (TWIN_ADDINS.includes(part.id) && (counts[part.id] || 0) === 1) {
    if (!boardNow || busMisfit(part, boardNow)) return { reason: "Needs a PCI slot." };
    return { counts: { ...counts, [part.id]: 2 }, refund: 0, note: "joins the first over a ribbon cable to split the work (SLI)" };
  }
  if ((counts[part.id] || 0) > 0 && part.kind !== "stick") return { reason: "Already on the bench." };
  const [caseNow] = benchHas(counts, "case");
  const [psuNow] = benchHas(counts, "psu");
  const [cardNow] = benchHas(counts, "video");
  if (part.kind === "addin") {
    if (!boardNow) return { reason: "Needs a board to plug into." };
    const misfit = busMisfit(part, boardNow);
    if (misfit) return { reason: misfit };
    if (part.job === "raid" && !benchHas(counts, "drive").length) return { reason: "Needs a disk to run." };
    const others = benchHas(counts, "addin");
    if (others.length >= 2) takeOut(others[0], `replaces the ${others[0].name}`);
    next[part.id] = 1;
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  if (part.kind === "monitor") {
    if (!boardNow) return { reason: "Needs a PC to plug into." };
    if (boardNow.builtin && !cardNow) return { reason: "This computer has its own screen." };
    const [chipNow] = benchHas(counts, "cpu");
    const source = cardNow ? cardNow.ports : chipNow?.igpu ? boardNow.ports : null;
    if (!source) return { reason: "Needs graphics to plug into." };
    if (!part.ports.some((p) => source.includes(p))) return { reason: `No ${part.ports.map((p) => PORT_NAMES[p]).join(" or ")} port on the ${cardNow ? cardNow.name : "board"}.` };
    for (const x of benchHas(counts, "monitor")) takeOut(x, `replaces the ${x.name}`);
    next[part.id] = 1;
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  if (["video", "accel", "sound"].includes(part.kind)) {
    if (!boardNow) return { reason: "Needs a board to plug into." };
    const misfit = busMisfit(part, boardNow);
    if (misfit) return { reason: misfit };
    if (part.kind === "video" && caseNow && part.length > caseNow.maxGpu) return { reason: `At ${part.length} mm it's too long for the ${caseNow.name} (${caseNow.maxGpu} mm).` };
    if (part.kind === "video" && psuNow && !psuNow.plugs.includes(part.plug)) return { reason: `Needs a supply with ${PLUG_NAMES[part.plug]}.` };
    for (const x of benchHas(counts, part.kind)) takeOut(x, `replaces the ${x.name}`);
    next[part.id] = 1;
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  if (part.kind === "cooler") {
    if (!boardNow) return { reason: "Needs a board to mount on." };
    if (!part.sockets.includes(boardNow.socket)) return { reason: `It has no mounting kit for ${SOCKET_NAMES[boardNow.socket]}.` };
    if (caseNow && part.aio && !caseNow.radiators.includes(part.radiator)) return { reason: `The ${caseNow.name} has no ${part.radiator} mm radiator mount.` };
    if (caseNow && !part.aio && part.height > caseNow.maxCooler) return { reason: `At ${part.height} mm it's too tall for the ${caseNow.name} (${caseNow.maxCooler} mm).` };
    for (const x of benchHas(counts, "cooler")) takeOut(x, `replaces the ${x.name}`);
    next[part.id] = 1;
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  if (["drive", "media", "net", "modem"].includes(part.kind)) {
    if (!boardNow) return { reason: "Needs a board to connect to." };
    const misfit = portMisfit(part, boardNow);
    if (misfit) return { reason: misfit };
    for (const x of benchHas(counts, part.kind)) takeOut(x, `replaces the ${x.name}`);
    next[part.id] = 1;
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  if (part.kind === "fpu") {
    if (!boardNow || boardNow.fpu !== part.fpu) return { reason: `Needs a board with a ${part.fpu} socket.` };
    for (const x of benchHas(counts, "fpu")) takeOut(x, `replaces the ${x.name}`);
    next[part.id] = 1;
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  if (part.kind === "psu") {
    if (boardNow?.builtin) return { reason: "This computer has its own supply." };
    const plugMisfit = boardNow ? psuMisfit(part, boardNow) : null;
    if (plugMisfit) return { reason: plugMisfit };
    if (caseNow && !supplyFits(caseNow.form, part.form)) return { reason: `The ${caseNow.name} takes ${caseNow.form === "sfx" ? "only a small SFX" : `an ${caseNow.form.toUpperCase()}`} supply.` };
    if (cardNow && !part.plugs.includes(cardNow.plug)) return { reason: `The ${cardNow.name} needs ${PLUG_NAMES[cardNow.plug]}.` };
    for (const x of benchHas(counts, "psu")) takeOut(x, `replaces the ${x.name}`);
    next[part.id] = 1;
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  if (part.kind === "case") {
    if (boardNow?.builtin) return { reason: "This computer came in its own case." };
    if (boardNow && !part.boards.includes(boardNow.form)) return { reason: `The ${boardNow.name} is ${FORM_NAMES[boardNow.form]}; this case doesn't take it.` };
    if (psuNow && !supplyFits(part.form, psuNow.form)) return { reason: `This case takes ${part.form === "sfx" ? "only a small SFX" : `an ${part.form.toUpperCase()}`} supply.` };
    if (cardNow && cardNow.length > part.maxGpu) return { reason: `The ${cardNow.name} is too long for it (${part.maxGpu} mm).` };
    const [coolNow] = benchHas(counts, "cooler");
    if (coolNow?.aio && !part.radiators.includes(coolNow.radiator)) return { reason: `It has no ${coolNow.radiator} mm radiator mount for the ${coolNow.name}.` };
    if (coolNow && !coolNow.aio && coolNow.height > part.maxCooler) return { reason: `The ${coolNow.name} is too tall for it (${part.maxCooler} mm).` };
    for (const x of benchHas(counts, "case")) takeOut(x, `replaces the ${x.name}`);
    next[part.id] = 1;
    return { counts: next, refund, note: notes.join("; ") || null };
  }
  return { counts: { ...counts, [part.id]: (counts[part.id] || 0) + 1 }, refund: 0, note: null };
}

export const PORT_NAMES = { ttl: "TTL", vga: "VGA", dvi: "DVI", hdmi: "HDMI", dp: "DisplayPort" };
const PLUG_NAMES = { none: "no plug", molex: "a drive power plug", "6pin": "a 6-pin PCIe plug", "8pin": "an 8-pin PCIe plug", "12vhpwr": "the 16-pin 12VHPWR plug" };
export const FORM_NAMES = { at: "AT", atx: "ATX", matx: "micro-ATX", itx: "mini-ITX", eatx: "E-ATX", btx: "BTX", own: "built in" };
// An ATX case takes an ATX or (with a bracket) an SFX supply; a small case
// only SFX; an AT case only AT.
const SUPPLY_FITS = { at: ["at"], atx: ["atx", "sfx"], sfx: ["sfx"] };
function supplyFits(caseForm, psuForm) {
  return (SUPPLY_FITS[caseForm] || [caseForm]).includes(psuForm);
}
const BUS_NAMES = { lpt: "printer port", isa8: "8-bit ISA", isa16: "16-bit ISA", vlb: "VL-Bus", pci: "PCI", agp: "AGP", pcie: "PCI Express" };

const MAIN_NAMES = { at: "AT power plugs", atx20: "a 20-pin ATX plug", atx24: "a 24-pin ATX plug" };
const CPU_PLUG_NAMES = { p4: "a 4-pin 12 V CPU plug", eps8: "an 8-pin EPS CPU plug" };

// Whether a supply has the plugs a board needs.
function psuMisfit(psu, board) {
  if (!board) return null;
  if (board.builtin) return "This computer has its own supply.";
  const mainOk = board.mainPlug === psu.mainPlug || (board.mainPlug === "atx20" && psu.mainPlug === "atx24");
  if (!mainOk) return `The board needs ${MAIN_NAMES[board.mainPlug]}; this supply has ${MAIN_NAMES[psu.mainPlug]}.`;
  if (board.cpuPlug && !(psu.cpuPlugs || []).includes(board.cpuPlug)) return `The board needs ${CPU_PLUG_NAMES[board.cpuPlug]}, which this supply doesn't have.`;
  return null;
}

// Whether a drive, removable drive, network card or modem can connect.
// Before IDE ports were on boards, an IDE drive used a paddle card in a
// 16-bit ISA slot; MFM drives always used a controller card.
function portMisfit(part, board) {
  const buses = board.buses || [];
  if (part.kind === "modem") return null;
  if (part.kind === "net") return busMisfit(part, board);
  const iface = part.iface;
  if (iface === "floppy" || iface === "lpt") return null;
  if (iface === "pcie") return busMisfit(part, board);
  if (board.builtin) return "This computer has nowhere to connect it.";
  if (iface === "mfm") return buses.includes("isa8") || buses.includes("isa16") ? null : "Needs an ISA slot for its controller card.";
  if (iface === "isa") return buses.includes("isa16") ? null : "Needs a 16-bit ISA slot.";
  if (iface === "ide") return board.ide > 0 || buses.includes("isa16") ? null : "This board has no IDE port.";
  if (iface === "sata") return board.sata > 0 ? null : "This board has no SATA port.";
  if (iface === "nvme") return board.m2 > 0 ? null : "This board has no M.2 slot.";
  return null;
}

const SATA_MBS = [0, 150, 300, 600];
const NVME_MBS = { 2: 800, 3: 3500, 4: 7500, 5: 14000 };
// What a drive actually gives on this board, in MB/s, and how it's linked.
export function driveLink(d, board) {
  if (!d || !board) return { mbs: 0, text: "" };
  if (d.iface === "mfm") return { mbs: d.mbs, text: "MFM" };
  if (d.iface === "ide") {
    const port = board.ide > 0 ? board.ide : 3;
    return { mbs: Math.min(d.mbs, port, d.link || port), text: board.ide > 0 ? `IDE at ${Math.min(port, d.link)} MB/s` : "IDE on a paddle card" };
  }
  if (d.iface === "sata") {
    const gen = Math.min(d.link, board.sata);
    return { mbs: Math.min(d.mbs, SATA_MBS[gen] || 0), text: `SATA ${[0, 1.5, 3, 6][gen]} Gbit/s` };
  }
  if (d.iface === "pcie") {
    const g = Math.min(d.link, board.pcie || 0);
    return { mbs: Math.min(d.mbs, NVME_MBS[g] || 0), text: `on a PCIe ${g}.0 card` };
  }
  const gen = Math.min(d.link, board.m2);
  return { mbs: Math.min(d.mbs, NVME_MBS[gen] || 0), text: `NVMe on PCIe ${gen}.0` };
}

// A drive of its day, in MB/s, by year: what the PC's CPU expects.
function driveExpected(year) {
  const pts = [[1977, 0.05], [1980, 0.3], [1984, 0.6], [1990, 2], [1995, 8], [2000, 35], [2005, 70], [2010, 150], [2015, 500], [2020, 3500], [2024, 7000]];
  if (year <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [y0, v0] = pts[i];
    const [y1, v1] = pts[i + 1];
    if (year <= y1) return Math.exp(Math.log(v0) + ((year - y0) / (y1 - y0)) * (Math.log(v1) - Math.log(v0)));
  }
  return pts[pts.length - 1][1];
}

// Whether a card fits a board's slots. AGP is keyed: old 3.3 V cards don't
// fit a 1.5 V-only slot and 1.5 V cards don't fit a 3.3 V one; universal
// cards fit both.
function busMisfit(part, board) {
  if (!board) return "Needs a board.";
  if (board.builtin) return "This computer has no slot for it.";
  if (part.bus === "agp") {
    const slot = (board.buses || []).find((b) => b.startsWith("agp"));
    if (!slot) return "Needs a board with an AGP slot.";
    if (part.agpKey !== "universal" && slot !== `agp-${part.agpKey}`) return `This ${part.agpKey} V AGP card is keyed for the other AGP slot.`;
    return null;
  }
  if (part.bus === "lpt") return null;
  if (part.bus === "isa8" && (board.buses || []).includes("isa16")) return null;
  if (!(board.buses || []).includes(part.bus)) return `Needs a ${BUS_NAMES[part.bus]} slot.`;
  return null;
}

// The bench's PC: CPU speed, held back when memory is short or slow, and a
// little faster with fast memory, or with an unlocked CPU on a board that
// overclocks.
export function benchStock(counts, opts = {}) {
  const c = counts || {};
  const wantOc = opts.oc !== false;
  const [board] = benchHas(c, "board");
  const [chip] = benchHas(c, "cpu");
  const sticks = benchHas(c, "stick");
  const ramMb = sticks.reduce((n, m) => n + m.mb * c[m.id], 0);
  const stickCount = sticks.reduce((n, m) => n + c[m.id], 0);
  const need = chip?.ramMb || 0;
  const memory = !chip ? 0 : ramMb <= 0 ? 0 : Math.min(1, ramMb / need);
  const fits = chip && board && !cpuFitsBoard(chip, board);
  // Memory runs at the slowest of the sticks, the board's limit and, on a
  // board that holds memory to rated speed, the CPU's rating.
  const rated = chip?.memSpeed?.[board?.mem] || board?.memMax || 0;
  const stickSpeed = sticks.length ? Math.min(...sticks.map((m) => m.speed || 0)) : 0;
  let memSpeed = 0;
  let speedFactor = 1;
  if (rated > 0 && stickSpeed > 0) {
    memSpeed = Math.min(stickSpeed, board?.memMax || stickSpeed, board?.memLock ? rated : Infinity);
    speedFactor = 0.85 + 0.15 * Math.min(1.25, memSpeed / rated);
  }
  // Heat: chips past the 386 need a cooler. Overclocking adds a third more
  // heat; if the cooler can't take it the CPU stays at stock speed, and if it
  // can't take even stock heat the CPU slows down.
  const [coolerNow] = benchHas(c, "cooler");
  const mounted = coolerNow && board && coolerNow.sockets.includes(board.socket) ? coolerNow : null;
  const heatStock = chip?.watts || 0;
  // A case moves more or less air than open air; that scales the cooler.
  const [caseHere] = benchHas(c, "case");
  const coolCap = mounted ? Math.round(mounted.cap * (caseHere?.airflow || 1)) : heatStock <= 5 ? heatStock : 0;
  const canOc = fits && board.oc && chip.unlocked;
  const ocOn = canOc && wantOc && coolCap >= heatStock * 1.35;
  const thermal = !fits || heatStock <= 0 ? 1 : coolCap >= heatStock ? 1 : coolCap <= 0 ? 0.5 : Math.max(0.5, coolCap / heatStock);
  const overclock = ocOn ? 1.1 : 1;
  const [fpuChip] = benchHas(c, "fpu");
  const math = fits && fpuChip && chip.noFpu && board.fpu === fpuChip.fpu ? 1.15 : 1;
  const cpuPerf = fits ? chip.perf * memory * speedFactor * overclock * math * thermal : 0;
  // Graphics: the card (plus a 3D add-in beside it), at the slowest PCI
  // Express generation of card, slot and CPU (3% for each step down), or the
  // computer's own video, or a CPU's on-chip graphics.
  const [card] = benchHas(c, "video");
  const [addIn] = benchHas(c, "accel");
  const [psuNow] = benchHas(c, "psu");
  const [caseNow] = benchHas(c, "case");
  const [snd] = benchHas(c, "sound");
  let gfx = 0;
  let link = 0;
  let unplugged = false;
  if (card && board && !busMisfit(card, board)) {
    if (psuNow && !psuNow.plugs.includes(card.plug)) unplugged = true;
    else {
      gfx = card.gfx;
      if (card.bus === "pcie") {
        link = Math.min(card.pcie, board.pcie || card.pcie, chip?.pcie || board.pcie || card.pcie);
        gfx *= 1 - 0.03 * Math.max(0, card.pcie - link);
      }
      if (addIn && !busMisfit(addIn, board)) gfx += addIn.gfx * ((c[addIn.id] || 0) >= 2 ? 1.8 : 1);
    }
  } else if (board?.builtin) gfx = cpuPerf;
  else if (chip?.igpu) gfx = cpuPerf * 0.15;
  // The PC is as fast as its CPU, held back by weak graphics: a card faster
  // than the CPU can feed is partly idle.
  // A monitor shows only so much; with none of its own the PC uses an old
  // borrowed screen (90%). Built-in computers have their own.
  const [screen] = benchHas(c, "monitor");
  const source = card && gfx > 0 ? card.ports : chip?.igpu ? board?.ports || [] : [];
  const screenOn = !!screen && screen.ports.some((p) => source.includes(p));
  const ownScreen = board?.builtin && !(card && source.length);
  const shownGfx = ownScreen || gfx <= 0 ? gfx : screenOn ? Math.min(gfx, screen.cap) : gfx * 0.9;
  const screenCapped = screenOn && gfx > screen.cap;
  gfx = shownGfx;
  const pcPerf = cpuPerf * 0.6 + Math.min(gfx, cpuPerf) * 0.4;
  let bottleneck = null;
  if (cpuPerf > 0 && gfx < cpuPerf * 0.9) bottleneck = "graphics";
  else if (cpuPerf > 0 && gfx > cpuPerf * 1.3) bottleneck = "cpu";
  // Power: the supply has to cover the CPU, card and the rest (20 W).
  const draw = 20 + (chip?.watts || 0) + (unplugged ? 0 : card?.watts || 0) + (addIn?.watts || 0) + (snd?.watts || 0) + (fpuChip?.watts || 0)
    + benchHas(c, "drive").reduce((n, x) => n + x.watts, 0) + benchHas(c, "media").reduce((n, x) => n + x.watts, 0) + benchHas(c, "addin").reduce((n, x) => n + x.watts, 0)
    + (coolerNow?.watts || 0) + (chip && board?.oc && chip.unlocked && wantOc ? chip.watts * 0.35 : 0);
  const supply = board?.builtin ? Math.max(draw, board.builtinWatts) : psuNow && !psuMisfit(psuNow, board) ? psuNow.supply : 0;
  const power = !board ? 0 : supply <= 0 ? 0 : Math.min(1, supply / draw);
  const soundBonus = 1 + Math.max(snd && board && !busMisfit(snd, board) ? snd.bonus : 0, board?.onboardSound || 0);
  // Storage: a slow disk, or none, holds the PC back a little; removable
  // drives, a network card and a modem each add a little.
  const [disk] = benchHas(c, "drive");
  const [removable] = benchHas(c, "media");
  const [nic] = benchHas(c, "net");
  const [mdm] = benchHas(c, "modem");
  const diskLink = disk && board && !portMisfit(disk, board) ? driveLink(disk, board) : { mbs: 0, text: "" };
  const expected = driveExpected(chip?.year || 1977);
  const diskFactor = diskLink.mbs > 0 ? 0.9 + 0.1 * Math.min(1.2, diskLink.mbs / expected) : board?.builtin && (chip?.year || 0) < 1980 ? 1 : 0.9;
  const extras = (removable && board && !portMisfit(removable, board) ? 1 + removable.bonus : 1)
    * (nic && board && !portMisfit(nic, board) ? 1 + nic.bonus : 1)
    * (mdm ? 1 + mdm.bonus : 1)
    * benchHas(c, "addin").reduce((n, x) => n * (board && !busMisfit(x, board) ? 1 + x.bonus : 1), 1);
  const caseBonus = caseNow && board && caseNow.boards.includes(board.form) ? 1.05 : 1;
  const perf = pcPerf * power * soundBonus * caseBonus * diskFactor * extras;
  return {
    board: board || null, cpu: chip || null, ramMb, needMb: need, sticks: stickCount, memory, memSpeed, rated, speedFactor, overclock, math,
    cpuPerf, gfx, link, unplugged, bottleneck, monitor: screen || null, screenOn, screenCapped, ownScreen, draw, supply, power, sound: snd || null, case: caseNow || null, card: card || null,
    cooler: mounted, heat: heatStock * (ocOn ? 1.35 : 1), coolCap, canOc, ocOn, ocBlocked: canOc && wantOc && !ocOn, thermal,
    drive: disk || null, driveMbs: diskLink.mbs, driveText: diskLink.text, diskExpected: expected, media: removable || null, net: nic || null, modem: mdm || null,
    perf, perSecond: perf * BENCH_RD,
  };
}

// The ways to put a faster CPU on the bench right now: the CPU, a board for
// its socket if the bench doesn't have one, and the memory it wants. Each plan
// lists the parts in buying order, with the total cost after sell-backs.
export function benchPlans(state) {
  const open = openParts(state);
  const counts = { ...countsOf(state, "bench") };
  const now = benchStock(counts);
  const benchParts = (kind) => PARTS.filter((p) => p.kind === kind && p.fits.includes("bench") && open.has(p.id));
  const plans = [];
  // Build on c: add each part, then a supply (and case) that fit and cover
  // the draw. Returns the finished plan or null.
  const finish = (c0, first, label) => {
    let c = { ...c0 };
    let cost = 0;
    const steps = [];
    const add = (part) => {
      const fit = fitBench(c, part);
      if (fit.reason) return false;
      cost += partCost(part, c[part.id] || 0) - fit.refund;
      c = fit.counts;
      steps.push(part.id);
      return true;
    };
    for (const part of first) if (!(c[part.id] > 0) && !add(part)) return null;
    const [board] = benchHas(c, "board");
    if (!board) return null;
    const sticks = benchParts("stick").filter((m) => m.mem === board.mem).sort((a, b) => (b.speed || 0) - (a.speed || 0) || b.mb - a.mb);
    for (let i = 0; i < 8 && benchStock(c).memory < 0.999 && sticks.length; i++) {
      const fits = sticks.find((m) => !fitBench(c, m).reason);
      if (!fits || !add(fits)) break;
    }
    {
      const st = benchStock(c);
      if (st.cpu && (st.thermal < 0.999 || (st.canOc && !st.ocOn))) {
        const k = benchParts("cooler").filter((x) => !fitBench(c, x).reason && x.cap >= st.cpu.watts * (st.canOc ? 1.35 : 1)).sort((a, b) => a.cost - b.cost)[0]
          || benchParts("cooler").filter((x) => !fitBench(c, x).reason && x.cap >= st.cpu.watts).sort((a, b) => a.cost - b.cost)[0];
        if (k) add(k);
      }
    }
    if (!board.builtin) {
      const st = benchStock(c);
      if (st.power < 0.999 || st.unplugged || !st.supply) {
        const [card] = benchHas(c, "video");
        const psu = benchParts("psu").filter((p) => !psuMisfit(p, board) && p.supply >= st.draw + (st.unplugged ? card.watts : 0) && (!card || p.plugs.includes(card.plug)))
          .sort((a, b) => a.cost - b.cost)[0];
        if (psu) add(psu);
      }
      if (!benchHas(c, "case").length) {
        const [card] = benchHas(c, "video");
        const box = benchParts("case").filter((k) => !fitBench(c, k).reason && (!card || card.length <= k.maxGpu)).sort((a, b) => a.cost - b.cost)[0];
        if (box) add(box);
      }
    }
    {
      const st = benchStock(c);
      if (st.gfx > 0 && !st.ownScreen && (!st.screenOn || st.screenCapped)) {
        const fits = benchParts("monitor").filter((m) => !fitBench(c, m).reason && m.cap > (st.screenOn ? st.monitor.cap : 0));
        const want = st.screenCapped || !st.screenOn ? (st.card?.gfx || st.gfx / 0.9) : 0;
        const pick = fits.filter((m) => m.cap >= want).sort((a, b) => a.cost - b.cost)[0] || fits.sort((a, b) => b.cap - a.cap)[0];
        if (pick) add(pick);
      }
    }
    const after = benchStock(c);
    if (after.perf <= now.perf) return null;
    return { label, steps, cost, perf: after.perf, perSecond: after.perSecond };
  };
  for (const chip of benchParts("cpu")) {
    if (chip.perf <= (now.cpu?.perf || 0)) continue;
    const boards = now.board && !cpuFitsBoard(chip, now.board) ? [now.board] : benchParts("board").filter((p) => !cpuFitsBoard(chip, p));
    for (const board of boards) {
      const plan = finish(counts, [board, chip], chip.name);
      if (plan) plans.push({ ...plan, cpu: chip, board });
    }
  }
  if (now.board && now.cpu) {
    for (const card of benchParts("video")) {
      if (card.gfx <= (now.card?.gfx || 0) || busMisfit(card, now.board)) continue;
      const box = benchHas(counts, "case")[0];
      let c = counts;
      if (box && card.length > box.maxGpu) {
        const bigger = benchParts("case").filter((k) => k.maxGpu >= card.length && k.boards.includes(now.board.form)).sort((a, b) => a.cost - b.cost)[0];
        if (!bigger) continue;
        const fit = fitBench(c, bigger);
        if (fit.reason) continue;
        c = fit.counts;
      }
      // A new card may need a supply with its plug first.
      const [psuNow] = benchHas(c, "psu");
      const first = [];
      if (psuNow && !psuNow.plugs.includes(card.plug)) {
        const psu = benchParts("psu").filter((p) => !psuMisfit(p, now.board) && p.plugs.includes(card.plug)).sort((a, b) => a.cost - b.cost)[0];
        if (!psu) continue;
        first.push(psu);
      }
      first.push(card);
      const plan = finish(c, first, card.name);
      if (plan) plans.push({ ...plan, card });
    }
    for (const kind of ["sound", "fpu", "accel", "drive", "media", "net", "modem", "cooler", "monitor", "addin"]) {
      for (const part of benchParts(kind)) {
        if (benchHas(counts, kind).some((x) => x.id === part.id)) continue;
        const plan = finish(counts, [part], part.name);
        if (plan) plans.push(plan);
      }
    }
  }
  return plans.sort((a, b) => b.perf - a.perf || a.cost - b.cost);
}

export function benchLimit(counts, opts) {
  const b = benchStock(counts, opts);
  if (!b.board) return "Add a board";
  if (!b.cpu) return "Add a CPU";
  if (!b.board.builtin && !b.supply) return "Add a power supply";
  if (b.power < 0.999) return "Power limited";
  if (b.thermal < 0.999) return "Overheating";
  if (b.memory < 0.999) return "Needs more memory";
  if (b.unplugged) return "Card not plugged in";
  if (b.screenCapped) return "Monitor limited";
  if (b.bottleneck === "graphics") return "Bottleneck: graphics";
  if (b.bottleneck === "cpu") return "Bottleneck: CPU";
  return "Running full";
}

export function benchHint(state) {
  const b = benchStock(countsOf(state, "bench"), { oc: state?.benchOc !== false });
  if (!b.board) return "Next: a motherboard, then a CPU for its socket and memory for its slots.";
  if (!b.cpu) return `Next: a CPU for the ${SOCKET_NAMES[b.board.socket]} socket.`;
  if (!b.board.builtin && !b.supply) return `Next: an ${b.board.form === "at" ? "AT" : "ATX"} power supply; the PC draws about ${Math.round(b.draw)} W.`;
  if (b.power < 0.999) return `Next: a bigger supply; the PC draws ${Math.round(b.draw)} W from a ${b.supply} W supply.`;
  if (b.memory < 0.999) return `Next: more ${MEM_NAMES[b.board.mem]} memory; the ${b.cpu.name} wants ${memSize(b.needMb)}.`;
  if (b.unplugged) return `Next: a supply with the plug the ${b.card.name} needs.`;
  if (b.thermal < 0.999) return `Next: a cooler for ${SOCKET_NAMES[b.board.socket]} that moves ${Math.round(b.cpu.watts)} W; the CPU is slowing down from heat.`;
  if (b.ocBlocked) return `Overclock is off: the cooler moves ${b.coolCap} W and an overclocked ${b.cpu.name} makes ${Math.round(b.cpu.watts * 1.35)} W.`;
  if (b.monitor && !b.screenOn && !b.ownScreen) return `Next: a monitor with a port the graphics has; the ${b.monitor.name} doesn't plug in.`;
  if (b.screenCapped) return `Next: a better monitor; the ${b.monitor.name} can't show all the ${b.card?.name || "graphics"} draws.`;
  if (!b.monitor && !b.ownScreen && b.gfx > 0) return "Next: a monitor of your own; a borrowed old screen shows 90% of the graphics.";
  if (b.bottleneck === "graphics") return "Bottleneck: the graphics. A faster card lets the CPU do more.";
  if (b.bottleneck === "cpu") return "Bottleneck: the CPU. The card waits on it; a faster CPU uses more of it.";
  return "Next: newer parts as you reach their years and research them.";
}

export function memSize(mb) {
  if (!(mb > 0)) return "0 KB";
  if (mb >= 1024) return `${Number((mb / 1024).toFixed(2))} GB`;
  if (mb >= 1) return `${Number(mb.toFixed(2))} MB`;
  return `${Math.round(mb * 1000)} KB`;
}

// Old saves: drop parts that no longer fit their plant, DDR4 sticks sharing a
// board with DDR5, and sticks beyond a board's slots or size, refunding what
// they cost in full (the rules changed, not the player).
export function migrateFacilities(raw) {
  const facilities = readFacilities(raw);
  let refund = unfitRefund(raw);
  for (const facilityId of Object.keys(BOARDS)) {
    const counts = facilities[facilityId];
    const board = BOARDS[facilityId];
    const full = (part, n) => {
      let total = 0;
      for (let i = 0; i < n; i++) total += partCost(part, i);
      return total;
    };
    if (RAM_PARTS.some((p) => p.gen === "DDR5" && counts[p.id]) && RAM_PARTS.some((p) => p.gen === "DDR4" && counts[p.id])) {
      for (const p of RAM_PARTS.filter((x) => x.gen === "DDR4" && counts[x.id])) {
        refund += full(p, counts[p.id]);
        delete counts[p.id];
      }
    }
    const order = RAM_PARTS.filter((p) => counts[p.id]).sort((a, b) => a.gb - b.gb);
    for (const p of order) {
      while (counts[p.id] && (boardOf(facilityId, counts).used > board.slots || boardOf(facilityId, counts).gb > board.maxGb)) {
        refund += partCost(p, counts[p.id] - 1);
        counts[p.id] -= 1;
        if (!counts[p.id]) delete counts[p.id];
      }
    }
  }
  return { facilities, refund: Number.isFinite(refund) ? refund : 0 };
}

// Saves from before parts opened by year and research: a part the company
// owns but hasn't opened is kept, with its research marked done, when the
// company has reached its year (it was bought fairly under the old rules);
// otherwise it's removed and its full cost refunded. Changes state in place;
// returns the refund.
export function settleClosedParts(state) {
  if (!state) return 0;
  const facilities = readFacilities(state.facilities);
  const year = playerYear(state);
  const done = new Set(state.techDone || []);
  let refund = 0;
  for (const facilityId of Object.keys(facilities)) {
    const counts = facilities[facilityId];
    for (const [partId, n] of Object.entries(counts)) {
      const part = byId[partId];
      if (!part || !(n > 0) || partOpen({ ...state, techDone: [...done] }, part)) continue;
      if (year >= (part.year || 0) && part.research) {
        done.add(part.research);
        continue;
      }
      for (let i = 0; i < n; i++) refund += partCost(part, i);
      delete counts[partId];
    }
  }
  // Networks arrived later than the racks they serve: a save with racks (or
  // linked cluster cards) and no network gets the first one of its day,
  // already researched, so nothing slows down on loading.
  for (const facilityId of ["servers", "cluster"]) {
    const st = stock(facilities[facilityId], facilityId);
    const needsLink = facilityId === "servers" ? st.groups.rack.work > 0 : st.gpus > 1;
    if (!needsLink || st.linkCap > 0) continue;
    const first = PARTS.filter((p) => p.kind === "link" && p.fits.includes(facilityId) && (p.year || 0) <= year).sort((x, y) => x.year - y.year)[0];
    if (!first) continue;
    facilities[facilityId][first.id] = 1;
    if (first.research) done.add(first.research);
  }
  state.facilities = facilities;
  state.techDone = [...done];
  return Number.isFinite(refund) ? refund : 0;
}

function applyPart(state, facilityId, partId) {
  const facilities = readFacilities(state?.facilities);
  const fit = fitPart(facilities[facilityId], facilityId, partId);
  if (fit.reason) return null;
  facilities[facilityId] = fit.counts;
  return { state: { ...state, facilities }, refund: fit.refund, note: fit.note };
}

function withPart(state, facilityId, partId) {
  return applyPart(state, facilityId, partId)?.state || null;
}

export function nextPurchase(state, businessPerSecond) {
  if (!facilitiesOpen(state)) return null;
  const open = openParts(state);
  const mineStarter = starterNext("mine", countsOf(state, "mine"), open);
  if (mineStarter) return mineStarter;
  const clusterStarter = starterNext("cluster", countsOf(state, "cluster"), open);
  if (clusterStarter) {
    const added = marginal(state, clusterStarter, businessPerSecond);
    if (added > 0 && clusterStarter.cost / added <= 15 * 60) return clusterStarter;
  }
  let best = null;
  for (const facilityId of ["mine", "cluster"]) {
    const counts = countsOf(state, facilityId);
    for (const part of PARTS) {
      if (part.soon || !part.fits.includes(facilityId) || !open.has(part.id)) continue;
      const owned = counts[part.id] || 0;
      if (owned >= partMax(part, facilityId)) continue;
      const offer = { facilityId, partId: part.id, name: part.name, cost: partCost(part, owned) };
      // A part is worth what it adds once the plant has the power, cooling
      // and memory to run it; a card alone may only be throttled, and a power
      // supply alone does nothing while cooling is short. Judge each part with
      // the cheapest extras it needs, so the suggestion never stalls.
      const plan = withSupport(state, facilityId, part.id, open);
      if (!plan) continue;
      const before = facilityReport(state, businessPerSecond).perSecond;
      const added = facilityReport(plan.state, businessPerSecond).perSecond - before;
      if (!(added > 0)) continue;
      const payback = plan.cost / added;
      if (payback > 15 * 60) continue;
      if (!best || payback < best.payback) best = { ...offer, payback, bundleCost: plan.cost, extras: plan.extras };
    }
  }
  return best;
}

// Add one part, then the cheapest power, cooling and memory until the plant
// runs at full speed (at most a few parts). Returns the new state, the total cost and
// the names of the extra parts, or null if it can't be supported.
export function supportPlan(state, facilityId, partId) {
  return withSupport(state, facilityId, partId);
}

function withSupport(state, facilityId, partId, open = openParts(state)) {
  const first = applyPart(state, facilityId, partId);
  if (!first) return null;
  let next = first.state;
  let cost = partCost(byId[partId], countsOf(state, facilityId)[partId] || 0) - first.refund;
  const extras = [];
  const notes = first.note ? [first.note] : [];
  const add = (id) => {
    const owned = countsOf(next, facilityId)[id] || 0;
    const step = applyPart(next, facilityId, id);
    if (!step) return false;
    next = step.state;
    cost += partCost(byId[id], owned) - step.refund;
    extras.push(byId[id].name);
    if (step.note && !notes.includes(step.note)) notes.push(step.note);
    return true;
  };
  // A memory stick for the cluster is judged as the sticks it takes to reach
  // the next model the cards' memory allows; one stick on its own often adds
  // nothing until the set is complete.
  if (facilityId === "cluster" && byId[partId]?.kind === "ram") {
    const goal = nextTierRam(stock(countsOf(state, facilityId), facilityId));
    for (let i = 0; goal && i < BOARDS.cluster.slots; i++) {
      if (stock(countsOf(next, facilityId), facilityId).ram >= goal) break;
      if (!add(partId)) return null;
    }
  }
  for (let i = 0; i < 16; i++) {
    const counts = countsOf(next, facilityId);
    const stocked = stock(counts, facilityId);
    const short = shortOf(facilityId, stocked);
    if (!short) return { state: next, cost, extras, notes };
    const pick = cheapest(facilityId, short.kind, counts, open, short.group, short.coolant);
    if (!pick || !add(pick.part.id)) return null;
  }
  return null;
}

function marginal(state, offer, businessPerSecond) {
  const before = facilityReport(state, businessPerSecond).perSecond;
  const next = withPart(state, offer.facilityId, offer.partId);
  if (!next) return 0;
  const after = facilityReport(next, businessPerSecond).perSecond;
  return Math.max(0, after - before);
}

export function facilityHint(state, facilityId, businessPerSecond) {
  if (!facilityUnlocked(state, facilityId)) {
    return facilityId === "servers" ? "Requires 1951" : facilityId === "bench" ? "Requires 1977" : "Own an AI Accelerator to open the plant.";
  }
  if (facilityId === "bench") return benchHint(state);
  const counts = countsOf(state, facilityId);
  const row = facilityReport(state, businessPerSecond)[facilityId];
  const open = openParts(state);
  const firstMissing = STARTER[facilityId].find((id) => !(counts[id] > 0));
  if (firstMissing && !open.has(firstMissing)) return `Next: ${byId[firstMissing].name}. ${partLock(state, byId[firstMissing])}.`;
  const starter = starterNext(facilityId, counts, open);
  if (starter) return `Next: ${starter.name}`;
  const hinted = hintFor(facilityId, counts, row.limit, open);
  if (!hinted || row.limit === "Running full" || row.limit === "At the income share cap") {
    return row.limit === "At the income share cap"
      ? "The businesses set the ceiling. A richer company lets this plant pay more."
      : facilityId === "servers"
        ? "Next: another machine when you can power and cool it, or research a newer one."
        : "Next: add another graphics card when you can power and cool it.";
  }
  return `Next: ${hinted.part.name}`;
}

const PLANT_NAME = { mine: "BITBARK MINE", cluster: "TRAINING CLUSTER", servers: "RESEARCH SERVERS" };

// Headlines fire once each. Part copies after the first do not make news.
export function noteFacilityNews(state, businessPerSecond) {
  if (!state) return false;
  let added = false;
  const push = (id, text) => {
    if (pushHeadline(state, id, text)) added = true;
  };
  if (facilitiesOpen(state)) push("plant-open", "SIDE PLANT CLEARED BESIDE THE AI ACCELERATORS");
  if (facilityUnlocked(state, "servers")) push("servers-open", "RESEARCH MACHINE ROOM CLEARED BESIDE THE MAINFRAMES");
  const report = facilityReport(state, businessPerSecond);
  for (const facilityId of ["mine", "cluster", "servers"]) {
    const counts = countsOf(state, facilityId);
    if (facilityId === "servers" ? stock(counts, "servers").work > 0 : report[facilityId].perSecond > 0) {
      const live = facilityId === "mine"
        ? "BITBARK MINE POURS ITS FIRST COIN"
        : facilityId === "cluster"
          ? "TRAINING CLUSTER BOOKS AN OVERNIGHT RUN"
          : "RESEARCH SERVERS START MAKING R&D POINTS";
      push(`${facilityId}-live`, live);
    }
    for (const [partId, count] of Object.entries(counts)) {
      if (!(count > 0) || !PART_NEWS[partId]) continue;
      push(`part-${facilityId}-${partId}`, `${PART_NEWS[partId]} · ${PLANT_NAME[facilityId]}`);
    }
  }
  if (report.share >= SHARE_CAP - 0.0001) push("share-full", "SIDE PLANT HITS ITS FULL SHARE OF THE TAKE");
  return added;
}

// --- Rebuild ---------------------------------------------------------------
// Plants start empty after a prestige or fork. The last run's layout is kept
// (state.lastPlants) so one button can buy it back as far as cash allows.

export function plantsHaveParts(facilities) {
  const f = readFacilities(facilities);
  return Object.values(f).some((counts) => Object.values(counts).some((n) => n > 0));
}

// The parts still missing from the last layout, in the mine and cluster.
// The research servers aren't rebuilt: the sim showed last run's racks cost
// more early in a run than the extra R&D is worth (Quantum came 0.4 h later).
export const REBUILD_PLANTS = ["mine", "cluster"];

export function rebuildList(state) {
  const target = readFacilities(state?.lastPlants);
  const now = readFacilities(state?.facilities);
  const list = [];
  for (const facilityId of REBUILD_PLANTS) {
    if (!facilityUnlocked(state, facilityId)) continue;
    for (const [partId, want] of Object.entries(target[facilityId])) {
      const part = byId[partId];
      if (!part || part.soon || !part.fits.includes(facilityId)) continue;
      const have = now[facilityId]?.[partId] || 0;
      const goal = Math.min(partMax(part, facilityId), want);
      if (goal <= have) continue;
      if (!partOpen(state, part)) continue;
      if (fitPart(now[facilityId], facilityId, partId).reason) continue;
      list.push({ facilityId, partId, have, want: goal });
    }
  }
  return list;
}

// What the rest of the rebuild would cost, and how many parts it is.
export function rebuildCost(state) {
  let cost = 0;
  let parts = 0;
  for (const row of rebuildList(state)) {
    for (let n = row.have; n < row.want; n++) cost += partCost(byId[row.partId], n);
    parts += row.want - row.have;
  }
  return { cost, parts };
}

// Rebuild only buys what's worth it at this point of the run: a part waits
// until it pays for itself within PAYBACK_SECONDS, the rule the
// best-next-part suggestion uses. (REBUILD_SECONDS is the cost limit for a
// server part, kept for if servers join the rebuild.) Early in a run, last run's
// dearest parts would otherwise drain the cash the businesses need (the sim
// showed a slower run when it bought them anyway).
export const REBUILD_SECONDS = 300;
export const PAYBACK_SECONDS = 15 * 60;

function rebuildOk(state, row, cost, limits) {
  if (!limits) return true;
  if (row.facilityId === "servers") return cost <= limits.maxCost;
  const plan = withSupport(state, row.facilityId, row.partId);
  if (!plan) return false;
  const biz = limits.businessPerSecond || 0;
  const added = facilityReport(plan.state, biz).perSecond - facilityReport(state, biz).perSecond;
  return added > 0 && plan.cost / added <= PAYBACK_SECONDS;
}

// How many missing parts are worth buying right now.
export function rebuildReady(state, limits) {
  let parts = 0;
  let cheapestCost = null;
  for (const row of rebuildList(state)) {
    const cost = partCost(byId[row.partId], row.have);
    if (!rebuildOk(state, row, cost, limits)) continue;
    parts += 1;
    if (cheapestCost == null || cost < cheapestCost) cheapestCost = cost;
  }
  return { parts, cheapestCost };
}

// Buy the missing parts that are worth it, cheapest first (so power and
// cooling arrive with the cards), until cash runs out or nothing else is worth
// it yet. Returns how many parts and how much was spent.
export function rebuildPlants(state, limits = null) {
  let bought = 0;
  let spent = 0;
  for (let guard = 0; guard < 500; guard++) {
    let best = null;
    for (const row of rebuildList(state)) {
      const cost = partCost(byId[row.partId], row.have);
      if (best && cost >= best.cost) continue;
      if (!rebuildOk(state, row, cost, limits)) continue;
      best = { ...row, cost };
    }
    if (!best || !(state.cash >= best.cost)) break;
    const done = purchasePart(state, best.facilityId, best.partId);
    if (!done.ok) break;
    bought++;
    spent += done.cost;
  }
  return { bought, spent };
}

export function purchasePart(state, facilityId, partId) {
  if (!state || !facilityUnlocked(state, facilityId)) return { ok: false };
  const part = byId[partId];
  if (!part || part.soon || !part.fits.includes(facilityId)) return { ok: false };
  if (!partOpen(state, part) || partRetired(state, part)) return { ok: false, reason: partLock(state, part) };
  const facilities = readFacilities(state.facilities);
  const owned = facilities[facilityId][partId] || 0;
  const fit = fitPart(facilities[facilityId], facilityId, partId);
  if (fit.reason) return { ok: false, reason: fit.reason };
  const cost = partCost(part, owned);
  if (!Number.isFinite(state.cash) || !(state.cash >= cost)) return { ok: false };
  state.cash -= cost;
  state.cash += fit.refund;
  facilities[facilityId] = fit.counts;
  state.facilities = facilities;
  return { ok: true, cost, refund: fit.refund, note: fit.note };
}
