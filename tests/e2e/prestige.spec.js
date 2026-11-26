// The prestige guide, first-prestige screen, and challenges after it.
import { test, expect } from "@playwright/test";
import { expectClean, open } from "./helpers.js";

const row = (id, owned) => ({ id, owned, manager: true, running: false, progress: 0, activeMs: 0, commissionUntil: 0 });
const tutorial = { seen: [], done: true, skipped: false, replay: false, tips: [], tipsOff: true };
const save = (over) => ({
  version: 7, cash: 1e10, lifetime: 4.2e11, investors: 0, lastSeen: Date.now(), supply: {}, sawPit: true, tutorial,
  nextWindfallAt: Date.now() + 9e9, nextDilemmaAt: Date.now() + 9e9, nextBubbleAt: Date.now() + 9e9,
  biz: [row("timber", 30), row("paper", 30), row("loom", 30), row("punchcards", 30)],
  ...over,
});

test("first prestige: guide, report, then challenges open", async ({ page }) => {
  const dialogs = [];
  page.on("dialog", (d) => dialogs.push(d.message()));
  const seen = await open(page, "/runs", save({}));
  await expect(page.locator("[data-challenges-locked]")).toHaveCount(1);
  await expect(page.getByText("AFTER FIRST PRESTIGE")).toHaveCount(3);

  await page.goto("/boost#prestige");
  const guide = page.locator("[data-prestige-guide]");
  await expect(guide).toHaveAttribute("data-prestige-guide", "good");
  await expect(guide).toContainText(/×[\d.]+ now → ×[\d.]+ after/);
  await expect(page.locator('[data-prestige-ready="yes"]')).toHaveCount(1);

  await page.click('[data-prestige="recruit"]');
  // Prestige asks once (T4 item 37).
  await expect(page.locator("[data-prestige-report]")).toHaveCount(0);
  await page.click("[data-prestige-go]");
  await expect(page.locator("[data-prestige-report]")).toBeVisible();
  expect(dialogs[0]).toContain("Income: ×");
  await expect(page.locator("[data-prestige-report]")).toContainText("YOU KEPT");
  await expect(page.locator("[data-prestige-report]")).toContainText("STARTED OVER");
  await page.click("[data-prestige-report-ok]");
  await expect(page.locator("[data-prestige-report]")).toHaveCount(0);

  await page.goto("/runs");
  await expect(page.locator("[data-challenges-locked]")).toHaveCount(0);
  await page.locator('[data-action="speed"], [data-action="noboss"]').first().click();
  await expect(page.locator("[data-abandon-challenge]")).toHaveCount(1);
  await page.click("[data-abandon-challenge]");
  await expect(page.locator("[data-abandon-challenge]")).toHaveCount(0);
  expect(dialogs.some((d) => d.startsWith("Abandon the"))).toBe(true);
  expectClean(seen);
});

test("with 30 investors, 2 more says wait", async ({ page }) => {
  await open(page, "/boost#prestige", save({ investors: 30, prestiged: true }));
  await expect(page.locator("[data-prestige-guide]")).toHaveAttribute("data-prestige-guide", "wait");
  await expect(page.locator('[data-prestige-ready="yes"]')).toHaveCount(0);
});
