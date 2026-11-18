exec(open("parts2.py").read().split("# ---- case")[0])
im,d=ic(96); drop(d,6,4,89,91)
d.rectangle((6,4,89,91),fill=RAMPS["pcbg"][0]); d.rectangle((7,5,88,90),fill=RAMPS["pcbg"][2]); dith(d,(7,5,88,90),RAMPS["pcbg"][2],RAMPS["pcbg"][3])
d.line((7,5,88,5),fill=RAMPS["pcbg"][4]); d.line((7,5,7,90),fill=RAMPS["pcbg"][4])
random.seed(2)
for _ in range(16):
    x=random.randint(20,60); y=random.randint(10,85); L=random.randint(6,18)
    d.line((x,y,x+L,y),fill=RAMPS["pcbg"][1]); d.line((x+L,y,x+L+3,y+3),fill=RAMPS["pcbg"][1])
# rear IO
bevel(d,9,7,24,36,"steel",1)
for k,(c,h) in enumerate((((40,40,52),4),((80,100,190),4),((230,230,240),3),((90,210,100),3))):
    y=10+k*6; d.rectangle((11,y,22,y+h),fill=c); d.line((11,y,22,y),fill=sh(c,1.4))
# cartridge slot
d.rectangle((38,8,44,44),fill=(14,14,18)); d.rectangle((39,9,43,43),fill=(52,52,64)); d.line((41,10,41,42),fill=(20,20,26))
bevel(d,35,6,47,10,"dark",0); bevel(d,35,42,47,46,"dark",0)
# DIMMs
for x in (52,57,62):
    d.rectangle((x,8,x+3,50),fill=(22,22,30)); d.line((x+1,10,x+1,48),fill=(74,74,92)); d.line((x+2,10,x+2,48),fill=(14,14,18))
    d.rectangle((x,8,x+3,10),fill=(240,240,246)); d.rectangle((x,48,x+3,50),fill=(240,240,246))
# ATX power
bevel(d,70,8,87,17,[(160,160,170),(200,200,210),(232,232,238),(244,244,248),(255,255,255)],0)
for x in range(72,86,2): d.rectangle((x,10,x,11),fill=(70,70,80)); d.rectangle((x,14,x,15),fill=(70,70,80))
# IDE + floppy
for y in (24,32):
    d.rectangle((70,y,87,y+5),fill=(16,16,20)); d.rectangle((71,y+1,86,y+4),fill=(40,40,48))
    for x in range(72,86,2): d.point((x,y+2),RAMPS["gold"][3]); d.point((x,y+3),RAMPS["gold"][2])
d.rectangle((74,40,87,44),fill=(16,16,20)); [d.point((x,42),RAMPS["gold"][3]) for x in range(76,86,2)]
# chipset heatsink
bevel(d,24,44,38,56,"steel",1)
for x in range(26,37,2): d.line((x,46,x,54),fill=RAMPS["steel"][1]); d.line((x+1,46,x+1,54),fill=RAMPS["steel"][4])
# caps
for (x,y) in ((28,14),(32,14),(28,20),(32,20),(28,26),(48,52),(66,54),(70,60),(74,60)):
    d.rectangle((x,y,x+2,y+3),fill=(40,56,160)); d.point((x,y),(150,180,255)); d.point((x+2,y+3),(20,30,90))
# AGP brown, PCI white, ISA black
d.rectangle((12,60,62,63),fill=(110,66,30)); d.line((12,60,62,60),fill=(196,128,70)); d.line((36,61,36,62),fill=(60,36,16))
for y in (67,72,77,82): d.rectangle((12,y,60,y+2),fill=(250,250,252)); d.line((12,y+2,60,y+2),fill=(170,170,180)); d.line((44,y,44,y+2),fill=(150,150,160))
d.rectangle((12,86,68,88),fill=(14,14,18)); d.line((12,86,68,86),fill=(60,60,70))
# battery + bios
d.ellipse((70,68,82,80),fill=RAMPS["steel"][0]); d.ellipse((71,69,81,79),fill=RAMPS["steel"][3]); d.ellipse((72,70,77,75),fill=RAMPS["steel"][4])
bevel(d,70,84,84,89,"dark",0); d.rectangle((72,85,78,86),fill=(240,240,240))
# jumpers block
for i in range(3): d.rectangle((52+i*4,64,53+i*4,66),fill=(20,20,26)); d.rectangle((52+i*4,64,53+i*4,64),fill=(220,60,60) if i==1 else (20,20,26))
outline_obj(im); im.save("q_board_big.png")
