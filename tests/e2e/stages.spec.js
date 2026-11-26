// T5 items 61 and 62: staged bars for server installs, a new HQ room, the
// Field engineers perk, a business's first opening and an era change.
import { test, expect } from "@playwright/test";
import { expectClean, open, saved } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const far = Date.now() + 9e9;
const quiet = { lastSeen: Date.now(), nextWindfallAt: far, nextDilemmaAt: far, nextBubbleAt: far, nextShortageAt: far };
const idx = (id) => BUSINESSES.findIndex((b) => b.id === id);
const through = (id, extra = {}) => ({
  version: 17, cash: 1e15, lifetime: 1e15, investors: 0, sawPit: true, starterGranted: true, hubSeen: true,
  tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false, toursReady: true, toursDone: ["tour-servers", "tour-bench", "tour-mine", "tour-cluster"] },
  data: 1e6, techDone: ["tab-hollerith", "srv-mark1", "srv-7090", "srv-360", "store-tape"],
  supply: Object.fromEntries(["wood", "paper", "sand", "copper", "glass", "filament", "wafers", "germanium", "polysilicon"].map((k) => [k, 1e9])),
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= idx(id) ? 8 : 0, manager: i <= idx(id), running: false, progress: 0 })),
  facilities: { servers: { tab601: 1, mgset: 2, roomac: 2 }, bench: {}, mine: {}, cluster: {} },
  bestEra: idx(id),
  ...quiet,
  ...extra,
});

test("a new server shows its install stages and comes online later; the room counts it as installing", async ({ page }) => {
  const seen = await open(page, "/facilities/servers", through("minis"));
  await page.locator("[data-action='buy-s360']").click();
  const card = page.locator("[data-part='s360']");
  await expect(card.locator("[data-installing]")).toHaveAttribute("data-installing", "1");
  await expect(card.locator("[data-stage-bar='install'] [data-stage-label]")).toHaveText("Truck delivering the cabinets…");
  await expect(card.locator("[data-stage-bar='install']")).toContainText("COMING ONLINE: 1 of 1");
  await expect(page.locator("[data-room-status='servers'] [data-status-summary]")).toContainText("1 installing");
  await expect.poll(async () => (await saved(page))?.stages?.length ?? 0).toBe(1);
  const job = (await saved(page)).stages[0];
  expect(job.partId).toBe("s360");
  expect(job.readyAt - job.startedAt).toBeGreaterThan(60e3);
  expectClean(seen);
});

test("an install finished while away is online on load", async ({ page }) => {
  const now = Date.now();
  const seen = await open(page, "/facilities/servers", through("minis", {
    facilities: { servers: { tab601: 1, s360: 1, mgset: 2, roomac: 2 }, bench: {}, mine: {}, cluster: {} },
    stages: [{ id: "x", kind: "install", facilityId: "servers", partId: "s360", set: "mainframe", startedAt: now - 600e3, readyAt: now - 1000 }],
  }));
  await expect(page.locator("[data-part='s360'] [data-installing]")).toHaveCount(0);
  await expect(page.locator("[data-room-status='servers'] [data-status-summary]")).not.toContainText("installing");
  expectClean(seen);
});

test("a new HQ room is built first: a construction bar, and parts wait", async ({ page }) => {
  const seen = await open(page, "/facilities/servers", through("mainframes", { roomsBuilt: [] }));
  const building = page.locator("[data-room-building] [data-stage-bar='room']");
  await expect(building).toBeVisible();
  await expect(building).toContainText("BUILDING THE RESEARCH SERVERS");
  await expect(building.locator("[data-stage-label]")).toHaveText("Clearing the floor…");
  await expect(page.locator("[data-action='buy-mark1']")).toContainText("UNDER CONSTRUCTION");
  await expect(page.locator("[data-action='buy-mark1']")).toBeDisabled();
  expectClean(seen);
});

test("FIELD ENGINEERS in BOOST > UPGRADES: R&D points, halves installs, greyed before Mainframes", async ({ page }) => {
  const seen = await open(page, "/boost#upgrades", through("minis"));
  const perk = page.locator("[data-field-engineers]");
  await expect(perk).toHaveAttribute("data-field-engineers", "open");
  await page.locator("[data-action='buy-field-engineers']").click();
  await expect(perk).toHaveAttribute("data-field-engineers", "hired");
  await expect.poll(async () => (await saved(page))?.lab?.fieldEngineers ?? false).toBe(true);
  await page.goto("/boost#upgrades");
  await expect(perk).toHaveAttribute("data-field-engineers", "hired");
  expectClean(seen);
});

test("FIELD ENGINEERS is greyed out before Mainframes", async ({ page }) => {
  const seen = await open(page, "/boost#upgrades", through("paper", { bestEra: 1 }));
  await expect(page.locator("[data-field-engineers]")).toHaveAttribute("data-field-engineers", "locked");
  await expect(page.locator("[data-action='buy-field-engineers']")).toBeDisabled();
  expectClean(seen);
});
