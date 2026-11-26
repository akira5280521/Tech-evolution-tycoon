// The run calendar: an era reached early reads as ahead of history, on the
// locked era row, in a toast and on the Runs page.
import { test, expect } from "@playwright/test";
import { expectClean, open, saved, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { HISTORY_PACE_MS } from "../../src/lib/calendar.js";

const at = BUSINESSES.findIndex((b) => b.id === "cpu");
// Microprocessors owned for the first time this run, a quarter of the way to
// their pace time.
function save() {
  const owned = BUSINESSES.slice(0, at).map((b) => b.id);
  return {
    version: 12,
    cash: 1e6,
    lifetime: 1e6,
    investors: 0,
    lastSeen: Date.now(),
    restartSeen: true,
    erasPaid: BUSINESSES.map((b) => b.id),
    biz: BUSINESSES.map((_, i) => ({ owned: i < at ? 25 : i === at ? 1 : 0, manager: i < at })),
    runStartedAt: Date.now() - HISTORY_PACE_MS.cpu / 4,
    calendar: Object.fromEntries(owned.map((id) => [id, null])),
    historyBest: { loom: 12 },
  };
}

test("reaching an era early is ahead of history, and the Runs page keeps the best", async ({ page }) => {
  const seen = await open(page, "/", save());
  await tipsOff(page);
  await expect(page.getByText(/Microprocessors: \d+ years ahead of history/)).toBeVisible();
  await expect.poll(async () => (await saved(page)).historyBest?.cpu ?? null).toBeGreaterThan(0);
  const s = await saved(page);
  expect(s.calendar.cpu).toBe(s.historyBest.cpu);
  // The next era's locked row shows the calendar against its real year.
  const row = page.locator("[data-locked-era]");
  await row.scrollIntoViewIfNeeded();
  await expect(row.locator("[data-calendar]")).toContainText(/^Calendar \d{4} · history got here in 1977$/);

  await page.goto("/runs");
  await expect(page.locator("[data-calendar-year]")).toHaveText(/^CALENDAR: \d{4}$/);
  const cpu = page.locator("[data-ahead-row='cpu']");
  await expect(cpu).toHaveAttribute("data-run", String(s.calendar.cpu));
  await expect(cpu).toContainText(`▲ ${s.calendar.cpu}`);
  // A best from an earlier run shows even when this run hasn't reached it.
  await expect(page.locator("[data-ahead-row='loom']")).toHaveAttribute("data-best", "12");
  expectClean(seen);
});

test("a save from before the calendar scores nothing it already owns", async ({ page }) => {
  const old = { ...save(), calendar: undefined, historyBest: undefined };
  const seen = await open(page, "/", old);
  await tipsOff(page);
  await expect.poll(async () => (await saved(page)).calendar?.cpu === null).toBe(true);
  expect((await saved(page)).historyBest || {}).toEqual({});
  await page.goto("/runs");
  await expect(page.locator("[data-ahead-table]")).toHaveCount(0);
  expectClean(seen);
});

test("beating an earlier best pays an era token", async ({ page }) => {
  const seen = await open(page, "/", { ...save(), tokens: 3, historyBest: { cpu: -40 } });
  await tipsOff(page);
  // The token itself, from the save: the toast that says so can be stacked
  // behind others, or gone, by the time a slow run looks.
  await expect.poll(async () => (await saved(page)).tokens).toBe(4);
  expect((await saved(page)).calendarTokens).toBe(1);
  expect((await saved(page)).historyBest.cpu).toBeGreaterThan(-40);
  expectClean(seen);
});
