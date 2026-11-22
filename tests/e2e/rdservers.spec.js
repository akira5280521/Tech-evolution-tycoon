// 0.0.29: eras make no R&D points; the starter punch-card machine in HQ >
// RIGS does, from the first era.
import { test, expect } from "@playwright/test";
import { SAVES, expectClean, open, saved, tipsOff } from "./helpers.js";

const fresh = (extra = {}) => ({
  ...SAVES.newgame,
  lastSeen: Date.now(),
  sawPit: true,
  cash: 50,
  supply: { wood: 40 },
  starterGranted: true,
  tutorial: { seen: [], tips: [], tipsOff: true, done: true },
  ...extra,
});

test("a fresh game buys the starter machine in HQ > RIGS and R&D points rise", async ({ page }) => {
  const seen = await open(page, "/", fresh());
  await tipsOff(page);
  // HQ shows once the starter is affordable.
  await page.locator("a[href='/rigs']").first().click();
  await page.locator("[data-hub-item='rigs']").click();
  const room = page.locator("[data-facility='servers']");
  await expect(room.locator("[data-tabulating-room]")).toBeVisible();
  // The machine room's other computers stay hidden and marked Coming soon until Mainframes.
  await expect(room.locator("[data-part='mark1']")).toHaveCount(0);
  await expect(room.locator("[data-facility-needs]")).toContainText("Needs Mainframes");
  await expect(room.locator("[data-facility-needs]")).toContainText("COMING SOON");
  const buy = room.locator("[data-action='buy-tab601']");
  await expect(buy).toBeEnabled();
  const before = (await saved(page))?.data || 0;
  await buy.click();
  await expect.poll(async () => (await saved(page))?.facilities?.servers?.tab601 || 0, { timeout: 10000 }).toBe(1);
  await expect.poll(async () => (await saved(page))?.data || 0, { timeout: 20000 }).toBeGreaterThan(before);
  expectClean(seen);
});

test("an old save before Mainframes gets one free starter machine on load", async ({ page }) => {
  const save = { ...fresh(), data: 3 };
  delete save.starterGranted;
  const seen = await open(page, "/", save);
  await expect.poll(async () => (await saved(page))?.facilities?.servers?.tab601 || 0, { timeout: 10000 }).toBe(1);
  const s = await saved(page);
  expect(s.starterGranted).toBe(true);
  expect(s.data).toBeGreaterThanOrEqual(3);
  expectClean(seen);
});
