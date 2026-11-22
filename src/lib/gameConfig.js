// Central tuning for the idle computing-empire game: eras, milestones, and money math.
//
// Pacing: the first unit of each row costs more than the row before it, and a
// steady player opens a new row every two to four minutes through the first
// half hour (Jacquard loom ~6 min, punch cards ~7, tubes ~14, transistors
// ~19, ICs ~27). From
// Integrated Circuits on, prices and revenue are unchanged from the earlier
// tuning, so the first prestige (~3 h) and first fork (~4 days nonstop) stay
// where they were. Checked with the pacing simulation after the history
// reorder.

export const BUSINESSES = [
  // Rows run in historical order. Each material sits just before the first
  // era that uses it: wood and paper before the Jacquard loom (1804) and
  // punch cards (1890); sand,
  // copper, glass and filament before vacuum tubes (1946); germanium before
  // the first transistors; silicon and wafers before integrated circuits.
  // Saves store rows by id (save v5 and later).
  {
    id: "timber",
    name: "Timber Camp",
    era: "Raw stock",
    tagline: "Fell trees and float the logs to the mill. Paper starts in the forest.",
    icon: "/icons/timber.png",
    baseCost: 4,
    revenue: 0.4,
    cycleMs: 2200,
    coef: 1.14,
    managerName: "Feller",
    managerCost: 180,
    managerNeed: 5,
    revCost: 550,
    spdCost: 52000,
    makes: { wood: 1 },
    speedNeed: 25,
    masteryNeed: 75,
    badgeOwned: 20,
    upgrades: ["Crosscut Saws", "Two-man saws bite faster. Triple the wood, and each load pays triple.", "Log Flume", "The logs ride the water to the mill. Twice the speed."],
  },
  {
    id: "paper",
    name: "Paper Mill",
    era: "Raw stock",
    tagline: "Grind logs to pulp and press it into stiff card stock that can take a punch.",
    icon: "/icons/paper.png",
    baseCost: 80,
    revenue: 1.4,
    cycleMs: 2400,
    coef: 1.15,
    managerName: "Mill Hand",
    managerCost: 2400,
    revCost: 14000,
    spdCost: 160000,
    uses: { wood: 1 },
    makes: { paper: 1 },
    speedNeed: 50,
    masteryNeed: 75,
    badgeOwned: 15,
    upgrades: ["Rag Content", "Cotton-rich card stock stops tearing. Triple the card stock, and each bale pays triple.", "Continuous Roll", "The machine makes one endless roll. Twice the speed."],
  },
  {
    id: "loom",
    name: "Jacquard Loom",
    era: "c. 1804",
    tagline: "A chain of punched cards tells the loom which threads to lift. The first stored instructions.",
    icon: "/icons/loom.png",
    baseCost: 150,
    revenue: 4,
    cycleMs: 2600,
    coef: 1.12,
    managerName: "Master Weaver",
    managerCost: 3600,
    revCost: 20000,
    spdCost: 220000,
    uses: { paper: 1 },
    speedNeed: 50,
    masteryNeed: 100,
    badgeOwned: 20,
    upgrades: ["Silk Brocade", "Patterns too fine for any hand weaver. Each bolt pays triple.", "Steam Drive", "An engine works the loom instead of feet. Twice the speed."],
  },
  {
    id: "punchcards",
    name: "Punch Cards",
    era: "c. 1890",
    tagline: "Holes in stiff cards count a whole nation, one tabulator run at a time.",
    icon: "/icons/punchcards.png",
    baseCost: 300,
    revenue: 12,
    cycleMs: 3000,
    coef: 1.09,
    managerName: "Keypunch Operator",
    managerCost: 6000,
    revCost: 30000,
    spdCost: 300000,
    uses: { paper: 1 },
    speedNeed: 50,
    masteryNeed: 125,
    badgeOwned: 25,
    upgrades: ["Steel Hoppers", "The card path stops jamming. Every stack pays triple.", "Gang Punch", "One stroke copies a whole card. Cycles run twice as fast."],
  },
  {
    id: "sand",
    name: "Sand Quarry",
    era: "Raw stock",
    tagline: "Scoop silica sand for the glassworks. Much later, silicon chips start as grit too.",
    icon: "/icons/sand.png",
    baseCost: 1000,
    revenue: 6,
    cycleMs: 2200,
    coef: 1.14,
    managerName: "Pit Boss",
    managerCost: 15000,
    revCost: 75000,
    spdCost: 750000,
    makes: { sand: 1 },
    speedNeed: 25,
    masteryNeed: 75,
    badgeOwned: 20,
    upgrades: ["Screened Grit", "Washed sand sells cleaner. Triple the sand, and each scoop pays triple.", "Second Shift", "The pit stays lit. Cycles run twice as fast."],
  },
  {
    id: "copper",
    name: "Copper Seam",
    era: "Raw stock",
    tagline: "Wire starts in the rock. Pull copper before the valve works ask.",
    icon: "/icons/copper.png",
    baseCost: 1700,
    revenue: 9,
    cycleMs: 2400,
    coef: 1.15,
    managerName: "Drift Miner",
    managerCost: 25000,
    revCost: 125000,
    spdCost: 1250000,
    makes: { copper: 1 },
    speedNeed: 25,
    masteryNeed: 75,
    badgeOwned: 20,
    upgrades: ["High-Grade Ore", "The seam runs rich. Triple the copper, and each pull pays triple.", "Twin Drills", "Two faces at once. The cycle is cut in half."],
  },
  {
    id: "glass",
    name: "Glassworks",
    era: "Refine",
    tagline: "Melt sand into clear glass, ready to blow into bulbs and valves.",
    icon: "/icons/glass.png",
    baseCost: 2500,
    revenue: 8,
    cycleMs: 3000,
    coef: 1.15,
    managerName: "Glassblower",
    managerCost: 30000,
    revCost: 150000,
    spdCost: 1500000,
    uses: { sand: 1 },
    makes: { glass: 1 },
    speedNeed: 50,
    masteryNeed: 75,
    badgeOwned: 15,
    upgrades: ["Borosilicate Batch", "Tougher glass takes the heat. Triple the glass, and each melt pays triple.", "Ribbon Machine", "Bulbs blown from a moving ribbon of glass. Twice the speed."],
  },
  {
    id: "filament",
    name: "Filament Forge",
    era: "Refine",
    tagline: "Draw tungsten and nickel into fine wire for the glowing heart of a tube.",
    icon: "/icons/filament.png",
    baseCost: 4000,
    revenue: 12,
    cycleMs: 3200,
    coef: 1.15,
    managerName: "Wire Drawer",
    managerCost: 50000,
    revCost: 250000,
    spdCost: 2500000,
    makes: { filament: 1 },
    speedNeed: 50,
    masteryNeed: 75,
    badgeOwned: 15,
    upgrades: ["Ductile Tungsten", "Tungsten that bends into wire. Triple the filament, and each spool pays triple.", "Diamond Dies", "Wire pulled through diamond dies runs twice as fast."],
  },
  {
    id: "radios",
    name: "Radio Valves",
    era: "c. 1920",
    tagline: "Arcea Radiola III and a Stillwater Kett Model 20 fill the parlour. UX-201A valves glow behind the grille.",
    icon: "/icons/eras/radios.png",
    baseCost: 5000,
    revenue: 80,
    cycleMs: 3000,
    coef: 1.11,
    managerName: "Valve Tester",
    managerCost: 80000,
    revCost: 400000,
    spdCost: 4000000,
    uses: { glass: 1, copper: 1, filament: 1 },
    speedNeed: 50,
    masteryNeed: 125,
    badgeOwned: 25,
    upgrades: ["UX-201A Valves", "The bright-emitter triode holds a charge longer. Every set pays triple.", "Superhet Circuit", "One tuner finds the station. Cycles run twice as fast."],
  },
  {
    id: "relay",
    name: "Relay Computers",
    era: "c. 1941",
    tagline: "Crossbar Works model 3 clicks through a sum. Thousands of relays, a few times a second.",
    icon: "/icons/eras/relay.png",
    baseCost: 550,
    revenue: 22,
    cycleMs: 3200,
    coef: 1.11,
    managerName: "Relay Clerk",
    managerCost: 9000,
    revCost: 45000,
    spdCost: 450000,
    speedNeed: 50,
    masteryNeed: 125,
    badgeOwned: 25,
    upgrades: ["Sealed Relays", "The contacts stop sticking. Every rack pays triple.", "Cam Shaft", "One motor clocks the whole machine. Twice the speed."],
  },
  {
    id: "tubes",
    name: "Vacuum Tubes",
    era: "c. 1946",
    tagline: "Room-sized computers, soldered together one glowing glass valve at a time.",
    icon: "/icons/tubes.png",
    baseCost: 7000,
    revenue: 200,
    cycleMs: 3000,
    coef: 1.11,
    managerName: "Lab Technician",
    managerCost: 200000,
    revCost: 1000000,
    spdCost: 10000000,
    uses: { glass: 1, copper: 1, filament: 1 },
    speedNeed: 50,
    masteryNeed: 150,
    badgeOwned: 25,
    upgrades: ["Getter Flash", "A flash of metal soaks up the last of the air. Each batch fetches triple.", "Batch Soldering", "Pre-tinned chassis wire up in half the time."],
  },
  {
    id: "mainframes",
    name: "Mainframes",
    era: "c. 1951",
    tagline: "Irwell Electrics delivers the Mark 1. A room of tubes, and a memory made of glowing glass.",
    icon: "/icons/eras/mainframes.png",
    baseCost: 14000,
    revenue: 420,
    cycleMs: 4500,
    coef: 1.12,
    managerName: "Mainframe Operator",
    managerCost: 400000,
    revCost: 2000000,
    spdCost: 20000000,
    speedNeed: 50,
    masteryNeed: 150,
    badgeOwned: 25,
    upgrades: ["Williams Store", "The working memory sits on cathode-ray tubes. Each job pays triple.", "Drum Schedule", "The drum keeps the queue moving. Cycles are halved."],
  },
  {
    id: "germanium",
    name: "Germanium Refinery",
    era: "Refine",
    tagline: "Pull germanium from smelter dust. The first transistors were made of it.",
    icon: "/icons/germanium.png",
    baseCost: 12000,
    revenue: 24,
    cycleMs: 3400,
    coef: 1.15,
    managerName: "Furnace Chemist",
    managerCost: 200000,
    revCost: 1000000,
    spdCost: 8000000,
    makes: { germanium: 1 },
    speedNeed: 50,
    masteryNeed: 100,
    badgeOwned: 15,
    upgrades: ["Zone Refining", "A molten zone sweeps the impurities out. Triple the germanium, and triple the pay.", "Tandem Furnaces", "Two furnaces share the load. Cycles are halved."],
  },
  {
    id: "transistors",
    name: "Transistors",
    era: "c. 1954",
    tagline: "Solid-state switches replace the glowing glass. Smaller, cooler, faster.",
    icon: "/icons/transistors.png",
    baseCost: 25920,
    revenue: 945,
    cycleMs: 6000,
    coef: 1.14,
    managerName: "Junction Tech",
    managerCost: 3600000,
    uses: { germanium: 1 },
    speedNeed: 75,
    masteryNeed: 150,
    badgeOwned: 20,
    upgrades: ["Alloy Junctions", "Cleaner junctions, triple the yield from each crystal.", "Wave Soldering", "The line never waits on a hand iron. Twice the speed."],
  },
  {
    id: "silicon",
    name: "Silicon Still",
    era: "Refine",
    tagline: "Refine sand into ultra-pure silicon. It takes over from germanium.",
    icon: "/icons/silicon.png",
    baseCost: 40000,
    revenue: 60,
    cycleMs: 2800,
    coef: 1.15,
    managerName: "Kiln Hand",
    managerCost: 1000000,
    revCost: 5000000,
    spdCost: 40000000,
    uses: { sand: 1 },
    makes: { silicon: 1 },
    speedNeed: 50,
    masteryNeed: 75,
    badgeOwned: 15,
    upgrades: ["Float Zone", "A molten zone carries the impurities away. Triple the silicon, and triple the pay.", "Hotter Crucible", "The melt finishes sooner. Twice the speed."],
  },
  {
    id: "wafers",
    name: "Wafer Bench",
    era: "Grow",
    tagline: "Pull one big silicon crystal and slice it into wafers.",
    icon: "/icons/wafers.png",
    baseCost: 90000,
    revenue: 140,
    cycleMs: 3600,
    coef: 1.15,
    managerName: "Crystal Puller",
    managerCost: 2500000,
    revCost: 12000000,
    spdCost: 100000000,
    uses: { silicon: 1 },
    makes: { wafers: 2 },
    speedNeed: 50,
    masteryNeed: 100,
    badgeOwned: 15,
    upgrades: ["Seed Crystals", "Each pull starts true. Triple the wafers, and triple the pay.", "Twin Pullers", "Two crystals grow at once. Cycles are halved."],
  },
  {
    id: "ics",
    name: "Integrated Circuits",
    era: "c. 1965",
    tagline: "A whole logic board shrunk onto a single sliver of silicon.",
    icon: "/icons/ics.png",
    baseCost: 311040,
    revenue: 13230,
    cycleMs: 12000,
    coef: 1.14,
    managerName: "Fab Line Supervisor",
    managerCost: 18000000,
    managerNeed: 5,
    uses: { wafers: 1 },
    speedNeed: 75,
    masteryNeed: 150,
    badgeOwned: 30,
    upgrades: ["Gold Bond Wire", "The leads stop failing. Revenue from each die triples.", "Mask Aligner", "Masks land true. The fab cycle is cut in half."],
  },
  {
    id: "minis",
    name: "Minicomputers",
    era: "c. 1965",
    tagline: "Maynard Equipment 8 fits beside a desk. A 12-bit machine for the price of a small lab.",
    icon: "/icons/eras/minis.png",
    baseCost: 1200000,
    revenue: 45000,
    cycleMs: 16000,
    coef: 1.13,
    managerName: "Minicomputer Technician",
    managerCost: 28000000,
    managerNeed: 5,
    speedNeed: 75,
    masteryNeed: 150,
    badgeOwned: 30,
    upgrades: ["Flip-Chip Cards", "Logic on plug-in cards. Each rack pays triple.", "Unibus", "One bus ties the processor, memory and devices together. Twice the speed."],
  },
  {
    id: "cpu",
    name: "Microprocessors",
    era: "c. 1971",
    tagline: "A computer on a chip. The brain is born, and it prints money.",
    icon: "/icons/cpu.png",
    baseCost: 5598720,
    revenue: 277830,
    cycleMs: 24000,
    coef: 1.12,
    managerName: "Chip Architect",
    managerCost: 43200000,
    managerNeed: 5,
    speedNeed: 100,
    masteryNeed: 150,
    badgeOwned: 40,
    upgrades: ["Microcode Cache", "The chip stops fetching from the slow path. Triple revenue.", "Pipelined Clock", "Instructions overlap. The cycle time is halved."],
  },
  {
    id: "homepc",
    name: "Home Computers",
    era: "c. 1977",
    tagline: "Computing escapes the lab and lands on every desk in the suburbs.",
    icon: "/icons/homepc.png",
    baseCost: 134369280,
    revenue: 5834430,
    cycleMs: 48000,
    coef: 1.11,
    managerName: "Assembly Line Boss",
    managerCost: 432000000,
    managerNeed: 5,
    speedNeed: 100,
    masteryNeed: 175,
    badgeOwned: 50,
    upgrades: ["Bundled Software", "Every desk ships with a reason to buy. Triple revenue.", "Assembly Jig", "Cases close themselves. The line runs twice as fast."],
  },
  {
    id: "consoles",
    name: "Game Consoles",
    era: "c. 1977",
    tagline: "Paddle Arts 2600 plugs into the television. The game lives on a cartridge.",
    icon: "/icons/eras/consoles.png",
    baseCost: 400000000,
    revenue: 16000000,
    cycleMs: 60000,
    coef: 1.11,
    managerName: "Cartridge Librarian",
    managerCost: 900000000,
    managerNeed: 5,
    speedNeed: 100,
    masteryNeed: 175,
    badgeOwned: 40,
    upgrades: ["Bank Switching", "A cartridge holds more than the slot can see at once. Revenue triples.", "Disc Press", "Games ship on a pressed disc. The line runs twice as fast."],
  },  {
    id: "supercomputers",
    name: "Supercomputers",
    era: "1982",
    tagline: "Chippewa X-MP. Four vector processors, with a padded bench round the frame.",
    icon: "/icons/eras/supercomputers.png",
    baseCost: 812_000_000,
    revenue: 13_400_000,
    cycleMs: 63000,
    coef: 1.105,
    managerName: "Vector Programmer",
    managerCost: 1100000000,
    managerNeed: 5,
    speedNeed: 100,
    masteryNeed: 175,
    badgeOwned: 40,
    upgrades: ["Vector Units", "Long rows of numbers go through at once. Each supercomputer pays triple.", "Freon Loops", "The frame stays cold. Cycles are halved."],
  },
  {
    id: "workstations",
    name: "Workstations",
    era: "1985",
    tagline: "Sunrise-3. A desk-side UNIX machine with a big bitmapped screen and a network port.",
    icon: "/icons/eras/workstations.png",
    baseCost: 1_015_000_000,
    revenue: 16_750_000,
    cycleMs: 66000,
    coef: 1.105,
    managerName: "Systems Administrator",
    managerCost: 1300000000,
    managerNeed: 5,
    speedNeed: 100,
    masteryNeed: 175,
    badgeOwned: 40,
    upgrades: ["Network File System", "Files live on one server. Each workstation pays triple.", "RISC Chips", "Fewer, simpler instructions run faster. Cycles are halved."],
  },
  {
    id: "laptops",
    name: "Laptops",
    era: "1988",
    tagline: "Compass SLT/286. A whole PC that folds shut, about 14 pounds.",
    icon: "/icons/eras/laptops.png",
    baseCost: 1_276_000_000,
    revenue: 22_110_000,
    cycleMs: 69000,
    coef: 1.1,
    managerName: "Field Engineer",
    managerCost: 1500000000,
    managerNeed: 5,
    speedNeed: 100,
    masteryNeed: 175,
    badgeOwned: 45,
    upgrades: ["Backlit Screens", "Readable on a plane. Each laptop pays triple.", "Better Batteries", "More work between charges. Cycles are halved."],
  },

  {
    id: "dialup",
    name: "Dial-up Web",
    era: "c. 1991",
    tagline: "A phone call, a modem, and one public page at CERN. Then pictures and links.",
    icon: "/icons/eras/dialup.png",
    baseCost: 1100000000,
    revenue: 42000000,
    cycleMs: 72000,
    coef: 1.105,
    managerName: "Modem Wrangler",
    managerCost: 1800000000,
    managerNeed: 5,
    speedNeed: 100,
    masteryNeed: 175,
    badgeOwned: 50,
    upgrades: ["Inline Images", "The browser draws the pictures itself. Each line pays triple.", "V.34 Handshake", "The modem locks at 28.8 kbit/s. Cycles are halved."],
  },  {
    id: "multimedia",
    name: "Multimedia PCs",
    era: "1993",
    tagline: "A CD-ROM drive, a sound card and speakers, sold as an upgrade kit.",
    icon: "/icons/eras/multimedia.png",
    baseCost: 2_276_500_000,
    revenue: 40_200_000,
    cycleMs: 80000,
    coef: 1.1,
    managerName: "Kit Installer",
    managerCost: 2400000000,
    managerNeed: 5,
    speedNeed: 100,
    masteryNeed: 175,
    badgeOwned: 50,
    upgrades: ["Double-Speed Drives", "Discs load before the coffee cools. Each PC pays triple.", "Wavetable Sound", "Real instrument samples. Cycles are halved."],
  },
  {
    id: "accel3d",
    name: "3D Accelerators",
    era: "1996",
    tagline: "Threefold Add-in. A 3D-only card that clicks on as the game starts.",
    icon: "/icons/eras/accel3d.png",
    baseCost: 3_262_500_000,
    revenue: 57_620_000,
    cycleMs: 88000,
    coef: 1.1,
    managerName: "Driver Wrangler",
    managerCost: 3100000000,
    managerNeed: 5,
    speedNeed: 110,
    masteryNeed: 190,
    badgeOwned: 60,
    upgrades: ["Texture Memory", "More detail on every wall. Each card pays triple.", "Linked Cards", "Two cards split the lines. Cycles are halved."],
  },

  {
    id: "gpu",
    name: "Graphics Cards",
    era: "c. 1999",
    tagline: "Polygons! Pixels! The GPU gold rush begins and never slows down.",
    icon: "/icons/gpu.png",
    baseCost: 3224862720,
    revenue: 122523030,
    cycleMs: 96000,
    coef: 1.1,
    managerName: "Silicon Engineer",
    managerCost: 3996000000,
    managerNeed: 5,
    speedNeed: 125,
    masteryNeed: 200,
    badgeOwned: 80,
    upgrades: ["Shader Cores", "More pixels per die. Graphics revenue triples.", "Binning Pass", "Good chips leave the tester sooner. Twice the speed."],
  },
  {
    id: "cloud",
    name: "Cloud Datacenters",
    era: "c. 2006",
    tagline: "Canopy Bucket rents the storage. Canopy Instances rents the computer.",
    icon: "/icons/eras/cloud.png",
    baseCost: 22000000000,
    revenue: 480000000,
    cycleMs: 120000,
    coef: 1.095,
    managerName: "Datacenter Tech",
    managerCost: 8000000000,
    managerNeed: 5,
    speedNeed: 125,
    masteryNeed: 200,
    badgeOwned: 60,
    upgrades: ["Object Store", "Pay for what you keep and what you move. Revenue triples.", "Hourly Instances", "A virtual computer starts and stops by the hour. Twice the speed."],
  },
  {
    id: "phones",
    name: "Smartphones",
    era: "2007",
    tagline: "The Orchard Handset. A 3.5-inch slab, 412 MHz, and 128 MB of memory.",
    icon: "/icons/eras/phones.png",
    baseCost: 96000000000,
    revenue: 1100000000,
    cycleMs: 150000,
    coef: 1.092,
    managerName: "Handset Lead",
    managerCost: 14000000000,
    managerNeed: 5,
    speedNeed: 125,
    masteryNeed: 200,
    badgeOwned: 70,
    upgrades: ["Multi-Touch", "The glass takes more than one finger. Each handset pays triple.", "App Store", "Software arrives without a shop. The line runs twice as fast."],
  },  {
    id: "tablets",
    name: "Tablets",
    era: "2010",
    tagline: "Orchard Slate. A 9.7-inch touchscreen, about ten hours on a charge.",
    icon: "/icons/eras/tablets.png",
    baseCost: 124_700_000_000,
    revenue: 1_139_000_000,
    cycleMs: 170000,
    coef: 1.09,
    managerName: "App Reviewer",
    managerCost: 17000000000,
    managerNeed: 5,
    speedNeed: 140,
    masteryNeed: 200,
    badgeOwned: 80,
    upgrades: ["Sharper Screens", "Pixels too small to see. Each tablet pays triple.", "App Stores", "Software in one tap. Cycles are halved."],
  },

  {
    id: "rgb",
    name: "RGB Battlestations",
    era: "c. 2015",
    tagline: "More glow, more frames, more profit. The fans never sleep.",
    icon: "/icons/rgb.png",
    baseCost: 77396705280,
    revenue: 2572983630,
    cycleMs: 192000,
    coef: 1.09,
    managerName: "Streamer Crafter",
    managerCost: 19999999980,
    managerNeed: 5,
    speedNeed: 150,
    masteryNeed: 200,
    badgeOwned: 100,
    upgrades: ["Addressable LEDs", "The glow is the product. Revenue triples.", "Fan Curves", "Thermals stay quiet. Cycles complete twice as fast."],
  },
  {
    id: "ai",
    name: "AI Accelerators",
    era: "2016",
    tagline: "Tensor Foundry T1. A 256 by 256 array of 8-bit multiply-accumulators, built to infer.",
    icon: "/icons/eras/ai.png",
    baseCost: 1300000000000,
    revenue: 14000000000,
    cycleMs: 260000,
    coef: 1.085,
    managerName: "Accelerator Keeper",
    managerCost: 90000000000,
    managerNeed: 5,
    speedNeed: 150,
    masteryNeed: 200,
    badgeOwned: 80,
    upgrades: ["Systolic Array", "The multiply-accumulators stay fed. Each rack pays triple.", "Batch Infer", "Requests move through in a block. Cycles are halved."],
  },
  {
    id: "quantum",
    name: "Quantum Servers",
    era: "c. 2019",
    tagline: "Superpositioned profits, observed daily inside a golden chandelier.",
    icon: "/icons/quantum.png",
    baseCost: 18000000000000,
    revenue: 220000000000,
    cycleMs: 384000,
    coef: 1.08,
    managerName: "Cryogenics Engineer",
    managerCost: 360000000000,
    managerNeed: 5,
    speedNeed: 200,
    masteryNeed: 250,
    badgeOwned: 150,
    upgrades: ["Cryo Loops", "The chandelier stays cold. Quantum revenue triples.", "Error Correction", "Fewer shots are wasted. The cycle is cut in half."],
  },  {
    id: "vr",
    name: "VR Headsets",
    era: "2020",
    tagline: "Visor Q2. No cable to a PC, 1832 by 1920 pixels for each eye.",
    icon: "/icons/eras/vr.png",
    baseCost: 700000000000000,
    revenue: 1800000000000,
    cycleMs: 420000,
    coef: 1.075,
    managerName: "Headset Fitter",
    managerCost: 1500000000000,
    managerNeed: 5,
    speedNeed: 200,
    masteryNeed: 250,
    badgeOwned: 150,
    upgrades: ["Inside-Out Tracking", "Cameras on the visor map the room. Each headset pays triple.", "Hand Tracking", "No controllers to pair. Cycles are halved."],
  },
  {
    id: "chatbots",
    name: "Chatbots",
    era: "2022",
    tagline: "Parlance. A chat window on a large language model; a million sign-ups in five days.",
    icon: "/icons/eras/chatbots.png",
    baseCost: 28000000000000000,
    revenue: 15000000000000,
    cycleMs: 480000,
    coef: 1.075,
    managerName: "Prompt Wrangler",
    managerCost: 6000000000000,
    managerNeed: 5,
    speedNeed: 200,
    masteryNeed: 250,
    badgeOwned: 150,
    upgrades: ["Instruction Tuning", "The model follows directions. Each chatbot pays triple.", "KV Cache", "Earlier words aren't worked out again. Cycles are halved."],
  },
  {
    id: "supercluster",
    name: "AI Superclusters",
    era: "2024",
    tagline: "Tens of thousands of Tensor cards on one network, training one model.",
    icon: "/icons/eras/supercluster.png",
    baseCost: 1200000000000000000,
    revenue: 120000000000000,
    cycleMs: 540000,
    coef: 1.07,
    managerName: "Cluster Scheduler",
    managerCost: 24000000000000,
    managerNeed: 5,
    speedNeed: 200,
    masteryNeed: 250,
    badgeOwned: 150,
    upgrades: ["Cold Plates", "Liquid runs over every card. Each supercluster pays triple.", "Optical Links", "Light carries the updates between racks. Cycles are halved."],
  },

];

