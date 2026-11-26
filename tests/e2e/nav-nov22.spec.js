import { test, expect } from "@playwright/test";
import { SAVES, open, tipsOff, expectClean, PREFS_KEY } from "./helpers.js";
import { STARTER_GOALS } from "../../src/lib/goals.js";

function midSave(over = {}, prefs = {}) {
  return {
    save: { ...SAVES.mid, lastSeen: Date.now(), goalsDone: STARTER_GOALS.map((g) => g.id), tutorial: { done: true, seen: [], tips: [], tipsOff: true }, starterGranted: true, facilities: { ...(SAVES.mid.facilities || {}), servers: { "tab601": 1 } }, ...over },
    opts: { prefs: { goalsHidden: true, gameSection: "supply", ...prefs }, extra: prefs.collapseMaxed ? { [PREFS_KEY]: JSON.stringify({ collapseMaxed: true, goalsHidden: true, gameSection: "supply" }) } : undefined },
  };
}

test("era chips jump to an unlocked era", async ({ page }) => {
  const { save, opts } = midSave();
  const seen = await open(page, "/", save, opts);
  await tipsOff(page);
  const chips = page.locator("[data-era-chips]");
  await expect(chips).toBeVisible();
  await expect(chips.getByRole("button", { name: "Timber" })).toBeVisible();
  await expect(page.locator("[data-era-chip=locked]")).toHaveCount(1);
  const paper = page.locator("[data-era-chip=paper]");
  if (await paper.count()) {
    await paper.click();
    await expect(page.locator("[data-row=paper]")).toBeVisible();
  }
  expectClean(seen);
});

test("next goal chip sits under the buy-amount row and jumps to a row", async ({ page }) => {
  const { save, opts } = midSave({
    biz: SAVES.mid.biz.map((row, i) => (i === 0 ? { ...row, owned: 20 } : row)),
  });
  const seen = await open(page, "/", save, opts);
  await tipsOff(page);
  const chip = page.locator("[data-next-goal]");
  await expect(chip).toBeVisible();
  await expect(chip).toContainText("Next:");
  const row = page.locator("[data-buy-modes]");
  const chipBox = await chip.boundingBox();
  const rowBox = await row.boundingBox();
  expect(chipBox.y).toBeGreaterThan(rowBox.y + rowBox.height - 1);
  const goalId = await chip.getAttribute("data-next-goal");
  await chip.click();
  if (goalId && /^(buy|open|ms|hire)-/.test(goalId)) {
    const target = goalId.startsWith("ms-") ? goalId.split("-")[1] : goalId.split("-")[1];
    await expect(page.locator(`[data-row="${target}"]`)).toBeVisible();
  }
  expectClean(seen);
});

test("GAME has no second row of buy-amount buttons; BUY AMOUNT cycles the mode", async ({ page }) => {
  const { save, opts } = midSave({ buyMode: "x1" });
  const seen = await open(page, "/", save, opts);
  await tipsOff(page);
  await expect(page.locator("[data-buy-bar]")).toHaveCount(0);
  await page.locator("[data-buy-modes]").click();
  await expect(page.locator("[data-buy-modes]")).toHaveAttribute("data-mode", "x10");
  expectClean(seen);
});

test("the status bar shows cash, income, R&D points, era and month on every screen; no game title", async ({ page }) => {
  const { save, opts } = midSave({ data: 12.34 });
  const seen = await open(page, "/", save, opts);
  await tipsOff(page);
  await expect(page.getByText("TECH EVOLUTION TYCOON", { exact: true })).toHaveCount(0);
  for (const path of ["/", "/boost", "/research", "/more"]) {
    if (path !== "/") await page.goto(path);
    const bar = page.locator("[data-status-bar]");
    await expect(bar).toHaveCount(1);
    await expect(bar.locator("[data-cash]")).toBeVisible();
    await expect(bar.locator("[data-cash-rate]")).toContainText("/s income");
    await expect(bar.locator("[data-rd-points]")).toHaveText(/^R&D 1\d\.\d$/);
    await expect(bar.locator("[data-calendar-month]")).toHaveText(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/);
    // Era on the left, month on the right of the same line.
    const era = await bar.locator("[data-era-progress]").boundingBox();
    const month = await bar.locator("[data-calendar-month]").boundingBox();
    expect(era.x).toBeLessThan(month.x);
    expect(Math.abs(era.y - month.y)).toBeLessThan(4);
    expect((await bar.boundingBox()).height).toBeLessThan(70);
  }
  expectClean(seen);
});

test("collapse maxed rows, expand on tap, and the Settings toggle", async ({ page }) => {
  const { save, opts } = midSave(
    { upgrades: { timber: { rev: true, spd: true } } },
    { collapseMaxed: true },
  );
  const seen = await open(page, "/", save, opts);
  await tipsOff(page);
  const row = page.locator("[data-row=timber]");
  await expect(row).toHaveAttribute("data-row-collapsed", "");
  await expect(row.locator("[data-action=buy], [data-buy]")).toHaveCount(0);
  await row.click();
  await expect(page.locator("[data-row=timber][data-row-collapsed]")).toHaveCount(0);
  await expect(page.locator("[data-row=timber] [data-row-collapse]")).toBeVisible();
  await page.locator("[data-row-collapse]").click();
  await expect(page.locator("[data-row=timber][data-row-collapsed]")).toHaveCount(1);

  await page.locator("[data-tab=more]").click();
  await page.getByRole("button", { name: "SETTINGS" }).click();
  const toggle = page.locator("[data-collapse-maxed]");
  await expect(toggle).toContainText("ON");
  await toggle.click();
  await expect(toggle).toContainText("OFF");
  await page.locator("[data-tab=game]").click();
  await expect(page.locator("[data-row=timber][data-row-collapsed]")).toHaveCount(0);
  expectClean(seen);
});

