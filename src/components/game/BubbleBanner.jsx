import { useEffect, useState } from "react";
import { money } from "@/lib/gameConfig";
import { bubblePopInMs, bubbleSeconds, bubbleValue } from "@/lib/bubble";

function countdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Live card for the dot-com bubble. The pop time is chosen when the stock
// appears, and the countdown shows it for the whole run.
export default function BubbleBanner({ state, onCashOut }) {
  const bubble = state.bubble;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!bubble) return undefined;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [bubble]);
  if (!bubble) return null;
  const value = bubbleValue(state, now);
  const seconds = Math.floor(bubbleSeconds(bubble, now));
  const span = Math.max(1, bubble.popAt - bubble.startedAt);
  const grown = Math.max(0, Math.min(100, ((now - bubble.startedAt) / span) * 100));
  return (
    <section data-bubble className="border-2 border-[var(--game-violet-border)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-pixel text-[0.6rem] text-[var(--game-violet)]">DOT-COM BUBBLE</h2>
        <span className="font-pixel text-[0.5rem] text-[var(--game-muted)]">c. 1999</span>
      </div>
      <p className="mt-2 font-term text-lg leading-6">Your web stock is soaring. Sell before the clock hits zero.</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <p data-bubble-pop className="font-pixel text-sm leading-5 text-[var(--game-danger)]">POPS IN {countdown(bubblePopInMs(bubble, now))}</p>
          <p className="mt-1 break-all font-term text-2xl leading-7 text-[var(--game-accent)]">{money(value)}</p>
          <p className="font-term text-base leading-5 text-[var(--game-muted)]">{seconds} seconds of income</p>
        </div>
        <button
          type="button"
          data-action="cash-out"
          onClick={onCashOut}
          className="min-h-11 min-w-[8.5rem] flex-1 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.6rem] text-black shadow-[2px_2px_0_0_#000] sm:flex-none"
        >
          CASH OUT
        </button>
      </div>
      <div className="mt-2 h-3 border-2 border-[var(--game-violet-border)] bg-[var(--game-bg)]">
        <div className="h-full bg-[var(--game-violet)]" style={{ width: `${grown}%` }} />
      </div>
    </section>
  );
}
