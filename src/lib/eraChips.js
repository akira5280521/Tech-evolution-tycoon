// Jump chips for the game list: one per unlocked era, plus a single greyed
// ??? chip for the next locked era (if any).
import { BUSINESSES, blockedByGlass, eraOpen } from "./gameConfig.js";

const CHIP = {
  timber: "Timber",
  paper: "Paper",
  loom: "Loom",
  punchcards: "Cards",
  sand: "Sand",
  copper: "Copper",
  glass: "Glass",
  filament: "Filament",
  radios: "Radios",
  relay: "Relay",
  tubes: "Tubes",
  mainframes: "Mainframes",
  germanium: "Germanium",
  transistors: "Transistors",
  silicon: "Silicon",
  wafers: "Wafers",
  ics: "ICs",
  minis: "Minis",
  cpu: "CPU",
  homepc: "Home PCs",
  consoles: "Consoles",
  supercomputers: "Supers",
  workstations: "Stations",
  laptops: "Laptops",
  dialup: "Dial-up",
  multimedia: "Multimedia",
  accel3d: "3D",
  gpu: "GPUs",
  cloud: "Cloud",
  phones: "Phones",
  tablets: "Tablets",
  rgb: "RGB",
  ai: "AI",
  quantum: "Quantum",
  vr: "VR",
  chatbots: "Chatbots",
  supercluster: "Clusters",
};

export function eraChipLabel(cfg) {
  if (!cfg) return "";
  return CHIP[cfg.id] || cfg.name;
}

// Unlocked eras the player can jump to, then at most one locked ??? chip.
export function eraChips(state) {
  const out = [];
  let nextLocked = null;
  BUSINESSES.forEach((cfg, i) => {
    if (blockedByGlass(state, i)) return;
    if (eraOpen(state, i)) {
      out.push({ id: cfg.id, index: i, label: eraChipLabel(cfg), locked: false });
    } else if (!nextLocked) {
      nextLocked = { id: cfg.id, index: i, label: "???", locked: true };
    }
  });
  if (nextLocked) out.push(nextLocked);
  return out;
}
