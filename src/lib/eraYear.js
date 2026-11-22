// The real year of each era, and the newest year a company has reached. Parts
// and research projects open in their real year: a 1999 server can't be
// bought, or researched, before the company reaches the 1990s.
import { BUSINESSES } from "./gameConfig.js";

export const ERA_YEAR = {
  timber: 1,
  paper: 105,
  loom: 1804,
  punchcards: 1890,
  relay: 1941,
  sand: 1943,
  copper: 1943,
  glass: 1945,
  filament: 1945,
  tubes: 1946,
  mainframes: 1951,
  germanium: 1948,
  transistors: 1954,
  silicon: 1959,
  wafers: 1960,
  ics: 1965,
  minis: 1965,
  cpu: 1971,
  homepc: 1977,
  consoles: 1977,
  dialup: 1991,
  gpu: 1999,
  cloud: 2006,
  phones: 2007,
  rgb: 2015,
  ai: 2016,
  quantum: 2019,
  vr: 2020,
  chatbots: 2022,
  supercluster: 2024,
};

export function playerYear(state) {
  let year = 0;
  const biz = state?.biz || [];
  BUSINESSES.forEach((cfg, index) => {
    if ((biz[index]?.owned || 0) > 0) year = Math.max(year, ERA_YEAR[cfg.id] || 0);
  });
  return year;
}
