import { useEffect, useRef } from "react";
import { Image } from "@/components/ui/image";
import { isManaged, money } from "@/lib/gameConfig";

// Start a run from pointerup (each finger has its own pointerId) rather than
// click. Mobile browsers only synthesize click for the first finger, so two
// tiles tapped at once would start only one. A move of more than 14px is a
// scroll, not a tap. click is kept for keyboards, and ignored just after a
// pointer tap so a single press does not run twice.
const TAP_PX = 14;
const CLICK_GUARD_MS = 500;

export default function IconTile({ cfg, st, onRun, tapHint = false }) {
  const ref = useRef(null);
  const gestures = useRef(new Map());
  const ignoreClickUntil = useRef(0);
  const commissioning = (st.commissionUntil || 0) > Date.now();
  const ready = st.owned > 0 && !isManaged(st) && !st.running && !commissioning;
  // A tap on a row that's already running just shakes the picture. It's done
  // right here on the button, so it doesn't redraw the game screen or force
  // the page to lay out again (fast repeat taps used to stutter, worst while
  // a popup was animating).
  const shake = () => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "translateX(0)" }], { duration: 180, easing: "linear" });
  };
  const busy = st.owned > 0 && !isManaged(st) && st.running;
  const tap = () => {
    if (busy) shake();
    else onRun();
  };
  useEffect(() => () => {
    for (const gesture of gestures.current.values()) gesture.stop();
    gestures.current.clear();
  }, []);

  const suppressClick = () => {
    ignoreClickUntil.current = Date.now() + CLICK_GUARD_MS;
  };
  const startTap = (event) => {
    if (event.button) return;
    const id = event.pointerId;
    if (gestures.current.has(id)) return;
    const origin = { x: event.clientX, y: event.clientY };
    const stop = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      gestures.current.delete(id);
    };
    const onMove = (move) => {
      if (move.pointerId !== id) return;
      if (Math.hypot(move.clientX - origin.x, move.clientY - origin.y) > TAP_PX) {
        stop();
        suppressClick();
      }
    };
    const onUp = (up) => {
      if (up.pointerId !== id) return;
      const moved = Math.hypot(up.clientX - origin.x, up.clientY - origin.y) > TAP_PX;
      stop();
      suppressClick();
      if (!moved) tap();
    };
    const onCancel = (cancel) => {
      if (cancel.pointerId !== id) return;
      stop();
      suppressClick();
    };
    gestures.current.set(id, { stop });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };
  const onClick = () => {
    if (Date.now() < ignoreClickUntil.current) return;
    tap();
  };

  return (
    <button
      ref={ref}
      type="button"
      onPointerDown={startTap}
      onClick={onClick}
      aria-label={ready ? `Tap to run ${cfg.name}` : cfg.name}
      data-tile={cfg.id}
      title={ready ? `Tap to run ${cfg.name}` : cfg.name}
      className={`relative h-[64px] w-[64px] shrink-0 touch-manipulation select-none border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] p-0.5 ${
        ready ? "tile-run cursor-pointer" : "cursor-default"
      }`}
    >
      <Image src={cfg.icon} alt="" fittingType="fit" className="pointer-events-none h-full w-full pixel-art" />
      {ready && tapHint && (
        <span
          data-tap-run
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] bg-black/80 py-px text-center font-pixel text-[8px] leading-[10px] text-[var(--game-accent)]"
        >
          TAP TO
          <br />
          RUN
        </span>
      )}
      {cfg.placeholder && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/80 text-center font-pixel text-[0.4rem] leading-3 text-[var(--game-muted)]">SOON</span>
      )}
      {st.owned > 0 && (
        <span
          data-owned={cfg.id}
          className="absolute -bottom-2 -right-2 border-2 border-[var(--game-bg)] bg-[var(--game-accent)] px-1 font-pixel text-sm leading-4 text-[var(--game-accent-fg)]"
        >
          {st.owned}
        </span>
      )}
      {st.lastGain && (
        <span
          key={st.lastGain.id}
          className="gain-pop pointer-events-none absolute left-1/2 top-0 z-10 whitespace-nowrap font-term text-base font-bold leading-5 text-[var(--game-success)] [text-shadow:1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]"
        >
          +{money(st.lastGain.amount)}
        </span>
      )}
    </button>
  );
}
