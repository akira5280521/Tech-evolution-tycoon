# Ideas

Designs that are worked out but not built yet. Each one links back to its
item in [`roadmap.md`](roadmap.md). Rules that apply to all of them: parody or
generic names only (no real company or product names), no gambling or
chance-based rewards, and new content stays hidden ("???") until discovered.

## Chip generations

**Roadmap:** Next, item 1.

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

The same system can cover Home Computers (8-bit micros, the office PC,
graphical desktops, laptops) and RGB Battlestations. That would cover some of
the "fill the gaps" eras without adding rows.
