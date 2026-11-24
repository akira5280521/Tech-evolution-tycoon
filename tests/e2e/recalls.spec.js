// Product recalls: the event shows as a recall, keeps its id through a
// reload, and riding it out halves the row with a line saying so.
import { test, expect } from "@playwright/test";
import { expectClean, open, saved, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const at = BUSINESSES.findIndex((b) => b.id === "multimedia");
const save = () => ({
  version: 12,
  cash: 1e15,
  lifetime: 1e15,
  investors: 0,
  lastSeen: Date.now(),
  restartSeen: true,
  sawPit: true,
  erasPaid: BUSINESSES.map((b) => b.id),
  biz: BUSINESSES.map((_, i) => ({ owned: i <= at ? 25 : 0, manager: i <= at })),
  tutorial: { seen: [], tips: [], tipsOff: true, done: true },
  eventsDone: ["short-dram"],
  dilemma: { id: "recall-fdiv", expiresAt: Date.now() + 45_000 },
  nextWindfallAt: Date.now() + 9e9,
  nextBubbleAt: Date.now() + 9e9,
});

test("a recall keeps its id through a reload, and riding it out halves that row", async ({ page }) => {
  const seen = await open(page, "/", save());
  await tipsOff(page);
  const modal = page.locator("[data-recall-event='recall-fdiv']");
  await expect(modal).toBeVisible();
  await expect(modal).toContainText("PRODUCT RECALL");
  await expect(modal).toContainText("1994 DIVISION BUG");
  await page.reload();
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await expect(modal).toBeVisible();
  await expect(modal.locator("[data-dilemma='b']")).toContainText("Microprocessors earn half for 10 minutes");
  await modal.locator("[data-dilemma='b']").click();
  await expect(modal).toHaveCount(0);
  await expect.poll(async () => (await saved(page)).recall?.era ?? null).toBe("cpu");
  await expect(page.locator("[data-recall]")).toContainText(/Riding out a recall: earning half for \d+ more min/);
  await expect(page.locator("[data-recall]")).toHaveCount(1);
  expectClean(seen);
});
