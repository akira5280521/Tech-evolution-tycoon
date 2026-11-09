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
- Save backup: export/import code, then cloud save.
- A Play Store build without the sideload updater and its install permission.
- Notifications (factories full, research done).
- Lower the game tick rate to save battery.
- An "abandon challenge" button.
- Ship save export/import before the first release signed with the new key
  (see `docs/signing.md`), so sideload players keep progress when reinstalling.
