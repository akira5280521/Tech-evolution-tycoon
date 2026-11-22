// The PC build bench: parts must fit, and the PC makes R&D.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { PARTS, benchPlans, benchStock, facilityUnlocked, fitPart, partCost, purchasePart } from "../../src/lib/facilities.js";
import { RESEARCH, researchItem, serverOutput } from "../../src/lib/research.js";
import { BENCH_PARTS } from "../../src/lib/benchParts.js";

const upTo = (id, done = RESEARCH.map((e) => e.id)) => ({
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= BUSINESSES.findIndex((x) => x.id === id) ? 1 : 0 })),
  techDone: done,
  facilities: { mine: {}, cluster: {}, servers: {}, bench: {} },
  cash: 1e40,
});
const part = (id) => PARTS.find((p) => p.id === id);

test("every bench part has a research project of its year, and every CPU has a board", () => {
  for (const p of BENCH_PARTS) {
    assert.equal(researchItem(p.research)?.year, p.year, p.id);
    if (p.kind === "cpu") assert.ok(BENCH_PARTS.some((b) => b.kind === "board" && b.socket === p.socket), `${p.id} has no board`);
    if (p.kind === "board") assert.ok(BENCH_PARTS.some((m) => m.kind === "stick" && m.mem === p.mem), `${p.id} has no memory`);
  }
});

test("the bench opens with Home Computers and a 1977 PC makes R&D", () => {
  const s = upTo("homepc");
  assert.ok(facilityUnlocked(s, "bench"));
  for (const id of ["b-orchard2", "c-6502", "m-4116"]) assert.ok(purchasePart(s, "bench", id).ok, id);
  const b = benchStock(s.facilities.bench);
  assert.equal(b.memory, 1);
  assert.ok(serverOutput(s).bench > 0);
  // Nothing from the 1980s yet.
  assert.equal(purchasePart(s, "bench", "b-5150").ok, false);
});

test("a CPU needs its socket, memory its slots", () => {
  const counts = { "b-440bx": 1 };
  assert.match(fitPart(counts, "bench", "c-k62").reason, /Socket 7/);
  assert.match(fitPart(counts, "bench", "m-edo").reason, /72-pin SIMM/);
  assert.ok(!fitPart(counts, "bench", "c-p2").reason);
  // The Z370 board looks like Z170 but takes only the newer chips.
  assert.ok(fitPart({ "b-z170": 1 }, "bench", "c-8700k").reason);
});

test("a new board takes out what doesn't fit, sold back at half", () => {
  const counts = { "b-440bx": 1, "c-p3": 1, "m-pc133": 2 };
  const fit = fitPart(counts, "bench", "b-kt266a");
  assert.equal(fit.counts["c-p3"] || 0, 0);
  assert.equal(fit.counts["m-pc133"] || 0, 0);
  assert.equal(fit.counts["b-440bx"] || 0, 0);
  const half = (id, n) => (partCost(part(id), 0) * n) / 2;
  assert.equal(fit.refund, half("b-440bx", 1) + half("c-p3", 1) + half("m-pc133", 2));
});

test("a new CPU replaces the old one, and memory short slows it", () => {
  const counts = { "b-440bx": 1, "c-p2": 1, "m-pc66": 1 };
  assert.equal(benchStock(counts).memory, 1);
  const fit = fitPart(counts, "bench", "c-p3");
  assert.equal(fit.counts["c-p2"] || 0, 0);
  assert.ok(benchStock(fit.counts).memory < 1, "a P-III wants 64 MB");
});

test("the upgrade plan buys a board, CPU and memory that work together", () => {
  const s = upTo("supercluster");
  const [best] = benchPlans(s);
  assert.ok(best);
  for (const id of best.steps) assert.ok(purchasePart(s, "bench", id).ok, id);
  assert.equal(benchStock(s.facilities.bench).memory, 1);
  assert.ok(benchStock(s.facilities.bench).perf > 0);
});

