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

import { SAVES, saved } from "./helpers.js";

test("every open part shows what it would add", async ({ page }) => {
  await open(page, "/facilities", "late");
  await tipsOff(page);
  const values = await page.locator("[data-part-value]").allInnerTexts();
  expect(values.length).toBeGreaterThan(10);
  expect(values.some((t) => /^\+/.test(t)), "at least one part adds something").toBe(true);
  for (const t of values) expect(t).not.toMatch(/NaN|undefined|Infinity/);
});

test("REBUILD buys last run's plants back after a prestige", async ({ page }) => {
  const late = SAVES.late;
  const lastPlants = { mine: { raster3060: 2, psu750: 1, fans: 2, ddr4_16: 1 }, cluster: { raster3060: 2, psu750: 1, fans: 2, ddr4_32: 1 }, servers: { rack1: 1, psu400: 1, labfan: 1, hdd1t: 1 } };
  await open(page, "/facilities", { ...late, facilities: { mine: {}, cluster: {}, servers: {} }, lastPlants, cash: 1e15, lastSeen: Date.now() });
  await tipsOff(page);
  await expect(page.locator("[data-rebuild]")).toContainText("12 parts to go");
  await page.click('[data-action="rebuild"]');
  await expect(page.locator("[data-rebuild]")).toHaveCount(0);
  await expect.poll(async () => (await saved(page))?.facilities?.cluster?.raster3060).toBe(2);
});

test("64 GB sticks an old save held in the mine are refunded", async ({ page }) => {
  const late = SAVES.late;
  await open(page, "/", { ...late, cash: 1000, facilities: { mine: { ddr5_64: 1 }, cluster: {}, servers: {} }, lastSeen: Date.now() });
  await expect.poll(async () => (await saved(page))?.cash).toBeGreaterThan(1e9);
  expect((await saved(page)).facilities.mine.ddr5_64 || 0).toBe(0);
});

test("the cluster's memory board shows its slots and swaps to DDR5", async ({ page }) => {
  const late = SAVES.late;
  const cluster = { raster3060: 2, psu750: 2, fans: 2, ddr4_32: 3 };
  await open(page, "/facilities", { ...late, cash: 1e15, facilities: { mine: {}, cluster, servers: {} }, lastSeen: Date.now() });
  await tipsOff(page);
  const board = page.locator('[data-facility="cluster"] [data-board]');
  await expect(board).toContainText("3 of 32 slots used on the DDR4 server board");
  const ddr5 = page.locator('[data-facility="cluster"] [data-part="ddr5_64"]');
  await expect(ddr5.locator("[data-part-value]")).toContainText("switches to a DDR5 board");
  await ddr5.locator('[data-action="buy-ddr5_64"]').click();
  await expect(board).toContainText("1 of 32 slots used on the DDR5 server board");
  await expect(page.locator('[data-facility="cluster"] [data-action="buy-ddr4_32"]')).toBeDisabled();
  await expect(page.locator('[data-facility="cluster"] [data-part="ddr4_32"] [data-part-value]')).toContainText("This board takes DDR5 now.");
});
