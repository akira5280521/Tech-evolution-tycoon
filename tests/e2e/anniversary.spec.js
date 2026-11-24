// Anniversary week: on a real launch day's week, the banner names it and that
// era's row says it earns more. The clock is set to inside the 4004's week.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const at = BUSINESSES.findIndex((b) => b.id === "cpu");
const save = (now) => ({
  version: 12,
  cash: 1e9,
  lifetime: 1e9,
  investors: 0,
  lastSeen: now,
  restartSeen: true,
  sawPit: true,
  erasPaid: BUSINESSES.map((b) => b.id),
  biz: BUSINESSES.map((_, i) => ({ owned: i <= at ? 25 : 0, manager: i <= at })),
  tutorial: { seen: [], tips: [], tipsOff: true, done: true },
  nextWindfallAt: now + 9e9,
  nextDilemmaAt: now + 9e9,
  nextBubbleAt: now + 9e9,
});

test("in the 4004's week the banner names it and Microprocessors earn more", async ({ page }) => {
  const now = new Date(2026, 10, 17, 12).getTime();
  await page.clock.setFixedTime(now);
  const seen = await open(page, "/", save(now));
  await tipsOff(page);
  const banner = page.locator("[data-anniversary]");
  await expect(banner).toBeVisible();
  await expect(banner.locator("[data-anniversary-era='cpu']")).toContainText("55 years ago, on November 15, 1971, the Chipwright 4004 was announced. Microprocessors earn ×1.25 until Sat, Nov 21.");
  await expect(page.locator("[data-anniversary-row]")).toHaveCount(1);
  expectClean(seen);
});

test("outside any anniversary week there's no banner", async ({ page }) => {
  const now = new Date(2026, 10, 25, 12).getTime();
  await page.clock.setFixedTime(now);
  const seen = await open(page, "/", save(now));
  await tipsOff(page);
  await expect(page.locator("[data-anniversary]")).toHaveCount(0);
  await expect(page.locator("[data-anniversary-row]")).toHaveCount(0);
  expectClean(seen);
});
