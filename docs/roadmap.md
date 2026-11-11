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

## Merged, ships in the next release (0.0.15)

- Eras in historical order: Sand Quarry, Copper Seam, **Paper Mill**, Punch
  Cards (c. 1890), **Glassworks**, **Filament Forge**, Vacuum Tubes (c. 1946),
  **Germanium Refinery**, Transistors (c. 1954), Silicon Still, Wafer Bench,
  Integrated Circuits and on. Tubes are made from glass, copper and
  filament; the first transistors from germanium. Four new rows with
  managers, upgrades and Museum cards. Saves are stored by era id (save v5)
  and older saves carry over.
- Managers unlock after owning enough of a row: 5 Sand Quarries, 10 of each
  row up to Wafer Bench, 5 of each era from Integrated Circuits on.
- New games, prestige, challenges and timeline forks start at $0 instead of
  $4 (which couldn't buy anything).
- The header says Tech Evolution Tycoon; the supply strip only shows
  materials you've discovered; "1 wafers" reads "1 wafer".
- Google Play Games sign-in and cloud save (More > Settings > Account). Off
  until the Play Games project id is added; see `docs/play-games.md`.
- The app id is now `tech.evolution.tycoon` (Play Console). Sideloaded
  copies can't update in place: export the save, install, import.

## How the order was chosen

1. **The Play Store launch first**, because it is already under way (see
   Now).
2. **New players next.** The opening minutes decide whether people keep
   playing, and these items are small. Shipping them during the closed test
   also gives the production application real changes to report.
3. **Mid-game goals right after**: investor milestones (item 4) give every
   prestige something to unlock, before more content is added.
4. **Content on systems that already exist** (generations, events, sound),
   then the missing eras in one release (item 10), so pacing changes once.
   Saves store rows by era id since 0.0.15, so new eras are safe after
   launch.
5. **Then the Workbench and parts**, the biggest feature, in the order the
   parts appeared in history, as far as their links allow.
6. **Long-term systems last**, once there is enough content to collect and
   replay.

Each numbered item is roughly one release. Items marked "small" can be
folded into a neighbouring release.

## Now: Google Play launch (in progress)

- **Closed test.** The app bundle is uploaded. Google needs at least 12
  testers opted in for 14 days in a row before applying for production.
  Collect feedback during the test; the production application asks what
  changed because of it. See `docs/play-store/console-checklist.md`.
- **0.0.15 release** with everything in "Merged" above, version bumped so
  it isn't confused with the GitHub 0.0.14.
- **Switch on Play Games:** add the Android credentials (app signing key
  and upload key SHA-1s), turn on Saved games, add testers, put the project
  id in `strings.xml`, then update the Data safety answers. See
  `docs/play-games.md`.
- **Play Games achievements** for the existing badges (needs achievement ids
  from Play Console).
- **Play build without the sideload updater** and its install permission.
- **Real art** for the four new material icons (Paper Mill, Glassworks,
  Filament Forge, Germanium Refinery are placeholders), before store
  screenshots.
- Later in this group: notifications (factories full, research done).

## Next: phase 1, the first minutes and the mid game

[Design](ideas.md#first-minutes-and-ui).

1. **Starter goals and company name.** Name your company at the start
   (shown in headlines and later on the HQ picture), plus a short goal list
   (buy 5 quarries, hire a first manager, unlock the next era) with a fixed
   reward. Also: a quicker first manager, a first-prestige screen that shows
   exactly what you keep and gain, an "abandon challenge" button, and a
   lower game tick rate to save battery.
2. **Tidy up the tabs, and show them when needed.** Research moves from More
   to Boost, the Market moves from More to Board, More keeps only settings
   and help. Boost gets a switcher (Upgrades · Research, later Workbench)
   and Badges gets one (Badges · Museum). No seventh tab. Tabs stay hidden
   until they have something in them (Boost when the first upgrade is
   affordable, Investors near the first prestige), with "something to do"
   dots. Done together because both change the same tab bar.
   **Uses for spare data:** once every specialty slot is filled, data has
   nothing to buy until the next fork, so dilemma choices that pay data go
   to waste. With Research moving to Boost, add lab projects that spend
   spare data: a faster upgrade install, a short income boost, or data
   traded for era tokens, each at a fixed price shown up front.
   [Design](ideas.md#tab-layout).
3. **Feedback and settings.** Floating "+$" on payouts, light vibration on
   buy (can be turned off), hold Buy to preview "+$X per second", number
   style (letters, names, scientific), reduced motion, high contrast and
   colorblind-friendly colors. Plus a **stats page** (small): lifetime
   earnings, prestige count, fastest run to each era, cards collected, play
   time. And a **prestige guide** (small): the prestige button shows what a
   prestige would give right now ("+340 investors, income x1.8") and lights
   up once it would at least double your investors.
   [Design](ideas.md#mid-game).
4. **Investor milestones.** Fixed investor counts that unlock things for
   good, shown on the prestige screen as "Next unlock at 1,000 investors":
   start runs with Sand Quarries, material-row managers kept through
   prestige, auto-buy for upgrades, a longer offline cap (24 h to 36 h to
   48 h), start runs at a later era. Replaces the separate investor upgrade
   shop. Gives every prestige in the mid game (first prestige to first
   fork) something to aim for. Re-run the pacing sim.
   [Design](ideas.md#mid-game).

## Next: phase 2, history on what's already there

5. **Chip generations and the era arrival screen.** Microprocessors and
   Graphics Cards evolve as they pass owned-count milestones (8-bit to
   multi-core; 2D card to ray tracing): new name, picture and tagline, a
   small bonus, and a Museum history card. No new rows, so no save
   migration. New eras and new generations both get a short arrival card
   with the year, name, one history line and a sound sting.
   [Design](ideas.md#chip-generations).
6. **Generations on more rows**, using the same system: Home Computers
   (8-bit micro 1977, office PC 1981, graphical desktop 1984, laptop late
   1980s) and RGB Battlestations (glass-panel RGB tower mid-2010s, custom
   liquid loop, compact small-form-factor build 2020s). The LAN-party tower
   predates this era's 2015 date, so it belongs to the history events
   instead.
   [Design](ideas.md#more-row-generations).
7. **Headlines, pioneers and trivia** (small, text only). The ticker shows
   headlines from the era being built; pioneer notes on history cards (Ada
   Lovelace, Grace Hopper and others), kept factual, with managers staying
   fictional job titles; "Which came first?" trivia as an occasional
   dilemma paying a bonus for a right answer.
8. **History events.** One event system for all of them, one event at a
   time, fixed effects shown up front. In the order they happened, each
   appearing only once its era is reached:
   - The first "bug" (1947): a moth found in the Harvard Mark II. A dilemma.
   - Moore's Law (1965): a research upgrade that makes each newer era
     cheaper.
   - The 1983 video game crash.
   - Floppies to CDs (early-mid 1990s).
   - LAN parties (late 1990s-2000s).
   - Y2K (1999).
   - The bad-capacitor years (about 2000-2007).
   - The hard-drive shortage (2011 floods).
   - The memory price spike (2017-2018).
   - GPU mining rushes (2017-2018 and 2021) and the 2021 chip shortage.
   **Historical contracts** use the same system: real kinds of customers
   place a fixed order with a deadline and a set reward ("Census office:
   200 Punch Cards in 10 minutes", 1890; "Moon program: 150 Integrated
   Circuits", 1960s), in a set order as eras are reached, never random.
   Also put the mega-projects in historical order with goals that match
   their era (the 1860s Transcontinental Cable currently needs $10B, later
   than several 1970s-90s projects). [Design](ideas.md#mid-game).
   [Design](ideas.md#hardware-history-events).
9. **A look and sound for each era.** Unlockable screen themes (green
   phosphor terminal, beige desktop, CRT, neon RGB) and era sounds. Music
   follows the furthest era for now (PC speaker beeps, early FM synth,
   wavetable/MIDI, CD audio, modern mix); the Workbench sound card takes
   over later (item 18). Separate music and effects volume; sound pauses in
   the background. Original sounds only; no real logos or startup sounds.
   [Design](ideas.md#sound-and-music).

10. **Fill the gaps in the timeline.** New eras, each with its own icon,
   manager, two history cards and upgrade names, in historical order:
   - Before punch cards: the Jacquard loom (1804), which used punched cards
     to weave patterns.
   - After the tubes: mainframes (c. 1951, the first commercial computers),
     before the Germanium Refinery. Punch Cards moved to 1890, so the
     1950s mainframe years are now a gap.
   - Mid-1990s: dial-up internet and the World Wide Web.
   - 2007: smartphones.
   - Mid-2010s to 2020s: AI accelerators, just before Quantum (c. 2019).
   The office PC (1981), graphical desktops (1984) and laptops are covered
   by Home Computers generations (item 6) instead. Saves store rows by era
   id, so new rows can go anywhere. Re-run the pacing sim after.

11. **Focus era and run records.** At the start of a run, pick one era to
    get x3 for that run (rush the early chain or boost a late era; no
    chance). The Runs tab keeps your best time to reach each era, with a
    small token reward for beating it. [Design](ideas.md#mid-game).

## Next: phase 3, the PC workbench

**Rules for all parts:** parody or fictional names only, including for
defunct companies and product lines; real dates and specs; parts fit only
where they fit in real life; no chance-based outcomes; locked parts stay
"???". Check every date against a source before shipping.

12. **PC workbench.** A Workbench view on the Boost tab with part slots
    (processor, graphics, memory, storage, display, cooling, power supply,
    case). A finished build gives an empire-wide bonus that grows with the
    build. The build is drawn as a layered pixel-art PC: each installed part
    swaps its own layer (cooler, graphics card, memory, drives, monitor),
    and the Case slot changes the look by period (beige desktop box, beige
    tower, black tower with a window, glass RGB case), with see-through
    cases showing the parts. About 45 sprites on one grid to start; placeholder
    shapes until the art exists; the sprite list is in
    `docs/art/pc-build-sprites.md`. [Design](ideas.md#pc-workbench).
13. **Parts catalog, step 1: the core build.** Workbench parts from parody
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
14. **Monitors.** From green and amber text screens (late 1970s-80s) to
    color CRTs (640x480 in 1987), bigger CRTs, flat LCDs (mid-2000s), high
    refresh and OLED, with real resolution steps capping what a strong
    graphics card adds. First after the core build because the screen is the
    oldest part of the picture. [Design](ideas.md#monitors-and-cooling).
15. **Parts catalog, step 2: expansion slots** (the PC's add-in slots date
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
16. **Jumper puzzle** (small, with item 15): from the first PCs (1981) until
    plug-and-play (about 1995), set jumpers and DIP switches and sort out
    two cards wanting the same setting. Fixed answers; goes away once plug-and-play arrives.
    [Design](ideas.md#jumper-puzzle).
17. **Optical drives.** CD-ROM drives reached home PCs in the late 1980s
    and early 1990s, then the 1x-to-52x speed race, burners (late 1990s),
    DVD, Blu-ray (late 2000s), then fading out in the 2010s. They share IDE
    cables with hard drives, jumpered as master or slave, so they follow the
    jumper puzzle. [Design](ideas.md#optical-drives).
18. **Boot screens and hardware sound.** A short start-up screen per era
    (memory count-up, beep, parody OS logo) when the Workbench PC powers on.
    The installed sound card now picks the music style, and parts make
    their sounds: floppy grind on save, drive seek clicks, modem handshake,
    CRT thunk and whine, fan hum that rises with overclock, era keyboard
    clacks. After sound cards and optical drives, since the music styles
    need them (CD audio needs a CD drive). [Design](ideas.md#boot-screens).
19. **Parts catalog, step 3: colors and collecting.** Period color schemes
    as cosmetic variants (green boards in the '90s, red or blue gaming
    boards in the 2000s, black in the 2010s, colored memory heat spreaders,
    RGB). They add to the Bench Score's collection points and the Museum,
    not to earnings. Made by recoloring sprites, so little extra art. Case
    lighting follows the real order: window panels, cold cathode tubes in
    the early-mid 2000s (one color per tube), single-color LED fans, then
    RGB and finally per-LED RGB. [Design](ideas.md#colors-and-collecting).
20. **Period build challenges**: "Build a 1996 gaming PC" with only parts
    from that year, for a badge and a Museum card, plus a weekly one that is
    the same for everyone (full reward even when late). Last in this phase
    because it needs the whole catalog. [Design](ideas.md#period-build-challenges).

## Later: phase 4, long term

In this order. [Design](ideas.md#long-term).

21. **Garage-to-campus HQ**: a picture of the company that grows with
    lifetime earnings: garage, office park, campus, space-age HQ.
22. **Parody rival companies** racing through history at a fixed, visible
    pace; beating one to an era pays a bonus and a Museum card.
23. **History anniversaries** on the real calendar: a short event with a
    fixed cosmetic or Museum card on the day.
24. **Museum completion**: a timeline wall; finishing an era's set pays.
    Vintage parts (retired parts become "vintage" after a fixed number of
    game years) go on its shelves. [Design](ideas.md#vintage-parts).
25. **Desk scene**: keyboards (clicky, then rubber-dome, then the mechanical
    comeback), mice (ball, then optical around 1999), modems (300 baud to
    56k in 1998, then broadband) and speakers around the PC.
    [Design](ideas.md#desk-scene).
26. **More research uses for data**: era research (a small permanent
    per-era upgrade ladder that keeps soaking up data), archive research
    (reveal one "???" Museum card or generation early, name and year only)
    and forecasting (see the next event or dilemma a few minutes ahead).
    Fixed prices, no chance. [Design](ideas.md#tab-layout).
27. **Third prestige layer** ("Legacy" or similar) kept through everything:
    starting eras, Workbench slots, challenge modes.
28. **Parts as materials**: later eras use up chips, memory and drives made
    by earlier rows, so the supply chain matters again. Biggest balance
    change of the hardware ideas; needs full pacing tests.
    [Design](ideas.md#parts-as-materials).
29. **Software track**: rows for programming languages, operating systems
    and game eras alongside the hardware, each boosting the other.
30. **Space Age world**, using the draft in `src/lib/worldSpace.js`.
31. **Free-build mode** after the last era, with everything collected.

Also, whenever the text settles: translations.