test("chipsets support only their real CPUs", () => {
  // A 430FX board is single-voltage: no K6; the 430TX takes it.
  assert.match(fitPart({ "b-430fx": 1 }, "bench", "c-k6").reason, /chipset/);
  assert.ok(!fitPart({ "b-430tx": 1 }, "bench", "c-k6").reason);
  // B550 doesn't take a first-generation AM4 chip; X370 does.
  assert.match(fitPart({ "b-b550": 1 }, "bench", "c-1800x").reason, /chipset/);
  assert.ok(!fitPart({ "b-x370": 1 }, "bench", "c-1800x").reason);
  // The 4790K needs a 9-series board.
  assert.match(fitPart({ "b-z87": 1 }, "bench", "c-4790k").reason, /chipset/);
  // A DDR4 Z690 board takes the 12900K; an AM5 chip can't use DDR4 at all.
  assert.ok(!fitPart({ "b-z690d4": 1 }, "bench", "c-12900k").reason);
});

test("memory speed, memory locks and overclocking change the PC's speed", () => {
  const fast = benchStock({ "b-z390": 1, "c-9900k": 1, "m-ddr4c": 1, "p-750": 1, "h-d15": 1 });
  const locked = benchStock({ "b-b360": 1, "c-9900k": 1, "m-ddr4c": 1, "p-750": 1, "h-d15": 1 });
  assert.equal(locked.memSpeed, 2666, "B360 holds memory to the CPU's rating");
  assert.equal(fast.memSpeed, 3600);
  assert.equal(fast.overclock, 1.1);
  assert.equal(locked.overclock, 1);
  assert.ok(fast.perf > locked.perf * 1.1);
  // Slow memory holds a CPU back a little.
  const slow = benchStock({ "b-z390": 1, "c-9900k": 1, "m-ddr4a": 2, "p-750": 1, "h-d15": 1 });
  assert.ok(slow.perf < fast.perf && slow.perf > fast.perf * 0.8);
});

test("every board lists its drive connections", () => {
  for (const b of BENCH_PARTS.filter((p) => p.kind === "board")) {
    assert.ok(Number.isFinite(b.ide) && Number.isFinite(b.sata) && Number.isFinite(b.m2), b.id);
  }
  assert.equal(BENCH_PARTS.find((p) => p.id === "b-x670e").m2, 5);
});

test("supplies have the board plugs of their day", () => {
  // A 1995 ATX supply has no 4-pin or 8-pin CPU plug for a 2010-era board.
  assert.match(fitPart({ "b-z68": 1 }, "bench", "p-atx250").reason, /24-pin/);
  assert.match(fitPart({ "b-875p": 1 }, "bench", "p-atx250").reason, /4-pin 12 V CPU plug/);
  // A modern supply has no AT plugs for a 486 board.
  assert.match(fitPart({ "b-vlb": 1 }, "bench", "p-750").reason, /AT power plugs/);
  // A 24-pin (20+4) plug still fits a 20-pin board.
  assert.ok(!fitPart({ "b-440bx": 1 }, "bench", "p-750").reason);
  // A card needs its power plug.
  assert.match(fitPart({ "b-z690": 1, "p-750": 1 }, "bench", "v-4090").reason, /16-pin/);
});

test("graphics: keyed AGP, PCIe generations and the CPU/GPU bottleneck", () => {
  // A 3.3 V AGP card doesn't fit a 1.5 V-only slot; a universal one does.
  assert.match(fitPart({ "b-875p": 1 }, "bench", "v-tnt").reason, /keyed/);
  assert.ok(!fitPart({ "b-875p": 1 }, "bench", "v-gf256").reason);
  // A PCIe 4.0 card in a PCIe 3.0 board runs at 3.0.
  const b = benchStock({ "b-z390": 1, "c-9900k": 1, "m-ddr4c": 1, "p-750": 1, "v-3080": 1 });
  assert.equal(b.link, 3);
  // A top card on an old CPU: the CPU is the bottleneck.
  const slow = benchStock({ "b-z77": 1, "c-3770k": 1, "m-ddr3b": 1, "p-atx3": 1, "v-4090": 1, "h-d14": 1 });
  assert.equal(slow.bottleneck, "cpu");
  const weak = benchStock({ "b-z790": 1, "c-14900k": 1, "m-ddr5c": 1, "p-750": 1, "v-gtx680": 1, "a-lf420": 1 });
  assert.equal(weak.bottleneck, "graphics");
});

import { driveLink } from "../../src/lib/facilities.js";

