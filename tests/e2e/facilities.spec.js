// Facilities: the best-next-part line names a part and highlights it, and
// buying it moves the plants' pay.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff, SAVES as ALL_SAVES } from "./helpers.js";
import { RESEARCH } from "../../src/lib/research.js";

// Parts open in their real year once researched: give the late save the
// eras after Quantum and every project done.
const NEW_ERAS = ["vr", "chatbots", "supercluster"].map((id) => ({ id, owned: 1, manager: false, running: false, progress: 0, activeMs: 0 }));
const allOpen = (save) => ({ ...save, biz: [...save.biz, ...NEW_ERAS], techDone: RESEARCH.map((e) => e.id), lastSeen: Date.now() });
const LATE = allOpen(ALL_SAVES.late);

test("best next part is shown, highlighted, and pays", async ({ page }) => {
  const seen = await open(page, "/facilities", LATE);
  await tipsOff(page);
  const line = page.locator("[data-next-part]");
  await expect(line).toContainText(/Best next part: .+ for the (mine|cluster)/);
  const best = page.locator("[data-best-part]");
  await expect(best).toHaveCount(1);
  const pay = async () => page.locator("[data-facility-yield]").allInnerTexts();
  const before = await pay();
  // Follow the suggestion a few times.
  for (let i = 0; i < 6; i++) {
    const card = page.locator("[data-best-part]");
    if (!(await card.count())) break;
    await card.locator("button").last().click();
    await page.waitForTimeout(250);
  }
  await expect.poll(pay).not.toEqual(before);
  expectClean(seen);
});

import { SAVES, saved } from "./helpers.js";

test("every open part shows what it would add", async ({ page }) => {
  await open(page, "/facilities", LATE);
  await tipsOff(page);
  const values = await page.locator("[data-part-value]").allInnerTexts();
  expect(values.length).toBeGreaterThan(10);
  expect(values.some((t) => /^\+/.test(t)), "at least one part adds something").toBe(true);
  for (const t of values) expect(t).not.toMatch(/NaN|undefined|Infinity/);
});

test("REBUILD buys last run's plants back after a prestige", async ({ page }) => {
  const late = LATE;
  const lastPlants = { mine: { raster3060: 2, psu750: 1, fans: 2, ddr4_16: 1 }, cluster: { raster3060: 2, psu750: 1, fans: 2, ddr4_32: 1 }, servers: { mark1: 1, mgset: 1, roomac: 1, tape: 1 } };
  await open(page, "/facilities", { ...late, facilities: { mine: {}, cluster: {}, servers: {} }, lastPlants, cash: 1e15, lastSeen: Date.now() });
  await tipsOff(page);
  await expect(page.locator("[data-rebuild]")).toContainText("12 parts to go");
  await page.click('[data-action="rebuild"]');
  await expect(page.locator("[data-rebuild]")).toHaveCount(0);
  await expect.poll(async () => (await saved(page))?.facilities?.cluster?.raster3060).toBe(2);
});

test("64 GB sticks an old save held in the mine are refunded", async ({ page }) => {
  const late = LATE;
  await open(page, "/", { ...late, cash: 1000, facilities: { mine: { ddr5_64: 1 }, cluster: {}, servers: {} }, lastSeen: Date.now() });
  await expect.poll(async () => (await saved(page))?.cash).toBeGreaterThan(1e9);
  expect((await saved(page)).facilities.mine.ddr5_64 || 0).toBe(0);
});

