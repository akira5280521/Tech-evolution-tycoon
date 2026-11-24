# Pacing log

Times are America/Chicago (CT).

## 2026-11-24, morning CT — item A, baseline

- Added `src/lib/playState.js` so the live hook and the sim share buy / hire / run / prestige / fork.
- Extended `replayAway` with optional `alsoManual` (active tapping) and `slices` (shorter steps for short jumps). Default away catch-up is unchanged.
- Added `src/lib/paceSim.js` and `scripts/sim/pace.js` (`npm run sim:pace`).
- Active bot: follows the live next-move priorities, hires, opens eras, buys MAX of the newest row, starts TECH research for the next era gate (including prereqs, without skipping to a later cheaper chain), buys up to six starter research machines and modest extra servers while a gate project is waiting, and prestiges when that would at least double investors, but not over a next era that is close or still waiting on research. Casual bot: 45-minute sessions, then 8 hours away at OFFLINE_RATE (0.5) with the 24-hour cap.
- Baseline saved at `docs/pacing/baseline-2026-11-24.md` (sim wall time about 7 minutes).
- Nonstop: first prestige 7h 15m, Quantum Servers 15d 7h, first fork not reached in 21 days. Late eras after Supercomputers are gated by earnings, by TECH projects (GPU, RGB, Quantum), and by the $100B first-investor point landing before those gates unless the bot delays a close era. This is later than the 0.0.22 “Quantum ~6h / prestige near Quantum” note, because many eras and research gates were added after that tune. Not retuned in this commit.
- Casual (21 days calendar, 1d 19h active play): first prestige 1d 11h; Quantum and fork not reached.

