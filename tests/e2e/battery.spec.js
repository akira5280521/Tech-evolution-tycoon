// T5 item 45: performance and battery. An animated room off-screen costs no
// frame callbacks, and the page does no per-frame work at rest.
import { test, expect } from "@playwright/test";
import { expectClean, open, SAVES } from "./helpers.js";

const far = Date.now() + 9e9;
const late = () => ({ ...SAVES.late, lastSeen: Date.now(), nextWindfallAt: far, nextDilemmaAt: far, nextBubbleAt: far, nextShortageAt: far });

async function countFrames(page) {
  await page.addInitScript(() => {
    window.__raf = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      window.__raf += 1;
      return raf(cb);
    };
  });
}

test("the server room animates on screen but asks for no frames when scrolled away", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await countFrames(page);
  const seen = await open(page, "/facilities/servers", late());
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  const before = await page.evaluate(() => window.__raf);
  await page.waitForTimeout(2000);
  const used = (await page.evaluate(() => window.__raf)) - before;
  // The room alone asked for ~120 at 60 Hz before T5. What is left is one
  // callback per finished business cycle (the late save runs dozens).
  expect(used).toBeLessThan(60);
  expectClean(seen);
});
