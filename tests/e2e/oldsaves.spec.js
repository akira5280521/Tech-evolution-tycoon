// Saves written by earlier builds (0.0.24, 0.0.25, 0.0.26) load in this one
// with nothing lost. These are real saves those builds wrote, kept in
// tests/fixtures/old-saves.json; add the current build's when it ships.
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { coachStep, expectClean, open, saved } from "./helpers.js";

const OLD = JSON.parse(readFileSync(new URL("../fixtures/old-saves.json", import.meta.url), "utf8"));

for (const [name, data] of Object.entries(OLD)) {
  test(`a ${name} save loads with nothing lost`, async ({ page }) => {
    const before = { ...data, lastSeen: Date.now() - 3 * 3600e3 };
    const seen = await open(page, "/", before);
    await expect(page.locator("[data-cash-panel]")).toBeVisible();
    await page.waitForTimeout(1500);
    const after = await saved(page);
    expect(after, "the game saved again").toBeTruthy();
    expect(after.investors).toBe(before.investors);
    expect(after.cash).toBeGreaterThanOrEqual(before.cash * 0.999);
    expect(after.data || 0, "R&D points kept").toBeGreaterThanOrEqual((before.data || 0) - 1e-6);
    for (const id of before.techDone || []) expect(after.techDone, `research ${id} kept`).toContain(id);
    for (const id of before.goalsDone || []) expect(after.goalsDone, `goal ${id} kept`).toContain(id);
    expect(after.facilities?.servers || {}).toMatchObject(before.facilities?.servers || {});
    after.biz.forEach((row, i) => expect(row.owned, `${row.id} owned`).toBeGreaterThanOrEqual(before.biz[i]?.owned || 0));
    if (before.tutorial?.done) expect(await coachStep(page), "a finished tutorial stays finished").toBe(null);
    else expect(await coachStep(page), "an unfinished tutorial picks up again").not.toBe(null);
    expectClean(seen);
  });
}

test("a player partway through the old 6-step tutorial plays on to the new step 7", async ({ page }) => {
  test.setTimeout(120_000);
  const mid = Object.entries(OLD).find(([k, s]) => k.startsWith("v0.0.26") && !s.tutorial?.done)[1];
  await open(page, "/", { ...mid, lastSeen: Date.now() });
  const buyTo = async (id, n) => {
    for (let i = 0; i < 12; i++) {
      const owned = (await saved(page))?.biz?.find((b) => b.id === id)?.owned || 0;
      if (owned >= n) return;
      await page.click(`[data-buy="${id}"]`);
      await page.waitForTimeout(150);
    }
  };
  const visited = [];
  for (let i = 0; i < 20; i++) {
    const step = await coachStep(page);
    if (!step) break;
    if (visited.at(-1) !== step) visited.push(step);
    if (step === "run") {
      await page.click('[data-tile="timber"]');
      await page.waitForTimeout(3200);
    } else if (step === "buy") await page.click('[data-buy="timber"]');
    else if (step === "modes") {
      await page.click("[data-buy-modes]");
      for (let k = 0; k < 6 && !/X1\b/.test(await page.locator("[data-buy-modes]").innerText()); k++) await page.click("[data-buy-modes]");
    } else if (step === "hire") {
      await buyTo("timber", 5);
      await page.click('[data-hire="timber"]');
      await page.waitForTimeout(3500);
    } else if (step === "next") {
      await buyTo("timber", 10);
      await page.click('[data-buy="paper"]');
    } else if (step === "materials") {
      await page.click("[data-supply]");
      if (await page.locator("[data-help-close]").count()) await page.click("[data-help-close]");
    } else await page.click("[data-coach-next]");
    await page.waitForTimeout(400);
  }
  expect(visited, `steps seen: ${visited.join(", ")}`).toContain("later");
  expect(await coachStep(page)).toBe(null);
  await expect.poll(async () => (await saved(page))?.tutorial?.done).toBe(true);
});
