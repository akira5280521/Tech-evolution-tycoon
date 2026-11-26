// The first-time tutorial, start to finish, plus skip and replay.
import { test, expect } from "@playwright/test";
import { coachStep, expectClean, open, saved } from "./helpers.js";

test("a new player walks all 13 steps and the starter goals take over", async ({ page }) => {
  test.setTimeout(120_000);
  const seen = await open(page, "/", "newrich");
  expect(await coachStep(page)).toBe("run");
  await expect(page.locator("[data-coach-spot]")).toHaveCount(1);
  await expect(page.locator("[data-starter-goal]")).toHaveCount(0);
  await expect(page.locator("[data-tip]")).toHaveCount(0);

  await page.click('[data-tile="timber"]');
  await expect.poll(() => coachStep(page), { timeout: 8000 }).toBe("buy");

  const buy = async (id, n) => {
    for (let i = 0; i < n; i++) {
      await page.click(`[data-buy="${id}"]`);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(250);
  };
  await buy("timber", 1);
  expect(await coachStep(page)).toBe("modes");

  const mode = async () => (await page.locator("[data-buy-modes]").innerText()).replace(/\s+/g, " ");
  const first = await mode();
  await page.click("[data-buy-modes]");
  await expect.poll(() => coachStep(page)).toBe("hire");
  for (let i = 0; i < 12 && (await mode()) !== first; i++) await page.click("[data-buy-modes]");
  expect(await mode(), "the amount button cycles back to the start").toBe(first);

  await buy("timber", 3);
  await page.click('[data-hire="timber"]');
  await expect.poll(() => coachStep(page), { timeout: 8000 }).toBe("next");
  await expect(page.locator('[data-buy="paper"]'), "Paper Mill locked at 5 camps").toHaveCount(0);
  // Since the era earnings gates the Paper Mill also needs $220 earned this
  // run, which takes minutes at this income. Bank it in the save and reload;
  // the tutorial picks up where it was.
  // (Edited at the next page start, after the app's own save on leaving.)
  await page.addInitScript((k) => {
    if (sessionStorage.getItem("e2e-life")) return;
    sessionStorage.setItem("e2e-life", "1");
    const s = JSON.parse(localStorage.getItem(k));
    s.lifetime = Math.max(s.lifetime || 0, 1000);
    localStorage.setItem(k, JSON.stringify(s));
  }, "pc-tycoon-save-v1");
  await page.reload();
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await page.waitForTimeout(700);
  expect(await coachStep(page)).toBe("next");
  await buy("timber", 5);
  await expect(page.locator('[data-buy="paper"]'), "10 camps open the Paper Mill").toHaveCount(1);
  await buy("paper", 1);
  expect(await coachStep(page)).toBe("materials");

  await page.click("[data-supply]");
  if (await page.locator("[data-help-close]").count()) await page.click("[data-help-close]");
  await expect.poll(() => coachStep(page)).toBe("hq");
  await page.locator("[data-open-facilities]").click();
  await expect.poll(() => coachStep(page), { timeout: 8000 }).toBe("hq-go");
  await expect(page.locator("[data-coach]")).toContainText("8/13");
  await page.locator("[data-action='go-servers']").click();
  await expect.poll(() => coachStep(page), { timeout: 8000 }).toBe("starter");
  const buyStarter = page.locator("[data-action='buy-tab601']");
  if (!(await buyStarter.isEnabled())) {
    await page.evaluate((k) => {
      const s = JSON.parse(localStorage.getItem(k));
      s.supply = { ...(s.supply || {}), wood: Math.max(s.supply?.wood || 0, 8) };
      localStorage.setItem(k, JSON.stringify(s));
    }, "pc-tycoon-save-v1");
    await page.reload();
    await page.locator("nav[aria-label='Main navigation']").waitFor();
    await page.waitForTimeout(700);
  }
  await page.locator("[data-action='buy-tab601']").click();
  await expect.poll(() => coachStep(page), { timeout: 8000 }).toBe("tech");
  await page.locator("[data-open-research]").click();
  await expect.poll(() => coachStep(page), { timeout: 8000 }).toBe("project");
  const startFirst = page.locator("[data-action='research-tab-hollerith']");
  if (!(await startFirst.count())) await page.locator("[data-research-tab='storage']").click();
  await expect(startFirst).toBeVisible();
  await startFirst.click();
  await expect.poll(() => coachStep(page), { timeout: 8000 }).toBe("later");
  await expect(page.locator("[data-coach]")).toContainText("13/13");
  await expect(page.locator("[data-coach-next]")).toContainText("DONE");
  await page.click("[data-coach-next]");
  await expect.poll(() => coachStep(page)).toBe(null);
  await expect.poll(async () => (await saved(page))?.tutorial?.done).toBe(true);
  // The starter goal sits under the buy-amount row on the GAME screen.
  await page.locator("[data-tab=game]").click();
  await expect(page.locator("[data-starter-goal]")).toHaveCount(1);
  expectClean(seen);
});

test("skip ends the tutorial and is saved", async ({ page }) => {
  await open(page, "/", "newgame");
  await page.click("[data-coach-skip]");
  await expect.poll(() => coachStep(page)).toBe(null);
  await expect.poll(async () => (await saved(page))?.tutorial?.skipped).toBe(true);
});

for (const save of ["mid", "early", "v4mid"]) {
  test(`an existing player (${save}) doesn't get the tutorial`, async ({ page }) => {
    await open(page, "/", save);
    expect(await coachStep(page)).toBe(null);
  });
}

test("replay from How to Play walks all 13 steps with Next", async ({ page }) => {
  await open(page, "/more#howto", "mid");
  await page.click('[data-action="tutorial-replay"]');
  await page.waitForTimeout(600);
  await page.goto("/");
  await expect.poll(() => coachStep(page), { timeout: 8000 }).toBe("run");
  let steps = 0;
  for (let i = 0; i < 30 && (await coachStep(page)); i++) {
    await page.click("[data-coach-next]");
    await page.waitForTimeout(200);
    steps++;
  }
  expect(steps).toBe(13);
});

for (const viewport of [{ width: 844, height: 390 }, { width: 320, height: 568 }]) {
  test(`the coach bubble fits ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page, "/", "newgame");
    const box = await page.locator("[data-coach]").boundingBox();
    expect(box).toBeTruthy();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  });
}
