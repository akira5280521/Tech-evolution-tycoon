from PIL import Image, ImageDraw
import math, random
def sh(c,f): return tuple(max(0,min(255,int(v*f))) for v in c[:3])
def mix(a,b,t): return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
R={"blk":[(8,8,12),(22,22,28),(34,34,42),(50,50,60),(76,76,90)],
   "stl":[(44,46,58),(98,102,118),(142,148,164),(180,186,202),(222,228,240)],
   "gold":[(90,62,10),(170,124,30),(214,170,56),(240,204,96),(255,236,160)],
   "cop":[(80,36,16),(150,74,34),(196,110,58),(226,150,92),(250,196,150)],
   "red":[(70,8,12),(150,20,28),(200,36,40),(228,70,70),(250,130,120)]}
W,H=72,60
def new(): im=Image.new("RGBA",(W,H),(0,0,0,0)); return im,ImageDraw.Draw(im)
def iso(d,x,y,w,h,dp,ramp,top=None,side=None,front=None):
    r=R[ramp] if isinstance(ramp,str) else ramp
    dx,dy=dp,-dp//2
    d.polygon([(x,y),(x+w,y),(x+w+dx,y+dy),(x+dx,y+dy)],fill=top or r[3])
    d.polygon([(x+w,y),(x+w+dx,y+dy),(x+w+dx,y+h+dy),(x+w,y+h)],fill=side or r[1])
    d.rectangle((x,y,x+w,y+h),fill=front or r[2])
    d.line((x,y,x+w,y),fill=r[4]); d.line((x+dx,y+dy,x+w+dx,y+dy),fill=r[4])
