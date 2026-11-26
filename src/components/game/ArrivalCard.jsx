import { useEffect, useState } from "react";
import { playArrival } from "@/lib/sfx";
import { shouldSting } from "@/lib/arrivals";
import { readPrefs } from "@/lib/gamePrefs";
import { BUSINESSES } from "@/lib/gameConfig";

// Full-screen era transition card (T5 item 44): the era's own picture large,
// its year and name, one line of history. Tap anywhere to continue.
function EraCard({ arrival, reduce, onDismiss }) {
  const cfg = BUSINESSES.find((row) => row.id === arrival.eraId);
  const index = BUSINESSES.findIndex((row) => row.id === arrival.eraId);
  const prev = index > 0 ? BUSINESSES[index - 1] : null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`New era: ${arrival.name}`}
      data-arrival={arrival.id}
      data-era-card={arrival.eraId}
      onClick={onDismiss}
      className="era-card fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto overscroll-contain bg-[#0a0812] px-6 py-[max(1.5rem,env(safe-area-inset-top))] text-center text-[#ece8f6]"
    >
      <div className="crt-scanlines pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className={`relative flex w-full max-w-md flex-col items-center ${reduce ? "" : "era-card-in"}`}>
        <p className="font-pixel text-[0.6rem] tracking-widest text-[var(--game-accent)]">NEW ERA</p>
        {prev && <p data-era-from className="mt-2 font-status text-sm text-[#9690ac]">{prev.name} → {arrival.name}</p>}
        {cfg?.icon && (
          <div className="status-frame mt-4 aspect-square w-[min(55vw,15rem,30vh)] overflow-hidden">
            <img src={cfg.icon} alt="" className="pixel-art h-full w-full scale-[1.3] object-contain" />
          </div>
        )}
        {arrival.year ? <p data-arrival-year className="mt-4 font-pixel text-2xl text-[var(--game-accent)]">{arrival.year}</p> : null}
        <h2 data-arrival-name className="mt-2 font-pixel text-base leading-6">{arrival.name}</h2>
        {arrival.text ? <p data-arrival-text className="mt-3 font-term text-xl leading-6 text-[#c8c2dc]">{arrival.text}</p> : null}
        <button
          type="button"
          data-arrival-dismiss
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="mt-6 min-h-12 w-full border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 py-2 font-pixel text-[0.6rem] text-black shadow-[3px_3px_0_0_#000]"
        >
          TAP TO CONTINUE
        </button>
      </div>
    </div>
  );
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ArrivalCard({ arrival, onDismiss }) {
  const [reduce, setReduce] = useState(prefersReducedMotion);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!arrival) return undefined;
    if (shouldSting(readPrefs(), reduce)) playArrival();
    return undefined;
  }, [arrival, reduce]);
  if (!arrival) return null;
  if (arrival.kind === "era") return <EraCard arrival={arrival} reduce={reduce} onDismiss={onDismiss} />;
  const label = arrival.kind === "generation" ? "NEW GENERATION" : arrival.kind === "summary" ? "WHILE YOU WERE AWAY" : "NEW ERA";
  const year = arrival.year ? String(arrival.year) : "";
  return (
    <div role="dialog" aria-label={arrival.name} data-arrival={arrival.id} className="fixed inset-0 z-40 flex items-center justify-center overscroll-contain bg-black/75 p-4">
      <div
        className={`game-modal flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-4 shadow-[6px_6px_0_0_#000] ${reduce ? "" : "motion-safe:animate-none"}`}
      >
        <div className="hint-sheet-body">
          <p className="font-pixel text-[0.55rem] text-[var(--game-accent)]">{label}</p>
          {year ? <p data-arrival-year className="mt-2 font-pixel text-[0.6rem] text-[var(--game-violet)]">{year}</p> : null}
          <h2 data-arrival-name className="mt-2 font-pixel text-sm leading-5 text-[var(--game-fg)]">{arrival.name}</h2>
          {arrival.text ? (
            <p data-arrival-text className="mt-3 font-term text-lg leading-6">{arrival.text}</p>
          ) : null}
        </div>
        <div className="hint-sheet-actions mt-4">
          <button
            type="button"
            data-arrival-dismiss
            onClick={onDismiss}
            className="min-h-12 w-full border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-3 py-2 font-pixel text-[0.6rem] text-[var(--game-fg)]"
          >
            TAP TO CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
