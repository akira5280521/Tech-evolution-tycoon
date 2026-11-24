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


## 2026-11-24, morning CT — item B, arrival cards

- Short era and CPU/GPU generation cards (year, parody name with real model numbers, one history line). Queued, tap to dismiss. Fast offline catch-up (a minute or more) collapses to one summary. The sting uses the effects bus and is skipped when sound is off, effects are muted, or reduced motion is on. The starting Timber Camp is not announced.

## 2026-11-24, morning CT — item C, notifications

- On the existing away-reminder hook: optional RESEARCH DONE and BINS FULL notices, same permission as the cap reminder. One of each kind, with a 30-minute cooldown. Opening the app still cancels pending notices.

## 2026-11-24, morning CT — item D, history events step 1

- Early-era contracts (one at a time): Census Office (200 Punch Cards in 10 minutes), Wartime Code-Breaking (80 Relay Computers), Wartime Ballistics (100 Vacuum Tubes). Offered when that era is owned. The deadline and production only run while the app is open; fail or skip loses nothing and the office asks again later (5 or 10 minutes). Reward is era tokens plus a couple of minutes of income.
- The 1947 moth is a once-a-game story event in the relay–mainframes window. It has no 45-second timer. Done is marked when the player chooses, so deferring it (5 minutes) can bring it back. Design call: pin-it pays +4 R&D, clear-it is a 5-minute income boost.
- Moore's Law (1965) is a once-a-game research upgrade offered from Integrated Circuits on. Accepting it marks `moore` in `eventsDone` and cuts buy costs of eras dated 1965 or later by 15% (including ICs and minicomputers). The 15% figure is a design call; docs did not specify the discount. Earn gates are unchanged.
- Mega-projects are in historical order: cable, mainframe, ARPANET, Apollo, Homebrew, Y2K, LAN, Orbital, Parallel Timeline. Career goals recosted so the 1860s Transcontinental Cable is first and cheapest ($5.00M, was $10B) and the National Mainframe is $100M (was $1T). Those dollar amounts are a design call. Existing project badges (higher lifetime totals) were left as they were.
- The pacing bot accepts Moore, the moth, and contracts during active sessions so the post-D comparison includes them. True away catch-up still pauses contracts.
- SAVE_VERSION is 15. Live contract / story offers are not kept across prestige; completed contracts and events are.

## 2026-11-24, 7:45 AM CT — item E, post-D comparison

- Re-ran `npm run sim:pace` after D (wall time 417.6s). Saved `docs/pacing/after-d-2026-11-24.md` and `docs/pacing/compare-d-2026-11-24.md`.
- Active: first prestige 6h 28m (was 7h 15m, −10.8%), Quantum 15d 6h (was 15d 7h, −0.3%), fork still not reached in 21 days.
- Casual: first prestige still 1d 11h; Quantum and fork still not reached.
- Workstations / Laptops / Dial-up jumped earlier on the active profile because the recosted early mega-projects (and then Moore) let those eras open on the first run, before prestige. That is an expected reason, so no numbers were retuned.
