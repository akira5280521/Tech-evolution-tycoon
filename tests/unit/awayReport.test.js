import { test } from "node:test";
import assert from "node:assert/strict";
import { awayCap, awayLabel, binsLine } from "../../src/lib/awayReport.js";

test("full bins fold into one line", () => {
  const h = 3600e3;
  const same = [{ key: "wood", ms: 8 * h + 9 * 60e3 }, { key: "paper", ms: 8 * h + 9 * 60e3 }, { key: "sand", ms: 8 * h + 9 * 60e3 }];
  assert.equal(binsLine(same), "Bins full for 8h 9m: wood, paper, sand (extra lost)");
  assert.equal(binsLine([{ key: "wood", ms: 2 * h }, { key: "glass", ms: 30 * 60e3 }]), "Bins full for up to 2h 0m: wood, glass (extra lost)");
  assert.equal(binsLine([]), "");
  assert.equal(awayLabel(90 * 60e3), "1h 30m");
});

test("the away cap says when it was hit and what raises it", () => {
  const s = { investors: 0, investorPeak: 0 };
  const a = awayCap(s, 30 * 3600e3);
  assert.equal(a.capMs, 24 * 3600e3);
  assert.equal(a.capped, true);
  assert.equal(a.next.id, "away-36");
  assert.equal(awayCap(s, 3600e3).capped, false);
});
