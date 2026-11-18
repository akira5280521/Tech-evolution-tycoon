css='''
@font-face{font-family:P;src:url(PressStart2P-Regular.ttf)} @font-face{font-family:T;src:url(VT323-Regular.ttf)}
*{box-sizing:border-box;margin:0}
body{background:#05040c;display:flex;gap:28px;padding:24px;width:max-content}
.ph{width:390px;height:844px;background:#0d0b1e;position:relative;overflow:hidden;color:#ece9ff;font-family:T;font-size:20px;line-height:22px;border:3px solid #2a2450}
.cap{font-family:P;font-size:11px;color:#f5b400;margin-bottom:8px;width:390px}
.hud{padding:10px 12px 8px;border-bottom:2px solid #2a2450}
.cash{border:2px solid #3a3370;background:#08061a;text-align:center;padding:4px;box-shadow:3px 3px 0 #000}
.cash b{display:block;font-weight:normal;font-size:34px;line-height:32px;color:#7ef29a} .cash span{color:#7ef29a;font-size:18px}
.wrap{padding:8px 12px}
h1{font-family:P;font-size:12px;color:#f5b400;line-height:18px;text-shadow:0 0 6px #a07000}
.tag{font-family:P;font-size:8px;color:#8f86c9}
.scene{border:3px solid #3a3370;margin-top:8px;box-shadow:4px 4px 0 #000;display:block;width:366px;height:274px;image-rendering:pixelated}
.score{margin-top:8px;border:2px solid #4b3a8c;background:#151233;padding:6px 8px;box-shadow:3px 3px 0 #000}
.score .t{font-family:P;font-size:8px;color:#b48cff}.bar{height:10px;border:2px solid #3a3370;background:#0d0b1e;margin-top:4px}.bar i{display:block;height:100%;background:#b48cff}
.slots{margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px}
.slot{border:2px solid #2a2450;background:#151233;padding:4px 6px;font-size:17px;line-height:17px;min-height:46px}
.slot .k{font-family:P;font-size:7px;color:#8f86c9;display:block;margin-bottom:3px}
.slot.empty{border:2px dashed #f5b400;background:#221a04;color:#f5b400}
.slot.lock{color:#5c5484}
.tabs{position:absolute;left:0;right:0;bottom:0;height:78px;border-top:2px solid #2a2450;background:#0d0b1e;display:grid;grid-template-columns:repeat(3,1fr);font-family:P;font-size:9px;color:#8f86c9;text-align:center;align-items:center}
.tabs .on{color:#f5b400}
.sheet{position:absolute;left:10px;right:10px;bottom:88px;border:4px solid #f5b400;background:#151233;padding:10px;box-shadow:6px 6px 0 #000}
.sheet h2{font-family:P;font-size:10px;color:#f5b400;margin-bottom:6px}
.opt{border:2px solid #3a3370;padding:6px;margin-top:6px;display:flex;justify-content:space-between;gap:6px}
.opt.ok{border-color:#3ba55d;background:#12281a}.opt.no{color:#5c5484}
.opt small{display:block;font-size:16px;color:#8f86c9}.opt.no small{color:#ff5566}
.btn{font-family:P;font-size:8px;background:#f5b400;color:#000;padding:8px 6px;align-self:center;box-shadow:2px 2px 0 #000;white-space:nowrap}
.oc{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:6px}
.oc div{border:2px solid #3a3370;text-align:center;font-family:P;font-size:7px;padding:8px 0;background:#231d4d}
.oc .on{background:#f5b400;color:#000;border-color:#f5b400}.oc .x{color:#5c5484;background:#151233}
.pw{height:12px;border:2px solid #3a3370;margin-top:4px;background:#0d0b1e}.pw i{display:block;height:100%;background:#7ef29a}
'''
def phone(cap,era,scene,score,pct,bonus,slots,extra="",sheet=""):
    s=''.join(f'<div class="slot {c}"><span class="k">{k}</span>{v}</div>' for k,v,c in slots)
    return f'''<div><div class="cap">{cap}</div><div class="ph">
<div class="hud"><div class="cash"><b>$4.21T</b><span>$1.06B/s · $9.80T this run</span></div></div>
<div class="wrap"><div style="display:flex;justify-content:space-between;align-items:end"><h1>WORKBENCH</h1><span class="tag">{era}</span></div>
<img class="scene" src="{scene}.png">
<div class="score"><div style="display:flex;justify-content:space-between"><span class="t">BENCH SCORE {score}</span><span class="t" style="color:#7ef29a">{bonus}</span></div><div class="bar"><i style="width:{pct}%"></i></div></div>
{extra}<div class="slots">{s}</div></div>{sheet}
<div class="tabs"><span>GAME</span><span class="on">BOOST</span><span>BOARD</span></div></div></div>'''
A=phone("1 · FIRST BUILD (1984)","BEIGE DESKTOP · 1984","sceneA","120",8,"+1% INCOME",[
 ("BOARD","Mainline AT-1 · AT",""),("PROCESSOR","Arcton 286 · 6 MHz",""),
 ("MEMORY","4× 30-pin SIMM · 512 KB",""),("GRAPHICS","Mono text card · ISA",""),
 ("STORAGE","2× 5.25\" floppy",""),("POWER","130 W · two 6-pin",""),
 ("COOLING","Case fan only",""),("MONITOR","12\" green screen",""),("???","Unlocks with Home Computers","lock"),("???","???","lock")])
