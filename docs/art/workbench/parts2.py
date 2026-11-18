exec(open("px.py").read())
CARD=(21,18,51); SHD=(12,10,30)
def ic(n=64):
    im=Image.new("RGB",(n,n),CARD); return im,ImageDraw.Draw(im)
def drop(d,x0,y0,x1,y1): d.rectangle((x0+3,y0+3,x1+3,y1+3),fill=SHD)
def out(im,name): im.save(f"q_{name}.png")
def outline_obj(im):
    px=im.load(); w,h=im.size; src=im.copy().load()
    for y in range(h):
        for x in range(w):
            if src[x,y] in (CARD,SHD):
                for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    xx,yy=x+dx,y+dy
                    if 0<=xx<w and 0<=yy<h and src[xx,yy] not in (CARD,SHD,(6,6,14)):
                        px[x,y]=(6,6,14); break
def fan(d,cx,cy,r,ramp="dark",blade=(96,100,116),hub=(60,60,72)):
    R=RAMPS[ramp]; d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=R[0]); d.ellipse((cx-r+1,cy-r+1,cx+r-1,cy+r-1),fill=R[1])
    for a in range(0,360,45):
        a1=math.radians(a); a2=math.radians(a+28)
        d.polygon([(cx,cy),(cx+(r-2)*math.cos(a1),cy+(r-2)*math.sin(a1)),(cx+(r-2)*math.cos(a2),cy+(r-2)*math.sin(a2))],fill=blade)
        d.line((cx,cy,cx+(r-2)*math.cos(a1),cy+(r-2)*math.sin(a1)),fill=sh(blade,1.3))
    d.ellipse((cx-r//3,cy-r//3,cx+r//3,cy+r//3),fill=hub); d.point((cx-1,cy-1),sh(hub,1.6))
# ---- case: beige mid tower, 3/4 view
im,d=ic(); drop(d,16,5,46,59)
d.polygon([(40,5),(48,9),(48,61),(40,59)],fill=RAMPS["beige"][1])          # side
for y in range(14,56,3): d.line((42,y+1,46,y+2),fill=RAMPS["beige"][0])
bevel(d,14,5,40,59,"beige",2)
for i,y in enumerate((9,17)):
    inset(d,17,y,37,y+6,"beige2"); d.rectangle((19,y+2,35,y+3),fill=(40,36,30) if i==0 else RAMPS["beige2"][1]); d.rectangle((31,y+4,34,y+5),fill=RAMPS["beige"][4])
inset(d,17,25,30,28,"beige2"); d.rectangle((19,26,28,26),fill=(30,28,24))
for y in range(33,47,2): d.line((18,y,36,y),fill=RAMPS["beige"][1])
d.ellipse((22,49,30,57),fill=RAMPS["beige"][0]); d.ellipse((23,50,29,56),fill=RAMPS["beige"][3]); d.point((25,52),RAMPS["beige"][4])
d.rectangle((33,51,35,52),fill=(80,230,120)); d.rectangle((33,54,35,55),fill=(255,170,40))
outline_obj(im); out(im,"case")
# ---- motherboard (top view, slight tilt look via shadow)
im,d=ic(); drop(d,6,6,57,57)
d.rectangle((6,6,57,57),fill=RAMPS["pcbg"][0]); d.rectangle((7,7,56,56),fill=RAMPS["pcbg"][2]); dith(d,(7,7,56,56),RAMPS["pcbg"][2],RAMPS["pcbg"][3])
d.line((7,7,56,7),fill=RAMPS["pcbg"][4]); d.line((7,7,7,56),fill=RAMPS["pcbg"][4])
for y in range(10,40,4): d.line((24,y,34,y),fill=RAMPS["pcbg"][1])
bevel(d,8,8,17,24,"steel",0); d.rectangle((10,10,15,12),fill=(40,40,50)); d.rectangle((10,15,15,17),fill=(80,100,190)); d.rectangle((10,20,15,22),fill=(220,220,230))
d.rectangle((25,9,28,30),fill=(20,20,26)); d.rectangle((26,10,27,29),fill=(70,70,84))
for x in (36,40,44): d.rectangle((x,9,x+2,34),fill=(26,26,34)); d.line((x+1,10,x+1,33),fill=(80,80,96)); d.rectangle((x,9,x+2,10),fill=(240,240,246)); d.rectangle((x,33,x+2,34),fill=(240,240,246))
d.rectangle((49,9,54,16),fill=(240,240,246)); [d.point((50+i%3*2,11+i//3*2),(70,70,80)) for i in range(6)]
d.rectangle((49,20,54,30),fill=(20,20,26)); [d.point((51,y),RAMPS["gold"][3]) for y in range(21,30,2)]
bevel(d,15,30,23,38,"steel",0); [d.line((x,31,x,37),fill=RAMPS["steel"][1]) for x in range(16,23,2)]
d.rectangle((10,41,46,42),fill=(140,86,42)); d.line((10,41,46,41),fill=(186,120,64))
for y in (45,48,51): d.rectangle((10,y,44,y),fill=(240,240,246))
d.rectangle((10,54,48,55),fill=(20,20,26))
for (x,y) in ((20,26),(30,33),(33,33),(47,38),(50,44)): d.rectangle((x,y,x+1,y+2),fill=(50,70,170)); d.point((x,y),(140,170,250))
d.ellipse((48,46,54,52),fill=RAMPS["steel"][3]); d.ellipse((49,47,53,51),fill=RAMPS["steel"][4])
outline_obj(im); out(im,"board")
# ---- processor cartridge with fan
im,d=ic(); drop(d,8,10,55,52)
bevel(d,8,10,55,50,"dark",2); d.rectangle((10,48,53,50),fill=RAMPS["dark"][1])
bevel(d,12,14,51,46,"steel",2)
for y in range(16,45,3): d.line((14,y,49,y),fill=RAMPS["steel"][1])
fan(d,31,30,13,"dark")
d.rectangle((10,51,53,54),fill=RAMPS["gold"][2]); [d.line((x,51,x,54),fill=RAMPS["gold"][1]) for x in range(11,53,3)]
d.rectangle((14,12,24,13),fill=(214,170,56))
outline_obj(im); out(im,"cpu")
# ---- RAM stick (angled)
im,d=ic(); drop(d,4,20,59,42)
d.polygon([(4,24),(59,18),(59,38),(4,44)],fill=RAMPS["pcbg"][3])
d.line((4,24,59,18),fill=RAMPS["pcbg"][4]); d.line((4,44,59,38),fill=RAMPS["pcbg"][1])
for i in range(7):
    x=7+i*7.5; y=23-i*0.8
    d.rectangle((x,y,x+5,y+9),fill=(22,22,28)); d.line((x,y,x+5,y),fill=(70,70,86))
for i in range(26):
    x=6+i*2; y=42-i*0.42
    d.line((x,y,x,y+3),fill=RAMPS["gold"][3] if i!=12 else RAMPS["pcbg"][3])
d.rectangle((10,36,20,38),fill=(240,240,230))
outline_obj(im); out(im,"ram")
# ---- AGP graphics card (blue pcb, heatsink+fan)
im,d=ic(); drop(d,4,14,54,48)
d.rectangle((4,14,54,46),fill=(30,50,120)); d.rectangle((5,15,53,45),fill=(44,74,160)); dith(d,(5,15,53,45),(44,74,160),(52,84,172)); d.line((5,15,53,15),fill=(110,150,230))
bevel(d,10,18,34,42,"steel",1); fan(d,22,30,10,"steel",(150,156,172),(80,84,100))
for (x,y) in ((38,20),(38,27),(45,20),(45,27)): d.rectangle((x,y,x+5,y+4),fill=(20,20,26)); d.line((x,y,x+5,y),fill=(70,70,84))
d.rectangle((38,36,44,40),fill=(20,20,26))
d.rectangle((12,46,40,50),fill=RAMPS["gold"][2]); [d.line((x,46,x,50),fill=RAMPS["gold"][1]) for x in range(13,40,2)]
bevel(d,55,10,59,52,"steel",0); d.rectangle((56,16,58,22),fill=(20,20,30)); d.rectangle((56,28,58,32),fill=(40,60,160))
outline_obj(im); out(im,"gpu")
# ---- hard drive (top, lid off look)
im,d=ic(); drop(d,6,10,57,54)
bevel(d,6,10,57,54,"steel",3)
d.ellipse((10,14,44,48),fill=RAMPS["steel"][0]); d.ellipse((11,15,43,47),fill=(186,190,210))
d.ellipse((13,17,41,45),fill=(206,210,228)); d.arc((15,19,39,43),200,260,fill=(250,250,255)); d.ellipse((24,28,30,34),fill=RAMPS["steel"][1])
d.line((52,16,34,34),fill=(60,62,76),width=3); d.line((52,16,34,34),fill=(110,114,130),width=1); d.ellipse((48,12,56,20),fill=(70,72,86)); d.ellipse((50,14,54,18),fill=(140,146,162))
bevel(d,45,42,55,51,"dark",0)
outline_obj(im); out(im,"hdd")
# ---- CD-ROM drive (3/4)
im,d=ic(); drop(d,4,20,59,46)
d.polygon([(4,20),(12,14),(60,14),(59,20)],fill=RAMPS["beige"][3])
bevel(d,4,20,59,44,"beige",1)
inset(d,7,24,56,30,"beige2"); d.rectangle((9,26,54,27),fill=RAMPS["beige"][1])
d.rectangle((44,34,53,38),fill=RAMPS["beige2"][1]); d.line((44,34,53,34),fill=RAMPS["beige"][4])
d.rectangle((8,35,9,36),fill=(255,170,40)); d.ellipse((13,34,17,38),fill=RAMPS["beige"][1])
d.rectangle((24,34,38,36),fill=RAMPS["beige"][1]); 
for x in range(25,38,3): d.point((x,35),(80,74,60))
outline_obj(im); out(im,"cd")
# ---- PSU
im,d=ic(); drop(d,6,10,54,54)
bevel(d,6,10,54,54,"steel",2)
d.ellipse((11,15,49,49),fill=RAMPS["steel"][0]); d.ellipse((12,16,48,48),fill=(40,42,52))
fan(d,30,32,16,"dark",(80,84,100),(110,114,130))
for r in (8,12,16): d.ellipse((30-r,32-r,30+r,32+r),outline=RAMPS["steel"][2])
d.line((12,32,48,32),fill=RAMPS["steel"][2]); d.line((30,16,30,48),fill=RAMPS["steel"][2])
d.rectangle((46,12,52,15),fill=(220,60,50)); 
for k,c in enumerate(((240,200,70),(220,60,60),(30,30,30))): d.line((54,40+k*2,62,46+k*3),fill=c,width=2)
outline_obj(im); out(im,"psu")
# ---- sound card
im,d=ic(); drop(d,4,16,54,46)
d.rectangle((4,16,54,44),fill=RAMPS["pcbg"][1]); d.rectangle((5,17,53,43),fill=RAMPS["pcbg"][3]); dith(d,(5,17,53,43),RAMPS["pcbg"][3],RAMPS["pcbg"][2]); d.line((5,17,53,17),fill=RAMPS["pcbg"][4])
bevel(d,9,21,25,35,"dark",0); d.rectangle((11,23,23,25),fill=(200,200,210))
for (x,y) in ((30,21),(38,21),(30,30)): d.rectangle((x,y,x+5,y+5),fill=(20,20,26))
for (x,y) in ((44,24),(44,30),(48,36)): d.rectangle((x,y,x+1,y+3),fill=(50,70,170))
d.rectangle((10,44,38,48),fill=RAMPS["gold"][2]); [d.line((x,44,x,48),fill=RAMPS["gold"][1]) for x in range(11,38,2)]
bevel(d,55,12,59,50,"steel",0)
for k,c in enumerate(((90,210,100),(240,130,180),(90,160,240))): d.ellipse((54,18+k*9,59,23+k*9),fill=c); d.point((56,20+k*9),(20,20,20))
outline_obj(im); out(im,"sound")
