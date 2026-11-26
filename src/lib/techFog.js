// TECH fog of war: only this era and earlier ones are visible. A later-era
// project is a greyed ??? until the player has reached that era (kept after
// prestige via bestEra). There is no peek at the next era — in the 1950s they
// did not know what a Pentium would be.
import { BUSINESSES } from "./gameConfig.js";
import { ERA_YEAR } from "./eraYear.js";
import { eraReachedIndex } from "./records.js";

// The company year once every era up to `index` has been owned: the max of
// those eras' years (they are not strictly increasing on the ladder).
export function yearReachedAt(index) {
  let year = 0;
  const last = Math.min(Math.max(0, index), BUSINESSES.length - 1);
  if (index < 0) return 0;
  for (let i = 0; i <= last; i++) year = Math.max(year, ERA_YEAR[BUSINESSES[i].id] || 0);
  return year;
}

// Earliest ladder index at which the company year first covers `year`.
export function eraIndexForYear(year) {
  const need = Number(year) || 0;
  for (let i = 0; i < BUSINESSES.length; i++) {
    if (yearReachedAt(i) >= need) return i;
  }
  return BUSINESSES.length - 1;
}

export function techRevealed(state, entry) {
  if (!entry) return false;
  return eraIndexForYear(entry.year || 0) <= eraReachedIndex(state);
}
