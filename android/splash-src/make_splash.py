#!/usr/bin/env python3
"""Draw the dark Tech Evolution Tycoon launch splash at every existing
splash.png size (drawable, drawable-port-*, drawable-land-*).

The art is drawn on a tiny 1x pixel grid (Press Start 2P at its native 8px,
no anti-aliasing) and scaled up by a whole number with nearest-neighbor, so
every pixel stays crisp. The block is sized from the short side so it sits
inside the center safe area in both orientations.

Usage: python3 android/splash-src/make_splash.py <PressStart2P-Regular.ttf>
"""
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont

BG = (0x0D, 0x0B, 0x1E)        # --game-bg / capacitor backgroundColor
GOLD = (0xF5, 0xB4, 0x00)      # --game-accent, the in-game title color
GOLD_HI = (0xFF, 0xE1, 0x4A)   # top-row highlight
SHADOW = (0x6B, 0x3F, 0x00)    # hard drop shadow (pixel art has no glow blur)
CHIP = (0x1C, 0x18, 0x3A)
CHIP_EDGE = (0x3A, 0x33, 0x6E)
LED = (0x4A, 0xDE, 0x80)
TITLE = "TECH EVOLUTION TYCOON"

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(HERE, "..", "app", "src", "main", "res")


def chip(size=16):
    """A small pixel CPU chip: dark body, gold pins, a green LED."""
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([3, 3, size - 4, size - 4], fill=CHIP, outline=GOLD)
    for i in range(5, size - 5, 2):  # pins on all four sides
        d.point([(i, 1), (i, 2), (i, size - 2), (i, size - 3), (1, i), (2, i), (size - 2, i), (size - 3, i)], fill=GOLD)
    d.rectangle([5, 5, size - 6, size - 6], outline=CHIP_EDGE)
    d.rectangle([7, 7, 8, 8], fill=LED)
    return im


def art(font_path):
    """The splash block at 1x: chip, gap, title with shadow, underline."""
    font = ImageFont.truetype(font_path, 8)
    tw = int(font.getlength(TITLE))
    text = Image.new("L", (tw, 8), 0)
    td = ImageDraw.Draw(text)
    td.fontmode = "1"  # no anti-aliasing
    td.text((0, 0), TITLE, font=font, fill=255)

    pad = 2
    w = tw + 1 + pad * 2
    c = chip()
    h = c.height + 6 + 9 + 4 + 1 + pad * 2
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    im.alpha_composite(c, ((w - c.width) // 2, pad))
    ty = pad + c.height + 6
    im.paste(Image.new("RGBA", text.size, SHADOW + (255,)), (pad + 1, ty + 1), text)
    gold = Image.new("RGBA", text.size, GOLD + (255,))
    gold.paste(Image.new("RGBA", (tw, 2), GOLD_HI + (255,)), (0, 0))
    im.paste(gold, (pad, ty), text)
    uy = ty + 9 + 4
    ImageDraw.Draw(im).line([(pad + tw // 2 - 20, uy), (pad + tw // 2 + 20, uy)], fill=GOLD)
    return im


def splash(size, block):
    w, h = size
    out = Image.new("RGB", size, BG)
    # Whole-number scale from the short side: same look in both orientations
    # and inside the center safe area (at most 90% of the short side).
    s = max(1, int(min(w, h) * 0.9 // block.width))
    big = block.resize((block.width * s, block.height * s), Image.NEAREST)
    out.paste(big, ((w - big.width) // 2, (h - big.height) // 2), big)
    return out


def main():
    font_path = sys.argv[1] if len(sys.argv) > 1 else "PressStart2P-Regular.ttf"
    block = art(font_path)
    files = sorted(glob.glob(os.path.join(RES, "drawable*", "splash.png")))
    for path in files:
        size = Image.open(path).size
        splash(size, block).save(path, optimize=True)
        print(os.path.relpath(path, RES), size)


if __name__ == "__main__":
    main()
