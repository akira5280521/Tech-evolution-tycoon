// T5 item 53: ROOM STATUS under every room scene, bars against limit
// markers, red with a boxed alert when the room is short.
import { test, expect } from "@playwright/test";
import { expectClean, open, SAVES } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const far = Date.now() + 9e9;
const quiet = { lastSeen: Date.now(), nextWindfallAt: far, nextDilemmaAt: far, nextBubbleAt: far, nextShortageAt: far };
const through = (id, facilities) => ({
  version: 17, cash: 1e12, lifetime: 1e12, investors: 0, sawPit: true, starterGranted: true, hubSeen: true,
  tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
  data: 1e6, techDone: ["tab-hollerith", "srv-mark1"],
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= BUSINESSES.findIndex((x) => x.id === id) ? 8 : 0, manager: true, running: false, progress: 0 })),
  facilities: { servers: {}, bench: {}, mine: {}, cluster: {}, ...facilities },
  ...quiet,
});

test("server room status: real kW and FLOPS, red Heat and Power bars with alerts when short", async ({ page }) => {
  const seen = await open(page, "/facilities/servers", through("supercomputers", { servers: { tab601: 1, cray1: 2, mgset: 3, freon: 1, pack3330: 1 } }));
  const panel = page.locator("[data-room-status='servers']");
  await expect(panel).toBeVisible();
  await expect(panel.locator("[data-status-bar]")).toHaveCount(4);
  await expect(panel.locator("[data-status-bar='compute']")).toContainText("COMPUTE");
  await expect(panel.locator("[data-status-bar='compute'] [data-status-value]")).toContainText("/ 320 MFLOPS");
  await expect(panel.locator("[data-status-bar='heat'] [data-status-value]")).toContainText("230 kW /");
  await expect(panel.locator("[data-status-bar='heat']")).toHaveAttribute("data-bad", "");
  await expect(panel.locator("[data-status-bar='heat'] [data-status-alert]")).toContainText("Cooling short: add");
  await expect(panel.locator("[data-status-bar='power'] [data-status-alert]")).toContainText("Power short: add");
  await expect(panel.locator("[data-status-bar='storage']")).not.toHaveAttribute("data-bad", "");
  await expect(panel.locator("[data-status-mark]")).toHaveCount(4);
  await expect(panel.locator("[data-status-summary]")).toContainText("3 online");
  // The panel sits between the room scene and the machine list.
  const order = await page.evaluate(() => {
    const room = document.querySelector("[data-room-status]");
    const list = document.querySelector("[data-facility='servers']");
    return room.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING;
  });
  expect(order).toBeTruthy();
  await expect(page.locator("[data-server-stock]")).toHaveCount(0);
  await expect(page.locator("[data-machines-head]")).toHaveText("MACHINES");
  expectClean(seen);
});

test("a healthy room has no red bars; the mine and cluster show Coming soon until reached", async ({ page }) => {
  const seen = await open(page, "/facilities/servers", through("supercomputers", { servers: { cray1: 1, mgset: 2, freon: 2, pack3330: 1 } }));
  const panel = page.locator("[data-room-status='servers']");
  await expect(panel.locator("[data-status-bar]")).toHaveCount(4);
  await expect(panel.locator("[data-status-bar][data-bad]")).toHaveCount(0);
  await expect(panel.locator("[data-status-alert]")).toHaveCount(0);
  await page.goto("/facilities/mine");
  const mine = page.locator("[data-room-status='mine']");
  await expect(mine).toHaveAttribute("data-locked", "");
  await expect(mine.locator("[data-status-summary]")).toHaveText("COMING SOON");
  await expect(mine.locator("[data-status-bar]")).toHaveCount(4);
  expectClean(seen);
});

test("late game: mine, cluster and bench each have their own status bars", async ({ page }) => {
  const seen = await open(page, "/facilities/mine", { ...SAVES.late, ...quiet });
  await expect(page.locator("[data-room-status='mine'] [data-status-bar]")).toHaveText([/HASH/, /POWER/, /HEAT/, /MEMORY/]);
  await page.goto("/facilities/cluster");
  await expect(page.locator("[data-room-status='cluster'] [data-status-bar='compute']")).toBeVisible();
  await page.goto("/facilities/bench");
  await expect(page.locator("[data-room-status='bench'] [data-status-bar='heat']")).toBeVisible();
  expectClean(seen);
});

test("room status fits a 360 px phone without sideways scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  const seen = await open(page, "/facilities/servers", through("supercomputers", { servers: { cray1: 2, mgset: 3, freon: 1 } }));
  const box = await page.locator("[data-room-status='servers']").boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(360);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(wide).toBeLessThanOrEqual(360);
  expectClean(seen);
});

test("server cards show real-spec bars: speed, memory, storage, power and heat", async ({ page }) => {
  const seen = await open(page, "/facilities/servers", through("supercomputers", { servers: { s360: 1, mgset: 1, roomac: 1 } }));
  const card = page.locator("[data-part='s360']");
  await expect(card.locator("[data-spec-bar]")).toHaveCount(5);
  await expect(card.locator("[data-spec-bar='speed'] [data-spec-value]")).toHaveText("133kFLOPS");
  await expect(card.locator("[data-spec-bar='memory'] [data-spec-value]")).toHaveText("256KB");
  await expect(card.locator("[data-spec-bar='power'] [data-spec-value]")).toHaveText("6.5kW");
  await expect(card.locator("[data-spec-real]")).toContainText("IBM System/360 Model 50");
  // Room equipment has no spec bars.
  await page.locator("[data-server-tab='room']").click();
  await expect(page.locator("[data-part='mgset'] [data-spec-bars]")).toHaveCount(0);
  expectClean(seen);
});
