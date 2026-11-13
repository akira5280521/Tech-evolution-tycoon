// Plain-words meanings for the game's terms. Shown by the "?" buttons next to
// them and listed under "Words to know" in More > How to Play. Written for
// someone who has never played an idle game.

export const GLOSSARY = {
  materials: {
    term: "MATERIALS",
    text: "Some machines use what an earlier one makes: the Paper Mill turns wood into card stock, glass works need sand, and so on. The strip at the top shows what you have. If a material runs out, the machine that needs it pays much less until more is made.",
  },
  manager: {
    term: "MANAGER",
    text: "Keeps one machine running by itself, even while the app is closed (for up to 24 hours). The Hire button unlocks once you own enough of that machine.",
  },
  foreman: {
    term: "FOREMAN",
    text: "A one-time hire. He adds a RUN ALL button that starts every machine that doesn't have a manager yet.",
  },
  buymodes: {
    term: "BUY BUTTONS",
    text: "Choose how many you buy per tap. X1, X10 and X100 buy that many. NEXT buys just enough to reach the next goal, like a speed-up or an upgrade unlock. MAX buys as many as you can afford.",
  },
  speedups: {
    term: "SPEED-UPS",
    text: "Owning 25, 50 and 100 of one machine makes it run twice as fast each time. Bigger counts after that make it pay more.",
  },
  upgrades: {
    term: "UPGRADES",
    text: "Each machine has two: one makes it pay 3 times as much, one makes it twice as fast. They cost cash and take 12 seconds to install. A prestige removes them, so you buy them again each run.",
  },
  mastery: {
    term: "ERA MASTERY",
    text: "Own enough of one machine and buy both of its upgrades: +5% to all income for the rest of that run. Mastered eras also make extra research data.",
  },
  prestige: {
    term: "PRESTIGE",
    text: "Trade in your whole run for investors. You lose your cash, machines, managers and upgrades, but every investor makes all income higher, forever, so the next run is much faster. The first investor comes once you've earned $1T in one run; 4 come at $16T, 10 at $100T.",
  },
  investors: {
    term: "INVESTORS",
    text: "You get them when you prestige, and they stay through every reset. The first 100 add +5% income each, the next 400 add +1% each, and after that each adds a little more.",
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
    text: "All your bonuses multiply together, but the closer they get to the limit, the less each new bonus adds, so income can't run away forever. The limit starts at x50 and rises by 6 with each fork.",
  },
  research: {
    term: "RESEARCH DATA",
    text: "Every era you own makes a little data each second, and mastered eras make more. Data is never lost, even when you prestige. Spend it in MORE > RESEARCH.",
  },
  specialty: {
    term: "COMPANY SPECIALTY",
    text: "A bonus you buy with research data and keep forever. You get one slot at first, so pick one; each fork of the timeline opens another.",
  },
  tokens: {
    term: "ERA TOKENS",
    text: "Earned from new eras, milestones, finished projects, won challenges and the free Daily Crate. Spend them in the shop on the BOARD tab. They're never lost.",
  },
  challenge: {
    term: "CHALLENGE RUN",
    text: "An optional run with special rules, like no managers. Starting one resets your cash and machines like prestige does, but you keep investors. Reach the goal to win +10% income forever.",
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
  "tokens",
  "research",
  "specialty",
  "challenge",
  "projects",
  "fork",
  "singularity",
  "ceiling",
];
