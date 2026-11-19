@icon
def n21():  # packet network
    im,d=canvas(); shadow(d,64,116,50,8)
    nodes=[(22,24),(106,24),(22,96),(106,96),(64,60)]
    for a,b in ((0,4),(1,4),(2,4),(3,4),(0,1),(2,3)): d.line((nodes[a],nodes[b]),fill=(110,114,140),width=3)
    for (x,y) in nodes:
        box(d,x-14,y-10,x+14,y+10,(70,120,200),2); d.rectangle((x-9,y-5,x+9,y+3),fill=(150,210,255)); d.rectangle((x-4,y+10,x+4,y+14),fill=(80,84,100))
    for (x,y) in ((42,40),(86,80),(64,24)): box(d,x-4,y-4,x+4,y+4,GOLD,1)
    return im
@icon
def n22():  # microprocessor
    im,d=canvas(); shadow(d,64,116,50,8)
    for i in range(7):
        p=26+i*12; d.rectangle((p,8,p+4,20),fill=(220,190,90)); d.rectangle((p,108,p+4,120),fill=(220,190,90))
        d.rectangle((8,p,20,p+4),fill=(220,190,90)); d.rectangle((108,p,120,p+4),fill=(220,190,90))
    box(d,18,18,110,110,(222,222,230),3)
    box(d,38,38,90,90,GOLD,3); d.rectangle((50,50,78,78),fill=(70,60,90))
    for i in range(4):
        for j in range(4): d.rectangle((53+i*7,53+j*7,56+i*7,56+j*7),fill=(130,120,170))
    return im
@icon
def n23():  # GUI
    im,d=canvas(); shadow(d,64,118,54,6)
    box(d,6,10,122,96,(200,204,216),3); d.rectangle((12,16,116,90),fill=(240,240,246))
    d.rectangle((12,16,116,26),fill=(80,130,220)); d.rectangle((106,18,114,24),fill=(230,80,80)); d.rectangle((96,18,104,24),fill=(240,200,70))
    box(d,18,34,32,48,GOLD,1); box(d,18,56,32,70,(80,190,110),1)
    box(d,44,34,108,84,(200,204,216),2); d.rectangle((46,36,106,42),fill=(120,120,150))
    for y in (50,58,66): d.line((50,y,96,y),fill=(150,150,170),width=2)
    d.polygon([(76,64),(76,104),(86,94),(94,110),(100,107),(92,92),(104,92)],fill=(20,20,30))
    d.polygon([(79,71),(79,98),(86,91),(94,106),(97,104),(89,89),(98,89)],fill=(250,250,255))
    box(d,48,98,80,104,(160,164,178),1)
    return im
@icon
def n24():  # home computer kit front panel
    im,d=canvas(); shadow(d,64,112,58,8)
    box(d,4,36,124,100,(70,90,150),3); d.rectangle((8,40,120,58),fill=(40,52,96))
    for i in range(14):
        x=12+i*8; d.ellipse((x,46,x+4,50),fill=(255,80,70) if i%3 else (90,30,30))
    for i in range(14):
        x=12+i*8; d.rectangle((x,66,x+4,80),fill=(60,60,72)); d.rectangle((x,64 if i%2 else 72,x+4,72 if i%2 else 80),fill=(236,236,244))
    d.rectangle((8,86,120,94),fill=(50,64,110))
    box(d,10,100,26,108,(40,40,50),1); box(d,102,100,118,108,(40,40,50),1)
    # box flap (kit)
    d.polygon([(10,36),(118,36),(104,18),(24,18)],fill=(180,140,90)); d.line((24,18,104,18),fill=(210,176,120),width=2)
    return im
@icon
def n25():  # 3D accelerator card
    im,d=canvas(); shadow(d,64,114,58,8)
    box(d,4,30,118,92,(40,130,80),3)
    for i in range(12): d.rectangle((14+i*7,92,18+i*7,104),fill=(222,182,72))
    box(d,96,38,112,84,(150,156,172),2)
    box(d,14,40,40,62,(40,40,50),2); box(d,14,66,40,84,(40,40,50),2)
    # wireframe cube
    a=(52,48);b=(78,42);c=(88,54);e=(62,60)
    off=22
    pts=[a,b,c,e]; low=[(x,y+off) for (x,y) in pts]
    for i in range(4):
        d.line((pts[i],pts[(i+1)%4]),fill=(236,240,255),width=2); d.line((low[i],low[(i+1)%4]),fill=(150,220,255),width=2); d.line((pts[i],low[i]),fill=(200,230,255),width=2)
    d.polygon(pts,fill=(120,200,255)); d.line(pts+[a],fill=(236,240,255),width=2)
    return im
