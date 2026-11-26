// How to Play guides for research and each facility. Locked entries stay
// hidden as Coming soon until that plant has unlocked this career.
import { facilityEverUnlocked } from "./facilities.js";
import { HUB_LABEL } from "./hub.js";

export const HOWTO_GUIDES = [
  {
    id: "howto-nav",
    title: "FINDING YOUR WAY",
    always: true,
    lines: [
      "The bottom bar has six buttons: GAME, HQ, R&D, BOOST, PROGRESS and MORE. The cash box on top shows cash, income, R&D points, your era and the month. Tap the lightbulb beside it for one line on what to do next on the screen you are on.",
      "HQ is your company building, floor by floor: tap a room to go there, and use the HQ link at the top of any menu to come back. R&D has QUEUE, TECH, SPECIALTY and LAB tabs. BOOST has NOW, UPGRADES (with the Foreman), BONUSES and PRESTIGE. PROGRESS has RUNS, BADGES, MUSEUM and STATS. MORE is just SETTINGS and HOW TO PLAY. A red dot on a button or tab means something there is ready; grey rooms say Coming soon.",
      "A business's first opening in a run (hiring, stocking, grand opening) and a new era (retooling) each show a bar with what is happening. Later eras take longer, up to a few minutes. Ordinary buys are instant. Numbers are short (1.20B). Press and hold cash, income or an amount to see the exact figure. In MORE > SETTINGS you can turn on a tick or a buzz for every tap, pick one of three text sizes, and switch on colorblind colors. Settings come in groups: GAME, SOUND, NOTIFICATIONS, DISPLAY, SAVE (export and import a save code) and ABOUT.",
      "Only PRESTIGE and selling materials ask you to tap twice; everything else happens on one tap. Time away pays for up to 24 hours at first: investor milestones and the AWAY SHIFTS projects in R&D > LAB (bought with R&D points) make it longer.",
    ],
  },
  {
    id: "howto-starter",
    title: "RESEARCH MACHINES AND TECH",
    always: true,
    lines: [
      `Open ${HUB_LABEL} (beside BUY AMOUNT) and tap RESEARCH SERVERS. Buy the Inland 601 Multiplying Punch: it is cheap, and it starts making R&D points at once.`,
      "R&D > TECH lists real inventions. Use the search box to filter by name or model. Spend R&D points to research one at a time; the timer keeps going while the app is closed. \"Requires 1985\" means your company hasn't reached that year yet. Finished research is kept when you prestige.",
    ],
  },
  {
    id: "howto-servers",
    title: "RESEARCH SERVERS",
    facilityId: "servers",
    unlocks: "Mainframes",
    lines: [
      "Mainframes open the rest of the machine room. Research a computer in R&D > TECH, then buy it here with its own motor-generator and air conditioner.",
      "Big things take a while and keep going while the app is closed. A new HQ room is built first, a few minutes at most. A new computer is delivered, installed and configured before it comes online: a couple of minutes for an early mainframe, up to an hour for the biggest supercomputers. Several can install at once, and nothing skips the wait. A repeat of something you did in an earlier run takes about half as long. The FIELD ENGINEERS perk in BOOST > UPGRADES (R&D points) halves install times.",
      "Tape drives and disks also need their TECH project before you can buy them. Machines make far more R&D points than the punch-card starter.",
      "ROOM STATUS, under the room, has a bar each for compute, storage, heat and power (and network once you have racks), with a white marker at the limit. Power and heat are the real machines' kilowatts: every watt a computer draws comes out as heat. A bar past its marker turns red, with a box saying what to add.",
      "Each machine card has spec bars from the real computer it is modeled on: SPEED, MEMORY, STORAGE, POWER and HEAT. They use a log scale so a 1951 machine and a 2021 one fit on the same bar. Its heat is its power draw and adds to the room's HEAT bar.",
    ],
  },
  {
    id: "howto-bench",
    title: "PC BUILD BENCH",
    facilityId: "bench",
    unlocks: "Home Computers",
    lines: [
      "The bench builds one PC at a time from parts that fit: a board, a CPU for that board's socket, and memory for its slots.",
      "The bench tells you if a part doesn't fit. The finished PC makes R&D points. TECH runs one project at a time.",
      "ROOM STATUS under the bench shows the PC's speed, memory, CPU heat against the cooler, and power against the supply. A red bar says what to add.",
    ],
  },
  {
    id: "howto-mine",
    title: "BITBARK MINE",
    facilityId: "mine",
    unlocks: "AI Accelerators",
    lines: [
      "Graphics cards in the mine mint Bitbark, a game coin that cannot be traded or taken out of the game. It adds a little extra income.",
      "Buy a card, then enough power and cooling. The plant runs slower if either can't keep up: ROOM STATUS under the room shows hash, power, heat and memory, and a red bar says what to add. Parts are lost when you prestige.",
    ],
  },
  {
    id: "howto-cluster",
    title: "TRAINING CLUSTER",
    facilityId: "cluster",
    unlocks: "AI Accelerators",
    lines: [
      "The cluster trains a model and bills the studio. A bigger model needs more memory.",
      "Buy graphics cards, memory, power and cooling. ROOM STATUS under the room shows compute, power, heat, memory and the card network; a red bar says what to add, including RAM for the next model size. Parts are lost when you prestige.",
    ],
  },
  {
    id: "howto-museum",
    title: "HARDWARE MUSEUM",
    always: true,
    lines: [
      "The Hardware Museum is in PROGRESS > MUSEUM. It shows every piece of hardware in the game, room by room and decade by decade.",
      "Tap an exhibit to read about it. Dark ones are still to find. Use the search box to filter by name or model; locked pieces stay hidden as ??? and will not match. Finish a room for its badge.",
    ],
  },
];

export function guideLocked(state, guide) {
  if (!guide || guide.always || !guide.facilityId) return false;
  return !facilityEverUnlocked(state, guide.facilityId);
}
