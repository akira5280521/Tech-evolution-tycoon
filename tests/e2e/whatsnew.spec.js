// What's New shows once per version, before any tip, and remembers GOT IT.
import { test, expect } from "@playwright/test";
import { NOTES_KEY, VERSION_CODE, open, tipId } from "./helpers.js";

test("What's New shows for a new version, then never again", async ({ page }) => {
  await open(page, "/", "mid", { seenNotes: false });
  const dialog = page.getByRole("dialog", { name: /What's new/i });
  await expect(dialog).toBeVisible();
  expect(await tipId(page), "no tip under What's New").toBe(null);
  await dialog.getByRole("button", { name: /got it/i }).click();
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate((k) => localStorage.getItem(k), NOTES_KEY)).toBe(VERSION_CODE);
  await page.reload();
  await page.waitForTimeout(800);
  await expect(page.getByRole("dialog", { name: /What's new/i })).toHaveCount(0);
});
