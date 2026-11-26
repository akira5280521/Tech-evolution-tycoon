// The notification switches save straight away and survive a reload.
import { test, expect } from "@playwright/test";
import { expectClean, open } from "./helpers.js";

test("notification switches turn on, stay on after reload, and turn off", async ({ page }) => {
  const seen = await open(page, "/more#settings", "mid");
  for (const id of ["cap", "research", "bins"]) {
    const btn = page.locator(`[data-notify-${id}]`);
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toContainText("OFF");
    await btn.click();
    await expect(btn).toContainText("ON");
  }
  await page.reload();
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  for (const id of ["cap", "research", "bins"]) await expect(page.locator(`[data-notify-${id}]`)).toContainText("ON");
  const prefs = await page.evaluate(() => JSON.parse(localStorage.getItem("pc-tycoon-prefs-v1")));
  expect([prefs.notifyCap, prefs.notifyResearch, prefs.notifyBins]).toEqual([true, true, true]);
  await page.locator("[data-notify-cap]").click();
  await expect(page.locator("[data-notify-cap]")).toContainText("OFF");
  expectClean(seen);
});
