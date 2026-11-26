// Facility room banners: the bench shows the layered den, unfinished plants
// get a Coming soon strip, and MORE > Settings has Monitor Display.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff, PREFS_KEY } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { ERA_YEAR } from "../../src/lib/eraYear.js";
import { SAVE_VERSION } from "../../src/lib/gameSave.js";
import { PARTS } from "../../src/lib/facilities.js";
import { SERVERS_STAGE_DEFS } from "../../src/lib/rooms/index.js";

const far = () => Date.now() + 9e9;
const HOMEPC = BUSINESSES.findIndex((b) => b.id === "homepc");

function throughYear(year) {
  let reached = 0;
  for (let i = 0; i < BUSINESSES.length; i++) {
    reached = Math.max(reached, ERA_YEAR[BUSINESSES[i].id] || 0);
    if (reached >= year) return i;
  }
  return BUSINESSES.length - 1;
}

const benchSave = (owned, parts, prefs = {}, year = 1984) => ({
  save: {
    version: SAVE_VERSION,
    cash: 1e12,
    lifetime: 1e12,
    investors: 0,
    lastSeen: Date.now(),
    sawPit: true,
    starterGranted: true,
    hubSeen: true,
    tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
    nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
    facilities: { servers: { tab601: 1 }, bench: { ...parts }, mine: {}, cluster: {} },
    biz: BUSINESSES.map((b, i) => {
      const last = throughYear(year);
      return {
        id: b.id,
        owned: i === HOMEPC ? owned : i <= last ? 8 : 0,
        manager: i === HOMEPC || i <= last,
        running: false,
        progress: 0,
      };
    }),
  },
  opts: { prefs },
});


function techDoneFor(parts) {
  return Object.keys(parts).map((id) => PARTS.find((p) => p.id === id)?.research).filter(Boolean);
}

const serversSave = (serverParts, year) => ({
  save: {
    version: SAVE_VERSION,
    cash: 1e12,
    lifetime: 1e12,
    investors: 0,
    lastSeen: Date.now(),
    sawPit: true,
    starterGranted: true,
    hubSeen: true,
    tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
    nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
    facilities: { servers: { ...serverParts }, bench: {}, mine: {}, cluster: {} },
    techDone: techDoneFor(serverParts),
    biz: BUSINESSES.map((b, i) => {
      const last = throughYear(year);
      return { id: b.id, owned: i <= last ? 8 : 0, manager: i <= last, running: false, progress: 0 };
    }),
  },
  opts: { prefs: {} },
});

test("the bench room shows owned start parts, and mine is a coming-soon strip", async ({ page }) => {
  const { save, opts } = benchSave(1, { "k-atdesk": 1, "y-5151": 1, "c-286": 1, "p-at150": 1 });
  const seen = await open(page, "/facilities/bench", save, opts);
  await tipsOff(page);
  const room = page.locator("[data-facility-room='bench']");
  await expect(room).toBeVisible();
  await expect(room.locator("[data-room-unlock='k-atdesk']")).toBeVisible();
  await expect(room.locator("[data-room-unlock='y-5151']")).toBeVisible();
  await expect(room.locator("[data-room-slot='cat']")).toBeVisible();
  await expect(room.locator("[data-room-unlock='k-attower']")).toHaveCount(0);
  await expect(room.locator("[data-room-unlock='y-ms3d']")).toHaveCount(0);
  await page.goto("/facilities/mine");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await expect(page.locator("[data-facility-room='mine'][data-room-soon]")).toContainText("Room coming soon");
  expectClean(seen);
});

test("MORE > Settings lists Monitor Display after text size, and the pref is kept", async ({ page }) => {
  const { save, opts } = benchSave(1, { "y-5151": 1 });
  const seen = await open(page, "/more#settings", save, opts);
  await tipsOff(page);
  await expect(page.locator("[data-monitor-display='era']")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-monitor-display='green']")).toBeVisible();
  await expect(page.locator("[data-monitor-display='amber']")).toBeVisible();
  await expect(page.locator("[data-monitor-display='color']")).toBeVisible();
  await page.locator("[data-monitor-display='amber']").click();
  await expect(page.locator("[data-monitor-display='amber']")).toHaveAttribute("aria-pressed", "true");
  const prefs = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "{}"), PREFS_KEY);
  expect(prefs.monitorDisplay).toBe("amber");
  expectClean(seen);
});

test("the servers room shows the 1930s starter punch and the 1976 Cray-1, and cluster is a coming-soon strip", async ({ page, browser }) => {
  const start = serversSave({ tab601: 1 }, 1931);
  const seen = await open(page, "/facilities/servers", start.save, start.opts);
  await tipsOff(page);
  const room = page.locator("[data-facility-room='servers']");
  await expect(room).toBeVisible();
  await expect(room).not.toHaveAttribute("data-room-soon", "");
  await expect(room.locator("[data-room-unlock='tab601']").first()).toBeVisible();
  await expect(room.locator("[data-room-slot='cat-1930s']")).toBeVisible();
  await expect(room.locator("[data-room-unlock='cray1']")).toHaveCount(0);
  // Sprites are clipped to the banner and stay under the HUD and tab bar.
  const clip = await room.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { overflow: cs.overflow, isolation: cs.isolation };
  });
  expect(clip).toEqual({ overflow: "hidden", isolation: "isolate" });
  await page.goto("/facilities/cluster");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await expect(page.locator("[data-facility-room='cluster'][data-room-soon]")).toContainText("Room coming soon");
  expectClean(seen);

  // A new page is required: seed() writes an init script that only runs once per session.
  const crayPage = await browser.newPage();
  await crayPage.setViewportSize({ width: 412, height: 915 });
  const cray = serversSave({ cray1: 1, mgset: 1, roomac: 1, pack3330: 1, freon: 1 }, 1976);
  const seen2 = await open(crayPage, "/facilities/servers", cray.save, cray.opts);
  await tipsOff(crayPage);
  const crayRoom = crayPage.locator("[data-facility-room='servers']");
  await expect(crayRoom.locator("[data-room-unlock='cray1']")).toBeVisible();
  await expect(crayRoom.locator("[data-room-slot='roomac']")).toBeVisible();
  await expect(crayRoom.locator("[data-room-unlock='tab601']")).toHaveCount(0);
  expectClean(seen2);
  await crayPage.close();
});

