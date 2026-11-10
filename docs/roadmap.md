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

**Rules for all parts:** parody or fictional names only, including for
defunct companies and product lines; real dates and specs; parts fit only
where they fit in real life; no chance-based outcomes; locked parts stay
"???". Check every date against a source before shipping.

1. **Chip generations inside the Microprocessors and Graphics Cards eras.**
   As a row passes owned-count milestones it evolves (8-bit to multi-core;
   2D card to ray tracing): new name, picture and tagline, a small bonus, and
   a Museum history card. No new rows, so no save migration and little
   pacing change. [Design](ideas.md#chip-generations).
2. **Tidy up the tabs** so each answers one question, before the Workbench
   needs a home. Research moves from More to Boost, the Market moves from
   More to Board, More keeps only settings and help. Boost gets a switcher
   (Upgrades · Research, later Workbench) and Badges gets one (Badges ·
   Museum). No seventh tab. [Design](ideas.md#tab-layout).
3. **PC workbench.** A Workbench view on the Boost tab with part slots
   (processor, graphics, memory, storage, display, cooling, power supply,
   case). Each slot
   upgrades through generations; a finished build gives an empire-wide bonus
   that grows with the build. A long-term goal that doesn't touch the era
   ladder or saves. The build is drawn as a layered pixel-art PC: each
   installed part swaps its own layer (cooler, graphics card, memory, drives,
   monitor), and the Case slot changes the look by period (beige desktop
   box, beige tower, black tower with a window, glass RGB case), with
   see-through cases showing the parts. About 30-35 sprites on one grid;
   placeholder shapes until the art exists. [Design](ideas.md#pc-workbench).
4. **Parts catalog, step 1: the core build.** Workbench parts from parody
   makers, real dates and specs, real compatibility (rules below). Slots:
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
     DDR2 (2003), DDR3 (2007), DDR4 (2014), DDR5 (2020). Matched pairs give a
     small dual-channel bonus.
   - **Storage and cables, from the start:** room-sized disk units of the
     1950s that held a few megabytes, early PC hard drives of a few to tens
     of megabytes on two ribbon cables each, then wider single cables, IDE
     ribbons (two drives per cable), SATA (2003), SSDs and M.2 sticks. Each
     drive needs the matching connector on the board. Floppy and tape too.
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
5. **Parts catalog, step 2: expansion slots.** A second graphics card (it
   only pays off with mid-2000s to 2010s parts, when running two cards was a
   real thing, then fades as it did; linked the way it really was: a ribbon
   inside the case in 1998, a bridge on top from 2004, the red maker's
   external cable in 2005, then ribbon bridges, then through the board itself
   from 2013, under generic names), add-in sound cards (essential from the
   late 1980s, optional once sound moved onto boards around 2000) and
   network cards. Number of slots comes from the motherboard.
   [Design](ideas.md#expansion-slots).
6. **Parts catalog, step 3: colors and collecting.** Period color schemes as
   cosmetic variants (green boards in the '90s, red or blue gaming boards in
   the 2000s, black in the 2010s, colored memory heat spreaders, RGB). They
   add to the Bench Score's collection points and the Museum, not to
   earnings. Made by recoloring sprites, so little extra art.
   Case lighting follows the real order: window panels, cold cathode
   tubes in the early-mid 2000s (one color per tube), single-color LED fans,
   then RGB and finally per-LED RGB. [Design](ideas.md#colors-and-collecting).

7. **Generations on more rows**, using the system from item 1: Home
   Computers (8-bit micro, office PC, graphical desktop, laptop) and RGB
   Battlestations (LAN-party tower, liquid cooling, mini PC). Can ship
   alongside item 3. [Design](ideas.md#more-row-generations).
8. **Hardware history events**: memory price spike, hard-drive shortage, the
   switch from floppies to CDs, LAN parties, Y2K, the bad-capacitor years.
   One part pays more for a while. Can ship
   alongside item 3. [Design](ideas.md#hardware-history-events).
9. **Period build challenges**: "Build a 1996 gaming PC" with only parts
   from that year, for a badge and a Museum card. Uses the parts catalog and
   the existing challenges. [Design](ideas.md#period-build-challenges).
10. **Monitors and cooling.** Monitors from green and amber screens to CRTs,
    flat LCDs (mid-2000s), high refresh and OLED, with real resolution steps
    capping what a strong graphics card adds. Cooling from bare heatsinks to
    fans, tower coolers, homemade water kits and ready-made liquid coolers;
    sets the overclock cap. [Design](ideas.md#monitors-and-cooling).
11. **Optical drives**: CD-ROM and the 1x-to-52x speed race, burners, DVD,
    Blu-ray, then fading out. Shares IDE cables with hard drives.
    [Design](ideas.md#optical-drives).
12. **Jumper puzzle**: before plug-and-play (about 1995), set jumpers and DIP
    switches and sort out two cards wanting the same setting. Fixed answers;
    goes away once plug-and-play arrives. [Design](ideas.md#jumper-puzzle).
13. **Boot screens**: a short start-up screen per era (memory count-up, beep,
    parody OS logo) when the Workbench PC powers on.
    [Design](ideas.md#boot-screens).

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
   generations of Home Computers (PC hardware, item 7).
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
- Desk scene: keyboards (clicky, then rubber-dome, then the mechanical
  comeback), mice (ball, then optical around 1999), modems (300 baud to 56k
  in 1998, then broadband) and speakers around the PC.
  [Design](ideas.md#desk-scene).
- Vintage parts: retired parts become "vintage" after a fixed number of
  game years and add collection points. Fixed rule, no chance.
  [Design](ideas.md#vintage-parts).
- Investor upgrade shop (a second use for investors).
- Space Age world, using the draft in `src/lib/worldSpace.js`.
- Cloud save (export/import codes shipped in 0.0.12).
- A Play Store build without the sideload updater and its install permission.
- Notifications (factories full, research done).
- Lower the game tick rate to save battery.
- An "abandon challenge" button.
