import { useEffect, useState } from "react";
import { loadingFacts } from "@/lib/loadingTips";

// Facts rotate while the game's code or save is still coming in.
export default function LoadingScreen() {
  const [facts] = useState(() => loadingFacts());
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (facts.length < 2) return undefined;
    const id = setInterval(() => setIndex((n) => (n + 1) % facts.length), 2800);
    return () => clearInterval(id);
  }, [facts.length]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--game-bg)] px-6 text-center text-[var(--game-fg)]">
      <p className="font-pixel text-[0.7rem] text-[var(--game-accent)]">TECH EVOLUTION TYCOON</p>
      <p className="font-pixel text-[0.55rem] text-[var(--game-muted)]">LOADING…</p>
      <p data-loading-tip className="max-w-md font-term text-2xl leading-7 text-[var(--game-fg)]">{facts[index]}</p>
    </div>
  );
}