test("R&D sub-tabs: QUEUE first, and SPECIALTY and LAB PROJECTS each show their own content", async ({ page }) => {
  const { save, opts } = midSave();
  const seen = await open(page, "/research", save, opts);
  await tipsOff(page);
  const tabs = page.locator("[data-sub-tabs=rd] [data-sub-tab]");
  await expect(tabs).toHaveText(["QUEUE", "TECH", "SPECIALTY", "LAB PROJECTS"]);
  await expect(page.locator("[data-rd-queue]")).toBeVisible();
  // No R&D points card on the queue page: the points are in the status bar.
  await expect(page.locator("main")).not.toContainText("R&D POINTS");
  await page.locator("[data-sub-tab=lab]").click();
  await expect(page).toHaveURL(/#lab/);
  await expect(page.locator("[data-rd-section=lab] [data-rd-summary=lab]")).toBeVisible();
  await expect(page.locator("[data-lab]").first()).toBeVisible();
  await expect(page.locator("[data-action^='commit-'], [data-rd-section=specialty]")).toHaveCount(0);
  await page.locator("[data-sub-tab=specialty]").click();
  await expect(page).toHaveURL(/#specialty/);
  await expect(page.locator("[data-rd-section=specialty] [data-rd-summary=specialty]")).toBeVisible();
  await expect(page.locator("[data-lab]")).toHaveCount(0);
  await expect(page.locator("[data-rd-section=specialty]")).toContainText("COMPANY SPECIALTY");
  expectClean(seen);
});

test("More menu is grouped and still has no Museum tab", async ({ page }) => {
  const { save, opts } = midSave();
  const seen = await open(page, "/more", save, opts);
  await tipsOff(page);
  const tabs = page.locator("[data-more-tabs]");
  await expect(tabs.locator("[data-more-group=game]")).toHaveText("GAME");
  await expect(tabs.locator("[data-more-group=help]")).toHaveText("HELP");
  await expect(tabs.locator("[data-more-group=settings]")).toHaveText("SETTINGS");
  await expect(tabs).toContainText("HOW TO PLAY");
  await expect(tabs).toContainText("STATS");
  await expect(tabs.locator("[data-more-runs]")).toBeVisible();
  await expect(tabs).not.toContainText("MUSEUM");
  await page.getByRole("button", { name: "HOW TO PLAY" }).click();
  await expect(page.locator("[data-howto=navigation]")).toBeVisible();
  expectClean(seen);
});

test("TECH search filters by visible name", async ({ page }) => {
  const { save, opts } = midSave();
  const seen = await open(page, "/tech", save, opts);
  await tipsOff(page);
  const box = page.locator("[data-search=tech]");
  await expect(box).toBeVisible();
  await box.fill("hollerith");
  await expect(page.locator("[data-research-item=tab-hollerith]")).toBeVisible();
  await page.locator("[data-search-clear=tech]").click();
  await expect(box).toHaveValue("");
  expectClean(seen);
});

test("Museum search does not leak locked names", async ({ page }) => {
  const { save, opts } = midSave();
  const seen = await open(page, "/museum", save, opts);
  await tipsOff(page);
  const box = page.locator("[data-search=museum]");
  await expect(box).toBeVisible();
  const locked = page.locator("[data-museum-grid] [data-status=locked]").first();
  if (await locked.count()) {
    const id = await locked.getAttribute("data-exhibit");
    // A name search for a locked id (not shown as a name) should not reveal it
    // if we search a distinctive future name.
    await box.fill("Wootin 60HE");
    await expect(page.locator("[data-exhibit=kb-60he]")).toHaveCount(0);
    await page.locator("[data-search-clear=museum]").click();
    // empty query still lists locked exhibits
    if (id) await expect(page.locator(`[data-exhibit="${id}"]`)).toBeVisible();
  }
  expectClean(seen);
});

test("ready dots appear for unseen boosts and clear after viewing BOOST", async ({ page }) => {
  const { save, opts } = midSave({
    readySeen: { seeded: true, boost: [], research: [], tech: [], hq: [] },
    cash: 1e18,
    upgrades: {},
  });
  const seen = await open(page, "/", save, opts);
  await tipsOff(page);
  await expect(page.locator("[data-tab=boost] [data-ready-dot]")).toBeVisible();
  await page.locator("[data-tab=boost]").click();
  await page.waitForTimeout(300);
  await page.locator("[data-tab=game]").click();
  await expect(page.locator("[data-tab=boost] [data-ready-dot]")).toHaveCount(0);
  expectClean(seen);
});
