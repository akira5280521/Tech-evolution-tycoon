// T5 items 61 and 62: staged timers for server installs, HQ rooms, the
// bench PC, a business's first opening and an era change.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BENCH_BUILD_MS, FIELD_ENGINEERS, INSTALL, ONLINE_LABEL, installMs, installSet, openingMs, readStages, roomBuildMs, stageAt } from "../../src/lib/stages.js";
import { PARTS, buyFieldEngineers, fieldEngineersQuote, liveCounts, purchasePart, roomJob, settleStages, stageJobs } from "../../src/lib/facilities.js";
import { serverOutput } from "../../src/lib/research.js";
import { cleanLab } from "../../src/lib/empire.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const part = (id) => PARTS.find((p) => p.id === id);
const T0 = 1.8e12;
const ALL_TECH = ["srv-mark1", "srv-7090", "srv-360", "srv-cray1", "store-tape"];
const at = (id) => BUSINESSES.findIndex((b) => b.id === id);
const upTo = (id, extra = {}) => ({
  cash: 1e30, data: 1e6, techDone: ALL_TECH, lab: cleanLab({}),
  supply: Object.fromEntries(["wood", "paper", "sand", "copper", "glass", "filament", "wafers", "germanium", "polysilicon"].map((k) => [k, 1e9])),
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= at(id) ? 5 : 0 })),
  facilities: { servers: {}, bench: {}, mine: {}, cluster: {} },
  ...extra,
});

test("install times scale with era and size: punch cards instant, mainframes minutes, the biggest about an hour", () => {
  assert.equal(installMs(part("tab601")), 0);
  const mark1 = installMs(part("mark1"));
  assert.ok(mark1 >= 60e3 && mark1 <= 5 * 60e3, `${mark1}`);
  assert.ok(installMs(part("cray1")) > installMs(part("s360")));
  assert.equal(installMs(part("crayex")), INSTALL.maxMs);
  for (const p of PARTS.filter((x) => x.kind === "server")) assert.ok(installMs(p) <= 60 * 60e3, p.id);
  assert.ok(installMs(part("rack1")) <= 2 * 60e3);
  assert.equal(installMs(part("cray1"), { repeat: true }), Math.round(installMs(part("cray1")) / 2 / 1000) * 1000);
  assert.equal(installMs(part("cray1"), { engineers: true }), installMs(part("cray1"), { repeat: true }));
  assert.equal(installSet(part("cray1")), "super");
  assert.equal(installSet(part("s360")), "mainframe");
  assert.equal(installSet(part("rack1")), "rack");
});

test("the label walks through the stages and ends Online!", () => {
  const job = { set: "mainframe", startedAt: 0, readyAt: 100 };
  assert.equal(stageAt(job, 0).label, "Truck delivering the cabinets…");
  assert.equal(stageAt(job, 30).label, "Raising the floor tiles…");
  assert.equal(stageAt(job, 50).label, "Running cables under the floor…");
  assert.equal(stageAt(job, 70).label, "Loading the operating system tapes…");
  assert.equal(stageAt(job, 90).label, "Burn-in test…");
  assert.equal(stageAt(job, 100).label, ONLINE_LABEL);
  assert.equal(stageAt(job, 100).done, true);
  assert.equal(stageAt({ set: "opening", startedAt: 0, readyAt: 10 }, 0).label, "Hiring staff…");
  assert.equal(stageAt({ set: "retool", startedAt: 0, readyAt: 10 }, 9).label, "First production run…");
});

test("a bought machine installs before it runs; several install side by side; time away finishes them", () => {
  const s = upTo("supercomputers");
  settleStages(s, T0);
  assert.ok(purchasePart(s, "servers", "mgset", T0).ok);
  assert.ok(purchasePart(s, "servers", "roomac", T0).ok);
  assert.ok(purchasePart(s, "servers", "s360", T0).ok);
  assert.ok(purchasePart(s, "servers", "s360", T0 + 1000).ok);
  assert.equal(stageJobs(s).filter((j) => j.kind === "install").length, 2, "two at once, in parallel");
  assert.equal(liveCounts(s, "servers").s360, 0);
  assert.equal(serverOutput(s).perSecond, 0);
  // The app was closed for an hour: both are online.
  settleStages(s, T0 + 3600e3);
  assert.equal(stageJobs(s).length, 0);
  assert.equal(liveCounts(s, "servers").s360, 2);
  assert.ok(serverOutput(s).perSecond > 0);
  // The next 360/50 is a repeat: half the time.
  assert.ok(purchasePart(s, "servers", "s360", T0 + 4000e3).ok);
  const job = stageJobs(s).find((j) => j.partId === "s360");
  assert.equal(job.readyAt - job.startedAt, installMs(part("s360"), { repeat: true }));
  // Room equipment and the punch-card machine are instant.
  assert.equal(stageJobs(s).filter((j) => j.partId === "mgset" || j.partId === "tab601").length, 0);
});

