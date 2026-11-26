// The exact value behind a short number (T4 item 33): every number on screen
// uses the one short format (1.20B), and a long-press shows this instead.
export function fullNumber(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return "—";
  if (!Number.isFinite(v)) return "∞";
  const digits = Math.abs(v) < 1000 && !Number.isInteger(v) ? 2 : 0;
  return v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: true });
}

export function fullMoney(n) {
  const v = Number(n);
  return v < 0 ? `-$${fullNumber(-v)}` : `$${fullNumber(v)}`;
}
