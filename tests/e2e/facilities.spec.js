// Facilities: the best-next-part line names a part and highlights it, and
// buying it moves the plants' pay.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff, SAVES, saved, SAVES as ALL_SAVES } from "./helpers.js";
import { RESEARCH } from "../../src/lib/research.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const MAINFRAMES = BUSINESSES.findIndex((b) => b.id === "mainframes");

// Parts open in their real year once researched: give the late save the
// eras after Quantum and every project done.
const NEW_ERAS = ["vr", "chatbots", "supercluster"].map((id) => ({ id, owned: 1, manager: false, running: false, progress: 0, activeMs: 0 }));
// Plenty of every material, since RIGS parts take some.
const PLENTY = { wood: 1e6, paper: 1e6, sand: 1e6, copper: 1e8, glass: 1e8, wafers: 1e8, silicon: 1e6, germanium: 1e6, filament: 1e6, polysilicon: 1e8, ofcopper: 1e8, hpge: 1e6 };
const allOpen = (save) => ({ ...save, biz: [...save.biz, ...NEW_ERAS], techDone: RESEARCH.map((e) => e.id), supply: PLENTY, storage: { wafers: 12, copper: 12, glass: 12, polysilicon: 12, ofcopper: 12 }, lastSeen: Date.now() });
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

