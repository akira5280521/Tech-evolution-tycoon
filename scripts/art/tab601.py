"""Inland 601 sprite (T4 extra), drawn pixel by pixel after photos of the real
IBM 601 (Museum fur Kommunikation Bern; Milan science museum): a black
crinkle-finish table on curved cabriole legs, relay racks and a plugboard
between the legs, the counter/reading mechanism on the table, the card hopper
with its steel guide fingers on the right, a brass plate, gold pinstripe.
Wider than tall (about 60 x 52 in), 32-bit console palette.

Writes public/rooms/servers/sprites/tab601.png (68x63), tab601-strip.png
(24 frames, a relay lamp ticks) and public/icons/parts/tab601.png (1024x1024).
Run: python3 scripts/art/tab601.py
"""
from PIL import Image, ImageDraw

W, H = 68, 63
OUT = (13, 12, 18, 255)
BODY = (30, 28, 37, 255)
MID = (43, 40, 52, 255)
HI = (64, 60, 76, 255)
RIM = (92, 86, 108, 255)
GOLD = (205, 166, 78, 255)
GOLD_D = (128, 96, 40, 255)
STEEL_D = (86, 94, 106, 255)
STEEL = (150, 160, 172, 255)
STEEL_H = (214, 220, 226, 255)
CARD = (232, 160, 168, 255)
CARD_D = (176, 104, 116, 255)
RELAY = (58, 60, 70, 255)
RELAY_H = (120, 124, 136, 255)
WIRE = (226, 220, 204, 255)
COPPER = (176, 100, 58, 255)
CABLE = (48, 46, 56, 255)
LAMP_ON = (255, 196, 92, 255)
LAMP_OFF = (110, 70, 30, 255)


def rect(d, x0, y0, x1, y1, c):
    d.rectangle([x0, y0, x1, y1], fill=c)


