// Research progress bars: the TECH card, the TECH top button, and the R & D
// specialty job all show a bar that fills while the job runs.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const CPU = BUSINESSES.findIndex((b) => b.id === "cpu");
const row = (id, owned) => ({ id, owned, manager: true, running: false, progress: 0, activeMs: 0, commissionUntil: 0 });
const tutorial = { seen: [], done: true, skipped: false, replay: false, tips: [], tipsOff: true };
const save = (extra = {}) => ({
  version: 7, cash: 1e6, lifetime: 1e6, investors: 0, lastSeen: Date.now(), supply: {}, sawPit: true, tutorial,
  nextWindfallAt: Date.now() + 9e9, nextDilemmaAt: Date.now() + 9e9, nextBubbleAt: Date.now() + 9e9,
  biz: BUSINESSES.slice(0, CPU + 1).map((cfg, i) => row(cfg.id, i < 4 || i === CPU ? 10 : 0)),
  data: 5,
  ...extra,
});
const pct = (loc) => loc.getAttribute("data-pct").then(Number);

test("TECH card and top button show a bar that advances", async ({ page }) => {
  const seen = await open(page, "/", save({ techJob: { id: "cpu-8080", progressMs: 1000, durationMs: 30000 } }));
  await tipsOff(page);
  const side = page.locator("[data-open-research] [data-side-progress]");
  await expect(side).toHaveCount(1);
  await page.goto("/tech");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  const bar = page.locator("[data-research-running] [data-progress-bar='tech']");
  await expect(bar).toBeVisible();
  await expect(bar.locator("[data-progress-text]")).toHaveText(/^\d+% · (\d+m )?\d+s left$/);
  const first = await pct(bar);
  await expect.poll(() => pct(bar), { timeout: 8000 }).toBeGreaterThan(first);
  expectClean(seen);
});

test("R & D specialty job shows the same bar, and a thin bar on the R & D tab", async ({ page }) => {
  const now = Date.now();
  const seen = await open(page, "/research", save({ researchJob: { id: "scale", startedAt: now - 2000, readyAt: now + 18000 } }));
  await tipsOff(page);
  const bar = page.locator("[data-progress-bar='specialty']");
  await expect(bar).toBeVisible();
  await expect(bar.locator("[data-progress-text]")).toHaveText(/^\d+% · \d+s left$/);
  await expect(page.locator("[data-tab='research'] [data-tab-progress]")).toHaveCount(1);
  const first = await pct(bar);
  await expect.poll(() => pct(bar), { timeout: 8000 }).toBeGreaterThan(first);
  expectClean(seen);
});