// The year an era is set in, from its era label ("c. 1946" or "1982").
// Material rows have no year of their own.
export function eraYear(cfg) {
  const m = String(cfg?.era || "").match(/(\d{4})/);
  return m ? Number(m[1]) : null;
}

// Compact decade for the header, e.g. "1940s". An undated material row
// uses the next dated era (sand, copper, glass and filament → 1940s).
export function eraDecadeLabel(index) {
  if (!Number.isInteger(index) || index < 0 || index >= BUSINESSES.length) return "";
  let year = eraYear(BUSINESSES[index]);
  if (year == null) {
    for (let i = index + 1; i < BUSINESSES.length; i++) {
      year = eraYear(BUSINESSES[i]);
      if (year != null) break;
    }
  }
  if (year == null) {
    for (let i = index - 1; i >= 0; i--) {
      year = eraYear(BUSINESSES[i]);
      if (year != null) break;
    }
  }
  if (year == null) return "";
  return `${Math.floor(year / 10) * 10}s`;
}

// The newest era the player owns, as a decade label. An empty run uses
// the first row's decade.
export function reachedEraLabel(state) {
  let at = 0;
  (state?.biz || []).forEach((st, i) => {
    if ((st?.owned || 0) > 0) at = i;
  });
  return eraDecadeLabel(at);
}

