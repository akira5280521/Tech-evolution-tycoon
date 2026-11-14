# PC build area: pixel art list

Every sprite the Workbench and parts catalog need (roadmap items 7-15,
plus the desk scene, item 20). Designs are in [`docs/ideas.md`](../ideas.md).

## Rules for all art

- **No real brands.** No real logos, wordmarks, model names or look-alike
  logos on any part, box, screen or boot logo. Maker marks are the made-up
  parody marks in "Maker marks" below.
- **Real look for the period.** Shapes, colors, connectors and sizes match
  what the real part looked like in its year, so the picture teaches the
  history.
- **One style.** Same as the era icons in `public/icons/`: chunky pixel art
  on a 128 x 128 grid, scaled up 8x with nearest-neighbour to 1024 x 1024,
  dark outline, background `#0D0E20` for icons.
- **Layers have no background** (transparent PNG) and share one grid, so
  they stack into the PC picture without moving.
- **Recolor, don't redraw.** Colorways (board colors, heat spreaders, LED
  colors, monochrome green/amber) are palette swaps of one sprite, done in
  code or as quick recolors. They are listed once.
- File names: `public/icons/parts/<group>-<name>.png` for parts-bin icons,
  `public/pc/<group>-<name>.png` for picture layers.

## Two looks for every part (decided)

- **Flat, straight-on** for the PC picture, so every part lines up on the
  motherboard. This is the drawing the artist makes.
- **Angled 3/4 view with depth** for parts-bin icons and the install screen,
  where a part is shown on its own. It is made from the flat drawing (tilted
  and given thickness), so a part still needs only one design. Small text
  doesn't survive the tilt: put a bigger, simpler maker mark on the angled
  version instead of the model name.

Drafts of both looks are in [`examples/`](examples/): processors and graphics
cards flat and angled, and two motherboards and two sound cards flat. Names
on them (Silicore, Arcadia, Verdant, Rubicon, Kestrel, Tonewave, Auralis) are
made up.

## How the PC picture is built

The picture looks straight at the motherboard: a tower with its side panel
off, or a desktop with its lid off seen from above. Both show the board the
same way, so every part layer sits on the same **board grid** whatever the
case.

1. Case frame (the shape around everything; sets drive bays and PSU spot)
2. Motherboard
3. Memory, processor, cooler
4. Graphics and expansion cards (seen edge-on from the top, in their slots)
5. Drives in the bays
6. Cables and power plugs
7. Lighting glow (a soft colored overlay)
8. Monitor beside the case (separate, not on the board grid)

A part's **parts-bin icon** is the angled version of its layer sprite, on
the icon background, so most parts need one drawing, not two. Parts marked
"icon only" never appear in the picture.

## The list

P1 = needed for the first Workbench release (item 7). P2 = needed for the
item noted. P3 = later or optional.

### Workbench screen (item 7)

| # | Sprite | Notes | Priority |
|---|---|---|---|
| 1 | Empty slot: processor | Dashed outline icon | P1 |
| 2 | Empty slot: graphics | | P1 |
| 3 | Empty slot: memory | | P1 |
| 4 | Empty slot: storage | | P1 |
| 5 | Empty slot: display | | P1 |
| 6 | Empty slot: cooling | | P1 |
| 7 | Empty slot: power supply | Slot added with item 8 | P2 |
| 8 | Empty slot: motherboard | Item 8 | P2 |
| 9 | Empty slot: case | | P1 |
| 10 | Empty slot: expansion card | Item 10 | P2 |
| 11 | Empty slot: lighting | Item 14 | P2 |
| 12 | Locked part "???" | Grey box with question marks | P1 |
| 13 | Bench Score badge | Small gauge or ribbon | P2 |

