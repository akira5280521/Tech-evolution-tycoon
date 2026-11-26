// Filter boxes on TECH and the Museum: match visible names and model numbers,
// never a locked or unknown part's hidden name.
export function normalizeQuery(q) {
  return String(q || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function searchHaystack(parts) {
  return parts
    .filter((part) => part != null && String(part).trim())
    .map((part) => String(part).toLowerCase())
    .join(" ");
}

// True when the revealed text (not a hidden name) contains the query.
// An empty query matches everything, including locked rows the caller still
// chooses to show.
export function matchesSearch(query, haystack) {
  const q = normalizeQuery(query);
  if (!q) return true;
  if (!haystack) return false;
  return haystack.includes(q);
}

// A locked/unknown exhibit or part must not be searchable by its real name.
export function revealedHaystack(revealed, ...parts) {
  return revealed ? searchHaystack(parts) : "";
}