// Ordered by owned count. The product tops out at ×96 (2^5 × 3) once a
// business reaches 200 — there is no milestone past that, so this multiplier
// cannot grow forever.
export const SUPPLY_KEYS = ["wood", "paper", "sand", "copper", "glass", "filament", "germanium", "silicon", "wafers", "polysilicon", "ofcopper", "hpge"];

// Refined grades: no row makes them. The refinery turns ten of the raw
// material into one, a batch at a time on a timer. Late research needs them.
export const REFINED = {
  polysilicon: { from: "silicon", name: "electronic-grade polysilicon", short: "polysilicon" },
  ofcopper: { from: "copper", name: "oxygen-free copper", short: "OF copper" },
  hpge: { from: "germanium", name: "high-purity germanium", short: "HP germanium" },
};
export const REFINE_RATIO = 10;
export const REFINE_BATCH = 100;
export const REFINE_MS = 60 * 1000;
export const FOREMAN_COST = 25000;
export const RESEARCH_MS = 20000;
export const UPGRADE_MS = 12000;
export const COMMISSION_MS = 8000;
export const PROJECT_MS = 20000;

// A manager can only be hired once the player owns this many of that row, so
// each new era is run by hand for a while before it runs itself. Timber Camp
// and the costly eras from Integrated Circuits on need 5; the pacing sim
// showed 10 there left casual players' later eras without managers between
// sessions and pushed their first fork back by days.
export const MANAGER_NEED = 10;

