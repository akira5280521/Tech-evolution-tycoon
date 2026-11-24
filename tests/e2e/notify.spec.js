// The notification switches: both off by default, each turns on and off on
// its own and is remembered. (On the web there's nothing to ask permission
// for; on Android turning one on asks first.)
import { test, expect } from "@playwright/test";
import { expectClean, open } from "./helpers.js";

const prefs = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("pc-tycoon-prefs-v1") || "{}"));

test("cap and research switches are separate, off by default, and remembered", async ({ page }) => {
  const seen = await open(page, "/more#settings", "mid");
  const cap = page.locator("[data-notify-cap]");
  const research = page.locator("[data-notify-research]");
  await expect(cap).toHaveText("CAP REMINDER: OFF");
  await expect(research).toHaveText("RESEARCH DONE: OFF");
  await research.click();
  await expect(research).toHaveText("RESEARCH DONE: ON");
  await expect(cap).toHaveText("CAP REMINDER: OFF");
  expect((await prefs(page)).notifyResearch).toBe(true);
  await page.reload();
  await expect(page.locator("[data-notify-research]")).toHaveText("RESEARCH DONE: ON");
  await page.locator("[data-notify-research]").click();
  await expect(page.locator("[data-notify-research]")).toHaveText("RESEARCH DONE: OFF");
  expect((await prefs(page)).notifyResearch).toBe(false);
  expectClean(seen);
});