test("drives run at the slowest of drive and port, by SATA and PCIe generation", () => {
  const p = (id) => BENCH_PARTS.find((x) => x.id === id);
  // A 6 Gbit/s SATA SSD on a 3 Gbit/s port runs at 300 MB/s.
  assert.equal(driveLink(p("d-840pro"), p("b-x58")).mbs, 300);
  assert.equal(driveLink(p("d-840pro"), p("b-z77")).mbs, 540);
  // A PCIe 4.0 NVMe drive in a PCIe 3.0 M.2 slot runs at 3.0 speed.
  assert.equal(driveLink(p("d-980pro"), p("b-z390")).mbs, 3500);
  // Z97's M.2 slot is PCIe 2.0 x2.
  assert.equal(driveLink(p("d-950pro"), p("b-z97")).mbs, 800);
  // No IDE on a 2011 board; no M.2 on a 2008 one; MFM needs an ISA slot.
  assert.match(fitPart({ "b-z68": 1 }, "bench", "d-dm9").reason, /IDE/);
  assert.match(fitPart({ "b-x58": 1 }, "bench", "d-980pro").reason, /M\.2/);
  assert.match(fitPart({ "b-z690": 1 }, "bench", "d-st225").reason, /ISA/);
  // Before boards had IDE ports, an IDE drive used a paddle card.
  assert.equal(driveLink(p("d-cp3044"), p("b-deskpro")).text, "IDE on a paddle card");
});

test("3D-only add-ins need a 2D card, and two Add-in 2s split the work", () => {
  const base = { "b-440bx": 1, "c-p2": 1, "m-pc100": 1, "p-atx250": 1 };
  const alone = benchStock({ ...base, "a-voodoo2": 1 });
  const with2d = benchStock({ ...base, "v-riva128": 1, "a-voodoo2": 1 });
  assert.equal(alone.gfx, 0);
  assert.ok(with2d.gfx > 4);
  const sli = fitPart({ ...base, "v-riva128": 1, "a-voodoo2": 1 }, "bench", "a-voodoo2");
  assert.equal(sli.counts["a-voodoo2"], 2);
  assert.ok(benchStock(sli.counts).gfx > with2d.gfx);
});

test("3D-only add-ins go out of production once combined cards arrive", () => {
  const s = upTo("gpu", RESEARCH.map((e) => e.id).filter((id) => id !== "vid-voodoo3" && id !== "gpu-256"));
  assert.ok(purchasePart(s, "bench", "b-440bx").ok);
  assert.ok(purchasePart(s, "bench", "a-monster").ok, "on sale before the 2D/3D cards");
  s.techDone = [...s.techDone, "vid-voodoo3"];
  assert.equal(purchasePart(s, "bench", "a-blaster2").ok, false, "out of production after the Threefold 3000");
  assert.equal(s.facilities.bench["a-monster"], 1, "the one on the bench keeps working");
});

test("sound: printer-port devices, onboard sound from 1999, cards beat onboard", () => {
  const p = (id) => BENCH_PARTS.find((x) => x.id === id);
  assert.ok(!fitPart({ "b-deskpro": 1 }, "bench", "s-covox").reason, "the Covox plugs into the printer port");
  assert.equal(p("b-440bx").onboardSound, 0);
  assert.equal(p("b-z690").onboardSound, 0.02);
  const base = { "b-z690": 1, "c-12900k": 1, "m-ddr5b": 1, "p-750": 1, "v-3080": 1 };
  assert.ok(benchStock({ ...base, "s-ae5": 1 }).perf > benchStock(base).perf);
});

test("losing formats go out of production; a PCIe-card SSD runs at the slot's generation", () => {
  const p = (id) => BENCH_PARTS.find((x) => x.id === id);
  const s = upTo("supercluster", RESEARCH.map((e) => e.id));
  assert.ok(purchasePart(s, "bench", "b-z390").ok);
  assert.equal(purchasePart(s, "bench", "r-hddvd").ok, false, "HD DVD lost to Blu-ray");
  assert.ok(purchasePart(s, "bench", "r-bd").ok);
  assert.equal(driveLink(p("d-900p"), p("b-z77")).text, "on a PCIe 3.0 card");
  assert.equal(driveLink(p("d-900p"), p("b-p67")).mbs, 800, "PCIe 2.0 slot");
});

import { canStartResearch, startResearch, secondTechSlot } from "../../src/lib/research.js";

