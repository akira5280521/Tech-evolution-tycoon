# Tech tree icons

Icons for the 30 research tech tree nodes (layer 2, still in review; not used
in the game yet). Numbers match the node list.

- `public/icons/tech/NN-name.png`: game style, drawn at 128x128 and scaled
  to 1024 with nearest-neighbour, like the era icons.
- `public/icons/tech/placeholder/NN-name.svg`: the first 32x32 drafts, kept
  as placeholders.

To redraw: `python3 -c "exec(open('a.py').read()); exec(open('b.py').read()); exec(open('c.py').read())
for k,f in I.items(): save(f(),k)"` in this folder (needs Pillow), then copy
`nNN.png` to `public/icons/tech/` under its name. `icons.mjs` holds the SVG
placeholders.
