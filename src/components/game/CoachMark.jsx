import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TUTORIAL_STEPS, currentTutorialStep, stepNumber } from "@/lib/tutorial";

const PAD = 6;
const GAP = 12;

function readRect(selector) {
  if (!selector || typeof document === "undefined") return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height, el };
}

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

// The tutorial's coach mark: dims the screen around one target and explains
// it in a bubble. Never blocks play: taps go through to the game everywhere.
export default function CoachMark({ state, onNext, onSkip }) {
  const step = currentTutorialStep(state);
  const [rect, setRect] = useState(null);
  const [view, setView] = useState({ w: 0, h: 0 });
  const bubbleRef = useRef(null);
  const [bubbleH, setBubbleH] = useState(160);
  const scrolledFor = useRef(null);

  // Follow the target as the page scrolls, rotates or reflows.
  useEffect(() => {
    if (!step) return undefined;
    let alive = true;
    const update = () => {
      if (!alive) return;
      const next = readRect(step.target);
      setRect((prev) => {
        if (!next && !prev) return prev;
        if (next && prev && Math.abs(next.top - prev.top) < 0.5 && Math.abs(next.left - prev.left) < 0.5 && Math.abs(next.width - prev.width) < 0.5 && Math.abs(next.height - prev.height) < 0.5) return prev;
        return next;
      });
      setView((prev) => (prev.w === window.innerWidth && prev.h === window.innerHeight ? prev : { w: window.innerWidth, h: window.innerHeight }));
    };
    update();
    const iv = setInterval(update, 250);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      alive = false;
      clearInterval(iv);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [step]);

  // Bring the target into view once when a step starts.
  useEffect(() => {
    if (!step || scrolledFor.current === step.id) return;
    const found = readRect(step.target);
    if (!found) return;
    scrolledFor.current = step.id;
    const r = found.el.getBoundingClientRect();
    if (r.top < 80 || r.bottom > window.innerHeight - 200) {
      found.el.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }, [step, rect]);

  useLayoutEffect(() => {
    if (bubbleRef.current) setBubbleH(bubbleRef.current.offsetHeight);
  });

  if (!step || state.offlineReport) return null;

  const vw = view.w || (typeof window !== "undefined" ? window.innerWidth : 390);
  const vh = view.h || (typeof window !== "undefined" ? window.innerHeight : 800);
  const width = Math.min(vw - 24, 380);
  // Keep clear of the bottom tab bar.
  const floor = vh - 132;
  let top;
  let left = (vw - width) / 2;
  if (rect) {
    const below = rect.top + rect.height + PAD + GAP;
    const above = rect.top - PAD - GAP - bubbleH;
    const centreY = rect.top + rect.height / 2;
    top = centreY < vh / 2 ? below : above;
    if (top + bubbleH > floor) top = above;
    if (top < 8) top = Math.min(below, floor - bubbleH);
    left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), vw - width - 12);
  } else {
    top = Math.max(12, (floor - bubbleH) / 2);
  }
  top = Math.max(8, Math.min(top, Math.max(8, floor - bubbleH)));

  const n = stepNumber(step);
  return (
    <>
      {rect ? (
        <div
          aria-hidden="true"
          data-coach-spot
          className="coach-spot pointer-events-none fixed z-30 border-4 border-[var(--game-accent)]"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 bg-black/55" />
      )}
      <div
        ref={bubbleRef}
        role="dialog"
        aria-live="polite"
        aria-label={`Tutorial step ${n} of ${TUTORIAL_STEPS.length}: ${step.title}`}
        data-coach={step.id}
        className="fixed z-30 border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-3 shadow-[6px_6px_0_0_#000]"
        style={{ top, left, width }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">{step.title}</h2>
          <span className="shrink-0 font-term text-base leading-5 text-[var(--game-muted)]">
            {n}/{TUTORIAL_STEPS.length}
          </span>
        </div>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-fg)]">{step.text}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            data-coach-skip
            onClick={onSkip}
            className="min-h-11 px-1 font-term text-base leading-5 text-[var(--game-muted)] underline"
          >
            Skip tutorial
          </button>
          {(step.manual || state.tutorial?.replay) && (
            <button
              type="button"
              data-coach-next
              onClick={() => onNext(step.id)}
              className="min-h-11 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.55rem] text-[var(--game-accent-fg)] shadow-[3px_3px_0_0_#000]"
            >
              {step.button || "NEXT"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
