#!/usr/bin/env python3
"""32-bit FF/SotN-style museum/bench part icons.

Draw at 128x128 (chunky pixels, dark outline, flat straight-on), then scale
8x nearest-neighbour to 1024x1024 RGB on the game's dark #0D0E20 ground.
No real brand marks. Layouts follow the part's era: AT vs ATX slot/socket
arrangements, PSU fan grilles and cables, drives by form, expansion cards
with a back bracket.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
META = json.loads((Path(__file__).parent / "bench-meta.json").read_text())
OUT = ROOT / "public" / "icons" / "bench"

BG = (13, 14, 32)
OUTL = (8, 8, 16)
GOLD = (196, 150, 70)
SILVER = (168, 172, 180)
TIN = (132, 136, 144)
STEEL = (120, 124, 132)
DK = (20, 20, 24)
CHIP_K = (22, 22, 26)
CHIP_B = (210, 198, 158)
CHIP_W = (220, 220, 210)
PIN = (180, 170, 90)
TRACE_G = (40, 120, 62)
CAP_BL = (28, 48, 120)
CAP_YL = (200, 170, 60)
CAP_BK = (28, 28, 32)
BEIGE = (198, 180, 138)
BEIGE_DK = (150, 132, 96)
PLAST_BLK = (36, 36, 40)
PLAST_GRY = (70, 74, 80)
LABEL = (230, 220, 150)
RED = (180, 40, 40)
YEL = (210, 180, 50)
ORG = (200, 110, 40)
GRN = (40, 140, 70)
BLU = (50, 90, 180)
WHT = (230, 230, 235)

PCB = {
    "brown": (96, 64, 34),
    "tan": (128, 96, 54),
    "green": (30, 98, 50),
    "dkgreen": (18, 70, 38),
    "blue": (24, 50, 112),
    "black": (24, 26, 30),
    "red": (112, 30, 34),
    "orange": (150, 78, 28),
}

SLOT_ISA = (90, 70, 42)
SLOT_ISA8 = (110, 86, 50)
SLOT_PCI = (210, 210, 200)
SLOT_AGP = (150, 78, 36)
SLOT_PCIE = (30, 30, 34)
SLOT_VLB = (70, 48, 32)
SLOT_S100 = (40, 40, 44)
DIMM_W = (236, 236, 240)
DIMM_K = (42, 42, 46)
DIMM_O = (200, 96, 36)
DIMM_BL = (36, 70, 140)


class C:
    def __init__(self, n=128):
        self.n = n
        self.im = Image.new("RGB", (n, n), BG)
        self.px = self.im.load()

    def p(self, x, y, c):
        if 0 <= x < self.n and 0 <= y < self.n:
            self.px[x, y] = c

    def fill(self, x, y, w, h, c):
        for j in range(max(0, h)):
            for i in range(max(0, w)):
                self.p(x + i, y + j, c)

    def rect(self, x, y, w, h, ink, fill=None):
        if fill is not None:
            self.fill(x, y, w, h, fill)
        if w <= 0 or h <= 0:
            return
        for i in range(w):
            self.p(x + i, y, ink)
            self.p(x + i, y + h - 1, ink)
        for j in range(h):
            self.p(x, y + j, ink)
            self.p(x + w - 1, y + j, ink)

    def hline(self, x, y, w, c):
        for i in range(w):
            self.p(x + i, y, c)

    def vline(self, x, y, h, c):
        for j in range(h):
            self.p(x, y + j, c)

    def disc(self, cx, cy, r, c):
        r2 = r * r
        for j in range(-r, r + 1):
            for i in range(-r, r + 1):
                if i * i + j * j <= r2:
                    self.p(cx + i, cy + j, c)

    def ring(self, cx, cy, r, c):
        r2, rin = r * r, (r - 1) * (r - 1)
        for j in range(-r, r + 1):
            for i in range(-r, r + 1):
                d = i * i + j * j
                if rin <= d <= r2 + r:
                    self.p(cx + i, cy + j, c)

    def save(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.im.resize((self.n * 8, self.n * 8), Image.Resampling.NEAREST).save(path, "PNG")
        return self.im


# Tiny 3x5 digits for wattage / year marks (not brand names).
FONT = {
    "0": ["111", "101", "101", "101", "111"],
    "1": ["010", "110", "010", "010", "111"],
    "2": ["111", "001", "111", "100", "111"],
    "3": ["111", "001", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"],
    "5": ["111", "100", "111", "001", "111"],
    "6": ["111", "100", "111", "101", "111"],
    "7": ["111", "001", "010", "010", "010"],
    "8": ["111", "101", "111", "101", "111"],
    "9": ["111", "101", "111", "001", "111"],
    "W": ["101", "101", "101", "101", "010"],
    "x": ["000", "101", "010", "101", "000"],
    " ": ["000", "000", "000", "000", "000"],
}


def text(c: C, x, y, s, color=DK):
    ox = x
    for ch in str(s):
        g = FONT.get(ch)
        if not g:
            ox += 4
            continue
        for j, row in enumerate(g):
            for i, bit in enumerate(row):
                if bit == "1":
                    c.p(ox + i, y + j, color)
        ox += 4


def shade(c, amt):
    return tuple(max(0, min(255, int(v + amt))) for v in c)


def pcb_color(board):
    year, bid = board["year"], board["id"]
    if bid in ("b-altair", "b-trs80"):
        return PCB["blue"] if bid == "b-altair" else PCB["tan"]
    if bid in ("b-orchard2",):
        return PCB["green"]
    if year <= 1984:
        return PCB["tan"] if bid in ("b-5150",) else PCB["green"]
    if year <= 1996:
        return PCB["green"]
    if bid in ("b-be6", "b-lanparty"):
        return PCB["orange"]
    if bid in ("b-kt7", "b-kt266a", "b-nf3", "b-nf4"):
        return PCB["dkgreen"]
    if year <= 2004:
        return PCB["dkgreen"]
    if bid in ("b-x399", "b-x670e", "b-z690", "b-z790", "b-z890"):
        return PCB["black"]
    if "i" in bid[-1:] and year >= 2015:
        return PCB["black"]
    if year >= 2015:
        return PCB["black"] if year >= 2019 else PCB["black"]
    if year >= 2008:
        return PCB["brown"] if year < 2012 else PCB["black"]
    return PCB["dkgreen"]


def form_of(board):
    bid, year, sock = board["id"], board["year"], board.get("socket") or ""
    gpu = board.get("gpuSlot") or ""
    if gpu == "s100" or bid == "b-altair":
        return "s100"
    if bid in ("b-orchard2", "b-trs80"):
        return "8bit"
    if bid.endswith("i") or "itx" in board["name"].lower():
        return "itx"
    if "btx" in bid:
        return "btx"
    if year < 1995 or sock in ("286", "386", "486", "8088", "8080", "6502", "z80", "socket4"):
        return "at"
    return "atx"


def hole(c: C, x, y, pcb):
    c.disc(x, y, 2, OUTL)
    c.p(x, y, GOLD)
    c.p(x - 1, y, shade(pcb, -20))
    c.p(x + 1, y, shade(pcb, -20))
    c.p(x, y - 1, shade(pcb, -20))
    c.p(x, y + 1, shade(pcb, -20))


def chip(c: C, x, y, w, h, body=CHIP_K, legs=True):
    c.rect(x, y, w, h, OUTL, body)
    # pin 1 notch
    c.p(x + 2, y + 1, shade(body, 30))
    if legs and w >= 6:
        for i in range(2, w - 2, 2):
            c.p(x + i, y - 1, PIN)
            c.p(x + i, y + h, PIN)
        if h >= 8:
            for j in range(2, h - 2, 2):
                c.p(x - 1, y + j, PIN)
                c.p(x + w, y + j, PIN)
    # bond-wire dots
    if w >= 8 and h >= 6:
        c.p(x + w // 2, y + h // 2, shade(body, 40))


def dip(c: C, x, y, pins=16, v=False, body=CHIP_K):
    # 16-pin DIP, horizontal unless v.
    n = max(8, pins)
    if v:
        h = n // 2 + 3
        chip(c, x, y, 6, h, body)
    else:
        w = n // 2 + 3
        chip(c, x, y, w, 6, body)


def cap(c: C, x, y, r=2, color=CAP_BL):
    c.disc(x, y, r, OUTL)
    c.disc(x, y, r - 1, color)
    if r >= 2:
        c.p(x - 1, y - 1, shade(color, 50))
        c.hline(x - 1, y, 3, shade(color, 20))  # stripe


def choke(c: C, x, y, w=6, h=5):
    c.rect(x, y, w, h, OUTL, (40, 36, 32))
    for i in range(1, w - 1, 2):
        c.vline(x + i, y + 1, h - 2, (90, 80, 50))


def slot(c: C, x, y, length, kind="pci", vertical=False):
    colors = {
        "isa": SLOT_ISA,
        "isa8": SLOT_ISA8,
        "pci": SLOT_PCI,
        "agp": SLOT_AGP,
        "pcie": SLOT_PCIE,
        "vlb": SLOT_VLB,
        "s100": SLOT_S100,
    }
    col = colors.get(kind, SLOT_PCI)
    if vertical:
        c.rect(x, y, 5, length, OUTL, col)
        for j in range(2, length - 2, 2):
            c.p(x + 2, y + j, OUTL)
    else:
        c.rect(x, y, length, 5, OUTL, col)
        # key notch
        key = 8 if kind in ("isa", "isa8", "vlb") else (10 if kind == "agp" else 12)
        if length > key + 4:
            c.fill(x + key, y + 1, 2, 3, shade(col, -40))
        for i in range(2, length - 2, 2):
            c.p(x + i, y + 2, OUTL)


def dimm(c: C, x, y, length=22, color=DIMM_W, vertical=True):
    if vertical:
        c.rect(x, y, 4, length, OUTL, color)
        c.vline(x + 1, y + 3, 3, OUTL)  # notch
        for j in range(2, length - 2, 2):
            c.p(x + 2, y + j, PIN)
    else:
        c.rect(x, y, length, 4, OUTL, color)
        c.hline(x + 4, y + 1, 3, OUTL)
        for i in range(2, length - 2, 2):
            c.p(x + i, y + 2, PIN)


def io_port(c: C, x, y, kind):
    if kind == "din":
        c.disc(x, y, 3, OUTL)
        c.disc(x, y, 2, PLAST_BLK)
        c.p(x, y, STEEL)
    elif kind == "usb":
        c.rect(x, y, 5, 3, OUTL, STEEL)
    elif kind == "rj45":
        c.rect(x, y, 7, 6, OUTL, PLAST_BLK)
        c.fill(x + 1, y + 1, 5, 3, (20, 80, 40))
    elif kind == "vga":
        c.rect(x, y, 8, 4, OUTL, STEEL)
        c.p(x + 1, y + 4, STEEL)
        c.p(x + 6, y + 4, STEEL)
    elif kind == "hdmi":
        c.rect(x, y, 6, 3, OUTL, STEEL)
    elif kind == "audio":
        c.disc(x, y, 2, OUTL)
        c.disc(x, y, 1, kind and (160, 40, 40))
    elif kind == "ps2":
        c.disc(x, y, 2, OUTL)
        c.disc(x, y, 1, GRN)
    elif kind == "at":
        c.rect(x, y, 5, 4, OUTL, STEEL)


def io_shield(c: C, x, y, h, year, atx=True):
    c.rect(x, y, 7, h, OUTL, STEEL)
    c.fill(x + 1, y + 1, 5, h - 2, PLAST_BLK)
    yy = y + 2
    if year < 1999:
        io_port(c, x + 3, yy + 2, "din" if year < 1996 else "ps2")
        yy += 8
        io_port(c, x + 1, yy, "vga")
        yy += 6
        io_port(c, x + 3, yy + 2, "audio")
    elif year < 2011:
        io_port(c, x + 3, yy + 2, "ps2")
        yy += 7
        io_port(c, x + 1, yy, "usb")
        yy += 5
        io_port(c, x + 1, yy, "rj45")
        yy += 8
        io_port(c, x + 1, yy, "vga")
        yy += 6
        io_port(c, x + 3, yy + 2, "audio")
    else:
        io_port(c, x + 1, yy, "usb")
        yy += 5
        io_port(c, x + 1, yy, "usb")
        yy += 5
        io_port(c, x + 1, yy, "hdmi")
        yy += 5
        io_port(c, x + 1, yy, "rj45")
        yy += 8
        io_port(c, x + 3, yy + 2, "audio")


def socket_draw(c: C, x, y, sock, size=18):
    s = (sock or "").lower()
    if s in ("slot1", "slota"):
        # Standing slot cartridge
        c.rect(x + size // 2 - 3, y, 6, size + 4, OUTL, SLOT_PCIE)
        c.rect(x + size // 2 - 5, y - 2, 10, 4, OUTL, PLAST_BLK)
        for j in range(2, size, 2):
            c.p(x + size // 2, y + j, PIN)
        return
    # Square PGA / LGA
    body = CHIP_B if s in ("286", "386", "486", "socket4", "socket7", "socket8", "s478") else CHIP_K
    if s in ("8080", "8088", "z80", "6502", "nx586"):
        dip(c, x, y, 40 if s != "6502" else 40)
        return
    c.rect(x, y, size, size, OUTL, (60, 60, 64) if "lga" in s or s.startswith("am") or s in ("tr4",) else (80, 80, 70))
    # inner pad / IHS
    inset = 3
    c.rect(x + inset, y + inset, size - 2 * inset, size - 2 * inset, OUTL, body)
    if "lga" in s or s in ("am4", "am5", "tr4", "s939", "am2", "am3"):
        # pin grid / ILM
        step = 3
        for j in range(x + inset + 1, x + size - inset - 1, step):
            for i in range(y + inset + 1, y + size - inset - 1, step):
                c.p(j, i, PIN if "lga" in s else DK)
        # lever
        c.hline(x, y - 1, size, STEEL)
        c.vline(x + size, y - 1, size + 2, STEEL)
    else:
        # PGA pin grid
        for j in range(x + inset + 1, x + size - inset - 1, 2):
            for i in range(y + inset + 1, y + size - inset - 1, 2):
                c.p(j, i, PIN)


def traces(c: C, x, y, w, h, pcb):
    # Short, sparse traces — not a graph-paper grid over the whole board.
    tcol = TRACE_G if pcb[1] > pcb[0] else shade(pcb, 28)
    seed = (x * 17 + y * 31 + w) & 255
    for n in range(12):
        sx = x + 6 + ((seed + n * 13) % max(1, w - 16))
        sy = y + 6 + ((seed + n * 29) % max(1, h - 16))
        ln = 8 + (n % 5) * 3
        if n % 2:
            c.hline(sx, sy, min(ln, x + w - 4 - sx), tcol)
        else:
            c.vline(sx, sy, min(ln, y + h - 4 - sy), tcol)


def draw_board(board):
    c = C()
    form = form_of(board)
    pcb = pcb_color(board)
    year = board["year"]
    sock = board.get("socket") or ""
    slots_n = int(board.get("slots") or 3)
    gpu = board.get("gpuSlot") or "none"
    mem = board.get("mem") or ""

    # PCB bounds
    if form == "itx":
        x, y, w, h = 28, 22, 72, 84
    elif form == "s100":
        x, y, w, h = 10, 14, 108, 100
    elif form == "8bit":
        x, y, w, h = 12, 16, 104, 96
    elif form == "at":
        x, y, w, h = 10, 12, 108, 104
    else:
        x, y, w, h = 8, 12, 112, 104

    c.rect(x, y, w, h, OUTL, pcb)
    traces(c, x, y, w, h, pcb)
    # mounting holes
    for hx, hy in ((x + 3, y + 3), (x + w - 4, y + 3), (x + 3, y + h - 4), (x + w - 4, y + h - 4)):
        hole(c, hx, hy, pcb)

    if form == "s100":
        # 100-pin edge fingers along the bottom, many long bus slots
        for i in range(x + 6, x + w - 6, 2):
            c.p(i, y + h, GOLD)
            c.p(i, y + h + 1, GOLD)
        nslots = 16
        gap = 5
        sx = x + 8
        for i in range(nslots):
            slot(c, sx + i * gap, y + 18, 70, "s100", vertical=True)
        chip(c, x + 8, y + 6, 16, 8, CHIP_K)
        chip(c, x + 30, y + 6, 12, 8, CHIP_K)
        cap(c, x + w - 12, y + 10, 2)
        c.save(OUT / f"{board['id']}.png")
        return c.im

    if form == "8bit":
        # Apple II / TRS-80: DIP RAM rows and a row of slots
        # CPU
        dip(c, x + 10, y + 10, 40)
        # RAM dips
        for row in range(2):
            for col in range(8 if board["id"] == "b-orchard2" else 6):
                dip(c, x + 10 + col * 11, y + 28 + row * 12, 16)
        n = 8 if board["id"] == "b-orchard2" else 3
        for i in range(n):
            slot(c, x + 10 + i * 11, y + 56, 36, "isa8", vertical=True)
        cap(c, x + w - 14, y + 16, 3, CAP_YL)
        c.save(OUT / f"{board['id']}.png")
        return c.im

    if form == "at":
        # Keyboard DIN on the back (top)
        io_port(c, x + w - 14, y + 8, "din")
        # CPU
        if sock in ("8088", "8080", "z80"):
            dip(c, x + 12, y + 10, 40)
        else:
            socket_draw(c, x + 12, y + 10, sock, 16 if sock in ("286", "386") else 18)
        # DIP or SIMM memory
        if mem == "dip":
            for row in range(2):
                for col in range(8):
                    dip(c, x + 10 + col * 10, y + 34 + row * 10, 16)
        elif mem == "simm30":
            for i in range(min(8, max(4, slots_n * 2))):
                dimm(c, x + 10 + i * 6, y + 36, 20, DIMM_K, True)
        elif mem == "simm72":
            for i in range(4):
                dimm(c, x + 10 + i * 7, y + 34, 24, DIMM_W, True)
        else:
            for i in range(4):
                dimm(c, x + 10 + i * 6, y + 34, 22, DIMM_W, True)
        # Expansion slots along the right, opening to the back
        kind_main = "vlb" if gpu == "vlb" else ("isa" if "isa" in gpu or year < 1993 else "isa")
        n = max(3, min(8, slots_n + (2 if year < 1990 else 1)))
        for i in range(n):
            k = "vlb" if gpu == "vlb" and i == 0 else ("isa8" if i >= n - 2 and year < 1988 else "isa")
            slot(c, x + 52 + i * 7, y + 32, 70, k, vertical=True)
        # clock crystal + caps + BIOS chip
        chip(c, x + 12, y + h - 16, 14, 8, CHIP_B)
        cap(c, x + 32, y + h - 12, 2, CAP_YL)
        cap(c, x + 38, y + h - 12, 2, CAP_BL)
        c.save(OUT / f"{board['id']}.png")
        return c.im

    # ATX / ITX / BTX
    io_x, io_y = x + 2, y + 6
    io_h = 44 if form != "itx" else 36
    io_shield(c, io_x, io_y, io_h, year)
    # 24-pin ATX and 8-pin CPU (or 20-pin earlier)
    plug_w = 14 if year >= 2003 else 12
    c.rect(x + 12, y + h - 16, plug_w, 8, OUTL, (40, 40, 48))
    for i in range(2, plug_w - 1, 2):
        for j in (2, 5):
            c.p(x + 12 + i, y + h - 16 + j, YEL if j == 2 else DK)
    # CPU near top-left of remaining board
    sx = x + (16 if form != "itx" else 14)
    sy = y + (8 if form != "itx" else 10)
    size = 16 if form == "itx" else (20 if sock.startswith("lga") or sock in ("am4", "am5", "tr4") else 18)
    socket_draw(c, sx, sy, sock, size)
    # VRM caps / chokes above/left of CPU
    for i, (cx, cy) in enumerate(((sx - 6, sy + 2), (sx - 6, sy + 8), (sx + 2, sy - 5), (sx + 8, sy - 5))):
        if form != "itx" or i < 3:
            cap(c, cx, cy, 2, CAP_BK if year >= 2010 else CAP_BL)
    if year >= 2004:
        choke(c, sx + size + 2, sy, 7, 5)
        choke(c, sx + size + 2, sy + 7, 7, 5)
    # DIMM slots to the right of CPU, vertical, era color
    dimm_col = DIMM_W if mem in ("sdram", "ddr", "ddr2") else (DIMM_BL if mem == "ddr3" else (DIMM_O if mem == "ddr4" else DIMM_K))
    n_dimm = 2 if form == "itx" else (2 if mem in ("sdram",) and year < 2000 else 4)
    dx = sx + size + 12
    dy = sy - 2
    dl = size + 10
    for i in range(n_dimm):
        dimm(c, dx + i * 5, dy, dl, dimm_col, True)
    # Chipset south of CPU
    cx, cy = sx + 2, sy + size + 8
    chip(c, cx, cy, 12, 10, CHIP_K)
    if year >= 2008:
        # small heatsink fins
        for i in range(0, 12, 2):
            c.vline(cx + i, cy - 1, 1, STEEL)
    # CMOS battery
    c.disc(x + 22, y + h - 24, 4, OUTL)
    c.disc(x + 22, y + h - 24, 3, SILVER)
    c.p(x + 22, y + h - 24, GOLD)
    # Expansion slots along the right, opening to the back (bottom of icon as the rear? )
    # ATX: slots run toward the I/O? Real ATX: I/O rear, slots perpendicular opening to rear.
    # Straight-on museum view: I/O on the left, long slots on the lower right running vertically.
    kind_gpu = "pcie" if gpu == "pcie" else ("agp" if str(gpu).startswith("agp") else ("pci" if gpu == "pci" else "pcie"))
    n = 1 if form == "itx" else max(3, min(6, slots_n + 1))
    base_x = x + w - 10 - n * 6
    base_y = y + (38 if form != "itx" else 48)
    slen = 56 if form != "itx" else 40
    for i in range(n):
        if i == 0:
            k = kind_gpu
            ln = slen
        elif year >= 2004:
            k = "pcie"
            ln = slen - 16 if i > 1 else slen - 8
        else:
            k = "pci"
            ln = slen - 8
        slot(c, base_x + i * 6, base_y, ln, k, vertical=True)
    # M.2 if modern
    if year >= 2015:
        c.rect(x + 36, y + h - 22, 28, 5, OUTL, PLAST_BLK)
        chip(c, x + 40, y + h - 21, 8, 3, CHIP_K)
        chip(c, x + 50, y + h - 21, 6, 3, CHIP_K)
    # SATA ports
    if year >= 2003:
        for i in range(2 if form == "itx" else 4):
            c.rect(x + w - 16, y + h - 20 + i * 4, 8, 3, OUTL, (20, 20, 80))
    # a few scattered caps / chips
    cap(c, x + 40, y + h - 30, 2, CAP_YL)
    chip(c, x + 48, y + 20, 8, 6, CHIP_K)
    c.save(OUT / f"{board['id']}.png")
    return c.im


def fan_grille(c: C, cx, cy, r, body, vanes=8):
    c.disc(cx, cy, r, OUTL)
    c.disc(cx, cy, r - 1, PLAST_GRY)
    # mesh ring
    for rr in range(3, r - 1, 3):
        c.ring(cx, cy, rr, shade(PLAST_GRY, -20))
    # vanes
    for k in range(vanes):
        # approximate radial lines
        import math
        ang = (k / vanes) * 3.14159 * 2
        for d in range(2, r - 1):
            c.p(cx + int(round(math.cos(ang) * d)), cy + int(round(math.sin(ang) * d)), OUTL)
    c.disc(cx, cy, 3, OUTL)
    c.disc(cx, cy, 2, body)


def cable(c: C, x, y, colors, n=4, vertical=True):
    for i, col in enumerate((colors * 8)[:n]):
        if vertical:
            c.vline(x + i, y, 8, col)
            c.p(x + i, y + 8, OUTL)
        else:
            c.hline(x, y + i, 8, col)
            c.p(x + 8, y + i, OUTL)


def draw_psu(psu):
    c = C()
    form = psu.get("form") or "atx"
    watts = int(psu.get("supply") or 0)
    year = psu["year"]
    beige = form == "at"
    body = BEIGE if beige else (PLAST_GRY if year < 2008 else PLAST_BLK)
    edge = shade(body, -30)
    if form == "sfx":
        x, y, w, h = 28, 30, 72, 68
    else:
        x, y, w, h = 16, 28, 96, 72
    c.rect(x, y, w, h, OUTL, body)
    # panel lines
    c.hline(x + 1, y + 8, w - 2, edge)
    # fan
    if form == "sfx":
        fan_grille(c, x + w // 2, y + h // 2 - 2, 18, body, 7)
    else:
        fan_grille(c, x + (22 if form == "at" else 24), y + h // 2, 20, body, 8)
    # IEC inlet + switch
    ix, iy = x + w - 22, y + 14
    c.rect(ix, iy, 14, 10, OUTL, DK)
    c.fill(ix + 2, iy + 2, 10, 6, STEEL)
    # red rocker on AT, black later
    c.rect(ix, iy + 14, 10, 8, OUTL, RED if beige else PLAST_BLK)
    c.hline(ix + 1, iy + 17, 8, WHT)
    # label
    lx, ly = x + w - 36, y + h - 22
    c.rect(lx, ly, 28, 14, OUTL, LABEL)
    if watts:
        text(c, lx + 3, ly + 4, f"{watts}W", DK)
    # cables leaving the bottom
    if form == "at":
        # two 6-pin P8/P9 side by side
        for i, colset in enumerate(((YEL, RED, DK), (BLU, DK, WHT))):
            cx = x + 30 + i * 16
            c.rect(cx, y + h - 1, 10, 6, OUTL, PLAST_W if False else PLAST_WHT())
            for k, col in enumerate(colset * 2):
                c.vline(cx + 2 + k * 2, y + h + 5, 8, col)
    else:
        # 24-pin block
        c.rect(x + 40, y + h - 1, 20, 6, OUTL, WHT)
        for k in range(10):
            c.p(x + 42 + k * 2, y + h + 1, PIN)
        cable(c, x + 44, y + h + 5, (YEL, RED, DK, BLU), 8, True)
        if year >= 2000:
            c.rect(x + 64, y + h - 1, 8, 5, OUTL, YEL)
            cable(c, x + 66, y + h + 4, (YEL, DK), 4, True)
    c.save(OUT / f"{psu['id']}.png")
    return c.im


def PLAST_WHT():
    return (220, 220, 215)


def hdd_face(c, x, y, w, h, era="ide", label=""):
    body = BEIGE if era in ("mfm", "ide-old") else (PLAST_GRY if era == "ide" else PLAST_BLK)
    c.rect(x, y, w, h, OUTL, body)
    # rails
    c.rect(x, y + 2, 3, h - 4, OUTL, shade(body, -25))
    c.rect(x + w - 3, y + 2, 3, h - 4, OUTL, shade(body, -25))
    # label (no lettering — wattage-style glyphs looked wrong on drives)
    c.rect(x + 8, y + 6, w - 16, 12, OUTL, LABEL)
    c.fill(x + 10, y + 8, w - 20, 3, shade(LABEL, -20))
    c.fill(x + 10, y + 13, (w - 20) // 2, 2, shade(LABEL, -30))
    # screws
    for sx, sy in ((x + 4, y + 4), (x + w - 5, y + 4), (x + 4, y + h - 5), (x + w - 5, y + h - 5)):
        c.disc(sx, sy, 1, STEEL)


def draw_drive(drv):
    c = C()
    bid, year, iface = drv["id"], drv["year"], drv.get("iface") or ""
    name = (drv["name"] + " " + (drv.get("spec") or "")).lower()
    gb = drv.get("gb") or 0

    m2_ids = {"d-950pro", "d-mp600", "d-970evo", "d-980pro", "d-sn850", "d-990pro", "d-t700"}
    ssd25 = {"d-x25m", "d-vertex", "d-840pro", "d-850evo", "d-mx500"}

    if bid == "d-900p" or iface == "pcie" and "optane" in name:
        # AIC: short PCIe card with a bulky heatsink
        x, y, w, h = 18, 36, 92, 56
        c.rect(x, y, w, h, OUTL, PCB["green"] if year < 2018 else PCB["black"])
        # bracket
        c.rect(x - 6, y - 4, 6, h + 10, OUTL, STEEL)
        c.rect(x - 4, y + 4, 3, 8, OUTL, BG)
        c.rect(x - 4, y + h - 10, 3, 6, OUTL, BG)
        # heatsink fins
        c.rect(x + 8, y + 8, 70, 36, OUTL, STEEL)
        for i in range(0, 70, 3):
            c.vline(x + 8 + i, y + 9, 34, shade(STEEL, 20 if i % 6 == 0 else -10))
        c.save(OUT / f"{bid}.png")
        return c.im

    if bid in m2_ids or iface == "nvme":
        # M.2 2280 stick, chips and a label, gold edge fingers
        x, y, w, h = 14, 54, 100, 20
        pcb = PCB["black"] if year >= 2018 else PCB["green"]
        if bid in ("d-sn850", "d-mp600", "d-t700"):
            # heatsink shroud
            c.rect(x - 2, y - 4, w + 4, h + 8, OUTL, PLAST_BLK if bid != "d-sn850" else DK)
            c.rect(x, y, w, h, OUTL, STEEL if bid != "d-t700" else (20, 20, 24))
            for i in range(0, w, 4):
                c.vline(x + i, y + 1, h - 2, shade(STEEL, -20))
        else:
            c.rect(x, y, w, h, OUTL, pcb)
            chip(c, x + 8, y + 4, 22, 12, CHIP_K)
            chip(c, x + 34, y + 5, 16, 10, CHIP_K)
            chip(c, x + 54, y + 5, 16, 10, CHIP_K)
            c.rect(x + 74, y + 4, 16, 10, OUTL, LABEL)
        # edge fingers
        for i in range(0, 22, 2):
            c.p(x + w - 1, y + 2 + (0 if i < 12 else 2) + (i if i < 12 else i - 12), GOLD)
            c.fill(x + w, y + 2, 4, 6, GOLD)
            c.fill(x + w, y + 12, 4, 6, GOLD)
        c.save(OUT / f"{bid}.png")
        return c.im

    if bid in ssd25 or (iface == "sata" and gb and gb <= 1000 and year >= 2008 and bid.startswith("d-") and bid in ssd25 or bid in ssd25):
        # 2.5" SSD slim case
        x, y, w, h = 22, 40, 84, 48
        body = PLAST_BLK if year >= 2014 else STEEL
        c.rect(x, y, w, h, OUTL, body)
        c.rect(x + 6, y + 8, 40, 16, OUTL, LABEL)
        # SATA data + power on the right edge
        c.rect(x + w - 1, y + 14, 6, 8, OUTL, DK)
        c.rect(x + w - 1, y + 24, 8, 10, OUTL, WHT)
        # thin profile line
        c.hline(x + 4, y + h - 8, w - 8, shade(body, 25))
        c.save(OUT / f"{bid}.png")
        return c.im

    # Mechanical HDDs. 5.25" units are shown from the front (full-height vs
    # half-height bezels). 3.5" units are shown from above: metal cover, label,
    # and the connector board at the back — the shape people recognise.
    is_525 = bid in ("d-st506", "d-st225") or "5.25" in name
    is_25 = bid in ("d-vraptor",) or "2.5" in name
    era = "mfm" if iface == "mfm" or year < 1990 else ("ide-old" if year < 1996 else ("ide" if iface == "ide" else "sata"))
    if is_525:
        full = bid == "d-st506"
        x, y, w, h = 18, (14 if full else 28), 92, (100 if full else 72)
        c.rect(x, y, w, h, OUTL, BEIGE)
        # faceplate recess
        c.rect(x + 6, y + 8, w - 12, h - 16, OUTL, BEIGE_DK)
        # vent slats (not a floppy slot)
        slat_y = y + 14
        slat_h = h - 36
        for i in range(0, slat_h, 4):
            c.hline(x + 12, slat_y + i, w - 32, shade(BEIGE, -50))
        c.rect(x + w - 18, y + h - 22, 8, 8, OUTL, RED)  # activity LED
        c.rect(x + 10, y + h - 18, 16, 6, OUTL, STEEL)  # latch / ground tab
    elif is_25:
        x, y, w, h = 26, 38, 76, 52
        # VelociRaptor: 2.5" in a finned 3.5" frame
        c.rect(x - 8, y - 6, w + 16, h + 12, OUTL, STEEL)
        for i in range(0, w + 16, 3):
            c.vline(x - 8 + i, y - 5, h + 10, shade(STEEL, -15))
        c.rect(x, y, w, h, OUTL, PLAST_BLK)
        c.rect(x + 8, y + 8, 36, 12, OUTL, LABEL)
        c.fill(x + 10, y + 10, 32, 3, shade(LABEL, -20))
    else:
        # 3.5" HDD, top-down
        x, y, w, h = 16, 28, 96, 72
        cover = BEIGE if era in ("mfm", "ide-old") else (STEEL if era == "ide" else (PLAST_BLK if year >= 2010 else STEEL))
        c.rect(x, y, w, h, OUTL, cover)
        # corner screws
        for sx, sy in ((x + 5, y + 5), (x + w - 6, y + 5), (x + 5, y + h - 14), (x + w - 6, y + h - 14)):
            c.disc(sx, sy, 2, OUTL)
            c.p(sx, sy, GOLD)
        # label
        c.rect(x + 14, y + 10, 44, 22, OUTL, LABEL)
        c.fill(x + 16, y + 13, 40, 3, shade(LABEL, -25))
        c.fill(x + 16, y + 19, 24, 2, shade(LABEL, -35))
        c.fill(x + 16, y + 24, 16, 2, shade(LABEL, -20))
        # spindle ring (under the cover, slightly proud)
        c.ring(x + w - 26, y + 28, 10, shade(cover, -25))
        c.ring(x + w - 26, y + 28, 6, shade(cover, -15))
        c.disc(x + w - 26, y + 28, 3, STEEL)
        # rear PCB with connectors
        c.rect(x + 4, y + h - 10, w - 8, 10, OUTL, PCB["green"] if year < 2008 else PCB["dkgreen"])
        if year >= 2003 and iface != "ide":
            c.rect(x + w - 28, y + h - 8, 8, 6, OUTL, DK)   # SATA data
            c.rect(x + w - 18, y + h - 8, 12, 6, OUTL, WHT)  # SATA power
        else:
            c.rect(x + w - 36, y + h - 8, 18, 6, OUTL, DK)  # IDE
            c.rect(x + w - 16, y + h - 8, 10, 6, OUTL, WHT)  # molex
    c.save(OUT / f"{bid}.png")
    return c.im


def draw_media(med):
    c = C()
    bid, year = med["id"], med["year"]
    name = (med["name"] + " " + (med.get("spec") or "")).lower()
    iface = med.get("iface") or ""

    def bezel(x, y, w, h, color, slot_w, slot_y=None, led=True, eject=True):
        c.rect(x, y, w, h, OUTL, color)
        sy = slot_y if slot_y is not None else y + h // 2 - 3
        c.rect(x + 8, sy, slot_w, 6, OUTL, DK)
        # lip
        c.hline(x + 9, sy + 1, slot_w - 2, STEEL)
        if led:
            c.rect(x + w - 14, y + h - 12, 6, 4, OUTL, GRN)
        if eject:
            c.rect(x + w - 14, y + 8, 6, 8, OUTL, shade(color, -20))

    if bid == "r-8inch":
        x, y, w, h = 16, 16, 96, 96
        c.rect(x, y, w, h, OUTL, BEIGE)
        # huge disk slot
        c.rect(x + 10, y + 28, 76, 10, OUTL, DK)
        c.rect(x + 36, y + 8, 24, 16, OUTL, BEIGE_DK)  # latch
        c.disc(x + w // 2, y + 64, 16, shade(BEIGE, -20))
        c.disc(x + w // 2, y + 64, 6, STEEL)
        c.save(OUT / f"{bid}.png")
        return c.im

    if bid in ("r-sa400", "r-disk2", "r-360k") or "5.25" in name:
        x, y, w, h = 18, 28, 92, 72
        bezel(x, y, w, h, BEIGE, 68, y + 30)
        # latch lever
        c.rect(x + 12, y + 12, 16, 10, OUTL, BEIGE_DK)
        c.vline(x + 20, y + 8, 8, OUTL)
        c.save(OUT / f"{bid}.png")
        return c.im

    if bid in ("r-144", "r-ls120") or "3.5-inch" in name or "3.5" in name:
        x, y, w, h = 22, 36, 84, 56
        color = BEIGE if year < 1992 else PLAST_GRY
        bezel(x, y, w, h, color, 50, y + 24)
        # 3.5 eject button, narrower slot
        c.rect(x + w - 16, y + h // 2 - 6, 8, 12, OUTL, shade(color, 20))
        c.save(OUT / f"{bid}.png")
        return c.im

    if bid in ("r-zip", "r-ez135", "r-jaz"):
        x, y, w, h = 18, 32, 92, 64
        color = PLAST_GRY if bid != "r-zip" else (70, 90, 110)
        bezel(x, y, w, h, color, 54, y + 28)
        # cartridge mouth a bit taller
        c.rect(x + 10, y + 24, 54, 12, OUTL, DK)
        c.save(OUT / f"{bid}.png")
        return c.im

    # Optical: CD / DVD / HD DVD / Blu-ray
    x, y, w, h = 16, 34, 96, 60
    color = PLAST_GRY if year < 2004 else PLAST_BLK
    c.rect(x, y, w, h, OUTL, color)
    # tray
    c.rect(x + 8, y + 18, 70, 16, OUTL, shade(color, 20))
    c.rect(x + 14, y + 22, 58, 8, OUTL, DK)
    # disc window tint by format
    tint = (40, 140, 80)  # CD greenish
    if "dvd" in bid or "dvd" in name:
        tint = (80, 40, 40)
    if bid == "r-hddvd":
        tint = (40, 60, 140)
    if bid == "r-bd" or "blu" in name:
        tint = (30, 50, 160)
    c.disc(x + 42, y + 26, 5, tint)
    c.disc(x + 42, y + 26, 1, DK)
    # eject + LED
    c.rect(x + w - 16, y + 22, 8, 10, OUTL, shade(color, -15))
    led = BLU if bid == "r-bd" else (ORG if "rw" in bid or "rw" in name else GRN)
    c.rect(x + w - 16, y + h - 14, 6, 4, OUTL, led)
    c.save(OUT / f"{bid}.png")
    return c.im


def draw_addin(card):
    c = C()
    bid, year = card["id"], card["year"]
    name = (card["name"] + " " + (card.get("spec") or "")).lower()
    isa = year < 1995 or "isa" in name
    pcb = PCB["tan"] if isa else (PCB["green"] if year < 2006 else PCB["dkgreen"])
    # horizontal card, metal bracket on the left
    x, y, w, h = 20, 40, 96, 48
    if "raid" in name or bid.startswith("x-fast") or bid.startswith("x-raid") or "physx" in name:
        h = 56
        y = 36
    c.rect(x, y, w, h, OUTL, pcb)
    traces(c, x, y, w, h, pcb)
    # bracket
    c.rect(x - 8, y - 8, 8, h + 18, OUTL, STEEL)
    c.rect(x - 6, y - 2, 4, 8, OUTL, BG)  # slot cut
    c.rect(x - 6, y + h - 4, 4, 6, OUTL, BG)
    # edge fingers along the bottom
    for i in range(4, w - 8, 2):
        c.fill(x + i, y + h, 1, 5, GOLD)
    if not isa:
        # PCI key gap
        c.fill(x + 28, y + h, 4, 5, BG)
    # chips
    chip(c, x + 10, y + 10, 22, 16, CHIP_K)
    chip(c, x + 38, y + 14, 14, 10, CHIP_K)
    cap(c, x + 56, y + 16, 2, CAP_YL)
    cap(c, x + 62, y + 16, 2, CAP_BL)
    # rear ports on the bracket
    if "wintv" in bid or "tv" in name:
        c.disc(x - 4, y + 16, 3, OUTL)
        c.disc(x - 4, y + 16, 2, STEEL)
        c.disc(x - 4, y + 28, 3, OUTL)
        c.disc(x - 4, y + 28, 2, STEEL)
    elif "hd60" in bid or "4k60" in bid or "capture" in name or "elgatto" in name:
        io_port(c, x - 7, y + 14, "hdmi")
        io_port(c, x - 7, y + 24, "hdmi")
    elif "raid" in name or "fasttrak" in name:
        for i in range(2):
            c.rect(x - 7, y + 12 + i * 10, 6, 6, OUTL, STEEL)
    else:
        io_port(c, x - 7, y + 16, "vga")
    # RAM / extra chips on later cards
    if year >= 2006:
        for i in range(2):
            chip(c, x + 72, y + 10 + i * 14, 16, 10, CHIP_K)
    c.save(OUT / f"{bid}.png")
    return c.im


def main():
    out_dir = OUT
    n = 0
    for board in META["boards"]:
        draw_board(board)
        n += 1
    for psu in META["psus"]:
        draw_psu(psu)
        n += 1
    for drv in META["drives"]:
        draw_drive(drv)
        n += 1
    for med in META["media"]:
        draw_media(med)
        n += 1
    for card in META["addins"]:
        draw_addin(card)
        n += 1
    print(f"wrote {n} icons to {out_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
