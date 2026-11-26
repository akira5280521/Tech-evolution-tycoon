// Manager ON/OFF switch, the fixed SUPPLY card layout, and the CASH box
// without the run's earnings (they moved to the locked next-era row).
import { test, expect } from "@playwright/test";
import { expectClean, open, saved, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const far = () => Date.now() + 9e9;
const save = ({ wood = 50, managerOff = false, lifetime = 10, section = "supply" } = {}) => ({
  version: 12, cash: 0, lifetime, investors: 0, lastSeen: Date.now(), sawPit: true, starterGranted: true, hubSeen: true,
  tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
  nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
  supply: { wood },
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i === 0 ? 10 : 0, manager: i === 0, managerOff: i === 0 && managerOff, running: false, progress: 0, activeMs: 0, commissionUntil: 0 })),
  _section: section,
});
async function go(page, s, path = "/") {
  const { _section, ...data } = s;
  const seen = await open(page, path, data, { extra: { "pc-tycoon-prefs-v1": JSON.stringify({ gameSection: _section }) } });
  await tipsOff(page);
  return seen;
}
const cashNow = async (page) => (await saved(page))?.cash || 0;

test("switching a manager off stops its cycles, on resumes them, and it survives a reload", async ({ page }) => {
  const seen = await go(page, save());
  const toggle = page.locator("[data-manager-toggle='timber']");
  await expect(toggle).toHaveAttribute("data-on", "1");
  const box = await toggle.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(48);
  await expect.poll(() => cashNow(page), { timeout: 10000 }).toBeGreaterThan(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute("data-on", "0");
  await expect(page.locator("[data-row='timber'] [data-manager-status]")).toHaveText("Manager: off");
  const paused = (await saved(page)).cash;
  await page.waitForTimeout(5000);
  expect((await saved(page)).cash).toBe(paused);
  expect((await saved(page)).biz[0].managerOff).toBe(true);
  // A paused row runs by tap like a manual one.
  await expect(page.locator("[data-tile='timber']")).toHaveAttribute("aria-label", /Tap to run/);
  await page.reload();
  await expect(page.locator("[data-manager-toggle='timber']")).toHaveAttribute("data-on", "0");
  await page.waitForTimeout(3000);
  expect((await saved(page)).cash).toBe(paused);
  await page.locator("[data-manager-toggle='timber']").click();
  await expect(page.locator("[data-manager-toggle='timber']")).toHaveAttribute("data-on", "1");
  await expect.poll(() => cashNow(page), { timeout: 10000 }).toBeGreaterThan(paused);
  expectClean(seen);
});

for (const width of [412, 320]) {
  test(`SUPPLY card keeps its height at ${width}px when the bin fills or the manager switches`, async ({ page }) => {
    await page.setViewportSize({ width, height: 915 });
    const card = page.locator("[data-row='timber']");
    let seen = await go(page, save({ wood: 5 }));
    await expect(card.locator("[data-bin='wood'] [data-full]")).toHaveCount(0);
    const before = (await card.boundingBox()).height;
    await page.locator("[data-manager-toggle='timber']").click();
    await expect(card.locator("[data-manager-status]")).toHaveText("Manager: off");
    expect((await card.boundingBox()).height).toBe(before);
    expectClean(seen);
    // Close the first page: both pages share one save, and a page still
    // running keeps writing its own over the second one's.
    const context = page.context();
    await page.close();
    const page2 = await context.newPage();
    await page2.setViewportSize({ width, height: 915 });
    seen = await go(page2, save({ wood: 1e9 }));
    const card2 = page2.locator("[data-row='timber']");
    await expect(card2.locator("[data-bin='wood'] [data-full]")).toHaveCount(1);
    expect((await card2.boundingBox()).height).toBe(before);
    expectClean(seen);
  });
}

test("TECH row keeps its height when the manager switches", async ({ page }) => {
  const seen = await go(page, save({ section: "tech" }));
  // Timber is a SUPPLY row; use the TECH list's first managed row if any, else switch section.
  await page.locator("[data-section='supply']").click();
  const row = page.locator("[data-row='timber']");
  const before = (await row.boundingBox()).height;
  await page.locator("[data-manager-toggle='timber']").click();
  await page.locator("[data-manager-toggle='timber']").click();
  expect((await row.boundingBox()).height).toBe(before);
  expectClean(seen);
});

// Just short of Minicomputers (same shape as eras.spec's shortOf).
const beforeIcs = (lifetime) => {
  const at = BUSINESSES.findIndex((b) => b.id === "minis");
  return {
    version: 12, cash: 1e30, lifetime, investors: 0, lastSeen: Date.now(), restartSeen: true, erasOpened: [], sawPit: true,
    tutorial: { seen: [], tips: [], tipsOff: true, done: true }, erasPaid: BUSINESSES.map((b) => b.id),
    biz: BUSINESSES.map((_, i) => ({ owned: i < at ? 25 : 0, manager: i < at })),
    _section: "tech",
  };
};
test("CASH box shows cash and income only, with a fixed height; the locked era shows this run's earnings", async ({ page }) => {
  let seen = await go(page, beforeIcs(23_900));
  const panel = page.locator("[data-cash-panel]");
  await expect(panel).not.toContainText("earned this run");
  await expect(page.locator("[data-cash-rate]")).toContainText("/s income");
  const h = (await panel.boundingBox()).height;
  // The locked era waits at the end of the TECH list.
  await expect.poll(async () => {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    return page.locator("[data-locked-era]").count();
  }, { timeout: 10000 }).toBeGreaterThan(0);
  await expect(page.locator("[data-locked-era] [data-era-earned]")).toContainText("earned this run");
  await expect(page.locator("[data-locked-era] [data-era-earned]")).toHaveText(/^\$[\d.]+K of \$120\.00M earned this run$/);
  expectClean(seen);
  const page2 = await page.context().newPage();
  seen = await go(page2, { ...beforeIcs(1e40), cash: 1e40 });
  expect((await page2.locator("[data-cash-panel]").boundingBox()).height).toBe(h);
  expectClean(seen);
});

test("the CASH box keeps the same height while an Overclock is running", async ({ page }) => {
  const base = beforeIcs(1e6);
  let seen = await go(page, base);
  const panel = page.locator("[data-cash-panel]");
  const off = panel.locator("[data-overclock]");
  await expect(off).toHaveCount(1);
  await expect(off).toHaveText(/^\s*$/);
  const h = (await panel.boundingBox()).height;
  expectClean(seen);
  // Close the first page so it can't write its save over the second one's.
  const context = page.context();
  await page.close();
  const page2 = await context.newPage();
  seen = await go(page2, { ...base, lab: { ...(base.lab || {}), overclockUntil: Date.now() + 8 * 60 * 1000 } });
  const panel2 = page2.locator("[data-cash-panel]");
  await expect(panel2.locator("[data-overclock]")).toContainText("OVERCLOCKED x1.5");
  await expect(panel2.locator("[data-overclock]")).toContainText("MIN LEFT");
  expect((await panel2.boundingBox()).height).toBe(h);
  expectClean(seen);
});

