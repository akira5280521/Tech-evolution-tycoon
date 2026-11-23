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
      for (const path of [...ROUTES, "/more#settings", "/more#stats", "/more#howto", "/more#badges", "/more#museum"]) {
        await page.goto(path);
        await page.locator("nav[aria-label='Main navigation']").waitFor();
        await page.waitForTimeout(500);
        const found = await page.evaluate(() => {
          const out = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`page is ${document.documentElement.scrollWidth}px wide`);
          for (const el of document.querySelectorAll("button, a, h1, h2, h3, [data-help-sheet] p")) {
            if (el.closest("[aria-hidden='true'], [data-ticker], .marquee, .museum-chip-row")) continue;
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

// Big text on a small phone: a tip's buttons and a "?" sheet's OK button stay
// on screen, with the words scrolling above them if they must.
const inView = (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return "missing";
    const r = el.getBoundingClientRect();
    const box = el.closest(".hint-sheet").getBoundingClientRect();
    const ok = r.top >= box.top - 1 && r.bottom <= box.bottom + 1 && r.top >= 0 && r.bottom <= innerHeight;
    return ok ? "ok" : `button at ${Math.round(r.top)}-${Math.round(r.bottom)}, card ${Math.round(box.top)}-${Math.round(box.bottom)}`;
  }, selector);

test("xl text on a small phone: tip and help buttons stay reachable", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 320, height: 568 });
  const problems = [];
  await open(page, "/tech", "late", { extra: { [PREFS]: JSON.stringify({ textSize: "xl" }) } });
  for (const path of ["/tech", "/rigs", "/facilities/servers", "/boost", "/board", "/runs", "/research", "/"]) {
    await page.goto(path);
    await page.waitForTimeout(600);
    if (await page.locator("[data-tip]").count()) {
      for (const sel of ["[data-tip-ok]", "[data-tips-off]"]) {
        const where = await inView(page, sel);
        if (where !== "ok") problems.push(`${path} tip ${sel}: ${where}`);
      }
    }
  }
  await page.click("[data-tips-off]").catch(() => {});
  await page.goto("/");
  await page.waitForTimeout(500);
  for (const key of ["materials", "money", "era:cpu"]) {
    const btn = page.locator(`[data-help="${key}"]`).first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    const where = await inView(page, "[data-help-close]");
    if (where !== "ok") problems.push(`? ${key}: ${where}`);
    await page.click("[data-help-close]");
  }
  expect(problems).toEqual([]);
});
