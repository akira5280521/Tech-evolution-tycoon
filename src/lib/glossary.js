// Plain-words meanings for the game's terms. Shown by the "?" buttons next to
// them and listed under "Words to know" in More > How to Play. Written for
// someone who has never played an idle game.

import { HUB_LABEL } from "./hub.js";

export const GLOSSARY = {
  bench: {
    term: "PC BUILD BENCH",
    text: "A plant on RIGS from Home Computers: the lab builds one PC from real parts. The CPU must match the board's socket and chipset, memory its slots, cards its slots (ISA, PCI, AGP, PCI Express), and the supply its plugs. The PC makes R&D points; a four-core CPU lets two Tech projects run at once.",
  },
  bottleneck: {
    term: "BOTTLENECK",
    text: "The slowest part holds the rest back. On the bench, a graphics card faster than the CPU can feed sits partly idle, and a slow card holds a fast CPU back. Memory, drives, power supplies and networks work the same way: the report names the part to upgrade.",
  },
  network: {
    term: "NETWORK",
    text: "Racks of research servers, and the training cluster's cards, share their work over a network: a hub or switch, later InfiniBand or NVLink. Without one, or with one too slow for the work, the plant shows Network-limited.",
  },
  materials: {
    term: "MATERIALS",
    text: "Some businesses use what an earlier one makes: the Paper Mill turns wood into card stock, glass works need sand, and so on. Each one makes 1 per cycle until you buy its x3 upgrade, which makes it 3. The strip at the top shows what you have. If a material runs out, the business that needs it stops paying until more is made. Each material's bins hold so much (840 / 1,000 means 840 stored of 1,000); when FULL, new output is lost. Tap a material to buy bigger bins with cash. They stay through prestige and forks.",
  },
  manager: {
    term: "MANAGER",
    text: "Keeps one business running by itself, even while you're away (at half speed, for up to 24 hours). Hiring costs cash on hand: the big CASH number, not what you earned this run. The button shows how many you need first: 5 for some businesses, 10 for others.",
  },
  foreman: {
    term: "FOREMAN",
    text: "A one-time hire. He adds a RUN ALL button that starts every business that doesn't have a manager yet.",
  },
  buymodes: {
    term: "BUY AMOUNT",
    text: "Tap the buy-amount button to change how many businesses one BUY tap gets. It cycles X1, X10, X25, X50, X75, X100, then MAX, which buys as many as your cash allows.",
  },
  speedups: {
    term: "SPEED-UPS",
    text: "Milestones come at 25, 50, 75, 100, 150 and 200 of one business. At 25, 50 and 100 it runs twice as fast; at 75 and 150 it pays twice as much, and at 200 three times as much.",
  },
  upgrades: {
    term: "UPGRADES",
    text: "Each business has two: one makes it pay 3 times as much (on a material row it also makes 3 times the material), one makes it twice as fast. They cost cash and take 12 seconds to install. A prestige removes them, so you buy them again each run.",
  },
  mastery: {
    term: "ERA MASTERY",
    text: "Own enough of one business and buy both of its upgrades: +5% to all income for the rest of that run. Mastered eras also make extra R&D points.",
  },
  prestige: {
    term: "PRESTIGE",
    text: "Trade in your whole run for investors. You lose your cash, businesses, managers and upgrades, but every investor makes all income higher, forever, so the next run is much faster. The first investor comes once you've earned $100B in one run; 4 come at $1.6T, 10 at $10T.",
  },
  investors: {
    term: "INVESTORS",
    text: "You get them when you prestige, and they stay through every reset. The first 100 add +5% income each, the next 400 add +1% each, and after that each adds a little more.",
  },
  investorMilestones: {
    term: "INVESTOR MILESTONES",
    text: "Unlocks you keep forever, earned by the most investors you've ever had: a head start of Timber Camps, managers that stay through prestige, longer time away, upgrades that buy themselves, and more. Forking the timeline doesn't take them away.",
  },
  fork: {
    term: "FORK THE TIMELINE",
    text: "A bigger reset, on the BOARD tab. It spends investors and starts your run over. In return you get a singularity point (x1.2 income, then x1.4 and so on, up to x4) that is never lost, a higher income limit, and another research slot. Each fork needs more investors.",
  },
  singularity: {
    term: "SINGULARITY",
    text: "The multiplier from forking the timeline: +0.2x for each fork, up to x4. It never resets.",
  },
  ceiling: {
    term: "INCOME LIMIT",
    text: "All your bonuses multiply together, but the closer they get to the limit, the less each new bonus adds, so income can't run away forever. The limit starts at x42 and rises by 5 with each fork.",
  },
  research: {
    term: "R&D POINTS",
    text: `The one research currency. Each era you own makes a trickle, and research servers (${HUB_LABEL} beside TECH, then RIGS, from Mainframes) make most of them. Earned at half rate while the game is closed, and the servers only bank what their disks hold then (1 hour of output, plus 1 per TB). Never lost, even when you prestige. Spend them on the R&D tab and the TECH timeline.`
  },
  lab: {
    term: "LAB PROJECTS",
    text: "Ways to spend spare R&D points whenever you like: Overclock (all income x1.5 for 10 minutes, then a 20-minute cool-down), Patent Filing (R&D points for an era token, 5 a day) and the Install Crew (upgrades install instantly, kept forever). Prices are fixed, and nothing is left to chance.",
  },
  specialty: {
    term: "COMPANY SPECIALTY",
    text: "A bonus you buy with R&D points and keep forever. You get one slot at first, so pick one; each fork of the timeline opens another.",
  },
  tokens: {
    term: "ERA TOKENS",
    text: "Earned from new eras, milestones, finished projects, won challenges and the free Daily Crate. Spend them in the shop on the BOARD tab. They're never lost.",
  },
  challenge: {
    term: "CHALLENGE RUN",
    text: "An optional run with special rules, like no managers. Starting one resets your cash and businesses like prestige does, but you keep investors. Reach the goal to win +10% income forever.",
  },
  projects: {
    term: "MEGA-PROJECTS",
    text: "Big goals that complete on their own once you reach them. Each gives a bonus you keep forever, plus tokens.",
  },
};

// Order for "Words to know" in How to Play.
export const GLOSSARY_ORDER = [
  "materials",
  "manager",
  "foreman",
  "buymodes",
  "speedups",
  "upgrades",
  "mastery",
  "prestige",
  "investors",
  "investorMilestones",
  "tokens",
  "research",
  "specialty",
  "lab",
  "challenge",
  "projects",
  "fork",
  "singularity",
  "ceiling",
];
