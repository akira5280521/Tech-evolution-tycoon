import { useEffect, useState } from "react";
import { describeEffects, dilemmaSpec } from "@/lib/empire";

export default function DilemmaModal({ dilemma, onChoose }) {
  const [left, setLeft] = useState(45);
  const [pct, setPct] = useState(100);
  useEffect(() => {
    if (!dilemma) return undefined;
    const tick = () => {
      const remain = Math.max(0, dilemma.expiresAt - Date.now());
      setLeft(Math.ceil(remain / 1000));
      setPct(Math.max(0, Math.min(100, (remain / 45000) * 100)));
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [dilemma]);
  if (!dilemma) return null;
  const spec = dilemmaSpec(dilemma.id);
  return (
    <div role="dialog" aria-label="Boardroom dilemma" className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4">
      <div className="game-modal flex max-h-[85vh] w-full max-w-md flex-col overflow-y-auto border-4 border-[var(--game-violet-border)] bg-[var(--game-card)] p-4 shadow-[6px_6px_0_0_#000]">
        <p className="font-pixel text-[0.55rem] text-[var(--game-violet)]">BOARDROOM DILEMMA</p>
        <h2 className="mt-2 font-pixel text-sm text-[var(--game-fg)]">{spec.title}</h2>
        <p className="mt-3 font-term text-lg leading-6">{spec.text}</p>
        <div className="mt-3 h-3 border-2 border-[var(--game-accent)] bg-[var(--game-bg)]">
          <div className="h-full bg-[var(--game-accent)]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 font-term text-base text-[var(--game-muted)]">The moment passes in {left}s.</p>
        {spec.choices.map((choice, n) => (
          <button
            key={choice.key}
            type="button"
            data-dilemma={choice.key}
            onClick={() => onChoose(choice.key)}
            className={`${n === 0 ? "mt-3" : "mt-2"} min-h-11 w-full border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-3 py-2 text-left`}
          >
            <span className="block font-pixel text-[0.6rem] text-[var(--game-violet)]">{choice.label}</span>
            <span className="font-term text-lg">{describeEffects(choice.effects)}</span>
          </button>
        ))}
        <button type="button" data-dilemma="defer" onClick={() => onChoose("defer")} className="mt-2 min-h-11 w-full border-2 border-[var(--game-violet-border)] px-3 py-2 font-pixel text-[0.6rem] text-[var(--game-violet)]">
          DECIDE IN 5 MINUTES
        </button>
      </div>
    </div>
  );
}