// The top button beside TECH opens a hub; RESEARCH SERVERS opens the plants.
test("top HQ button opens the hub, and RESEARCH SERVERS opens the plants", async ({ page }) => {
  const seen = await open(page, "/", "late");
  await tipsOff(page);
  const top = page.locator("[data-open-facilities]");
  await expect(top).toHaveText("HQ");
  await top.click();
  await expect(page).toHaveURL(/\/rigs$/);
  const items = page.locator("[data-hub-item]");
  await expect(items).toHaveCount(4);
  await expect(items.first()).toHaveAttribute("data-hub-item", "servers");
  await items.first().click();
  await expect(page).toHaveURL(/\/facilities#servers$/);
  await expect(page.locator("[data-facility='servers']")).toBeVisible();
  // BACK returns to the hub, not the game screen.
  await page.getByRole("link", { name: "< BACK" }).click();
  await expect(page).toHaveURL(/\/rigs$/);
  expectClean(seen);
});

const far = () => Date.now() + 9e9;
const quietTutorial = { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false };
function earlySave({ throughId, cash = 50, wood = 20 } = {}) {
  const last = throughId ? BUSINESSES.findIndex((b) => b.id === throughId) : 0;
  return {
    version: 12, cash, lifetime: 10, investors: 0, lastSeen: Date.now(),
    sawPit: true, starterGranted: true, hubSeen: false,
    tutorial: quietTutorial,
    nextWindfallAt: far(), nextDilemmaAt: far(), nextBubbleAt: far(), nextShortageAt: far(),
    supply: { wood },
    facilities: { servers: {}, bench: {}, mine: {}, cluster: {} },
    biz: BUSINESSES.map((b, i) => ({
      id: b.id,
      owned: i <= last ? 1 : 0,
      manager: false, running: false, progress: 0, commissionUntil: 0,
    })),
  };
}

async function buyStarterFromGame(page, save) {
  const seen = await open(page, "/", save);
  await tipsOff(page);
  const top = page.locator("[data-open-facilities]");
  await expect(top).toHaveText("HQ");
  await expect(top).not.toHaveAttribute("data-locked", "");
  await top.click();
  await expect(page).toHaveURL(/\/rigs$/);
  const rigs = page.locator("[data-hub-item='servers']");
  await expect(rigs).not.toHaveAttribute("data-locked", "");
  await rigs.click();
  await expect(page).toHaveURL(/\/facilities(#servers)?$/);
  const room = page.locator("[data-facility='servers']");
  await expect(room).toBeVisible();
  await expect(room).not.toHaveAttribute("data-locked", "");
  await expect(page.locator("[data-tabulating-room]")).toBeVisible();
  const part = page.locator("[data-part='tab601']");
  await expect(part).toBeVisible();
  await expect(page.locator('[data-action="buy-tab601"]')).toBeEnabled();
  await page.locator('[data-action="buy-tab601"]').click();
  await expect.poll(async () => (await saved(page))?.facilities?.servers?.tab601 || 0).toBe(1);
  expectClean(seen);
}

test("a fresh save can open HQ and buy the Inland 601", async ({ page }) => {
  await buyStarterFromGame(page, earlySave({ throughId: "timber" }));
});

test("an era-9 save can open HQ and buy the Inland 601 before Mainframes", async ({ page }) => {
  expect(BUSINESSES.findIndex((b) => b.id === "radios") + 1).toBe(9);
  await buyStarterFromGame(page, earlySave({ throughId: "radios", cash: 1e6, wood: 50 }));
});

test("an early HQ lists every facility, and locked cards say what they need", async ({ page }) => {
  const seen = await open(page, "/rigs", earlySave({ throughId: "timber" }));
  await tipsOff(page);
  const items = page.locator("[data-hub-item]");
  await expect(items).toHaveCount(4);
  await expect(page.locator("[data-hub-item='servers']")).not.toHaveAttribute("data-locked", "");
  await expect(page.locator("[data-hub-item='servers']")).toContainText("RESEARCH SERVERS");
  for (const id of ["bench", "mine", "cluster"]) {
    const card = page.locator(`[data-hub-item='${id}']`);
    await expect(card).toHaveAttribute("data-locked", "");
    await expect(card).toContainText("???");
    await expect(card).toContainText("COMING SOON");
    await expect(card.locator("[data-hub-need]")).toBeVisible();
  }
  await expect(page.locator("[data-hub-item='bench'] [data-hub-need]")).toContainText("Needs Home Computers this run");
  await expect(page.locator("[data-hub-item='mine'] [data-hub-need]")).toContainText("Needs AI Accelerators this run");
  await expect(page.locator("[data-hub-item='cluster'] [data-hub-need]")).toContainText("Needs AI Accelerators this run");
  expectClean(seen);
});

// HQ stays open for good once reached, like research. After a prestige the
// plants grey out and say what they need this run.
const hqRow = (id, owned) => ({ id, owned, manager: true, running: false, progress: 0, activeMs: 0, commissionUntil: 0 });
const hqTutorial = { seen: [], done: true, skipped: false, replay: false, tips: [], tipsOff: true };
const hqSave = (owned, extra = {}) => ({
  version: 7, cash: 1e10, lifetime: 4.2e11, investors: 0, lastSeen: Date.now(), supply: {}, sawPit: true, tutorial: hqTutorial,
  nextWindfallAt: Date.now() + 9e9, nextDilemmaAt: Date.now() + 9e9, nextBubbleAt: Date.now() + 9e9,
  // An old save: no hubSeen flag.
  biz: BUSINESSES.slice(0, MAINFRAMES + 1).map((cfg, i) => hqRow(cfg.id, i < 4 ? 30 : i === MAINFRAMES ? owned : 0)),
  ...extra,
});

test("after a prestige HQ still opens and RIGS says what each plant needs", async ({ page }) => {
  const seen = await open(page, "/", hqSave(1));
  await expect(page.locator("[data-open-facilities]")).toHaveText("HQ");
  await page.click('[data-prestige="recruit"]');
  const report = page.locator("[data-prestige-report-ok]");
  if (await report.count()) await report.click();
  await page.goto("/");
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  const top = page.locator("[data-open-facilities]");
  await expect(top).toHaveText("HQ");
  await expect(top).not.toHaveAttribute("data-locked", "");
  await top.click();
  await expect(page).toHaveURL(/\/rigs$/);
  await expect(page.locator("[data-hub-item]")).toHaveCount(4);
  await expect(page.locator("[data-hub-item='servers']")).not.toHaveAttribute("data-locked", "");
  await expect(page.locator("[data-hub-item='bench']")).toHaveAttribute("data-locked", "");
  await expect(page.locator("[data-hub-item='bench'] [data-hub-need]")).toContainText("Needs Home Computers this run");
  await expect(page.locator("[data-hub-item='mine'] [data-hub-need]")).toContainText("Needs AI Accelerators this run");
  await expect(page.locator("[data-hub-item='cluster']")).toContainText("COMING SOON");
  await page.click("[data-hub-item='servers']");
  await expect(page).toHaveURL(/\/facilities#servers$/);
  await expect(page.locator("[data-facility='servers'] [data-facility-needs]")).toContainText("Needs Mainframes this run");
  await expect(page.locator("[data-facility='mine'] [data-facility-needs]")).toContainText("Needs AI Accelerators this run");
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), "pc-tycoon-save-v1");
  expect(saved.hubSeen).toBe(true);
  expectClean(seen);
});

test("an old save that once reached Mainframes gets HQ back", async ({ page }) => {
  const seen = await open(page, "/", hqSave(0, { bestEra: MAINFRAMES, prestiged: true }));
  await tipsOff(page);
  await expect(page.locator("[data-open-facilities]")).toHaveText("HQ");
  expectClean(seen);
});

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
