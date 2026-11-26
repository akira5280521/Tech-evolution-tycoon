// HQ is the menu for each plant and the Hardware Museum. The servers page
// shows the starter rate clearly, and tape drives wait for TECH research.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { SAVE_VERSION } from "../../src/lib/gameSave.js";

const far = () => Date.now() + 9e9;
const through = (id, extra = {}) => {
  const last = BUSINESSES.findIndex((b) => b.id === id);
  return {
    version: SAVE_VERSION,
    cash: 5e6,
    lifetime: 1e7,
    data: 10,
    investors: 0,
    lastSeen: Date.now(),
    sawPit: true,
    starterGranted: true,
    hubSeen: true,
    tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false, toursReady: true, toursDone: ["tour-servers", "tour-bench", "tour-mine", "tour-cluster"] },
    nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
    supply: { wood: 100, paper: 100, sand: 100, copper: 100, glass: 50, filament: 20 },
    facilities: { servers: { tab601: 1 }, bench: {}, mine: {}, cluster: {} },
    biz: BUSINESSES.map((b, i) => ({
      id: b.id, owned: i <= last ? 8 : 0, manager: i <= last, running: false, progress: 0, commissionUntil: 0,
    })),
    ...extra,
  };
};

test("HQ opens each plant on its own page, and the Museum card leaves More", async ({ page }) => {
  const seen = await open(page, "/rigs", through("tubes"));
  await tipsOff(page);
  await expect(page.locator("[data-hub-item]")).toHaveCount(4);
  await page.locator("[data-hub-item='servers']").click();
  await expect(page).toHaveURL(/\/facilities\/servers$/);
  await expect(page.locator("[data-facility='servers']")).toBeVisible();
  await expect(page.locator("[data-facility='mine']")).toHaveCount(0);
  await expect(page.locator("[data-facility-yield]")).toContainText("+0.005");
  await expect(page.getByText("Add a GPU")).toHaveCount(0);
  await expect(page.getByText("Irwell Mark 1")).toHaveCount(0);
  await page.getByRole("link", { name: "< BACK" }).click();
  await expect(page).toHaveURL(/\/rigs$/);
  await page.goto("/museum");
  await expect(page).toHaveURL(/\/progress#museum/);
  await expect(page.locator("[data-hw-museum]")).toBeVisible();
  await page.goto("/more#settings");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await expect(page.locator("[data-more-tabs]")).not.toContainText("MUSEUM");
  expectClean(seen);
});

test("a tape drive cannot be bought until its TECH project is done", async ({ page }) => {
  const seen = await open(page, "/facilities/servers", through("mainframes", { techDone: [] }));
  await tipsOff(page);
  await page.locator("[data-server-tab='room']").click();
  const tape = page.locator("[data-part='tape']");
  await expect(tape).toBeVisible();
  await expect(tape.locator("[data-part-lock]")).toContainText(/Research/);
  await expect(tape.locator('[data-action="buy-tape"]')).toBeDisabled();
  expectClean(seen);
});

test("How to Play locks later facility guides until their era", async ({ page }) => {
  const seen = await open(page, "/more#howto", through("tubes"));
  await tipsOff(page);
  await expect(page.locator("[data-howto='howto-starter']")).toBeVisible();
  await expect(page.locator("[data-howto='howto-museum']")).toBeVisible();
  await expect(page.locator("[data-howto='howto-bench']")).toHaveAttribute("data-howto-locked", "");
  await expect(page.locator("[data-howto='howto-bench']")).toContainText("COMING SOON");
  expectClean(seen);
});
