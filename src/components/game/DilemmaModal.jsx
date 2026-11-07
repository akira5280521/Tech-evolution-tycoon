import { useEffect, useState } from "react";

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
  return (
    <div role="dialog" aria-label="Boardroom dilemma" className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-md border-4 border-[var(--game-violet-border)] bg-[var(--game-card)] p-4 shadow-[6px_6px_0_0_#000]">
        <p className="font-pixel text-[0.55rem] text-[var(--game-violet)]">BOARDROOM DILEMMA</p>
        <h2 className="mt-2 font-pixel text-sm text-[var(--game-fg)]">GOVERNMENT GRANT</h2>
        <p className="mt-3 font-term text-lg leading-6">The Ministry of Computing offers a research grant - in two shapes.</p>
        <div className="mt-3 h-3 border-2 border-[var(--game-accent)] bg-[var(--game-bg)]">
          <div className="h-full bg-[var(--game-accent)]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 font-term text-base text-[var(--game-muted)]">The moment passes in {left}s.</p>
        <button type="button" data-dilemma="tokens" onClick={() => onChoose("tokens")} className="mt-3 w-full border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-3 py-2 text-left">
          <span className="block font-pixel text-[0.6rem] text-[var(--game-violet)]">FILE THE PAPERWORK</span>
          <span className="font-term text-lg">+2 era tokens</span>
        </button>
        <button type="button" data-dilemma="boost" onClick={() => onChoose("boost")} className="mt-2 w-full border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-3 py-2 text-left">
          <span className="block font-pixel text-[0.6rem] text-[var(--game-violet)]">SELL THE AUTOMATION</span>
          <span className="font-term text-lg">Revenue x1.15 for 5 minutes</span>
        </button>
        <button type="button" data-dilemma="defer" onClick={() => onChoose("defer")} className="mt-2 w-full border-2 border-[var(--game-violet-border)] px-3 py-2 font-pixel text-[0.6rem] text-[var(--game-violet)]">
          DECIDE IN 5 MINUTES
        </button>
      </div>
    </div>
  );
}
