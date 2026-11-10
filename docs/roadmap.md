# Roadmap

Planned updates, in order. Each one is meant to ship on its own. Nothing in
"Next" or "Later" is in the game yet. When an item ships, move it to "Done"
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

## To change: display and polish

Notes from playtesting, plus a layout test of every screen. Do these before
the next content update.

**From playtesting**

1. **Hide locked items until they're unlocked.** Grey them out and don't
   reveal what they are:
   - Badges tab: locked badges show the era's full picture and name. Show a
     dark silhouette or "???" until earned.
   - Boost tab: the next era's card shows its picture, name and both upgrade
     names at 0 owned. Grey it out until the era is reached.
   - Same for any other list that shows content the player hasn't reached.
2. **Badge pictures spill out of their frames** (Badges tab, every screen
   size). The picture draws about 150 px tall inside an 80 px frame, so it
   covers the badge name and "Own 20 ..." line and breaks the frame's border.
   Fix: `overflow-hidden` on the frame and `object-contain` on the image.
3. **News ticker scrolls too fast to read.** One loop takes 63 s. Slow it to
   about half speed (~120 s) and pause it while it's pressed.

**From the layout test**

4. **Landscape phones squeeze the era cards** (every phone in landscape,
   568-932 px wide). The cards sit in a narrow right-hand column: descriptions
   wrap one word per line, the era name slides under the BUY button, and the
   left column is empty once you scroll. Give the era list the full width in
   phone landscape, or put the BUY and manager buttons under the text.
5. **Welcome Back popup hides COLLECT in landscape.** On every phone in
   landscape the button sits below the bottom of the screen (368-408 px down on
   320-412 px tall screens), so players have to scroll inside the popup to
   find it. Pin COLLECT to the bottom of the popup and let only the earnings
   list scroll.
6. **Long era names get cut off at the card edge**: Microprocessors,
   Transistors, RGB Battlestations, Integrated Circuits, Home Computers. Happens
   on a Galaxy Fold cover screen (280 px) at any text size, 320 px phones at
   normal text, most phones at 130% text and every phone at 200%. Let the name
   wrap, or use a smaller size on narrow cards.
7. **Buy-mode labels are cut off** ("TEN UNI...", "ALL YOU..."): 280 and
   320 px phones at normal text, most phones at 115% text and up. Hide the small
   second line on narrow screens, or lay the five buttons out 3 + 2.
8. **Boost tab on small phones with large text:** the "X3 REV" / "2X SPD" tags
   and "N owned · named upgrades below" run outside the card (280 px at 130%+,
   320 px at 150%+, other phones at 200%).
9. **Board tab at 200% text on 280-320 px phones:** bonus values such as
   +9507% and X1.2 are pushed past the card edge.
10. **Minor:** at 150% text and up (130% on tablets) the floating "+$" earnings
    pop-ups cover the era name.

No problems found on the Runs and More tabs at any size. Tablets and desktops
are fine apart from item 2.

How this was tested: 10 screens and states (game early and mid-game, with a
dilemma, the bubble and the Welcome Back popup; Boost, Board, Runs, Badges,
More) x 26 screen sizes (8 phones and 4 tablets, each in portrait and
landscape, plus 2 desktops) x text sizes 85-200% (the app follows Android's
font size from 50-200%). That's 1,240 renders with the real fonts, and every
flagged spot was checked by screenshot. It's browser emulation, not real
devices, and Android's text zoom was emulated by scaling font sizes, so check
the fixes on a phone.

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
   that maps old rows to era ids first. Re-run the pacing sim after.
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

- Investor upgrade shop (a second use for investors).
- Space Age world, using the draft in `src/lib/worldSpace.js`.
- Cloud save (export/import codes shipped in 0.0.12).
- A Play Store build without the sideload updater and its install permission.
- Notifications (factories full, research done).
- Lower the game tick rate to save battery.
- An "abandon challenge" button.
