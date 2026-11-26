import { test, expect } from "@playwright/test";
import { open } from "./helpers.js";

test("settings come in groups: game, sound, notifications, display, save, about (item 39)", async ({ page }) => {
  await open(page, "/more#settings", "mid");
  const groups = await page.locator("[data-settings-group]").evaluateAll((els) => els.map((e) => e.getAttribute("data-settings-group")));
  expect(groups).toEqual(["game", "sound", "notifications", "display", "save", "about"]);
  await expect(page.locator("[data-settings-group='sound'] [data-sound]")).toHaveCount(1);
  await expect(page.locator("[data-settings-group='sound'] [data-tap-sound]")).toHaveCount(1);
  await expect(page.locator("[data-settings-group='display'] [data-text-size]")).toHaveCount(3);
  await expect(page.locator("[data-settings-group='display'] [data-colorblind-toggle]")).toHaveCount(1);
  await expect(page.locator("[data-settings-group='save'] [data-save-export]")).toHaveCount(1);
  await expect(page.locator("[data-settings-group='save']")).toContainText("EXPORT SAVE");
  await expect(page.locator("[data-settings-group='save']")).toContainText("IMPORT SAVE");
});

test("prestige asks once, and CANCEL keeps the run (item 37)", async ({ page }) => {
  await open(page, "/boost#prestige", "late");
  const recruit = page.locator('[data-prestige="recruit"]');
  if (await recruit.isDisabled()) test.skip();
  await recruit.click();
  await expect(page.locator("[data-prestige-confirm]")).toBeVisible();
  await page.locator("[data-prestige-cancel]").click();
  await expect(page.locator("[data-prestige-confirm]")).toHaveCount(0);
  await expect(page.locator("[data-prestige-report]")).toHaveCount(0);
});

test("empty lists say what to do next (item 38)", async ({ page }) => {
  await open(page, "/progress#museum", "late");
  await expect(page.locator("[data-empty-hint='museum-room']")).toBeVisible();
  await page.locator("[data-search='museum'], input[placeholder='Search museum']").first().fill("zzzz-no-such-thing");
  await expect(page.getByText("No match. Try a maker, a model or a year")).toBeVisible();
});
