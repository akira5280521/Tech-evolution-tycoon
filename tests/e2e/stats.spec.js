// More → Stats → COPY MY STATS shows exactly what is copied.
import { test, expect } from "@playwright/test";
import { expectClean, open } from "./helpers.js";

test("Copy my stats shows the text it copies", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const seen = await open(page, "/more#stats", "late");
  await page.click("[data-copy-stats]");
  const text = page.locator("[data-stats-text]");
  await expect(text).toBeVisible();
  const value = await text.inputValue();
  expect(value).toContain("Tech Evolution Tycoon");
  expect(value).toContain("Best era:");
  expect(value).toContain(": before");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(value);
  expectClean(seen);
});
