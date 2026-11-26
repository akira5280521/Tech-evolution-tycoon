import { test, expect } from "@playwright/test";
import { open } from "./helpers.js";

// T4 item 40: every control on the main screens is at least 48px tall at
// 360x640. Small-looking controls carry .hit48 (an invisible 48x48 touch
// area). The bottom bar keeps its two-row layout as Andrew asked.
for (const [path, preset] of [["/", "mid"], ["/more#settings", "mid"], ["/progress#museum", "late"], ["/boost", "mid"]]) {
  test(`tap targets are 48px on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await open(page, path, preset);
    const small = await page.evaluate(() =>
      [...document.querySelectorAll("button, a, [role='button']")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return false;
          if (el.classList.contains("hit48") || el.closest("[data-tab], nav[aria-label='Game navigation'], [data-news-ticker]")) return false;
          return r.height < 47.5;
        })
        .map((el) => `${el.outerHTML.slice(0, 120)} ${Math.round(el.getBoundingClientRect().height)}px`),
    );
    expect(small).toEqual([]);
  });
}