test("a four-core CPU on the bench lets two Tech projects run at once", () => {
  const s = upTo("supercluster", []);
  s.data = 1e9;
  s.techDone = RESEARCH.map((e) => e.id).filter((id) => !["net-be", "snd-ae7"].includes(id));
  assert.ok(startResearch(s, "net-be").ok);
  assert.equal(canStartResearch(s, "snd-ae7"), false, "one slot without a four-core CPU");
  s.facilities.bench = { "b-z690": 1, "c-12900k": 1, "m-ddr5b": 1, "p-750": 1 };
  assert.ok(secondTechSlot(s));
  assert.ok(startResearch(s, "snd-ae7").ok);
  assert.equal(s.techJob2.id, "snd-ae7");
});

test("coolers: socket mounts, case fit, heat and the overclock switch", () => {
  // No mount for LGA1700 on a 2008 cooler; a 165 mm tower won't fit a mini-ITX case.
  assert.match(fitPart({ "b-z690": 1 }, "bench", "h-212").reason, /mounting kit/);
  assert.match(fitPart({ "b-z690": 1, "k-itx": 1 }, "bench", "h-d15").reason, /too tall/);
  // A 420 mm radiator needs a case with a 420 mm mount.
  assert.match(fitPart({ "b-z690": 1, "k-airflow": 1 }, "bench", "a-lf420").reason, /420 mm/);
  assert.ok(!fitPart({ "b-z690": 1, "k-mesh": 1 }, "bench", "a-lf420").reason);
  const pc = { "b-z690": 1, "c-14900k": 1, "m-ddr5b": 1, "p-1600": 1 };
  const hot = benchStock(pc);
  assert.ok(hot.thermal < 1, "no cooler: the CPU slows down");
  const stock = benchStock({ ...pc, "h-d15g2": 1 });
  assert.equal(stock.thermal, 1);
  assert.equal(stock.ocOn, false, "260 W can't take an overclocked 14900K");
  const oc = benchStock({ ...pc, "a-lf420": 1 });
  assert.equal(oc.ocOn, true);
  assert.equal(benchStock({ ...pc, "a-lf420": 1 }, { oc: false }).ocOn, false, "the switch turns it off");
  // Up to the 386, no cooler needed.
  assert.equal(benchStock({ "b-deskpro": 1, "c-386": 1, "m-41256": 4, "p-at150": 1 }).thermal, 1);
});

import { partLock } from "../../src/lib/facilities.js";
test("cases: form factors, SFX supplies, airflow and the end of BTX", () => {
  // E-ATX boards need a big case; mini-ITX boards fit almost anything.
  assert.match(fitPart({ "b-zenith": 1 }, "bench", "k-airflow").reason, /E-ATX/);
  assert.ok(!fitPart({ "b-zenith": 1 }, "bench", "k-mesh").reason);
  assert.ok(!fitPart({ "b-b550i": 1 }, "bench", "k-nr200").reason);
  assert.ok(!fitPart({ "b-b550i": 1 }, "bench", "k-lancool").reason);
  // A small case takes only an SFX supply; an ATX case takes either.
  assert.match(fitPart({ "k-nr200": 1 }, "bench", "p-750").reason, /SFX/);
  assert.ok(!fitPart({ "k-nr200": 1 }, "bench", "p-sf750").reason);
  assert.ok(!fitPart({ "k-lancool": 1 }, "bench", "p-sf750").reason);
  assert.match(fitPart({ "p-750": 1 }, "bench", "k-m1").reason, /SFX/);
  // BTX boards only go in BTX cases.
  assert.match(fitPart({ "b-915btx": 1 }, "bench", "k-atxmid").reason, /BTX/);
  assert.ok(!fitPart({ "b-915btx": 1 }, "bench", "k-btx").reason);
  // A case with better airflow lets the same cooler take more heat.
  const pc = { "b-z690": 1, "c-14900k": 1, "m-ddr5b": 1, "p-1600": 1, "h-d15g2": 1 };
  assert.ok(benchStock({ ...pc, "k-mesh": 1 }).coolCap > benchStock({ ...pc, "k-o11": 1 }).coolCap);
  // BTX went out of production once the 2008 cases arrived.
  const s = upTo(BUSINESSES[BUSINESSES.length - 1].id);
  assert.match(partLock(s, part("k-btx")) || "", /back to ATX/);
});

