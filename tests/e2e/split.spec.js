// The game screen's SUPPLY / TECH toggle: TECH by default, the choice is
// remembered, SUPPLY rows use a compact card with their bins, and a TECH row
// short of a material jumps to the row that makes it.
import { test, expect } from "@playwright/test";
import { SAVES, expectClean, open, saved, tipsOff } from "./helpers.js";

const base = () => ({ ...SAVES.goals, lastSeen: Date.now(), tutorial: { ...(SAVES.goals.tutorial || {}), done: true, tipsOff: true }, cash: 1e6, nextDilemmaAt: Date.now() + 864e5, nextWindfallAt: Date.now() + 864e5, nextBubbleAt: Date.now() + 864e5, dilemma: null, bubble: null, sawPit: true });
const SHOTS = process.env.SPLIT_SHOTS;
// SPLIT_VW=320x568 runs these on another phone size (for the screenshots).
if (process.env.SPLIT_VW) {
  const [width, height] = process.env.SPLIT_VW.split("x").map(Number);
  test.use({ viewport: { width, height } });
}

test("TECH shows by default, SUPPLY holds the material rows, and the choice is kept", async ({ page }) => {
  const seen = await open(page, "/", base());
  await tipsOff(page);
  await expect(page.locator("[data-section='tech']")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-row='loom']")).toBeVisible();
  await expect(page.locator("[data-row='timber']")).toHaveCount(0);
  await expect(page.locator("[data-material='wood']")).toBeVisible(); // strip stays on top
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/tech-${page.viewportSize().width}.png`, fullPage: false });

  await page.locator("[data-section='supply']").click();
  await expect(page.locator("[data-section='supply']")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-row='timber']")).toBeVisible();
  await expect(page.locator("[data-row='paper']")).toBeVisible();
  await expect(page.locator("[data-row='loom']")).toHaveCount(0);
  await expect(page.locator("[data-row='timber'] [data-bin='wood']")).toContainText("/");
  await expect(page.locator("[data-row='timber'] [data-buy='timber']")).toBeVisible();
  await expect(page.locator("[data-material='wood']")).toBeVisible();
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/supply-${page.viewportSize().width}.png`, fullPage: false });

  await page.reload();
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await expect(page.locator("[data-section='supply']")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-row='timber']")).toBeVisible();
  // Buying still works on the compact card.
  const owned = async () => (await saved(page))?.biz?.find((b) => b.id === "timber")?.owned || 0;
  const before = await owned();
  await page.locator("[data-buy='timber']").click();
  await expect.poll(owned).toBeGreaterThan(before);
  expectClean(seen);
});

test("a TECH row short of paper jumps to the Paper Mill, and SUPPLY shows a warning dot", async ({ page }) => {
  const save = { ...base(), supply: { wood: 500, paper: 0 } };
  const seen = await open(page, "/", save);
  await tipsOff(page);
  await expect(page.locator("[data-supply-alert]")).toHaveCount(1);
  const need = page.locator("[data-row='loom'] [data-needs='paper']");
  await expect(need).toBeVisible();
  await need.click();
  await expect(page.locator("[data-section='supply']")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-row='paper']")).toBeInViewport();
  expectClean(seen);
});

test("the next era waits in the TECH list", async ({ page }) => {
  // One Loom: Punch Cards is the next era and still locked.
  const save = { ...base(), biz: SAVES.goals.biz.map((b) => (b.id === "loom" ? { ...b, owned: 1 } : b)) };
  const seen = await open(page, "/", save);
  await tipsOff(page);
  const locked = page.locator("[data-locked-era]");
  await expect(locked).toHaveCount(1);
  await page.locator("[data-section='supply']").click();
  await expect(locked).toHaveCount(0);
  expectClean(seen);
});

test("a new player starts on SUPPLY where Timber Camp is", async ({ page }) => {
  const seen = await open(page, "/", "newgame");
  await expect(page.locator("[data-row='timber']")).toBeVisible();
  await expect(page.locator("[data-section='supply']")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-section='tech']")).toBeDisabled();
  expectClean(seen);
});

test("NEXT MOVE GO opens the game screen on the row it names", async ({ page }) => {
  const save = { ...base(), supply: { wood: 500, paper: 0 }, cash: 1e6 };
  const seen = await open(page, "/more#howto", save);
  await tipsOff(page);
  const go = page.locator("[data-next-move-go]");
  await expect(go).toHaveCount(1);
  const id = await go.getAttribute("data-next-move-go");
  const section = await go.getAttribute("data-next-move-section");
  await go.click();
  await expect(page.locator(`[data-section='${section}']`)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(`[data-row='${id}']`)).toBeInViewport();
  expectClean(seen);
});
