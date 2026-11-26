// T2 room checks (GD-10 items 1, 2, 3, 28, 49, 55). Gated like the other
// capture specs: CAPTURE_T2=<dir> writes a room screenshot for every servers
// stage, a live server change and the bench stages, and checks each layer sits
// inside the room banner.
import { test, expect } from "@playwright/test";
import { open, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { ERA_YEAR } from "../../src/lib/eraYear.js";
import { SAVE_VERSION } from "../../src/lib/gameSave.js";
import { PARTS } from "../../src/lib/facilities.js";
import { SERVERS_STAGE_DEFS } from "../../src/lib/rooms/index.js";
import { mkdirSync } from "node:fs";

const DIR = process.env.CAPTURE_T2 || "";
const far = () => Date.now() + 9e9;

function throughYear(year) {
  let reached = 0;
  for (let i = 0; i < BUSINESSES.length; i++) {
    reached = Math.max(reached, ERA_YEAR[BUSINESSES[i].id] || 0);
    if (reached >= year) return i;
  }
  return BUSINESSES.length - 1;
}
const techFor = (parts) => Object.keys(parts).map((id) => PARTS.find((p) => p.id === id)?.research).filter(Boolean);

function save(year, servers, bench = {}, techDone = techFor({ ...servers, ...bench })) {
  const last = throughYear(year);
  return {
    version: SAVE_VERSION, cash: 1e15, lifetime: 1e15, investors: 0, lastSeen: Date.now(), sawPit: true,
    starterGranted: true, hubSeen: true,
    tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
    nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
    facilities: { servers: { ...servers }, bench: { ...bench }, mine: {}, cluster: {} },
    techDone,
    biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= last ? 8 : 0, manager: i <= last, running: false, progress: 0 })),
  };
}

// The parts a stage's trigger names, plus the generator and air a room needs.
function stageParts(stage) {
  const t = stage.trigger;
  const parts = {};
  if (!t) parts.tab601 = 1;
  else if (t.anyParts) parts[t.anyParts[0]] = 1;
  else {
    parts[t.partId] = t.minParts || 1;
    if (t.partId === "tab601") parts.tab601 = t.minParts;
  }
  if (parts.tape || parts.ramac) parts.mark1 = 1;
  if (stage.year >= 1951) { parts.mgset = 1; parts.roomac = 1; }
  if (stage.year >= 1976 && !parts.freon && ["cray1", "xmp"].includes(Object.keys(parts)[0])) parts.freon = 1;
  return parts;
}

const capture = DIR ? test : test.skip;
const view = { width: 412, height: 915 };

// Every layer's box must sit inside the banner, with nothing hanging out.
async function layersInside(page, facility) {
  return page.evaluate((id) => {
    const room = document.querySelector(`[data-facility-room='${id}']`).getBoundingClientRect();
    const out = [];
    for (const el of document.querySelectorAll(`[data-facility-room='${id}'] .facility-room-layer`)) {
      const r = el.getBoundingClientRect();
      if (r.left < room.left - 1 || r.top < room.top - 1 || r.right > room.right + 1 || r.bottom > room.bottom + 1) out.push(el.getAttribute("data-room-slot") || "base");
    }
    return out;
  }, facility);
}

capture("servers room, every stage, and a live server change", async ({ browser }) => {
  mkdirSync(DIR, { recursive: true });
  const problems = [];
  for (const stage of SERVERS_STAGE_DEFS) {
    const page = await browser.newPage();
    await page.setViewportSize(view);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "/facilities/servers", save(stage.year, stageParts(stage)), {});
    await tipsOff(page);
    const room = page.locator("[data-facility-room='servers']");
    await expect(room).toBeVisible();
    await room.screenshot({ path: `${DIR}/servers-${stage.id}.png`, animations: "disabled" });
    const outside = await layersInside(page, "servers");
    if (outside.length) problems.push(`${stage.id}: ${outside.join(",")}`);
    await page.close();
  }
  // A live change: buy each machine on the page and watch the room.
  const page = await browser.newPage();
  await page.setViewportSize(view);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/facilities/servers", save(1977, { tab601: 1 }, {}, ["srv-mark1", "srv-7090", "srv-360", "srv-1120", "srv-780"]), {});
  await tipsOff(page);
  const room = page.locator("[data-facility-room='servers']");
  const base = () => room.locator("img").first().getAttribute("src");
  const slots = () => room.locator("[data-room-slot]").evaluateAll((els) => els.map((e) => e.getAttribute("data-room-slot")));
  let n = 0;
  for (const part of ["mgset", "roomac", "mark1", "ibm7090", "s360", "pdp1120", "vax780"]) {
    await page.locator(`[data-server-tab="${part === "mgset" || part === "roomac" ? "room" : "machines"}"]`).click();
    await page.locator(`[data-action="buy-${part}"]`).click();
    await page.waitForTimeout(250);
    await room.screenshot({ path: `${DIR}/live-${String(++n).padStart(2, "0")}-${part}.png`, animations: "disabled" });
    const names = await slots();
    console.log(`LIVE ${part}: ${await base()} ${names.join(",")}`);
    if (part === "mark1" || part === "ibm7090" || part === "s360" || part === "pdp1120" || part === "vax780") {
      if (!names.includes(part)) problems.push(`live: ${part} sprite did not appear after buying`);
    }
  }
  await page.close();
  console.log("T2 SERVERS PROBLEMS", JSON.stringify(problems));
  expect(problems).toEqual([]);
});

capture("bench room, start, mid and maxed", async ({ browser }) => {
  mkdirSync(DIR, { recursive: true });
  const START = { "k-atdesk": 1, "y-5151": 1, "c-286": 1, "b-at": 1, "p-at150": 1 };
  const MID = { ...START, "k-attower": 1, "y-8513": 1, "b-vlb": 1, "c-486": 1, "h-586fan": 1, "p-at230": 1, "m-simm1": 2, "v-vga": 1 };
  const MAX = { ...MID, "k-babyat": 1, "y-ms3d": 1, "r-360k": 1, "d-st225": 1, "r-144": 1, "d-cp3044": 1 };
  const problems = [];
  const homepc = BUSINESSES.findIndex((b) => b.id === "homepc");
  for (const [name, parts, year, owned] of [["start", START, 1984, 1], ["mid", MID, 1990, 50], ["maxed", MAX, 1993, 200], ["empty", {}, 1980, 1]]) {
    const page = await browser.newPage();
    await page.setViewportSize(view);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const s = save(year, { tab601: 1 }, parts, techFor(parts));
    s.biz[homepc].owned = owned;
    await open(page, "/facilities/bench", s, {});
    await tipsOff(page);
    const room = page.locator("[data-facility-room='bench']");
    await expect(room).toBeVisible();
    await room.screenshot({ path: `${DIR}/bench-${name}.png`, animations: "disabled" });
    const outside = await layersInside(page, "bench");
    if (outside.length) problems.push(`bench-${name}: ${outside.join(",")}`);
    await page.close();
  }
  console.log("T2 BENCH PROBLEMS", JSON.stringify(problems));
  expect(problems).toEqual([]);
});
