// Colorblind colors: off by default; on, good is blue and bad is red-orange,
// in the dark theme and with high contrast too. Remembered across a reload.
import { test, expect } from "@playwright/test";
import { expectClean, open } from "./helpers.js";

const tokens = (page) =>
  page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return { ok: cs.getPropertyValue("--game-success").trim(), bad: cs.getPropertyValue("--game-danger").trim(), flag: document.documentElement.dataset.colorblind };
  });

test("colorblind colors swap green and red for blue and orange, and stay on", async ({ page }) => {
  const seen = await open(page, "/more#settings", "mid");
  const btn = page.locator("[data-colorblind-toggle]");
  await expect(btn).toHaveText("COLORBLIND COLORS: OFF");
  const before = await tokens(page);
  expect(before.flag).toBe("off");
  await btn.click();
  await expect(btn).toHaveText("COLORBLIND COLORS: ON");
  await expect.poll(async () => (await tokens(page)).flag).toBe("on");
  const after = await tokens(page);
  expect(after.ok).not.toBe(before.ok);
  expect(after.bad).not.toBe(before.bad);
  expect(["#6ab8ff", "#0a5aa8"]).toContain(after.ok);
  // With high contrast as well.
  await page.locator("button[data-contrast]").click();
  await expect.poll(async () => (await tokens(page)).ok).toBe("#7cc8ff");
  expect((await tokens(page)).bad).toBe("#ff9466");
  await page.reload();
  await expect(page.locator("[data-colorblind-toggle]")).toHaveText("COLORBLIND COLORS: ON");
  await expect.poll(async () => (await tokens(page)).ok).toBe("#7cc8ff");
  expectClean(seen);
});
