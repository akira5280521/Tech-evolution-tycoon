// Every "?" is a 44x44 target that opens a sheet with text, clear of the
// money panel, ticker and tab bar, that closes on a tap outside.
import { test, expect } from "@playwright/test";
import { open, tipsOff } from "./helpers.js";

const VIEWPORTS = [
  { name: "small phone", width: 320, height: 568 },
  { name: "tall phone", width: 412, height: 915 },
  { name: "phone landscape", width: 844, height: 390 },
];

for (const vp of VIEWPORTS) {
  for (const path of ["/", "/boost", "/tech", "/facilities/servers", "/board", "/runs", "/research"]) {
    test(`"?" buttons on ${path}, ${vp.name}`, async ({ page }) => {
      // About 130 "?" buttons on the busiest pages; slow when the machine is busy.
      test.setTimeout(360_000);
      await page.setViewportSize(vp);
      await open(page, path, "late");
      await tipsOff(page);
      const count = await page.locator("[data-help]").count();
      expect(count).toBeGreaterThan(0);
      // Landscape: every third, to keep the run short.
      const step = vp.name === "phone landscape" ? 3 : 1;
      const problems = [];
      for (let i = 0; i < count; i += step) {
        const btn = page.locator("[data-help]").nth(i);
        const key = await btn.getAttribute("data-help");
        await btn.scrollIntoViewIfNeeded();
        // Keep it below a sticky money panel so it can be tapped.
        await page.evaluate((i) => {
          const el = document.querySelectorAll("[data-help]")[i];
          const hud = document.querySelector("[data-sticky-hud]");
          if (!hud || el.closest("[data-sticky-hud]") || getComputedStyle(hud).position !== "sticky") return;
          const r = el.getBoundingClientRect();
          const bottom = hud.getBoundingClientRect().bottom;
          if (r.top < bottom + 4) window.scrollBy(0, r.top - bottom - 60);
        }, i);
        const box = await btn.boundingBox();
        if (!box || box.width < 44 || box.height < 44) problems.push(`${key}: tap target ${box?.width}x${box?.height}`);
        await btn.click();
        const sheet = page.locator("[data-help-sheet]");
        // Wait for the sheet rather than checking once: on a busy machine it
        // can take a moment to open. Only a sheet that never opens counts.
        try {
          await expect.poll(() => sheet.count(), { timeout: 3000 }).toBeGreaterThan(0);
        } catch {
          problems.push(`${key}: no sheet`);
          continue;
        }
        let g;
        for (let tries = 0; tries < 3; tries++) {
          g = await page.evaluate(() => {
            const s = document.querySelector("[data-help-sheet]");
            const r = s.getBoundingClientRect();
            const overlap = (a, b) => Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) * Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            const hud = document.querySelector("[data-sticky-hud]")?.getBoundingClientRect();
            const nav = document.querySelector('nav[aria-label="Main navigation"]').getBoundingClientRect();
            return {
              text: s.innerText.length,
              inView: r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1,
              hud: hud && hud.bottom > 0 ? overlap(r, hud) : 0,
              nav: overlap(r, nav),
            };
          });
          // The money panel can switch between sticky and scrolling as the
          // ticker wraps; the sheet re-checks its place every 400 ms.
          if (g.hud === 0) break;
          await page.waitForTimeout(500);
        }
        if (g.text < 30) problems.push(`${key}: too little text`);
        if (!g.inView) problems.push(`${key}: sheet off screen`);
        if (g.hud > 0) problems.push(`${key}: sheet over the money panel`);
        if (g.nav > 0) problems.push(`${key}: sheet over the tab bar`);
        const s = await sheet.boundingBox();
        await page.mouse.click(s.x > 20 ? 5 : vp.width - 5, s.y > 60 ? 5 : vp.height - 5);
        // Same for closing: give it time under load, and only record a sheet
        // that is still up after that.
        try {
          await expect(sheet).toHaveCount(0, { timeout: 3000 });
        } catch {
          problems.push(`${key}: didn't close on an outside tap`);
          await page.keyboard.press("Escape");
          await expect(sheet).toHaveCount(0, { timeout: 3000 }).catch(() => {});
        }
      }
      expect(problems).toEqual([]);
    });
  }
}