export function managerNeed(index) {
  return BUSINESSES[index]?.managerNeed ?? MANAGER_NEED;
}

export function blankSupply() {
  return Object.fromEntries(SUPPLY_KEYS.map((key) => [key, 0]));
}

export function indexOfBusiness(id) {
  return BUSINESSES.findIndex((cfg) => cfg.id === id);
}

export function blockedByGlass(state, index) {
  return state?.challenge?.id === "glass" && BUSINESSES[index]?.id !== "tubes";
}

// Owning this many of an era opens the next one. Before 0.0.18 one was
// enough, and the pacing sim showed players racing through every era to
// Microprocessors in about half an hour with almost no upgrades bought. At
// 10 the early eras take about an hour and upgrades fit in between.
export const ERA_GATE = 10;

// "10 Timber Camps", "10 Sand Quarries", "10 Wafer Benches", "10 Punch Cards".
export function pluralName(name) {
  const n = String(name || "");
  if (/s$/.test(n)) return n;
  if (/[^aeiou]y$/.test(n)) return `${n.slice(0, -1)}ies`;
  if (/(ch|sh|x)$/.test(n)) return `${n}es`;
  return `${n}s`;
}

// Earnings this run an era needs, on top of owning ERA_GATE of the era
// before it. The base is a little under what a first run has earned by the
// time it gets there, so a new game opens eras as before. Investors and forks
// raise it faster than they raise income (bonus^ERA_EARN_POWER), so a strong
// run still has to work for the late eras.
export const ERA_EARN_POWER = 1.25;
// Set at 60% of what the pacing sim's first run had earned on reaching each
// era (later eras, which a first run doesn't reach, from a strong run). The
// eras before Integrated Circuits need only the 10 of the one before, so the
// tutorial and a new game's first half hour are unchanged.
export const ERA_EARN = {
  ics: 1.1e8, minis: 1.2e8, cpu: 1.4e8, homepc: 5.0e8, consoles: 3.1e9, supercomputers: 2.5e10,
  workstations: 9.0e10, laptops: 1.3e11, dialup: 1.7e11, multimedia: 1.9e11, accel3d: 3.2e11, gpu: 4.3e11,
  cloud: 5.8e11, phones: 1.4e12, tablets: 3.1e12, rgb: 5.7e12, ai: 9.8e12, quantum: 5.2e13, vr: 1.6e15,
  chatbots: 6.1e16, supercluster: 5.8e18,
};
export function runBonus(state) {
  const forks = Math.max(0, Math.floor(Number(state?.singularities) || 0));
  return prestigeMult(state?.investors || 0) * Math.min(4, 1 + forks * 0.2);
}
export function eraEarnNeed(state, index) {
  const base = ERA_EARN[BUSINESSES[index]?.id] || 0;
  if (!(base > 0)) return 0;
  return base * runBonus(state) ** ERA_EARN_POWER;
}

