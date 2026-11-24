// One-off shots of the bench room and settings, written under
// /workspace/mockups/ingame/ for review. Gated so the normal suite stays quiet.
import { test, expect } from "@playwright/test";
import { open, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { ERA_YEAR } from "../../src/lib/eraYear.js";
import { SAVE_VERSION } from "../../src/lib/gameSave.js";
import { mkdirSync } from "node:fs";

const DIR = "/workspace/mockups/ingame";
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

const saveFor = (owned, parts, year = 1993) => ({
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
});

const START_PARTS = { "k-atdesk": 1, "y-5151": 1, "c-286": 1, "b-at": 1, "p-at150": 1 };
const MID_PARTS = {
  ...START_PARTS,
  "k-attower": 1, "y-8513": 1, "b-vlb": 1, "c-486": 1, "h-586fan": 1, "p-at230": 1, "m-simm1": 2, "v-vga": 1,
};
const MAX_PARTS = {
  ...MID_PARTS,
  "k-babyat": 1, "y-ms3d": 1, "r-360k": 1, "d-st225": 1, "r-144": 1, "d-cp3044": 1,
};

async function shot(page, save, prefs, file) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/facilities/bench", save, { prefs });
  await tipsOff(page);
  const room = page.locator("[data-facility-room='bench']");
  await expect(room).toBeVisible();
  mkdirSync(DIR, { recursive: true });
  await room.screenshot({ path: `${DIR}/${file}`, animations: "disabled" });
}

const capture = process.env.CAPTURE_ROOMS === "1" ? test : test.skip;

capture("capture mid, maxed, monitor modes, settings, soon strips", async ({ browser }) => {
  const jobs = [
    ["bench-start.png", 1, START_PARTS, {}, 1984],
    ["bench-mid.png", 50, MID_PARTS, {}, 1990],
    ["bench-maxed.png", 200, MAX_PARTS, {}, 1993],
    ["bench-start-green.png", 1, START_PARTS, { monitorDisplay: "green" }, 1984],
    ["bench-start-amber.png", 1, START_PARTS, { monitorDisplay: "amber" }, 1984],
    ["bench-start-color.png", 1, START_PARTS, { monitorDisplay: "color" }, 1984],
    ["bench-mid-green.png", 50, MID_PARTS, { monitorDisplay: "green" }, 1990],
    ["bench-mid-amber.png", 50, MID_PARTS, { monitorDisplay: "amber" }, 1990],
    ["bench-maxed-era.png", 200, MAX_PARTS, { monitorDisplay: "era" }, 1993],
  ];
  for (const [file, owned, parts, prefs, year] of jobs) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 412, height: 915 });
    await shot(page, saveFor(owned, parts, year), prefs, file);
    await page.close();
  }
  const page = await browser.newPage();
  await page.setViewportSize({ width: 412, height: 915 });
  await open(page, "/more#settings", saveFor(1, START_PARTS), {});
  await tipsOff(page);
  const panel = page.locator("h2", { hasText: "DISPLAY" }).locator("xpath=ancestor::*[contains(@class,'border') or @data-panel][1]");
  const display = page.locator("text=MONITOR DISPLAY").locator("xpath=ancestor::*[contains(@class,'border')][1]");
  mkdirSync(DIR, { recursive: true });
  if (await display.count()) {
    await display.screenshot({ path: `${DIR}/settings-monitor-display.png` });
  } else {
    await page.screenshot({ path: `${DIR}/settings-monitor-display.png`, fullPage: false });
  }
  await page.goto("/facilities/mine");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await page.locator("[data-facility-room='mine']").screenshot({ path: `${DIR}/mine-coming-soon.png` });
  await page.goto("/facilities/servers");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await page.locator("[data-facility-room='servers']").screenshot({ path: `${DIR}/servers-coming-soon.png` });
  await page.goto("/museum");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await page.locator("header").screenshot({ path: `${DIR}/museum-title-icon.png` });
  await page.close();
});
