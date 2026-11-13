import { useMemo, useState } from "react";
import { currentEraIndex, headlinesFor } from "@/lib/empire";

// Scrolls slowly enough to read. Hold a finger (or the mouse) on it to pause.
// Headlines follow the era the player has reached, newest first.
export default function NewsTicker({ state }) {
  const [paused, setPaused] = useState(false);
  const era = currentEraIndex(state);
  const prestiged = !!(state?.prestiged || (state?.investors || 0) > 0);
  // Only rebuilt when a new era opens, so the scroll doesn't restart every tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lines = useMemo(() => headlinesFor(state), [era, prestiged]);
  const line = lines.join("   ·   ");
  const hold = () => setPaused(true);
  const release = () => setPaused(false);
  return (
    <div
      data-news
      aria-label="News ticker. Press and hold to pause."
      onPointerDown={hold}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onContextMenu={(event) => event.preventDefault()}
      className={`news-ticker relative h-8 select-none overflow-hidden border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] shadow-[4px_4px_0_0_#000] ${paused ? "is-paused" : ""}`}
    >
      <p className="truncate px-3 text-center font-pixel text-[0.55rem] uppercase leading-8 text-[var(--game-muted)] motion-safe:hidden">{lines[0]}</p>
      <div className="news-ticker-track hidden font-pixel text-[0.55rem] uppercase leading-8 text-[var(--game-muted)] motion-safe:flex">
        <span>{line}</span>
        <span aria-hidden="true">{line}</span>
      </div>
    </div>
  );
}
