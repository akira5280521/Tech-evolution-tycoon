// Room status panels (T5 item 53): a few bars per room, each against its
// limit, so the player can see at a glance what holds a room back. Display
// only: every number comes from the same stock the game already runs on.
//
// Research servers show real figures from MACHINE_SPECS: power draw in kW
// (which is also the heat the room must remove), compute in FLOPS. The
// limits keep the game's own rules: a room with half the generators it needs
// can supply half its machines' real draw.
import { MINE_RAM_GB, PARTS, TIERS, benchJob, benchStock, liveCounts, plantShort, plantStock, readFacilities, stageJobs } from "./facilities.js";
import { MACHINE_SPECS, fmtBytes, fmtFlops, fmtKw } from "./machineSpecs.js";

const EPS = 1e-6;
const COOLANT = { air: "air", freon: "Freon", fluorinert: "Fluorinert", water: "chilled-water" };
const GROUP = { room: "machine room", rack: "racks" };

function bar(id, label, icon, value, limit, text, extra = {}) {
  const v = Math.max(0, Number(value) || 0);
  const l = Math.max(0, Number(limit) || 0);
  // The bar runs to a little past the larger of the two, so the limit
  // marker and an over-limit fill both stay on screen.
  const top = Math.max(v, l) * 1.15 || 1;
  return { id, label, icon, value: v, limit: l, text, fill: v / top, mark: l / top, bad: false, alert: null, ...extra };
}

function partName(short, kind) {
  return short?.kind === kind && short.part ? short.part.name : null;
}

function alertText(what, name, fallback) {
  return `${what} short: add ${name ? (/^[AEIOU]/i.test(name) ? "an " : "a ") + name : fallback}`;
}

function serverStatus(state, counts) {
  const s = plantStock(counts, "servers");
  const short = plantShort(state, "servers");
  // Real kW and FLOPS per group, from the machines installed.
  const real = { room: { kw: 0, by: {} }, rack: { kw: 0, by: {} } };
  let flops = 0;
  let running = 0;
  let online = 0;
  let memBytes = 0;
  for (const part of PARTS) {
    const n = counts[part.id] || 0;
    if (n <= 0 || !part.fits.includes("servers")) continue;
    if (part.kind === "tabulator") online += n;
    if (part.kind !== "server") continue;
    online += n;
    const spec = MACHINE_SPECS[part.id];
    const kw = (spec?.kw ?? (part.watts || 0) / 1000) * n;
    const g = real[part.group];
    if (!g) continue;
    const coolant = part.coolant || "air";
    g.kw += kw;
    g.by[coolant] = (g.by[coolant] || 0) + kw;
    const f = (spec?.flops || 0) * n;
    flops += f;
    memBytes += (spec?.memBytes || 0) * n;
    const gs = s.groups[part.group];
    running += f * (gs?.speed ?? 0) * (part.group === "rack" ? s.netFactor : 1);
  }
  // Supply and cooling in real kW: the game's ratio of what's installed to
  // what's needed, applied to the real draw.
  let draw = 0;
  let supply = 0;
  let heat = 0;
  let cooling = 0;
  let powerShort = null;
  let coolShort = null;
  for (const [id, g] of Object.entries(s.groups)) {
    const r = real[id];
    if (g.watts <= 0) continue;
    draw += r.kw;
    supply += r.kw * (g.power / g.watts);
    if (g.power + EPS < g.watts && !powerShort) powerShort = id;
    for (const [coolant, c] of Object.entries(g.by)) {
      if (c.watts <= 0) continue;
      const kw = r.by[coolant] || 0;
      heat += kw;
      cooling += kw * (c.cool / c.watts);
      if (c.cool + EPS < c.watts && !coolShort) coolShort = { group: id, coolant };
    }
  }
  const bars = [];
  const compute = bar("compute", "COMPUTE", "cpu", running, flops, `${fmtFlops(running)} / ${fmtFlops(flops)}`, { tone: "blue" });
  bars.push(compute);
  const storage = bar("storage", "STORAGE", "disk", s.need * 1e9, s.storage * 1e9, `${fmtBytes(s.need * 1e9)} / ${fmtBytes(s.storage * 1e9)}`, { tone: "green" });
  if (s.need > 0 && s.storage < s.need) {
    storage.bad = true;
    storage.alert = alertText("Storage", partName(short, "disk"), "a disk");
  }
  bars.push(storage);
  const heatBar = bar("heat", "HEAT", "heat", heat, cooling, `${fmtKw(heat)} / ${fmtKw(cooling)}`, { tone: "orange" });
  if (coolShort) {
    heatBar.bad = true;
    const name = partName(short, "cool");
    heatBar.alert = alertText("Cooling", name, `${COOLANT[coolShort.coolant] || coolShort.coolant} cooling for the ${GROUP[coolShort.group]}`);
  }
  bars.push(heatBar);
  const power = bar("power", "POWER", "bolt", draw, supply, `${fmtKw(draw)} / ${fmtKw(supply)}`, { tone: "yellow" });
  if (powerShort) {
    power.bad = true;
    power.alert = alertText("Power", partName(short, "power"), `power for the ${GROUP[powerShort]}`);
  }
  bars.push(power);
  const rackWork = s.groups.rack.work;
  if (rackWork > 0) {
    const carried = Math.min(s.linkCap, rackWork);
    const net = bar("network", "NETWORK", "link", rackWork, carried, `${Math.round((carried / rackWork) * 100)}% of rack traffic`, { tone: "blue" });
    if (s.netFactor < 0.999) {
      net.bad = true;
      net.alert = alertText("Network", partName(short, "link"), "a network switch");
    }
    bars.push(net);
  }
  return { online, memBytes, bars };
}

