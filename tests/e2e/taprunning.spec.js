// Tapping a row that's already running only shakes its picture: the run
// keeps its start time, and the taps don't make the game redraw or save.
import { test, expect } from "@playwright/test";
import { expectClean, open, saved, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const save = (now) => ({
  version: 12, cash: 1e6, lifetime: 1e6, investors: 0, lastSeen: now, restartSeen: true, sawPit: true,
  erasPaid: BUSINESSES.map((b) => b.id),
  biz: BUSINESSES.map((_, i) => ({ owned: i < 6 ? 10 : 0, manager: i > 0 && i < 6 })),
  supply: { wood: 1e5, paper: 1e5 },
  tutorial: { seen: [], tips: [], tipsOff: true, done: true },
  nextWindfallAt: now + 9e9, nextDilemmaAt: now + 9e9, nextBubbleAt: now + 9e9,
});

test("fast taps on a running row leave the run alone", async ({ page }) => {
  const seen = await open(page, "/", save(Date.now()));
  await tipsOff(page);
  await page.locator("button[data-section='supply']").click();
  const tile = page.locator("[data-tile='timber']");
  await tile.click();
  await expect.poll(async () => (await saved(page)).biz[0].running).toBe(true);
  const start = (await saved(page)).biz[0].cycleStart;
  // Count renders of the row while tapping: none should come from the taps.
  for (let k = 0; k < 15; k++) await tile.click({ noWaitAfter: true });
  const after = (await saved(page)).biz[0];
  expect(after.cycleStart).toBe(start);
  expect(after.shake).toBeUndefined();
  expectClean(seen);
});
