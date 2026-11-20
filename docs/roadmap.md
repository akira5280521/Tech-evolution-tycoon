# Roadmap

Planned updates, in order. Each one is meant to ship on its own. Nothing in
"Next" or "Later" is in the game yet. Longer designs live in
[`docs/ideas.md`](ideas.md). When an item ships, move it to "Done"
and list the next items under "Coming soon" in the release notes (see
`docs/release-notes-template.md`).

## Done

- **0.0.9** - NEXT buy, eight boardroom dilemmas, six new mega-projects, more
  headlines, What's New / Coming Soon in the updater.
- **0.0.10** - History cards and the Museum (26 stories, two per era), and the
  Dot-com Bubble. The pop time is chosen when the stock appears and shown as a
  countdown.
- **0.0.11** - Safer updater: strict link check, private staging, package,
  version and signer checks before install.
- **0.0.12** - Save backup: export a save code, restore from one. (No
  separate release; first shipped in the 0.0.13 APK.)
- **0.0.13** - Display and polish: locked badges, upgrades, Museum rows and
  projects stay hidden until discovered; badge pictures fit their frames;
  slower news ticker that pauses when held; landscape layout (full-width era
  cards, side column stays put, COLLECT always visible); long era names,
  buy-mode labels, Boost tags and Board values fit on narrow phones and with
  large text. Checked with a layout test of every screen at 26 screen sizes,
  portrait and landscape, and text sizes 85-200%.
- **0.0.14** - Maintenance release. Needs a fresh install: export your save
  first, then import it. Gameplay unchanged.

## To change

Nothing open. The display and polish list from playtesting and the layout
test shipped in 0.0.13 (see Done).

## Next build (after 0.0.24)

- **R&D pacing.** Eras make 0.001 R&D a second each (was 0.008); research
  servers are the main source (0.005 per unit of work; a starter rack makes
  0.04 a second). Rack prices rise 5x per rack (Foundry R1 from $10M, R4
  from $400M), so the plant grows a rack or two per era instead of filling at
  once. Timeline prices double every 15 years of the project's year (4004 =
  67, 486 = 539, DDR = 768, 2017-19 projects about 3,400-4,200). Every other
  R&D price and grant was cut 8x with the era rate (specialties 10, Overclock
  4, Patent Filing 3, Install Crew 8, Research Sample +5, dilemma grants 2-3),
  so the early game feels the same. Saves keep their balance.
- **Tips for the new systems**: one-time tips when TECH opens, when the
  research servers open, and when the mine and cluster open, plus page tips
  on the Tech and Facilities screens. How to Play has R&D points, Tech
  timeline and Facilities sections. Tips wait for What's New to close and
  never move up over the starter goal card.
- **Tutorial step 7, WHAT'S AHEAD**: after materials, the coach points at the
  locked ??? buttons and says what TECH and RIGS are, with a DONE button.
  Finished players don't see it; anyone mid-tutorial gets it at the end.
- **A "?" on every item.** Every business card, manager, upgrade, chip,
  material, research project, plant and part, the prestige and fork panels,
  shop and lab items, specialties, milestones, challenges, mega-projects and
  the money panel has a "?" that opens a short description (what it is, what
  it does, current numbers). All the text lives in `src/lib/itemInfo.js`.
  Locked "???" items say only that they unlock later; "Coming soon" items say
  so. Every "?" (the glossary ones too) is a 44x44 tap target; the sheet closes
  on a tap outside, stays clear of the money panel, ticker and tab bar, and
  moves (or nudges the page) so it doesn't cover that item's BUY or Hire.

## Earlier: after 0.0.22

- **One research currency: R&D points.** The research servers and the eras
  now fill the same pool (the save field stays `data`), and specialties,
  lab projects and the tech timeline all spend it. Older saves add any
  server Research Data into it once. Server output is 0.01 R&D a second per
  unit of work (a starter rack is about 0.08 a second, about ten eras'
  worth); timeline projects cost 5x their table value (6,130 R&D for all 47).
- **Prestige, forks and challenges keep the tech timeline**, the project in
  progress and the ticker's own news (they were being wiped).
- **Half rate while away**: plants and all R&D (eras and servers) earn at
  OFFLINE_RATE when the game is minimized or closed, like the businesses.
  Project timers still run on the real clock.
- Locked timeline projects say "Research <name> first" instead of an
  already-passed year.
- The TECH and FACILITIES shortcuts and the RIGS tab stay greyed out ("???")
  until reached (first timeline year, 1956; Microprocessors for the plants).
- Parody names: Chipwright 586 (was a real brand name), Raster graphics
  cards (was Novidia), and no company name on the 1956 disk.
- package-lock.json back to the last good version (it had drifted to
  alpha/beta Cloudflare dev builds with no package change).

