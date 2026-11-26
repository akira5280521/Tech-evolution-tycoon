// The player's company name. Asked once at the start (or once on an older
// save), changeable in Settings, kept through prestige. It shows in research
// headlines, on HQ and on the STATS screen; it's never put in the copied
// stats, which go to the developer.

export const COMPANY_MAX = 24;
export const DEFAULT_COMPANY = "Your Company";

// Letters (any language), digits, spaces and a little punctuation; at most
// COMPANY_MAX characters. Empty means no name.
export function cleanCompanyName(raw) {
  if (typeof raw !== "string") return null;
  const s = raw
    .normalize("NFC")
    .replace(/[^\p{L}\p{N} .,'&!?+-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, COMPANY_MAX)
    .trim();
  return s || null;
}

export function companyName(state) {
  return cleanCompanyName(state?.companyName) || DEFAULT_COMPANY;
}

// For news headlines, which are in capitals.
export function companyCaps(state) {
  return companyName(state).toUpperCase();
}

// Made-up names in the spirit of the era names; none is a real company.
const FIRST = ["Garage", "Copper", "Vector", "Pixel", "Relay", "Kilobyte", "Punchcard", "Tube", "Orbit", "Circuit", "Analog", "Parallax", "Ferrite", "Gigawatt", "Lattice", "Cathode"];
const SECOND = ["Logic", "Works", "Labs", "Machines", "Computing", "Electronics", "Dynamics", "Data", "Engines", "Foundry"];
const END = ["Co.", "Inc.", "Ltd.", ""];

export function randomCompanyName(rand = Math.random) {
  const pick = (list) => list[Math.floor(rand() * list.length) % list.length];
  return cleanCompanyName(`${pick(FIRST)} ${pick(SECOND)} ${pick(END)}`);
}

// A brand-new game gets the name screen before the tutorial; a save with
// progress gets a one-time card instead.
export function companyPrompt(state) {
  if (!state || state.companyAsked) return null;
  const fresh = !(state.lifetime > 0) && !(state.careerEarnings > 0) && !(state.prestigeCount > 0);
  return fresh ? "screen" : "card";
}

export function setCompanyName(state, raw) {
  state.companyName = cleanCompanyName(raw);
  state.companyAsked = true;
  return state.companyName;
}
