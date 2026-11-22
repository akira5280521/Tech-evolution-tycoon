// Facilities: the best-next-part line names a part and highlights it, and
// buying it moves the plants' pay.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const CPU = BUSINESSES.findIndex((b) => b.id === "cpu");

test("best next part is shown, highlighted, and pays", async ({ page }) => {
  const seen = await open(page, "/facilities", "late");
  await tipsOff(page);
  const line = page.locator("[data-next-part]");
  await expect(line).toContainText(/Best next part: .+ for the (mine|cluster)/);
  const best = page.locator("[data-best-part]");
  await expect(best).toHaveCount(1);
  const pay = async () => page.locator("[data-facility-yield]").allInnerTexts();
  const before = await pay();
  // Follow the suggestion a few times.
  for (let i = 0; i < 6; i++) {
    const card = page.locator("[data-best-part]");
    if (!(await card.count())) break;
    await card.locator("button").last().click();
    await page.waitForTimeout(250);
  }
  await expect.poll(pay).not.toEqual(before);
  expectClean(seen);
});

// The top button beside TECH opens a hub; its RIGS sub-button opens the plants.
test("top RIGS button opens the hub, and its RIGS button opens the plants", async ({ page }) => {
  const seen = await open(page, "/", "late");
  await tipsOff(page);
  const top = page.locator("[data-open-facilities]");
  await expect(top).toHaveText("HQ");
  await top.click();
  await expect(page).toHaveURL(/\/rigs$/);
  const items = page.locator("[data-hub-item]");
  await expect(items.first()).toHaveAttribute("data-hub-item", "rigs");
  await items.first().click();
  await expect(page).toHaveURL(/\/facilities$/);
  await expect(page.locator("[data-facility='servers']")).toBeVisible();
  // BACK returns to the hub, not the game screen.
  await page.getByRole("link", { name: "< BACK" }).click();
  await expect(page).toHaveURL(/\/rigs$/);
  expectClean(seen);
});

test("hub button stays ??? until the plants open", async ({ page }) => {
  const seen = await open(page, "/", "fresh");
  await tipsOff(page);
  const top = page.locator("[data-open-facilities]");
  await expect(top).toHaveText("???");
  await expect(top).toHaveAttribute("data-locked", "");
  await page.goto("/rigs");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await expect(page.locator("[data-hub-item='rigs']")).toHaveAttribute("data-locked", "");
  expectClean(seen);
});

// HQ stays open for good once reached, like research. After a prestige the
// plants grey out and say what they need this run.
const hqRow = (id, owned) => ({ id, owned, manager: true, running: false, progress: 0, activeMs: 0, commissionUntil: 0 });
const hqTutorial = { seen: [], done: true, skipped: false, replay: false, tips: [], tipsOff: true };
const hqSave = (cpuOwned, extra = {}) => ({
  version: 7, cash: 1e10, lifetime: 4.2e11, investors: 0, lastSeen: Date.now(), supply: {}, sawPit: true, tutorial: hqTutorial,
  nextWindfallAt: Date.now() + 9e9, nextDilemmaAt: Date.now() + 9e9, nextBubbleAt: Date.now() + 9e9,
  // An old save: no hubSeen flag.
  biz: BUSINESSES.slice(0, CPU + 1).map((cfg, i) => hqRow(cfg.id, i < 4 ? 30 : i === CPU ? cpuOwned : 0)),
  ...extra,
});

test("after a prestige HQ still opens and RIGS says what each plant needs", async ({ page }) => {
  const seen = await open(page, "/", hqSave(1));
  await expect(page.locator("[data-open-facilities]")).toHaveText("HQ");
  await page.click('[data-prestige="recruit"]');
  const report = page.locator("[data-prestige-report-ok]");
  if (await report.count()) await report.click();
  await page.goto("/");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  const top = page.locator("[data-open-facilities]");
  await expect(top).toHaveText("HQ");
  await expect(top).not.toHaveAttribute("data-locked", "");
  await top.click();
  await expect(page).toHaveURL(/\/rigs$/);
  await expect(page.locator("[data-hub-item='rigs']")).not.toHaveAttribute("data-locked", "");
  await page.click("[data-hub-item='rigs']");
  await expect(page).toHaveURL(/\/facilities$/);
  await expect(page.locator("[data-facility='servers'] [data-facility-needs]")).toHaveText("Needs Microprocessors this run");
  await expect(page.locator("[data-facility='mine'] [data-facility-needs]")).toHaveText("Needs AI Accelerators this run");
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), "pc-tycoon-save-v1");
  expect(saved.hubSeen).toBe(true);
  expectClean(seen);
});

test("an old save that once reached Microprocessors gets HQ back", async ({ page }) => {
  const seen = await open(page, "/", hqSave(0, { bestEra: CPU, prestiged: true }));
  await tipsOff(page);
  await expect(page.locator("[data-open-facilities]")).toHaveText("HQ");
  expectClean(seen);
});
