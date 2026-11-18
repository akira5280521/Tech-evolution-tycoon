css='''@font-face{font-family:P;src:url(PressStart2P-Regular.ttf)} @font-face{font-family:T;src:url(VT323-Regular.ttf)}
*{box-sizing:border-box;margin:0}body{background:#0d0b1e;width:540px;color:#ece9ff;font-family:T;font-size:18px;line-height:18px}
.ph{width:540px;height:960px;position:relative;overflow:hidden;background:#0d0b1e}
.pad{padding:0 12px}
.cash{margin:12px 12px 0;border:2px solid #3a3370;background:#08061a;text-align:center;padding:4px 0 6px;box-shadow:3px 3px 0 #000}
.cash b{display:block;font-weight:normal;font-size:34px;line-height:32px;color:#7ef29a;text-shadow:0 0 8px #2b7a44}.cash span{color:#7ef29a;font-size:20px}
.tick{margin:6px 12px 0;border:2px solid #3a3370;background:#151233;font-family:P;font-size:6px;color:#b9b1f0;padding:5px 8px;letter-spacing:.5px;white-space:nowrap;overflow:hidden}
.top{display:flex;justify-content:space-between;align-items:flex-end;margin:10px 12px 0}
h1{font-family:P;font-size:15px;color:#f5b400;text-shadow:0 0 8px #8a5c00}.cur{color:#f5b400;font-size:20px}
.tog{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 12px 0}
.tog div{font-family:P;font-size:10px;text-align:center;padding:9px 0;border:2px solid #3a3370;background:#1b1640;color:#8f86c9;box-shadow:3px 3px 0 #000}
.tog .on{border-color:#f5b400;color:#f5b400;background:#12102a}
.rule{height:2px;background:#2a2450;margin-top:8px}
.score{margin:6px 12px 0;border:2px solid #3a3370;background:#151233;padding:5px 8px;display:grid;grid-template-columns:auto auto 1fr;gap:4px 18px;align-items:center;box-shadow:3px 3px 0 #000}
.score .k{font-family:P;font-size:6px;color:#8f86c9}.score .v{font-family:P;font-size:15px;color:#f5b400}
.badge{border:2px solid #b48cff;font-family:P;font-size:6px;color:#b48cff;padding:3px 6px;justify-self:end}
.main{display:grid;grid-template-columns:348px 1fr;gap:10px;margin:6px 12px 0}
h2{font-family:T;font-size:22px;color:#f5b400;letter-spacing:1px}.sub{font-size:15px;color:#8f86c9;margin:2px 0 4px}
.grid{display:grid;grid-template-columns:repeat(3,112px);gap:6px}
.t{position:relative;height:142px;border:2px solid #3a3370;background:#151233;text-align:center;box-shadow:2px 2px 0 #000}
.t img{width:96px;height:80px;image-rendering:pixelated;display:block;margin:10px auto 0}
.t .tier{position:absolute;left:4px;top:4px;font-family:P;font-size:6px;color:#7ef29a;border:1px solid #3ba55d;padding:2px 2px;background:#0d1f14}
.t .ok{position:absolute;right:4px;top:4px;width:15px;height:15px;border-radius:50%;border:2px solid #7ef29a;color:#7ef29a;font-size:12px;line-height:11px}
.t .sl{font-family:T;font-size:12px;color:#8f86c9;letter-spacing:1px;display:block;margin-top:0;line-height:12px}
.t .n{font-size:15px;line-height:15px;white-space:nowrap}.t .sw{position:absolute;left:0;right:0;bottom:3px;font-size:13px;color:#7e76b4}
.t.bn{border-color:#f5b400;background:#2a1d06}.t.bn .sw{color:#f5b400}
.t .bt{position:absolute;left:30px;top:4px;font-family:P;font-size:5px;color:#f5b400;border:1px solid #f5b400;padding:2px}
.t.add{border:2px dashed #4b3a8c;background:transparent;height:104px}.t.add img{width:72px;height:60px;margin-top:6px}.t.add img{opacity:.8}.t.add .sw{color:#b48cff;font-size:17px}
.req{border:2px solid #3a3370;background:#12102a;padding:6px 6px;height:590px}
.req h2{font-size:20px;border-bottom:2px solid #2a2450;padding-bottom:4px;margin-bottom:4px}
.it{display:grid;grid-template-columns:16px 1fr;gap:5px;padding:3px 2px}.it .c{width:14px;height:14px;border:2px solid #7ef29a;color:#7ef29a;font-size:12px;line-height:9px;text-align:center;margin-top:1px}
.it b{font-weight:normal;font-size:16px;line-height:15px}.it small{display:block;font-size:12px;line-height:12px;color:#8f86c9}
.it.hl{background:#2a1d06}.it.hl b{color:#f5b400}.it .c.no{border-color:#5c5484}
.opt{font-family:T;font-size:13px;color:#8f86c9;border-bottom:2px solid #2a2450;margin:6px 0 2px;padding-bottom:2px}
.foot{position:absolute;left:12px;bottom:80px;font-size:15px;color:#8f86c9}
.tabs{position:absolute;left:0;right:0;bottom:0;height:74px;border-top:2px solid #2a2450;display:grid;grid-template-columns:repeat(6,1fr);text-align:center;font-family:P;font-size:6px;color:#8f86c9;padding-top:16px}
.tabs svg{display:block;margin:0 auto 8px}.tabs .on{color:#f5b400}
'''
def tile(img,tier,slot,name,bn=False,reason=""):
    extra=f'<span class="bt">BOTTLENECK</span>' if bn else ''
    sw=reason if bn else 'tap to swap'
    return f'<div class="t {"bn" if bn else ""}"><span class="tier">{tier}</span>{extra}<span class="ok">✓</span><img src="g_{img}.png"><span class="sl">{slot}</span><div class="n">{name}</div><div class="sw">{sw}</div></div>'