function cardPlantStatus(state, counts, facilityId) {
  const s = plantStock(counts, facilityId);
  const short = plantShort(state, facilityId);
  const mine = facilityId === "mine";
  const bars = [];
  const runningWork = s.work * s.speed;
  bars.push(bar(mine ? "hash" : "compute", mine ? "HASH" : "COMPUTE", "cpu", runningWork, s.work, mine ? `${Math.round(runningWork)} / ${s.work} MH/s` : `${Math.round(runningWork)} / ${s.work} TFLOPS`, { tone: "blue" }));
  const heat = bar("heat", "HEAT", "heat", s.watts, s.cool, `${fmtKw(s.watts / 1000)} / ${fmtKw(s.cool / 1000)}`, { tone: "orange" });
  if (s.watts > 0 && s.cool < s.watts) {
    heat.bad = true;
    heat.alert = alertText("Cooling", partName(short, "cool"), "a cooler");
  }
  const power = bar("power", "POWER", "bolt", s.watts, s.power, `${fmtKw(s.watts / 1000)} / ${fmtKw(s.power / 1000)}`, { tone: "yellow" });
  if (s.watts > 0 && s.power < s.watts) {
    power.bad = true;
    power.alert = alertText("Power", partName(short, "power"), "a power supply");
  }
  bars.push(power, heat);
  // Memory: the mine needs 16 GB; the cluster wants the RAM of the next
  // model its cards could train.
  const fit = TIERS.find((t) => s.vram >= t.vram && s.ram >= t.ram);
  const want = mine ? MINE_RAM_GB : Math.max(32, (TIERS.slice().reverse().find((t) => s.vram >= t.vram && s.ram < t.ram) || fit || TIERS[TIERS.length - 1]).ram);
  const mem = bar("memory", "MEMORY", "ram", s.ram, want, `${s.ram} / ${want} GB`, { tone: "green" });
  if (s.gpus > 0 && (mine ? s.ram < MINE_RAM_GB : !fit)) {
    mem.bad = true;
    mem.alert = alertText("Memory", partName(short, "ram"), "more RAM");
  }
  bars.push(mem);
  if (!mine && s.gpus > 1) {
    const carried = Math.min(s.linkCap, s.work);
    const net = bar("network", "NETWORK", "link", s.work, carried, `${Math.round((carried / s.work) * 100)}% of card traffic`, { tone: "blue" });
    if (s.netFactor < 0.999) {
      net.bad = true;
      net.alert = alertText("Network", partName(short, "link"), "a card link");
    }
    bars.push(net);
  }
  return { online: s.gpus, bars };
}

function benchStatus(state, counts) {
  const b = benchStock(counts, { oc: state?.benchOc !== false });
  const bars = [];
  bars.push(bar("compute", "SPEED", "cpu", b.cpuPerf, b.cpu ? b.cpu.perf * (b.ocOn ? 1.1 : 1) : 0, b.cpu ? `${Math.round((b.cpuPerf / (b.cpu.perf || 1)) * 100)}% of the ${b.cpu.name}` : "No CPU", { tone: "blue" }));
  const mem = bar("memory", "MEMORY", "ram", b.ramMb * 1e6, b.needMb * 1e6, `${fmtBytes(b.ramMb * 1e6)} / ${fmtBytes(b.needMb * 1e6)}`, { tone: "green" });
  if (b.cpu && b.ramMb < b.needMb) {
    mem.bad = true;
    mem.alert = "Memory short: add memory sticks";
  }
  bars.push(mem);
  const heat = bar("heat", "HEAT", "heat", b.heat, b.coolCap, `${Math.round(b.heat)} / ${Math.round(b.coolCap)} W`, { tone: "orange" });
  if (b.cpu && b.heat > 5 && b.coolCap < b.heat) {
    heat.bad = true;
    heat.alert = "Cooling short: add a CPU cooler that fits";
  }
  bars.push(heat);
  if (b.board && !b.board.builtin) {
    const power = bar("power", "POWER", "bolt", b.draw, b.supply || 0, `${Math.round(b.draw)} / ${b.supply || 0} W`, { tone: "yellow" });
    if (b.draw > (b.supply || 0)) {
      power.bad = true;
      power.alert = "Power short: add a bigger power supply";
    }
    bars.push(power);
  }
  return { online: b.cpu ? 1 : 0, bars };
}

// { online, bars: [{ id, label, icon, value, limit, text, fill, mark, bad, alert, tone }] }
export function roomStatus(state, facilityId) {
  // Machines still coming online don't count yet (T5 item 61).
  const counts = liveCounts({ ...state, facilities: readFacilities(state?.facilities) }, facilityId);
  const installing = stageJobs(state).filter((j) => j.kind === "install" && j.facilityId === facilityId).length;
  let out = { online: 0, bars: [] };
  if (facilityId === "servers") out = serverStatus(state, counts);
  else if (facilityId === "mine" || facilityId === "cluster") out = cardPlantStatus(state, counts, facilityId);
  else if (facilityId === "bench") {
    out = benchStatus(state, counts);
    if (benchJob(state)) out.online = 0;
  }
  return { ...out, installing };
}
