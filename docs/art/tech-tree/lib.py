from PIL import Image, ImageDraw
import math
BG=(13,14,32); OUT=(6,6,14); N=128
def canvas():
    im=Image.new("RGB",(N,N),BG); return im, ImageDraw.Draw(im)
def outline(im):
    px=im.load(); w,h=im.size; src=im.copy().load()
    for y in range(h):
        for x in range(w):
            if src[x,y]==BG:
                for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    xx,yy=x+dx,y+dy
                    if 0<=xx<w and 0<=yy<h and src[xx,yy]!=BG and src[xx,yy]!=OUT:
                        px[x,y]=OUT; break
def sh(c,f): return tuple(max(0,min(255,int(v*f))) for v in c)
def mix(a,b,t): return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
def shadow(d,cx,y,w,h=8): d.ellipse((cx-w,y-h//2,cx+w,y+h//2),fill=(30,28,56))
def box(d,x0,y0,x1,y1,c,edge=2):
    d.rectangle((x0,y0,x1,y1),fill=c)
    d.rectangle((x0,y0,x1,y0+edge-1),fill=sh(c,1.25)); d.rectangle((x0,y0,x0+edge-1,y1),fill=sh(c,1.12))
    d.rectangle((x1-edge+1,y0,x1,y1),fill=sh(c,0.72)); d.rectangle((x0,y1-edge+1,x1,y1),fill=sh(c,0.6))
def cylv(d,x0,y0,x1,y1,c):
    w=x1-x0
    for x in range(x0,x1+1):
        t=(x-x0)/max(1,w); f=1.35-0.75*t if t>0.25 else 1.1+t
        d.line((x,y0,x,y1),fill=sh(c,f))
def cylh(d,x0,y0,x1,y1,c):
    h=y1-y0
    for y in range(y0,y1+1):
        t=(y-y0)/max(1,h); f=1.3-0.7*t if t>0.25 else 1.05+t
        d.line((x0,y,x1,y),fill=sh(c,f))
def sphere(d,cx,cy,r,c,steps=6):
    for i in range(steps):
        t=i/steps; rr=r*(1-t*0.85); ox=-r*0.3*t; oy=-r*0.3*t
        d.ellipse((cx+ox-rr,cy+oy-rr,cx+ox+rr,cy+oy+rr),fill=sh(c,0.65+0.75*t))
    d.ellipse((cx-r*0.45-2,cy-r*0.45-2,cx-r*0.45+2,cy-r*0.45+2),fill=(250,250,255))
def gear(d,cx,cy,R,r,n,c,hole=None):
    pts=[]
    for i in range(n*4):
        a=2*math.pi*i/(n*4); rr=R if (i%4) in (1,2) else r
        pts.append((cx+rr*math.cos(a),cy+rr*math.sin(a)))
    d.polygon(pts,fill=c)
    d.ellipse((cx-r*0.8,cy-r*0.8,cx+r*0.8,cy+r*0.8),fill=sh(c,1.15))
    d.ellipse((cx-r*0.55,cy-r*0.55,cx+r*0.55,cy+r*0.55),fill=sh(c,0.85))
    h=hole or r*0.25; d.ellipse((cx-h,cy-h,cx+h,cy+h),fill=sh(c,0.4))
FONT={"0":["111","101","101","101","111"],"1":["010","110","010","010","111"],"3":["111","001","111","001","111"],"5":["111","100","111","001","111"],
 "I":["111","010","010","010","111"],"C":["111","100","100","100","111"]}
def txt(d,x,y,s,c,k=2):
    for ch in s:
        for j,row in enumerate(FONT[ch]):
            for i,b in enumerate(row):
                if b=="1": d.rectangle((x+i*k,y+j*k,x+i*k+k-1,y+j*k+k-1),fill=c)
        x+=4*k
def glow(d,cx,cy,r,c):
    for i in range(4,0,-1):
        rr=r*i/4; d.ellipse((cx-rr,cy-rr,cx+rr,cy+rr),fill=mix(BG,c,0.18*(5-i)))
def save(im,name,out="."):
    outline(im); im.resize((1024,1024),Image.NEAREST).save(f"{out}/{name}.png",optimize=True)
