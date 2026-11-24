import { readFileSync } from "node:fs";
import { expect } from "@playwright/test";

export const SAVES = JSON.parse(readFileSync(new URL("../fixtures/saves.json", import.meta.url), "utf8"));
export const VERSION_CODE = readFileSync(new URL("../../src/lib/appVersion.js", import.meta.url), "utf8").match(
  /WEB_VERSION_CODE = "(\d+)"/,
)[1];

export const SAVE_KEY = "pc-tycoon-save-v1";
export const NOTES_KEY = "pc-tycoon-seen-notes";

export const ROUTES = ["/", "/boost", "/tech", "/rigs", "/facilities", "/board", "/runs", "/research", "/more", "/badges"];

// Put a save in localStorage before the app starts. Only once per tab, so a
// reload keeps whatever the game saved since. `save` is a fixture name from
// tests/fixtures/saves.json or a save object.
export async function seed(page, save, { seenNotes = true, extra = {}, restartOffer = false, askName = false } = {}) {
  let data = typeof save === "string" ? { ...SAVES[save], lastSeen: Date.now() } : save;
  // The fixtures are older saves; the one-time "start fresh?" offer is tested
  // on its own, so other tests skip it.
  if (data && !restartOffer) data = { ...data, restartSeen: true };
  // Naming the company is tested on its own (company.spec.js); other tests
  // start with it already asked.
  if (data && !askName) data = { companyAsked: true, ...data };
  if (typeof save === "string" && !SAVES[save]) throw new Error(`no fixture ${save}`);
  await page.addInitScript(
    ([s, code, seen, more, saveKey, notesKey]) => {
      if (sessionStorage.getItem("e2e-seeded")) return;
      sessionStorage.setItem("e2e-seeded", "1");
      if (s) localStorage.setItem(saveKey, JSON.stringify(s));
      if (seen) localStorage.setItem(notesKey, code);
      for (const [k, v] of Object.entries(more)) localStorage.setItem(k, v);
    },
    [data, VERSION_CODE, seenNotes, extra, SAVE_KEY, NOTES_KEY],
  );
}

// Collect uncaught page errors and any request that leaves the machine (the
// game must not call outside sites during these tests). Outside requests are
// blocked, not sent.
export async function watch(page) {
  const errors = [];
  const outside = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.route(/^(?!http:\/\/127\.0\.0\.1[:/])/, (route) => {
    const url = route.request().url();
    if (!url.startsWith("data:") && !url.startsWith("blob:")) outside.push(url);
    return route.abort();
  });
  return { errors, outside };
}

export async function open(page, path, save, opts) {
  const seen = await watch(page);
  await seed(page, save, opts);
  await page.goto(path);
  await page.locator("nav[aria-label='Main navigation']").waitFor();
  await page.waitForTimeout(700);
  return seen;
}

export async function tipsOff(page) {
  const off = page.locator("[data-tips-off]");
  if (await off.count()) {
    await off.click();
    await page.waitForTimeout(150);
  }
}

export async function saved(page) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), SAVE_KEY);
}

export async function coachStep(page) {
  const coach = page.locator("[data-coach]");
  return (await coach.count()) ? coach.getAttribute("data-coach") : null;
}

export async function tipId(page) {
  const tip = page.locator("[data-tip]");
  return (await tip.count()) ? tip.getAttribute("data-tip") : null;
}

export async function brokenImages(page) {
  return page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src")));
}

export function expectClean(seen) {
  expect(seen.errors, "uncaught page errors").toEqual([]);
  expect(seen.outside, "requests to outside sites").toEqual([]);
}
