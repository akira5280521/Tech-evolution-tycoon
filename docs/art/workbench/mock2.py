exec(open("mock.py").read().split("def phone")[0])
css2=css+'''
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
.pc{position:relative;border:2px solid #3a3370;background:#151233;text-align:center;padding:4px 3px 5px;box-shadow:2px 2px 0 #000;min-height:122px}
.pc img{width:80px;height:80px;image-rendering:pixelated;display:block;margin:0 auto}
.pc .n{font-size:16px;line-height:15px}.pc .s{font-family:P;font-size:6px;color:#8f86c9;display:block;margin-bottom:2px}
.pc .ok{position:absolute;top:3px;right:3px;width:16px;height:16px;background:#3ba55d;color:#fff;font-family:P;font-size:8px;line-height:16px;box-shadow:1px 1px 0 #000}
.pc.empty{border:2px dashed #f5b400;background:#221a04;color:#f5b400}.pc.empty img{opacity:.35}
.pc.lock{color:#5c5484}.pc.lock .q{font-family:P;font-size:20px;line-height:80px;color:#3a3370}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
.bigbtn{font-family:P;font-size:9px;text-align:center;padding:12px 4px;border:2px solid #000;box-shadow:3px 3px 0 #000}
.gold{background:#f5b400;color:#000}.dis{background:#231d4d;color:#5c5484;border-color:#3a3370}.vio{background:#2a1f52;color:#b48cff;border-color:#4b3a8c}
.spec{display:flex;justify-content:space-between;border-bottom:2px solid #231d4d;padding:3px 2px;font-size:18px}.spec span:first-child{color:#8f86c9}
.fit{font-size:18px;line-height:20px;margin-top:2px}.fit b{font-weight:normal;font-family:P;font-size:8px;margin-right:6px}
.boot{background:#000;border:3px solid #3a3370;margin-top:8px;padding:8px 10px;color:#c8c8c8;font-size:18px;line-height:19px;box-shadow:4px 4px 0 #000;height:250px}
.boot .y{color:#f5d76e}.boot .g{color:#7ef29a}
.bars div{display:grid;grid-template-columns:96px 1fr 48px;gap:6px;align-items:center;font-size:17px;margin-top:3px}.bars i{display:block;height:10px;background:#b48cff;border:1px solid #000}
'''
def shell(cap,body,tag):
    return f'''<div><div class="cap">{cap}</div><div class="ph">
<div class="hud"><div class="cash"><b>$4.21T</b><span>$1.06B/s · $9.80T this run</span></div></div>
<div class="wrap"><div style="display:flex;justify-content:space-between;align-items:end"><h1>WORKBENCH</h1><span class="tag">{tag}</span></div>{body}</div>
<div class="tabs"><span>GAME</span><span class="on">BOOST</span><span>BOARD</span></div></div></div>'''
def card(img,slot,name,st=""):
    if st=="lock": return f'<div class="pc lock"><div class="q">???</div><span class="s">{slot}</span><div class="n">{name}</div></div>'
    tick='' if st=="empty" else '<span class="ok">✓</span>'
    return f'<div class="pc {st}">{tick}<img src="p_{img}.png"><span class="s">{slot}</span><div class="n">{name}</div></div>'
g=''.join([card("case","CASE","Kestrel Mid Tower"),card("board","BOARD","Kestrel BX · ATX"),card("cpu","PROCESSOR","Arcton 450 MHz"),
 card("ram","MEMORY","2× 64 MB SDRAM"),card("gpu","GRAPHICS","EMPTY · pick one","empty"),card("hdd","STORAGE","Ridgeline 13 GB"),
 card("cd","OPTICAL","Spinwell 40x CD"),card("psu","POWER","Voltara 300 W"),card("sound","SOUND","Expansion cards, later","lock")])
s1=shell("1 · INSERT PARTS (1999)",f'''<div style="font-size:18px;color:#8f86c9;margin-top:4px">7 of 8 parts in. Tap a part to swap it.</div><div class="grid">{g}</div>
<div class="row2"><div class="bigbtn dis">POWER ON<br><span style="font-family:T;font-size:16px">needs graphics</span></div><div class="bigbtn vio">PARTS BIN<br><span style="font-family:T;font-size:16px">23 parts</span></div></div>''',"BUILD · 1999")
specs=[("Form factor","ATX (1995)"),("Processor","cartridge slot"),("Memory","3× SDRAM DIMM, 768 MB max"),("Graphics","1× AGP"),("Expansion","4× PCI · 1× ISA"),("Drives","2× IDE (4 drives) · floppy"),("Power plug","20-pin ATX"),("Overclock","jumpers · up to MILD")]
sp=''.join(f'<div class="spec"><span>{a}</span><span>{b}</span></div>' for a,b in specs)
s2=shell("2 · PART DETAILS",f'''<div style="display:flex;gap:8px;margin-top:8px;align-items:center"><img src="p_board_big.png" style="width:150px;height:150px;image-rendering:pixelated;border:3px solid #3a3370;box-shadow:3px 3px 0 #000">
<div><div style="font-family:P;font-size:10px;line-height:15px;color:#f5b400">KESTREL BX</div><div style="font-size:18px;color:#8f86c9">Motherboard · 1998</div><div style="font-size:18px;margin-top:4px">+120 score<br>12 W</div></div></div>
<div style="margin-top:6px">{sp}</div>
<div class="score" style="border-color:#3a3370"><div class="fit"><b style="color:#7ef29a">✓</b>Fits your Kestrel Mid Tower (ATX)</div><div class="fit"><b style="color:#7ef29a">✓</b>Takes your Arcton cartridge</div><div class="fit" style="color:#ff5566"><b>✗</b>Your 72-pin SIMMs won't fit: needs DIMMs</div></div>
<div class="row2"><div class="bigbtn vio">BACK</div><div class="bigbtn gold">INSTALL</div></div>''',"MOTHERBOARD")
bars=[("Processor",420,100),("Graphics",410,98),("Memory",180,43),("Storage",120,29),("Board",110,26)]
br=''.join(f'<div><span>{a}</span><i style="width:{w}%"></i><span style="text-align:right">{v}</span></div>' for a,v,w in bars)
s3=shell("3 · POWER ON",f'''<div class="boot"><span class="y">Arcton BIOS v4.51 · Kestrel BX</span><br><br>Arcton cartridge 450 MHz<br>Memory test: <span class="g">131072K OK</span><br><br>Detecting IDE drives...<br>&nbsp;Primary master: Ridgeline 13 GB<br>&nbsp;Secondary master: Spinwell CD-ROM<br>AGP card: Vertexa V3 16 MB<br><br><span class="g">All parts OK. Starting...</span>▌</div>
<div class="score"><div style="display:flex;justify-content:space-between"><span class="t">BENCH SCORE 1,240</span><span class="t" style="color:#7ef29a">+4% INCOME</span></div><div class="bars" style="margin-top:4px">{br}</div>
<div style="font-size:17px;color:#f5b400;margin-top:6px">Memory holds this build back: a third stick adds +60.</div></div>''',"BUILD · 1999")
open("mock2.html","w").write(f"<html><head><style>{css2}</style></head><body>{s1}{s2}{s3}</body></html>")
