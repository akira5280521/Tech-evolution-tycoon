// Facilities: the best-next-part line names a part and highlights it, and
// buying it moves the plants' pay.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";

test("best next part is shown, highlighted, and pays", async ({ page }) => {
  const seen = await open(page, "/facilities", "late");
  await tipsOff(page);
  const line = page.locator("[data-next-part]");
  await expect(line).toContainText(/Best next part: .+ for the (mine|cluster)/);
  const best = page.locator("[data-best-part]");
  await expect(best).toHaveCount(1);
  const pay = async () => page.locator("[data-facility-yield]").allInnerTexts();
  const before = await pay();
  // Follow the suggestion a few times.
  for (let i = 0; i < 6; i++) {
    const card = page.locator("[data-best-part]");
    if (!(await card.count())) break;
    await card.locator("button").last().click();
    await page.waitForTimeout(250);
  }
  await expect.poll(pay).not.toEqual(before);
  expectClean(seen);
});

// The top button beside TECH opens a hub; its RIGS sub-button opens the plants.
test("top RIGS button opens the hub, and its RIGS button opens the plants", async ({ page }) => {
  const seen = await open(page, "/", "late");
  await tipsOff(page);
  const top = page.locator("[data-open-facilities]");
  await expect(top).toHaveText("RIGS");
  await top.click();
  await expect(page).toHaveURL(/\/rigs$/);
  const items = page.locator("[data-hub-item]");
  await expect(items.first()).toHaveAttribute("data-hub-item", "rigs");
  await items.first().click();
  await expect(page).toHaveURL(/\/facilities$/);
  await expect(page.locator("[data-facility='servers']")).toBeVisible();
  // BACK returns to the hub, not the game screen.
  await page.getByRole("link", { name: "< BACK" }).click();
  await expect(page).toHaveURL(/\/rigs$/);
  expectClean(seen);
});

test("hub button stays ??? until the plants open", async ({ page }) => {
  const seen = await open(page, "/", "fresh");
  await tipsOff(page);
  const top = page.locator("[data-open-facilities]");
  await expect(top).toHaveText("???");
  await expect(top).toHaveAttribute("data-locked", "");
  await page.goto("/rigs");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await expect(page.locator("[data-hub-item='rigs']")).toHaveAttribute("data-locked", "");
  expectClean(seen);
});