- **Lab projects** on the Research tab, so spare data always has a use.
  Fixed prices, no chance: **Overclock** (30 data: all income x1.5 for 10
  minutes, then a 20-minute cool-down; the money bar shows the time left),
  **Patent Filing** (25 data for 1 era token, 5 a day; these tokens don't
  count as tokens earned from play) and **Install Crew** (60 data, once:
  upgrades install instantly, kept forever). With perfect use, Overclock
  averages about +16% income while playing.
- The grey bars down the screen edges are gone; Android's own scroll
  indicator stays. The Investors text uses the full width on phones.
- Next up for review: the research tech tree (layer 2).

## Ships in 0.0.22

- **Buy buttons buy what they say.** ×10 and ×100 always buy that many and
  MAX buys everything affordable; they used to stop at the next milestone,
  speed or mastery count (×10 at 70 Timber Camps bought 2). NEXT still
  stops at the next goal and now shows where it lands (BUY ×5 → 75).
- **Round milestones, AdCap style:** 25 (2× speed), 50 (2× speed), 75 (2×
  pay), 100 (2× speed), 150 (2× pay), 200 (3× pay). Speed-upgrade and
  mastery counts are in steps of 25 too; badge counts in steps of 5.
- **Milestone feedback:** each row shows its next milestone and how many to
  go with a small bar; reaching one flashes the row and says what it gave.
  A grey buy button shows how much more cash is needed.
- **Investor milestones** (Board tab, and "Next unlock at N investors" on
  the Investors panel): 10 head start (25 Timber Camps), 50 material
  managers stay hired, 250 time away up to 36 h, 1,000 upgrades buy
  themselves (toggle on Boost), 5,000 time away up to 48 h, 10,000 start
  with 10 of each business before Integrated Circuits. Counted by the most
  investors ever held, so a fork doesn't take them away; older saves add
  back the investors spent on forks.
- **Slower late eras:** Microprocessors to Quantum cost more (×1.5 up to
  ×30), so Quantum comes at about 6 hours of nonstop play (was 2.7). The
  first investor now comes at $100B in a run (was $1T) so the first
  prestige still lands near Quantum and investors keep flowing.
- **Battery:** the game ticks 4 times a second (was 10) and redraws at most
  that often; progress bars draw at up to 30 fps and stop when off screen.
- Pacing sim (nonstop): Quantum 5.8 h, first prestige 5.9 h, first fork
  3.7 d. Casual: Quantum 45 h, first prestige 2.3 d, first fork 12 d.
- **Prestige guide:** income now and after on the Investors panel and in
  the prompt; the button glows and Next Move suggests it once a prestige
  would at least double your investors.
- **First-prestige screen:** what you gained, kept and started over, any
  investor milestone unlocked and the next one.