### Case frames (item 7; window cases item 14)

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 14 | Beige desktop box | 1981-mid 1990s | Wide and low; the monitor sat on top. Two 5.25" bays | P1 |
| 15 | Beige mini-tower | early-mid 1990s | AT-era tower, turbo button and key lock on the front | P1 |
| 16 | Beige ATX tower | 1995-early 2000s | Taller, more bays | P1 |
| 17 | Black tower with side window | 2000s | First mass-market windowed cases | P1 |
| 18 | Glass-panel tower | mid-2010s on | Tempered glass side, PSU shroud along the bottom | P1 |
| 19 | Small-form-factor case | 2000s on | For mini-ITX boards; one card slot | P2 |
| 20 | Hand-cut window overlay | late 1990s | Rough cut with rubber edging, laid over #16 | P2 |

### Motherboards (items 7-8)

Board color is a recolor (green in the '80s-'90s, red, blue or black later).

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 21 | Early PC board | 1981-83 | Rows of DIP memory chips soldered on, 5 card slots | P2 |
| 22 | AT board | 1984 | Large, ISA slots, keyboard DIN plug | P1 |
| 23 | ATX board | 1995 | Back-panel ports in one block | P1 |
| 24 | micro-ATX board | 1997 | Shorter, fewer slots | P2 |
| 25 | mini-ITX board | 2001 | Small square, one slot | P2 |

### Processors (items 7-8)

One sprite per physical form; different parody models of the same form are
the same sprite with a different maker mark.

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 26 | Long DIP chip | 1971-1980s | Two rows of legs | P1 |
| 27 | Square ceramic chip with pins | late 1980s-1990s | Socket 7 era; fits the "four makers, one board" story | P1 |
| 28 | Cartridge processor, leader's shape | 1997-99 | Black cartridge standing in a slot | P2 |
| 29 | Cartridge processor, rival's shape | 1999-2000 | Different shape; must look not interchangeable | P2 |
| 30 | Pin chip with metal lid | 2000s | Rival's socket and the leader's return to a socket | P1 |
| 31 | Pinless chip on a pin socket | 2004 on | Pins moved to the board; socket with lever | P1 |

### Coolers (items 7-8)

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 32 | Bare heatsink | 1980s-early 1990s | Small aluminium fins | P1 |
| 33 | Heatsink with small fan | mid 1990s | | P1 |
| 34 | Tower cooler with heat pipes | 2000s | Tall, copper pipes | P1 |
| 35 | Homemade water loop | 2000s | Block, clear tubing, reservoir, radiator | P2 |
| 36 | Ready-made liquid cooler | 2010s | Pump block, two tubes, radiator with fans | P2 |
| 37-38 | Fan spin frames | | 2 frames reused by every fan | P1 |

### Graphics cards (items 7-8, 10)

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 39 | Text/graphics display card, ISA | 1980s | Long board, few chips | P1 |
| 40 | Local-bus 2D card | 1992-94 | Extra-long slot connector | P2 |
| 41 | PCI 2D card | mid 1990s | | P2 |
| 42 | 3D add-in card + pass-through cable | 1996 | 3D only; cable loops out to the 2D card | P2 |
| 43 | Graphics-port card with small fan | 1997-2000s | | P1 |
| 44 | Two-slot card with blower | mid-2000s | Power plug on top | P1 |
| 45 | Big triple-fan card | 2010s-2020s | Takes 3 slots; 16-pin plug on the newest | P1 |

### Linking two graphics cards (item 10)

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 46 | Short internal ribbon between 3D cards | 1998 | | P2 |
| 47 | Rigid bridge across two cards | 2004 | Green maker | P2 |
| 48 | External cable on the back plugs | 2005 | Red maker; drawn on the case frame's back edge | P2 |
| 49 | Flexible ribbon bridge | 2006-07 | Red maker | P2 |
| 50 | Faster bridge | 2018 | Green maker, chunkier with a light strip | P3 |

### Expansion cards (item 10)

One base card sprite with different chips and back-plate ports.

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 51 | Modem card (ISA) | 1980s-mid 1990s | Two phone jacks on the back plate | P2 |
| 52 | Modem card (PCI) | late 1990s | 56k era | P3 |
| 53 | Network card (ISA) | 1980s-90s | Coax and twisted-pair ports | P2 |
| 54 | Network card (PCI) | late 1990s-2000s | LAN-party years | P3 |
| 55 | Sound card (ISA) | late 1980s-1990s | Long card, joystick port | P2 |
| 56 | Sound card (PCI) | late 1990s-2000s | | P3 |

