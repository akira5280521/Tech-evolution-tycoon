# Ideas

Designs that are worked out but not built yet. Each one links back to its
item in [`roadmap.md`](roadmap.md). Rules that apply to all of them: parody or
generic names only (no real company or product names), no gambling or
chance-based rewards, and new content stays hidden ("???") until discovered.

## Chip generations

**Roadmap:** Next: PC hardware, item 1.

### Idea

Add generations inside the Microprocessors and Graphics Cards eras instead of
new eras on the main ladder. As a row passes owned-count milestones, it
evolves to the next generation of the technology: the row's name, picture and
tagline change, it pays a small bonus, and a Museum history card unlocks. The
technology visibly evolves on screen, which is the point of the game.

### Why generations, not new eras

- **Saves stay safe.** `biz` is saved by position, so inserting rows needs a
  save migration. Generations live inside an existing row.
- **Pacing barely moves.** The ladder is already tuned; new rows would mean
  re-tuning all of it.
- **It reuses what exists:** milestones, the Museum and the "???" hiding rule.

### Generations

Generic names with real dates:

| Microprocessors | Year | Graphics Cards | Year |
|---|---|---|---|
| 4-bit calculator chip | 1971 | 2D display card | ~1990 |
| 8-bit home chip | 1974 | 3D accelerator add-in | 1996 |
| 16-bit | 1978 | All-in-one 3D chip | 1999 |
| 32-bit | 1985 | Programmable shaders | 2001 |
| 64-bit | 2003 | Unified shaders and GPU computing | 2006 |
| Dual and multi-core | 2005 | AI tensor cores | 2017 |
| Many-core chiplets | 2017+ | Ray-tracing cores | 2018 |

Check each date against a source before shipping, as with the history cards.

### How it works

- Each generation unlocks at an owned count on the existing milestone steps,
  for example 1, 25, 50, 100, 200, 300 and 400 owned.
- On unlock: the row's name, picture and tagline switch to the new
  generation; a toast says what changed; the generation's history card goes
  into the Museum.
- Generations the player hasn't reached show as "???" in the Museum and in
  any list of generations, like other locked content.
- A generation reached once stays unlocked after prestige for the Museum and
  badges. The row itself shows the generation for its current owned count, so
  it evolves again each run.

### Data

A table per era in `src/lib/`, in the style of `HISTORY_CARDS`:

```js
export const GENERATIONS = {
  cpu: [
    { id: "cpu-4bit", need: 1, name: "4-bit Calculator Chips", year: "1971",
      icon: "/icons/gen/cpu-4bit.png", tagline: "...", card: { title: "...", text: "..." } },
    // ...
  ],
  gpu: [ /* ... */ ],
};
```

`state.generationsSeen` (saved, kept through prestige) records which ones the
player has reached, for the Museum and the "???" rule.

### Balance

- Keep each generation mostly cosmetic and historical: about +5% to that
  era's revenue, so the game doesn't speed up noticeably.
- Re-run the pacing simulation before shipping. The first fork should stay
  around 5-7 days of nonstop play.

### Art

About 14 new pixel icons, one per generation, in the existing style. Until
they exist, the row keeps its current icon and only the name and tagline
change.

### Later

The same system covers more rows: see [More row generations](#more-row-generations).

## PC workbench

**Roadmap:** Next: PC hardware, item 2.

### Idea

A new Workbench screen where the player assembles a PC from parts. Each part
slot upgrades through generations, and a complete build gives an empire-wide
revenue bonus that grows as the parts get better. It's the most "PC" feature
in the game and a long-term goal across runs.

### Slots and generations

Generic names with real dates (check each against a source before shipping):

| Slot | Generations |
|---|---|
| Processor | follows the Microprocessors generations |
| Graphics | follows the Graphics Cards generations |
| Memory | magnetic core memory (1950s), DRAM chips (1970), DDR modules (2000) |
| Storage | magnetic tape (1951), floppy disk (1971), hard drive in a PC (1980s), CD-ROM (mid-1980s), solid-state drive (2000s) |
| Display | CRT monitor, flat LCD panel (2000s), OLED (2010s) |
| Cooling | heatsink, fan, liquid cooling |

### How it works

- A slot's next generation unlocks when the player reaches the matching era
  or generation, then costs tokens or data to install. Cash would reset on
  prestige; tokens and data don't, which fits a long-term goal.
- The build bonus is the product of the slot levels, kept inside the
  existing soft income ceiling (for example up to +25% at a full top-tier
  build).
- The build survives prestige and forks.
- Locked generations show as "???" like other locked content.
- The screen shows the build as a pixel-art PC that changes as parts are
  added, a good spot for the new art.

### Notes

- Needs new saved state (`state.workbench`), kept in `snapshotMeta`.
- Re-run the pacing simulation: the first fork should stay around 5-7 days
  of nonstop play.
- Art: one small icon per part generation, about 20 in total.

## More row generations

**Roadmap:** Next: PC hardware, item 3.

The [chip generations](#chip-generations) system applied to more rows, with
the same rules (owned-count milestones, small bonus, a history card each):

- **Home Computers:** 8-bit home micro (1977), office PC (1981), graphical
  desktop with a mouse (1984), laptop (1990s).
- **RGB Battlestations:** LAN-party tower (late 1990s), liquid-cooled rig
  (2000s), small-form-factor mini PC (2010s).

This also covers several of the history theme's "fill the gaps" eras
without adding rows or a save migration.

## Hardware history events

**Roadmap:** Next: PC hardware, item 4.

Short timed events in the style of the Dot-com Bubble, each tied to one era
and shown with a countdown. All effects are fixed and shown up front; no
chance involved.

| Event | Real history | Effect while it runs |
|---|---|---|
| Memory price spike | DRAM prices rose sharply in 2017-2018 | Home Computers pay x2, cost x1.5 |
| Hard-drive shortage | 2011 floods hit drive factories | Storage-related era pays x2, buying paused or pricier |
| Floppies to CDs | software moved to CD-ROM in the 1990s | A one-time choice: switch now for a boost, or later for free |

Notes: one event at a time, never during challenges, never while the app is
closed. Re-run the pacing sim if the multipliers change.

## Parts as materials

**Roadmap:** Later.

### Idea

Later eras use up parts made by earlier rows: Home Computers consume chips,
memory and drives, Graphics Cards consume chips, and so on. The current
supply chain (sand, copper, silicon, wafers) never limits anything after the
opening, as the pacing and layout tests showed; this would make older rows
matter for the whole game.

### Risks

- The biggest balance change of the hardware ideas: a starved input stops a
  late era, which can feel bad in an idle game. Use a soft limit (slower, not
  stopped) like the current supply factor.
- Offline earnings must drain inputs over time, as the 0.0.8 offline fix
  already does for raw materials.
- Needs the full pacing test, including casual and offline players, before
  shipping.
