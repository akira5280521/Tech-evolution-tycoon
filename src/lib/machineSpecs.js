// Real specs for the research servers (T5 items 53 and 54). Each in-game
// machine is modeled on a real one; these are that machine's published
// figures, rounded. `kw` is electrical draw, and since every watt in comes
// out as heat it is also the heat the room has to remove. `flops` is peak
// floating-point (or, before floating-point hardware, instructions) a
// second. `memBytes` is main memory in a typical configuration. Storage on
// the cards comes from the game's own disk needs (part.diskGb).
//
// Sources (also listed in the PR):
//  - Ferranti Mark 1: Manchester "Computer 50" sales literature (27 kW), Wikipedia.
//  - IBM 7090: IBM 7090/7094 Physical Planning manual GC22-6706 and General
//    Information Manual; typical system about 50 kW.
//  - IBM System/360 Model 50: IBM Installation Manual - Physical Planning
//    C22-6820-8 (2050 processing unit 6.5 kVA); 256 KB core, ~133 kIPS.
//  - PDP-11/20: DEC handbook via RetroTechCollection (basic computer 400 W).
//  - VAX-11/780: DEC Power System Technical Description EK-PS780-TD (6.45 kW), 1 MIPS.
//  - Cray-1: Wikipedia / Cray Research (115 kW, 160 MFLOPS, 8 MB).
//  - Cray X-MP/48: Wikipedia (345 kW, 800 MFLOPS, 128 MB).
//  - Cray-2: Practical Computing 1987 (195 kW), 1.9 GFLOPS, 2 GB.
//  - Cray Y-MP: Y-MP Power Distribution manual (150 kW motor-generator), 2.67 GFLOPS.
//  - Cray C90 and T90: Cray X1 site-planning slides, CUG 2003 (398 kW / 419 kW; 16 / 57.6 GFLOPS).
//  - Cray T3D: NCAR CISL history (41.4 kW for 128 PEs); T3E: Cray T3E air-cooled
//    installation guide HR-04118 (4.75 kW a cabinet).
//  - Cray XT3: Cray XT3 datasheet (14.5 kW a cabinet); XC30: Wikipedia (90 kW a cabinet);
//    HPE Cray EX: HPE datasheet and Frontier ASCAC update (about 390 kW a cabinet).
//  - XT5: Jaguar (ORNL), about 7 MW over 200 cabinets.
//  - CM-5: Thinking Machines CM-5 brochure, CHM (72.5 kW typical, CM-5/1024).
//  - AlphaServer 8400: DEC site preparation guide (4.6 kW cabinet).
//  - SGI Origin 2000: SGI installation guide HR-04122 (2.71 kW a rack).
//  - Sun Enterprise 10000: Sun documentation (13.5 kW maximum).
//  - Rack and tower servers: the watts already on each part (vendor TDP / PSU class).
export const MACHINE_SPECS = {
  mark1: { kw: 27, flops: 830, memBytes: 2560, real: "Ferranti Mark 1 (1951)" },
  ibm7090: { kw: 50, flops: 100e3, memBytes: 147e3, real: "IBM 7090 (1959)" },
  s360: { kw: 6.5, flops: 133e3, memBytes: 256e3, real: "IBM System/360 Model 50 (1965)" },
  pdp1120: { kw: 0.4, flops: 300e3, memBytes: 56e3, real: "DEC PDP-11/20 (1970)" },
  vax780: { kw: 6.45, flops: 1e6, memBytes: 8e6, real: "DEC VAX-11/780 (1977)" },
  cray1: { kw: 115, flops: 160e6, memBytes: 8e6, real: "Cray-1 (1976)" },
  xmp: { kw: 345, flops: 800e6, memBytes: 128e6, real: "Cray X-MP/48 (1982)" },
  cray2: { kw: 195, flops: 1.9e9, memBytes: 2e9, real: "Cray-2 (1985)" },
  ymp: { kw: 150, flops: 2.67e9, memBytes: 256e6, real: "Cray Y-MP (1988)" },
  c90: { kw: 398, flops: 16e9, memBytes: 2e9, real: "Cray C90, 16 CPUs (1991)" },
  t3d: { kw: 41.4, flops: 19.2e9, memBytes: 8e9, real: "Cray T3D, 128 PEs (1993)" },
  t90: { kw: 419, flops: 57.6e9, memBytes: 8e9, real: "Cray T90, 32 CPUs (1995)" },
  t3e: { kw: 4.75, flops: 38.4e9, memBytes: 8e9, real: "Cray T3E, one air-cooled cabinet (1996)" },
  xt3: { kw: 14.5, flops: 460e9, memBytes: 192e9, real: "Cray XT3, one cabinet (2004)" },
  xt5: { kw: 35, flops: 11.6e12, memBytes: 1.5e12, real: "Cray XT5, one cabinet (2008)" },
  xc30: { kw: 90, flops: 77e12, memBytes: 12e12, real: "Cray XC30, one cabinet (2012)" },
  crayex: { kw: 390, flops: 22.7e15, memBytes: 131e12, real: "HPE Cray EX, one cabinet (2021)" },
  cm5: { kw: 72.5, flops: 131e9, memBytes: 32e9, real: "Thinking Machines CM-5/1024 (1991)" },
  alpha8400: { kw: 4.6, flops: 7.2e9, memBytes: 14e9, real: "DEC AlphaServer 8400 (1995)" },
  origin2000: { kw: 2.71, flops: 3.1e9, memBytes: 16e9, real: "SGI Origin 2000, one rack (1996)" },
  e10k: { kw: 13.5, flops: 32e9, memBytes: 64e9, real: "Sun Enterprise 10000 (1997)" },
  towerT4: { kw: 0.3, flops: 1e6, memBytes: 16e6, real: "486 tower server (1989)" },
  rack2u: { kw: 0.3, flops: 1e9, memBytes: 1e9, real: "2U dual Pentium III (1999)" },
  bladeB2: { kw: 0.25, flops: 40e9, memBytes: 16e9, real: "Dual-socket dual-core blade (2006)" },
  rack1: { kw: 0.35, flops: 330e9, memBytes: 128e9, real: "1U dual 8-core Xeon E5 (2012)" },
  rack4: { kw: 1, flops: 660e9, memBytes: 512e9, real: "4U quad 8-core Xeon E5 (2012)" },
  calx: { kw: 0.1, flops: 22e9, memBytes: 16e9, real: "Calxeda EnergyCore box (2012)" },
  altra: { kw: 0.25, flops: 3.8e12, memBytes: 512e9, real: "Ampere Altra 80-core 1U (2020)" },
};

