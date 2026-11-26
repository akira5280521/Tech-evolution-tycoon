// Claude's materials work inside our screens: the material sheet from the
// strip in both game sections, refined grades in the strip, RIGS parts that
// say which materials they lack, material badges and lab projects.
import { test, expect } from "@playwright/test";
import { SAVES, expectClean, open, tipsOff } from "./helpers.js";
import { RESEARCH } from "../../src/lib/research.js";

const SHOTS = process.env.MERGE2_SHOTS;
const quiet = { nextDilemmaAt: Date.now() + 864e5, nextWindfallAt: Date.now() + 864e5, nextBubbleAt: Date.now() + 864e5, dilemma: null, bubble: null, sawPit: true };
const late = (extra = {}) => ({
  ...SAVES.late, ...quiet, lastSeen: Date.now(), bestEra: 30, cash: 1e6,
  tutorial: { ...(SAVES.late.tutorial || {}), done: true, tipsOff: true },
  ...extra,
});
const shot = async (page, name) => {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` });
};
const toToggle = (page) => page.evaluate(() => window.scrollTo(0, 0));

test("the material sheet opens from the strip in TECH and in SUPPLY, refined grades included", async ({ page }) => {
  const seen = await open(page, "/", late({ supply: { ...SAVES.late.supply, silicon: 2000, polysilicon: 40, wafers: 0 } }));
  await tipsOff(page);
  await page.waitForTimeout(4000); // let any toast clear before the pictures
  await expect(page.locator("[data-section='tech']")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-material='polysilicon']")).toContainText("polysilicon");
  await toToggle(page);
  await shot(page, "tech");
  await page.locator("[data-material='silicon']").click();
  await expect(page.locator("[data-storage-sheet='silicon']")).toBeVisible();
  await expect(page.locator("[data-refine-start='polysilicon']")).toBeVisible();
  await expect(page.locator("[data-sell='silicon']")).toBeVisible();
  await shot(page, "material-sheet");
  await page.locator("[data-storage-close]").click();

  await page.locator("[data-section='supply']").click();
  await expect(page.locator("[data-row='silicon']")).toBeVisible();
  await toToggle(page);
  await shot(page, "supply");
  await page.locator("[data-material='polysilicon']").click();
  await expect(page.locator("[data-storage-sheet='polysilicon']")).toBeVisible();
  expectClean(seen);
});

test("a RIGS part short of a material says so on its BUY button", async ({ page }) => {
  const supply = Object.fromEntries(Object.keys(SAVES.late.supply || {}).map((k) => [k, 0]));
  const seen = await open(page, "/facilities/mine", late({ cash: 1e30, techDone: RESEARCH.map((e) => e.id), supply: { ...supply, wafers: 0, glass: 0, copper: 0 } }));
  await tipsOff(page);
  const mats = page.locator("[data-part-materials]");
  await expect(mats.first()).toBeVisible();
  const red = page.locator("[data-part-materials].text-\\[var\\(--game-danger\\)\\]");
  await expect(red.first()).toBeVisible();
  await red.first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -200));
  await page.waitForTimeout(SHOTS ? 5000 : 300); // let the history toast clear for the picture
  await shot(page, "rigs-part-buy");
  expectClean(seen);
});

test("material badges show under MORE > BADGES and lab projects under R&D", async ({ page }) => {
  const seen = await open(page, "/badges", late());
  await expect(page.locator("[data-badge^='made-']").first()).toBeVisible();
  await expect(page.locator("[data-badge='materials-sold']")).toHaveCount(1);
  await page.goto("/research#lab");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await expect(page.locator("[data-lab-material]").first()).toBeVisible();
  expectClean(seen);
});
