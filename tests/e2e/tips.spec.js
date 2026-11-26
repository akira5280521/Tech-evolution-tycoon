// One-time tips: never during the tutorial, one at a time, on screen, can be
// turned off and back on. Page tips land on the right page.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipId } from "./helpers.js";

async function placed(page, selector) {
  return page.evaluate((sel) => {
    const s = document.querySelector(sel).getBoundingClientRect();
    const n = document.querySelector('nav[aria-label="Main navigation"]').getBoundingClientRect();
    const side = n.height > n.width;
    return {
      inView: s.top >= 0 && s.bottom <= innerHeight && s.left >= 0 && s.right <= innerWidth,
      clearOfTabs: side ? s.left >= n.right : s.bottom <= n.top,
    };
  }, selector);
}

test("no tips while the first tutorial runs", async ({ page }) => {
  await open(page, "/", "newgame");
  expect(await tipId(page)).toBe(null);
  await expect(page.locator("[data-coach]")).toHaveCount(1);
});

test("tips come one at a time and can be turned off and on", async ({ page }) => {
  const seen = await open(page, "/", "mid");
  expect(await tipId(page)).toBe("prestige");
  expect(await placed(page, "[data-tip]")).toEqual({ inView: true, clearOfTabs: true });
  await page.click("[data-tip-ok]");
  await expect.poll(() => tipId(page)).toBe("fork");
  await page.click("[data-tip-ok]");
  await expect.poll(() => tipId(page)).not.toBe("fork");
  await page.click("[data-tips-off]");
  await expect.poll(() => tipId(page)).toBe(null);
  await page.waitForTimeout(1500);
  await page.reload();
  await page.waitForTimeout(800);
  expect(await tipId(page), "tips stay off after a reload").toBe(null);
  await page.goto("/more#howto");
  await expect(page.locator('[data-action="tips-toggle"]')).toContainText("ON");
  await page.click('[data-action="tips-toggle"]');
  await page.waitForTimeout(1500);
  await page.goto("/");
  await expect.poll(() => tipId(page), { timeout: 8000 }).toBe("prestige");
  expectClean(seen);
});

test("a tip's target exists on the page it points at", async ({ page }) => {
  await open(page, "/", "late");
  for (let i = 0; i < 12; i++) {
    const id = await tipId(page);
    if (!id) break;
    const target = await page.locator("[data-tip]").getAttribute("data-tip-target");
    if (target) await expect(page.locator(target).first(), `target of tip ${id}`).toBeAttached();
    await page.click("[data-tip-ok]");
    await page.waitForTimeout(250);
  }
});

for (const [path, want] of [
  ["/boost", "page-boost"],
  ["/board", "page-board"],
  ["/runs", "page-runs"],
  ["/research", "page-research"],
  ["/rigs", "page-hq"],
  ["/boost#prestige", "page-prestige"],
]) {
  test(`${path} shows its page tip`, async ({ page }) => {
    await open(page, path, "mid");
    await expect.poll(() => tipId(page)).toBe(want);
  });
}
