#!/usr/bin/env node
// Headless pacing run against the live game logic.
//   npm run sim:pace
//   node scripts/sim/pace.mjs --out docs/pacing/baseline-2026-11-24.md
//   node scripts/sim/pace.mjs --profile active

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { formatDuration, reportMarkdown, runPacing, runProfile } from "../../src/lib/paceSim.js";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0) return fallback;
  return process.argv[i + 1] ?? fallback;
}

const started = Date.now();
const profile = arg("profile");
const title = arg("title", "Pacing report");
const note = arg("note", "");
const out = arg("out");

let run;
if (profile === "active" || profile === "idle") {
  const one = runProfile(profile);
  run = { active: profile === "active" ? one : null, idle: profile === "idle" ? one : null, startedAt: one && 0 };
  const r = one;
  console.log(`${profile}: prestige ${formatDuration(r.firstPrestige)}, quantum ${formatDuration(r.quantum)}, fork ${formatDuration(r.firstFork)} (${r.stopped}, ${r.steps} steps)`);
} else {
  run = runPacing();
  for (const [label, r] of [["active", run.active], ["idle", run.idle]]) {
    console.log(`${label}: prestige ${formatDuration(r.firstPrestige)}, quantum ${formatDuration(r.quantum)}, fork ${formatDuration(r.firstFork)} (${r.stopped}, ${r.steps} steps)`);
  }
}

const md = reportMarkdown(run.active && run.idle ? run : {
  active: run.active || run.idle,
  idle: run.idle || run.active,
}, { title, note });

if (out) {
  const path = resolve(out);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, md);
  console.log(`wrote ${path}`);
} else {
  process.stdout.write(md);
}

console.error(`sim finished in ${((Date.now() - started) / 1000).toFixed(1)}s`);
