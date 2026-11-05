// One bar per business: fills over the cycle and animates smoothly between ticks.
export default function ProgressTrack({ cfg, st }) {
  const pct = Math.min(100, (st.progress / cfg.cycleMs) * 100);
  const active = st.manager || st.running;
  return (
    <div className="relative h-5 w-full overflow-hidden border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]">
      {/* The 100ms width transition matches the game tick, so an active cycle
          sweeps smoothly instead of jumping; when the cycle ends (active flips
          false) the class drops and the bar snaps back to empty instantly. */}
      <div
        className={`h-full ${
          active
            ? "bg-[var(--game-accent)] transition-[width] duration-100 ease-linear"
            : "bg-[var(--game-border)]"
        }`}
        style={{ width: `${pct}%` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent_0px,transparent_4px,rgba(0,0,0,0.35)_4px,rgba(0,0,0,0.35)_8px)]" />
    </div>
  );
}