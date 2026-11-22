// The locked era row lists every need with progress.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";

test("the locked era shows owning enough and earning enough, each with progress", async ({ page }) => {
  const save = shortOf("minis", { lifetime: 0, erasPaid: BUSINESSES.map((b) => b.id) });
  const seen = await open(page, "/", save);
  await tipsOff(page);
  const row = page.locator("[data-locked-era]");
  await row.scrollIntoViewIfNeeded();
  await expect(row.locator("[data-era-need='own']")).toContainText(/Own 10 .*\(\d+\/10\)/);
  await expect(row.locator("[data-era-need='earn']")).toContainText(/Earn \$.* this run/);
  // The run's earnings show here now, not in the CASH box.
  await expect(row.locator("[data-era-earned]")).toHaveText(/^\$[\d.]+[A-Za-z]* of \$[\d.]+[A-Za-z]* earned this run$/);
  await expect(row.locator("[data-era-need='earn']")).toHaveAttribute("data-met", "0");
  expectClean(seen);
});

import { BUSINESSES } from "../../src/lib/gameConfig.js";
// A save in the current row order, just short of the given era.
export function shortOf(eraId, extra = {}) {
  const at = BUSINESSES.findIndex((b) => b.id === eraId);
  return {
    version: 12,
    cash: 1e30,
    lifetime: 1e300,
    investors: 0,
    lastSeen: Date.now(),
    restartSeen: true,
    erasOpened: [],
    biz: BUSINESSES.map((_, i) => ({ owned: i < at ? 25 : 0, manager: i < at })),
    ...extra,
  };
}

test("a late era names its TECH project and GO TO TECH opens it", async ({ page }) => {
  const seen = await open(page, "/", shortOf("quantum", { techDone: [] }));
  await tipsOff(page);
  const need = page.locator("[data-locked-era] [data-era-need='research']");
  await need.scrollIntoViewIfNeeded();
  await expect(need).toContainText("Research Tensor P100 on TECH");
  await need.locator("[data-era-research]").click();
  await expect(page).toHaveURL(/\/tech#card-p100$/);
  await expect(page.locator("[data-research-item='card-p100']")).toHaveAttribute("data-focus", "1");
  expectClean(seen);
});

test("OPEN ERA takes the material only when tapped, and opens the era", async ({ page }) => {
  const seen = await open(page, "/", shortOf("cpu", { techDone: [], erasPaid: [], supply: { wafers: 5000 } }));
  await tipsOff(page);
  const row = page.locator("[data-locked-era]");
  await row.scrollIntoViewIfNeeded();
  await expect(row.locator("[data-era-need='material']")).toContainText(/Use [\d,]+ wafers to open it/);
  // Waiting does not spend it.
  await page.waitForTimeout(1500);
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("pc-tycoon-save-v1")).supply?.wafers ?? null);
  await row.locator("[data-open-era='cpu']").click();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem("pc-tycoon-save-v1")).erasPaid || [])).toContain("cpu");
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("pc-tycoon-save-v1")).supply.wafers);
  expect(before == null || after < before).toBeTruthy();
  await expect(page.locator("[data-locked-era] [data-open-era='cpu']")).toHaveCount(0);
  expectClean(seen);
});

test("the top bar shows the decade of the newest era owned, not ERA n/37", async ({ page }) => {
  const far = () => Date.now() + 9e9;
  const glass = BUSINESSES.findIndex((b) => b.id === "glass");
  const save = {
    version: 12, cash: 1e6, lifetime: 10, investors: 0, lastSeen: Date.now(),
    sawPit: true, starterGranted: true, hubSeen: true,
    tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
    nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
    biz: BUSINESSES.map((b, i) => ({
      id: b.id,
      owned: i <= glass ? 1 : 0,
      manager: false, running: false, progress: 0, commissionUntil: 0,
    })),
  };
  const seen = await open(page, "/", save, { extra: { "pc-tycoon-prefs-v1": JSON.stringify({ gameSection: "supply" }) } });
  await tipsOff(page);
  const header = page.locator("[data-era-progress]");
  await expect(header).toHaveText("1920s");
  await expect(header).not.toContainText("ERA");
  await expect(header).not.toContainText("/36");
  await expect(header).not.toContainText("/37");
  expectClean(seen);
});