- **Challenges** open after the first prestige (a Speedrun started before
  it couldn't be won), and an active challenge can be abandoned.

## Ships in 0.0.19

PRs #48-#50 shipped in the uploaded 0.0.19 Play bundle (versionCode 19).
This release is 0.0.20 (versionCode 20) and adds PR #47.

- **Landscape fixes from two testers' phones:** the side tab bar no longer
  loses its width to the camera cutout (labels were wrapping one letter per
  line), the empty strip between the tab bar and the page is gone, and text
  no longer scrolls under the status bar.
- **Research is a main tab** in place of Badges; Badges and the Museum
  moved into the More menu. Old Badges links open the new place, and tips,
  toasts and the tutorial point there.
- **Materials are used per machine.** Each copy of a machine now uses its
  own share each cycle, as each copy of a maker adds one (before, 100 Glass
  Works used 1 sand a cycle in total, so stockpiles grew into the millions).
  A machine only makes and pays for what its materials cover; an empty bin
  makes nothing and pays nothing (the old 15% floor is gone), and the row
  shows a red "Out of sand" or "Short of sand: running at 40%" line.
  Ratios stay 1 to 1, and existing stockpiles are kept.
- **World events follow history.** Each boardroom event only appears in
  the eras it fits (expos from Home Computers, hackathons from Graphics
  Cards, and so on). Real one-time events happen once a game, even across
  prestige and forks: the Dot-com Bubble and Y2K, both only during Home
  Computers to Graphics Cards. The bubble now arrives 5-15 minutes into that
  stretch instead of every 40-80 minutes, so it isn't missed.
- **A tutorial for people who've never played an idle game.** A tester
  said it assumed you'd played one: what is a machine, why tap it, what's
  the goal, what order do things come in? It now opens with the goal
  (grow through the real history of computing, 19 eras, then prestige),
  points at the new ERA counter at the top (for example ERA 3/19), the
  cash panel and a whole business row (picture, bar, owned count, BUY,
  Hire) before asking for the first tap, and ends with what comes next.
  The game says "business" everywhere instead of "machine", How to Play
  starts with The Goal, and the Investors panel stays out of the way until
  the run has earned $1B.
- **The game follows the phone's auto-rotate switch.** With auto-rotate
  off, it no longer turns on its own (it used the sensor and ignored the
  switch). The Portrait and Landscape settings still hold it.
- **Closed earns half of open.** Testers earned more with the app closed
  than open. Now managers earn at half speed while the app is closed or in
  the background (a look at another app under 30 seconds still counts as
  playing), for up to 24 hours, so keeping the game open pays about twice
  as well. Time away is paid fairly: makers first, and businesses that use
  the same material split it (before, the first one in line took the whole
  bin). In the background the game stops paying live and pays the time
  away when you come back, with the welcome-back report. Checked on five
  factories over 15 minutes to 24 hours (49-50% of open) and in the app
  (51%).

## In 0.0.18

- **Own 10 of an era to open the next one.** Before, buying one opened the
  next era, and the pacing sim showed players reaching Microprocessors in
  about 36 minutes with only 3-4 upgrades bought. Now the next era shows as
  "???" with a counter (for example 6/10) until you own 10 of the one before
  it. The NEXT buy button stops at 10, and the Next Move hint and the
  tutorial explain it. Pacing sim (nonstop): Microprocessors at about 55
  minutes (72 for a slower player) with about 17 upgrades bought on the way;
  the first prestige stays at about 3 hours and the first fork at about 4
  days. Eras you already own stay open.
- Safer save codes and saves: a compressed code that expands past 4 MB is
  refused instead of freezing the game; challenge and project rewards only
  count real, distinct ones; a research, upgrade or project timer can't be
  longer than a minute, and finishes if the phone's clock is set back; a row's
  start-up timer and the daily streak are kept in range.
- Note: a Speedrun challenge started before your first prestige may not be
  winnable in 90 minutes now; after the first prestige it takes about 30.

- **New era: the Jacquard Loom (c. 1804)**, between the Paper Mill and
  Punch Cards. The first machine run by instructions on punched cards; it
  uses the Paper Mill's card stock. Own icon, the Master Weaver manager,
  two upgrades (Silk Brocade, Steam Drive), two Museum cards (the loom, and
  Ada Lovelace on weaving algebra) and two headlines. The tutorial's
  history step now points at it. Saves that already reached Punch Cards
  get the loom started with its manager (save v7). Pacing sim: the loom
  opens at about 6 minutes; later eras, the first prestige (about 3 hours)
  and the first fork (about 4 days nonstop) are unchanged.
- **Materials gather 1 at a time** per machine until that row's x3 upgrade,
  which now triples the material as well as the pay (it was 3 from the
  start, so the upgrade did little for material rows). When a row runs
  short, a one-time tip and the Next Move hint say which row to feed and
  how (more machines, its manager, or its x3 upgrade).
- **Plain words for new players.** A tester new to idle games found terms
  like prestige, fork and singularity confusing. The game now explains them
  in everyday words: the Investors panel says what starting over does and
  when it unlocks (exact numbers moved behind "Details"), and the confirm
  boxes list what you lose and
  what you keep. Board, Boost, Runs and Research use the same plain words.
- **One-time tips (tutorial part 2):** the first time something new shows
  up (buy modes, the Foreman, upgrades, tokens, research, starting over,
  challenges, forking, the stock bubble) and on the first visit to each tab,
  a short card explains it and outlines it on screen. "No more tips" turns
  them off; More > How to Play turns them back on.
- **"?" buttons** next to game terms open a one-line explanation.
- **How to Play** is now short sections you can open (The basics,
  Materials, Managers, Buying faster, Upgrades, Starting over, What you
  keep forever, Challenges, The bigger reset, While you're away) plus a
  "Words to know" list.
- Fixed: Era Mastery said "permanent", but it lasts for the run.
- The top bar says "earned this run" instead of "lifetime", since that
  number resets when you start over.
- The end of every page now scrolls clear of the tab bar on phones with the
  3-button navigation bar or large text (a tester couldn't read the end of
  How to Play). Page headers on Boost, Board, Runs, Badges and More stay at
  the top while scrolling instead of sliding under the status bar.

## In 0.0.17

- **Tutorial for new players:** an 8-step guided start on the Game screen
  (tap, buy, a new row, materials, hire a manager, the first history era).
  A coach bubble points at one thing at a time and moves on when the player
  does it; it never blocks play. Skip any time; replay from More > How to
  Play. Dilemmas wait until it's over. Existing players aren't shown it.

- The news ticker follows history: each headline belongs to an era and only
  shows once you've reached it, newest era first (no moon landing in 1890).

- **Timber Camp** is the new first row: trees make wood, the Paper Mill turns
  it into card stock for Punch Cards (c. 1890). Sand Quarry and Copper Seam
  now come after Punch Cards, right before the glass and wire that vacuum
  tubes need. Paper went from rags to wood pulp in the 1840s-1880s, so the
  1890 cards were made from trees. Save v6; existing players with a Paper
  Mill get a Timber Camp started with its manager.

## In the closed test build (0.0.15-0.0.16)


- Eras in historical order: Sand Quarry, Copper Seam, **Paper Mill**, Punch
  Cards (c. 1890), **Glassworks**, **Filament Forge**, Vacuum Tubes (c. 1946),
  **Germanium Refinery**, Transistors (c. 1954), Silicon Still, Wafer Bench,
  Integrated Circuits and on. Tubes are made from glass, copper and
  filament; the first transistors from germanium. Four new rows with
  managers, upgrades and Museum cards. Saves are stored by era id (save v5)
  and older saves carry over.
- Managers unlock after owning enough of a row: 5 of the first row, 10 of
  each row up to Wafer Bench, 5 of each era from Integrated Circuits on.
- New games, prestige, challenges and timeline forks start at $0 instead of
  $4 (which couldn't buy anything).
- The header says Tech Evolution Tycoon; the supply strip only shows
  materials you've discovered; "1 wafers" reads "1 wafer".
- Google Play Games sign-in and cloud save (More > Settings > Account). Off
  until the Play Games project id is added; see `docs/play-games.md`.
- The app id is now `tech.evolution.tycoon` (Play Console). Sideloaded
  copies can't update in place: export the save, install, import.

## How the order was chosen

1. **Closed testing first**, while the Play launch is under way (see Now):
   real icons, parody names, tester fixes, sound and settings, investor
   milestones, Play Games, starter goals, Research lab projects and the rest
   of the tab tidy-up, the early history events, chip generations and the
   era arrival screen, and the missing eras (relay computers, mainframes,
   minicomputers, game consoles, the web, cloud and datacenters,
   smartphones, AI accelerators). Chip generations and those new eras are
   paced in closed testing, on the 0.0.22 numbers, so live saves aren't
   re-paced after launch. Investor milestones go out before launch for the
   same reason.
2. **After launch, Phase 1.** Generations on more rows (item 1), then history
   events step 2 with headlines, pioneers and trivia (item 2). Chip
   generations and the era arrival screen moved to closed testing.
3. **Then history on what's already there:** a look and sound for each era
   (item 3) and Focus era (item 4). The missing eras moved to closed testing
   so that pacing change happens once, before launch. Saves store rows by era
   id since 0.0.15, so new eras are safe to add there.
4. **Then the Workbench and parts** (items 5-13), in the order the parts
   appeared in history, as far as their links allow.
5. **Long-term systems last** (items 14-24), once there is enough content to
   collect and replay.

Each numbered item is roughly one release. Items marked "small" can be
folded into a neighbouring release.

## Now: Closed testing (pre-launch)

The 0.0.18 Play bundle is the current closed-test build. Google still needs
at least 12 testers opted in for 14 days in a row, then an application for
production. See `docs/play-store/console-checklist.md`. Phase 1 starts when
the game is live on Google Play after all testing. Work that already shipped
in 0.0.18, or that is merged for 0.0.19, is not repeated here.

- **Real icons** for all 9 placeholder material businesses: Timber Camp,
  Paper Mill, Sand Quarry, Copper Seam, Glassworks, Filament Forge,
  Germanium Refinery, Silicon Still and Wafer Bench, before store screenshots.
- **Approve parody company names.**
- **Bug and balance fixes from testers.** The landscape fixes from testers'
  phones ship in 0.0.19 (see above).
- **Sound pauses in the background**, plus separate music and effects volume.
  Era themes and era music wait for item 3.
- **Feedback and settings.** Floating "+$" on payouts, light vibration on
  buy (can be turned off), hold Buy to preview "+$X per second", number
  style (letters, names, scientific), reduced motion, high contrast and
  colorblind-friendly colors. Plus a **stats page**: lifetime earnings,
  prestige count, best time to each era with a small token reward for beating
  it (these run records move here from the Runs tab), cards collected, play
  time. And a **prestige guide**: the prestige button shows what a prestige
  would give right now ("+340 investors, income x1.8") and lights up once it
  would at least double your investors.
  [Design](ideas.md#first-minutes-and-ui). [Design](ideas.md#mid-game).
- **Play Games sign-in and cloud save.** Add the Android credentials (app
  signing key and upload key SHA-1s), turn on Saved games, add testers, put
  the project id in `strings.xml`, then update the Data safety answers. See
  `docs/play-games.md`.
- **Play Games achievements** for the existing badges (needs achievement ids
  from Play Console).
- **Notifications** (factories full, research done).
- **Starter goals and company name**: name your company at the start
  (shown in headlines and later on the HQ picture), plus a short goal list
  (buy 5 Timber Camps, hire a first manager, unlock the next era) with a
  fixed reward. Also: the last few one-time tips (the first dilemma,
  offline earnings), a quicker first manager, a first-prestige screen that
  shows exactly what you keep and gain, and an "abandon challenge" button
  ship in 0.0.22, with investor milestones and the lower tick rate. Tutorial part 2 shipped in 0.0.18,
  including the "row ran out of materials" tip; 0.0.19 adds a red warning
  on the row itself. Paired with the new tutorial.
  [Design](ideas.md#first-minutes-and-ui).
- **Research lab projects, then the rest of the tab tidy-up**, paired with
  the tutorial. Research became a main tab in the 0.0.19 changes (in Badges'
  old place; Badges and the Museum moved into More). Once every specialty
  slot is filled, data has nothing to buy until the next fork, so a main tab
  sits empty most of the game and dilemma choices that pay data go to waste.
  Add lab projects that spend spare data on the Research tab: a faster
  upgrade install, a short income boost, or data traded for era tokens, each
  at a fixed price shown up front. Then: the Market moves from More to Board,
  so More keeps settings, help and Badges; Badges gets a switcher (Badges ·
  Museum); tabs stay hidden until they have something in them (Boost when the
  first upgrade is affordable, Investors near the first prestige), with
  "something to do" dots. Six tabs, no seventh. Claude's current version of
  the tab tidy-up is the one to follow.
  [Design](ideas.md#tab-layout).
- **History events, step 1: the early eras.** The event system it needs
  ships in 0.0.19: each event names the eras it fits, and real one-time
  events happen once a game (Y2K and the Dot-com Bubble already work this
  way). Before Vacuum Tubes there are only two events (the patent troll and
  the intern), so start there. **Historical contracts**: real kinds of
  customers place a fixed order with a deadline and a set reward, in a set
  order as eras are reached, never random ("Census office: 200 Punch Cards
  in 10 minutes", 1890; then wartime code-breaking and ballistics orders for
  the tube era). Now that materials run out (0.0.19), contracts also give
  the material chain a reason to be built up. Plus the first era events,
  each once a game: the first "bug" (1947, a moth in the Harvard Mark II, a
  dilemma) and Moore's Law (1965, a research upgrade that makes each newer
  era cheaper). Also put the mega-projects in historical order with goals
  that match their era (the 1860s Transcontinental Cable currently needs
  $10B, later than several 1970s-90s projects).
  [Design](ideas.md#mid-game). [Design](ideas.md#hardware-history-events).
- **Chip generations and the era arrival screen.** Microprocessors and
  Graphics Cards evolve as they pass owned-count milestones (8-bit to
  multi-core; 2D card to ray tracing): new name, picture and tagline, a
  small bonus, and a Museum history card. No new rows, so no save
  migration. New eras and new generations both get a short arrival card
  with the year, name, one history line and a sound sting. Re-run the
  pacing sim with generation bonuses stacked on 0.0.22 numbers.
  [Design](ideas.md#chip-generations).
- **Fill the gaps in the timeline.** New eras, each with its own icon,
  manager, two history cards and upgrade names. They go in before launch,
  with the gaps already planned here, so the ladder is paced once and live
  saves aren't re-paced after launch. Parody company names, with the real
  model numbers and specs. Material rows stay where they are (each one still
  sits just before the first era that uses it). The order below is the
  computing eras.

  Full planned computing-era order. Years already in the game are from
  `src/lib/gameConfig.js`:

  Jacquard Loom (c. 1804) > Punch Cards (c. 1890) > Relay Computers
  (c. 1941-44) > Vacuum Tubes (c. 1946) > Mainframes (c. 1951) >
  Transistors (c. 1954) > Integrated Circuits (c. 1965) > Minicomputers
  (c. 1965-70) > Microprocessors (c. 1971) > Home Computers (c. 1977) >
  Game Consoles (c. 1977-94+) > Dial-up / WWW (mid-1990s) > Graphics Cards
  (c. 1999) > Cloud and Datacenters (c. 2006) > Smartphones (2007 era) >
  RGB Battlestations (c. 2015) > AI Accelerators (2016) > Quantum Servers
  (c. 2019).

  Order is by each row's anchor year. Where two rows share a year, the one
  with the earlier first shipment stays first.

  Still to add, in that order:
  - Relay Computers (c. 1941-44), after Punch Cards and before the tube
    materials (Sand Quarry, Copper Seam, Glassworks, Filament Forge) and
    Vacuum Tubes. Zuse Z3 (1941) and Harvard Mark I (1944), under parody
    maker names.
  - Mainframes (c. 1951, the first commercial computers), after Vacuum
    Tubes and before the Germanium Refinery. Punch Cards moved to 1890, so
    the 1950s mainframe years are a gap. Generations on this row, including
    the supercomputers, are item 1.
  - Minicomputers (c. 1965-70), after Integrated Circuits (c. 1965) and
    before Microprocessors (c. 1971). PDP-8 (1965) and PDP-11 (1970), as a
    parody of DEC. Both rows are anchored in 1965. Commercial integrated
    circuits were already on sale in March 1961; the PDP-8 was introduced
    on 22 March 1965 and the first machines were delivered that summer, so
    the IC row stays first.
  - Game Consoles (c. 1977-94+), after Home Computers (c. 1977) and before
    dial-up. Atari 2600 (1977), NES (1985; the Japanese original in 1983),
    PlayStation (1994) and later, under parody maker names. Both rows open
    in 1977. The Apple II shipped on 10 June 1977 and the Atari 2600 on
    11 September 1977, so Home Computers stays first. Later consoles stay
    on this row; its place on the ladder is its start.
  - Mid-1990s: dial-up internet and the World Wide Web, after Game Consoles
    and before Graphics Cards (c. 1999). The first public website is 6
    August 1991, still inside this slot.
  - Cloud and Datacenters (c. 2006), after Graphics Cards (c. 1999) and
    before Smartphones (2007). Rented virtual storage went on sale in March
    2006; the 2007 phone shipped in June 2007. Parody of the big cloud
    hosts.
  - Smartphones, the 2007 era, after Cloud and Datacenters and before RGB
    Battlestations (c. 2015). A parody of the 2007 original phone, with the
    real specs (412 MHz ARM11, 128 MB RAM, 3.5-inch 320×480), its own
    manager, two Museum cards, and upgrades such as multi-touch and an app
    store. Generations on this row are item 1, in year order, starting with
    the 1983 brick phone and the 1990s feature phones, then this 2007 phone.
  - AI accelerators (2016), after RGB Battlestations (c. 2015) and before
    Quantum Servers (c. 2019). The TPU was announced in May 2016 after
    running inside Google through 2015. RGB lighting was already on sale in
    July 2012, and this game's RGB row is anchored at c. 2015, so AI stays
    after that row.
  The Jacquard loom (1804) shipped in 0.0.18.
  The office PC (1981), graphical desktops (1984) and laptops are covered
  by Home Computers generations (item 1) instead. Saves store rows by era
  id, so new rows can go anywhere. Re-run the pacing sim after, and
  re-check investor milestones and first-prestige timing, so live saves
  aren't re-paced after launch.

## Next: phase 1, after launch

Starts when the game is live on Google Play after all testing. First
post-launch content. [Design](ideas.md#more-row-generations).

1. **Generations on more rows**, using the same system. Parody company
   names, real model numbers and specs. In year order inside each row:
   - **Mainframes** (the row opens in closed testing, c. 1951): UNIVAC I
     (1951), the mid-1950s machines, CDC 6600 (delivered September 1964),
     System/360 (announced 7 April 1964, first delivered April 1965),
     Cray-1 (delivered 4 March 1976). The 6600 and System/360 share 1964;
     the 6600 was delivered first, so it comes first. The Cray-1 is the
     later supercomputer generation on this same row.
   - **Home Computers:** the Altair 8800 kit (1975) first, then the 8-bit
     micro (1977), office PC (1981), graphical desktop (1984) and laptop
     (late 1980s). Once generations are on, one owned shows the 1975 kit.
   - **Smartphones:** Motorola DynaTAC brick phone (1983), then 1990s
     feature and flip phones, then the 2007 smartphone, then the 4G
     phablet (early 2010s), wearables (fitness trackers and smartwatches,
     c. 2015) and the foldable (2019). The 2015 wearables come before the
     2019 foldable. The closed-testing row is the 2007 phone; with generations
     on, the row starts as the 1983 brick and reaches that phone later.
     The 1990s feature phones come before the 2007 phone.
   - **RGB Battlestations** (era c. 2015): glass-panel RGB tower
     (mid-2010s), custom liquid loop, compact small-form-factor build
     (2020s). The LAN-party tower predates this era's 2015 date, so it
     belongs to the history events instead.
   [Design](ideas.md#more-row-generations).

2. **History events, step 2, with headlines, pioneers and trivia.** The
   rest of the history events, each tied to its eras and in the order they
   happened: Ethernet (the 1973 experimental network, then the 1980
   standard), TCP/IP flag day (1 January 1983), the 1983 video game crash,
   floppies to CDs (early-mid 1990s), Wi-Fi (802.11 in 1997, 802.11b in
   1999) and home broadband, LAN parties (late 1990s-2000s), the
   bad-capacitor years (about 2000-2007), the hard-drive shortage (2011
   floods), the memory price spike (2017-2018), GPU mining rushes
   (2017-2018 and 2021) and the 2021 chip shortage; plus contracts for the
   later eras ("Moon program: 150 Integrated Circuits", 1960s). One event
   at a time, fixed effects shown up front. Text-only extras in the same
   release: more headlines per era (the ticker already follows the era
   being built, since 0.0.17), pioneer notes on history cards (Ada
   Lovelace, Grace Hopper and others), kept factual, with managers staying
   fictional job titles, and "Which came first?" trivia as an occasional
   dilemma paying a bonus for a right answer.
   [Design](ideas.md#hardware-history-events).

## Next: phase 2, history on what's already there

3. **A look and sound for each era.** Unlockable screen themes (green
   phosphor terminal, beige desktop, CRT, neon RGB) and era sounds. Music
   follows the furthest era for now (PC speaker beeps, early FM synth,
   wavetable/MIDI, CD audio, modern mix); the Workbench sound card takes
   over later (item 11). Sound pause and separate volume sliders are in
   closed testing, not here. Original sounds only; no real logos or startup sounds.
   [Design](ideas.md#sound-and-music).

4. **Focus era.** At the start of a run, pick one era to get x3 for that
    run (rush the early chain or boost a late era; no chance). Best times
    per era, with a small token reward for beating one, live on the stats
    page in closed testing. [Design](ideas.md#mid-game).

## Next: phase 3, the PC workbench

**Rules for all parts:** parody or fictional names only, including for
defunct companies and product lines; real dates and specs; parts fit only
where they fit in real life; no chance-based outcomes; locked parts stay
"???". Check every date against a source before shipping.

5. **PC workbench.** A Workbench view on the Boost tab with part slots
    (processor, graphics, memory, storage, display, cooling, power supply,
    case). A finished build gives an empire-wide bonus that grows with the
    build. The build is drawn as a layered pixel-art PC: each installed part
    swaps its own layer (cooler, graphics card, memory, drives, monitor),
    and the Case slot changes the look by period (beige desktop box, beige
    tower, black tower with a window, glass RGB case), with see-through
    cases showing the parts. About 45 sprites on one grid to start; placeholder
    shapes until the art exists; the sprite list is in
    `docs/art/pc-build-sprites.md`. [Design](ideas.md#pc-workbench).

6. **Parts catalog, step 1: the core build.** Workbench parts from parody
    makers, real dates and specs, real compatibility (rules above). Slots:
    motherboard, processor, graphics, memory, storage, power supply, cooling
    and case, plus a parts bin and the Bench Score.
    - **Motherboard** sets everything else: its form factor (AT 1984, ATX
      1995, micro-ATX 1997, mini-ITX 2001) decides the number of memory and
      expansion slots and which cases it fits; its socket, memory type, drive
      connectors and graphics bus decide which parts install.
    - **Processors** fit by socket or slot type (several makers' chips shared
      one socket in the mid-1990s; the 1997-1999 cartridge slots were
      maker-specific). **Graphics cards** fit by bus (ISA, local bus, PCI, AGP,
      PCI Express).
    - **Memory** by real type: 30-pin and 72-pin SIMMs, DIMMs, DDR (2000),
      DDR2 (2003), DDR3 (2007), DDR4 (2014), DDR5 (2020). Early boards need
      SIMMs in matched sets to work at all; from the early 2000s a matched
      pair gives a small dual-channel bonus.
    - **Storage and cables, from the start:** room-sized disk units of the
      1950s that held a few megabytes, early PC hard drives of a few to tens
      of megabytes on two ribbon cables each, then wider single cables, IDE
      ribbons (two drives per cable), SATA (2003), SSDs and M.2 sticks. Each
      drive needs the matching connector on the board. Floppy and tape too.
    - **Cooling** from bare heatsinks to fans, tower coolers, homemade water
      kits and ready-made liquid coolers. It sets the overclock cap.
    - **Power supply and overclocking:** every part has a real-style power
      draw and the Power Supply slot sets the wattage and plugs (two 6-pin
      board plugs in the early PC and AT years, 20-pin with ATX in 1995, an
      extra 4-pin processor plug in 2000, 24-pin from 2003-04, then graphics
      card plugs), so a supply only fits boards of its time; a part that would
      overload the supply won't install, and the game says why ("needs 550 W,
      your supply gives 300 W"). Overclock levels (Stock, Mild, Strong,
      Extreme) add a small bonus (about 5-15% at most); the top level allowed
      is the lower of spare wattage and cooling tier. Fixed outcomes shown up
      front, no random crashes.
    - **Bench Score** for the whole build (generic name; the well-known
      benchmark names are trademarks). Performance parts raise it; the
      weakest part and power or cooling limits hold it back. The income bonus
      comes from score bands, so it stays small and predictable.
    - **Parts bin:** every part collected stays available to swap back in;
      parts that don't fit the current board are greyed out with the reason.
    [Design](ideas.md#parts-catalog).

7. **Monitors.** From green and amber text screens (late 1970s-80s) to
    color CRTs (640x480 in 1987), bigger CRTs, flat LCDs (mid-2000s),
    high-refresh screens (2010s) and OLED, with real resolution steps capping
    what a strong graphics card adds. First after the core build because the
    screen is the oldest part of the picture. VR/AR headsets are a branch of
    this display slot, in year order with those screens: a developer kit in
    the style of the Oculus DK1 (2012; first units shipped in 2013), then
    consumer headsets from 2016, before OLED. Parody maker names, with the
    real model numbers and specs. A headset installs in the display slot once
    its year is reached, the same way a monitor does.
    [Design](ideas.md#monitors-and-cooling).

8. **Parts catalog, step 2: expansion slots** (the PC's add-in slots date
    from 1981). In the order they appeared: modem cards (1980s to the
    dial-up years of the 1990s), network cards (1980s offices, then the
    LAN-party years), add-in sound cards (essential from the
    late 1980s, optional once sound moved onto boards around 2000), then a
    second graphics card (it only pays off with late-1990s to 2010s parts,
    when running two cards was a real thing, then fades as it did; linked
    the way it really was: a ribbon inside the case in 1998, a bridge on top
    from 2004, the red maker's external cable in 2005, then ribbon bridges,
    then through the board itself from 2013, under generic names). Number of
    slots comes from the motherboard. [Design](ideas.md#expansion-slots).

9. **Jumper puzzle** (small, with item 8): from the first PCs (1981) until
    plug-and-play (about 1995), set jumpers and DIP switches and sort out
    two cards wanting the same setting. Fixed answers; goes away once plug-and-play arrives.
    [Design](ideas.md#jumper-puzzle).

10. **Optical drives.** CD-ROM drives reached home PCs in the late 1980s
    and early 1990s, then the 1x-to-52x speed race, burners (late 1990s),
    DVD, Blu-ray (late 2000s), then fading out in the 2010s. They share IDE
    cables with hard drives, jumpered as master or slave, so they follow the
    jumper puzzle. [Design](ideas.md#optical-drives).

11. **Boot screens and hardware sound.** A short start-up screen per era
    (memory count-up, beep, parody OS logo) when the Workbench PC powers on.
    The installed sound card now picks the music style, and parts make
    their sounds: floppy grind on save, drive seek clicks, modem handshake,
    CRT thunk and whine, fan hum that rises with overclock, era keyboard
    clacks. After sound cards and optical drives, since the music styles
    need them (CD audio needs a CD drive). [Design](ideas.md#boot-screens).

12. **Parts catalog, step 3: colors and collecting.** Period color schemes
    as cosmetic variants (green boards in the '90s, red or blue gaming
    boards in the 2000s, black in the 2010s, colored memory heat spreaders,
    RGB). They add to the Bench Score's collection points and the Museum,
    not to earnings. Made by recoloring sprites, so little extra art. Case
    lighting follows the real order: window panels, cold cathode tubes in
    the early-mid 2000s (one color per tube), single-color LED fans, then
    RGB and finally per-LED RGB. [Design](ideas.md#colors-and-collecting).

13. **Period build challenges**: "Build a 1996 gaming PC" with only parts
    from that year, for a badge and a Museum card, plus a weekly one that is
    the same for everyone (full reward even when late). Last in this phase
    because it needs the whole catalog. [Design](ideas.md#period-build-challenges).

## Later: phase 4, long term

In this order. [Design](ideas.md#long-term).

14. **Garage-to-campus HQ**: a picture of the company that grows with
    lifetime earnings: garage, office park, campus, space-age HQ.

15. **Parody rival companies** racing through history at a fixed, visible
    pace; beating one to an era pays a bonus and a Museum card.

16. **History anniversaries** on the real calendar: a short event with a
    fixed cosmetic or Museum card on the day.

17. **Museum completion**: a timeline wall; finishing an era's set pays.
    Vintage parts (retired parts become "vintage" after a fixed number of
    game years) go on its shelves. [Design](ideas.md#vintage-parts).

18. **Desk scene**: keyboards (clicky, then rubber-dome, then the mechanical
    comeback), mice (ball, then optical around 1999), modems (300 baud to
    56k in 1998, then broadband) and speakers around the PC.
    [Design](ideas.md#desk-scene).

19. **More research uses for data**: era research (a small permanent
    per-era upgrade ladder that keeps soaking up data), archive research
    (reveal one "???" Museum card or generation early, name and year only)
    and forecasting (see the next event or dilemma a few minutes ahead).
    Fixed prices, no chance. [Design](ideas.md#tab-layout).

20. **Third prestige layer** ("Legacy" or similar) kept through everything:
    starting eras, Workbench slots, challenge modes.

21. **Parts as materials**: later eras use up chips, memory and drives made
    by earlier rows, so the supply chain matters again. Biggest balance
    change of the hardware ideas; needs full pacing tests.
    [Design](ideas.md#parts-as-materials).

22. **Software track**: rows for programming languages, operating systems
    and game eras alongside the hardware, each boosting the other.

23. **Space Age world**, using the draft in `src/lib/worldSpace.js`.

24. **Free-build mode** after the last era, with everything collected.

Also, whenever the text settles: translations.

Also, whenever the text settles: translations.
