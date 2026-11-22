// The hardware hub: the button beside TECH at the top of the game screen.
// It opens a menu of sub-buttons; RIGS (the plants) is the first. Later
// sections join HUB_ITEMS when they are built (no placeholders).
//
// Once the hub has opened it stays open for good (state.hubSeen), even after
// a prestige, fork or challenge, like research. The plants inside still need
// their business owned this run to work.
import { BUSINESSES } from "./gameConfig.js";
import { anyFacilityOpen, readNews } from "./facilities.js";

// The top button's name, in one place so it can be renamed.
export const HUB_LABEL = "HQ";
export const HUB_ROUTE = "/rigs";

export const HUB_ITEMS = [
  {
    id: "rigs",
    label: "RIGS",
    to: "/facilities",
    text: "Research servers that make R&D points, then the Bitbark mine and the AI training cluster that pay cash.",
    open: (state) => !!state?.hubSeen || anyFacilityOpen(state),
  },
];

// The hub opens once any of its sections does, and then stays open.
export function hubOpen(state) {
  return !!state?.hubSeen || HUB_ITEMS.some((item) => item.open(state));
}

const CPU_INDEX = BUSINESSES.findIndex((cfg) => cfg.id === "cpu");

// Signs that the hub was open before the flag existed: the plants are open
// now, any plant part is owned, the servers' or plant's opening headline is in
// the ticker's kept news, or the best era ever reached is Microprocessors or later.
export function hubEvidence(state) {
  if (!state) return false;
  if (anyFacilityOpen(state)) return true;
  const plants = state.facilities && typeof state.facilities === "object" ? state.facilities : {};
  for (const counts of Object.values(plants)) {
    if (counts && typeof counts === "object" && Object.values(counts).some((n) => Number(n) > 0)) return true;
  }
  if (readNews(state.news).some((entry) => entry.id === "servers-open" || entry.id === "plant-open")) return true;
  const best = Number(state.bestEra);
  return CPU_INDEX >= 0 && Number.isFinite(best) && best >= CPU_INDEX;
}

// Set the flag the first time the hub opens. True when it changed.
export function noteHubSeen(state) {
  if (!state || state.hubSeen || !hubEvidence(state)) return false;
  state.hubSeen = true;
  return true;
}
