import { useEffect, useRef } from "react";

// A cycle shorter than this is a flicker, not a bar. Show a living full bar.
const FAST_CYCLE_MS = 500;
// After a manual payout the bar stays full long enough to see it finish.
const HOLD_MS = 120;

// The fill follows the cycle clock, not the 100ms game tick. A throttled
// phone can deliver ticks 150–250ms apart; a width transition aimed at the
// previous sample never reaches 100% before the payout snaps it empty.
export default function ProgressTrack({ cycleMs, progress, cycleStart, active, loop, holdUntil }) {
  const barRef = useRef(null);
  const rootRef = useRef(null);
  const lapRef = useRef(0);
  const holdFrameRef = useRef(0);
  const safe = cycleMs > 0 ? cycleMs : 1;
  const fast = !!(active && safe < FAST_CYCLE_MS);

  useEffect(() => {
    if (fast) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (cycleStart && loop) lapRef.current = Math.floor((Date.now() - cycleStart) / safe);
    let raf = 0;
    let lastPaint = 0;
    let lastPct = -1;
    const paint = (pct) => {
      const clamped = Math.max(0, Math.min(1, pct));
      const rounded = Math.round(clamped * 100);
      if (barRef.current) barRef.current.style.transform = `scaleX(${clamped})`;
      if (rootRef.current) {
        rootRef.current.dataset.pct = String(rounded);
        rootRef.current.dataset.full = clamped >= 0.999 ? "1" : "0";
      }
      lastPct = rounded;
    };
    const frame = (t) => {
      const now = Date.now();
      let pct = 0;
      if (active && cycleStart) {
        const elapsed = Math.max(0, now - cycleStart);
        if (loop) {
          const laps = Math.floor(elapsed / safe);
          const into = elapsed - laps * safe;
          if (laps > lapRef.current) {
            lapRef.current = laps;
            holdFrameRef.current = t + HOLD_MS;
          }
          pct = t < holdFrameRef.current ? 1 : into / safe;
        } else {
          pct = Math.min(1, elapsed / safe);
        }
      } else if (!cycleStart && active) {
        pct = Math.min(1, Math.max(0, progress) / safe);
      } else if (holdUntil && now < holdUntil) {
        pct = 1;
      }
      const stepped = reduce && pct > 0 && pct < 1 && t - lastPaint < 200 && Math.abs(Math.round(pct * 100) - lastPct) < 8;
      if (!stepped) {
        paint(pct);
        lastPaint = t;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, loop, safe, cycleStart, fast]);

  return (
    <div
      ref={rootRef}
      data-bar
      data-pct={fast ? 100 : 0}
      data-full={fast ? "1" : "0"}
      className="relative h-5 w-full overflow-hidden border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]"
    >
      {fast ? (
        <div className="cycle-shimmer h-full w-full" />
      ) : (
        <div
          ref={barRef}
          className="cycle-clock h-full w-full bg-[var(--game-accent)]"
          style={{ transform: "scaleX(0)" }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent_0px,transparent_4px,rgba(0,0,0,0.35)_4px,rgba(0,0,0,0.35)_8px)]" />
    </div>
  );
}
