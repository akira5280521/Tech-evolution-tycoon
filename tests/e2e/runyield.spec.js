// SUPPLY cards show how much one run adds to the bins, and that number
// updates when you buy more copies. The extra line does not change height.
import { test, expect } from "@playwright/test";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { expectClean, open, tipsOff } from "./helpers.js";

const far = () => Date.now() + 9e9;
const save = ({ owned = 1, cash = 1e6 } = {}) => ({
  version: 12, cash, lifetime: 10, investors: 0, lastSeen: Date.now(),
  sawPit: true, starterGranted: true, hubSeen: true,
  tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
  nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
  supply: { copper: 0 },
  biz: BUSINESSES.map((b) => ({
    id: b.id,
    owned: b.id === "copper" ? owned : 0,
    manager: false, running: false, progress: 0, activeMs: 0, commissionUntil: 0,
  })),
});

async function go(page, opts) {
  const seen = await open(page, "/", save(opts), { extra: { "pc-tycoon-prefs-v1": JSON.stringify({ gameSection: "supply" }) } });
  await tipsOff(page);
  return seen;
}

test("the yield line shows copies times the base make, and updates after a buy without changing card height", async ({ page }) => {
  const seen = await go(page, { owned: 1, cash: 1e6 });
  const card = page.locator("[data-row='copper']");
  const line = card.locator("[data-run-yield='copper']");
  await expect(line).toHaveText("+1 copper / run");
  const before = (await card.boundingBox()).height;
  await page.locator("[data-buy='copper']").click();
  await expect(line).toHaveText("+2 copper / run");
  expect((await card.boundingBox()).height).toBe(before);
  expectClean(seen);
});
