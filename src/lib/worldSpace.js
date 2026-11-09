// DRAFT - not imported anywhere yet. Second world for after the first fork.
//
// The Space Age is a separate ladder with its own cash, like AdVenture
// Capitalist's Moon. The numbers copy the Vacuum Tubes -> Quantum ladder one to
// one, because that ladder is already tuned and simulated; the theme and names
// are new. Tune them separately once the world is playable.
//
// To wire it in (suggested):
//   1. state.worlds = { earth: { cash, lifetime, biz }, space: { cash, lifetime, biz } }
//      plus an activeWorld key. Investors, singularity, tokens and badges stay shared.
//   2. Unlock at the first fork (SPACE_UNLOCK) so forking has a visible payoff.
//   3. Space earnings could also pay "Moon Rocks" that buy permanent Earth boosts,
//      so both worlds stay worth running.
//   4. Managers keep both worlds earning while offline; the 24h cap applies per world.
//   5. Icons: add /icons/space/<id>.png in the same pixel style.
// Raw materials (sand..wafers) are Earth-only, so these eras have no `uses`.

export const SPACE_UNLOCK = { singularities: 1 };

export const SPACE_BUSINESSES = [
  {
    id: "rockets",
    name: "Sounding Rockets",
    era: "c. 1957",
    tagline: "Light the fuse, count to ten, and sell the altitude data.",
    icon: "/icons/space/rockets.png",
    baseCost: 4,
    revenue: 3,
    cycleMs: 1800,
    coef: 1.071,
    managerName: "Launch Pad Chief",
    managerCost: 1000,
  },
  {
    id: "satellites",
    name: "Satellites",
    era: "c. 1962",
    tagline: "A beeping metal ball in orbit. Every pass rents out bandwidth.",
    icon: "/icons/space/satellites.png",
    baseCost: 2160,
    revenue: 60,
    cycleMs: 3000,
    coef: 1.14,
    managerName: "Orbit Planner",
    managerCost: 540000,
  },
  {
    id: "landers",
    name: "Moon Landers",
    era: "c. 1969",
    tagline: "One small step, one large invoice.",
    icon: "/icons/space/landers.png",
    baseCost: 25920,
    revenue: 945,
    cycleMs: 6000,
    coef: 1.14,
    managerName: "Flight Director",
    managerCost: 3600000,
  },
  {
    id: "shuttles",
    name: "Space Shuttles",
    era: "c. 1981",
    tagline: "Fly it up, glide it home, bill the next payload.",
    icon: "/icons/space/shuttles.png",
    baseCost: 311040,
    revenue: 13230,
    cycleMs: 12000,
    coef: 1.14,
    managerName: "Mission Commander",
    managerCost: 18000000,
  },
  {
    id: "stations",
    name: "Space Stations",
    era: "c. 1998",
    tagline: "A lab the size of a football field, leased by the hour.",
    icon: "/icons/space/stations.png",
    baseCost: 3732480,
    revenue: 277830,
    cycleMs: 24000,
    coef: 1.12,
    managerName: "Station Quartermaster",
    managerCost: 43200000,
  },
  {
    id: "boosters",
    name: "Reusable Boosters",
    era: "c. 2015",
    tagline: "The rocket lands itself. The profit margin takes off.",
    icon: "/icons/space/boosters.png",
    baseCost: 44789760,
    revenue: 5834430,
    cycleMs: 48000,
    coef: 1.11,
    managerName: "Recovery Captain",
    managerCost: 432000000,
  },
  {
    id: "orbitaldc",
    name: "Orbital Data Centers",
    era: "c. 2030",
    tagline: "Free cooling, endless sun, zero neighbours complaining about fans.",
    icon: "/icons/space/orbitaldc.png",
    baseCost: 537477120,
    revenue: 122523030,
    cycleMs: 96000,
    coef: 1.1,
    managerName: "Uplink Engineer",
    managerCost: 3996000000,
  },
  {
    id: "asteroids",
    name: "Asteroid Miners",
    era: "c. 2045",
    tagline: "One rock holds more platinum than every mine on Earth.",
    icon: "/icons/space/asteroids.png",
    baseCost: 6449725440,
    revenue: 2572983630,
    cycleMs: 192000,
    coef: 1.09,
    managerName: "Prospector General",
    managerCost: 19999999980,
  },
  {
    id: "dyson",
    name: "Dyson Swarm",
    era: "c. 2090",
    tagline: "Wrap the sun in solar panels. Send the bill to the galaxy.",
    icon: "/icons/space/dyson.png",
    baseCost: 77396705280,
    revenue: 54032656230,
    cycleMs: 384000,
    coef: 1.08,
    managerName: "Stellar Architect",
    managerCost: 360000000000,
  },
];
