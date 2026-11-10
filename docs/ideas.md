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

## Tab layout

**Roadmap:** Next: PC hardware, item 2.

Each tab answers one question. Today More mixes settings, the token Market
and Research.

| Tab | Answers | Contents |
|---|---|---|
| Game | What am I building? | Era rows (chip generations show on their rows) |
| Boost | How do I earn more? | Upgrades · Research (moved from More) · Workbench (later) |
| Board | What do I spend? | Investors, forks, Market (moved from More) |
| Runs | What goals can I chase? | Challenges, mega-projects |
| Badges | What have I collected? | Badges · Museum (generation history cards go here) |
| More | Settings and help | Orientation, updates, save backup, account, reset, how-to, daily briefing |

- Add switchers instead of tabs: the six tabs already fill two rows on a
  phone. Boost gets Upgrades · Research (· Workbench later); Badges gets
  Badges · Museum, which also shortens a very long page.
- Remember the last switcher choice per tab (localStorage, as a convenience).
- Update the How to Play text and any "go to More" hints.
- Re-run the layout test (every screen, 26 sizes, text 85-200%) after.

## PC workbench

**Roadmap:** Next: PC hardware, item 3.

### Idea

A Workbench view on the Boost tab (see [Tab layout](#tab-layout)) where the player assembles a PC from parts. Each part
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

### How it grows as hardware is added

- **Slots open with the eras.** The Processor slot appears with
  Microprocessors, Graphics with Graphics Cards, and Memory, Storage,
  Display and Cooling with Home Computers. Slots for eras not discovered yet
  show as "???".
- **Part tiers come from generations.** Reaching a generation on an era row
  makes that part installable: hitting the 64-bit generation on
  Microprocessors unlocks the 64-bit processor part. Memory, Storage,
  Display and Cooling tiers come from the Home Computers and RGB
  Battlestations generations (more row generations).
- **Install, don't buy.** Installing a part costs tokens or data, which
  survive prestige, so the build is a long-term project across runs.
- **Bottleneck rule.** As with a real PC, the build is held back by its
  weakest part: the bonus grows with the average tier but can't go more than
  two tiers above the weakest slot. That nudges balanced upgrades and
  teaches a real idea.
- **Period builds.** A small extra bonus when every part is from the same
  decade (a "1984 build", a "2006 build"), with a Museum entry for each one
  completed. Fits the history theme and rewards collecting.
- **Events plug in.** Hardware history events can affect it: the memory
  price spike doubles Memory install costs for a while, and the floppies to
  CDs switch unlocks the CD drive part.
- **Later, parts as materials.** If parts as materials ships, parts could be
  assembled from items made by the era rows instead of bought with tokens.

### Notes

- Needs new saved state (`state.workbench`), kept in `snapshotMeta`.
- Re-run the pacing simulation: the first fork should stay around 5-7 days
  of nonstop play.
- Art: one small icon per part generation, about 20 in total.

## Parts catalog

**Roadmap:** Next: PC hardware, item 4 (step 1: the core build).

### Rules

- **Names are parody or fictional.** No real company, brand or product
  names, including defunct companies: their names may still be owned by
  whoever bought them. Parody names must be clearly original, not
  near-copies (get a trademark check before shipping if unsure).
- **Dates and specs are real.** Years, socket and bus types, clock speeds,
  core counts. The Museum can tell the real story in general terms.
- **Compatibility is real.** A part fits only where it fit in real life.
- **Standard names** (ISA, PCI, AGP, PCI Express, "Socket 7") are industry
  standards rather than company brands, but include them in the same
  trademark check, or use in-game labels like "Socket Type 7" and
  "Graphics Port".

### Processors by socket or slot

Real history the catalog follows (check each before shipping):

| Years | Socket or slot | Who made chips for it |
|---|---|---|
| 1993-1994 | The leader's first fifth-generation sockets | the market leader |
| 1995-1999 | Socket 7 family (later "Super Socket 7", 1998) | the leader, its main rival, and smaller makers including a third-party chip designer that later became part of a chipset maker, and a short-lived low-cost newcomer |
| 1997-1999 | Leader's cartridge slot | leader only |
| 1999-2000 | Rival's cartridge slot (different shape) | rival only |
| 1999-2000s | Leader's return to a socket | the leader, plus the chipset maker's processors from that third-party line |
| 2000-2000s | Rival's own socket | rival only |
| 2004 | Pins move from the chip to the motherboard | leader |

In game: Socket 7 is the fun one, where chips from four parody makers all
fit the same board. The two cartridge slots look alike but don't
interchange. Each era of sockets has a matching Motherboard part.

### Graphics cards by bus

| Years | Bus |
|---|---|
| 1980s | ISA |
| 1992-1994 | Local bus for faster 2D cards |
| 1993-1990s | PCI |
| 1997-2000s | AGP, a dedicated graphics slot |
| 2004 on | PCI Express |

Extra real detail: the first popular 3D add-in cards (1996) did 3D only and
needed a separate 2D card connected by a pass-through cable. On the
Workbench that could take a second graphics slot until all-in-one cards
arrive.

### How it plays

- **Motherboard slot** sets the socket and bus. A new board opens new
  sockets and buses, and may make old parts incompatible, which is the real
  reason people rebuilt PCs.
- **Install screen** lists only parts that fit the current board and
  greys out the rest with the reason ("needs a Socket 7 board").
- **Parody makers** each have a short line of parts with fictional model
  names, real dates and real-style specs. Defunct makers' lines stop in the
  year the real company left that market, with a Museum card explaining why
  in general terms.
- **Period builds** (see PC workbench) get richer: a "1998 Socket 7 build"
  with an underdog chip could be its own achievement.

### Power supply

- Every part has a power draw in watts, using real-style figures for its
  period, and the Power Supply slot has a wattage. Rough real curve (check
  before shipping): 1980s-90s PCs ran on about 150-250 W supplies when a
  processor drew 10-30 W; mid-2000s processors drew over 100 W alone; modern
  high-end graphics cards draw 300-450 W and 750-1000 W supplies are common.
- A part that would push the total draw past the supply's wattage won't
  install, and the install screen says why ("needs 550 W, your supply gives
  300 W"). Better than a build that silently stops working.
- Power supplies upgrade through generations: more wattage, then better
  efficiency, shown with a generic "efficiency rating" (the well-known
  certification labels are trademarks).
- **Power plugs change with the board**, so an old supply can't feed a newer
  board until it's replaced. From memory, check before shipping:

  | Plug | Around | Real detail for the game |
  |---|---|---|
  | Two 6-pin board plugs side by side | 1981 (early PCs), through AT boards | Easy to swap by mistake; the rule was "black wires together in the middle" |
  | Single 20-pin board plug | 1995 (ATX) | One keyed plug, and the PC can switch itself off |
  | Extra 4-pin 12 V processor plug | 2000 | Processors started needing more power |
  | 24-pin board plug | 2003-04 | The plug still used today |
  | 4-pin drive power plug | 1980s on | Hard drives and optical drives; later fans |
  | Small 4-pin floppy plug | mid-1980s on | 3.5-inch floppy drives |
  | SATA power plug | 2003 | Flat plug next to the SATA data cable |
  | 6-pin, then 8-pin graphics card plug | mid-2000s | Graphics cards outgrew what the slot could give |
  | 16-pin high-power graphics plug | 2022 | For the biggest modern cards |

  In game: the board's plug type and the supply's plugs must match, the same
  way sockets do; the PC picture shows the right plugs; and a Museum card
  can tell the "black wires together" story.

### Overclocking

- Levels: Stock, Mild, Strong, Extreme. Each adds a small amount to the
  build bonus; about 5-15% at Extreme, kept inside the soft income ceiling.
- Each level raises power draw and heat. The top level allowed is the lower
  of two limits:
  - **Power headroom:** spare watts above what the build draws.
  - **Cooling tier:** heatsink, fan, tower cooler, liquid.
- Fixed and visible: the screen shows what each level gives and needs. No
  random crashes or failure chances (no gambling).
- On the PC picture, fans spin faster and the lighting glows hotter at
  higher levels.
- Re-run the pacing simulation once it's built.

### Motherboard

The motherboard decides what else fits:

| Form factor | Year | Effect in game |
|---|---|---|
| AT | 1984 | Big board, desktop or tower case |
| ATX | 1995 | The long-running standard; more slots |
| micro-ATX | 1997 | Fewer expansion slots, smaller cases |
| mini-ITX | 2001 | One expansion slot, compact cases |

Each board also has a socket or slot, a memory type and slot count, drive
connectors and a graphics bus. Changing the board is the main upgrade step,
and can make older parts stop fitting.

### Memory

| Type | Around |
|---|---|
| 30-pin SIMM | 1980s |
| 72-pin SIMM | early 1990s |
| DIMM (SDRAM) | late 1990s |
| DDR | 2000 |
| DDR2 | 2003 |
| DDR3 | 2007 |
| DDR4 | 2014 |
| DDR5 | 2020 |

Fits only the board's memory type. Matched pairs give a small dual-channel
bonus.

### Storage and cables

From the very first disks, with real capacities to show how far storage came:

| What | Around | Real detail for the game |
|---|---|---|
| Room-sized disk unit | 1956 | The first commercial hard disk: dozens of 24-inch platters in a cabinet the size of two refrigerators, holding about 3.75 MB |
| Removable disk packs | 1960s-70s | Stacks of platters swapped by hand |
| Sealed "Winchester" drive | 1973 | The sealed design all later hard drives follow |
| 8-inch floppy | 1971 | Read-only at first |
| 5.25-inch floppy | 1976 | |
| First 5.25-inch hard drive | 1980 | 5 MB, two ribbon cables per drive (a wide control cable and a narrow data cable) |
| PC hard drives of 10-20 MB | early 1980s | A 10 MB drive was a big selling point |
| 3.5-inch floppy | early-mid 1980s | |
| Faster drive interface on two cables | 1983 | |
| Wide ribbon interface used by workstations and servers | 1980s (standard 1986) | Several devices on one cable, each with an ID |
| IDE: controller on the drive, one 40-pin ribbon | late 1980s (standard 1994) | Two drives per cable, set as "master" and "slave" with a jumper |
| 80-wire IDE ribbon | late 1990s | Same plug, more wires for faster transfers |
| SATA: thin cable, one drive each | 2003 | |
| SSD | late 2000s for home PCs | No moving parts |
| M.2 / NVMe stick | mid-2010s | Plugs straight into the board, no cable |

In game: each drive needs a matching connector on the board, cables show on
the PC picture (fat ribbons in the beige era, thin SATA later, none for
M.2), and IDE's two-drives-per-cable rule is a small, real puzzle. The
earliest units are Museum and period-build pieces rather than parts that fit
a PC. Interface names like the early drive standards should be generic or
parody in-game if they were tied to a company.

### Bench Score and parts bin

- **Bench Score** (generic name) for the whole build. Performance parts raise
  it; the weakest part and power or cooling limits hold it back; colors and
  period builds add collection points. The income bonus comes from score
  bands, kept small.
- **Parts bin:** every part collected stays in the bin to swap back in.
  Parts that don't fit the current board are greyed out with the reason.

## Expansion slots

**Roadmap:** Next: PC hardware, item 5 (parts catalog step 2).

- **Second graphics card:** running two cards together really helped in the
  mid-2000s to 2010s, then faded. In game it only pays off with parts from
  those periods, with a Museum card explaining why. The way cards were linked
  changed, and the game follows it (from memory, check before shipping; the
  real feature and company names are trademarks, so use generic or parody
  names like "Link Mode" and a parody red and green card maker):

  | How cards linked | Around | Real detail for the game |
  |---|---|---|
  | Two 3D add-in cards joined by a short ribbon inside the case | 1998 | Each card drew every other line of the screen |
  | Green maker: rigid bridge across the top of both cards | 2004 | Needs a board with two matching graphics slots |
  | Red maker: "master" card plus an external cable on the back plugs | 2005 | Needed a special master edition of the card |
  | Red maker: internal ribbon bridges | 2006-07 | Red maker was bought by a processor company in 2006 |
  | Up to 3-4 cards linked | 2007-08 | Big power and cooling needs; a period showpiece |
  | Red maker: no bridge, cards talk through the board | 2013 | Just two cards in the right slots |
  | Green maker: faster bridge | 2018 | Last generation of the idea |
  | Linking fades out | about 2020-21 | Single big cards win; bonus stops in later eras |

  In game: the link type must match the cards and board (bridge, cable or
  none), both cards must be the same maker and usually the same model, and
  the PSU and cooling must cover both. The PC picture shows the bridge or
  cable.
- **Sound card:** essential from the late 1980s; optional once sound was
  built into boards around 2000. Mostly for period builds and the score.
- **Network card:** for the dial-up and LAN-party periods.
- Slot count comes from the motherboard's form factor.

## Colors and collecting

**Roadmap:** Next: PC hardware, item 6 (parts catalog step 3).

- Period color schemes as cosmetic variants of parts: green circuit boards
  in the '90s, red or blue gaming boards in the 2000s, black in the 2010s,
  colored memory heat spreaders, then RGB lighting.
- Cosmetic only: they add collection points to the Bench Score and Museum
  entries, not earnings.
- Made by recoloring the same sprite, so they cost little art.

## More row generations

**Roadmap:** Next: PC hardware, item 7.

The [chip generations](#chip-generations) system applied to more rows, with
the same rules (owned-count milestones, small bonus, a history card each):

- **Home Computers:** 8-bit home micro (1977), office PC (1981), graphical
  desktop with a mouse (1984), laptop (1990s).
- **RGB Battlestations:** LAN-party tower (late 1990s), liquid-cooled rig
  (2000s), small-form-factor mini PC (2010s).

This also covers several of the history theme's "fill the gaps" eras
without adding rows or a save migration.

## Hardware history events

**Roadmap:** Next: PC hardware, item 8.

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