// The late eras each need one TECH project done first. Research is kept
// through prestige, so this is a one-time gate. Each project's year is no
// later than the era before, so it can always be researched in time.
export const ERA_RESEARCH = {
  gpu: { id: "gpu-3d", name: "Threefold Add-in" },
  rgb: { id: "store-ssd", name: "SSD" },
  quantum: { id: "card-p100", name: "Tensor P100" },
  vr: { id: "net-ax", name: "Wi-Fi 6" },
  chatbots: { id: "card-a100", name: "Tensor A100" },
  supercluster: { id: "card-h100", name: "Tensor H100" },
};

// Opening an era the first time also takes a stock of material, paid only
// when the player taps OPEN ERA, and only once: it stays paid through
// prestige and forks. Mainframes need copper wiring, Integrated Circuits
// silicon, and every era after them wafers, a little more each time.
const sig2 = (n) => {
  const e = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / e) * e;
};
export const ERA_MATERIAL = { mainframes: { key: "copper", amount: 200 }, ics: { key: "silicon", amount: 200 } };
{
  const from = BUSINESSES.findIndex((cfg) => cfg.id === "minis");
  BUSINESSES.forEach((cfg, i) => {
    if (i >= from) ERA_MATERIAL[cfg.id] = { key: "wafers", amount: sig2(200 * 1.4 ** (i - from)) };
  });
}
export function eraPaid(state, index) {
  return (state?.erasPaid || []).includes(BUSINESSES[index]?.id);
}