test("a new HQ room is built the first time its plant opens; old saves count open rooms as built", () => {
  const old = upTo("homepc");
  settleStages(old, T0);
  assert.deepEqual(old.roomsBuilt.sort(), ["bench", "servers"]);
  assert.equal(stageJobs(old).length, 0);
  const fresh = upTo("homepc", { roomsBuilt: ["servers"] });
  settleStages(fresh, T0);
  const job = roomJob(fresh, "bench");
  assert.ok(job);
  assert.equal(job.readyAt - T0, roomBuildMs("bench"));
  // Nothing goes in while it is being built.
  const r = purchasePart(fresh, "bench", "b-altair", T0 + 1000);
  assert.equal(r.reason, "Under construction");
  settleStages(fresh, T0 + roomBuildMs("bench"));
  assert.ok(fresh.roomsBuilt.includes("bench"));
  assert.ok(fresh.lab.stagesSeen.includes("room:bench"));
  // A later run builds it in half the time.
  const again = upTo("homepc", { roomsBuilt: ["servers"], lab: fresh.lab });
  settleStages(again, T0);
  assert.equal(roomJob(again, "bench").readyAt - T0, roomBuildMs("bench", true));
});

test("a business's first opening grows with the era, up to 3 minutes; a repeat is half", () => {
  assert.equal(openingMs(0), 8000);
  assert.ok(openingMs(at("mainframes")) > openingMs(at("paper")));
  assert.equal(openingMs(BUSINESSES.length - 1), 3 * 60e3);
  assert.equal(openingMs(BUSINESSES.length - 1, true), 90e3);
  assert.ok(openingMs(1, true) >= 8000);
  assert.equal(BENCH_BUILD_MS, 90e3);
});

test("field engineers cost R&D points (never money), need Mainframes, and are kept", () => {
  const early = upTo("paper");
  assert.equal(fieldEngineersQuote(early).ok, false);
  const s = upTo("mainframes", { data: FIELD_ENGINEERS.cost });
  const cash = s.cash;
  assert.ok(buyFieldEngineers(s).ok);
  assert.equal(s.data, 0);
  assert.equal(s.cash, cash);
  assert.equal(cleanLab(s.lab).fieldEngineers, true);
  assert.equal(fieldEngineersQuote(s).owned, true);
});

test("the save reader keeps sane jobs only and caps an install at an hour", () => {
  const jobs = readStages([
    { kind: "install", facilityId: "servers", partId: "cray1", set: "super", startedAt: 10, readyAt: 20 },
    { kind: "install", facilityId: "servers", partId: "cray1", startedAt: 10, readyAt: 10 + 9e9 },
    { kind: "nope", facilityId: "servers", startedAt: 1, readyAt: 2 },
    { kind: "room", facilityId: "mine", startedAt: 5, readyAt: 1 },
    null,
  ]);
  assert.equal(jobs.length, 2);
  assert.equal(jobs[1].readyAt - jobs[1].startedAt, INSTALL.maxMs);
  assert.deepEqual(readStages(undefined), []);
});

test("buying a business's first unit opens it over its opening time; later buys are instant", async () => {
  const { buyBusiness, freshState } = await import("../../src/lib/playState.js");
  const s = freshState(T0);
  s.cash = 1e12;
  s.erasOpened = [BUSINESSES[1].id];
  const r = buyBusiness(s, 1, "x1", T0);
  assert.ok(r.ok);
  assert.equal(s.biz[1].commissionMs, openingMs(1, false), "first time ever");
  assert.equal(s.biz[1].commissionUntil, T0 + s.biz[1].commissionMs);
  const until = s.biz[1].commissionUntil;
  buyBusiness(s, 1, "x1", T0 + 1);
  assert.equal(s.biz[1].commissionUntil, until);
});
