// Sub-tab labels must sit inside their tab with padding, at the phone,
// mid-size and landscape widths Andrew checks (item: SPECIALTY was clipping
// on the R&D row). The ready-dot on a corner is ignored; we measure the
// label glyphs against the button box.
import { test, expect } from "@playwright/test";
import { expectClean, open, tipsOff } from "./helpers.js";

const VIEWS = [
  { name: "360", width: 360, height: 640 },
  { name: "412", width: 412, height: 915 },
  { name: "landscape", width: 800, height: 360 },
];

const ROWS = [
  ["/research", "[data-sub-tabs='rd']"],
  ["/boost", "[data-sub-tabs='boost']"],
  ["/progress", "[data-sub-tabs='progress']"],
  ["/more", "[data-sub-tabs='more']"],
  ["/facilities/servers", "[data-server-tabs]"],
  ["/facilities/bench", "[data-sub-tabs='bench']"],
];

// At least 4px of space past the 2px border, i.e. 6px from the outer edge.
const MIN_PAD = 6;

async function tabBox(tab) {
  return tab.evaluate((el) => {
    const label = el.querySelector("[data-tab-label]") || el;
    const range = document.createRange();
    range.selectNodeContents(label);
    const tr = range.getBoundingClientRect();
    const br = el.getBoundingClientRect();
    return {
      text: (label.innerText || "").replace(/\s+/g, " ").trim(),
      padL: tr.left - br.left,
      padR: br.right - tr.right,
      padT: tr.top - br.top,
      padB: br.bottom - tr.bottom,
      overflowX: label.scrollWidth > label.clientWidth + 1,
      overflowY: label.scrollHeight > label.clientHeight + 1,
    };
  });
}

for (const view of VIEWS) {
  test(`sub-tab labels fit inside their tabs at ${view.name}`, async ({ page }) => {
    await page.setViewportSize({ width: view.width, height: view.height });
    const seen = await open(page, "/research", "late");
    await tipsOff(page);
    await page.evaluate(() => document.fonts && document.fonts.ready);
    const failures = [];
    for (const [path, sel] of ROWS) {
      await page.goto(path);
      await page.locator("nav[aria-label='Main navigation']").waitFor();
      await page.evaluate(() => document.fonts && document.fonts.ready);
      const row = page.locator(sel);
      await expect(row).toBeVisible();
      const tabs = row.locator("button[role='tab']");
      const n = await tabs.count();
      expect(n, `${path} ${sel}`).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        const m = await tabBox(tabs.nth(i));
        if (m.overflowX || m.overflowY || m.padL < MIN_PAD || m.padR < MIN_PAD || m.padT < MIN_PAD || m.padB < MIN_PAD) {
          failures.push(`${view.name} ${path} “${m.text}” pad L${m.padL.toFixed(1)} R${m.padR.toFixed(1)} T${m.padT.toFixed(1)} B${m.padB.toFixed(1)} overflow=${m.overflowX}/${m.overflowY}`);
        }
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
    expectClean(seen);
  });
}