// What an era still needs: owning enough of the one before, earning enough
// this run, for late eras a TECH project, and the first time a material. Each with what the player has
// now.
export function eraNeeds(state, index) {
  const prev = BUSINESSES[index - 1];
  const needs = [];
  if (prev) {
    const have = state?.biz?.[index - 1]?.owned || 0;
    needs.push({ kind: "own", have, need: ERA_GATE, met: have >= ERA_GATE, label: `Own ${ERA_GATE} ${pluralName(prev.name)}` });
  }
  const earn = eraEarnNeed(state, index);
  if (earn > 0) {
    const have = state?.lifetime || 0;
    needs.push({ kind: "earn", have, need: earn, met: have >= earn, label: `Earn ${money(earn)} this run` });
  }
  const project = ERA_RESEARCH[BUSINESSES[index]?.id];
  if (project) {
    const done = (state?.techDone || []).includes(project.id);
    needs.push({ kind: "research", have: done ? 1 : 0, need: 1, met: done, research: project.id, label: `Research ${project.name} on TECH` });
  }
  const material = ERA_MATERIAL[BUSINESSES[index]?.id];
  if (material) {
    const paid = eraPaid(state, index);
    const have = state?.supply?.[material.key] || 0;
    needs.push({ kind: "material", key: material.key, have: paid ? material.amount : have, need: material.amount, met: paid || have >= material.amount, paid, label: paid ? `${material.amount.toLocaleString("en-US")} ${material.key}: paid` : `Use ${material.amount.toLocaleString("en-US")} ${material.key} to open it` });
  }
  return needs;
}

// Can row `index` be bought? The first row always; any row already owned
// (old saves, Glass Ceiling's starting tubes) or already opened this run;
// otherwise once every need is met.
export function eraOpen(state, index) {
  if (index <= 0) return true;
  if (blockedByGlass(state, index)) return false;
  const biz = state?.biz || [];
  if ((biz[index]?.owned || 0) > 0) return true;
  if ((state?.erasOpened || []).includes(BUSINESSES[index]?.id)) return true;
  // An unpaid material is never taken on its own: it waits for OPEN ERA.
  if (ERA_MATERIAL[BUSINESSES[index]?.id] && !eraPaid(state, index)) return false;
  return eraNeeds(state, index).every((n) => n.met);
}

// Every need met and the material on hand, so OPEN ERA can be tapped.
export function eraCanOpen(state, index) {
  if (index <= 0 || eraOpen(state, index) || blockedByGlass(state, index)) return false;
  return eraNeeds(state, index).every((n) => n.met);
}

// The player tapped OPEN ERA: take the material, once, and open the era.
export function openEra(state, index) {
  if (!eraCanOpen(state, index)) return false;
  const id = BUSINESSES[index].id;
  const material = ERA_MATERIAL[id];
  if (material && !eraPaid(state, index)) {
    state.supply = { ...(state.supply || {}), [material.key]: Math.max(0, (state.supply?.[material.key] || 0) - material.amount) };
    state.erasPaid = [...(state.erasPaid || []), id];
  }
  state.erasOpened = [...(state.erasOpened || []), id];
  return true;
}

export function formatFlow(flow) {
  if (!flow) return "";
  return Object.entries(flow)
    .map(([key, count]) => `${count} ${count === 1 && key.endsWith("s") ? key.slice(0, -1) : key}`)
    .join(", ");
}

// Round counts, AdCap style: 25, 50, 75, 100, then 150 and 200. Speed and
// pay alternate; every per-business count (speed upgrade, mastery) is also a
// multiple of 25.
export const MILESTONES = [
  { owned: 25, speed: 2 },
  { owned: 50, speed: 2 },
  { owned: 75, mult: 2 },
  { owned: 100, speed: 2 },
  { owned: 150, mult: 2 },
  { owned: 200, mult: 3 },
];

export function milestoneMult(owned) {
  if (!Number.isFinite(owned) || owned < 0) return 1;
  return MILESTONES.reduce((m, ms) => (ms.mult && owned >= ms.owned ? m * ms.mult : m), 1);
}

// A hired manager that is switched on runs the row by itself. A paused
// manager (managerOff) leaves the row manual: tap to run, nothing while away.
export function isManaged(st) {
  return !!st?.manager && !st.managerOff;
}

// A cycle as the row shows it ("2.6", "0.65"): within 5 ms under a second
// and 50 ms above, so the label always matches the real clock.
export function cycleLabel(ms) {
  const s = (Number(ms) || 0) / 1000;
  return String(Number(s.toFixed(s < 1 ? 2 : 1)));
}

export function milestoneSpeed(owned) {
  if (!Number.isFinite(owned) || owned < 0) return 1;
  let speed = 1;
  for (const ms of MILESTONES) {
    if (ms.speed && owned >= ms.owned) speed *= ms.speed;
  }
  return speed;
}

export function nextMilestone(owned) {
  return MILESTONES.find((ms) => ms.owned > owned) || null;
}

const UNITS = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
const NAMES = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion"];

// short: 1.20B. scientific: 1.2e9. words: 1.2 billion.
let numberFormat = "short";

export function setNumberFormat(style) {
  numberFormat = style === "scientific" || style === "words" ? style : "short";
}

export function fmt(n) {
  if (Number.isNaN(n)) return "—";
  if (!isFinite(n)) return "∞";
  if (n < 0) return "-" + fmt(-n);
  if (n < 1000) return Number.isInteger(n) ? String(n) : n.toFixed(2);
  const tier = Math.floor(Math.log10(n) / 3);
  if (numberFormat === "scientific") return n.toExponential(1).replace("e+", "e");
  if (numberFormat === "words") {
    if (!Number.isFinite(tier) || tier >= NAMES.length || !NAMES[tier]) return n.toExponential(1).replace("e+", "e");
    const scaled = n / 1000 ** tier;
    const digits = scaled >= 100 ? 0 : 1;
    return `${scaled.toFixed(digits)} ${NAMES[tier]}`;
  }
  if (tier >= UNITS.length || !Number.isFinite(tier)) return n.toExponential(2).replace("e+", "e");
  return (n / 1000 ** tier).toFixed(2) + UNITS[tier];
}

export function money(n) {
  return "$" + fmt(n);
}

// Counts (investors, businesses owned) share the same Short / Scientific / Full names choice.
export function count(n) {
  return fmt(n);
}

