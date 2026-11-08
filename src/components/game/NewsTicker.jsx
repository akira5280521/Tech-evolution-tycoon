import { HEADLINES } from "@/lib/empire";

export default function NewsTicker() {
  const line = HEADLINES.join("   ·   ");
  return (
    <div data-news className="relative h-8 overflow-hidden border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] shadow-[4px_4px_0_0_#000]">
      <p className="truncate px-3 text-center font-pixel text-[0.55rem] uppercase leading-8 text-[var(--game-muted)] motion-safe:hidden">{HEADLINES[0]}</p>
      <div className="news-ticker-track hidden font-pixel text-[0.55rem] uppercase leading-8 text-[var(--game-muted)] motion-safe:flex">
        <span>{line}</span>
        <span aria-hidden="true">{line}</span>
      </div>
    </div>
  );
}
