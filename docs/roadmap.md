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
  version and signer checks before install. Signing key out of the repo.
- **0.0.12** - Save backup: export a save code, restore from one.
- **0.0.13** - Display and polish: locked badges, upgrades, Museum rows and
  projects stay hidden until discovered; badge pictures fit their frames;
  slower news ticker that pauses when held; landscape layout (full-width era
  cards, side column stays put, COLLECT always visible); long era names,
  buy-mode labels, Boost tags and Board values fit on narrow phones and with
  large text. Checked with a layout test of every screen at 26 screen sizes,
  portrait and landscape, and text sizes 85-200%.

## To change

Nothing open. The display and polish list from playtesting and the layout
test shipped in 0.0.13 (see Done).

## Next: PC hardware

In this order. Designs in [`docs/ideas.md`](ideas.md).

1. **Chip generations inside the Microprocessors and Graphics Cards eras.**
   As a row passes owned-count milestones it evolves (8-bit to multi-core;
   2D card to ray tracing): new name, picture and tagline, a small bonus, and
   a Museum history card. No new rows, so no save migration and little
   pacing change. [Design](ideas.md#chip-generations).
2. **PC workbench.** A new screen with part slots (processor, graphics,
   memory, storage, display, cooling). Each slot upgrades through
   generations; a finished build gives an empire-wide bonus that grows with
   the build. A long-term goal that doesn't touch the era ladder or saves.
   [Design](ideas.md#pc-workbench).
3. **Generations on more rows**, using the system from item 1: Home
   Computers (8-bit micro, office PC, graphical desktop, laptop) and RGB
   Battlestations (LAN-party tower, liquid cooling, mini PC). Can ship
   alongside item 2. [Design](ideas.md#more-row-generations).
4. **Hardware history events**: memory price spike, hard-drive shortage, the
   switch from floppies to CDs. One part pays more for a while. Can ship
   alongside item 2. [Design](ideas.md#hardware-history-events).

## Next: history theme

1. **Fill the gaps in the timeline.** New eras, each with its own icon,
   manager, two history cards and upgrade names:
   - Before the tubes: the Jacquard loom (1804) and Hollerith's census
     tabulator (1890). Punch cards are older than tube computers.
   - 1981: the office PC.
   - 1984: mouse-driven graphical desktops.
   - Mid-1990s: dial-up internet and the World Wide Web.
   - 2007: smartphones.
   - 2020s: AI accelerators, just before Quantum.
   Note: `biz` is saved by position, so inserting eras needs a save migration
   that maps old rows to era ids first. Re-run the pacing sim after. Some of
   these (office PC, graphical desktops, laptops) could instead be
   generations of Home Computers (PC hardware, item 3).
2. **More events from real history.**
   - Moore's Law (1965): a research upgrade that makes each newer era cheaper.
   - The first "bug" (1947): a moth found in the Harvard Mark II. A dilemma.
   - 1983 video game crash, 2021 chip shortage, GPU mining rush: shortage
     events where one era costs more and pays more for a while.
3. **A look and sound for each era.** Unlockable screen themes (green
   phosphor terminal, beige desktop, CRT, neon RGB) and era sounds (tube hum,
   card punch, floppy drive, modem screech). Make original versions; don't copy
   real logos or startup sounds.
4. **Era-specific headlines.** The ticker shows headlines from the era the
   player is building.
5. **"Which came first?" trivia** as an occasional dilemma, paying a bonus for
   a right answer.
6. **Pioneer notes** on history cards (Ada Lovelace, Grace Hopper and others),
   kept factual. Managers stay fictional job titles.

## Later: systems and polish

- Parts as materials: later eras use up chips, memory and drives made by
  earlier rows, so the supply chain matters again. Biggest balance change of
  the hardware ideas; needs full pacing tests.
  [Design](ideas.md#parts-as-materials).
- Investor upgrade shop (a second use for investors).
- Space Age world, using the draft in `src/lib/worldSpace.js`.
- Cloud save (export/import codes shipped in 0.0.12).
- A Play Store build without the sideload updater and its install permission.
- Notifications (factories full, research done).
- Lower the game tick rate to save battery.
- An "abandon challenge" button.
