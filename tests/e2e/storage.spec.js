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

test("the refinery turns silicon into polysilicon from the material sheet", async ({ page }) => {
  const base = SAVES.mid;
  const save = { ...base, lastSeen: Date.now(), bestEra: 30, supply: { ...(base.supply || {}), silicon: 2000 } };
  const seen = await open(page, "/", save);
  await tipsOff(page);
  await page.locator("[data-material='silicon']").click();
  const start = page.locator("[data-refine-start='polysilicon']");
  await expect(start).toBeEnabled();
  await start.click();
  await expect(page.locator("[data-refine-running]")).toContainText("Refining 100 polysilicon");
  await expect.poll(async () => (await saved(page))?.refineJob?.amount || 0).toBe(100);
  expectClean(seen);
});

test("selling and swapping from the material sheet", async ({ page }) => {
  const base = SAVES.mid;
  // No managers, so nothing is made while the test runs.
  const biz = base.biz.map((row) => ({ ...row, manager: false, running: false }));
  const save = { ...base, biz, lastSeen: Date.now(), cash: 0, supply: { ...(base.supply || {}), copper: 500, sand: 0 } };
  const seen = await open(page, "/", save);
  await tipsOff(page);
  await page.locator("[data-material='copper']").click();
  await page.locator("[data-sell='copper']").click();
  await expect.poll(async () => (await saved(page))?.supply?.copper ?? 999).toBe(400);
  await page.locator("[data-swap-target]").selectOption("sand");
  await page.locator("[data-swap='copper']").click();
  await expect.poll(async () => (await saved(page))?.supply?.sand || 0).toBeGreaterThan(0);
  expectClean(seen);
});
