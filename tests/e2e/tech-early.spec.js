// The hardware parts tree lives on TECH, not the R&D tab. It used to hide
// behind a 1956-gated "???" button; it is reachable from the first era, and
// projects still wait for their year.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { SAVE_VERSION } from "../../src/lib/gameSave.js";
import { TECH_OPENS } from "../../src/lib/research.js";

const far = () => Date.now() + 9e9;
const earlySave = (throughId = "glass") => {
  const last = BUSINESSES.findIndex((b) => b.id === throughId);
  return {
    version: SAVE_VERSION,
    cash: 5.24e6,
    lifetime: 1e7,
    data: 124.1,
    investors: 0,
    lastSeen: Date.now(),
    sawPit: true,
    starterGranted: true,
    hubSeen: true,
    tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
    nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
    supply: { wood: 100, paper: 100, sand: 100, copper: 100, glass: 50, filament: 20 },
    facilities: { servers: { tab601: 1 }, bench: {}, mine: {}, cluster: {} },
    biz: BUSINESSES.map((b, i) => ({
      id: b.id,
      owned: i <= last ? 8 : 0,
      manager: i <= last,
      running: false,
      progress: 0,
      commissionUntil: 0,
    })),
  };
};

test("an early save opens TECH from the top bar and shows year-locked hardware", async ({ page }) => {
  const seen = await open(page, "/", earlySave("glass"));
  await tipsOff(page);
  const tech = page.locator("[data-open-research]");
  await expect(tech).toHaveText("TECH");
  await expect(tech).not.toHaveAttribute("data-locked", "");
  await tech.click();
  await expect(page).toHaveURL(/\/tech/);
  await expect(page.locator("[data-research-tab='cpu']")).toBeVisible();
  await expect(page.locator("[data-research-tab='gpu']")).toBeVisible();
  await expect(page.locator("[data-research-tab='memory']")).toBeVisible();
  await expect(page.locator("[data-research-tab='storage']")).toBeVisible();
  await page.locator("[data-research-tab='storage']").click();
  await expect(page.locator("[data-research-item='tab-hollerith']")).toBeVisible();
  await expect(page.locator("[data-research-item='tab-hollerith']")).toContainText("Hollerith");
  // 1956 is a later era: the card is ???, not a named "Requires 1956" row.
  await expect(page.locator("[data-research-item='store-hdd']")).toHaveCount(0);
  await expect(page.locator("[data-research-hidden]").first()).toBeVisible();
  await expect(page.locator("[data-research-hidden]").first()).toContainText("???");
  await expect(page.locator("body")).not.toContainText("5 MB disk");
  expectClean(seen);
});

test("TECH shows this era's projects, hides the next era, and search does not leak names", async ({ page }) => {
  const seen = await open(page, "/tech", earlySave("mainframes"));
  await tipsOff(page);
  await page.locator("[data-research-tab='servers']").click();
  await expect(page.locator("[data-research-item='srv-mark1']")).toBeVisible();
  await expect(page.locator("[data-research-item='srv-mark1']")).toContainText("Irwell Mark 1");
  await expect(page.locator("[data-research-item='srv-7090']")).toHaveCount(0);
  await expect(page.locator("[data-research-item='srv-360']")).toHaveCount(0);
  await expect(page.locator("[data-research-hidden]").first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Inland 7090");
  await expect(page.locator("body")).not.toContainText("Inland 360");
  await expect(page.locator("body")).not.toContainText("Chipwright P-II");
  await expect(page.locator("body")).not.toContainText("6x86MX");
  const box = page.locator("[data-search=tech]");
  await box.fill("7090");
  await expect(page.locator("[data-search-empty='tech']")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Inland 7090");
  await box.fill("P-II");
  await expect(page.locator("[data-search-empty='tech']")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Chipwright P-II");
  await box.fill("Mark 1");
  await expect(page.locator("[data-research-item='srv-mark1']")).toBeVisible();
  await expect(page.locator("[data-research-hidden]")).toHaveCount(0);
  expectClean(seen);
});

test("an era already reached stays revealed after prestige", async ({ page }) => {
  const save = earlySave("timber");
  save.bestEra = BUSINESSES.findIndex((b) => b.id === "mainframes");
  const seen = await open(page, "/tech", save);
  await tipsOff(page);
  await page.locator("[data-research-tab='servers']").click();
  await expect(page.locator("[data-research-item='srv-mark1']")).toBeVisible();
  await expect(page.locator("[data-research-item='srv-7090']")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("Inland 7090");
  expectClean(seen);
});
