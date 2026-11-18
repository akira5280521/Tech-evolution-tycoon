exec(open("px.py").read())
im,d=new(); room(d,(22,18,44),(40,34,70),"wood",98)
# CRT monitor
d.rectangle((10,99,90,102),fill=RAMPS["wood"][1])
bevel(d,30,88,70,99,"beige2",2); bevel(d,40,84,60,90,"beige2",1)
bevel(d,6,16,94,86,"beige",6)
for x in (12,16,20): d.line((x,78,x,82),fill=RAMPS["beige"][1])
inset(d,13,22,87,76,"beige2",5)
d.rounded_rectangle((16,25,84,73),6,fill=(10,40,60))
d.rounded_rectangle((17,26,83,72),5,fill=(30,110,130))
# desktop: window + icons + bar
for k,(x,y,c) in enumerate(((21,30,(240,240,200)),(21,40,(250,210,90)),(21,50,(200,90,90)))):
    d.rectangle((x,y,x+5,y+5),fill=c); d.rectangle((x,y+7,x+5,y+7),fill=(220,240,240))
bevel(d,34,32,76,62,"steel",0); d.rectangle((36,34,74,38),fill=(30,40,140)); d.rectangle((70,35,73,37),fill=(200,200,210))
d.rectangle((37,41,73,60),fill=(250,250,250))
for j in range(5): d.line((39,44+j*3,39+[30,24,32,18,26][j],44+j*3),fill=(90,90,110))
d.rectangle((17,67,83,72),fill=(176,180,190)); d.line((17,67,83,67),fill=(230,230,236)); bevel(d,18,68,28,71,"steel",0)
glowc(im,50,48,44,(120,220,240),0.1); scan(d,(17,26,83,72),0.86)

d.ellipse((80,79,85,84),fill=(70,200,90)); bevel(d,62,79,76,83,"beige2",0)
# mouse + pad
d.rounded_rectangle((60,104,92,114),2,fill=(40,60,120)); bevel(d,72,105,80,112,"beige",3); d.line((76,105,76,108),fill=RAMPS["beige"][1])
d.line((76,104,80,96),fill=(160,150,120))
# screwdriver
d.rectangle((14,108,30,110),fill=(200,40,40)); d.line((14,108,30,108),fill=(240,100,100)); d.rectangle((31,108,44,109),fill=(200,206,220))
# --- tower, side panel off ---
d.rectangle((104,99,176,102),fill=RAMPS["wood"][1])
bevel(d,102,4,176,100,"beige",2)
d.rectangle((106,8,172,96),fill=(30,32,40))          # chassis interior
d.rectangle((108,10,170,94),fill=(44,46,56))
# PSU top
bevel(d,140,10,170,30,"steel",1)
for i in range(4): d.ellipse((146+i*0,13,164,27),outline=RAMPS["steel"][1]) if i==0 else None
d.ellipse((147,13,163,27),fill=RAMPS["steel"][1]); d.ellipse((149,15,161,25),fill=(30,32,40))
for a in range(0,360,45): d.line((155,20,155+5*math.cos(math.radians(a)),20+5*math.sin(math.radians(a))),fill=RAMPS["steel"][2])
# drive bays front (left side of tower interior as seen)
for j,y in enumerate((12,22)):
    bevel(d,108,y,136,y+8,"steel",0)
d.rectangle((110,15,134,16),fill=(20,20,26))
# motherboard
d.rectangle((110,34,166,92),fill=RAMPS["pcbg"][2])
dith(d,(110,34,166,92),RAMPS["pcbg"][2],RAMPS["pcbg"][3])
for y in range(36,92,6): d.line((112,y,164,y),fill=RAMPS["pcbg"][1])
# cpu cartridge (vertical) with fan
bevel(d,142,36,164,56,"dark",1); bevel(d,144,38,162,54,"steel",1)
d.ellipse((147,40,159,52),fill=(30,30,36)); 
for a in range(0,360,60): d.line((153,46,153+5*math.cos(math.radians(a+20)),46+5*math.sin(math.radians(a+20))),fill=(110,114,130))
d.ellipse((151,44,155,48),fill=(200,170,60))
# RAM: two filled + one empty
for k,x in enumerate((128,132,136)):
    d.rectangle((x,36,x+2,66),fill=(20,20,24))
    if k<2:
        d.rectangle((x,34,x+2,68),fill=RAMPS["pcbg"][4]); d.line((x+2,34,x+2,68),fill=RAMPS["pcbg"][1])
        for y in range(37,66,6): d.rectangle((x,y,x+1,y+3),fill=(26,26,32))
        d.point((x+1,68),RAMPS["gold"][3])
# chipset heatsink
bevel(d,114,38,124,46,"steel",0); 
for x in range(115,124,2): d.line((x,39,x,45),fill=RAMPS["steel"][1])
# capacitors
for (x,y) in ((116,50),(120,50),(124,52),(140,60)):
    d.rectangle((x,y,x+2,y+3),fill=(40,60,150)); d.point((x,y),(120,150,230))
# AGP slot empty, highlighted
d.rectangle((114,64,160,66),fill=(130,80,40)); d.line((114,64,160,64),fill=(170,110,60))
for x in range(112,163,3): d.point((x,61),(255,190,0)); d.point((x,69),(255,190,0))
for y in range(61,70,3): d.point((112,y),(255,190,0)); d.point((162,y),(255,190,0))
# PCI slots + a card
for y in (74,80,86): d.rectangle((114,y,154,y+1),fill=(230,230,236))
bevel(d,116,72,148,78,"pcbg",0); d.rectangle((118,77,146,77),fill=RAMPS["gold"][3]); d.rectangle((120,73,126,76),fill=(20,20,26))
d.rectangle((166,70,170,82),fill=RAMPS["steel"][3])
# IDE ribbon (grey with red edge)
pts=[(122,24),(118,30),(112,40),(112,56),(116,60)]
d.line(pts,fill=(170,172,180),width=4); d.line([(x+2,y) for x,y in pts],fill=(200,60,60),width=1)
# LEDs on front edge
d.point((104,90),(80,230,120)); d.point((104,93),(255,170,40))
save(im,"sB")
