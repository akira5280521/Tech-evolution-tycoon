import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { dailyTip, formatCountdown, msUntilNextLocalMidnight } from "@/lib/briefing";

export default function DailyBriefing({ state, onRoll }) {
  const [label, setLabel] = useState(null);
  const [tip, setTip] = useState("");

  useEffect(() => {
    const tick = () => {
      const left = msUntilNextLocalMidnight();
      setLabel(formatCountdown(left));
      setTip(dailyTip(state.briefingDay || ""));
      if (left <= 1000) onRoll();
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [state.briefingDay, state.streak, onRoll]);

  return (
    <section data-briefing className="border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]">
      <h2 className="flex items-center gap-2 font-pixel text-[0.7rem] text-[var(--game-accent)]">
        <Target className="h-4 w-4" aria-hidden="true" />
        DAILY BRIEFING
      </h2>
      <p className="mt-2 font-term text-lg leading-6 text-[var(--game-fg)]">
        {label ? `new set in ${label}` : "new set at local midnight"} · streak {state.streak || 1}d
      </p>
      {tip && <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">{tip}</p>}
    </section>
  );
}
