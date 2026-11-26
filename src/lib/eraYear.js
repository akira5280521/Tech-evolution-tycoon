// The real year of each era, and the newest year a company has reached. Parts
// and research projects open in their real year: a 1999 server can't be
// bought, or researched, before the company reaches the 1990s.
import { BUSINESSES } from "./gameConfig.js";

export const ERA_YEAR = {
  timber: 1,
  paper: 105,
  loom: 1804,
  punchcards: 1890,
  sand: 1920,
  copper: 1920,
  glass: 1920,
  filament: 1920,
  radios: 1920,
  relay: 1941,
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
  supercomputers: 1982,
  workstations: 1985,
  laptops: 1988,
  dialup: 1991,
  multimedia: 1993,
  accel3d: 1996,
  gpu: 1999,
  cloud: 2006,
  phones: 2007,
  tablets: 2010,
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
