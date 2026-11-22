// The locked era row lists every need with progress.
import { test, expect } from "@playwright/test";
import { SAVES, expectClean, open, tipsOff } from "./helpers.js";

test("the locked era shows owning enough and earning enough, each with progress", async ({ page }) => {
  const save = { ...SAVES.mid, lastSeen: Date.now(), lifetime: 0, erasOpened: [] };
  const seen = await open(page, "/", save);
  await tipsOff(page);
  const row = page.locator("[data-locked-era]");
  await row.scrollIntoViewIfNeeded();
  await expect(row.locator("[data-era-need='own']")).toContainText(/Own 10 .*\(\d+\/10\)/);
  await expect(row.locator("[data-era-need='earn']")).toContainText(/Earn \$.* this run \(\$/);
  await expect(row.locator("[data-era-need='earn']")).toHaveAttribute("data-met", "0");
  expectClean(seen);
});
