import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { currentCoach, stepTarget, stepText } from "@/lib/tutorial";

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

// Keep the bubble on screen and off the thing the player has to tap. In
// landscape the tab bar sits on the left, so the bubble starts to the right of it.
function placeBubble({ rect, bubbleH, vw, vh, floor, width, minLeft }) {
  const gap = GAP;
  const maxLeft = Math.max(minLeft, vw - width - 12);
  const leftOf = (target) => {
    if (!target) return Math.max(minLeft, (vw - width) / 2);
    return Math.min(Math.max(minLeft, target.left + target.width / 2 - width / 2), maxLeft);
  };
  if (!rect) return { top: Math.max(8, Math.min((floor - bubbleH) / 2, Math.max(8, floor - bubbleH))), left: leftOf(null) };
  // A short landscape screen has no room to stack a tall bubble under a
  // control. Park it beside a narrow target (the picture, BUY, Hire) instead.
  if (vh < 500 && rect.width < 220 && rect.left + rect.width + gap + 200 < vw - 12) {
    const left = Math.min(Math.max(minLeft, rect.left + rect.width + gap), Math.max(minLeft, vw - width - 12));
    let top = rect.top;
    if (top + bubbleH > floor) top = Math.max(8, floor - bubbleH);
    if (left >= rect.left + rect.width) return { top, left };
  }
  const below = rect.top + rect.height + PAD + gap;
  const above = rect.top - PAD - gap - bubbleH;
  const overlaps = (top) => top < rect.top + rect.height + PAD && top + bubbleH > rect.top - PAD;
  const fits = (top) => top >= 8 && top + bubbleH <= floor && !overlaps(top);
  let top = rect.top + rect.height / 2 < vh / 2 ? below : above;
  if (!fits(top)) {
    const alt = top === below ? above : below;
    if (fits(alt)) top = alt;
  }
  if (!fits(top)) {
    const spaceAbove = rect.top - PAD - gap - 8;
    const spaceBelow = floor - (rect.top + rect.height + PAD + gap);
    top = spaceBelow >= spaceAbove ? below : above;
  }
  top = Math.max(8, Math.min(top, Math.max(8, floor - bubbleH)));
  return { top, left: leftOf(rect) };
}

// The tutorial's coach mark: dims the screen around one target and explains
// it in a bubble. Never blocks play: taps go through to the game everywhere.
export default function CoachMark({ state, onNext, onSkip }) {
  const coach = currentCoach(state);
  const step = coach?.step;
  const selector = stepTarget(step, state);
  const text = stepText(step, state);
  const [rect, setRect] = useState(null);
  const [view, setView] = useState({ w: 0, h: 0 });
  const bubbleRef = useRef(null);
  const [bubbleH, setBubbleH] = useState(160);
  const scrolledFor = useRef(null);

  // Follow the target as the page scrolls, rotates or reflows. The selector
  // changes mid-step when the thing to tap changes (picture, then a button).
  useEffect(() => {
    if (!step) return undefined;
    let alive = true;
    const update = () => {
      if (!alive) return;
      const next = readRect(selector);
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
  }, [step, selector]);

  // Bring the target into view when a step starts. A second pass runs after the
  // tab bar restores scroll (it jumps back to the top a moment after navigation)
  // so a short landscape screen doesn't leave the target under the bubble.
  useEffect(() => {
    if (!step) return undefined;
    const key = `${step.id}:${selector || ""}`;
    const pin = () => {
      const found = readRect(selector);
      if (!found) return;
      const r = found.el.getBoundingClientRect();
      const hud = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hud-h")) || 0;
      if (window.innerHeight < 500) {
        const desired = hud + 8;
        if (Math.abs(r.top - desired) > 12) window.scrollBy({ top: r.top - desired, behavior: "auto" });
        return;
      }
      if (scrolledFor.current === key) return;
      scrolledFor.current = key;
      if (r.top < 80 || r.bottom > window.innerHeight - 200) {
        found.el.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
    };
    pin();
    const later = setTimeout(pin, 450);
    return () => clearTimeout(later);
  }, [step, selector]);

  useLayoutEffect(() => {
    if (bubbleRef.current) setBubbleH(bubbleRef.current.offsetHeight);
  });

  if (!step || state.offlineReport) return null;

  const vw = view.w || (typeof window !== "undefined" ? window.innerWidth : 390);
  const vh = view.h || (typeof window !== "undefined" ? window.innerHeight : 800);
  // Keep clear of the bottom tab bar (its real height, set by BottomTabs).
  // In landscape the bar is on the left and --tabbar-h is 0.
  let barH = 132;
  let minLeft = 12;
  if (typeof document !== "undefined" && typeof window !== "undefined") {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tabbar-h"));
    if (Number.isFinite(v)) barH = v + 12;
    const nav = document.querySelector("nav[aria-label='Main navigation']");
    if (nav) {
      const r = nav.getBoundingClientRect();
      if (r.height > r.width && r.left <= 1 && r.right > 40) minLeft = Math.ceil(r.right) + 8;
    }
  }
  const width = Math.min(vw - minLeft - 12, 380);
  const floor = vh - barH;
  const placed = placeBubble({ rect, bubbleH, vw, vh, floor, width, minLeft });
  const { top, left } = placed;

  const n = coach.index;
  const total = coach.total;
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
        aria-label={`Tutorial step ${n} of ${total}: ${step.title}`}
        data-coach={step.id}
        className="fixed z-40 border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-3 shadow-[6px_6px_0_0_#000]"
        style={{ top, left, width }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">{step.title}</h2>
          <span className="shrink-0 font-term text-base leading-5 text-[var(--game-muted)]">
            {n}/{total}
          </span>
        </div>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-fg)]">{text}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            data-coach-skip
            onClick={onSkip}
            className="min-h-12 px-1 font-term text-base leading-5 text-[var(--game-muted)] underline"
          >
            {coach.kind === "tour" ? "Skip" : "Skip tutorial"}
          </button>
          {(step.manual || state.tutorial?.replay) && (
            <button
              type="button"
              data-coach-next
              onClick={() => onNext(step.id)}
              className="min-h-12 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.55rem] text-[var(--game-accent-fg)] shadow-[3px_3px_0_0_#000]"
            >
              {step.button || "NEXT"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