### Memory (item 8)

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 57 | 30-pin memory stick | 1980s | Short; installs in sets of four | P2 |
| 58 | 72-pin memory stick | early 1990s | Longer; pairs on fifth-generation boards | P2 |
| 59 | Bare DIMM | late 1990s-2000s | Notch position shifts for SDRAM, DDR, DDR2, DDR3 (pixel edits) | P1 |
| 60 | DIMM with heat spreader | 2000s-2010s | Spreader color is a recolor | P2 |
| 61 | Newest DIMM with light bar | 2020s | RGB bar on top | P2 |

### Storage drives (item 8; optical item 12)

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 62 | 5.25" floppy drive, full height | 1981 | Lever latch | P1 |
| 63 | 5.25" full-height hard drive | 1980-83 | 5-10 MB; two ribbon cables | P2 |
| 64 | 3.5" floppy drive | mid 1980s on | Eject button | P1 |
| 65 | 3.5" hard drive | late 1980s on | IDE, later SATA (the connector changes) | P1 |
| 66 | Tape backup drive | 1980s-90s | Optional period part | P3 |
| 67 | 2.5" SSD | late 2000s on | Slim, no moving parts | P1 |
| 68 | M.2 stick on the board | mid 2010s on | No cable | P1 |
| 69 | CD-ROM drive with caddy | late 1980s-early 1990s | Disc went in a plastic caddy | P2 |
| 70 | CD/DVD tray drive | mid 1990s-2000s | Burner, DVD and Blu-ray are label recolors | P2 |

### Cables and power plugs (items 8, 10)

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 71 | Two-ribbon drive cables (wide control + narrow data) | 1980-83 | Early hard drives | P2 |
| 72 | Floppy ribbon with the twist | 1981 on | | P1 |
| 73 | 40-pin IDE ribbon, two plugs | late 1980s-1990s | 80-wire version is a recolor (finer lines) | P1 |
| 74 | Wide 50-pin ribbon | 1980s-90s | Workstation and server interface | P3 |
| 75 | SATA data cable | 2003 on | Thin, usually red | P1 |
| 76 | Two 6-pin board power plugs | 1981-mid 1990s | Shown side by side, black wires in the middle | P2 |
| 77 | 20-pin board power plug | 1995 | | P1 |
| 78 | 24-pin board power plug | 2003-04 on | | P1 |
| 79 | 4-pin processor power plug | 2000 on | | P2 |
| 80 | 4-pin drive power plug | 1980s on | | P1 |
| 81 | Small floppy power plug | mid 1980s on | | P2 |
| 82 | SATA power plug | 2003 on | | P2 |
| 83 | 6/8-pin graphics power plug | mid 2000s on | | P2 |
| 84 | 16-pin graphics power plug | 2022 | | P3 |

### Power supplies (item 8)

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 85 | AT supply | 1981-mid 1990s | Big paddle switch, cord pass-through | P2 |
| 86 | Beige ATX supply | 1995-2000s | | P1 |
| 87 | Black supply with big fan | 2000s | | P1 |
| 88 | Modular supply, sleeved cables | 2010s on | | P2 |
| 89 | Small SFX supply | 2000s on | For small-form-factor cases | P3 |

### Monitors (item 9)

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 90 | Monochrome text screen | late 1970s-80s | Green; amber is a recolor | P1 |
| 91 | Small color CRT | 1987 | 640 x 480 era | P1 |
| 92 | Big CRT | 1990s | Deep and heavy | P2 |
| 93 | Flat LCD, square | early-mid 2000s | | P1 |
| 94 | Widescreen LCD | late 2000s | | P2 |
| 95 | Thin-bezel gaming screen | 2010s | High refresh | P2 |
| 96 | OLED screen | 2020s | Very thin | P3 |
| 97-99 | Screen contents | | Text prompt, early windowed desktop, modern desktop (all made up) | P2 |

### Lighting (item 14)

