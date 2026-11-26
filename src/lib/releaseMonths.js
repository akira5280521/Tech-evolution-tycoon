// The month (1-12) each TECH project first shipped or was announced, so a
// project opens in its real month, not just its real year. Where a line of
// products has no single launch date (a cooling or efficiency standard, a
// generic case style), the month is our best estimate and is set no earlier
// than the project it builds on.
export const RELEASE_MONTH = {
  // CPU
  "cpu-4bit": 11, "cpu-8080": 4, "cpu-8086": 6, "cpu-286": 2, "cpu-386": 10, "cpu-486": 4, "cpu-pentium": 3,
  "cpu-alder64": 9, "cpu-dual": 5, "cpu-alder32": 6,
  "arm-arm1": 4, "arm-7tdmi": 6, "arm-a9": 7, "arm-a15": 11, "arm-n1": 2,
  "cpu-6502": 9, "cpu-z80": 7, "cpu-8088": 6, "fpu-8087": 6, "fpu-287": 6, "fpu-387": 6, "fpu-fasmath": 6,
  "cpu-am386": 3, "cpu-cx486dlc": 6, "cpu-am486": 4, "cpu-nx586": 3, "cpu-cx5x86": 8, "cpu-586pro": 11,
  "cpu-k5": 3, "cpu-6x86": 2, "cpu-586mmx": 1, "cpu-k6": 4, "cpu-6x86mx": 5, "cpu-c6": 5, "cpu-p2": 5,
  "cpu-300a": 8, "cpu-k62": 5, "cpu-mii": 6, "cpu-mp6": 6, "cpu-k7": 8, "cpu-p3": 2, "cpu-tbird": 6,
  "cpu-p4a": 8, "cpu-xp": 10, "cpu-p4": 4, "cpu-p4560": 6, "cpu-x2": 6, "cpu-e6600": 7, "cpu-q6600": 1,
  "cpu-phenom": 11, "cpu-q9650": 8, "cpu-i7920": 11, "cpu-ph2": 1, "cpu-i7860": 9, "cpu-1100t": 4,
  "cpu-2600k": 1, "cpu-fx8150": 10, "cpu-3770k": 4, "cpu-4770k": 6, "cpu-4790k": 6, "cpu-6700k": 8,
  "cpu-7700k": 1, "cpu-1800x": 3, "cpu-1950x": 8, "cpu-8700k": 10, "cpu-2700x": 4, "cpu-2990wx": 8,
  "cpu-9900k": 10, "cpu-3950x": 11, "cpu-5950x": 11, "cpu-12900k": 11, "cpu-7950x": 9, "cpu-13900k": 10,
  "cpu-14900k": 10, "cpu-9950x": 8, "cpu-285k": 10,
  // GPU, cards and displays
  "gpu-2d": 6, "gpu-3d": 10, "gpu-256": 10, "gpu-3": 2, "gpu-8800": 11, "gpu-100": 6, "gpu-2080": 9,
  "card-1080": 5, "card-p100": 6, "card-v100": 6, "card-3090": 9, "card-a100": 11, "card-3060": 2,
  "card-4090": 10, "card-h100": 9, "card-b200": 3,
  "vid-cga": 8, "mon-5151": 8, "vid-herc": 6, "mon-5153": 3, "vid-ega": 10, "mon-5154": 10, "vid-vga": 4,
  "mon-8513": 4, "vid-et4000": 6, "mon-ms3d": 6, "vid-928": 6, "vid-virge": 11, "mon-17sf": 6,
  "vid-verite": 6, "vid-pcx1": 6, "vid-riva128": 4, "vid-ragepro": 6, "vid-apocalypse": 6, "vid-tnt": 9,
  "vid-voodoo2": 2, "vid-obsidian": 6, "vid-voodoo3": 4, "vid-radeon": 7, "vid-voodoo5": 6, "mon-fw900": 6,
  "vid-9700": 8, "mon-2001fp": 6, "vid-6800": 4, "bridge-sli": 6, "vid-x1800": 10, "bridge-cf": 10,
  "mon-3007": 6, "add-physx": 5, "vid-gtx280": 6, "vid-5870": 9, "vid-gtx480": 3, "mon-vg236h": 6,
  "vid-7970": 1, "vid-gtx680": 3, "vid-290x": 10, "vid-gtx980": 9, "mon-pg278q": 8, "mon-p2715q": 6,
  "bridge-hbsli": 5, "vid-vega64": 8, "mon-pg27uq": 6, "bridge-nvlink": 9, "vid-5700xt": 7, "vid-3080": 9,
  "vid-6800xt": 11, "vid-a770": 10, "vid-7900xtx": 12, "mon-aw3423": 3, "vid-b580": 12, "mon-pg32": 3,
  // Memory
  "mem-dram": 10, "mem-simm": 6, "mem-sdram": 6, "mem-ddr": 10, "mem-ddr2": 6, "mem-ddr3": 6, "mem-ddr4": 8,
  "mem-ddr5": 7, "mem-ddr5-64": 11, "mem-ddr5-128": 11, "mem-ddr6": 12,
  "mem-4116": 6, "mem-4164": 6, "mem-41256": 6, "mem-simm4": 6, "mem-simm72": 6, "mem-edo": 6,
  "cache-coast256": 6, "cache-coast512": 6, "mem-pc66": 6, "mem-pc100": 6, "mem-pc133": 9, "mem-ddr400": 6,
  "mem-ddr2-667": 6, "mem-ddr2-800": 6, "mem-ddr2-1066": 6, "mem-ddr3-1333": 6, "mem-ddr3-1600": 6,
  "mem-ddr3-2133": 6, "mem-ddr4-2666": 6, "mem-ddr4-3200": 6, "mem-ddr4-3600": 6, "mem-ddr5-6000": 6,
  "mem-ddr5-7200": 6,
  // Storage
  "tab-hollerith": 1, "store-tape": 3, "store-hdd": 9, "store-pack": 10, "store-3330": 6, "store-3380": 6,
  "store-floppy": 6, "store-scsi": 6, "store-10k": 6, "store-sata": 6, "store-ssd": 6, "store-1tb": 6,
  "store-ssd2t": 7, "store-nvme": 7, "store-symm": 6, "store-thumper": 7, "store-pod": 9,
  "store-flasharray": 6,
  "med-sa400": 9, "med-disk2": 7, "drv-st506": 6, "med-360k": 6, "drv-ro352": 6, "drv-st225": 6,
  "med-144": 6, "drv-cp3044": 6, "med-cd2x": 6, "drv-lps540": 6, "med-zip": 6, "med-ez135": 6,
  "drv-caviar": 6, "med-jaz": 6, "drv-16gp": 6, "med-ls120": 6, "med-dvd": 6, "med-cdrw": 6,
  "add-fasttrak": 6, "drv-fireball": 6, "drv-75gxp": 6, "drv-mpg": 6, "med-cd52": 6, "drv-dm9": 6,
  "drv-raptor": 6, "med-dvdrw": 6, "med-hddvd": 6, "med-bd": 6, "drv-7k1000": 6, "add-raid5805": 6,
  "drv-spinpoint": 6, "drv-vraptor": 6, "ssd-x25m": 9, "ssd-vertex": 9, "drv-3tb": 10, "ssd-840pro": 9,
  "ssd-850evo": 12, "ssd-950pro": 10, "drv-10tb": 6, "ssd-900p": 10, "ssd-mx500": 6, "ssd-mp600": 7,
  "ssd-970evo": 7, "drv-18tb": 6, "ssd-980pro": 9, "ssd-sn850": 10, "ssd-990pro": 10, "drv-24tb": 6,
  "ssd-t700": 6,
  // Cooling
  "cool-sink": 6, "cool-labfan": 6, "cool-fan": 6, "cool-pipe": 6, "cool-liquid": 6, "cool-immersion": 6,
  "cool-clip": 6, "cool-586fan": 6, "cool-slot": 6, "cool-orb": 6, "cool-pal8045": 6, "cool-cnps7000": 6,
  "cool-ninja": 6, "cool-212": 6, "cool-d14": 10, "cool-h50": 6, "cool-h100": 6, "cool-d15": 6,
  "cool-x61": 6, "cool-tr4": 8, "cool-wraith": 6, "cool-drp4": 6, "cool-h150": 6, "cool-lf420": 6,
  "cool-x73": 6, "cool-pa120": 6, "cool-d15g2": 6, "cool-lf3": 6,
  // Power
  "pwr-at": 8, "pwr-atx": 7, "pwr-80": 2, "pwr-gold": 6, "pwr-plat": 6, "pwr-titan": 6, "pwr-at230": 6,
  "pwr-atx400": 6, "pwr-sfx": 6, "pwr-sf750": 6, "pwr-atx3": 6, "pwr-sf1000": 6, "pwr-atx31": 6,
  // Network
  "net-eth": 9, "net-10baset": 9, "net-100": 6, "net-wifi": 6, "net-gige": 6, "net-10g": 6, "net-ibqdr": 6,
  "net-n": 9, "net-ac": 12, "net-ibedr": 6, "net-nvlink": 6, "net-ibhdr": 11, "net-nvswitch": 6,
  "net-ax": 9, "net-be": 1,
  "mod-300": 7, "net-3c501": 9, "mod-1200": 6, "net-tokenring": 10, "mod-2400": 6, "mod-14k": 6,
  "net-3c509": 6, "mod-28k": 9, "mod-56k": 6, "net-orinoco": 7, "net-wmp54g": 6, "net-killer": 10,
  "net-aqc107": 6,
  // Servers
  "srv-mark1": 2, "srv-7090": 11, "srv-360": 4, "srv-1120": 6, "srv-780": 10, "srv-cray1": 3, "srv-xmp": 6,
  "srv-cray2": 6, "srv-ymp": 6, "srv-c90": 6, "srv-t3d": 9, "srv-t90": 6, "srv-t3e": 6, "srv-xt3": 10,
  "srv-xt5": 6, "srv-xc30": 11, "srv-crayex": 6, "srv-cm5": 10, "srv-alpha": 4, "srv-origin": 10,
  "srv-e10k": 1, "srv-tower": 6, "srv-2u": 6, "srv-blade": 6, "srv-r1": 3, "srv-r4": 3, "srv-calx": 6,
  "srv-altra": 3,
  // Boards and add-in cards
  "board-altair": 1, "board-orchard2": 6, "board-trs80": 8, "board-5150": 8, "board-at": 8,
  "board-deskpro": 9, "board-vlb": 8, "board-430lx": 3, "board-nxvl": 3, "board-430fx": 1,
  "board-440fx": 5, "board-430tx": 2, "board-440lx": 8, "board-mvp3": 6, "board-440bx": 4, "board-be6": 10,
  "board-amd750": 8, "board-kt7": 6, "board-845": 9, "board-kt266a": 9, "board-8rda": 10, "board-875p": 4,
  "board-ic7": 5, "board-nf3": 6, "board-nf4": 10, "board-915btx": 6, "board-lanparty": 6, "board-945p": 6,
  "board-p965": 6, "board-p35": 6, "board-790fx": 11, "board-x48": 3, "board-x58": 11, "board-x58c": 6,
  "board-p55": 9, "board-890fx": 4, "board-p67": 1, "board-h67": 1, "board-z68": 5, "board-990fx": 6,
  "board-z77": 4, "board-z87": 6, "board-h87": 6, "board-z97": 5, "board-z170": 8, "board-z170i": 8,
  "board-b150": 9, "board-z270": 1, "board-a320": 3, "board-b350": 3, "board-x370": 3, "board-x399": 8,
  "board-zenith": 8, "board-z370": 10, "board-b360": 4, "board-z390": 10, "board-b450": 7, "board-x470": 4,
  "board-x570": 7, "board-b550": 6, "board-b550i": 6, "board-z690": 11, "board-z690d4": 11, "board-b660": 1,
  "board-h610": 1, "board-z790": 10, "board-z790i": 10, "board-x670e": 9, "board-b650": 10, "board-a620": 3,
  "board-z890": 10,
  "add-wintv": 6, "add-wintvpci": 6, "add-wintvhd": 6, "add-hd60": 6, "add-4k60": 6,
  // Sound
  "snd-covox": 6, "snd-adlib": 8, "snd-lapc": 6, "snd-sb": 11, "snd-dss": 6, "snd-pas": 6, "snd-sbpro": 6,
  "snd-sb16": 6, "snd-gus": 10, "snd-awe32": 6, "snd-soundscape": 6, "snd-tropez": 6, "snd-awe64": 11,
  "snd-vortex": 6, "snd-audiopci": 6, "snd-mx300": 6, "snd-vortex2": 6, "snd-live": 8, "snd-audigy": 8,
  "snd-audigy2": 9, "snd-xfi": 8, "snd-xmeridian": 6, "snd-stx": 6, "snd-z": 6, "snd-zxr": 6, "snd-ae5": 6,
  "snd-ae7": 6,
  // Cases
  "case-atdesk": 8, "case-attower": 6, "case-babyat": 6, "case-atxmid": 6, "case-matx": 12, "case-pc60": 6,
  "case-xaser": 6, "case-atxfull": 6, "case-stacker": 6, "case-sonata": 6, "case-btx": 6, "case-p180": 6,
  "case-cosmos": 6, "case-haf932": 6, "case-800d": 6, "case-phantom": 6, "case-torture": 6,
  "case-airflow": 6, "case-r4": 6, "case-900d": 6, "case-itx": 6, "case-h440": 6, "case-m1": 6,
  "case-defines": 6, "case-570x": 6, "case-meshifyc": 6, "case-mesh": 6, "case-o11": 6, "case-o11xl": 6,
  "case-nr200": 6, "case-lancool": 6, "case-north": 6, "case-y60": 6, "case-o11v": 6, "case-northxl": 6,
  // 0.0.31: the 1950s-70s machine room and the first home-computer cases
  "pwr-ups": 6, "pwr-switch": 6, "cool-crac": 6, "case-s100": 1, "case-plastic": 6, "net-imp": 10,
};

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthName(month) {
  return MONTH_NAMES[Math.min(12, Math.max(1, Math.floor(month) || 1)) - 1];
}
