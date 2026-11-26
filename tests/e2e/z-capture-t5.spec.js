// T5 captures. Gated: CAPTURE_T5=<dir> writes phone-sized (360x640, full
// page) and landscape shots of the screens T5 touches. CAPTURE_ONLY=name,...
// limits it.
import { test } from "@playwright/test";
import { open, seed, tipsOff, SAVES } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { mkdirSync } from "node:fs";

const DIR = process.env.CAPTURE_T5 || "";
const capture = DIR ? test : test.skip;
const ONLY = (process.env.CAPTURE_ONLY || "").split(",").filter(Boolean);
const far = Date.now() + 9e9;
const quiet = { lastSeen: Date.now(), nextWindfallAt: far, nextDilemmaAt: far, nextBubbleAt: far, nextShortageAt: far };
const late = () => ({ ...SAVES.late, ...quiet });
const through = (n) => ({
  version: 17, cash: 1e12, lifetime: 1e12, investors: 0, sawPit: true, starterGranted: true, hubSeen: true,
  tutorial: { seen: [], tips: [], tipsOff: true, done: true, skipped: false, replay: false },
  data: 1e6, techDone: ["tab-hollerith", "srv-mark1"],
  biz: BUSINESSES.map((b, i) => ({ id: b.id, owned: i <= n ? 8 : 0, manager: i <= n, running: false, progress: 0 })),
  ...quiet,
});
// 1976: two Cray-1s on one Freon unit, the room short of cooling and power.
const cray = () => ({ ...through(BUSINESSES.findIndex((b) => b.id === "supercomputers")), facilities: { servers: { tab601: 1, s360: 2, cray1: 2, mgset: 4, roomac: 2, freon: 1, pack3330: 1 }, bench: {}, mine: {}, cluster: {} } });
const idx = (id) => BUSINESSES.findIndex((b) => b.id === id);
const at = Date.now();
const installing = () => ({ ...cray(), stages: [
  { id: "a", kind: "install", facilityId: "servers", partId: "cray1", set: "super", startedAt: at - 200e3, readyAt: at + 260e3 },
  { id: "b", kind: "install", facilityId: "servers", partId: "s360", set: "mainframe", startedAt: at - 20e3, readyAt: at + 170e3 },
] });
const building = () => ({ ...through(idx("mainframes")), roomsBuilt: [], facilities: { servers: { tab601: 1 }, bench: {}, mine: {}, cluster: {} } });
const ladder = () => ({ ...through(idx("minis")), prestiged: true, prestigeCount: 1, investors: 250, tokens: 0 });
const eraCard = () => ({ ...through(idx("minis")), eraBuild: { id: BUSINESSES[idx("minis") + 1].id, startedAt: at - 60e3, readyAt: at - 1000 } });
const opening = () => {
  const s = through(idx("minis"));
  s.biz[idx("minis")] = { ...s.biz[idx("minis")], owned: 1, manager: false, commissionUntil: Date.now() + 25e3, commissionMs: 30e3 };
  return s;
};
const raw = new Set(["era-card"]);
export const T5_SCREENS = [
  ["servers-installing", "/facilities/servers", installing],
  ["servers-building", "/facilities/servers", building],
  ["boost-upgrades", "/boost#upgrades", ladder],
  ["runs-ladder", "/progress#runs", ladder],
  ["era-card", "/", eraCard],
  ["game-opening", "/", opening],
  ["servers-late", "/facilities/servers", late],
  ["servers-1976-short", "/facilities/servers", cray],
  ["bench", "/facilities/bench", late],
  ["mine", "/facilities/mine", late],
  ["cluster", "/facilities/cluster", late],
];

for (const [label, size] of [["phone", { width: 360, height: 640 }], ["landscape", { width: 800, height: 360 }]]) {
  capture(`T5 screens ${label}`, async ({ browser }) => {
    test.setTimeout(600_000);
    mkdirSync(`${DIR}/${label}`, { recursive: true });
    for (const [name, path, save] of T5_SCREENS.filter(([n]) => !ONLY.length || ONLY.includes(n))) {
      const page = await browser.newPage();
      await page.setViewportSize(size);
      await page.emulateMedia({ reducedMotion: "reduce" });
      try {
        if (raw.has(name)) {
          await seed(page, save());
          await page.goto(path);
          await page.waitForTimeout(1500);
        } else {
          await Promise.race([open(page, path, save(), {}), new Promise((_, no) => setTimeout(() => no(new Error("slow")), 15_000))]);
          await tipsOff(page);
        }
      } catch { /* still take the shot */ }
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${DIR}/${label}/${name}.png`, fullPage: label === "phone" });
      await page.locator("[data-room-status]").first().screenshot({ path: `${DIR}/${label}/${name}-panel.png`, timeout: 5000 }).catch(() => {});
      await page.close();
    }
  });
}