test("the cluster's memory board shows its slots and swaps to DDR5", async ({ page }) => {
  const late = LATE;
  const cluster = { raster3060: 2, psu750: 2, fans: 2, ddr4_32: 3 };
  await open(page, "/facilities", { ...late, cash: 1e15, facilities: { mine: {}, cluster, servers: {} }, lastSeen: Date.now() });
  await tipsOff(page);
  const board = page.locator('[data-facility="cluster"] [data-board]');
  await expect(board).toContainText("3 of 32 slots used on the DDR4 server board");
  const ddr5 = page.locator('[data-facility="cluster"] [data-part="ddr5_64"]');
  await expect(ddr5.locator("[data-part-value]")).toContainText("switches to a DDR5 board");
  await ddr5.locator('[data-action="buy-ddr5_64"]').click();
  await expect(board).toContainText("1 of 32 slots used on the DDR5 server board");
  await expect(page.locator('[data-facility="cluster"] [data-action="buy-ddr4_32"]')).toBeDisabled();
  await expect(page.locator('[data-facility="cluster"] [data-part="ddr4_32"] [data-part-value]')).toContainText("This board takes DDR5 now.");
});

test("a part not yet researched is locked and says where to research it", async ({ page }) => {
  // Quantum (2019) reached, nothing researched: the 1080 is locked behind its research.
  await open(page, "/facilities", { ...ALL_SAVES.late, techDone: [], lastSeen: Date.now() });
  await tipsOff(page);
  const row = page.locator('[data-facility="mine"] [data-part="raster1080"]');
  await expect(row.locator("[data-part-lock]")).toContainText("Research Raster 1080 on the Tech page");
  await expect(row.locator('[data-action="buy-raster1080"]')).toBeDisabled();
  // A 2022 card is locked by its year.
  await expect(page.locator('[data-facility="mine"] [data-part="raster4090"] [data-part-lock]')).toContainText("Requires 2022");
});

test("the Tech page shows which part a project opens", async ({ page }) => {
  await open(page, "/tech", { ...ALL_SAVES.late, techDone: [], lastSeen: Date.now() });
  await tipsOff(page);
  await page.click('[data-research-tab="servers"]');
  await expect(page.locator('[data-research-item="srv-7090"] [data-research-opens]')).toContainText("Inland 7090");
});

test("the PC bench: a board, then a CPU for its socket and memory for its slots", async ({ page }) => {
  await open(page, "/facilities", { ...LATE, cash: 1e40, facilities: { mine: {}, cluster: {}, servers: {}, bench: {} } });
  await tipsOff(page);
  const bench = page.locator('[data-facility="bench"]');
  // Newest first; older parts on request.
  await expect(bench.locator('[data-part="c-p2"]')).toHaveCount(0);
  await bench.locator('[data-action="bench-show-all"]').click();
  await expect(bench.locator('[data-part="c-p2"] [data-part-value]')).toContainText("Needs a board with a Slot 1 socket");
  await bench.locator('[data-bench-tab="board"]').click();
  await bench.locator('[data-action="buy-b-440bx"]').click();
  await bench.locator('[data-bench-tab="cpu"]').click();
  await bench.locator('[data-action="buy-c-p2"]').click();
  await bench.locator('[data-bench-tab="stick"]').click();
  await bench.locator('[data-action="buy-m-pc66"]').click();
  await expect(bench.locator("[data-bench-build]")).toContainText("Chipwright 440BX board · CPU: Chipwright P-II 300 · Memory: 32 MB of the 32 MB it wants, 1 of 4 slots used");
  await expect(bench.locator('[data-part="m-ddr4a"] [data-part-value]')).toContainText("SDRAM DIMM");
});

test("the bench names its bottleneck and checks plugs", async ({ page }) => {
  const bench = { "b-z77": 1, "c-3770k": 1, "m-ddr3b": 2, "p-atx3": 1, "v-4090": 1, "k-mesh": 1, "h-d14": 1 };
  await open(page, "/facilities", { ...LATE, cash: 1e40, facilities: { mine: {}, cluster: {}, servers: {}, bench } });
  await tipsOff(page);
  const b = page.locator('[data-facility="bench"]');
  await expect(b.locator("[data-facility-limit]")).toContainText("Bottleneck: CPU");
  await expect(b.locator("[data-bench-build]")).toContainText("Graphics: Raster 4090");
  await b.locator('[data-bench-tab="psu"]').click();
  await b.locator('[data-action="bench-show-all"]').click();
  await expect(b.locator('[data-part="p-atx250"] [data-part-value]')).toContainText("24-pin");
});
