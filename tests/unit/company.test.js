// The company name: cleaned, asked once, kept through prestige, in the news
// but never in the copied stats.
import { test } from "node:test";
import assert from "node:assert/strict";
import { COMPANY_MAX, DEFAULT_COMPANY, cleanCompanyName, companyCaps, companyName, companyPrompt, randomCompanyName, setCompanyName } from "../../src/lib/company.js";
import { snapshotMeta } from "../../src/lib/empire.js";
import { RESEARCH, startResearch } from "../../src/lib/research.js";

test("names are trimmed, tidied and kept short; empty means none", () => {
  assert.equal(cleanCompanyName("  Garage   Logic  Co. "), "Garage Logic Co.");
  assert.equal(cleanCompanyName("<script>Bad</script>"), "scriptBadscript");
  assert.equal(cleanCompanyName("Café Ünïcode 3000"), "Café Ünïcode 3000");
  assert.equal(cleanCompanyName("A".repeat(40)).length, COMPANY_MAX);
  assert.equal(cleanCompanyName("   "), null);
  assert.equal(cleanCompanyName(42), null);
  assert.equal(companyName({}), DEFAULT_COMPANY);
  assert.equal(companyCaps({ companyName: "Pixel Labs" }), "PIXEL LABS");
});

test("made-up names are tidy and change with the dice", () => {
  let i = 0;
  const seq = () => [0.1, 0.5, 0.9, 0.3, 0.7, 0.2][i++ % 6];
  const a = randomCompanyName(seq);
  const b = randomCompanyName(seq);
  assert.equal(a, cleanCompanyName(a));
  assert.notEqual(a, b);
  for (let k = 0; k < 200; k++) {
    const n = randomCompanyName();
    assert.ok(n && n.length <= COMPANY_MAX, n);
  }
});

test("a new game gets the screen, a save with progress the card, then never again", () => {
  assert.equal(companyPrompt({ lifetime: 0 }), "screen");
  assert.equal(companyPrompt({ lifetime: 500 }), "card");
  assert.equal(companyPrompt({ lifetime: 0, prestigeCount: 2 }), "card");
  const s = { lifetime: 0 };
  setCompanyName(s, null);
  assert.equal(companyPrompt(s), null);
  assert.equal(s.companyName, null);
  setCompanyName(s, " Vector Works ");
  assert.equal(s.companyName, "Vector Works");
});

test("the name and the asked flag are kept through prestige", () => {
  const meta = snapshotMeta({ companyName: "Ferrite Data", companyAsked: true }, { resetRunUpgrades: true });
  assert.equal(meta.companyName, "Ferrite Data");
  assert.equal(meta.companyAsked, true);
});

test("research headlines carry the company name", () => {
  const entry = RESEARCH.find((r) => !r.soon && r.id === "cpu-4bit");
  const s = { companyName: "Orbit Labs", data: 1e9, techDone: [], biz: [{ owned: 1 }], facilities: {}, news: [] };
  startResearch(s, entry.id);
  const line = (s.news || []).map((n) => n.text).find((t) => t.includes("RESEARCH STARTS"));
  if (line) assert.ok(line.startsWith("ORBIT LABS R&D:"), line);
});
