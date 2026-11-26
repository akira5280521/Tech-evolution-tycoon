// Museum silhouettes (T4 item 21). The part and computer icons are opaque
// pixel art on a dark backdrop, so their alpha cannot be the mask. This keys
// out the backdrop once per icon: a flood fill from the border removes pixels
// close to the corner color, and what is left is the piece's shape. The CSS
// filter (.museum-sil / .museum-shadow) then paints that shape one dark shade.
const cache = new Map();
const SIZE = 96;
const TOL = 48;

function maskOf(img) {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  g.drawImage(img, 0, 0, SIZE, SIZE);
  const d = g.getImageData(0, 0, SIZE, SIZE);
  const px = d.data;
  const at = (x, y) => (y * SIZE + x) * 4;
  const corners = [at(0, 0), at(SIZE - 1, 0), at(0, SIZE - 1), at(SIZE - 1, SIZE - 1)];
  const bg = [0, 1, 2].map((k) => corners.reduce((s, i) => s + px[i + k], 0) / 4);
  const near = (i) => px[i + 3] < 128 || Math.abs(px[i] - bg[0]) + Math.abs(px[i + 1] - bg[1]) + Math.abs(px[i + 2] - bg[2]) < TOL;
  const out = new Uint8Array(SIZE * SIZE);
  const stack = [];
  for (let k = 0; k < SIZE; k++) stack.push([k, 0], [k, SIZE - 1], [0, k], [SIZE - 1, k]);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) continue;
    const p = y * SIZE + x;
    if (out[p] || !near(p * 4)) continue;
    out[p] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  for (let p = 0; p < SIZE * SIZE; p++) {
    const i = p * 4;
    if (out[p]) px[i + 3] = 0;
    else {
      px[i] = px[i + 1] = px[i + 2] = 255;
      px[i + 3] = 255;
    }
  }
  g.putImageData(d, 0, 0);
  return c.toDataURL("image/png");
}

/** Promise of a data URL: the icon's shape, white, on a clear backdrop. */
export function silhouetteOf(src) {
  if (!src || typeof document === "undefined") return Promise.resolve(src);
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            resolve(maskOf(img));
          } catch {
            resolve(src);
          }
        };
        img.onerror = () => resolve(src);
        img.src = src;
      }),
    );
  }
  return cache.get(src);
}
