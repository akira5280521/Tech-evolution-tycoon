// T4 polish captures. Gated: CAPTURE_T4=<dir> writes phone-sized shots of the
// screens T4 touches, for before/after review. CAPTURE_ONLY=name,... limits it.
import { test } from "@playwright/test";
import { open, tipsOff, SAVES } from "./helpers.js";
import { mkdirSync } from "node:fs";

const DIR = process.env.CAPTURE_T4 || "";
const capture = DIR ? test : test.skip;
const ONLY = (process.env.CAPTURE_ONLY || "").split(",").filter(Boolean);
const far = Date.now() + 9e9;
const late = () => ({ ...SAVES.late, lastSeen: Date.now(), nextWindfallAt: far, nextDilemmaAt: far, nextBubbleAt: far, nextShortageAt: far });
const mid = () => ({ ...SAVES.mid, lastSeen: Date.now(), nextWindfallAt: far, nextDilemmaAt: far, nextBubbleAt: far, nextShortageAt: far });
const SCREENS = [
  ["game", "/", late], ["game-mid", "/", mid], ["hq", "/rigs", late], ["museum", "/progress#museum", mid],
  ["settings", "/more#settings", late], ["boost", "/boost", late], ["servers", "/facilities/servers", late], ["rd-lab", "/research#lab", late],
  ["welcome", "/", () => ({ ...mid(), lastSeen: Date.now() - 9 * 3600e3, supply: Object.fromEntries(["wood", "paper", "sand", "copper", "glass", "filament"].map((k) => [k, 1e15])) })],
];

capture("T4 screens", async ({ browser }) => {
  test.setTimeout(600_000);
  mkdirSync(DIR, { recursive: true });
  for (const [name, path, save] of SCREENS.filter(([n]) => !ONLY.length || ONLY.includes(n))) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 412, height: 915 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    try {
      await Promise.race([open(page, path, save(), {}), new Promise((_, no) => setTimeout(() => no(new Error("slow")), 15_000))]);
      if (name !== "welcome") await tipsOff(page);
    } catch { /* still take the shot */ }
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/${name}.png` });
    await page.close();
  }
});
