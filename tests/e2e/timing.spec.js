// Every manual run lasts exactly the row's shown cycle, the 2nd and 3rd tap
// too, and a managed row pays one lap per cycle. Real time for the Jacquard
// Loom (the reported row); a fake clock to loop over every row.
import { test, expect } from "@playwright/test";
import { seed } from "./helpers.js";
import { SAVE_VERSION } from "../../src/lib/gameSave.js";
import { BUSINESSES, cycleLabel } from "../../src/lib/gameConfig.js";
import { effectiveCycleMs } from "../../src/lib/empire.js";
import { rowSection } from "../../src/lib/sections.js";

const MATERIALS = [...new Set(BUSINESSES.flatMap((b) => [...Object.keys(b.uses || {}), ...Object.keys(b.makes || {})]))];
function build(id, { owned = 1, manager = false, stock = 1e7, all = false, extraRows = {} } = {}) {
  const target = BUSINESSES.findIndex((b) => b.id === id);
  const far = Date.now() + 9e9;
  const supply = Object.fromEntries(MATERIALS.map((k) => [k, stock]));
  return {
    version: SAVE_VERSION, cash: 0, lifetime: 1, investors: 0, lastSeen: Date.now(), sawPit: true, restartSeen: true, starterGranted: true, hubSeen: true,
    tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
    nextWindfallAt: far, nextDilemmaAt: far, nextBubbleAt: far, nextShortageAt: far, supply, upgrades: {}, specialties: [],
    biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: all ? owned : i === target ? owned : i < target ? 1 : 0, manager: i === target && manager, running: i === target && manager, progress: 0, activeMs: 0, commissionUntil: 0, ...(extraRows[b.id] || {}) })),
  };
}
const num = (page, id, name) => page.locator(`[data-row='${id}']`).getAttribute(name).then(Number);
async function load(page, save, section) {
  await seed(page, save, { extra: { "pc-tycoon-prefs-v1": JSON.stringify({ gameSection: section }) } });
  await page.goto("/");
}

// Fake clock, held still: only the test moves the page's time (runFor /
// fastForward), so a busy machine can slow the test down but can't stretch or
// shrink a game cycle. Install before the page loads, hold once it has.
async function holdClock(page) {
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 1000);
}
// Step the held clock until check() is true. False if it never gets there.
async function stepUntil(page, check, { step = 20, max = 200 } = {}) {
  for (let k = 0; k < max; k++) {
    if (await check()) return true;
    await page.clock.runFor(step);
  }
  return check();
}
const pageNow = (page) => page.evaluate(() => Date.now());

// One tap: returns how long the run took on the game's own clock.
async function tapRun(page, id, step = (ms) => page.waitForTimeout(ms)) {
  const before = await num(page, id, "data-gain-at");
  await page.locator(`[data-tile='${id}']`).click();
  await expect.poll(() => num(page, id, "data-cycle-start")).toBeGreaterThan(0);
  const start = await num(page, id, "data-cycle-start");
  for (let k = 0; k < 2000; k++) {
    const at = await num(page, id, "data-gain-at");
    if (at > before) return at - start;
    await step(k);
  }
  return null;
}

test("Jacquard Loom: 1st, 2nd and 3rd manual runs each take the shown 2.6s, with a managed Timber Camp and its bin FULL", async ({ page }) => {
  test.setTimeout(60000);
  await load(page, build("loom", { extraRows: { timber: { owned: 30, manager: true, running: true } }, stock: 1e9 }), "tech");
  const row = page.locator("[data-row='loom']");
  await expect(row).toContainText("/ 2.6s cycle");
  expect(await num(page, "loom", "data-cycle-ms")).toBe(2600);
  for (let k = 0; k < 3; k++) {
    const took = await tapRun(page, "loom", () => page.waitForTimeout(10));
    expect(took, `run ${k + 1}`).toBeGreaterThanOrEqual(2600);
    expect(took, `run ${k + 1}`).toBeLessThan(2600 + 80);
    await expect.poll(() => num(page, "loom", "data-running")).toBe(0);
  }
});

test("a Loom short of paper still runs its full cycle and pays nothing once paper is gone", async ({ page }) => {
  test.setTimeout(60000);
  const save = build("loom");
  save.supply.paper = 1;
  await page.clock.install({ time: Date.now() });
  await load(page, save, "tech");
  await holdClock(page);
  const took = await tapRun(page, "loom", () => page.clock.runFor(20));
  expect(took).toBeGreaterThanOrEqual(2600);
  // Paper is used up: the next run takes the same time and pays $0.
  await expect(page.locator("[data-row='loom'] [data-short]")).toContainText("Out of paper");
  const gains = await num(page, "loom", "data-gain");
  // Let the short pause after a payout pass before tapping again.
  await page.clock.runFor(300);
  await page.locator("[data-tile='loom']").click();
  await expect.poll(() => num(page, "loom", "data-running")).toBe(1);
  const start = await num(page, "loom", "data-cycle-start");
  expect(start).toBeGreaterThan(0);
  // Halfway through the cycle it is still running, however busy the machine.
  await page.clock.runFor(1300);
  expect(await num(page, "loom", "data-running")).toBe(1);
  // Just short of the full cycle, still running.
  await page.clock.runFor(2600 - 1300 - 50);
  expect(await num(page, "loom", "data-running")).toBe(1);
  // Then it finishes: never before the full cycle, and pays nothing.
  expect(await stepUntil(page, async () => (await num(page, "loom", "data-running")) === 0)).toBe(true);
  expect((await pageNow(page)) - start).toBeGreaterThanOrEqual(2600);
  expect(await num(page, "loom", "data-gain")).toBe(gains);
});

test("every row (fake clock): manual runs take the shown cycle, and the label matches", async ({ page }) => {
  test.setTimeout(240000);
  await page.clock.install({ time: Date.now() });
  await load(page, build("timber", { all: true }), "tech");
  await holdClock(page);
  for (const section of ["tech", "supply"]) {
    await page.locator(`[data-section='${section}']`).click();
    for (const [i, cfg] of BUSINESSES.entries()) {
      if (rowSection(i) !== section) continue;
      const row = page.locator(`[data-row='${cfg.id}']`);
      await row.scrollIntoViewIfNeeded();
      const cycle = effectiveCycleMs(cfg, { biz: BUSINESSES.map((b) => ({ id: b.id, owned: 1 })), upgrades: {}, specialties: [] });
      await expect(row).toContainText(`/ ${cycleLabel(cycle)}s cycle`);
      // Let the short pause after the last payout pass (time is held).
      await page.clock.runFor(300);
      const before = await num(page, cfg.id, "data-gain-at");
      await page.locator(`[data-tile='${cfg.id}']`).click();
      await expect.poll(() => num(page, cfg.id, "data-cycle-start")).toBeGreaterThan(0);
      const start = await num(page, cfg.id, "data-cycle-start");
      await page.clock.fastForward(Math.max(0, cycle - 200));
      let took = null;
      await stepUntil(page, async () => {
        const at = await num(page, cfg.id, "data-gain-at");
        if (at > before) took = at - start;
        return took != null;
      });
      expect(took, cfg.id).not.toBeNull();
      // Never pays early: exact.
      expect(took, cfg.id).toBeGreaterThanOrEqual(cycle - 1);
      // Pays within one game tick (250 ms) of the cycle. Time only moves when
      // the test moves it, so this doesn't depend on how busy the machine is.
      expect(took, cfg.id).toBeLessThan(cycle + 250);
    }
  }
});
