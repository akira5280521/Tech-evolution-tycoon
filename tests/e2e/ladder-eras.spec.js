// T5 items 43 and 44: the mid-game milestone ladder and full-screen era cards.
import { test, expect } from "@playwright/test";
import { expectClean, open, seed, watch } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const far = Date.now() + 9e9;
const quiet = { lastSeen: Date.now(), nextWindfallAt: far, nextDilemmaAt: far, nextBubbleAt: far, nextShortageAt: far };
const idx = (id) => BUSINESSES.findIndex((b) => b.id === id);
const through = (id, extra = {}) => ({
  version: 17, cash: 1e15, lifetime: 1e15, investors: 0, sawPit: true, starterGranted: true, hubSeen: true,
  tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false, toursReady: true, toursDone: ["tour-servers", "tour-bench", "tour-mine", "tour-cluster"] },
  data: 10, techDone: ["tab-hollerith", "srv-mark1"],
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= idx(id) ? 8 : 0, manager: i <= idx(id), running: false, progress: 0 })),
  facilities: { servers: { tab601: 1 }, bench: {}, mine: {}, cluster: {} },
  bestEra: idx(id),
  ...quiet,
  ...extra,
});

test("the ladder is greyed before the first prestige", async ({ page }) => {
  const seen = await open(page, "/progress#runs", through("minis"));
  await expect(page.locator("[data-ladder]")).toHaveAttribute("data-ladder", "locked");
  await expect(page.locator("[data-ladder]")).toContainText("COMING SOON");
  expectClean(seen);
});

test("after a prestige the ladder pays met rungs and shows the next one with its progress", async ({ page }) => {
  const seen = await open(page, "/progress#runs", through("minis", { prestiged: true, prestigeCount: 1, investors: 250, tokens: 0 }));
  const ladder = page.locator("[data-ladder='open']");
  await expect(ladder).toBeVisible();
  await expect(ladder.locator("[data-rung='prestige1']")).toHaveAttribute("data-rung-state", "done");
  await expect(ladder.locator("[data-rung='inv100']")).toHaveAttribute("data-rung-state", "done");
  await expect(ladder.locator("[data-rung='era-cpu']")).toHaveAttribute("data-rung-state", "current");
  await expect(ladder.locator("[data-ladder-count]")).toHaveText(`2/11`);
  expectClean(seen);
});

test("a new era opens full screen: picture, year, name and history; tap to continue", async ({ page }) => {
  const seen = await watch(page);
  const now = Date.now();
  const next = BUSINESSES[idx("minis") + 1].id;
  await seed(page, through("minis", { eraBuild: { id: next, startedAt: now - 60e3, readyAt: now - 1000 } }));
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  const card = page.locator(`[data-era-card='${next}']`);
  await expect(card).toBeVisible();
  const box = await card.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(359);
  expect(box.height).toBeGreaterThanOrEqual(639);
  await expect(card.locator("[data-arrival-name]")).toHaveText(BUSINESSES[idx(next)].name);
  await expect(card.locator("[data-arrival-year]")).not.toBeEmpty();
  await expect(card.locator("img")).toHaveCount(1);
  await expect(card.locator("[data-era-from]")).toContainText("→");
  await card.locator("[data-arrival-dismiss]").click();
  await expect(card).toHaveCount(0);
  expectClean(seen);
});
