exec(open("lib.py").read())
WOOD=(134,86,48); BRASS=(200,152,60); STEEL=(150,156,172); COP=(196,112,60); GLASS=(150,196,212); PAPER=(226,218,192)
GOLD=(222,182,72); GLOWY=(255,196,88)
I={}
def icon(f): I[f.__name__]=f; return f

@icon
def n01():  # groundwood pulping
    im,d=canvas(); shadow(d,64,112,52,10)
    # grindstone on frame
    box(d,58,92,104,104,(96,62,34))
    d.ellipse((50,14,114,78),fill=(118,116,132)); d.ellipse((54,18,108,72),fill=(140,138,154)); d.ellipse((58,22,96,60),fill=(156,154,170))
    import random; random.seed(1)
    for _ in range(40):
        x=random.randint(56,106); y=random.randint(20,72)
        if (x-82)**2+(y-46)**2<26**2: d.point((x,y),(176,174,190) if random.random()<.5 else (110,108,124))
    d.ellipse((76,40,88,52),fill=(60,58,70)); d.ellipse((79,43,85,49),fill=(30,30,40))
    d.rectangle((80,78,84,92),fill=(90,60,34))
    # logs pressed in from left
    for y in (26,46):
        cylh(d,10,y,58,y+14,WOOD)
        d.ellipse((4,y,18,y+14),fill=(212,168,110)); d.ellipse((7,y+3,15,y+11),fill=(186,140,86)); d.ellipse((10,y+6,12,y+8),fill=(150,104,62))
        d.rectangle((56,y+3,60,y+11),fill=PAPER)
    # pulp drips + tub
    d.ellipse((50,66,56,72),fill=PAPER); d.ellipse((46,76,51,81),fill=PAPER)
    cylh(d,12,90,62,108,(120,80,44)); d.rectangle((12,96,62,98),fill=(80,50,26)); d.rectangle((12,104,62,106),fill=(80,50,26))
    for x in range(14,61):
        y=88+int(2*math.sin(x/4)); d.line((x,y,x,91),fill=PAPER)
    d.point((22,89),(250,246,230)); d.point((40,88),(250,246,230))
    return im
@icon
def n02():  # continuous paper machine
    im,d=canvas(); shadow(d,64,110,56,10)
    box(d,10,92,118,104,(92,96,112))
    # paper web running over rollers
    d.polygon([(6,50),(122,50),(122,56),(6,56)],fill=PAPER); d.line((6,50,122,50),fill=(250,246,232))
    for x in (24,52,80,108):
        for y,c in ((38,(110,114,130)),(68,(110,114,130))):
            d.ellipse((x-12,y-12,x+12,y+12),fill=c); d.ellipse((x-9,y-11,x+7,y+5),fill=(170,176,192)); d.ellipse((x-3,y-3,x+3,y+3),fill=(60,62,74))
        d.rectangle((x-2,80,x+2,92),fill=(80,82,96))
    d.polygon([(6,50),(122,50),(122,56),(6,56)],fill=PAPER); d.line((6,50,122,50),fill=(250,246,232)); d.line((6,56,122,56),fill=(180,170,140))
    # pulp vat at left
    cylh(d,2,58,26,90,(96,62,34)); d.rectangle((4,58,24,62),fill=(200,192,162))
    return im
@icon
def n03():  # difference engine
    im,d=canvas(); shadow(d,64,114,50,10)
    box(d,16,100,112,110,(110,70,38)); box(d,16,10,112,18,(110,70,38))
    for x in (34,64,94):
        d.rectangle((x-2,18,x+2,100),fill=(170,176,192))
        for k,y in enumerate(range(24,96,14)):
            d.ellipse((x-14,y,x+14,y+10),fill=(150,108,36)); d.ellipse((x-14,y-2,x+14,y+8),fill=BRASS); d.ellipse((x-10,y,x+6,y+4),fill=(236,196,110))
            d.rectangle((x-1,y+1,x+1,y+3),fill=(70,50,20))
    # crank
    d.line((112,50,122,40),fill=(170,176,192),width=3); d.ellipse((118,34,126,42),fill=(150,100,60))
    return im
@icon
def n04():  # analytical engine: big gear + card chain
    im,d=canvas(); shadow(d,60,112,50,10)
    gear(d,48,52,40,32,12,BRASS); gear(d,96,30,20,15,9,(170,120,44))
    for k in range(4):
        x=74+k*4; y=62+k*12
        box(d,x,y,x+40,y+10,PAPER,1)
        for i in range(5):
            if (i+k)%2==0: d.rectangle((x+5+i*7,y+3,x+7+i*7,y+6),fill=(60,52,44))
    return im
@icon
def n05():  # boolean algebra: AND gate
    im,d=canvas(); shadow(d,64,112,46,8)
    for y in (46,82): d.rectangle((8,y-2,34,y+2),fill=(170,176,192))
    d.rectangle((96,62,122,66),fill=(170,176,192))
    d.rectangle((30,26,64,102),fill=(150,120,230)); d.pieslice((26,26,102,102),-90,90,fill=(150,120,230))
    d.rectangle((36,32,64,96),fill=(110,84,190)); d.pieslice((32,32,96,96),-90,90,fill=(110,84,190))
    d.line((34,28,64,28),fill=(200,180,255),width=2)
    txt(d,54,50,"1",(120,240,150),5)
    d.ellipse((4,42,12,50),fill=(120,240,150)); d.ellipse((4,78,12,86),fill=(120,240,150)); d.ellipse((118,60,126,68),fill=(120,240,150))
    return im
