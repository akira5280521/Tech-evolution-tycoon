// Material storage: the strip shows "have/cap" and FULL; a tap opens the
// bins, and bigger bins cost cash.
import { test, expect } from "@playwright/test";
import { SAVES, expectClean, open, saved, tipsOff } from "./helpers.js";

test("a full material shows FULL, and bigger bins raise the cap", async ({ page }) => {
  const base = SAVES.mid;
  const save = { ...base, lastSeen: Date.now(), cash: 1e15, supply: { ...(base.supply || {}), sand: 1000 }, storage: {} };
  const seen = await open(page, "/", save);
  await tipsOff(page);
  const sand = page.locator("[data-material='sand']");
  await expect(sand).toContainText("/");
  await sand.click();
  const sheet = page.locator("[data-storage-sheet='sand']");
  await expect(sheet).toBeVisible();
  const before = await sheet.locator("[data-storage-count]").textContent();
  await sheet.locator("[data-storage-upgrade]").click();
  await expect.poll(async () => (await saved(page))?.storage?.sand || 0).toBe(1);
  const after = await sheet.locator("[data-storage-count]").textContent();
  expect(after).not.toBe(before);
  await sheet.locator("[data-storage-close]").click();
  await expect(sheet).toHaveCount(0);
  expectClean(seen);
});
