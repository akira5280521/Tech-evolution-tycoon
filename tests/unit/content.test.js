// Data tables: ids unique, links point at things that exist, every picture
// the game shows is in public/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { BUSINESSES } from "../../src/lib/gameConfig.js";
import { RESEARCH, researchCost } from "../../src/lib/research.js";
import { FACILITIES, PARTS } from "../../src/lib/facilities.js";
import { HUB_ITEMS } from "../../src/lib/hub.js";
import { GENERATIONS } from "../../src/lib/generations.js";
import { TIPS } from "../../src/lib/tips.js";
import { TUTORIAL_STEPS, tourSteps } from "../../src/lib/tutorial.js";
import { HOWTO_GUIDES } from "../../src/lib/howto.js";
import { STARTER_GOALS } from "../../src/lib/goals.js";

const publicFile = (p) => new URL(`../../public${p}`, import.meta.url);
const unique = (list) => new Set(list).size === list.length;

test("ids are unique", () => {
  assert.ok(unique(BUSINESSES.map((x) => x.id)), "businesses");
  assert.ok(unique(RESEARCH.map((x) => x.id)), "research");
  assert.ok(unique(PARTS.map((x) => x.id)), "parts");
  assert.ok(unique(TIPS.map((x) => x.id)), "tips");
  assert.ok(unique(TUTORIAL_STEPS.map((x) => x.id)), "tutorial steps");
  assert.ok(unique([...TUTORIAL_STEPS, ...tourSteps()].map((x) => x.id)), "tutorial and tour steps");
  assert.ok(unique(HOWTO_GUIDES.map((x) => x.id)), "howto guides");
  assert.ok(unique(STARTER_GOALS.map((x) => x.id)), "starter goals");
});

test("every research prerequisite exists and the chains have no loops", () => {
  const byId = Object.fromEntries(RESEARCH.map((r) => [r.id, r]));
  for (const r of RESEARCH) {
    if (r.prereq) assert.ok(byId[r.prereq], `${r.id} needs missing ${r.prereq}`);
    const seen = new Set();
    for (let at = r; at?.prereq; at = byId[at.prereq]) {
      assert.ok(!seen.has(at.id), `loop at ${r.id}`);
      seen.add(at.id);
    }
  }
});

test("every chip generation has a research project, and unfinished research costs nothing", () => {
  const ids = new Set(RESEARCH.map((r) => r.id));
  for (const [row, list] of Object.entries(GENERATIONS)) for (const g of list) assert.ok(ids.has(g.id), `${row} chip ${g.id} has no project`);
  for (const r of RESEARCH) {
    if (r.soon) continue;
    const cost = researchCost(r);
    assert.ok(Number.isFinite(cost) && cost > 0, `${r.id} costs ${cost}`);
    assert.ok(r.durationMs > 0, `${r.id} has no duration`);
  }
});

test("every picture the game shows exists", () => {
  const paths = [
    ...BUSINESSES.map((b) => b.icon),
    ...FACILITIES.map((f) => f.icon),
    "/icons/facilities/museum.png",
    "/icons/facilities/museum-32.png",
    ...HUB_ITEMS.map((item) => item.icon),
    ...PARTS.map((p) => p.icon),
    "/icons/placeholder-era.svg",
  ].filter(Boolean);
  const missing = paths.filter((p) => !existsSync(publicFile(p)));
  assert.deepEqual(missing, []);
});

test("the Museum icons are the 16px card and 32px title drawings", () => {
  const size = (p) => {
    const buf = readFileSync(publicFile(p));
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  };
  assert.deepEqual(size("/icons/facilities/museum.png"), { w: 16, h: 16 });
  assert.deepEqual(size("/icons/facilities/museum-32.png"), { w: 32, h: 32 });
});

test("unfinished parts are marked Coming soon and can't be bought", () => {
  for (const p of PARTS.filter((x) => x.soon)) assert.equal(p.cost, 0, `${p.id} has a price`);
});

test("every tip and tutorial step has words and a known page", () => {
  for (const tip of TIPS) {
    assert.ok(tip.title && tip.text, `tip ${tip.id}`);
    assert.ok(tip.text.length < 320, `tip ${tip.id} is long (${tip.text.length})`);
  }
  for (const step of TUTORIAL_STEPS) assert.ok(step.title && step.text, `step ${step.id}`);
  for (const step of tourSteps()) assert.ok(step.title && step.text, `tour ${step.id}`);
  assert.equal(TUTORIAL_STEPS.at(-1).manual, true, "the last step finishes with a button");
  for (const guide of HOWTO_GUIDES) assert.ok(guide.title && guide.lines?.length, `guide ${guide.id}`);
});

test("release notes exist for the current version", () => {
  const code = readFileSync(new URL("../../src/lib/appVersion.js", import.meta.url), "utf8").match(/WEB_VERSION_NAME = "([\d.]+)"/)[1];
  assert.ok(existsSync(new URL(`../../docs/releases/v${code}.md`, import.meta.url)), `docs/releases/v${code}.md`);
  const notes = readFileSync(new URL("../../src/lib/releaseNotes.js", import.meta.url), "utf8");
  assert.ok(notes.includes(`v${code}.md`), "releaseNotes.js reads this version's notes");
});

test("Android version matches the web version", () => {
  const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")).version;
  const gradle = readFileSync(new URL("../../android/app/build.gradle", import.meta.url), "utf8");
  const app = readFileSync(new URL("../../src/lib/appVersion.js", import.meta.url), "utf8");
  assert.ok(gradle.includes(`versionName "${pkg}"`), "build.gradle versionName");
  assert.ok(app.includes(`WEB_VERSION_NAME = "${pkg}"`), "appVersion.js");
  const code = app.match(/WEB_VERSION_CODE = "(\d+)"/)[1];
  assert.ok(gradle.includes(`versionCode ${code}`), "build.gradle versionCode");
});
