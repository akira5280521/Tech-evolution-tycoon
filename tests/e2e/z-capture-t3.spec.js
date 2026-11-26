// T3 navigation captures. Gated: CAPTURE_T3=<dir> writes a phone-sized shot
// of each main screen for a late save, for before/after review.
import { test } from "@playwright/test";
import { open, tipsOff, SAVES } from "./helpers.js";
import { mkdirSync } from "node:fs";

const DIR = process.env.CAPTURE_T3 || "";
const capture = DIR ? test : test.skip;
const ONLY = (process.env.CAPTURE_ONLY || "").split(",").filter(Boolean);
const SCREENS = [
  ["game", "/"], ["rd", "/research"], ["rd-tech", "/research#tech"], ["rd-specialty", "/research#specialty"], ["rd-lab", "/research#lab"],
  ["tech", "/tech"], ["boost", "/boost"], ["boost-prestige", "/boost#prestige"], ["board", "/board"], ["progress", "/progress"], ["runs", "/runs"],
  ["more", "/more"], ["hq", "/rigs"], ["servers", "/facilities/servers"], ["bench", "/facilities/bench"],
  ["boost-now", "/boost#now"], ["boost-bonuses", "/boost#bonuses"], ["progress-stats", "/progress#stats"], ["progress-museum", "/progress#museum"], ["bench-saved", "/facilities/bench#saved"],
];

capture("T3 screens", async ({ browser }) => {
  test.setTimeout(600_000);
  mkdirSync(DIR, { recursive: true });
  const far = Date.now() + 9e9;
  const save = { ...SAVES.late, lastSeen: Date.now(), nextWindfallAt: far, nextDilemmaAt: far, nextBubbleAt: far, nextShortageAt: far };
  for (const [name, path] of SCREENS.filter(([n]) => !ONLY.length || ONLY.includes(n))) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 412, height: 915 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    try {
      await Promise.race([open(page, path, save, {}), new Promise((_, no) => setTimeout(() => no(new Error("slow")), 15_000))]);
      await tipsOff(page);
    } catch { /* a route that doesn't exist yet still gets a shot */ }
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${DIR}/${name}.png` });
    await page.close();
  }
});
