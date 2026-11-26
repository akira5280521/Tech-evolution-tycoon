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
  // Selling asks once (T4 item 37).
  await expect(page.locator("[data-sell='copper']")).toHaveAttribute("data-sell-armed", "yes");
  await page.locator("[data-sell='copper']").click();
  await expect.poll(async () => (await saved(page))?.supply?.copper ?? 999).toBe(400);
  await page.locator("[data-swap-target]").selectOption("sand");
  await page.locator("[data-swap='copper']").click();
  await expect.poll(async () => (await saved(page))?.supply?.sand || 0).toBeGreaterThan(0);
  expectClean(seen);
});

test("the material sheet keeps CLOSE and BINS above the tab bar", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  const base = SAVES.mid;
  const save = { ...base, lastSeen: Date.now(), cash: 1e15, bestEra: 30, supply: { ...(base.supply || {}), silicon: 2000 } };
  const seen = await open(page, "/", save);
  await tipsOff(page);
  await page.locator("[data-material='silicon']").click();
  const sheet = page.locator("[data-storage-sheet='silicon']");
  await expect(sheet).toBeVisible();
  const close = sheet.locator("[data-storage-close]");
  const bins = sheet.locator("[data-storage-upgrade]");
  await expect(close).toBeVisible();
  await expect(bins).toBeVisible();
  const closeBox = await close.boundingBox();
  const binsBox = await bins.boundingBox();
  const navBox = await page.locator("nav[aria-label='Main navigation']").boundingBox();
  expect(closeBox, "CLOSE should be on screen").toBeTruthy();
  expect(binsBox, "BINS should be on screen").toBeTruthy();
  expect(navBox, "tab bar should be on screen").toBeTruthy();
  expect(closeBox.y + closeBox.height).toBeLessThanOrEqual(navBox.y + 2);
  expect(binsBox.y + binsBox.height).toBeLessThanOrEqual(navBox.y + 2);
  expect(closeBox.y).toBeGreaterThanOrEqual(0);
  expectClean(seen);
});


test("the materials panel keeps its size when bins fill up (one fixed slot per material)", async ({ page }) => {
  const measure = async (pg) => {
    const grid = pg.locator("[data-supply-grid]");
    await expect(grid).toBeVisible();
    const sizes = await grid.locator("[data-material]").evaluateAll((els) => els.map((el) => `${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`));
    const box = await grid.boundingBox();
    return { sizes, w: Math.round(box.width), h: Math.round(box.height), full: await grid.locator("[data-full='yes']").count() };
  };
  const empty = { ...SAVES.mid, supply: {} };
  let seen = await open(page, "/", empty);
  const a = await measure(page);
  expect(new Set(a.sizes).size).toBe(1);
  expectClean(seen);
  const page2 = await page.context().newPage();
  const keys = Object.keys(SAVES.mid.supply || { wood: 1, paper: 1, sand: 1 });
  seen = await open(page2, "/", { ...SAVES.mid, supply: Object.fromEntries(["wood", "paper", "sand", "copper", "glass", ...keys].map((k) => [k, 1e15])) });
  const b = await measure(page2);
  expect(b.full).toBeGreaterThan(0);
  expect(b.sizes).toEqual(a.sizes);
  expect([b.w, b.h]).toEqual([a.w, a.h]);
  expectClean(seen);
});
