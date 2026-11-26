// T3 BOOST: NOW / UPGRADES / BONUSES / PRESTIGE tabs, the Foreman as a perk,
// prestige off the GAME screen, the saved PCs inside the bench.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";

test("BOOST has four tabs with a one-line total; prestige and the Foreman left GAME", async ({ page }) => {
  const seen = await open(page, "/", "late");
  await tipsOff(page);
  await expect(page.locator("[data-prestige='recruit']")).toHaveCount(0);
  await expect(page.locator("[data-action='buy-foreman']")).toHaveCount(0);
  await page.locator("nav[aria-label='Main navigation'] [data-tab='boost']").click();
  await expect(page.locator("[data-boost-total]")).toContainText("All boosts: income x");
  for (const id of ["now", "upgrades", "bonuses", "prestige"]) {
    await expect(page.locator(`[data-sub-tabs='boost'] [data-sub-tab='${id}']`)).toBeVisible();
  }
  await expect(page.locator("[data-foreman-perk]")).toBeVisible();
  await page.locator("[data-sub-tab='now']").click();
  await expect(page.locator("[data-boost-now], [data-boost-now-empty]").first()).toBeVisible();
  await page.locator("[data-sub-tab='bonuses']").click();
  await expect(page.getByText("YOUR BONUSES")).toBeVisible();
  await page.locator("[data-sub-tab='prestige']").click();
  await expect(page.locator("[data-boost-prestige]")).toBeVisible();
  expectClean(seen);
});

test("the Foreman is hired from BOOST > UPGRADES and RUN ALL shows on GAME", async ({ page }) => {
  const seen = await open(page, "/boost#upgrades", { version: 7, cash: 1e6, lifetime: 1e6, investors: 0, lastSeen: Date.now(), supply: {}, sawPit: true,
    tutorial: { seen: [], done: true, skipped: false, replay: false, tips: [], tipsOff: true },
    nextWindfallAt: Date.now() + 9e9, nextDilemmaAt: Date.now() + 9e9, nextBubbleAt: Date.now() + 9e9,
    biz: [{ id: "timber", owned: 10, manager: false, running: false, progress: 0, activeMs: 0, commissionUntil: 0 }] });
  await expect(page.locator("[data-foreman-perk='open']")).toBeVisible();
  await page.locator("[data-action='buy-foreman']").click();
  await expect(page.locator("[data-foreman-perk='hired']")).toBeVisible();
  await page.locator("nav[aria-label='Main navigation'] [data-tab='game']").click();
  await expect(page.locator("[data-run-all]")).toBeVisible();
  expectClean(seen);
});

test("the bench has a SAVED BUILDS tab with the saved PCs", async ({ page }) => {
  const seen = await open(page, "/facilities/bench", "late");
  await tipsOff(page);
  await page.locator("[data-sub-tabs='bench'] [data-sub-tab='saved']").click();
  await expect(page).toHaveURL(/#saved/);
  await expect(page.locator("[data-rigs-garage], [data-rigs-locked]").first()).toBeVisible();
  await page.locator("[data-sub-tabs='bench'] [data-sub-tab='build']").click();
  await expect(page.locator("[data-facility='bench']")).toBeVisible();
  expectClean(seen);
});
