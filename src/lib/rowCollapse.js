// A row can shrink once it is fully upgraded and a manager is running it.
import { BUSINESSES, isManaged } from "./gameConfig.js";
import { upgradesOf } from "./empire.js";

export function rowFullyUpgraded(state, index) {
  const st = state?.biz?.[index];
  if (!st || !isManaged(st)) return false;
  const cfg = BUSINESSES[index];
  if (!cfg) return false;
  const up = upgradesOf(state, cfg.id);
  return !!(up.rev && up.spd);
}

export function shouldCollapseRow(state, index, prefs, expanded) {
  if (prefs?.collapseMaxed === false) return false;
  if (expanded) return false;
  return rowFullyUpgraded(state, index);
}
