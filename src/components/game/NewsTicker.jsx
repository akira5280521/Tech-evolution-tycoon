import { useState } from "react";
import { HEADLINES } from "@/lib/empire";

// Scrolls slowly enough to read. Hold a finger (or the mouse) on it to pause.
export default function NewsTicker() {
  const [paused, setPaused] = useState(false);
  const line = HEADLINES.join("   ·   ");
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
      <p className="truncate px-3 text-center font-pixel text-[0.55rem] uppercase leading-8 text-[var(--game-muted)] motion-safe:hidden">{HEADLINES[0]}</p>
      <div className="news-ticker-track hidden font-pixel text-[0.55rem] uppercase leading-8 text-[var(--game-muted)] motion-safe:flex">
        <span>{line}</span>
        <span aria-hidden="true">{line}</span>
      </div>
    </div>
  );
}
