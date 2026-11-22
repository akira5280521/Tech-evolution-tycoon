// The hardware parts tree lives on TECH, not the R&D tab. It used to hide
// behind a 1956-gated "???" button; it is reachable from the first era, and
// projects still wait for their year.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { SAVE_VERSION } from "../../src/lib/gameSave.js";
import { TECH_OPENS } from "../../src/lib/research.js";

const far = () => Date.now() + 9e9;
const earlySave = (throughId = "glass") => {
  const last = BUSINESSES.findIndex((b) => b.id === throughId);
  return {
    version: SAVE_VERSION,
    cash: 5.24e6,
    lifetime: 1e7,
    data: 124.1,
    investors: 0,
    lastSeen: Date.now(),
    sawPit: true,
    starterGranted: true,
    hubSeen: true,
    tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
    nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
    supply: { wood: 100, paper: 100, sand: 100, copper: 100, glass: 50, filament: 20 },
    facilities: { servers: { tab601: 1 }, bench: {}, mine: {}, cluster: {} },
    biz: BUSINESSES.map((b, i) => ({
      id: b.id,
      owned: i <= last ? 8 : 0,
      manager: i <= last,
      running: false,
      progress: 0,
      commissionUntil: 0,
    })),
  };
};

test("an early save opens TECH from the top bar and shows year-locked hardware", async ({ page }) => {
  const seen = await open(page, "/", earlySave("glass"));
  await tipsOff(page);
  const tech = page.locator("[data-open-research]");
  await expect(tech).toHaveText("TECH");
  await expect(tech).not.toHaveAttribute("data-locked", "");
  await tech.click();
  await expect(page).toHaveURL(/\/tech/);
  await expect(page.locator("[data-research-tab='cpu']")).toBeVisible();
  await expect(page.locator("[data-research-tab='gpu']")).toBeVisible();
  await expect(page.locator("[data-research-tab='memory']")).toBeVisible();
  await expect(page.locator("[data-research-tab='storage']")).toBeVisible();
  await expect(page.locator("[data-tech-opens-year]")).toContainText(String(TECH_OPENS));
  await expect(page.locator("[data-research-item] [data-research-lock]").first()).toContainText("Requires");
  await page.locator("[data-research-tab='storage']").click();
  await expect(page.locator("[data-research-item='store-hdd'] [data-research-lock]")).toContainText(`Requires ${TECH_OPENS}`);
  expectClean(seen);
});
