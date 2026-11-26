import { test, expect } from "@playwright/test";
import { open } from "./helpers.js";

test("long-press on cash shows the exact amount, and a short tap does not (item 33)", async ({ page }) => {
  await open(page, "/", "mid");
  const cash = page.locator("[data-cash]");
  const exact = await cash.getAttribute("data-exact");
  expect(exact).toMatch(/^\$[\d,]+(\.\d\d)?$/);
  // Measure once the fonts are in: a late font moves the box out from under
  // the finger and cancels the long-press.
  await page.evaluate(() => document.fonts.ready);
  // A popup at the top (the history-cards toast on load) can cover the cash
  // box on a slow run, and then the press lands on the popup.
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0, { timeout: 20_000 });
  await page.waitForTimeout(300);
  const box = await cash.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  // A short tap: no exact amount. (Checked after letting go, so a slow run
  // can't make the tap look long.)
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(800);
  await expect(page.locator("[data-exact-peek]")).toHaveCount(0);
  // A long-press: the exact amount shows while held.
  await page.mouse.down();
  await expect(page.locator("[data-exact-peek]")).toHaveText(/^\$[\d,]+(\.\d\d)?$/);
  await page.mouse.up();
});

test("a long-press on a material shows its exact amount without opening the sheet", async ({ page }) => {
  await open(page, "/", "mid");
  const amt = page.locator("[data-material] [data-exact]").first();
  if (!(await amt.count())) test.skip();
  const box = await amt.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
  await expect(page.locator("[data-exact-peek]")).toContainText("/");
  await expect(page.locator("[data-storage-sheet]")).toHaveCount(0);
});

test("tap sound and tap vibration are settings, off by default (item 35)", async ({ page }) => {
  await open(page, "/more#settings", "mid");
  const sound = page.locator("[data-tap-sound]");
  await expect(sound).toHaveText(/TAP SOUND: OFF/);
  await sound.click();
  await expect(sound).toHaveText(/TAP SOUND: ON/);
  await expect(page.locator("[data-tap-haptic]")).toHaveText(/TAP VIBRATION: OFF/);
  const prefs = await page.evaluate(() => JSON.parse(localStorage.getItem("pc-tycoon-prefs-v1")));
  expect(prefs.tapSound).toBe(true);
  expect(prefs.tapHaptic).toBe(false);
});

test("a pressed button sinks a little (item 35)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page, "/", "mid");
  const btn = page.locator("[data-section='supply']");
  await btn.hover();
  await page.mouse.down();
  await expect.poll(() => btn.evaluate((el) => getComputedStyle(el).scale)).toBe("0.96");
  await page.mouse.up();
  await expect.poll(() => btn.evaluate((el) => getComputedStyle(el).scale)).not.toBe("0.96");
});