tiles=''.join([tile("cpu","T7","CPU","Arcton Core 8"),tile("board","T7","MOTHERBOARD","Kestrel Forge"),tile("ram","T4","MEMORY","Hexa DDR5 16GB",True,"single stick"),
 tile("ssd","T6","STORAGE","Verdant 1TB SSD"),tile("psu","T6","POWER SUPPLY","Tonewave 850W"),tile("case","T6","CASE","Hushbox Glass"),
 tile("cooler","T5","COOLING","Arcadia Tower"),tile("gpu","T8","GRAPHICS","Pixelforge X9"),tile("sound","T4","SOUND","Echoline Pro"),
 '<div class="t add"><img src="g_fanghost.png"><span class="sl">CASE FANS</span><div class="sw">+ Add</div></div>',
 '<div class="t add"><div style="height:60px;margin-top:6px;display:flex;justify-content:center;align-items:center;gap:4px"><i style="width:24px;height:28px;border:2px dashed #ff5566"></i><i style="width:24px;height:28px;border:2px dashed #7ef29a"></i><i style="width:24px;height:28px;border:2px dashed #4fa8ff"></i></div><span class="sl">RGB</span><div class="sw">+ Add</div></div>'])
req=[("CPU","the brain of the computer",1,0),("Motherboard","connects everything together",1,0),("Memory (RAM)","short-term working memory",1,1),("Storage","where programs and data live",1,0),
 ("Power Supply","feeds power to every part",1,0),("Case","the box that holds the build",1,0),("CPU Cooler","stops the processor overheating",1,0),("Graphics","unless the CPU has graphics",1,0)]
opt=[("Sound card","many boards have sound built in",1),("Case fans","better airflow, higher overclock",0),("RGB","lights only, no speed boost",0)]
r=''.join(f'<div class="it {"hl" if h else ""}"><span class="c">✓</span><div><b>{a}</b><small>{b}</small></div></div>' for a,b,c,h in req)
r+='<div class="opt">OPTIONAL</div>'+''.join(f'<div class="it"><span class="c {"" if c else "no"}">{"✓" if c else ""}</span><div><b>{a}</b><small>{b}</small></div></div>' for a,b,c in opt)
ico=lambda p:f'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">{p}</svg>'
tabs=[("GAME",'<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M8 11v3M6.5 12.5h3M15 12h.01M17 13h.01"/>',0),("BOOST",'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',1),("BOARD",'<rect x="3" y="4" width="18" height="16"/><path d="M3 10h18M12 10v10"/>',0),
 ("RUNS",'<path d="M5 22V4h12l-2 4 2 4H5"/>',0),("RESEARCH",'<path d="M9 3h6M10 3v6l-5 10h14L14 9V3"/>',0),("MORE",'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',0)]
tb=''.join(f'<div class="{"on" if o else ""}">{ico(p)}{n}</div>' for n,p,o in tabs)
html=f'''<html><head><style>{css}</style></head><body><div class="ph">
<div class="cash"><b>$48.20M</b><span>$126.50K/s · $2.10B this run</span></div>
<div class="tick">WORKBENCH OPEN &nbsp;·&nbsp; INSTALL PARTS WITH TOKENS OR DATA &nbsp;·&nbsp; MEMORY IS HOLDING YOUR BUILD BACK</div>
<div class="top"><h1>WORKBENCH</h1><span class="cur">124 tokens · 860 data</span></div>
<div class="tog"><div>UPGRADES</div><div class="on">WORKBENCH</div></div><div class="rule"></div>
<div class="score"><div><div class="k">BENCH SCORE</div><div class="v">4,820</div></div><div style="color:#7ef29a;font-size:20px">+8% income</div>
<div style="justify-self:end;text-align:right"><div style="color:#f5b400;font-size:18px">held back by: Memory</div><div class="badge" style="margin-top:4px;display:inline-block">2020s BUILD 6/9</div></div></div>
<div class="main"><div><h2>INSERT PARTS</h2><div class="sub">9 installed · tap a tile to open the Parts Bin</div><div class="grid">{tiles}</div></div>
<div class="req"><h2>REQUIRED</h2>{r}</div></div>

<div class="tabs">{tb}</div></div></body></html>'''
open("page.html","w").write(html)
