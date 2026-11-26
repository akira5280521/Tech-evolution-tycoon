import { useEffect, useState } from "react";
import { playArrival } from "@/lib/sfx";
import { shouldSting } from "@/lib/arrivals";
import { readPrefs } from "@/lib/gamePrefs";

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
