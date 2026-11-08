// A cycle shorter than this is a flicker, not a bar. Show a living full bar.
const FAST_CYCLE_MS = 500;

// One bar per business. Managers loop a fill for the whole cycle. A manual
// run fills once from the tap and snaps empty when it pays. Extra taps are
// ignored by the game loop until that fill completes.
export default function ProgressTrack({ cycleMs, progress, active, loop }) {
  const safeCycle = cycleMs > 0 ? cycleMs : 1;
  const pct = Math.min(100, (Math.max(0, progress) / safeCycle) * 100);
  const fast = active && safeCycle < FAST_CYCLE_MS;

  let bar;
  if (fast) {
    bar = <div className="cycle-shimmer h-full w-full" />;
  } else if (loop && active) {
    bar = (
      <div
        className="cycle-fill h-full bg-[var(--game-accent)]"
        style={{ animationDuration: `${safeCycle}ms` }}
      />
    );
  } else {
    bar = (
      <div
        className={`h-full bg-[var(--game-accent)] ${active ? "transition-[width] duration-100 ease-linear" : ""}`}
        style={{ width: active ? `${pct}%` : "0%" }}
      />
    );
  }

  return (
    <div
      data-bar
      data-pct={Math.round(pct)}
      className="relative h-5 w-full overflow-hidden border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]"
    >
      {bar}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent_0px,transparent_4px,rgba(0,0,0,0.35)_4px,rgba(0,0,0,0.35)_8px)]" />
    </div>
  );
}