@icon
def n06():  # electric tabulator
    im,d=canvas(); shadow(d,64,114,54,10)
    box(d,12,14,116,74,(120,78,44),3); box(d,18,20,110,68,(98,62,34),2)
    for i,x in enumerate((34,64,94)):
        for j,y in enumerate((34,56)):
            d.ellipse((x-11,y-11,x+11,y+11),fill=(60,40,24)); d.ellipse((x-9,y-9,x+9,y+9),fill=(236,232,220))
            a=(i*2+j)*1.1; d.line((x,y,x+7*math.cos(a),y+7*math.sin(a)),fill=(30,30,40),width=2)
            for t in range(10):
                b=t*math.pi/5; d.point((x+8*math.cos(b),y+8*math.sin(b)),(90,80,70))
    box(d,8,76,120,90,(90,92,108)); box(d,24,88,104,108,(110,112,128))
    box(d,36,80,92,94,PAPER,1)
    for i in range(6): d.rectangle((40+i*8,84,42+i*8,87),fill=(60,52,44))
    return im
@icon
def n07():  # telegraph line
    im,d=canvas(); shadow(d,64,116,30,8)
    cylv(d,58,10,70,112,WOOD); box(d,20,22,108,30,(110,70,38))
    for x in (28,50,78,100):
        d.rectangle((x-2,14,x+2,22),fill=(90,60,34)); d.ellipse((x-5,8,x+5,18),fill=(110,170,190)); d.ellipse((x-3,9,x+1,13),fill=(200,236,246))
    for x0 in (28,50,78,100):
        pts=[(x0+(-64 if x0<64 else 64)*t, 12+16*math.sin(t*math.pi)) for t in [i/20 for i in range(21)]]
        d.line(pts,fill=COP,width=2)
    # key at base
    box(d,74,98,118,108,(110,70,38)); d.line((80,94,112,90),fill=BRASS,width=3); d.ellipse((108,84,118,94),fill=(30,30,40))
    return im
@icon
def n08():  # automatic glass-blowing machine
    im,d=canvas(); shadow(d,64,114,52,10)
    box(d,10,100,118,110,(80,84,100))
    for x in (14,92):
        box(d,x,30,x+22,100,(110,116,132)); d.rectangle((x+4,40,x+18,44),fill=(70,74,90))
    # glowing bottle in the open mold
    glow(d,64,70,34,(255,150,60))
    d.rectangle((56,20,72,34),fill=(250,170,80)); d.polygon([(56,34),(72,34),(88,52),(88,98),(40,98),(40,52)],fill=(240,140,60))
    d.polygon([(60,34),(66,34),(54,52),(54,92),(46,92),(46,54)],fill=(255,210,140))
    d.rectangle((52,12,76,20),fill=(150,156,172))
    # mold halves
    box(d,36,46,44,100,(90,94,110)); box(d,84,46,92,100,(90,94,110))
    return im
@icon
def n09():  # incandescent lamp
    im,d=canvas(); shadow(d,64,116,24,6)
    glow(d,64,46,52,GLOWY)
    d.ellipse((30,8,98,76),fill=(250,214,130)); d.ellipse((36,14,92,70),fill=(255,232,170)); d.ellipse((42,18,62,36),fill=(255,252,236))
    d.line([(52,72),(54,48)],fill=(140,110,60),width=2); d.line([(76,72),(74,48)],fill=(140,110,60),width=2)
    d.line([(54,48),(58,40),(62,48),(66,40),(70,48),(74,48)],fill=(255,120,20),width=3)
    cylv(d,46,74,82,96,(176,182,196))
    for y in (78,84,90): d.line((46,y,82,y),fill=(110,114,130))
    cylv(d,54,96,74,104,(110,114,130)); d.rectangle((60,104,68,110),fill=(70,60,40))
    return im
@icon
def n10():  # thermionic emission
    im,d=canvas(); shadow(d,64,116,30,8)
    d.ellipse((20,8,108,96),fill=(90,130,150)); d.ellipse((24,12,104,92),fill=(40,52,74)); d.ellipse((30,16,58,40),fill=(110,150,170))
    # heated filament (left) and plate (right)
    d.line([(36,70),(42,60),(48,70),(54,60)],fill=(255,150,40),width=3); glow(d,46,64,14,(255,150,40))
    d.line([(36,70),(42,60),(48,70),(54,60)],fill=(255,180,80),width=3)
    box(d,76,34,86,76,(170,176,192),2)
    for (x,y) in ((56,56),(62,50),(66,58),(70,46),(60,42),(72,56)): d.ellipse((x-2,y-2,x+2,y+2),fill=(110,190,255))
    cylv(d,46,92,82,110,(110,114,130)); d.line((44,72,44,92),fill=(170,176,192),width=2); d.line((80,76,80,92),fill=(170,176,192),width=2)
    return im
