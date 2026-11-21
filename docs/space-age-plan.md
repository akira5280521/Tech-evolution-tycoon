# Space Age: how to add it

A plan, not built yet. The ladder itself is drafted in `src/lib/worldSpace.js`
(nine eras, Sounding Rockets to Asteroid Miners, numbers copied from the tuned
Vacuum Tubes to Quantum ladder). The roadmap has it as item 23, after Phase 1.

## Three decisions first

1. **What's shared.** Recommended: Space has its own cash, lifetime earnings
   and businesses; investors, forks, tokens, badges, specialties and settings
   are shared. Investors earned on Earth speed up Space too, so it never starts
   from nothing. (The other option, separate investors, means a second prestige
   loop to learn and balance.)
2. **How players switch.** Recommended: an EARTH / SPACE toggle at the top of
   the Game screen, shown once Space is open. A separate tab would push the
   tab bar to seven.
3. **When.** After Phase 1. Copy my stats will show how many testers reach the
   first fork, and how long it takes, before effort goes into what comes after
   it.

## Why it's a staged job

The game assumes one ladder of businesses. `BUSINESSES` (the Earth ladder) is
used in 134 places across 23 files: income, cycles, costs, managers,
upgrades, milestones, away pay, the money panel, history cards, research
years, the "?" text and more. `state.biz` is read in about 90 places. Doing it
in one change would touch most of the game at once, with a save-format change
on top. Four PRs, each tested on its own:

### Stage 1: one ladder, passed in (no player-visible change)

- Add `src/lib/world.js` with `ladderOf(state)` (returns `BUSINESSES` today).
- Replace direct `BUSINESSES` use in the run-state code (income, cycles,
  costs, managers, upgrades, milestones, away pay, Game screen rows) with the
  ladder from state. Content that is Earth by nature (history cards, research
  years, materials, facilities) keeps `BUSINESSES`.
- Done when the simulation gives the same numbers to the second, and every
  test, including the old-save tests, passes unchanged.

### Stage 2: two worlds in the save

- `state.worlds = { earth: {...}, space: {...} }` holding each world's cash,
  lifetime, businesses, upgrades, managers and run timers, plus
  `state.activeWorld`. The active world's fields stay where they are now
  (`state.cash`, `state.biz`...), so nearly all code is untouched; switching
  swaps them in and out.
- Away pay credits both worlds (managers only, at the away rate); the
  24-hour cap applies to each.
- Prestige: decide whether it resets both worlds or only the active one
  (recommended: both, one investor count).
- Opens at the first fork (`SPACE_UNLOCK`). Old saves load as Earth only; add
  a 0.0.27 save to `tests/fixtures/old-saves.json` before starting.

### Stage 3: the screens

- EARTH / SPACE toggle; Space rows use the same card, with no materials, no
  TECH and no RIGS.
- Nine icons in `public/icons/space/` (the draft paths), same pixel style.
- "?" text for each Space era in `src/lib/itemInfo.js`, a tip when Space
  opens, a How to Play section, release notes.

### Stage 4: balance and the link between worlds

- Simulate both worlds together: Space should be worth running without
  making Earth pointless.
- A reason to go back to Earth: Space earnings pay a second currency (the
  draft calls it "Moon Rocks") that buys permanent Earth boosts, so both
  worlds stay worth running.
- Tests: switching keeps each world's numbers, away pay credits both, an old
  save opens as Earth only, and nothing in Space shows up before the fork.

## Rough size

Stage 1 is the biggest and riskiest, but it changes nothing a player sees, so
the tests can prove it safe. Stages 2 and 3 are moderate. Stage 4 is
tuning. The art (nine icons) can be made in parallel at any point.