@icon
def n26():  # shader sphere
    im,d=canvas(); shadow(d,64,112,44,10)
    for r in range(46,0,-1):
        t=r/46; ox=-12*(1-t); oy=-12*(1-t)
        c=mix((250,240,255),mix((170,130,255),(30,20,60),t**1.6),min(1,t*1.4)) if t<0.7 else mix((170,130,255),(26,18,52),(t-0.7)/0.3)
        d.ellipse((64+ox-r,54+oy-r,64+ox+r,54+oy+r),fill=c)
    d.ellipse((40,30,48,38),fill=(255,255,255))
    # rim light
    d.arc((18,8,110,100),20,110,fill=(120,220,255),width=2)
    return im
@icon
def n27():  # RGB LED strip
    im,d=canvas(); shadow(d,64,110,58,8)
    cols=[(255,70,70),(255,170,40),(80,230,110),(70,160,255),(170,110,255)]
    for i,c in enumerate(cols): glow(d,14+i*25,56,18,c)
    box(d,2,62,126,82,(30,30,38),2)
    for i,c in enumerate(cols):
        x=14+i*25; box(d,x-8,64,x+8,80,(230,230,236),1); d.rectangle((x-5,67,x+5,77),fill=c); d.rectangle((x-4,68,x-1,70),fill=(255,255,255))
    for i in range(6): d.rectangle((1+i*25,84,5+i*25,90),fill=(222,182,72))
    return im
@icon
def n28():  # shor's algorithm 15 -> 3 x 5
    im,d=canvas(); shadow(d,64,116,40,6)
    box(d,36,10,92,46,(70,60,130),3); txt(d,46,16,"15",(236,236,250),5)
    d.line((52,46,30,72),fill=(150,120,230),width=4); d.line((76,46,98,72),fill=(150,120,230),width=4)
    for x,s in ((10,"3"),(78,"5")):
        box(d,x,72,x+40,110,(40,130,80),3); txt(d,x+12,79,s,(220,255,220),5)
    for k in range(3):
        pts=[(4+i*2, 56+k*0+6*math.sin(i/3+k)) for i in range(60)]
    d.line([(100+i, 24+5*math.sin(i/2.5)) for i in range(26)],fill=(110,190,255),width=2)
    d.line([(2+i, 24+5*math.sin(i/2.5+1)) for i in range(32)],fill=(110,190,255),width=2)
    return im
@icon
def n29():  # superconducting qubit chip in cryostat frost
    im,d=canvas(); shadow(d,64,116,50,8)
    box(d,14,18,114,106,(40,90,120),3); d.rectangle((22,26,106,98),fill=(30,60,90))
    d.rectangle((40,40,88,84),outline=GOLD,width=5)
    d.rectangle((58,36,70,48),fill=(30,60,90)); box(d,60,38,68,46,(170,176,192),1)
    d.line((64,4,64,40),fill=GOLD,width=4); d.line((64,84,64,124),fill=GOLD,width=4)
    for (x,y) in ((104,14),(18,96)):
        for a in range(3):
            ang=a*math.pi/3; d.line((x-8*math.cos(ang),y-8*math.sin(ang),x+8*math.cos(ang),y+8*math.sin(ang)),fill=(200,240,255),width=2)
    return im
@icon
def n30():  # bloch sphere + star
    im,d=canvas(); shadow(d,64,116,44,8)
    d.ellipse((14,10,114,110),fill=(40,70,120)); d.ellipse((18,14,110,106),fill=(56,96,160)); d.ellipse((24,18,80,66),fill=(80,130,200))
    d.ellipse((14,48,114,72),outline=(150,210,255),width=2); d.line((64,10,64,110),fill=(150,210,255),width=1)
    d.line((64,60,94,24),fill=GOLD,width=4); d.ellipse((88,18,100,30),fill=(255,220,110))
    d.ellipse((60,56,68,64),fill=(230,240,255))
    cx,cy=104,100; pts=[]
    for i in range(10):
        r=16 if i%2==0 else 7; a=-math.pi/2+i*math.pi/5; pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
    d.polygon(pts,fill=(255,236,140))
    return im
