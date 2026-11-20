// Large and XL text: nothing spills off the screen or out of its button.
import { test, expect } from "@playwright/test";
import { ROUTES, open, tipsOff } from "./helpers.js";

const PREFS = "pc-tycoon-prefs-v1";

for (const size of ["large", "xl"]) {
  for (const vp of [{ name: "small phone", width: 320, height: 568 }, { name: "tall phone", width: 412, height: 915 }]) {
    test(`${size} text on a ${vp.name}: no overflow on any page`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize(vp);
      await open(page, "/", "late", { extra: { [PREFS]: JSON.stringify({ textSize: size }) } });
      await expect(page.locator("html")).toHaveAttribute("data-text", size);
      await tipsOff(page);
      const problems = [];
      for (const path of ROUTES) {
        await page.goto(path);
        await page.locator("nav[aria-label='Main navigation']").waitFor();
        await page.waitForTimeout(500);
        const found = await page.evaluate(() => {
          const out = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`page is ${document.documentElement.scrollWidth}px wide`);
          for (const el of document.querySelectorAll("button, a, h1, h2, h3, [data-help-sheet] p")) {
            if (el.closest("[aria-hidden='true'], [data-ticker], .marquee")) continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            const style = getComputedStyle(el);
            if (style.visibility === "hidden" || style.display === "none") continue;
            const clipped = el.scrollWidth > el.clientWidth + 2 && style.overflowX !== "visible";
            const off = r.right > innerWidth + 1 || r.left < -1;
            if (clipped || off) out.push(`${el.tagName.toLowerCase()} "${(el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 30)}"${off ? " off screen" : " text cut off"}`);
          }
          return out;
        });
        for (const f of found) problems.push(`${path}: ${f}`);
      }
      expect([...new Set(problems)]).toEqual([]);
    });
  }
}