def fan(d,cx,cy,r,body=(28,28,34),blade=(70,72,86),hub=(40,40,50),ring=None):
    if ring: d.ellipse((cx-r-1,cy-r-1,cx+r+1,cy+r+1),fill=ring)
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=body)
    for a in range(0,360,40):
        a1=math.radians(a); a2=math.radians(a+26)
        d.polygon([(cx,cy),(cx+(r-1)*math.cos(a1),cy+(r-1)*math.sin(a1)),(cx+(r-1)*math.cos(a2),cy+(r-1)*math.sin(a2))],fill=blade)
        d.line((cx,cy,cx+(r-1)*math.cos(a1),cy+(r-1)*math.sin(a1)),fill=sh(blade,1.4))
    d.ellipse((cx-r//3,cy-r//3,cx+r//3,cy+r//3),fill=hub); d.point((cx-1,cy-1),sh(hub,1.8))
def outline(im,c=(4,4,10,255)):
    px=im.load(); src=im.copy().load()
    for y in range(H):
        for x in range(W):
            if src[x,y][3]==0:
                for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    xx,yy=x+dx,y+dy
                    if 0<=xx<W and 0<=yy<H and src[xx,yy][3]>0: px[x,y]=c; break
def shadow(im):
    base=Image.new("RGBA",(W,H),(0,0,0,0)); a=im.split()[3]
    sh_=Image.new("RGBA",(W,H),(0,0,0,110)); base.paste(sh_,(2,3),a); base.alpha_composite(im); return base
def save(im,n,k=4):
    im=shadow(im); outline(im); im.resize((W*k,H*k),Image.NEAREST).save(f"{n}.png")
I={}
def art(f): I[f.__name__]=f; return f

@art
def cpu():
    im,d=new()
    # green substrate seen at angle (diamond)
    pts=lambda cx,cy,r: [(cx,cy-r*0.55),(cx+r,cy),(cx,cy+r*0.55),(cx-r,cy)]
    d.polygon(pts(36,34,30),fill=(28,90,50)); d.polygon([(6,34),(36,50.5),(36,53),(6,36.5)],fill=(14,50,26)); d.polygon([(66,34),(36,50.5),(36,53),(66,36.5)],fill=(20,70,38))
    for i in range(14):
        t=i/14; x=8+t*28; y=35+t*15.5; d.point((int(x),int(y)+1),R["gold"][3])
    # IHS
    d.polygon(pts(36,32,22),fill=R["stl"][3]); d.polygon([(14,32),(36,44),(36,47),(14,35)],fill=R["stl"][1]); d.polygon([(58,32),(36,44),(36,47),(58,35)],fill=R["stl"][2])
    for k in range(10):
        d.line((24+k,24+k//2,44+k,24+k//2+ (0)),fill=None) if False else None
    d.polygon(pts(36,31,18),fill=R["stl"][4]); d.polygon(pts(36,31,14),fill=(200,206,222))
    d.line((24,26,38,20),fill=(250,252,255)); d.line((26,28,42,21),fill=(236,240,250))
    d.polygon([(28,33),(31,31),(33,33),(30,35)],fill=R["gold"][2])
    return im
@art
def board():
    im,d=new()
    d.polygon([(10,6),(58,2),(64,54),(14,58)],fill=(18,18,24)); d.polygon([(14,58),(64,54),(64,56),(14,60)],fill=(6,6,10))
    # accents
    d.line((14,48,40,30),fill=(200,40,90)); d.line((40,30,58,30),fill=(200,40,90)); d.line((16,20,22,46),fill=(120,30,70))
    # rear io shroud
    d.polygon([(10,6),(20,5),(22,26),(12,27)],fill=R["blk"][3]); d.line((10,6,20,5),fill=R["blk"][4])
    for y in (10,15,20): d.line((14,y,19,y-0.5),fill=(70,70,84))
    # socket
    d.polygon([(28,12),(42,11),(43,25),(29,26)],fill=R["stl"][2]); d.polygon([(31,15),(40,14),(41,23),(32,24)],fill=R["stl"][4]); d.rectangle((34,17,37,20),fill=R["stl"][1])
    # vrm heatsinks
    d.polygon([(24,8),(44,7),(44,10),(24,11)],fill=R["blk"][4]); d.polygon([(22,12),(25,12),(26,28),(23,28)],fill=R["blk"][4])
    # dimm slots
    for i in range(4):
        x=48+i*3; d.line((x,9,x+1,32),fill=(60,60,74)); d.line((x+1,9,x+2,32),fill=(16,16,20))
    # pcie slots
    for y,c in ((36,R["stl"][3]),(44,(60,60,74)),(50,(60,60,74))): d.line((18,y+2,52,y),fill=c,width=2)
    # m.2 heatsink + chipset
    d.polygon([(20,40),(40,39),(40,42),(20,43)],fill=R["blk"][4]); d.polygon([(44,44),(56,43),(57,50),(45,51)],fill=R["blk"][3]); d.point((50,46),(200,40,90))
    for (x,y) in ((28,30),(31,30),(26,8)): d.rectangle((x,y,x+1,y+1),fill=(200,200,210))
    return im
@art
def ram():
    im,d=new()
    d.polygon([(6,44),(52,10),(66,18),(20,52)],fill=R["blk"][2])          # spreader face
    d.polygon([(6,44),(52,10),(52,7),(6,41)],fill=R["blk"][4])             # top edge
    d.polygon([(20,52),(66,18),(66,21),(20,55)],fill=(20,70,40))           # pcb edge
    for i in range(22):
        t=i/22; x=21+t*44; y=55-t*33; d.point((int(x),int(y)),R["gold"][3]); d.point((int(x),int(y)-1),R["gold"][2])
    d.polygon([(14,40),(46,17),(52,20),(20,44)],fill=R["blk"][1]); d.line((14,40,46,17),fill=(200,170,80))
    d.polygon([(24,38),(40,26),(44,28),(28,40)],fill=(200,170,80))
    d.line((8,44,52,12),fill=R["blk"][4])
    return im
@art
def ssd():
    im,d=new()
    # m.2 stick, slight angle, black pcb, chips + label
    d.polygon([(4,34),(62,22),(66,28),(8,40)],fill=(26,30,40)); d.polygon([(8,40),(66,28),(66,30),(8,42)],fill=(10,12,18)); d.line((4,34,62,22),fill=(90,100,120))
    for i in range(5): d.line((5+i,34+i//2-0,5+i,36+i//2),fill=R["gold"][3])
    for x0,w in ((14,12),(30,10),(44,10)):
        y0=34-(x0-4)*0.207
        d.polygon([(x0,y0-1),(x0+w,y0-3),(x0+w+2,y0+1),(x0+2,y0+3)],fill=(16,16,20)); d.line((x0,y0-1,x0+w,y0-3),fill=(90,90,104))
    d.polygon([(28,31),(52,26),(53,28),(29,33)],fill=(60,200,140)); d.line((30,31,50,27),fill=(220,255,236))
    d.ellipse((61,22,65,26),fill=R["gold"][2]); d.point((63,24),(30,30,36))
    return im
@art
def psu():
    im,d=new()
    iso(d,6,18,40,34,16,"blk")
    fan(d,26,35,14,(20,20,24),(54,56,66),(30,30,38)); 
    for r in (6,10,14): d.ellipse((26-r,35-r,26+r,35+r),outline=R["blk"][4])
    d.line((12,35,40,35),fill=R["blk"][4]); d.line((26,21,26,49),fill=R["blk"][4])
    # modular cables sleeved gold/black
    for k in range(4):
        x=50+k*4; d.line((x,40-k,x+2,58),fill=(30,30,36),width=2); d.line((x+1,40-k,x+3,58),fill=R["gold"][2])
    d.rectangle((50,40,64,46),fill=R["blk"][1])
    return im
@art
def case():
    im,d=new()
    iso(d,14,8,30,50,14,"blk",front=(14,16,26))
    # glass front showing interior
    d.rectangle((16,10,42,56),fill=(16,18,30))
    for y,c in ((18,(60,170,255)),(33,(170,90,255)),(48,(255,60,170))):
        d.ellipse((30,y-6,42,y+6),fill=sh(c,0.5)); d.ellipse((31,y-5,41,y+5),fill=c); d.ellipse((33,y-3,39,y+3),fill=(16,18,30))
    d.rectangle((18,22,28,34),fill=(36,36,46)); d.rectangle((18,36,30,42),fill=(30,30,38)); d.line((18,42,30,42),fill=(80,230,170))
    # rgb strip on side front edge
    for y in range(10,56):
        t=(y-10)/46; c=[(255,60,60),(255,170,40),(80,230,110),(60,170,255),(170,90,255)][min(4,int(t*5))]
        d.point((52,y-4),c); d.point((53,y-4),sh(c,0.7))
    d.line((17,10,30,30),fill=(60,64,90)); d.line((20,10,36,36),fill=(46,48,70))
    return im
@art
def cooler():
    im,d=new()
    # two fin stacks
    for x in (10,40):
        for y in range(6,40,2):
            d.polygon([(x,y),(x+20,y),(x+24,y-3),(x+4,y-3)],fill=R["stl"][3] if y%4 else R["stl"][2])
        d.rectangle((x,6,x+20,40),fill=None)
        for y in range(6,40,2): d.line((x,y,x+20,y),fill=R["stl"][1])
    # fan in middle
    fan(d,36,24,14,(24,24,30),(64,66,78),(200,170,80))
    # copper heatpipes
    for k in range(4):
        x=18+k*10; d.arc((x-2,34,x+14,58),0,180,fill=R["cop"][3],width=2)
    d.polygon([(22,52),(50,52),(54,48),(26,48)],fill=R["stl"][2])
    return im
@art
def gpu():
    im,d=new()
    iso(d,4,16,58,22,8,"blk")
    d.rectangle((4,16,62,38),fill=(26,26,32))
    for cx in (15,33,51): fan(d,cx,27,8,(14,14,18),(56,58,70),(36,36,46))
    d.line((4,16,62,16),fill=R["stl"][3]); d.rectangle((6,38,60,40),fill=R["stl"][1])
    d.line((8,41,30,41),fill=R["gold"][3]); d.line((34,41,50,41),fill=R["gold"][3])
    d.rectangle((62,14,64,42),fill=R["stl"][3])
    d.line((10,13,40,9),fill=(240,60,80))
    return im
@art
def sound():
    im,d=new()
    d.polygon([(6,12),(58,8),(62,46),(10,50)],fill=R["red"][2]); d.line((6,12,58,8),fill=R["red"][4]); d.polygon([(10,50),(62,46),(62,48),(10,52)],fill=R["red"][0])
    d.ellipse((26,14,54,42),fill=R["red"][1]); d.ellipse((30,18,50,38),fill=(24,24,28)); d.ellipse((35,23,45,33),fill=R["red"][3]); d.ellipse((37,25,43,31),fill=(20,20,24))
    d.rectangle((2,8,5,54),fill=R["stl"][3])
    for k in range(4): d.ellipse((2,14+k*8,5,17+k*8),fill=R["gold"][2])
    for i in range(12): d.point((16+i*2,51),R["gold"][3])
    return im
@art
def fanghost():
    im,d=new()
    c=(70,62,130); d.polygon([(18,6),(54,12),(56,52),(20,46)],fill=c); d.ellipse((22,12,54,46),fill=(50,44,100)); 
    for a in range(0,360,45):
        a1=math.radians(a); d.line((38,29,38+14*math.cos(a1),29+14*math.sin(a1)),fill=c,width=2)
    d.ellipse((34,25,42,33),fill=c)
    return im
for k,f in I.items(): save(f(),"g_"+k)