export function machineSpec(id) {
  return MACHINE_SPECS[id] || null;
}

const SI = [
  [1e15, "P"],
  [1e12, "T"],
  [1e9, "G"],
  [1e6, "M"],
  [1e3, "k"],
];

function si(n, unit, digits = 3) {
  const v = Number(n) || 0;
  for (const [f, p] of SI) if (v >= f) return `${Number((v / f).toPrecision(digits))} ${p}${unit}`;
  return `${Number(v.toPrecision(digits))} ${unit}`;
}

export const fmtFlops = (n) => si(n, "FLOPS");
export const fmtKw = (kw) => (kw >= 1000 ? `${Number((kw / 1000).toPrecision(3))} MW` : kw >= 1 ? `${Number(kw.toPrecision(3))} kW` : `${Math.round(kw * 1000)} W`);
export function fmtBytes(b) {
  const v = Number(b) || 0;
  if (v >= 1e12) return `${Number((v / 1e12).toPrecision(3))} TB`;
  if (v >= 1e9) return `${Number((v / 1e9).toPrecision(3))} GB`;
  if (v >= 1e6) return `${Number((v / 1e6).toPrecision(3))} MB`;
  if (v >= 1e3) return `${Number((v / 1e3).toPrecision(3))} KB`;
  return `${Math.round(v)} B`;
}
