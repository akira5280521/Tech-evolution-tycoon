exec(open("px.py").read())
im,d=new(); room(d,(14,12,30),(26,20,48),"pcbb",98)
# wall LED strip glow behind desk
for x in range(0,W):
    t=x/W; c=mix((255,60,170),(60,180,255),t)
    d.point((x,96),c); d.point((x,95),sh(c,0.7))
for x in range(0,W,6): glowc(im,x,94,18,mix((255,60,170),(60,180,255),x/W),0.12)
# monitor
d.rectangle((18,99,86,101),fill=(4,4,8))
bevel(d,40,90,64,98,"dark",1); d.polygon([(48,90),(56,90),(55,74),(49,74)],fill=RAMPS["dark"][2])
bevel(d,2,12,102,76,"dark",2)
d.rectangle((4,14,100,72),fill=(8,8,12))
# game scene on screen
for y in range(15,72):
    t=(y-15)/57; d.line((5,y,99,y),fill=mix((40,30,110),(240,120,90),t))
d.ellipse((62,34,80,52),fill=(255,214,120)); d.ellipse((65,37,77,49),fill=(255,236,170))
d.polygon([(5,72),(5,56),(20,44),(34,58),(48,40),(66,60),(80,50),(99,64),(99,72)],fill=(40,30,70))
d.polygon([(5,72),(5,64),(26,56),(44,66),(64,58),(86,66),(99,62),(99,72)],fill=(24,18,44))
for x in range(8,99,9): d.rectangle((x,66,x+3,71),fill=(14,10,26)); d.point((x+1,67),(255,220,120))
d.rectangle((8,16,30,20),fill=(0,0,0)); d.rectangle((9,17,9+14,19),fill=(80,230,110))
d.line((4,73,100,73),fill=RAMPS["dark"][3]); d.point((96,74),(255,255,255))
glowc(im,52,44,50,(240,120,140),0.08)
# keyboard + mouse on pad
d.rounded_rectangle((4,104,108,116),2,fill=(10,10,16))
bevel(d,8,105,78,113,"dark",1)
cols=[(255,60,170),(160,80,255),(60,180,255),(60,230,170)]
for j in range(2):
    for i in range(16):
        x=10+i*4; y=106+j*3; c=mix(cols[(i//4)%4],cols[(i//4+1)%4],(i%4)/4)
        d.rectangle((x,y,x+2,y+1),fill=RAMPS["dark"][3]); d.point((x+1,y+1),c)
bevel(d,88,106,96,113,"dark",3); d.line((92,107,92,109),fill=(60,180,255))
# tower
glowc(im,142,60,60,(140,80,255),0.14)
d.rectangle((110,99,178,102),fill=(4,4,8))
bevel(d,108,4,178,100,"dark",2)
d.rectangle((112,8,174,96),fill=(10,12,22))
d.rectangle((114,10,166,74),fill=(16,16,22))           # black board
for y in range(12,74,5): d.line((116,y,164,y),fill=(22,22,30))
# rear exhaust fan rgb ring
def fan(cx,cy,r,c):
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=sh(c,0.45)); d.ellipse((cx-r+1,cy-r+1,cx+r-1,cy+r-1),fill=c)
    d.ellipse((cx-r+3,cy-r+3,cx+r-3,cy+r-3),fill=(14,14,20))
    for a in range(0,360,72):
        d.line((cx,cy,cx+(r-3)*math.cos(math.radians(a)),cy+(r-3)*math.sin(math.radians(a))),fill=(40,40,52),width=2)
    d.ellipse((cx-2,cy-2,cx+2,cy+2),fill=(30,30,40))
    glowc(im,cx,cy,r+8,c,0.25)
fan(122,20,8,(60,180,255))
# tower cooler
bevel(d,134,12,152,40,"steel",1)
for y in range(14,39,2): d.line((135,y,151,y),fill=RAMPS["steel"][1])
fan(143,26,7,(255,60,170))
# RAM rgb
for k,x in enumerate((156,160)):
    d.rectangle((x,12,x+2,40),fill=(30,30,36)); d.line((x,12,x+2,12),fill=cols[k]); d.rectangle((x,11,x+2,13),fill=cols[k+1])
    glowc(im,x+1,12,6,cols[k+1],0.4)
# M.2 + chipset
d.rectangle((120,44,140,46),fill=(30,30,40)); d.rectangle((122,44,132,46),fill=(60,60,74))
# GPU
bevel(d,114,50,168,64,"dark",1)
d.rectangle((116,62,166,63),fill=(60,230,170)); glowc(im,140,63,10,(60,230,170),0.3)
for cx in (126,148):
    d.ellipse((cx-6,51,cx+6,63),fill=(20,20,26))
    for a in range(0,360,60): d.line((cx,57,cx+5*math.cos(math.radians(a+15)),57+5*math.sin(math.radians(a+15))),fill=(56,56,68))
d.rectangle((166,50,170,64),fill=RAMPS["steel"][3])
# PSU shroud
bevel(d,114,78,172,94,"dark",1); d.rectangle((136,84,150,86),fill=(160,80,255))
for x in range(116,132,3): d.line((x,82,x,90),fill=RAMPS["dark"][1])
# front fans (edge of glass on right)
for y in (20,44,68): fan(171,y,4,mix((255,60,170),(60,180,255),(y-20)/48))
# glass reflection: two soft diagonal bands
for y in range(8,96):
    for off,w,al in ((0,3,0.16),(9,2,0.1)):
        for k in range(w):
            x=150-int((y-8)*0.55)+off+k
            if 112<=x<=174: d.point((x,y),mix(im.getpixel((x,y)),(210,220,255),al))
d.rectangle((110,6,111,98),fill=(50,50,64))
save(im,"sC")
