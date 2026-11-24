import { BENCH_ROOM } from "./benchSlots.js";
import { SERVERS_ROOM } from "./serversRoom.js";
import { PARTS } from "../facilities.js";

export { BENCH_ROOM } from "./benchSlots.js";
export { SERVERS_ROOM } from "./serversRoom.js";
export {
  ROOM_MILESTONES,
  conditionMet,
  pickVariant,
  generatorOwned,
  partOwned,
  normalizeMonitorDisplay,
  resolveMonitorMode,
  screenKey,
  monitorFlickerKind,
  MONITOR_MODES,
} from "./roomConditions.js";

export const ROOMS = {
  bench: BENCH_ROOM,
  servers: SERVERS_ROOM,
  mine: { facilityId: "mine", ready: false, width: 360, height: 200, slots: [] },
  cluster: { facilityId: "cluster", ready: false, width: 360, height: 200, slots: [] },
};

export function roomFor(facilityId) {
  return ROOMS[facilityId] || null;
}

// Every unlockId in a room's slots (and the bench contained-part notes are
// not required to be present as sprites, but slot variants must map).
export function roomUnlockIds(room) {
  const ids = new Set();
  for (const slot of room?.slots || []) {
    for (const variant of slot.variants || []) {
      if (variant.unlockId) ids.add(variant.unlockId);
    }
  }
  return [...ids];
}

export function unknownUnlockIds(room) {
  const known = new Set(PARTS.map((p) => p.id));
  return roomUnlockIds(room).filter((id) => !known.has(id));
}