// One click never buys more than this. Past here Math.pow(coef, owned) walks
// into Infinity and a MAX purchase would poison cash with NaN.
export const MAX_BUY = 1000;

// Total price of buying `count` units, geometric scaling per unit owned.
export function costOf(cfg, owned, count) {
  const r = cfg.coef;
  if (!Number.isFinite(r) || r <= 1) return Infinity;
  if (!Number.isFinite(owned) || owned < 0 || !Number.isFinite(count) || count < 1 || count > MAX_BUY) {
    return Infinity;
  }
  const start = cfg.baseCost * Math.pow(r, owned);
  const total = (start * (Math.pow(r, count) - 1)) / (r - 1);
  return Number.isFinite(total) ? total : Infinity;
}

export function maxAffordable(cfg, owned, cash) {
  const r = cfg.coef;
  if (!Number.isFinite(r) || r <= 1) return 0;
  const start = cfg.baseCost * Math.pow(r, owned);
  if (!Number.isFinite(cash) || cash <= 0 || !Number.isFinite(start) || start <= 0 || !Number.isFinite(owned) || owned < 0) {
    return 0;
  }
  const n = Math.floor(Math.log((cash * (r - 1)) / start + 1) / Math.log(r));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_BUY, n));
}

// One button cycles these in order, then wraps back to X1.
export const BUY_MODE_CYCLE = ["x1", "x10", "x25", "x50", "x75", "x100", "MAX"];

// NEXT was the old "buy up to the next goal" switch. Anything that is not a
// current amount, including NEXT, comes back as X1. x1, x10, x100 and max stay.
export function normalizeBuyMode(mode) {
  const raw = String(mode || "");
  if (raw.toLowerCase() === "max") return "MAX";
  const id = raw.toLowerCase();
  return BUY_MODE_CYCLE.includes(id) ? id : "x1";
}

export function nextBuyMode(mode) {
  const current = normalizeBuyMode(mode);
  const i = BUY_MODE_CYCLE.indexOf(current);
  return BUY_MODE_CYCLE[(i + 1) % BUY_MODE_CYCLE.length];
}

export function buyModeLabel(mode) {
  const id = normalizeBuyMode(mode);
  return id === "MAX" ? "MAX" : id.toUpperCase();
}

