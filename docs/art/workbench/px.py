from PIL import Image, ImageDraw
import math, random
W,H=180,135
def mix(a,b,t): return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
def sh(c,f): return tuple(max(0,min(255,int(v*f))) for v in c)
RAMPS={
 "beige":[(74,64,48),(150,138,108),(196,186,154),(220,211,180),(240,234,210)],
 "beige2":[(70,62,46),(138,126,98),(184,174,142),(208,198,166),(232,225,198)],
 "dark":[(8,8,12),(24,24,30),(36,36,44),(52,52,62),(76,76,90)],
 "steel":[(40,42,52),(96,100,116),(140,146,162),(176,182,198),(214,220,232)],
 "wood":[(48,30,16),(92,58,32),(122,80,46),(148,100,60),(176,126,80)],
 "pcbg":[(10,40,22),(24,82,44),(34,108,58),(48,134,74),(80,170,100)],
 "pcbb":[(6,6,10),(18,18,24),(28,28,36),(40,40,50),(60,60,74)],
 "gold":[(90,62,10),(170,124,30),(214,170,56),(240,204,96),(255,236,160)],
}
def new():
    im=Image.new("RGB",(W,H)); return im,ImageDraw.Draw(im)
def dith(d,box,c1,c2,mode=0):
    x0,y0,x1,y1=box
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            if (x+y+mode)%2==0: d.point((x,y),c2)
def bevel(d,x0,y0,x1,y1,ramp,r=0):
    R=RAMPS[ramp] if isinstance(ramp,str) else ramp
    d.rounded_rectangle((x0,y0,x1,y1),r,fill=R[0])
    if x1-x0<5 or y1-y0<5:
        d.rectangle((x0+1,y0+1,x1-1,y1-1),fill=R[2]); d.line((x0+1,y0+1,x1-1,y0+1),fill=R[4]); return
    d.rounded_rectangle((x0+1,y0+1,x1-1,y1-1),max(0,r-1),fill=R[1])
    d.rounded_rectangle((x0+1,y0+1,x1-2,y1-2),max(0,r-1),fill=R[4])
    d.rounded_rectangle((x0+2,y0+2,x1-2,y1-2),max(0,r-2),fill=R[2])
def inset(d,x0,y0,x1,y1,ramp,r=0):
    R=RAMPS[ramp] if isinstance(ramp,str) else ramp
    d.rounded_rectangle((x0,y0,x1,y1),r,fill=R[4]); d.rounded_rectangle((x0,y0,x1-1,y1-1),r,fill=R[0]); d.rounded_rectangle((x0+1,y0+1,x1-1,y1-1),max(0,r-1),fill=R[1])
def room(d,wall_top,wall_bot,desk="wood",desk_y=98):
    for y in range(0,desk_y):
        t=y/desk_y; c=mix(wall_top,wall_bot,t); d.line((0,y,W,y),fill=c)
        if y%6==3: dith(d,(0,y,W-1,y),c,mix(wall_top,wall_bot,min(1,t+0.08)))
    R=RAMPS[desk]
    d.rectangle((0,desk_y,W,desk_y+18),fill=R[3]); d.line((0,desk_y,W,desk_y),fill=R[4])
    random.seed(4)
    for k in range(9):
        y=desk_y+2+k*2; x=random.randint(0,60)
        d.line((x,y,x+random.randint(20,70),y),fill=R[2])
        x=random.randint(90,150); d.line((x,y,x+random.randint(10,40),y),fill=R[2])
    d.rectangle((0,desk_y+19,W,H),fill=R[1]); d.line((0,desk_y+19,W,desk_y+19),fill=R[0]); d.line((0,desk_y+20,W,desk_y+20),fill=R[2])
    for y in range(desk_y+24,H,4): d.line((0,y,W,y),fill=R[0] if y%8==0 else sh(R[1],0.9))
def shadow(d,x0,x1,y,h=3,c=None):
    for i in range(h):
        d.line((x0-i,y+i,x1+i,y+i),fill=c or (0,0,0)) if False else None
    d.rectangle((x0,y,x1,y+h-1),fill=c)
def glare(d,x0,y0,n,c):
    for i in range(n):
        d.point((x0+i,y0+n-i),c)
def scan(d,box,f=0.82):
    x0,y0,x1,y1=box
    im=d._image
    for y in range(y0,y1+1,2):
        for x in range(x0,x1+1):
            d.point((x,y),sh(im.getpixel((x,y)),f))
def glowc(im,cx,cy,r,c,a=0.35):
    px=im.load()
    for y in range(max(0,cy-r),min(H,cy+r)):
        for x in range(max(0,cx-r),min(W,cx+r)):
            dd=((x-cx)**2+(y-cy)**2)**0.5
            if dd<r:
                t=(1-dd/r)**2*a; px[x,y]=mix(px[x,y],c,t)
def save(im,name,k=4): im.resize((W*k,H*k),Image.NEAREST).save(name+".png")