// Every layer in a room must sit inside the banner.
const outsideBanner = (page, id) => page.evaluate((facility) => {
  const room = document.querySelector(`[data-facility-room='${facility}']`).getBoundingClientRect();
  return [...document.querySelectorAll(`[data-facility-room='${facility}'] .facility-room-layer`)]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.left < room.left - 1 || r.top < room.top - 1 || r.right > room.right + 1 || r.bottom > room.bottom + 1; })
    .map((el) => el.getAttribute("data-room-slot") || "base");
}, id);

test("buying a machine changes the room art at once, with no reopen (items 2 and 49)", async ({ page }) => {
  const { save, opts } = serversSave({ tab601: 1 }, 1977);
  save.techDone = ["srv-mark1", "srv-7090", "srv-360"];
  const seen = await open(page, "/facilities/servers", save, opts);
  await tipsOff(page);
  const room = page.locator("[data-facility-room='servers']");
  const base = () => room.locator("img").first().getAttribute("src");
  await expect(room.locator("[data-room-unlock='tab601']").first()).toBeVisible();
  expect(await base()).toContain("base-1930s");
  await page.locator("[data-server-tab='room']").click();
  for (const part of ["mgset", "roomac"]) await page.locator(`[data-action="buy-${part}"]`).click();
  await page.locator("[data-server-tab='machines']").click();
  await page.locator('[data-action="buy-mark1"]').click();
  expect(await base()).toContain("base-1950s");
  await expect(room.locator("[data-room-unlock='mark1']")).toBeVisible();
  await expect(room.locator("[data-room-unlock='tab601']")).toHaveCount(0);
  await page.locator('[data-action="buy-ibm7090"]').click();
  await expect(room.locator("[data-room-unlock='ibm7090']")).toBeVisible();
  await page.locator('[data-action="buy-s360"]').click();
  await expect(room.locator("[data-room-unlock='s360']")).toBeVisible();
  expect(await outsideBanner(page, "servers")).toEqual([]);
  expectClean(seen);
});

test("every servers stage draws inside the banner, with floor shadows and no desk (items 1, 3 and 28)", async ({ browser }) => {
  for (const stage of SERVERS_STAGE_DEFS) {
    const t = stage.trigger;
    const parts = t?.anyParts ? { [t.anyParts[0]]: 1 } : t ? { tab601: 1, [t.partId]: t.minParts || 1 } : { tab601: 1 };
    if (parts.tape || parts.ramac) parts.mark1 = 1;
    if (stage.year >= 1951) { parts.mgset = 1; parts.roomac = 1; }
    const page = await browser.newPage();
    await page.setViewportSize({ width: 412, height: 915 });
    const { save, opts } = serversSave(parts, stage.year);
    await open(page, "/facilities/servers", save, opts);
    await tipsOff(page);
    const room = page.locator("[data-facility-room='servers']");
    await expect(room, stage.id).toBeVisible();
    expect(await outsideBanner(page, "servers"), stage.id).toEqual([]);
    await expect(room.locator("[data-room-slot^='desk']"), stage.id).toHaveCount(0);
    await page.close();
  }
  const page = await browser.newPage();
  await page.setViewportSize({ width: 412, height: 915 });
  const { save, opts } = serversSave({ tab601: 6 }, 1931);
  await open(page, "/facilities/servers", save, opts);
  await tipsOff(page);
  await expect(page.locator("[data-facility-room='servers'] [data-room-shadow]")).toHaveCount(6);
  await page.close();
});

test("the bench room draws inside the banner in each stage (items 28 and 55)", async ({ browser }) => {
  const stages = [
    [1, { "k-atdesk": 1, "y-5151": 1, "c-286": 1, "b-at": 1, "p-at150": 1 }, 1984],
    [50, { "k-atdesk": 1, "k-attower": 1, "y-8513": 1, "b-vlb": 1, "c-486": 1, "h-586fan": 1, "p-at230": 1, "m-simm1": 2, "v-vga": 1 }, 1990],
    [200, { "k-atdesk": 1, "k-attower": 1, "k-babyat": 1, "y-8513": 1, "y-ms3d": 1, "b-vlb": 1, "c-486": 1, "h-586fan": 1, "p-at230": 1, "m-simm1": 2, "v-vga": 1, "r-360k": 1, "d-st225": 1, "r-144": 1, "d-cp3044": 1 }, 1993],
  ];
  for (const [owned, parts, year] of stages) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 412, height: 915 });
    const { save, opts } = benchSave(owned, parts, {}, year);
    await open(page, "/facilities/bench", save, opts);
    await tipsOff(page);
    await expect(page.locator("[data-facility-room='bench']")).toBeVisible();
    expect(await outsideBanner(page, "bench"), `bench at ${owned}`).toEqual([]);
    await page.close();
  }
});
