// The Hardware Museum: wings and rooms, filters, an exhibit sheet, and
// locked pieces as silhouettes. View-only.
import { test, expect } from "@playwright/test";
import { expectClean, open, saved, tipsOff } from "./helpers.js";

test("the museum shows rooms of hardware, filters them, and opens an exhibit", async ({ page }) => {
  const seen = await open(page, "/more#museum", "late");
  await expect(page.locator("[data-hw-museum]")).toBeVisible();
  await expect.poll(async () => !!(await saved(page))?.facilities?.bench).toBe(true);
  const before = JSON.stringify((await saved(page)).facilities);
  await page.click("[data-room='cases']");
  const tiles = page.locator("[data-museum-grid] [data-exhibit]");
  expect(await tiles.count()).toBeGreaterThan(30);
  // The oldest case is open in a late save; the decade chip narrows the grid.
  await page.click("[data-decade='1980']");
  expect(await tiles.count()).toBeLessThan(5);
  await tiles.first().click();
  await expect(page.locator("[data-exhibit-sheet]")).toBeVisible();
  await page.click("[data-exhibit-close]");
  await expect(page.locator("[data-exhibit-sheet]")).toHaveCount(0);
  // Peripherals and history cards.
  await page.click("[data-wing='peripherals']");
  await page.click("[data-room='mice']");
  expect(await tiles.count()).toBe(10);
  await page.click("[data-wing='history']");
  await expect(page.locator("[data-museum]")).toBeVisible();
  // Looking changes nothing.
  expect(JSON.stringify((await saved(page))?.facilities || {})).toBe(before);
  expectClean(seen);
});

test("a new game sees locked pieces as silhouettes with only their decade", async ({ page }) => {
  await open(page, "/more#museum", "fresh");
  const locked = page.locator("[data-exhibit][data-status='locked']");
  expect(await locked.count()).toBeGreaterThan(0);
  await locked.first().click();
  await expect(page.locator("[data-exhibit-sheet]")).toContainText("???");
});

test("today in history opens its exhibit", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 7, 12, 12));
  await open(page, "/more#museum", "late");
  await tipsOff(page);
  const card = page.locator("[data-today]");
  await expect(card).toContainText("TODAY IN HISTORY");
  await card.locator("[data-today-item='b-5150']").click();
  await expect(page.locator("[data-exhibit-sheet='b-5150']")).toBeVisible();
  await page.click("[data-exhibit-close]");
});