| # | Sprite | Years | Notes | Priority |
|---|---|---|---|---|
| 100 | Cold cathode tube with inverter box | early-mid 2000s | One color per tube (recolor); UV tube makes UV parts glow | P2 |
| 101 | Single-color LED fan | mid-late 2000s | Recolor | P2 |
| 102 | LED strip | 2000s-2010s | Single color or whole-strip RGB (recolor) | P2 |
| 103-105 | Addressable RGB fan ring | late 2010s on | 3 frames for the rainbow wave | P3 |
| 106 | Glow overlay | | Soft light mask tinted by the chosen color | P2 |

### Maker marks (item 8)

Tiny made-up marks for chips and cards. No resemblance to real logos.

| # | Sprite | Notes | Priority |
|---|---|---|---|
| 107 | Processor leader mark | | P2 |
| 108 | Processor rival mark | | P2 |
| 109 | Third-party chip designer mark | Line ends when the real company left the market | P3 |
| 110 | Low-cost newcomer mark | Short-lived | P3 |
| 111 | Red graphics maker mark | | P2 |
| 112 | Green graphics maker mark | | P2 |

### Boot screens (item 13)

| # | Sprite | Notes | Priority |
|---|---|---|---|
| 113 | Made-up start-up logo, 1980s-90s board | The memory count is drawn as text, not art | P2 |
| 114 | Made-up OS logo, 1990s | | P2 |
| 115 | Made-up OS logo, 2000s | | P2 |
| 116 | Made-up OS logo, modern | | P3 |

### Museum relics (items 8, 14)

Too big or too old to fit a PC; shown as Museum and period-build pieces.

| # | Sprite | Years | Priority |
|---|---|---|---|
| 117 | Room-sized disk cabinet (about 3.75 MB) | 1956 | P2 |
| 118 | Removable disk pack | 1960s-70s | P3 |
| 119 | Sealed hard drive | 1973 | P3 |
| 120 | 8-inch floppy disk and drive | 1971 | P2 |
| 121 | Tape reel | 1951 | P3 |
| 122 | Oil-filled "fish tank" PC | 2000s hobby | P3 |

### Period build badges (item 15)

| # | Sprite | Priority |
|---|---|---|
| 123-128 | Six badges, one per period build (for example 1984, 1991, 1996, 2004, 2012, 2022) | P2 |

### Desk scene (item 20, later)

| # | Sprite | Years | Priority |
|---|---|---|---|
| 129 | Desk | | P3 |
| 130 | Clicky early keyboard | 1980s | P3 |
| 131 | Beige rubber-dome keyboard | 1990s | P3 |
| 132 | Black keyboard with lit keys | 2000s | P3 |
| 133 | Mechanical RGB keyboard | 2010s | P3 |
| 134 | Ball mouse | 1980s-90s | P3 |
| 135 | Optical mouse | 1999 on | P3 |
| 136 | Gaming mouse | 2000s on | P3 |
| 137 | External modem box | 1980s-90s | P3 |
| 138 | Broadband router | 2000s on | P3 |
| 139 | Beige speakers | 1990s | P3 |
| 140 | Speakers with subwoofer | 2000s | P3 |
| 141 | RGB speakers | 2010s | P3 |

## Related art elsewhere (not the PC build area)

- **Generation row icons** (items 1-2): 7 processor, 7 graphics, 4 Home
  Computers and 3 RGB Battlestations generations, in the big era-icon style.
  The processor and graphics part icons above can borrow their look.
- **Real art for the nine placeholder material businesses** (Timber Camp,
  Paper Mill, Sand Quarry, Copper Seam, Glassworks, Filament Forge,
  Germanium Refinery, Silicon Still, Wafer Bench): see "Now" on the roadmap.

## Totals

| Priority | Sprites | What it covers |
|---|---|---|
| P1 | 45 | A first Workbench with a working PC picture across the decades |
| P2 | 64 | The full core build, expansion cards, monitors, lighting, boot screens, Museum pieces, badges |
| P3 | 32 | Optional period parts, animation extras and the desk scene |
| **All** | **141** | Plus recolors, which need no new drawings |
