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
