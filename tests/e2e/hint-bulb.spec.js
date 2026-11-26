// T3 item 64: the header lightbulb shows one line for the current screen,
// only when tapped, and glows when nothing is earning.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";

test("the lightbulb shows a one-line hint per screen, only when tapped", async ({ page }) => {
  const seen = await open(page, "/", "mid");
  await tipsOff(page);
  const bulb = page.locator("[data-hint-bulb]").first();
  await expect(bulb).toBeVisible();
  await expect(page.locator("[data-hint-line]")).toHaveCount(0);
  await page.waitForTimeout(1500);
  await expect(page.locator("[data-hint-line]")).toHaveCount(0);
  await bulb.click();
  const line = page.locator("[data-hint-line]");
  await expect(line).toHaveCount(1);
  const gameText = await line.innerText();
  expect(gameText.length).toBeGreaterThan(5);
  await line.click();
  await expect(line).toHaveCount(0);
  await page.locator("nav[aria-label='Main navigation'] [data-tab='boost']").click();
  await page.locator("[data-sub-tab='prestige']").click();
  await page.locator("[data-hint-bulb]").first().click();
  await expect(page.locator("[data-hint-line]")).toContainText(/prestige|investors/i);
  expectClean(seen);
});

test("the lightbulb glows when nothing is running", async ({ page }) => {
  const row = (id, owned) => ({ id, owned, manager: false, running: false, progress: 0, activeMs: 0, commissionUntil: 0 });
  const seen = await open(page, "/", {
    version: 7, cash: 10, lifetime: 100, investors: 0, lastSeen: Date.now(), supply: {}, sawPit: true,
    tutorial: { seen: [], done: true, skipped: false, replay: false, tips: [], tipsOff: true },
    nextWindfallAt: Date.now() + 9e9, nextDilemmaAt: Date.now() + 9e9, nextBubbleAt: Date.now() + 9e9,
    biz: [row("timber", 3)],
  });
  await expect(page.locator("[data-hint-bulb]").first()).toHaveAttribute("data-hint-bulb", "glow");
  await expect(page.locator("[data-hint-line]")).toHaveCount(0);
  await page.locator("[data-hint-bulb]").first().click();
  await expect(page.locator("[data-hint-line]")).toContainText("Nothing is running");
  expectClean(seen);
});
