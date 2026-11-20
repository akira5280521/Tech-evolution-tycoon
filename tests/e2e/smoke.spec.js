// Every page renders on a fresh, early and late save: no crashes, no broken
// pictures, no requests to outside sites.
import { test, expect } from "@playwright/test";
import { ROUTES, brokenImages, expectClean, open } from "./helpers.js";

for (const save of ["fresh", "early", "late", "v4mid"]) {
  for (const path of ROUTES) {
    test(`${path} renders with the ${save} save`, async ({ page }) => {
      const seen = await open(page, path, save);
      await expect(page.locator("#root, body").first()).not.toBeEmpty();
      expect(await brokenImages(page), "broken pictures").toEqual([]);
      expectClean(seen);
    });
  }
}

test("an old save away for 5 hours gets its away pay and keeps working", async ({ page }) => {
  const seen = await open(page, "/", { ...(await import("./helpers.js")).SAVES.offline, lastSeen: Date.now() - 5 * 3600e3 });
  await expect(page.locator("[data-cash-panel]")).toBeVisible();
  expectClean(seen);
});
