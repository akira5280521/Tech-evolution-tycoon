// Collapsed-section blurbs on the R&D tab.
import { LAB_PROJECTS, SPECIALTIES, canCommit, labQuote, specialtySlots } from "./empire.js";

export function specialtySummary(state) {
  const picked = (state?.specialties || []).length;
  const slots = specialtySlots(state);
  const open = Math.max(0, slots - picked);
  const ready = SPECIALTIES.filter((spec) => canCommit(state, spec.id)).length;
  if (state?.researchJob?.startedAt) return "Researching";
  if (ready > 0) return `${ready} ready`;
  if (open > 0) return `${open} slot${open === 1 ? "" : "s"} open`;
  return picked ? "All picked" : "0 ready";
}

export function labSummary(state, now = Date.now()) {
  const ready = LAB_PROJECTS.filter((item) => labQuote(state, item.id, now).ok).length;
  if (ready > 0) return `${ready} ready`;
  const cool = state?.lab?.coolUntil || 0;
  if (now < cool) return "Cooling down";
  return "0 ready";
}
