// The Hardware Museum: decade chips, rooms, filters, an exhibit sheet, and
// locked pieces as silhouettes of their real icons. View-only.
import { test, expect } from "@playwright/test";
import { expectClean, open, saved, tipsOff } from "./helpers.js";

test("the museum shows rooms of hardware, filters them, and opens an exhibit", async ({ page }) => {
  const seen = await open(page, "/more#museum", "late");
  await expect(page.locator("[data-hw-museum]")).toBeVisible();
  await expect.poll(async () => !!(await saved(page))?.facilities?.bench).toBe(true);
  const before = JSON.stringify((await saved(page)).facilities);
  await expect(page.locator("[data-museum-decades]")).toBeVisible();
  await page.click("[data-room='cases']");
  const tiles = page.locator("[data-museum-grid] [data-exhibit]");
  expect(await tiles.count()).toBeGreaterThan(30);
  // The oldest case is open in a late save; the decade chip narrows the grid.
  await page.click("[data-decade='1980']");
  expect(await tiles.count()).toBeLessThan(5);
  await tiles.first().click();
  await expect(page.locator("[data-exhibit-sheet]")).toBeVisible();
  await page.click("[data-exhibit-close]");
  await expect(page.locator("[data-exhibit-sheet]")).toHaveCount(0);
  // Peripherals and history cards.
  await page.click("[data-decade='all']");
  await page.click("[data-wing='peripherals']");
  await page.click("[data-room='mice']");
  expect(await tiles.count()).toBe(10);
  await page.click("[data-wing='history']");
  await expect(page.locator("[data-museum]")).toBeVisible();
  // Looking changes nothing in the empire save (prefs may record viewed exhibits).
  expect(JSON.stringify((await saved(page))?.facilities || {})).toBe(before);
  expectClean(seen);
});

test("a new game sees locked pieces as silhouettes with only their decade", async ({ page }) => {
  await open(page, "/more#museum", "fresh");
  const locked = page.locator("[data-exhibit][data-status='locked']");
  expect(await locked.count()).toBeGreaterThan(0);
  const sil = locked.first().locator("img.museum-sil");
  await expect(sil).toBeVisible();
  const filter = await sil.evaluate((el) => getComputedStyle(el).filter);
  expect(filter).toMatch(/brightness\(0\)/i);
  await locked.first().click();
  await expect(page.locator("[data-exhibit-sheet]")).toContainText("???");
});

test("today in history opens its exhibit", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 7, 12, 12));
  await open(page, "/more#museum", "late");
  await tipsOff(page);
  await page.click("[data-wing='history']");
  const card = page.locator("[data-today]");
  await expect(card).toContainText("TODAY IN HISTORY");
  await card.locator("[data-today-item='b-5150']").click();
  await expect(page.locator("[data-exhibit-sheet='b-5150']")).toBeVisible();
  await page.click("[data-exhibit-close]");
});

test("decade chips, room renames, and the 1940s gap", async ({ page }) => {
  await open(page, "/more#museum", "late");
  await expect(page.locator("[data-wing='computers']")).toContainText("COMP.");
  await expect(page.locator("[data-wing='parts']")).toContainText("PARTS");
  await expect(page.locator("[data-wing='peripherals']")).toContainText("PERIPH.");
  await expect(page.locator("[data-room='boards']")).toContainText("MOTHERBOARDS");
  await expect(page.locator("[data-room='power']")).toContainText("POWER SUPPLIES");
  await expect(page.locator("[data-room='cards']")).toContainText("EXPANSION CARDS");
  await expect(page.locator("[data-room='drives']")).toContainText("DRIVES");
  await expect(page.locator("[data-room='media']")).toContainText("STORAGE MEDIA");
  const gap = page.locator("[data-decade='1940']");
  await expect(gap).toHaveAttribute("data-decade-empty", "1");
  await expect(gap).toContainText("COMING SOON");
  await gap.click();
  await expect(page.locator("[data-room='boards']")).toHaveAttribute("data-room-empty", "1");
  await page.click("[data-decade='1990']");
  await page.click("[data-room='boards']");
  const tiles = page.locator("[data-museum-grid] [data-exhibit]");
  expect(await tiles.count()).toBeGreaterThan(0);
  const years = await tiles.locator("span").allTextContents();
  expect(years.every((y) => y === "1990s" || (Number(y) >= 1990 && Number(y) <= 1999))).toBe(true);
});

test("chip labels do not clip at 360px or 412px", async ({ page }) => {
  for (const width of [360, 412]) {
    await page.setViewportSize({ width, height: 800 });
    await open(page, "/more#museum", "late");
    for (const sel of ["[data-museum-wings] button", "[data-museum-rooms] button", "[data-museum-decades] button"]) {
      const loc = page.locator(sel);
      const n = await loc.count();
      expect(n, `${width} ${sel}`).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        // The New gold square hangs off the corner on purpose; hide it so we
        // only fail when the label itself is clipped.
        const box = await loc.nth(i).evaluate((el) => {
          const dots = [...el.querySelectorAll("[data-new-dot]")];
          dots.forEach((d) => { d.style.display = "none"; });
          const sw = el.scrollWidth, cw = el.clientWidth, text = el.innerText.replace(/\s+/g, " ");
          dots.forEach((d) => { d.style.display = ""; });
          return { sw, cw, text };
        });
        expect(box.sw, `${width}px ${sel} "${box.text}"`).toBeLessThanOrEqual(box.cw + 1);
      }
    }
  }
});

test("pieces you don't own are dark silhouettes; owned ones are in full color", async ({ page }) => {
  await open(page, "/progress#museum", "late");
  // The first room may own nothing; walk the rooms until one shows an owned piece.
  const owned = page.locator("[data-exhibit][data-status='owned'] img").first();
  const wings = page.locator("[data-museum-wings] button");
  const rooms = page.locator("[data-room]");
  for (let w = 0; w < (await wings.count()) && !(await owned.count()); w++) {
    await wings.nth(w).click();
    for (let i = 0; i < (await rooms.count()) && !(await owned.count()); i++) await rooms.nth(i).click();
  }
  await expect(owned).toBeAttached();
  expect(await owned.evaluate((el) => getComputedStyle(el).filter)).toBe("none");
  const other = page.locator("[data-exhibit][data-status='open'] img, [data-exhibit][data-status='retired'] img").first();
  if (await other.count()) expect(await other.evaluate((el) => getComputedStyle(el).filter)).toMatch(/brightness\(0\)/);
  // The shape is the piece's outline, not a filled square: the backdrop is keyed out.
  const sil = page.locator("[data-exhibit][data-status='locked'] img[data-sil='ready']").first();
  await expect(sil).toBeAttached();
  const clear = await sil.evaluate(async (el) => {
    const c = document.createElement("canvas");
    c.width = el.naturalWidth;
    c.height = el.naturalHeight;
    const g = c.getContext("2d");
    g.drawImage(el, 0, 0);
    return g.getImageData(0, 0, 1, 1).data[3];
  });
  expect(clear).toBe(0);
});
