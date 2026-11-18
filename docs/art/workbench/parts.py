exec(open("px.py").read())
CARD=(21,18,51)
def ic(w=40,h=40):
    im=Image.new("RGB",(w,h),CARD); return im,ImageDraw.Draw(im)
def out(im,name,k=2): im.resize((im.width*k,im.height*k),Image.NEAREST).save(f"p_{name}.png")
# case: beige tower
im,d=ic(); bevel(d,10,3,30,37,"beige",2)
for y in (7,12): bevel(d,13,y,27,y+4,"beige2",0)
d.line((15,9,25,9),fill=(30,28,24)); d.ellipse((18,26,22,30),fill=RAMPS["beige"][1]); d.point((24,32),(80,230,120))
for y in range(18,24,2): d.line((14,y,26,y),fill=RAMPS["beige"][1])
out(im,"case")
# motherboard
im,d=ic(); d.rectangle((4,4,35,35),fill=RAMPS["pcbg"][0]); d.rectangle((5,5,34,34),fill=RAMPS["pcbg"][2]); dith(d,(5,5,34,34),RAMPS["pcbg"][2],RAMPS["pcbg"][3])
d.rectangle((20,7,22,22),fill=(20,20,26)); 
for x in (25,28,31): d.rectangle((x,7,x+1,24),fill=(30,30,40))
d.rectangle((7,26,30,27),fill=(130,80,40)); d.rectangle((7,30,26,30),fill=(230,230,236)); d.rectangle((7,33,26,33),fill=(230,230,236))
bevel(d,7,8,15,15,"steel",0); d.rectangle((5,18,6,24),fill=(200,200,210))
for (x,y) in ((17,10),(17,14),(10,20)): d.rectangle((x,y,x+1,y+2),fill=(40,60,150))
out(im,"board")
# cpu cartridge
im,d=ic(); bevel(d,6,8,34,32,"dark",1); bevel(d,9,11,31,29,"steel",1); d.ellipse((13,13,27,27),fill=(28,28,34))
for a in range(0,360,60): d.line((20,20,20+6*math.cos(math.radians(a+20)),20+6*math.sin(math.radians(a+20))),fill=(110,114,130))
d.ellipse((18,18,22,22),fill=(214,170,56)); d.rectangle((8,32,32,34),fill=RAMPS["gold"][3])
out(im,"cpu")
# RAM
im,d=ic(); d.rectangle((3,14,36,25),fill=RAMPS["pcbg"][1]); d.rectangle((3,14,36,24),fill=RAMPS["pcbg"][3]); d.line((3,14,36,14),fill=RAMPS["pcbg"][4])
for x in range(5,35,6): d.rectangle((x,16,x+4,21),fill=(26,26,32)); d.point((x,16),(70,70,84))
for x in range(4,36,2): d.point((x,26),RAMPS["gold"][3]); d.point((x,27),RAMPS["gold"][2])
d.rectangle((18,25,19,27),fill=CARD)
out(im,"ram")
# GPU (1999 AGP card)
im,d=ic(); d.rectangle((3,12,33,28),fill=RAMPS["pcbg"][1]); d.rectangle((3,12,33,27),fill=(40,70,150)); d.line((3,12,33,12),fill=(90,130,220))
bevel(d,10,14,24,25,"steel",1); 
for x in range(12,23,2): d.line((x,16,x,23),fill=RAMPS["steel"][1])
d.rectangle((34,10,36,30),fill=RAMPS["steel"][3]); d.rectangle((8,28,28,30),fill=RAMPS["gold"][3]); d.rectangle((26,15,30,18),fill=(20,20,26))
out(im,"gpu")
# HDD
im,d=ic(); bevel(d,5,9,35,31,"steel",1); d.ellipse((9,11,27,29),fill=RAMPS["steel"][3]); d.ellipse((11,13,25,27),fill=RAMPS["steel"][4]); d.ellipse((16,18,20,22),fill=RAMPS["steel"][1])
d.line((30,13,21,22),fill=(60,62,74),width=2); d.rectangle((28,25,33,29),fill=(40,40,50))
out(im,"hdd")
# CD-ROM
im,d=ic(); bevel(d,3,12,37,28,"beige",1); d.rectangle((5,15,35,18),fill=RAMPS["beige"][1]); d.line((5,18,35,18),fill=RAMPS["beige"][4])
d.rectangle((28,22,33,24),fill=RAMPS["beige2"][1]); d.point((7,23),(255,170,40)); d.rectangle((10,22,14,24),fill=RAMPS["beige"][1])
out(im,"cd")
# PSU
im,d=ic(); bevel(d,5,8,35,32,"steel",1); d.ellipse((11,11,29,29),fill=RAMPS["steel"][1]); d.ellipse((13,13,27,27),fill=(30,32,40))
for a in range(0,360,45): d.line((20,20,20+6*math.cos(math.radians(a)),20+6*math.sin(math.radians(a))),fill=RAMPS["steel"][2])
d.line((33,26,38,34),fill=(240,200,70),width=2); d.line((34,24,39,30),fill=(220,60,60),width=1)
out(im,"psu")
# cooler (empty slot icon greyed) -> fan
im,d=ic(); bevel(d,7,7,33,33,"dark",2); d.ellipse((10,10,30,30),fill=(30,30,36))
for a in range(0,360,72): d.line((20,20,20+8*math.cos(math.radians(a)),20+8*math.sin(math.radians(a))),fill=(90,94,110),width=2)
d.ellipse((17,17,23,23),fill=(60,60,70))
out(im,"fan")
# sound card
im,d=ic(); d.rectangle((3,12,33,27),fill=RAMPS["pcbg"][3]); d.line((3,12,33,12),fill=RAMPS["pcbg"][4])
for x in (8,14): d.rectangle((x,15,x+4,19),fill=(20,20,26))
d.rectangle((20,14,26,21),fill=(30,30,40)); d.rectangle((34,10,36,30),fill=RAMPS["steel"][3])
for y in (14,19,24): d.ellipse((34,y,37,y+3),fill=[(80,200,90),(230,120,170),(80,150,230)][(y-14)//5])
d.rectangle((6,28,26,30),fill=RAMPS["gold"][3])
out(im,"sound")
# big motherboard detail 96x96
im=Image.new("RGB",(96,96),(28,24,60)); d=ImageDraw.Draw(im)
d.rectangle((6,4,90,92),fill=RAMPS["pcbg"][0]); d.rectangle((7,5,89,91),fill=RAMPS["pcbg"][2]); dith(d,(7,5,89,91),RAMPS["pcbg"][2],RAMPS["pcbg"][3])
for y in range(8,90,5): d.line((9,y,60,y),fill=RAMPS["pcbg"][1])
# rear io
bevel(d,8,6,22,30,"steel",0); d.rectangle((10,9,20,13),fill=(40,40,50)); d.rectangle((10,17,20,20),fill=(80,100,180)); d.rectangle((10,23,20,26),fill=(200,200,210))
# slot 1 (cpu cartridge slot)
d.rectangle((40,8,44,40),fill=(20,20,26)); d.rectangle((41,9,43,39),fill=(60,60,70))
# DIMM slots
for x in (52,57,62): d.rectangle((x,8,x+2,46),fill=(30,30,40)); d.line((x+1,9,x+1,45),fill=(70,70,84)); d.rectangle((x,8,x+2,9),fill=(230,230,236)); d.rectangle((x,45,x+2,46),fill=(230,230,236))
# chipset
bevel(d,26,38,36,48,"steel",0)
for x in range(27,36,2): d.line((x,39,x,47),fill=RAMPS["steel"][1])
# ATX power
d.rectangle((72,10,86,16),fill=(236,236,240)); 
for x in range(73,86,2): d.point((x,12),(60,60,70)); d.point((x,14),(60,60,70))
# IDE + floppy headers
for y in (24,32): d.rectangle((72,y,86,y+4),fill=(20,20,26)); [d.point((x,y+2),(214,170,56)) for x in range(73,86,2)]
d.rectangle((76,40,86,43),fill=(20,20,26))
# AGP brown + PCI white + ISA black
d.rectangle((14,56,62,58),fill=(130,80,40)); d.line((14,56,62,56),fill=(170,110,60))
for y in (63,69,75,81): d.rectangle((14,y,60,y+1),fill=(236,236,240))
d.rectangle((14,86,66,88),fill=(20,20,26))
# caps
for (x,y) in ((30,20),(34,20),(30,26),(48,50),(68,52),(70,60)): d.rectangle((x,y,x+2,y+3),fill=(40,60,150)); d.point((x,y),(130,160,240))
# battery
d.ellipse((70,70,80,80),fill=RAMPS["steel"][3]); d.ellipse((72,72,78,78),fill=RAMPS["steel"][4])
# bios chip
d.rectangle((66,84,76,88),fill=(30,30,36)); d.rectangle((67,85,71,86),fill=(230,230,230))
im.resize((288,288),Image.NEAREST).save("p_board_big.png")
