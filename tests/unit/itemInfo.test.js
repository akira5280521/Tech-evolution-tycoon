// Every "?" description: present, short, and no broken numbers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { itemInfo } from "../../src/lib/itemInfo.js";
import { BUSINESSES, SUPPLY_KEYS } from "../../src/lib/gameConfig.js";
import { RESEARCH } from "../../src/lib/research.js";
import { FACILITIES, PARTS } from "../../src/lib/facilities.js";
import { CHALLENGES, INVESTOR_MILESTONES, LAB_PROJECTS, PROJECTS, SHOP, SPECIALTIES } from "../../src/lib/empire.js";

const SAVES = JSON.parse(readFileSync(new URL("../fixtures/saves.json", import.meta.url), "utf8"));

function items() {
  const list = [];
  for (const b of BUSINESSES) for (const kind of ["era", "manager", "upgrade-rev", "upgrade-spd", "locked-era"]) list.push([kind, b.id]);
  list.push(["materials", SUPPLY_KEYS], ["money"], ["topbar", { tech: true, rigs: true }], ["topbar", { tech: false, rigs: false }], ["foreman"], ["prestige"], ["fork"], ["rd"]);
  for (const r of RESEARCH) list.push(["research", r.id]);
  for (const f of FACILITIES) list.push(["facility", f.id]);
  for (const p of PARTS) for (const f of p.fits) list.push(["part", `${f}:${p.id}`]);
  for (const x of SHOP) list.push(["shop", x.id]);
  for (const x of LAB_PROJECTS) list.push(["lab", x.id]);
  for (const x of SPECIALTIES) list.push(["specialty", x.id]);
  for (const x of INVESTOR_MILESTONES) list.push(["milestone", x.id]);
  for (const x of CHALLENGES) list.push(["challenge", x.id]);
  for (const x of PROJECTS) list.push(["project", x.id]);
  return list;
}

const sentences = (text) => (text.match(/[.!?](\s|$)/g) || []).length;

for (const name of ["fresh", "newgame", "early", "mid", "late", "v4mid"]) {
  test(`every item has a short, complete description (${name} save)`, () => {
    const state = SAVES[name];
    const problems = [];
    for (const [kind, id] of items()) {
      const info = itemInfo(kind, id, state);
      const label = `${kind} ${typeof id === "object" ? "" : id}`;
      if (!info) {
        problems.push(`${label}: no description`);
        continue;
      }
      if (!info.title) problems.push(`${label}: no title`);
      if (sentences(info.text) > 2) problems.push(`${label}: ${sentences(info.text)} sentences`);
      const all = [info.title, info.text, ...(info.rows || []).map((r) => `${r.label} ${r.text}`)].join(" ");
      if (/undefined|NaN|Infinity|\[object/.test(all)) problems.push(`${label}: broken text: ${all}`);
    }
    assert.deepEqual(problems, []);
  });
}

test("locked ??? items don't name what's coming", () => {
  const state = SAVES.newgame;
  for (const b of BUSINESSES.slice(1)) {
    const info = itemInfo("locked-era", b.id, state);
    assert.ok(!info.text.includes(b.name), `locked era gives away ${b.name}`);
  }
});
