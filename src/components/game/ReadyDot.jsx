export function ReadyDot({ show, testId }) {
  if (!show) return null;
  return (
    <span
      data-ready-dot={testId || true}
      aria-hidden="true"
      className="ready-dot pointer-events-none absolute right-1 top-1 h-2 w-2 rounded-full bg-good"
    />
  );
}
