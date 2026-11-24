// The museum's RECORDS wing: compute power passes real records (tokens once,
// kept forever), and the Moore's Law chart fills in with chips found.
import { test, expect } from "@playwright/test";
import { expectClean, open, saved, SAVES } from "./helpers.js";

test("compute records pay once and show in the RECORDS wing with the Moore's Law chart", async ({ page }) => {
  const late = SAVES.late;
  const save = {
    ...late,
    lastSeen: Date.now(),
    tokens: 0,
    computeRecords: [],
    facilities: { ...(late.facilities || {}), servers: { ...(late.facilities?.servers || {}), t3e: 1 } },
  };
  const seen = await open(page, "/more#museum", save);
  await expect(page.getByText("Compute record: ASCI Red")).toBeVisible();
  await expect.poll(async () => (await saved(page)).computeRecords).toEqual(expect.arrayContaining(["chippewa1", "gigaflop", "asci-red"]));
  const s = await saved(page);
  expect(s.computeRecords).not.toContain("earth-sim");
  expect(s.tokens).toBeGreaterThanOrEqual(30);

  await page.click("[data-wing='records']");
  await expect(page.locator("[data-records]")).toBeVisible();
  await expect(page.locator("[data-compute]")).toContainText(/FLOPS$/);
  await expect(page.locator("[data-record='asci-red']")).toHaveAttribute("data-passed", "1");
  await expect(page.locator("[data-record='summit']")).toHaveAttribute("data-passed", "0");
  await expect(page.locator("[data-compute-next]")).toHaveAttribute("data-compute-next", "earth-sim");
  // The chart: a line and a point per chip, some found in a late save.
  await expect(page.locator("[data-moore-line]")).toHaveCount(1);
  await expect(page.locator("[data-moore-point]")).toHaveCount(19);
  const found = Number(await page.locator("[data-moore-found]").getAttribute("data-moore-found"));
  await expect(page.locator("[data-moore-point][data-found='1']")).toHaveCount(found);
  // Passed again on a reload: no second payment.
  const tokens = (await saved(page)).tokens;
  await page.reload();
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await page.waitForTimeout(1500);
  expect((await saved(page)).tokens).toBeLessThanOrEqual(tokens + 6);
  expectClean(seen);
});