sheetB='''<div class="sheet"><h2>PICK A GRAPHICS CARD</h2><div style="font-size:17px;color:#8f86c9">Your board has 1 AGP slot and 4 PCI slots.</div>
<div class="opt ok"><div>Vertexa V3 · 16 MB · AGP<small>+340 score · 18 W</small></div><span class="btn">INSTALL</span></div>
<div class="opt ok"><div>Pixelforge Rage · 32 MB · AGP<small>+410 score · 22 W</small></div><span class="btn">INSTALL</span></div>
<div class="opt ok"><div>Vertexa 2D Plus · PCI<small>+90 score · 9 W</small></div><span class="btn">INSTALL</span></div>
<div class="opt no"><div>Pixelforge VL · local bus<small>Needs a VL-Bus slot (1992-94 boards).</small></div></div></div>'''
B=phone("2 · PICKING A PART (1999)","BEIGE TOWER · 1999","sceneB","1,240",34,"+4% INCOME",[
 ("BOARD","Kestrel BX · ATX",""),("PROCESSOR","Arcton cartridge · 450 MHz",""),
 ("MEMORY","2× 64 MB SDRAM",""),("GRAPHICS","EMPTY · tap to pick","empty")],sheet=sheetB)
extraC='''<div class="score" style="border-color:#3a3370"><div style="display:flex;justify-content:space-between"><span class="t" style="color:#f5b400">OVERCLOCK</span><span class="t" style="color:#7ef29a">+8% SCORE</span></div>
<div class="oc"><div>STOCK</div><div>MILD</div><div class="on">STRONG</div><div class="x">EXTREME</div></div>
<div style="font-size:17px;color:#8f86c9;margin-top:4px">EXTREME needs liquid cooling.</div>
<div style="display:flex;justify-content:space-between;margin-top:4px;font-size:17px"><span>Power draw</span><span style="color:#7ef29a">410 W of 650 W</span></div><div class="pw"><i style="width:63%"></i></div></div>'''
C=phone("3 · GLASS RGB BUILD (2016)","GLASS TOWER · 2016","sceneC","8,420",82,"+12% INCOME",[
 ("PROCESSOR","Arcton Core · 4 cores 4.0 GHz",""),("GRAPHICS","Pixelforge X8 · 8 GB · PCIe",""),
 ("MEMORY","2× 8 GB DDR4 · dual +2%",""),("STORAGE","M.2 SSD 512 GB + 2 TB",""),
 ("COOLING","Tower air cooler · tier 3",""),("POWER","650 W · 24 + 8-pin","")],extra=extraC)
open("mock.html","w").write(f"<html><head><style>{css}</style></head><body>{A}{B}{C}</body></html>")