test("monitors: ports must match, and a monitor caps the graphics it shows", () => {
  const pc = { "b-z690": 1, "c-12900k": 1, "m-ddr5b": 1, "p-1600": 1, "h-d15g2": 1, "v-4090": 1 };
  // A 2022 card has no VGA or DVI port.
  assert.match(fitPart(pc, "bench", "y-fw900").reason, /No VGA port/);
  assert.match(fitPart(pc, "bench", "y-3007").reason, /No DVI port/);
  assert.ok(!fitPart(pc, "bench", "y-pg32").reason);
  // The 1981 card only drives the TTL monitors; built-in computers need none.
  assert.ok(!fitPart({ "b-5150": 1, "c-8088": 1, "v-cga": 1 }, "bench", "y-5153").reason);
  assert.match(fitPart({ "b-orchard2": 1 }, "bench", "y-5153").reason, /own screen/);
  // No monitor: a borrowed screen shows 90%; an old one caps a new card.
  const bare = benchStock(pc);
  const capped = benchStock({ ...pc, "y-p2715q": 1 });
  const full = benchStock({ ...pc, "y-pg32": 1 });
  assert.ok(Math.abs(bare.gfx - full.gfx * 0.9) < 1e-9);
  assert.equal(capped.gfx, 28);
  assert.ok(capped.screenCapped);
  assert.ok(full.perf >= capped.perf);
});

test("expansion cards: the right slot, two at most, RAID needs a disk, PhysX retires", () => {
  const pc = { "b-z87": 1, "c-4770k": 1 };
  assert.match(fitPart({ "b-z690": 1 }, "bench", "x-wintv").reason, /ISA/);
  assert.match(fitPart(pc, "bench", "x-raid5805").reason, /disk/);
  let c = fitPart(pc, "bench", "x-hd60").counts;
  c = fitPart(c, "bench", "x-physx").counts;
  const third = fitPart(c, "bench", "x-4k60");
  assert.equal(Object.keys(third.counts).filter((k) => k.startsWith("x-")).length, 2, "a third card replaces one");
  assert.match(third.note, /replaces/);
  const s = upTo(BUSINESSES[BUSINESSES.length - 1].id);
  assert.match(partLock(s, part("x-physx")) || "", /graphics cards took over/);
});

test("COAST cache: only on boards with the slot, adds a little, gone once cache moved onto the CPU", () => {
  assert.match(fitPart({ "b-440bx": 1 }, "bench", "q-coast256").reason, /COAST/);
  const pc = { "b-430fx": 1, "c-k5": 1, "m-edo": 2, "p-at230": 1, "h-586fan": 1 };
  const with256 = fitPart(pc, "bench", "q-coast256");
  assert.ok(!with256.reason);
  assert.ok(benchStock(with256.counts).perf > benchStock(pc).perf);
  const s = upTo(BUSINESSES[BUSINESSES.length - 1].id);
  assert.match(partLock(s, part("q-coast512")) || "", /onto the CPU/);
});

test("SLI and CrossFire: matching pair, a board that supports it, the right bridge", () => {
  const pc = { "b-z97": 1, "c-4790k": 1, "m-ddr3b": 2, "p-1000": 1, "k-atxfull": 1, "y-pg32": 1 };
  const one = { ...pc, "v-gtx980": 1 };
  const two = fitPart(one, "bench", "v-gtx980");
  assert.equal(two.counts["v-gtx980"], 2);
  assert.match(two.note, /SLI bridge/);
  // Not linked without a bridge; the CrossFire bridge doesn't fit.
  assert.ok(!benchStock(two.counts).linked);
  assert.match(fitPart(two.counts, "bench", "br-cf").reason, /Doesn't fit/);
  const linked = fitPart(two.counts, "bench", "br-sli").counts;
  const st = benchStock(linked);
  assert.ok(st.linked && st.gfx > benchStock(one).gfx * 1.5);
  assert.ok(st.draw > benchStock(one).draw + 100, "two cards draw twice the power");
  // A card that can't pair, and a board without two-card support.
  assert.match(fitPart({ ...pc, "v-4090": 1 }, "bench", "v-4090").reason, /can't pair/);
  assert.match(fitPart({ "b-h87": 1, "v-gtx980": 1 }, "bench", "v-gtx980").reason, /can't run two cards/);
  // CrossFire on the 290X needs no bridge; the 2018 cards need NVLink.
  const xdma = fitPart({ "b-z97": 1, "v-290x": 1 }, "bench", "v-290x").counts;
  assert.match(fitPart(xdma, "bench", "br-cf").reason, /no bridge needed/);
  assert.match(fitPart({ "b-z390": 1, "v-2080": 2 }, "bench", "br-sli").reason, /Doesn't fit/);
});
