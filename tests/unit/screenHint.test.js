import { test } from "node:test";
import assert from "node:assert/strict";
import { hintPage, screenHint } from "../../src/lib/screenHint.js";
import { freshState } from "../../src/lib/playState.js";

test("hint pages follow the menus", () => {
  assert.equal(hintPage("/", ""), "game");
  assert.equal(hintPage("/boost", ""), "boost#upgrades");
  assert.equal(hintPage("/boost", "#prestige"), "boost#prestige");
  assert.equal(hintPage("/progress", ""), "progress#runs");
  assert.equal(hintPage("/research", "#tech-tab-hollerith"), "research#tech");
  assert.equal(hintPage("/facilities/bench", "#saved"), "facilities");
  assert.equal(hintPage("/rigs", ""), "hq");
});

test("every screen has a one-line hint", () => {
  const s = freshState();
  for (const page of ["game", "research", "research#tech", "research#specialty", "research#lab", "boost#upgrades", "boost#now", "boost#bonuses", "boost#prestige", "progress#runs", "progress#badges", "progress#museum", "progress#stats", "hq", "facilities", "more"]) {
    const { text } = screenHint(s, page);
    assert.ok(text && text.length < 110 && !text.includes("\n"), `${page}: ${text}`);
  }
});

test("idle businesses make the bulb glow on GAME only", () => {
  const s = freshState();
  s.biz[0].owned = 2; s.biz[0].running = false; s.biz[0].manager = false;
  assert.equal(screenHint(s, "game").stuck, true);
  assert.equal(screenHint(s, "boost#upgrades").stuck, false);
  s.biz[0].running = true;
  assert.equal(screenHint(s, "game").stuck, false);
});

import { TUTORIAL_STEPS } from "../../src/lib/tutorial.js";
import { TIPS } from "../../src/lib/tips.js";

test("tutorial and tips never send you to menus that moved", () => {
  const stale = [/BOARD tab/, /RUNS tab/, /Tap RUNS\b/, /\bRIGS tab/, /on the GAME tab.*prestige/i, /Hardware Museum, in HQ/, /Museum in HQ/];
  const texts = [
    ...TUTORIAL_STEPS.map((s) => (typeof s.text === "string" ? s.text : "")),
    ...TIPS.map((t) => t.text || ""),
  ];
  for (const text of texts) for (const re of stale) assert.ok(!re.test(text), `${re}: ${text}`);
  for (const t of TIPS) assert.ok(!/data-tab="(board|runs)"/.test(t.target || ""), t.id);
});
