exec(open("px.py").read())
im,d=new(); room(d,(20,17,40),(38,31,64),"wood",98)
# wall calendar
bevel(d,10,14,36,46,"beige",0); d.rectangle((12,16,34,23),fill=(190,50,50)); d.rectangle((12,16,34,17),fill=(220,90,90))
for j in range(4):
    for i in range(5): d.point((14+i*4,27+j*4),(110,100,80)); d.point((15+i*4,27+j*4),(110,100,80))
d.rectangle((22,11,24,14),fill=(150,150,160))
# desk shadow
d.rectangle((40,99,142,102),fill=RAMPS["wood"][1])
# system unit
bevel(d,38,72,142,100,"beige",2)
d.line((40,79,140,79),fill=RAMPS["beige"][1]); d.line((40,80,140,80),fill=RAMPS["beige"][4])
for i,x in enumerate((46,78)):
    inset(d,x,83,x+28,95,"beige2")
    d.rectangle((x+3,88,x+25,89),fill=(26,24,20)); d.rectangle((x+3,90,x+25,90),fill=(70,64,50))
    bevel(d,x+20,85,x+25,88,"beige2"); d.point((x+4,85),(255,60,50) if i==0 else (90,30,30))
for x in range(116,138,2): d.line((x,84,x,95),fill=RAMPS["beige"][1])
bevel(d,112,73,124,77,"dark"); 
for x in range(114,123,2): d.point((x,75),(200,170,80))
d.ellipse((128,73,133,78),fill=(60,60,70)); d.point((130,75),(200,200,210))
d.rectangle((136,74,139,76),fill=(80,230,120))
# monitor neck/base
bevel(d,76,64,104,72,"beige2",1)
# monitor body (deep CRT, drawn as front)
bevel(d,50,8,130,66,"beige",5)
for x in range(60,122,4): d.line((x,10,x+1,10),fill=RAMPS["beige"][1])
inset(d,56,13,124,58,"beige2",4)
d.rounded_rectangle((59,16,121,55),5,fill=(6,22,10))
d.rounded_rectangle((60,17,120,54),4,fill=(10,34,16))
random.seed(7)
lines=["C:\\>DIR","","LEDGER   BAS","PAYROLL  BAS","GAME     COM","","C:\\>_"]
for j,ln in enumerate(lines):
    x=64
    for ch in ln:
        if ch!=" ":
            for k in range(2):
                for m in range(3):
                    if random.random()<0.7: d.point((x+k,20+j*5+m),(90,255,140))
        x+=3
d.rectangle((85,50,86,52),fill=(170,255,190))
glowc(im,90,36,40,(60,255,120),0.12)
scan(d,(60,17,120,54),0.8)
glare(d,62,18,8,(120,200,140)); glare(d,64,18,5,(100,180,120))
d.ellipse((116,59,120,63),fill=RAMPS["beige"][1]); d.point((117,60),RAMPS["beige"][4])
d.rectangle((60,60,72,62),fill=RAMPS["beige"][1])
for x in range(61,72,2): d.point((x,61),(190,180,150))
# keyboard
d.rectangle((36,113,146,115),fill=RAMPS["wood"][1])
bevel(d,34,103,146,114,"beige",2)
for j in range(3):
    for i in range(24):
        x=37+i*4+(j%2); y=105+j*3
        d.rectangle((x,y,x+2,y+1),fill=RAMPS["beige"][4]); d.point((x+2,y+1),RAMPS["beige"][1])
d.rectangle((60,111,112,112),fill=RAMPS["beige"][4])
# floppy disks
for k,(x,y) in enumerate(((4,104),(10,101))):
    d.rectangle((x,y,x+16,y+9),fill=(20,20,26)); d.rectangle((x+3,y+1,x+12,y+4),fill=(230,226,210) if k else (220,210,120)); d.rectangle((x+7,y+6,x+9,y+8),fill=(60,60,70))
# mug
bevel(d,156,96,168,110,[(60,20,20),(120,40,40),(170,60,60),(190,80,80),(220,120,120)],2)
d.arc((165,99,173,107),-90,90,fill=(120,40,40),width=2)
for i in range(3): d.point((160+i*2,92-i),(120,110,130))
save(im,"sA")
