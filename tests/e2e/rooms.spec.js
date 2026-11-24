// Facility room banners: the bench shows the layered den, unfinished plants
// get a Coming soon strip, and MORE > Settings has Monitor Display.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff, PREFS_KEY } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { ERA_YEAR } from "../../src/lib/eraYear.js";
import { SAVE_VERSION } from "../../src/lib/gameSave.js";
import { PARTS } from "../../src/lib/facilities.js";

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
