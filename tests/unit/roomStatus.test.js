// T5 item 53: room status bars, each against its limit, red with an alert
// when the room is short.
import { test } from "node:test";
import assert from "node:assert/strict";
import { roomStatus } from "../../src/lib/roomStatus.js";
import { MACHINE_SPECS, fmtBytes, fmtFlops, fmtKw } from "../../src/lib/machineSpecs.js";
import { PARTS } from "../../src/lib/facilities.js";

const ids = (s) => s.bars.map((b) => b.id);
const byId = (s, id) => s.bars.find((b) => b.id === id);

test("every research machine has a real spec with power, compute and memory", () => {
  for (const part of PARTS.filter((p) => p.kind === "server")) {
    const spec = MACHINE_SPECS[part.id];
    assert.ok(spec, part.id);
    assert.ok(spec.kw > 0 && spec.flops > 0 && spec.memBytes > 0 && spec.real, part.id);
  }
  // Rack parts keep the watts already on the part.
  for (const part of PARTS.filter((p) => p.kind === "server" && p.group === "rack")) assert.equal(MACHINE_SPECS[part.id].kw, part.watts / 1000, part.id);
});

test("server room: compute, storage, heat and power; a network bar only with racks", () => {
  const s = roomStatus({ facilities: { servers: { cray1: 1, mgset: 2, freon: 2, pack3330: 1 } } }, "servers");
  assert.deepEqual(ids(s), ["compute", "storage", "heat", "power"]);
  assert.equal(s.online, 1);
  assert.equal(byId(s, "power").value, 115);
  assert.equal(byId(s, "heat").value, 115, "heat is the real draw");
  assert.ok(s.bars.every((b) => !b.bad && !b.alert));
  assert.equal(byId(s, "compute").text, "160 MFLOPS / 160 MFLOPS");
  const racks = roomStatus({ facilities: { servers: { rack1: 2, psu400: 2, labfan: 3, hdd1t: 1 } } }, "servers");
  assert.ok(ids(racks).includes("network"));
  assert.equal(byId(racks, "network").bad, true);
  assert.match(byId(racks, "network").alert, /^Network short/);
});

test("server room short of cooling and power: those bars go red with an alert", () => {
  const s = roomStatus({ facilities: { servers: { cray1: 2, mgset: 3, roomac: 0, freon: 1 } } }, "servers");
  const heat = byId(s, "heat");
  const power = byId(s, "power");
  assert.equal(heat.bad, true);
  assert.match(heat.alert, /^Cooling short: add /);
  assert.ok(heat.value > heat.limit && heat.fill > heat.mark);
  assert.equal(power.bad, true);
  assert.match(power.alert, /^Power short: add /);
  assert.equal(byId(s, "storage").bad, true, "no disk for a 1976 machine");
  assert.ok(byId(s, "compute").value < byId(s, "compute").limit, "a short room runs below its installed compute");
});

test("mine, cluster and bench have their own bars", () => {
  const mine = roomStatus({ facilities: { mine: { raster1080: 2, psu750: 1, fans: 1, ddr4_16: 1 } } }, "mine");
  assert.deepEqual(ids(mine), ["hash", "power", "heat", "memory"]);
  assert.equal(byId(mine, "heat").bad, true);
  assert.equal(byId(mine, "memory").bad, false);
  const cluster = roomStatus({ facilities: { cluster: { tensorA100: 2, psu1600: 1, liquid: 2, ddr4_32: 1 } } }, "cluster");
  assert.deepEqual(ids(cluster), ["compute", "power", "heat", "memory", "network"]);
  const bench = roomStatus({ facilities: { bench: {} } }, "bench");
  assert.deepEqual(ids(bench), ["compute", "memory", "heat"]);
  assert.equal(roomStatus({}, "nowhere").bars.length, 0);
});

test("bars keep the fill and the limit marker on screen", () => {
  const s = roomStatus({ facilities: { servers: { cray1: 2, mgset: 3, freon: 1 } } }, "servers");
  for (const b of s.bars) {
    assert.ok(b.fill >= 0 && b.fill <= 1, b.id);
    assert.ok(b.mark >= 0 && b.mark <= 1, b.id);
  }
});

test("unit formatting", () => {
  assert.equal(fmtFlops(160e6), "160 MFLOPS");
  assert.equal(fmtFlops(830), "830 FLOPS");
  assert.equal(fmtKw(0.3), "300 W");
  assert.equal(fmtKw(115), "115 kW");
  assert.equal(fmtKw(1560), "1.56 MW");
  assert.equal(fmtBytes(256e3), "256 KB");
  assert.equal(fmtBytes(7.25e6), "7.25 MB");
});

test("machine spec bars: five log-scale bars from the real model, newer machines longer", async () => {
  const { specBars } = await import("../../src/lib/machineSpecs.js");
  const part = (id) => PARTS.find((p) => p.id === id);
  const s360 = specBars(part("s360"));
  assert.deepEqual(s360.map((b) => b.id), ["speed", "memory", "storage", "power", "heat"]);
  assert.equal(s360[0].text, "133kFLOPS");
  assert.equal(s360[1].text, "256KB");
  assert.equal(s360[2].text, "7.25MB");
  assert.equal(s360[3].text, "6.5kW");
  assert.equal(s360[4].text, s360[3].text, "heat is the power draw");
  const ex = specBars(part("crayex"));
  assert.ok(ex[0].frac > specBars(part("cray1"))[0].frac && specBars(part("cray1"))[0].frac > s360[0].frac);
  for (const p of PARTS.filter((x) => x.kind === "server")) for (const b of specBars(p)) assert.ok(b.frac > 0 && b.frac <= 1, `${p.id} ${b.id}`);
  assert.equal(specBars(part("tab601")), null);
});

test("X-MP/48 draws more room power than the Cray-1 and Cray-2 (345 kW real)", () => {
  const w = (id) => PARTS.find((p) => p.id === id).watts;
  assert.ok(w("xmp") > w("cray1") && w("xmp") > w("cray2"));
});
