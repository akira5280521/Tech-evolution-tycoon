// Naming the company: a new game asks first (the tutorial waits), an older
// save gets a one-time card, and Settings can rename it.
import { test, expect } from "@playwright/test";
import { coachStep, expectClean, open, saved } from "./helpers.js";

test("a new game names the company before the tutorial, and HQ and Settings show it", async ({ page }) => {
  const seen = await open(page, "/", "newrich", { askName: true });
  const screen = page.locator("[data-company-screen]");
  await expect(screen).toBeVisible();
  expect(await coachStep(page)).toBe(null);
  // The dice makes up a name; then type our own.
  const input = page.locator("[data-company-input]");
  const first = await input.inputValue();
  expect(first.length).toBeGreaterThan(3);
  await input.fill("  Pixel   Foundry <3 ");
  await page.click("[data-company-start]");
  await expect(screen).toHaveCount(0);
  await expect.poll(() => coachStep(page)).toBe("run");
  await expect.poll(async () => (await saved(page)).companyName).toBe("Pixel Foundry 3");
  await page.goto("/rigs");
  await expect(page.getByText("Pixel Foundry 3: your hardware. Pick a section.")).toBeVisible();
  await page.goto("/more#settings");
  await page.locator("[data-company-setting] [data-company-input]").fill("Cathode Works");
  // The tutorial card (still on step 1 here) can sit over the button on a
  // short Settings page, so press it from the keyboard.
  await page.locator("[data-company-rename]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-company-rename]")).toHaveText("SAVED");
  await expect.poll(async () => (await saved(page)).companyName).toBe("Cathode Works");
  expectClean(seen);
});

test("skipping keeps the default name and doesn't ask again", async ({ page }) => {
  const seen = await open(page, "/", "newrich", { askName: true });
  await page.click("[data-company-skip]");
  await expect.poll(async () => (await saved(page)).companyAsked).toBe(true);
  await page.reload();
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await page.waitForTimeout(700);
  await expect(page.locator("[data-company-screen]")).toHaveCount(0);
  await expect.poll(() => coachStep(page)).toBe("run");
  expectClean(seen);
});

test("an older save gets a one-time card", async ({ page }) => {
  const seen = await open(page, "/", "late", { askName: true });
  await expect(page.locator("[data-company-screen]")).toHaveCount(0);
  const card = page.locator("[data-company-card]");
  await expect(card).toBeVisible();
  await card.locator("[data-company-name-it]").click();
  await card.locator("[data-company-input]").fill("Relay Data");
  await card.locator("[data-company-save]").click();
  await expect(card).toHaveCount(0);
  await expect.poll(async () => (await saved(page)).companyName).toBe("Relay Data");
  await page.goto("/more#stats");
  await expect(page.locator("[data-stats-company]")).toHaveText("RELAY DATA");
  expectClean(seen);
});
