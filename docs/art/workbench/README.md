# Workbench mock-ups (idea only)

Concept art for the phase 3 PC workbench. Not a final design and not used by
the game. See [PC workbench](../../ideas.md#pc-workbench).

- `mockups.png`: three phone screens. 1984 first build (slot grid, locked
  "???" slots), 1999 picking a graphics card (fits by slot, a greyed card
  says why it won't fit), 2016 glass RGB build (overclock levels, power draw).
- `scene-1984.png`, `scene-1999.png`, `scene-2016.png`: the desk scenes,
  drawn at 180x135 and scaled 4x. Light from the top left, each part on its
  own so the real version can be split into layers per slot.
- All part names are made up (Arcton, Vertexa, Pixelforge, Mainline, Kestrel).

To redraw: `python3 sA.py` (and `sB.py`, `sC.py`) in this folder, needs
Pillow. `mock.py` builds the phone screens as HTML.