// Each amount buys exactly that many. MAX buys as many as you can afford.
// Buying past a milestone still gives its bonus (bonuses come from the owned count).
export function buyCount(mode, cfg, owned, cash) {
  const id = normalizeBuyMode(mode);
  if (id === "MAX") return Math.min(MAX_BUY, Math.max(maxAffordable(cfg, owned, cash), 1));
  const n = parseInt(id.slice(1), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(MAX_BUY, n);
}

// Closed tabs, hidden tabs, and suspended timers all share this one budget.
export const OFFLINE_CAP_MS = 24 * 60 * 60 * 1000;
export const AWAY_MODAL_MS = 60 * 1000;
// Managers earn at this rate while the app is closed or in the background, so
// playing with the app open pays about twice as well as leaving it.
export const OFFLINE_RATE = 0.5;
// A quick look at another app (under this long) still counts as playing.
export const AWAY_GRACE_MS = 30 * 1000;
// A live tick longer than this is a stalled or suspended timer, not a frame.
export const NORMAL_TICK_MS = 2000;

// `budget` is the milliseconds still payable for the current absence.
// Visible play refills it. A hidden streak draws it down to zero and stops.
export function cappedTick(raw, hidden, budget) {
  const safeRaw = Number.isFinite(raw) && raw > 0 ? raw : 0;
  const safeBudget = Number.isFinite(budget) && budget > 0 ? Math.min(budget, OFFLINE_CAP_MS) : 0;
  const catchup = !!hidden || safeRaw > NORMAL_TICK_MS;
  if (!catchup) return { dt: safeRaw, budget: OFFLINE_CAP_MS };
  const dt = Math.min(safeRaw, safeBudget);
  let nextBudget = Math.max(0, safeBudget - dt);
  if (!hidden) nextBudget = OFFLINE_CAP_MS;
  return { dt, budget: nextBudget };
}

// --- Prestige: reset your empire to recruit a capped profit bonus ---
// First investor at $1T lifetime (was $1M, which a rush reached in ~3 minutes).
// Earnings in one run for the first investor. $100B since 0.0.22: the late
// eras got slower, and at $1T the first prestige moved to ~9 h nonstop with
// far fewer investors per run; $100B keeps it near Quantum (~6 h) and the
// first fork near 4 days.
export const PRESTIGE_UNIT = 1e11;
// Income multipliers stay bounded:
//   milestoneSpeed — ×8 cycle speed by 100 owned, then flat
//   milestoneMult — ×12 profit by 200 owned, then flat
//   prestigeMult  — +5% for 100, +1% for 400, then +0.07% with no hard stop
// The product of every empire bonus then passes through the soft ceiling in
// empire.js, so a huge investor count still cannot make income infinite.
// Owned count is a quantity, not a bonus. A single purchase stops at the next
// milestone, speed gate, or mastery gate, and never adds more than MAX_BUY.
//
// Singularity is implemented in empire.js. Each point is +20% up to ×4.
// The investor bill for the next fork grows with points already taken, and the
// whole empire product approaches a ceiling that rises with those points.
export function investorsFor(runLifetime) {
  if (!Number.isFinite(runLifetime) || runLifetime <= 0) return 0;
  const n = Math.floor(Math.sqrt(runLifetime / PRESTIGE_UNIT));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function prestigeMult(investors) {
  const n = Math.max(0, Math.floor(investors));
  if (!Number.isFinite(n)) return 1;
  const a = Math.min(n, 100); // +5% each
  const b = Math.min(Math.max(n - 100, 0), 400); // +1% each, through 500
  const c = Math.max(n - 500, 0); // +0.07% each after that, no hard stop
  const mult = 1 + a * 0.05 + b * 0.01 + c * 0.0007;
  return Number.isFinite(mult) ? mult : 1;
}

function rateOf(cfg, owned) {
  if (!owned || owned <= 0) return 0;
  return (cfg.revenue / (cfg.cycleMs / 1000) * milestoneSpeed(owned)) * owned * milestoneMult(owned);
}

// The single best thing to do with the empire as it stands. Hire beats a new
// era, which beats clicking an idle machine, which beats another copy of
// something you already run.
// A row that is short of a material, and the row that makes it, or null.
export function shortMaterial(state) {
  const biz = Array.isArray(state?.biz) ? state.biz : [];
  const supply = state?.supply || {};
  if (state?.challenge?.id === "glass") return null;
  for (let i = 0; i < BUSINESSES.length; i++) {
    const cfg = BUSINESSES[i];
    if (!cfg.uses || !(biz[i]?.owned > 0)) continue;
    for (const [key, need] of Object.entries(cfg.uses)) {
      // Every copy needs its own share each cycle.
      if ((supply[key] || 0) >= need * biz[i].owned) continue;
      const p = BUSINESSES.findIndex((c) => c.makes && c.makes[key]);
      if (p >= 0) return { user: i, maker: p, key };
    }
  }
  return null;
}

// The first era that isn't open yet, if the one before it is owned (so the
// player is working toward it), or -1.
export function frontierEra(state) {
  const biz = state?.biz || [];
  for (let i = 1; i < BUSINESSES.length; i++) {
    if (blockedByGlass(state, i)) continue;
    if (eraOpen(state, i)) continue;
    return (biz[i - 1]?.owned || 0) > 0 ? i : -1;
  }
  return -1;
}

export function nextMove(state) {
  const biz = Array.isArray(state?.biz) ? state.biz : [];
  const cash = Number.isFinite(state?.cash) ? state.cash : 0;

  const noBoss = state?.challenge?.id === "noboss";
  const glass = state?.challenge?.id === "glass";
  const now = Date.now();
  const commissioning = (st) => (st?.commissionUntil || 0) > now;

  // A dry row pays nothing: point at the cheapest way to feed it.
  const short = shortMaterial(state);
  if (short) {
    const maker = BUSINESSES[short.maker];
    const mst = biz[short.maker] || {};
    const user = BUSINESSES[short.user].name;
    const tripled = !!state?.upgrades?.[maker.id]?.rev;
    if (!tripled && Number.isFinite(maker.revCost) && cash >= maker.revCost) {
      return `${user} is short of ${short.key}. Buy the ${maker.name}'s x3 upgrade on the BOOST tab to make 3 times as much.`;
    }
    if (!noBoss && !mst.manager && (mst.owned || 0) >= managerNeed(short.maker) && cash >= maker.managerCost) {
      return `${user} is short of ${short.key}. Hire the ${maker.managerName} so the ${maker.name} keeps making it.`;
    }
    const cost = costOf(maker, mst.owned || 0, 1);
    if (Number.isFinite(cost) && cash >= cost) return `${user} is short of ${short.key}. Buy another ${maker.name} for ${money(cost)}.`;
  }

  // Prestige guide: once a prestige would at least double your investors.
  if (!state?.challenge) {
    const claimNow = investorsFor(state?.lifetime);
    const have = Math.floor(state?.investors || 0);
    if (claimNow >= 1 && claimNow >= Math.max(1, have)) {
      return `Good time to prestige: ${claimNow} new investors would ${have > 0 ? "at least double yours" : "join your board"}.`;
    }
  }

  if (!noBoss) {
    for (let i = BUSINESSES.length - 1; i >= 0; i--) {
      const st = biz[i];
      const cfg = BUSINESSES[i];
      if (!st || st.owned < managerNeed(i) || st.manager || commissioning(st)) continue;
      if (blockedByGlass(state, i)) continue;
      const cost = state?.shop?.freeManager ? 0 : cfg.managerCost;
      if (cash >= cost) {
        return `Hire the ${cfg.managerName} for ${money(cost)} - that era then earns on its own.`;
      }
    }
  }

  for (let i = 1; i < BUSINESSES.length; i++) {
    if (blockedByGlass(state, i)) continue;
    const st = biz[i];
    if ((st && st.owned > 0) || !eraOpen(state, i)) continue;
    const cost = costOf(BUSINESSES[i], 0, 1);
    if (Number.isFinite(cost) && cash >= cost) {
      return `Buy your first ${BUSINESSES[i].name} for ${money(cost)}.`;
    }
    break;
  }

  // The next era is still locked: work toward owning ERA_GATE of the last one.
  const front = frontierEra(state);
  if (front > 0 && !glass) {
    const prevCfg = BUSINESSES[front - 1];
    const have = biz[front - 1]?.owned || 0;
    const cost = costOf(prevCfg, have, 1);
    if (have < ERA_GATE && Number.isFinite(cost) && cash >= cost) {
      return `Buy another ${prevCfg.name} for ${money(cost)}. Own ${ERA_GATE} ${pluralName(prevCfg.name)} to open the next era (${have}/${ERA_GATE}).`;
    }
    if (eraCanOpen(state, front)) {
      const m = ERA_MATERIAL[BUSINESSES[front].id];
      return `Tap OPEN ERA on the locked row${m ? ` to use ${m.amount.toLocaleString("en-US")} ${m.key} and open the next era` : ""}.`;
    }
    const earn = eraEarnNeed(state, front);
    if (have >= ERA_GATE && (state?.lifetime || 0) < earn) {
      return `The next era opens once you've earned ${money(earn)} this run (${money(state?.lifetime || 0)} so far). Keep growing what you have.`;
    }
  }

  for (let i = 0; i < BUSINESSES.length; i++) {
    const st = biz[i];
    if (st && st.owned > 0 && !isManaged(st) && !st.running && !commissioning(st)) {
      return `Run ${BUSINESSES[i].name} to fire the next batch.`;
    }
  }

  let best = null;
  for (let i = 0; i < BUSINESSES.length; i++) {
    const st = biz[i];
    const owned = st ? st.owned : 0;
    if (!eraOpen(state, i)) continue;
    const cfg = BUSINESSES[i];
    const cost = costOf(cfg, owned, 1);
    const delta = rateOf(cfg, owned + 1) - rateOf(cfg, owned);
    if (!Number.isFinite(cost) || !(delta > 0) || cash < cost) continue;
    const payback = cost / delta;
    if (!best || payback < best.payback) best = { name: cfg.name, cost, payback };
  }
  if (best) return `Buy another ${best.name} for ${money(best.cost)}.`;

  const claim = investorsFor(state?.lifetime);
  if (claim >= 1) {
    const noun = claim === 1 ? "investor" : "investors";
    return `Prestige to recruit ${claim} ${noun}.`;
  }

  let goal = null;
  for (let i = 0; i < BUSINESSES.length && !noBoss; i++) {
    const st = biz[i];
    const cfg = BUSINESSES[i];
    if (st && st.owned >= managerNeed(i) && !st.manager) {
      const short = cfg.managerCost - cash;
      if (short > 0 && (!goal || short < goal.short)) {
        goal = { short, text: `Save ${money(short)} more to hire the ${cfg.managerName}.` };
      }
    }
  }
  for (let i = 1; i < BUSINESSES.length; i++) {
    if (blockedByGlass(state, i)) continue;
    const st = biz[i];
    if ((st && st.owned > 0) || !eraOpen(state, i)) continue;
    const cost = costOf(BUSINESSES[i], 0, 1);
    const short = cost - cash;
    if (Number.isFinite(short) && short > 0 && (!goal || short < goal.short)) {
      goal = { short, text: `Save ${money(short)} more to open ${BUSINESSES[i].name}.` };
    }
    break;
  }
  return goal ? goal.text : "Keep your businesses running. The next era is on its way.";
}
