// The hardware hub: the button beside TECH at the top of the game screen.
// It lists every facility. Locked plants stay visible as ? cards that say
// what era they need this run.
//
// Once the hub has opened it stays open for good (state.hubSeen), even after
// a prestige, fork or challenge, like research. The plants inside still need
// their business owned this run to work.
import { BUSINESSES } from "./gameConfig.js";
import { FACILITIES, FACILITY_UNLOCK, PARTS, STARTER_PART_ID, anyFacilityOpen, facilityNeed, facilityUnlocked, partCost, readNews } from "./facilities.js";

// The top button's name, in one place so it can be renamed.
export const HUB_LABEL = "HQ";
export const HUB_ROUTE = "/rigs";

// The museum moved to PROGRESS and the saved PCs (RIGS) to the bench's SAVED
// BUILDS tab (T3 items 26, 27), so HQ lists only the plants.
export const MUSEUM_TITLE_ICON = "/icons/facilities/museum-32.png";

export const HUB_ITEMS = [
  ...FACILITIES.map((fac) => ({
    id: fac.id,
    label: fac.name,
    to: "/facilities/$facilityId",
    params: { facilityId: fac.id },
    icon: fac.icon,
    text: fac.blurb,
    // Research servers stay open from era 1 so the starter punch-card machine
    // can be bought before Mainframes. The rest wait for their era this run.
    open: (state) => (fac.id === "servers" ? !!state : facilityUnlocked(state, fac.id)),
    need: () => facilityNeed(fac.id),
  })),
];

// The starter research machine is owned, or the cash for the first one is
// there (a few dollars in the first minutes of a new game).
export function starterReady(state) {
  if (!state) return false;
  const part = PARTS.find((p) => p.id === STARTER_PART_ID);
  if (!part) return false;
  if ((state.facilities?.servers?.[part.id] || 0) > 0) return true;
  return (Number(state.cash) || 0) >= partCost(part, 0);
}

// HQ is reachable from the first era so the starter machine can be bought
// before Mainframes. It then stays open.
export function hubOpen(state) {
  if (!state) return false;
  return !!state.hubSeen || HUB_ITEMS.some((item) => item.open(state));
}

// The first business that opens any plant (Mainframes, for the research servers).
const FIRST_PLANT_INDEX = Math.min(...Object.values(FACILITY_UNLOCK).map((id) => BUSINESSES.findIndex((cfg) => cfg.id === id)).filter((i) => i >= 0));

// Signs that the hub was open before the flag existed: the plants are open
// now, any plant part is owned, the servers' or plant's opening headline is in
// the ticker's kept news, or the best era ever reached opens a plant.
export function hubEvidence(state) {
  if (!state) return false;
  if (anyFacilityOpen(state) || starterReady(state)) return true;
  const plants = state.facilities && typeof state.facilities === "object" ? state.facilities : {};
  for (const counts of Object.values(plants)) {
    if (counts && typeof counts === "object" && Object.values(counts).some((n) => Number(n) > 0)) return true;
  }
  if (readNews(state.news).some((entry) => entry.id === "servers-open" || entry.id === "plant-open")) return true;
  const best = Number(state.bestEra);
  return Number.isFinite(FIRST_PLANT_INDEX) && Number.isFinite(best) && best >= FIRST_PLANT_INDEX;
}

// Set the flag the first time the hub opens. True when it changed.
export function noteHubSeen(state) {
  if (!state || state.hubSeen || !hubEvidence(state)) return false;
  state.hubSeen = true;
  return true;
}

// NEXT MOVE line for a player with no research machine yet: R&D points only
// come from research machines since 0.0.29. Null when it doesn't apply.
export function starterHint(state) {
  if (!state) return null;
  const servers = state.facilities?.servers || {};
  if (Object.values(servers).some((n) => Number(n) > 0)) return null;
  if (!starterReady(state)) return null;
  const part = PARTS.find((p) => p.id === STARTER_PART_ID);
  return `Buy the ${part.name} in ${HUB_LABEL} > RESEARCH SERVERS. Research machines make the R&D points research needs.`;
}
