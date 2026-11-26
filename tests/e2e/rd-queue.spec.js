// T3 R&D restructure: TECH inside R&D (18, 6, 19), distinct SPECIALTY and LAB
// tabs (4, 22), Home PC vs server room (57, 52, 60), and the queue (23, 24).
import { test, expect } from "@playwright/test";
import { expectClean, open } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { ERA_YEAR } from "../../src/lib/eraYear.js";

const far = () => Date.now() + 9e9;
const throughYear = (year) => {
  let last = 0;
  BUSINESSES.forEach((b, i) => { if ((ERA_YEAR[b.id] ?? 0) <= year) last = i; });
  return last;
};
const rdSave = (year, extra = {}, version = 17) => ({
  version,
  cash: 1e12, lifetime: 1e12, investors: 0, lastSeen: Date.now(), sawPit: true, starterGranted: true, hubSeen: true,
  tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
  nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
  facilities: { servers: { tab601: 1 }, bench: {}, mine: {}, cluster: {} },
  data: 1e6,
  techDone: ["tab-hollerith", "srv-mark1"],
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= throughYear(year) ? 8 : 0, manager: i <= throughYear(year), running: false, progress: 0 })),
  ...extra,
});

test("TECH lives in R&D: no TECH button on GAME or sub-menus, /tech lands on the TECH tab, HQ has an R&D card", async ({ page }) => {
  const seen = await open(page, "/", rdSave(1977));
  await expect(page.locator("[data-open-research]")).toHaveCount(0);
  await expect(page.locator("[data-open-facilities]")).toHaveCount(1);
  await page.goto("/boost");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await expect(page.locator("[data-open-research], [data-open-facilities]")).toHaveCount(0);
  await page.goto("/tech");
  await expect(page).toHaveURL(/\/research#tech$/);
  await expect(page.locator("[data-tech-list]")).toBeVisible();
  await page.goto("/rigs");
  await page.locator("[data-hub-rd]").click();
  await expect(page).toHaveURL(/\/research$/);
  await expect(page.locator("[data-rd-queue]")).toBeVisible();
  await page.goto("/facilities/servers");
  await page.locator("[data-servers-rd]").click();
  await expect(page).toHaveURL(/\/research$/);
  expectClean(seen);
});

test("TECH splits Home PC from the server room, labels where each card is used, and tiers the servers", async ({ page }) => {
  const seen = await open(page, "/research#tech", rdSave(1977));
  await page.locator("[data-tech-section='home']").click();
  await page.locator("[data-research-tab='cpu']").click();
  await expect(page.locator("[data-research-item='cpu-8080'] [data-research-where]")).toHaveText("USED IN: BENCH");
  await expect(page.locator("[data-research-tab='servers']")).toHaveCount(0);
  await page.locator("[data-tech-section='room']").click();
  await expect(page.locator("[data-research-tab='servers']")).toBeVisible();
  await page.locator("[data-research-tab='servers']").click();
  await expect(page.locator("[data-server-tier]")).toHaveCount(3);
  await expect(page.locator("[data-server-tier='super']")).toContainText("Maynard 11/20");
  await expect(page.locator("[data-research-item='srv-7090'] [data-research-where]")).toHaveText("USED IN: SERVER ROOM");
  expectClean(seen);
});

test("the queue: locked slots say how to earn them, a slot from LAB PROJECTS, then ADD TO QUEUE and remove", async ({ page }) => {
  const seen = await open(page, "/research", rdSave(1977, { techJob: { id: "srv-7090", progressMs: 0 } }));
  await expect(page.locator("[data-rd-now='srv-7090']")).toBeVisible();
  await expect(page.locator("[data-queue-locked]")).toHaveCount(4);
  await expect(page.locator("[data-queue-slot='1'] [data-queue-hint]")).toContainText("LAB NOTEBOOK in LAB PROJECTS");
  await page.locator("[data-sub-tab='lab']").click();
  await page.locator("[data-action='lab-queue-notebook']").click();
  await expect(page.locator("[data-queue-project='notebook']")).toContainText("OPEN");
  await page.locator("[data-sub-tab='tech']").click();
  await page.locator("[data-tech-section='room']").click();
  await page.locator("[data-research-tab='servers']").click();
  // The 360 needs the 7090, which is running: it may wait behind it.
  await page.locator("[data-action='queue-srv-360']").click();
  await expect(page.locator("[data-research-item='srv-360'] [data-research-queued]")).toBeVisible();
  await page.locator("[data-sub-tab='queue']").click();
  await expect(page.locator("[data-queued='srv-360']")).toBeVisible();
  await expect(page.locator("[data-queued='srv-360'] [data-progress-bar='queued']")).toBeVisible();
  await expect(page.locator("[data-queue-locked]")).toHaveCount(3);
  await page.locator("[data-unqueue='srv-360']").click();
  await expect(page.locator("[data-queued]")).toHaveCount(0);
  await expect(page.locator("[data-queue-empty]")).toHaveCount(1);
  expectClean(seen);
});

test("an old save (format 16) loads with an empty queue and no slots", async ({ page }) => {
  const seen = await open(page, "/research", rdSave(1977, { techQueue: ["srv-360"], lab: { queueSlots: 3 } }, 16));
  await expect(page.locator("[data-queued]")).toHaveCount(0);
  await expect(page.locator("[data-queue-locked]")).toHaveCount(4);
  expectClean(seen);
});

test("Research Servers: machines and room equipment tabs, Home PC points to the bench, and Power limited jumps to the room tab", async ({ page }) => {
  const seen = await open(page, "/facilities/servers", rdSave(1977, { facilities: { servers: { mark1: 1 }, bench: {}, mine: {}, cluster: {} } }));
  await expect(page.locator("[data-server-tab]")).toHaveText(["SERVER MACHINES", "ROOM EQUIPMENT", "HOME PC PARTS"]);
  await expect(page.locator("[data-part='mark1']")).toBeVisible();
  await expect(page.locator("[data-part='mgset']")).toHaveCount(0);
  const shortcut = page.locator("[data-limit-shortcut]");
  await expect(shortcut).toContainText("POWER LIMITED");
  await shortcut.click();
  await expect(page.locator("[data-server-tab='room']")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("[data-part='mgset']")).toBeVisible();
  await expect(page.locator("[data-part='mark1']")).toHaveCount(0);
  await page.locator("[data-server-tab='home']").click();
  await expect(page.locator("[data-server-home]")).toContainText("PC Build Bench");
  expectClean(seen);
});
