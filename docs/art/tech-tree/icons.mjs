// 32x32 pixel-style icons for the tech tree nodes (drafts for review).
const C = { wood:"#9b6a3a", woodD:"#5e3b1c", steel:"#c9c8d8", steelD:"#6f6d88", gold:"#f2b705", brass:"#d49a2a", cop:"#cf7a3c",
  glass:"#a8e0ef", glow:"#ffd45e", white:"#ecebf7", paper:"#efe6c8", grn:"#4fd27a", red:"#ef5050", blu:"#4fa8ff", pur:"#a585ff", blk:"#0d0b1e", dark:"#2a2450" };
const r=(x,y,w,h,f)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;
const c=(x,y,rad,f,s="",sw=0)=>`<circle cx="${x}" cy="${y}" r="${rad}" fill="${f}" ${s?`stroke="${s}" stroke-width="${sw}"`:""}/>`;
const p=(d,f,s="",sw=0)=>`<path d="${d}" fill="${f}" ${s?`stroke="${s}" stroke-width="${sw}" stroke-linejoin="miter"`:""}/>`;
const l=(x1,y1,x2,y2,s,w=1.5)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${w}" stroke-linecap="square"/>`;
const t=(x,y,s,f,size=7)=>`<text x="${x}" y="${y}" fill="${f}" font-family="monospace" font-weight="bold" font-size="${size}" text-anchor="middle">${s}</text>`;
const teeth=(cx,cy,R,r2,n)=>{let d="";for(let i=0;i<n*2;i++){const a=Math.PI*i/n,rr=i%2?r2:R;d+=(i?"L":"M")+(cx+rr*Math.cos(a)).toFixed(1)+" "+(cy+rr*Math.sin(a)).toFixed(1);}return d+"Z";};
const tube=(pins,extra)=>p("M10 26 L10 12 Q10 4 16 4 Q22 4 22 12 L22 26 Z",C.glass+"55",C.glass,1.2)+r(9,26,14,3,C.steelD)+extra+[...Array(pins)].map((_,i)=>r(11+i*(10/(pins-1||1)),29,1.5,3,C.steel)).join("");
export const ICONS = [
 ["Groundwood pulping","1844", c(20,11,9,"#8a8798",C.steelD,1.2)+[[16,7],[23,6],[25,13],[18,15],[21,10],[15,11]].map(([x,y])=>r(x,y,1.5,1.5,"#a9a6b8")).join("")+c(20,11,2,C.blk)+r(1,6,10,4,C.wood)+c(1.5,8,2,"#c49a63",C.woodD,0.8)+r(1,11,10,4,C.wood)+c(1.5,13,2,"#c49a63",C.woodD,0.8)+r(11,7,2,2,C.paper)+r(11,12,2,2,C.paper)+c(13,18,1.2,C.paper)+c(15,20,1,C.paper)+r(4,23,24,8,C.wood)+r(4,23,24,1.5,C.woodD)+r(4,28,24,1,C.woodD)+p("M5 23 Q8 21 11 23 T17 23 T23 23 T27 23 L27 24 L5 24 Z",C.paper)],
 ["Continuous paper machine","1799", r(2,14,28,3,C.paper)+[6,16,26].map(x=>c(x,10,4,C.woodD,C.steel,1.5)+c(x,21,4,C.woodD,C.steel,1.5)).join("")+r(2,27,28,3,C.steelD)],
 ["Difference Engine design","1822", r(3,3,26,3,C.woodD)+r(3,27,26,3,C.woodD)+[9,23].map(x=>r(x-1,6,2,21,C.steel)).join("")+[8,13,18,23].map(y=>[9,23].map(x=>`<ellipse cx="${x}" cy="${y+1}" rx="5" ry="2.2" fill="${C.brass}" stroke="${C.woodD}" stroke-width="0.6"/>`).join("")).join("")+p(teeth(16,16,4,2.8,8),C.steel)+l(28,10,31,6,C.steel,1.5)+c(31,6,1.2,C.wood)],
 ["Analytical Engine design","1837", p(teeth(12,13,10,7.5,10),C.brass)+c(12,13,3,C.blk)+r(16,18,14,11,C.paper)+[18,22,26].map(x=>r(x,21,2,2,C.blk)+r(x+1,25,2,2,C.blk)).join("")],
 ["Boolean algebra","1854", p("M7 7 L16 7 Q26 7 26 16 Q26 25 16 25 L7 25 Z",C.dark,C.pur,2)+l(1,12,7,12,C.pur)+l(1,20,7,20,C.pur)+l(26,16,31,16,C.pur)+t(15,19,"1",C.grn,9)],
 ["Electric tabulator","1890", r(3,5,26,20,C.wood)+[9,16,23].map(x=>c(x,11,3,C.white)+l(x,11,x+1,9,C.blk,1)).join("")+[9,16,23].map(x=>c(x,19,3,C.white)+l(x,19,x-1,17,C.blk,1)).join("")+r(5,26,22,4,C.paper)+r(9,27,2,2,C.blk)+r(18,27,2,2,C.blk)],
 ["Electric telegraph line","1844", r(15,4,2,26,C.wood)+r(7,7,18,2,C.woodD)+c(8,6,1.5,C.glass)+c(24,6,1.5,C.glass)+p("M0 8 Q8 13 8 6",  "none",C.cop,1)+p("M24 6 Q26 12 32 9","none",C.cop,1)+r(10,29,12,2,C.woodD)],
 ["Automatic glass-blowing machine","1903", r(3,8,5,18,C.steelD)+r(24,8,5,18,C.steelD)+p("M13 6 L19 6 L19 10 Q24 13 24 18 L24 27 L8 27 L8 18 Q8 13 13 10 Z",C.glass+"88",C.glass,1.2)+r(14,3,4,3,C.glow)],
 ["Incandescent lamp","1879", c(16,12,9,C.glow+"55",C.glow,1.5)+p("M12 14 L14 10 L16 14 L18 10 L20 14","none",C.gold,1.5)+r(12,21,8,3,C.steel)+r(12,24,8,2,C.steelD)+r(14,26,4,3,C.steel)+l(3,4,6,6,C.glow)+l(29,4,26,6,C.glow)],
 ["Thermionic emission","1883", c(16,14,11,C.glass+"33",C.glass,1.2)+r(8,18,6,2,C.glow)+r(20,8,3,12,C.steel)+[ [11,14],[14,12],[17,13],[13,9] ].map(([x,y])=>c(x,y,1.2,C.blu)).join("")+l(15,11,19,11,C.blu,1)+r(13,25,6,5,C.steelD)],
 ["Two-electrode valve","1904", tube(2,r(13,8,6,14,C.steelD)+l(16,10,16,22,C.glow,1.2))],
 ["Triode amplifier","1906", tube(3,r(12,7,8,15,C.steelD)+p("M12 10 L20 12 L12 14 L20 16 L12 18 L20 20","none",C.steel,1)+l(16,9,16,21,C.glow,1))],
 ["“On Computable Numbers”","1936", r(0,14,32,9,C.paper)+[2,8,14,20,26].map(x=>r(x,14,1,9,C.steelD)).join("")+t(5,21,"1",C.blk,7)+t(11,21,"0",C.blk,7)+t(17,21,"1",C.blk,7)+t(23,21,"1",C.blk,7)+p("M11 4 L23 4 L23 9 L17 13 L11 9 Z",C.pur)],
 ["General-purpose electronic computer","1946", [1,11,21].map(x=>r(x,4,10,24,C.dark)+r(x,4,10,24,"none")).join("")+[1,11,21].map(x=>r(x,4,1,24,C.steelD)).join("")+[...Array(18)].map((_,i)=>c(4+(i%9)*3.2,8+Math.floor(i/9)*4,1,i%3?C.glow:C.red)).join("")+[...Array(6)].map((_,i)=>c(5+i*4.5,20,1.8,C.white)).join("")],
 ["Point-contact transistor","1947", r(6,20,20,8,C.steelD)+r(8,18,16,3,C.steel)+l(9,3,15,18,C.gold,1.5)+l(23,3,17,18,C.gold,1.5)+r(15,28,2,4,C.steel)],
 ["Zone refining","1951", r(2,13,28,6,C.steelD)+r(13,13,6,6,C.glow)+r(11,10,2,12,C.cop)+r(19,10,2,12,C.cop)+r(15,9,2,2,C.red)+l(22,26,30,26,C.white,1)+p("M27 24 L30 26 L27 28 Z",C.white)],
 ["Silicon transistor","1954", r(10,6,12,12,C.steel)+r(9,16,14,3,C.steelD)+r(11,19,2,11,C.steel)+r(15,19,2,11,C.steel)+r(19,19,2,11,C.steel)+r(13,9,6,6,C.dark)],
 ["Planar process","1959", c(16,16,13,C.steelD)+p("M3 16 A13 13 0 0 1 29 16 Z",C.pur+"aa")+r(3,15,26,2,C.steel)+[...Array(16)].map((_,i)=>r(8+(i%4)*4.5,19+Math.floor(i/4)*2.4,3,1.4,C.gold)).filter((_,i)=>i<12).join("")],
 ["Integrated circuit","1958", r(7,6,18,20,"#3d3858")+r(8,7,16,18,"#2c2844")+p("M14 7 A2 2 0 0 0 18 7",C.blk)+[...Array(4)].map((_,i)=>r(3,9+i*4,4,2,C.steel)+r(25,9+i*4,4,2,C.steel)).join("")+t(16,19,"IC",C.steel,6)],
 ["Moore's Law","1965", l(4,4,4,28,C.steel,1.5)+l(4,28,29,28,C.steel,1.5)+p("M5 26 L11 23 L17 18 L23 11 L28 4","none",C.grn,2)+[[11,23],[17,18],[23,11]].map(([x,y])=>r(x-1,y-1,3,3,C.gold)).join("")+p("M24 4 L29 3 L28 8 Z",C.grn)],
 ["Packet-switched network","1969", [[6,6],[26,6],[6,26],[26,26],[16,16]].map(([x,y])=>r(x-3,y-3,6,6,C.blu)).join("")+l(6,6,16,16,C.steel,1)+l(26,6,16,16,C.steel,1)+l(6,26,16,16,C.steel,1)+l(26,26,16,16,C.steel,1)+l(6,6,26,6,C.steel,1)+r(10,9,3,3,C.gold)+r(20,20,3,3,C.gold)],
 ["Single-chip microprocessor","1971", r(7,7,18,18,C.blk)+r(11,11,10,10,C.gold)+r(13,13,6,6,C.dark)+[...Array(5)].map((_,i)=>r(9+i*3.2,3,1.5,4,C.steel)+r(9+i*3.2,25,1.5,4,C.steel)+r(3,9+i*3.2,4,1.5,C.steel)+r(25,9+i*3.2,4,1.5,C.steel)).join("")],
 ["Graphical user interface","1973", r(2,4,28,22,C.white)+r(2,4,28,4,C.blu)+r(27,5,2,2,C.red)+r(5,11,5,5,C.gold)+r(5,18,5,5,C.grn)+r(14,11,13,12,C.steel)+p("M18 15 L18 28 L21 25 L24 30 L26 29 L23 24 L27 24 Z",C.blk,C.white,1)],
 ["Home computer kit","1975", r(2,8,28,16,C.steelD)+r(2,8,28,4,C.blu)+[...Array(8)].map((_,i)=>c(5+i*3,15,1,i%3?C.red:C.blk)+r(4+i*3,19,2,3,C.white)).join("")+r(4,24,4,3,C.dark)+r(24,24,4,3,C.dark)],
 ["Consumer 3D accelerator","1996", r(1,8,30,16,C.grn+"cc")+r(1,24,22,3,C.gold)+p("M10 12 L17 10 L22 13 L15 15 Z M10 12 L10 19 L15 22 L15 15 M15 22 L22 20 L22 13","none",C.white,1)+r(25,11,4,10,C.steelD)],
 ["Programmable shaders","2001", `<defs><radialGradient id="sh" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="${C.pur}"/><stop offset="1" stop-color="${C.blk}"/></radialGradient></defs>`+c(16,15,12,"url(#sh)")+p("M5 29 L27 29",C.steelD,C.steelD,2)],
 ["Addressable RGB LEDs","c. 2013", r(1,12,30,9,C.blk)+[[4,C.red],[10,C.gold],[16,C.grn],[22,C.blu],[28,C.pur]].map(([x,f])=>r(x-2,14,5,5,f)+c(x+0.5,9,2.5,f+"55")).join("")+l(1,23,31,23,C.steelD,1)],
 ["Shor's algorithm","1994", t(16,13,"15",C.white,11)+l(12,15,8,21,C.pur,1.5)+l(20,15,24,21,C.pur,1.5)+t(7,29,"3",C.grn,10)+t(25,29,"5",C.grn,10)+p("M2 6 Q5 2 8 6 T14 6","none",C.blu,1)],
 ["Superconducting qubit","1999", r(4,4,24,24,C.dark)+r(4,4,24,24,"none")+p("M10 10 L22 10 L22 22 L10 22 Z","none",C.gold,2.5)+r(14,8,4,4,C.blk)+l(16,1,16,8,C.gold,1.5)+l(16,22,16,31,C.gold,1.5)+p("M26 3 L26 9 M23 6 L29 6 M24 4 L28 8 M28 4 L24 8","none",C.glass,1)],
 ["Quantum advantage claim","2019", c(16,16,12,C.blu+"22",C.blu,1.2)+p("M4 16 Q16 22 28 16","none",C.blu,0.8)+p("M4 16 Q16 10 28 16","none",C.blu+"66",0.8)+l(16,4,16,28,C.steelD,0.8)+l(16,16,23,8,C.gold,1.8)+c(23,8,2,C.gold)+p("M27 23 L28.5 26 L31 26.5 L29 28.5 L29.5 31 L27 29.5 L24.5 31 L25 28.5 L23 26.5 L25.5 26 Z",C.white)],
];