def frame(lamp=False):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Floor shadow.
    for i, a in enumerate([40, 60, 80, 60, 40]):
        rect(d, 6 + i, 58 + (i % 2), W - 7 - i, 58 + (i % 2), (0, 0, 0, a))
    rect(d, 4, 59, W - 5, 60, (0, 0, 0, 50))

    # ---- Cabriole legs (curve out at the knee, taper to a pad foot) ----
    def leg(x, flip):
        # (row, x-offset of outer edge, width)
        # knee bulges out under the table, the ankle pinches in, the pad
        # foot flares again (the 601's cast-iron cabriole legs)
        prof = [(27, -1, 9), (28, -1, 9), (29, -1, 8), (30, -1, 8), (31, 0, 7), (32, 0, 7), (33, 1, 6), (34, 1, 6),
                (35, 2, 5), (36, 2, 5), (37, 2, 5)]
        prof += [(y, 3, 4) for y in range(38, 50)]
        prof += [(50, 2, 4), (51, 2, 4), (52, 1, 5), (53, 0, 6), (54, -1, 7), (55, -1, 7), (56, -1, 7)]
        for y, off, w in prof:
            if flip:
                xr = x - off
                x0 = xr - w + 1
            else:
                x0 = x + off
            rect(d, x0, y, x0 + w - 1, y, BODY)
            d.point((x0, y), OUT)
            d.point((x0 + w - 1, y), OUT)
            # highlight on the outer curve (light from the upper left)
            hx = x0 + 1 if not flip else x0 + w - 2
            d.point((hx, y), HI if y < 50 else MID)
            # gold pinstripe down the leg
            if 30 <= y <= 52:
                d.point((x0 + (2 if not flip else w - 3), y), GOLD_D)
        rect(d, (x - 1) if not flip else (x - 5), 56, (x + 5) if not flip else (x + 1), 56, OUT)

    leg(2, False)
    leg(W - 3, True)

    # ---- Between the legs: relay racks, plugboard, cables ----
    rect(d, 9, 28, W - 10, 52, (20, 19, 26, 255))
    rect(d, 9, 52, W - 10, 53, OUT)  # lower stretcher shadow
    # the apron curves down into each leg
    for i, w in enumerate([6, 4, 3, 2, 1]):
        rect(d, 9, 28 + i, 9 + w, 28 + i, BODY)
        rect(d, W - 10 - w, 28 + i, W - 10, 28 + i, BODY)
        d.point((9 + w, 28 + i), OUT)
        d.point((W - 10 - w, 28 + i), OUT)
    # left control strip (switches)
    rect(d, 12, 33, 15, 48, MID)
    for y in range(34, 48, 2):
        d.point((14, y), STEEL_H)
        d.point((13, y), STEEL_D)
    # two relay racks, rows of relays with steel tops
    for rx in (17, 27):
        rect(d, rx, 29, rx + 8, 50, OUT)
        rect(d, rx + 1, 30, rx + 7, 49, RELAY)
        for y in range(31, 49, 4):
            rect(d, rx + 1, y, rx + 7, y, RELAY_H)
            for k in range(rx + 1, rx + 8, 2):
                d.point((k, y + 1), STEEL)
            rect(d, rx + 1, y + 2, rx + 7, y + 2, OUT)
    # plugboard with its hood and white wiring
    rect(d, 37, 29, 46, 31, STEEL)
    rect(d, 37, 29, 46, 29, STEEL_H)
    rect(d, 37, 32, 46, 48, (196, 170, 120, 255))
    rect(d, 37, 32, 37, 48, STEEL_D)
    rect(d, 46, 32, 46, 48, STEEL_D)
    for y, xs in [(34, (39, 44)), (36, (38, 42)), (38, (40, 45)), (41, (38, 43)), (43, (41, 45)), (45, (39, 42))]:
        rect(d, xs[0], y, xs[1], y, WIRE)
    d.line([(36, 49), (38, 51), (46, 51), (47, 49)], fill=STEEL)
    # cables on the right
    d.line([(48, 33), (50, 40), (53, 45), (55, 50)], fill=CABLE, width=2)
    d.line([(49, 30), (52, 36), (55, 42)], fill=CABLE, width=2)
    d.point((50, 40), STEEL_D)
    # copper bus on the floor of the frame
    rect(d, 12, 50, 34, 50, COPPER)

    # ---- The table top: thick slab, gold pinstripe, maker's name ----
    rect(d, 1, 22, W - 2, 27, BODY)
    rect(d, 0, 21, W - 1, 21, OUT)
    rect(d, 1, 22, W - 2, 22, RIM)
    rect(d, 1, 23, W - 2, 23, HI)
    rect(d, 0, 22, 0, 27, OUT)
    rect(d, W - 1, 22, W - 1, 27, OUT)
    rect(d, 0, 28, W - 1, 28, OUT)
    rect(d, 3, 25, W - 4, 25, GOLD_D)
    # "International" in gold: a short dotted word in the middle
    for k in range(29, 40, 1):
        if k % 3 != 2:
            d.point((k, 26), GOLD)

    # ---- On the table: counter unit (left), reading carriage (middle),
    # hopper housing with the brass plate (right) ----
    # left counter unit with its open dial frames
    rect(d, 3, 9, 22, 20, OUT)
    rect(d, 4, 10, 21, 20, MID)
    rect(d, 4, 10, 21, 10, RIM)
    for cx in range(5, 21, 3):
        rect(d, cx, 12, cx + 1, 15, COPPER)
        d.point((cx, 12), (220, 150, 96, 255))
        rect(d, cx, 16, cx + 1, 16, STEEL_D)
    rect(d, 4, 18, 21, 20, BODY)
    # front counter rack sticking out on the left (as in the photo)
    rect(d, 1, 14, 4, 20, OUT)
    rect(d, 2, 15, 3, 19, RELAY_H)
    # middle: reading carriage with rollers and a card in the path
    rect(d, 22, 11, 44, 20, OUT)
    rect(d, 23, 12, 43, 20, BODY)
    rect(d, 23, 12, 43, 12, HI)
    rect(d, 25, 14, 41, 15, STEEL)
    rect(d, 25, 14, 41, 14, STEEL_H)
    for rx in (27, 33, 39):
        rect(d, rx, 16, rx + 1, 17, STEEL_D)
        d.point((rx, 16), STEEL_H)
    rect(d, 24, 18, 31, 18, CARD)
    rect(d, 24, 19, 43, 20, MID)
    # mechanism block rising behind the carriage
    rect(d, 30, 6, 40, 11, OUT)
    rect(d, 31, 7, 39, 11, MID)
    rect(d, 31, 7, 39, 7, RIM)
    for k in range(32, 39, 2):
        rect(d, k, 8, k, 10, STEEL_D)
    # right: hopper housing
    rect(d, 43, 7, W - 3, 21, OUT)
    rect(d, 44, 8, W - 4, 20, BODY)
    rect(d, 44, 8, W - 4, 8, HI)
    rect(d, 44, 9, 45, 20, MID)
    # brass plate and round emblem
    rect(d, 53, 14, 62, 18, GOLD)
    rect(d, 53, 18, 62, 18, GOLD_D)
    rect(d, 54, 15, 61, 15, (236, 206, 130, 255))
    d.point((49, 13), COPPER)
    d.point((50, 13), GOLD)
    d.point((49, 14), GOLD)
    d.point((50, 14), COPPER)
    # card stack in the hopper and the steel guide fingers above it
    rect(d, 47, 4, 62, 7, CARD)
    rect(d, 47, 7, 62, 7, CARD_D)
    rect(d, 47, 4, 62, 4, (246, 196, 202, 255))
    for fx in (48, 52, 56, 60):
        rect(d, fx, 0, fx + 1, 6, STEEL)
        d.point((fx, 0), STEEL_H)
        d.point((fx, 1), STEEL_H)
        d.point((fx + 1, 6), STEEL_D)
    # relay lamp (ticks in the strip)
    d.point((46, 11), LAMP_ON if lamp else LAMP_OFF)
    return im


def main():
    base = frame(False)
    base.save("public/rooms/servers/sprites/tab601.png")
    strip = Image.new("RGBA", (W * 24, H), (0, 0, 0, 0))
    for i in range(24):
        strip.paste(frame(lamp=(i // 3) % 2 == 1), (i * W, 0))
    strip.save("public/rooms/servers/sprites/tab601-strip.png")
    icon = Image.new("RGBA", (1024, 1024), (18, 17, 24, 255))
    big = base.resize((W * 12, H * 12), Image.NEAREST)
    icon.alpha_composite(big, ((1024 - W * 12) // 2, (1024 - H * 12) // 2 + 20))
    icon.save("public/icons/parts/tab601.png")


if __name__ == "__main__":
    main()
