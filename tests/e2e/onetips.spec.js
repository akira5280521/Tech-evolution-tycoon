// One-time tips stay seen: RUNNING LOW (and the other tips) show once per
// save, and GOT IT survives a reload, a new shortage and a prestige.
import { test, expect } from "@playwright/test";
import { expectClean, open, saved } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const LOOM = BUSINESSES.findIndex((b) => b.id === "loom");
const far = () => Date.now() + 9e9;
const save = (tips = []) => ({
  version: 12, cash: 100, lifetime: 5000, investors: 0, lastSeen: Date.now(), restartSeen: true, sawPit: true, starterGranted: true, hubSeen: true,
  tutorial: { seen: [], tips, tipsOff: false, done: true },
  nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
  supply: { wood: 0, paper: 0 },
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= LOOM ? 10 : 0, manager: i === LOOM, running: false, progress: 0 })),
});

test("RUNNING LOW shows once; GOT IT keeps it away after a reload and the next shortage", async ({ page }) => {
  const seen = await open(page, "/", save());
  // Dismiss any earlier tips until RUNNING LOW comes up.
  for (let k = 0; k < 12; k++) {
    const id = await page.locator("[data-tip]").first().getAttribute("data-tip", { timeout: 3000 }).catch(() => null);
    if (!id || id === "running-low") break;
    await page.locator("[data-tip-ok]").first().click();
  }
  await expect(page.locator("[data-tip='running-low']").first()).toBeVisible();
  await expect.poll(async () => (await saved(page))?.tutorial?.tipsShown || []).toContain("running-low");
  // Paper and wood arrive: the shortage is over, but the unread tip stays up.
  await page.evaluate(() => {
    const k = "pc-tycoon-save-v1";
    const d = JSON.parse(localStorage.getItem(k));
    d.supply = { ...d.supply, wood: 1e6, paper: 1e6 };
    d.lastSeen = Date.now();
    localStorage.setItem(k, JSON.stringify(d));
  });
  await page.reload();
  await expect(page.locator("[data-tip='running-low']").first()).toBeVisible();
  await page.locator("[data-tip-ok]").first().click();
  await expect(page.locator("[data-tip='running-low']")).toHaveCount(0);
  await expect.poll(async () => (await saved(page))?.tutorial?.tips || []).toContain("running-low");
  await page.reload();
  await page.waitForTimeout(1500);
  await expect(page.locator("[data-tip='running-low']")).toHaveCount(0);
  expectClean(seen);
});

test("a save that saw RUNNING LOW never sees it again, even after a prestige", async ({ page }) => {
  const s = { ...save(["running-low"]), lifetime: 1e13 };
  const seen = await open(page, "/", s);
  await page.waitForTimeout(1500);
  await expect(page.locator("[data-tip='running-low']")).toHaveCount(0);
  const tips = (await saved(page))?.tutorial?.tips || [];
  expect(tips).toContain("running-low");
  expectClean(seen);
});
