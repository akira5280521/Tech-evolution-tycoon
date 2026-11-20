// The local error log: an error is kept, shown in Copy my stats, and the
// same error repeating counts once.
import { test, expect } from "@playwright/test";
import { open } from "./helpers.js";

test("an error is logged on the phone and shows up in Copy my stats", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const seen = await open(page, "/more#stats", "late");
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => setTimeout(() => { throw new Error("Test failure in the tick"); }, 0));
    await page.waitForTimeout(100);
  }
  const log = await page.evaluate(() => JSON.parse(localStorage.getItem("pc-tycoon-errors-v1") || "[]"));
  expect(log).toHaveLength(1);
  expect(log[0].msg).toContain("Test failure in the tick");
  expect(log[0].n).toBe(3);
  await page.click("[data-copy-stats]");
  await expect(page.locator("[data-stats-text]")).toHaveValue(/Recent errors[\s\S]*Test failure in the tick \(x3\)/);
  // These were thrown on purpose.
  seen.errors.length = 0;
});

test("with no errors, the stats say so", async ({ page }) => {
  await open(page, "/more#stats", "mid");
  await page.click("[data-copy-stats]");
  await expect(page.locator("[data-stats-text]")).toHaveValue(/Recent errors: none/);
});
