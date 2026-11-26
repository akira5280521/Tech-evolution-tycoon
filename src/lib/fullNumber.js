// The exact value behind a short number (T4 item 33): every number on screen
// uses the one short format (1.20B), and a long-press shows this instead.
// toLocaleString with options builds a new formatter on every call, which
// is slow when every row redraws; these are made once.
const WHOLE = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: true });
const CENTS = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });

export function fullNumber(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return "—";
  if (!Number.isFinite(v)) return "∞";
  return (Math.abs(v) < 1000 && !Number.isInteger(v) ? CENTS : WHOLE).format(v);
}

// Whole numbers with commas ("12,345"), from the shared formatter.
export function commas(n) {
  return WHOLE.format(Math.floor(Number(n) || 0));
}

export function fullMoney(n) {
  const v = Number(n);
  return v < 0 ? `-$${fullNumber(-v)}` : `$${fullNumber(v)}`;
}
