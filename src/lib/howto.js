// How to Play guides for research and each facility. Locked entries stay
// hidden as Coming soon until that plant has unlocked this career.
import { facilityEverUnlocked } from "./facilities.js";
import { HUB_LABEL } from "./hub.js";

export const HOWTO_GUIDES = [
  {
    id: "howto-starter",
    title: "RESEARCH MACHINES AND TECH",
    always: true,
    lines: [
      `Open ${HUB_LABEL} (beside TECH) and tap RESEARCH SERVERS. Buy the Inland 601 Multiplying Punch: it is cheap, and it starts making R&D points at once.`,
      "TECH (beside HQ) lists real inventions. Spend R&D points to research one at a time; the timer keeps going while the app is closed. \"Requires 1985\" means your company hasn't reached that year yet. Finished research is kept when you prestige.",
    ],
  },
  {
    id: "howto-servers",
    title: "RESEARCH SERVERS",
    facilityId: "servers",
    unlocks: "Mainframes",
    lines: [
      "Mainframes open the rest of the machine room. Research a computer on TECH, then buy it here with its own motor-generator and air conditioner.",
      "Tape drives and disks also need their TECH project before you can buy them. Machines make far more R&D points than the punch-card starter.",
    ],
  },
  {
    id: "howto-bench",
    title: "PC BUILD BENCH",
    facilityId: "bench",
    unlocks: "Home Computers",
    lines: [
      "The bench builds one PC at a time from parts that fit: a board, a CPU for that board's socket, and memory for its slots.",
      "The bench tells you if a part doesn't fit. The finished PC makes R&D points, and a four-core CPU lets two TECH projects run at once.",
    ],
  },
  {
    id: "howto-mine",
    title: "BITBARK MINE",
    facilityId: "mine",
    unlocks: "AI Accelerators",
    lines: [
      "Graphics cards in the mine mint Bitbark, a game coin that cannot be traded or taken out of the game. It adds a little extra income.",
      "Buy a card, then enough power and cooling. The plant runs slower if either can't keep up, and it tells you what to add next. Parts are lost when you prestige.",
    ],
  },
  {
    id: "howto-cluster",
    title: "TRAINING CLUSTER",
    facilityId: "cluster",
    unlocks: "AI Accelerators",
    lines: [
      "The cluster trains a model and bills the studio. A bigger model needs more memory.",
      "Buy graphics cards, memory, power and cooling. The cluster tells you if it needs more RAM or VRAM for the next model size. Parts are lost when you prestige.",
    ],
  },
  {
    id: "howto-museum",
    title: "HARDWARE MUSEUM",
    always: true,
    lines: [
      `The Hardware Museum is in ${HUB_LABEL}. It shows every piece of hardware in the game, room by room and decade by decade.`,
      "Tap an exhibit to read about it. Dark ones are still to find. Finish a room for its badge.",
    ],
  },
];

export function guideLocked(state, guide) {
  if (!guide || guide.always || !guide.facilityId) return false;
  return !facilityEverUnlocked(state, guide.facilityId);
}
