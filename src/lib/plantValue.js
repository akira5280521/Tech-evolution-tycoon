// What buying one part would add right now: cash a second for the mine and
// cluster, R&D a second (and away-bank hours) for the research servers. A part
// is judged with the cheapest power, cooling, memory and disk it needs to run,
// the same way the best-next-part suggestion judges it.

import { PARTS, SHARE_CAP, facilityReport, facilityUnlocked, fitPart, partMax, supportPlan } from "./facilities.js";
import { awayBankHours, serverOutput } from "./research.js";

export function partValue(state, facilityId, partId, businessPerSecond) {
  const part = PARTS.find((p) => p.id === partId);
  if (!part || part.soon || !part.fits.includes(facilityId) || !facilityUnlocked(state, facilityId)) return null;
  const owned = state?.facilities?.[facilityId]?.[partId] || 0;
  if (owned >= partMax(part, facilityId)) return { maxed: true };
  const fit = fitPart(state?.facilities?.[facilityId] || {}, facilityId, partId);
  if (fit.reason) return { added: 0, why: fit.reason };
  const plan = supportPlan(state, facilityId, partId);
  if (!plan) return { added: 0, why: "There are no more parts to power or cool it." };
  if (facilityId === "servers") {
    const added = serverOutput(plan.state).perSecond - serverOutput(state).perSecond;
    const awayHours = awayBankHours(plan.state) - awayBankHours(state);
    return {
      kind: "rd",
      added: Math.max(0, added),
      awayHours: Math.max(0, awayHours),
      cost: plan.cost,
      extras: plan.extras,
      why: added > 0 || awayHours > 0 ? null : notNeeded(part, facilityId),
    };
  }
  const before = facilityReport(state, businessPerSecond);
  const after = facilityReport(plan.state, businessPerSecond);
  const added = Math.max(0, after.perSecond - before.perSecond);
  const capped = before.share >= SHARE_CAP - 1e-12;
  return {
    kind: "cash",
    added,
    share: Math.max(0, after.share - before.share),
    cost: plan.cost,
    extras: plan.extras,
    notes: plan.notes || [],
    payback: added > 0 ? plan.cost / added : null,
    why: added > 0 ? null : capped ? `The plants are at the ${Math.round(SHARE_CAP * 100)}% cap.` : notNeeded(part, facilityId),
  };
}

// "2x Case fans and a 750 W supply" style list of the extras a part needs.
export function extrasText(extras) {
  const counts = new Map();
  for (const name of extras || []) counts.set(name, (counts.get(name) || 0) + 1);
  const parts = [...counts].map(([name, n]) => (n > 1 ? `${n}x ${name}` : name));
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

function notNeeded(part, facilityId) {
  if (part.kind === "power") return "Not needed now: there's power to spare.";
  if (part.kind === "cool") return "Not needed now: there's cooling to spare.";
  if (part.kind === "ram") return facilityId === "mine" ? "Not needed now: the mine has the memory it needs." : "Not needed now: there's enough memory for the model.";
  if (part.kind === "disk") return "Adds nothing now: the away bank is at its 8-hour limit.";
  return "Adds nothing right now.";
}
