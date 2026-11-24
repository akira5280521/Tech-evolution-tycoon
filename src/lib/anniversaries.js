// Anniversary weeks: in the week that starts on a real launch day, that
// era's row earns a little more. Dates are real; company names are parody.
import { BUSINESSES } from "./gameConfig.js";

export const ANNIVERSARY_MULT = 1.25;
export const ANNIVERSARY_DAYS = 7;

export const ANNIVERSARIES = [
  { era: "punchcards", date: "1889-01-08", text: "Herman Hollerith's punched-card tabulator was patented" },
  { era: "tubes", date: "1946-02-15", text: "ENIAC was dedicated in Philadelphia" },
  { era: "transistors", date: "1947-12-23", text: "the first transistor was shown at Ringwell Labs" },
  { era: "ics", date: "1958-09-12", text: "the first integrated circuit worked" },
  { era: "minis", date: "1965-03-22", text: "the Maynard Equipment 8 was introduced" },
  { era: "cpu", date: "1971-11-15", text: "the Chipwright 4004 was announced" },
  { era: "homepc", date: "1977-06-10", text: "the Orchard II began shipping" },
  { era: "dialup", date: "1991-08-06", text: "the World Wide Web was announced to the public" },
  { era: "gpu", date: "1999-10-11", text: "the Raster 256 went on sale" },
  { era: "cloud", date: "2006-03-14", text: "Canopy Bucket began renting storage by the gigabyte" },
  { era: "phones", date: "2007-06-29", text: "the Orchard Handset went on sale" },
  { era: "tablets", date: "2010-04-03", text: "the Orchard Slate went on sale" },
  { era: "ai", date: "2016-05-18", text: "the Tensor Foundry T1 was announced" },
  { era: "quantum", date: "2019-10-23", text: "a 53-qubit chip was reported to beat a supercomputer" },
  { era: "vr", date: "2020-10-13", text: "the Visor Q2 went on sale" },
  { era: "chatbots", date: "2022-11-30", text: "Parlance opened to the public" },
].map((a) => {
  const [year, month, day] = a.date.split("-").map(Number);
  return { ...a, year, month, day };
});

// Local midnight of a date, as a day number (days since 1970 in local time).
function dayNumber(y, m, d) {
  return Math.round(new Date(y, m - 1, d).getTime() / 864e5);
}

// Anniversaries whose week includes `now` (local time): the launch day and
// the six days after it. A week that starts late in December runs on into
// January.
// Rows ask on every payout, so the answer is kept for the day.
let cache = { today: null, list: [] };
export function anniversariesOn(now = Date.now()) {
  const t = new Date(now);
  const today = dayNumber(t.getFullYear(), t.getMonth() + 1, t.getDate());
  if (cache.today === today) return cache.list;
  const out = [];
  for (const a of ANNIVERSARIES) {
    for (const y of [t.getFullYear(), t.getFullYear() - 1]) {
      const start = dayNumber(y, a.month, a.day);
      if (today >= start && today < start + ANNIVERSARY_DAYS) {
        const ends = new Date(y, a.month - 1, a.day + ANNIVERSARY_DAYS - 1);
        out.push({ ...a, years: y - a.year, ends: ends.getTime(), name: BUSINESSES.find((b) => b.id === a.era)?.name || a.era });
      }
    }
  }
  cache = { today, list: out };
  return out;
}

// What a row earns in an anniversary week of its era (1 otherwise).
export function anniversaryMult(eraId, now = 0) {
  if (!(now > 0)) return 1;
  return anniversariesOn(now).some((a) => a.era === eraId) ? ANNIVERSARY_MULT : 1;
}

// The anniversary weeks for eras this company owns, for the banner.
export function ownedAnniversaries(state, now = Date.now()) {
  const owned = new Set(BUSINESSES.filter((b, i) => (state?.biz?.[i]?.owned || 0) > 0).map((b) => b.id));
  return anniversariesOn(now).filter((a) => owned.has(a.era));
}

// The next anniversary week coming up (for the help line), from today.
export function nextAnniversary(now = Date.now()) {
  const t = new Date(now);
  const today = dayNumber(t.getFullYear(), t.getMonth() + 1, t.getDate());
  let best = null;
  for (const a of ANNIVERSARIES) {
    for (const y of [t.getFullYear(), t.getFullYear() + 1]) {
      const start = dayNumber(y, a.month, a.day);
      if (start > today && (!best || start < best.start)) best = { ...a, start, years: y - a.year, name: BUSINESSES.find((b) => b.id === a.era)?.name || a.era };
    }
  }
  return best;
}
