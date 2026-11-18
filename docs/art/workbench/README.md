# Workbench mock-ups (idea only)

Concept art for the phase 3 PC workbench. Not a final design and not used by
the game. See [PC workbench](../../ideas.md#pc-workbench).

- `mockups.png`: three phone screens. 1984 first build (slot grid, locked
  "???" slots), 1999 picking a graphics card (fits by slot, a greyed card
  says why it won't fit), 2016 glass RGB build (overclock levels, power draw).
- `scene-1984.png`, `scene-1999.png`, `scene-2016.png`: the desk scenes,
  drawn at 180x135 and scaled 4x. Light from the top left, each part on its
  own so the real version can be split into layers per slot.
- `mockups-parts-grid.png`: a second layout. A grid of part cards with a
  tick on each installed part and the empty slot outlined in gold; a part
  details page (specs, what fits and what doesn't, BACK / INSTALL); and a
  POWER ON boot screen with the Bench Score split by part and the weakest
  part named. Part art is 64x64 (`parts2.py`, `bigboard.py`); the power-on scene is `sB_boot.py`; the screens are `mock4.py`.
- `mockup-insert-parts-2020s.png`: the layout Grok sketched, redrawn in game
  style. Upgrades / Workbench toggle on BOOST, Bench Score with "held back
  by", a grid of installed parts (tier, tick, bottleneck marked in amber),
  empty optional slots as "+ Add", and a Required / Optional checklist.
  Part art (72x60, 2020s parts) and the page are in `modern/`.
- All part names are made up (Arcton, Vertexa, Pixelforge, Mainline, Kestrel).

To redraw: `python3 sA.py` (and `sB.py`, `sC.py`) in this folder, needs
Pillow. `mock.py` builds the phone screens as HTML.
