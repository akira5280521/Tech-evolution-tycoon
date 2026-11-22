// A save from before the hardware and era rework is offered a fresh start
// once; keeping it works and the offer doesn't come back.
import { test, expect } from "@playwright/test";
import { open, saved } from "./helpers.js";

test("an older save is offered a fresh start once, and can keep playing", async ({ page }) => {
  await open(page, "/", "mid", { restartOffer: true });
  const offer = page.locator("[data-restart-offer]");
  await expect(offer).toBeVisible();
  await page.click("[data-restart-keep]");
  await expect(offer).toHaveCount(0);
  await expect.poll(async () => (await saved(page))?.restartSeen).toBe(true);
  await page.reload();
  await page.waitForTimeout(1200);
  await expect(offer).toHaveCount(0);
});

test("start fresh asks to confirm, then starts a new game", async ({ page }) => {
  await open(page, "/", "mid", { restartOffer: true });
  await page.click("[data-restart-fresh]");
  await expect(page.locator("[data-restart-confirm]")).toBeVisible();
  await page.click("[data-restart-fresh]");
  await expect(page.locator("[data-restart-offer]")).toHaveCount(0);
  await expect.poll(async () => (await saved(page))?.investors || 0).toBe(0);
});
