// The locked era row lists every need with progress.
import { test, expect } from "@playwright/test";
import { SAVES, expectClean, open, tipsOff } from "./helpers.js";

test("the locked era shows owning enough and earning enough, each with progress", async ({ page }) => {
  const save = { ...SAVES.mid, lastSeen: Date.now(), lifetime: 0, erasOpened: [] };
  const seen = await open(page, "/", save);
  await tipsOff(page);
  const row = page.locator("[data-locked-era]");
  await row.scrollIntoViewIfNeeded();
  await expect(row.locator("[data-era-need='own']")).toContainText(/Own 10 .*\(\d+\/10\)/);
  await expect(row.locator("[data-era-need='earn']")).toContainText(/Earn \$.* this run \(\$/);
  await expect(row.locator("[data-era-need='earn']")).toHaveAttribute("data-met", "0");
  expectClean(seen);
});

import { BUSINESSES } from "../../src/lib/gameConfig.js";
// A save in the current row order, just short of the given era.
export function shortOf(eraId, extra = {}) {
  const at = BUSINESSES.findIndex((b) => b.id === eraId);
  return {
    version: 12,
    cash: 1e30,
    lifetime: 1e300,
    investors: 0,
    lastSeen: Date.now(),
    restartSeen: true,
    erasOpened: [],
    biz: BUSINESSES.map((_, i) => ({ owned: i < at ? 25 : 0, manager: i < at })),
    ...extra,
  };
}

test("a late era names its TECH project and GO TO TECH opens it", async ({ page }) => {
  const seen = await open(page, "/", shortOf("quantum", { techDone: [] }));
  await tipsOff(page);
  const need = page.locator("[data-locked-era] [data-era-need='research']");
  await need.scrollIntoViewIfNeeded();
  await expect(need).toContainText("Research Tensor P100 on TECH");
  await need.locator("[data-era-research]").click();
  await expect(page).toHaveURL(/\/tech#card-p100$/);
  await expect(page.locator("[data-research-item='card-p100']")).toHaveAttribute("data-focus", "1");
  expectClean(seen);
});
