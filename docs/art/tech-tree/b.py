def tubebody(d,x0,x1,top,bot,pins):
    cx=(x0+x1)//2
    d.rectangle((x0,top+14,x1,bot),fill=(120,160,176)); d.ellipse((x0,top,x1,top+28),fill=(120,160,176))
    d.rectangle((x0+3,top+14,x1-3,bot),fill=(44,58,80)); d.ellipse((x0+3,top+3,x1-3,top+25),fill=(44,58,80))
    d.rectangle((x0+5,top+12,x0+9,bot-6),fill=(170,206,220))
    cylv(d,x0-2,bot,x1+2,bot+14,(110,114,130))
    for i in range(pins):
        x=x0+6+i*((x1-x0-12)//max(1,pins-1)); d.rectangle((x-1,bot+14,x+1,bot+22),fill=(190,196,210))
    return cx
@icon
def n11():  # diode valve
    im,d=canvas(); shadow(d,64,118,26,6)
    cx=tubebody(d,40,88,6,90,2)
    box(d,cx-10,30,cx+10,80,(150,156,172),2); d.rectangle((cx-4,32,cx+4,78),fill=(60,62,74))
    glow(d,cx,56,10,(255,150,40)); d.line((cx,34,cx,78),fill=(255,170,60),width=2)
    return im
@icon
def n12():  # triode
    im,d=canvas(); shadow(d,64,118,26,6)
    cx=tubebody(d,38,90,6,90,3)
    box(d,cx-14,28,cx+14,82,(150,156,172),2); d.rectangle((cx-10,32,cx+10,78),fill=(50,52,66))
    for y in range(34,78,5): d.line((cx-8,y,cx+8,y+2),fill=(200,206,220),width=1)
    glow(d,cx,56,9,(255,150,40)); d.line((cx,34,cx,78),fill=(255,180,70),width=2)
    return im
@icon
def n13():  # turing tape
    im,d=canvas(); shadow(d,64,110,56,8)
    box(d,0,60,127,92,PAPER,2)
    for x in range(0,128,22): d.rectangle((x,60,x+1,92),fill=(150,140,110))
    for i,ch in enumerate("10110"):
        if ch!=" ": txt(d,6+i*22,66,ch,(40,36,50),4)
    # head
    box(d,46,14,82,44,(150,120,230),2); d.polygon([(54,44),(74,44),(64,56)],fill=(110,84,190))
    d.rectangle((54,22,74,30),fill=(60,40,120)); d.rectangle((58,24,62,28),fill=(120,240,150))
    d.line((90,104,118,104),fill=(236,232,220),width=2); d.polygon([(114,98),(122,104),(114,110)],fill=(236,232,220))
    return im
@icon
def n14():  # electronic computer
    im,d=canvas(); shadow(d,64,116,58,8)
    for x in (4,46,88):
        box(d,x,10,x+36,108,(52,50,74),2)
        for j in range(5):
            for i in range(5):
                c=GLOWY if (i*3+j+x)%4 else (255,90,80)
                d.rectangle((x+6+i*6,18+j*6,x+8+i*6,20+j*6),fill=c)
        for i in range(3): d.ellipse((x+5+i*10,56,x+13+i*10,64),fill=(220,220,232)); d.line((x+9+i*10,60,x+11+i*10,57),fill=(30,30,40))
        for j in range(3): d.rectangle((x+6,72+j*10,x+30,76+j*10),fill=(30,30,46))
        for j in range(3):
            for i in range(4): d.rectangle((x+7+i*6,73+j*10,x+9+i*6,75+j*10),fill=(120,180,200))
    return im
@icon
def n15():  # point-contact transistor
    im,d=canvas(); shadow(d,64,116,40,8)
    box(d,28,82,100,102,(130,134,150)); box(d,40,70,88,84,(96,100,118))
    d.polygon([(44,70),(84,70),(76,58),(52,58)],fill=(140,140,160))
    d.line((30,8,60,58),fill=GOLD,width=3); d.line((98,8,68,58),fill=GOLD,width=3)
    glow(d,64,58,8,(255,220,120)); d.ellipse((60,55,68,61),fill=(255,240,180))
    d.rectangle((62,102,66,118),fill=(190,196,210))
    return im
@icon
def n16():  # zone refining
    im,d=canvas(); shadow(d,64,112,58,8)
    cylh(d,4,50,124,70,(120,124,140))
    glow(d,64,60,26,(255,150,50)); cylh(d,52,50,76,70,(255,160,60)); d.rectangle((54,52,74,55),fill=(255,230,170))
    for x in (46,80):
        cylv(d,x,40,x+6,80,COP)
    for x in (52,58,64,70,76): d.line((x,40,x,80),fill=sh(COP,0.7))
    d.line((86,96,116,96),fill=(236,232,220),width=3); d.polygon([(112,90),(122,96),(112,102)],fill=(236,232,220))
    box(d,10,80,22,104,(80,84,100)); box(d,106,80,118,104,(80,84,100))
    return im
@icon
def n17():  # silicon transistor can (TO-18)
    im,d=canvas(); shadow(d,64,118,30,6)
    for x in (52,64,76): d.line((x,84,x-(64-x)//2,118),fill=(190,196,210),width=2)
    cylv(d,40,30,88,78,(176,182,196)); d.ellipse((40,22,88,38),fill=(200,206,220)); d.ellipse((50,26,78,34),fill=(150,156,172))
    cylv(d,36,74,92,84,(140,146,162)); d.rectangle((86,70,92,76),fill=(140,146,162))
    d.rectangle((44,40,48,72),fill=(236,240,248))
    return im
@icon
def n18():  # planar process wafer
    im,d=canvas(); shadow(d,64,104,54,12)
    d.ellipse((8,40,120,100),fill=(70,74,96)); d.ellipse((8,34,120,94),fill=(150,140,200)); d.ellipse((14,38,114,90),fill=(120,110,180))
    for j in range(-3,4):
        for i in range(-5,6):
            x=64+i*9+j*0; y=64+j*6
            if ((x-64)/50)**2+((y-64)/24)**2<0.8: d.rectangle((x-3,y-2,x+3,y+2),fill=GOLD if (i+j)%2 else (180,220,140))
    d.line((24,50,60,42),fill=(230,226,255),width=2)
    # layer stack inset
    for k,c in enumerate(((180,180,190),(100,170,90),(222,182,72),(120,110,180))):
        d.rectangle((86,6+k*6,122,11+k*6),fill=c)
    return im
@icon
def n19():  # integrated circuit DIP
    im,d=canvas(); shadow(d,64,112,48,8)
    for i in range(6):
        x=26+i*15; d.rectangle((x,24,x+5,36),fill=(200,206,220)); d.rectangle((x,92,x+5,104),fill=(200,206,220))
    box(d,16,34,112,94,(52,52,64),3); d.pieslice((56,28,72,44),0,180,fill=(30,30,40))
    d.ellipse((24,80,30,86),fill=(90,90,104))
    txt(d,50,54,"IC",(170,176,192),4)
    return im
@icon
def n20():  # moore's law chart on paper
    im,d=canvas(); shadow(d,64,116,50,8)
    box(d,10,8,118,108,PAPER,2)
    for y in range(20,100,12): d.line((22,y,110,y),fill=(206,196,166))
    d.line((22,14,22,98),fill=(60,52,44),width=2); d.line((22,98,112,98),fill=(60,52,44),width=2)
    pts=[(26,94),(40,90),(54,82),(68,70),(82,52),(96,30)]
    d.line(pts,fill=(40,150,80),width=3)
    for (x,y) in pts[1:]: d.rectangle((x-3,y-3,x+3,y+3),fill=(220,60,60))
    d.polygon([(90,22),(106,14),(102,32)],fill=(40,150,80))
    return im
