// Two fingers on two ready tiles should start both rows. Browsers only fire
// click for the first finger, so the tiles listen for pointerup per pointerId.
import { test, expect } from "@playwright/test";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { expectClean, open, tipsOff } from "./helpers.js";

test.use({ hasTouch: true });

const far = () => Date.now() + 9e9;
const save = () => ({
  version: 12, cash: 1e6, lifetime: 10, investors: 0, lastSeen: Date.now(),
  sawPit: true, starterGranted: true, hubSeen: true,
  tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
  nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
  supply: { sand: 50 },
  biz: BUSINESSES.map((b) => ({
    id: b.id,
    owned: b.id === "copper" || b.id === "glass" ? 1 : 0,
    manager: false, running: false, progress: 0, activeMs: 0, commissionUntil: 0,
  })),
});

async function go(page) {
  const seen = await open(page, "/", save(), { extra: { "pc-tycoon-prefs-v1": JSON.stringify({ gameSection: "supply" }) } });
  await tipsOff(page);
  return seen;
}

async function touchBoth(page, first, second) {
  // Scroll only the first tile; scrolling both can tuck the first under the
  // sticky cash bar. Events go to the tile elements directly (two pointerIds),
  // because a real browser only fires click for the first finger.
  await first.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.evaluate(([elA, elB]) => {
    const fire = (el, type, id, buttons) => {
      const r = el.getBoundingClientRect();
      el.dispatchEvent(new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: id,
        pointerType: "touch",
        clientX: r.x + r.width / 2,
        clientY: r.y + r.height / 2,
        button: 0,
        buttons,
        isPrimary: id === 1,
      }));
    };
    fire(elA, "pointerdown", 1, 1);
    fire(elB, "pointerdown", 2, 1);
    fire(elA, "pointerup", 1, 0);
    fire(elB, "pointerup", 2, 0);
  }, [await first.elementHandle(), await second.elementHandle()]);
}

test("two fingers start Copper Seam and Glassworks at the same time", async ({ page }) => {
  const seen = await go(page);
  const copper = page.locator("[data-tile='copper']");
  const glass = page.locator("[data-tile='glass']");
  await expect(copper).toBeVisible();
  await expect(glass).toBeVisible();
  await expect(page.locator("[data-row='copper']")).toHaveAttribute("data-running", "0");
  await expect(page.locator("[data-row='glass']")).toHaveAttribute("data-running", "0");
  await touchBoth(page, copper, glass);
  await expect(page.locator("[data-row='copper']")).toHaveAttribute("data-running", "1");
  await expect(page.locator("[data-row='glass']")).toHaveAttribute("data-running", "1");
  expectClean(seen);
});

test("a single tap starts a row once, without a shake", async ({ page }) => {
  const seen = await go(page);
  const copper = page.locator("[data-tile='copper']");
  await copper.click();
  await expect(page.locator("[data-row='copper']")).toHaveAttribute("data-running", "1");
  await expect(copper).not.toHaveClass(/tile-shake/);
  await expect(page.locator("[data-row='glass']")).toHaveAttribute("data-running", "0");
  expectClean(seen);
});
