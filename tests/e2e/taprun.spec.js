// The TAP TO RUN label on a business picture is a tutorial hint: it shows
// while the tutorial runs, and never after it is finished or skipped. The
// picture still runs the business either way.
import { test, expect } from "@playwright/test";
import { SAVES, expectClean, open, saved } from "./helpers.js";

test("a new player sees TAP TO RUN during the tutorial", async ({ page }) => {
  const seen = await open(page, "/", "newgame");
  await expect(page.locator("[data-tile='timber'] [data-tap-run]")).toBeVisible();
  expectClean(seen);
});

for (const [name, tutorial] of [["finished", { done: true }], ["skipped", { skipped: true }]]) {
  test(`no TAP TO RUN once the tutorial is ${name}, and the picture still runs`, async ({ page }) => {
    const save = { ...SAVES.newgame, lastSeen: Date.now(), sawPit: true, lifetime: 0, tutorial: { seen: [], tips: [], tipsOff: true, ...tutorial } };
    const seen = await open(page, "/", save);
    const tile = page.locator("[data-tile='timber']");
    await expect(tile).toBeVisible();
    await expect(page.locator("[data-tap-run]")).toHaveCount(0);
    await tile.click();
    await expect.poll(async () => (await saved(page))?.lifetime || 0, { timeout: 15000 }).toBeGreaterThan(0);
    await expect(page.locator("[data-tap-run]")).toHaveCount(0);
    expectClean(seen);
  });
}
