import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "@tanstack/react-router";
import { GLOSSARY } from "@/lib/glossary";
import { currentTip } from "@/lib/tips";
import { useGameState } from "./GameState";

// A card that sits just above the tab bar (beside it in landscape). Used for
// the one-time tips and for the "?" explanations. It never dims or blocks the
// screen, so the game keeps playing around it.
const Sheet = forwardRef(function Sheet({ label, title, text, children, dataAttr, top = false }, ref) {
  return (
    <div
      ref={ref}
      role="dialog"
      aria-live="polite"
      aria-label={title}
      {...dataAttr}
      className={`hint-sheet ${top ? "hint-sheet-top" : ""} fixed z-40 mx-auto max-w-md border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-3 shadow-[6px_6px_0_0_#000]`}
    >
      {label && <p className="font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">{label}</p>}
      <h2 className="font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">{title}</h2>
      <p className="mt-1 font-term text-lg leading-6 text-[var(--game-fg)]">{text}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">{children}</div>
    </div>
  );
});

function usePortal() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready && typeof document !== "undefined" ? document.body : null;
}

function pageKey(pathname, hash) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  if (path === "/") return "game";
  const name = path.slice(1).split("/")[0];
  if (name === "more") return `more#${(hash || "").replace("#", "") || "settings"}`;
  return name;
}

// Outline the thing a tip talks about, without dimming anything.
function useTargetRect(selector) {
  const [rect, setRect] = useState(null);
  useEffect(() => {
    if (!selector) {
      setRect(null);
      return undefined;
    }
    const update = () => {
      const el = document.querySelector(selector);
      const r = el?.getBoundingClientRect();
      const next = r && (r.width || r.height) ? { top: r.top, left: r.left, width: r.width, height: r.height } : null;
      setRect((prev) => (prev && next && prev.top === next.top && prev.left === next.left && prev.width === next.width && prev.height === next.height ? prev : next));
    };
    update();
    const iv = setInterval(update, 300);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      clearInterval(iv);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [selector]);
  return rect;
}

// The one-time tip for the current page, if any.
export function TipCard() {
  const { state, tipSeen, setTipsOff } = useGameState();
  const location = useLocation();
  const tip = currentTip(state, pageKey(location.pathname, location.hash));
  const rect = useTargetRect(tip?.target || null);
  const host = usePortal();
  const sheetRef = useRef(null);
  const [top, setTop] = useState(false);
  // If the card would cover the thing it talks about, move it to the top.
  useLayoutEffect(() => {
    if (!rect || !sheetRef.current) {
      if (!rect && top) setTop(false);
      return;
    }
    const h = sheetRef.current.getBoundingClientRect().height;
    const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tabbar-h")) || 0;
    const bottomTop = window.innerHeight - bar - 8 - h;
    const want = rect.top + rect.height > bottomTop && rect.top < window.innerHeight - bar;
    if (want !== top) setTop(want);
  });
  if (!tip || !host) return null;
  return createPortal(
    <>
      {rect && (
        <div
          aria-hidden="true"
          className="coach-spot pointer-events-none fixed z-40 border-4 border-[var(--game-accent)]"
          style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
        />
      )}
      <Sheet ref={sheetRef} top={top} label="TIP" title={tip.title} text={tip.text} dataAttr={{ "data-tip": tip.id }}>
        <button
          type="button"
          data-tips-off
          onClick={() => setTipsOff(true)}
          className="min-h-11 px-1 font-term text-base leading-5 text-[var(--game-muted)] underline"
        >
          No more tips
        </button>
        <button
          type="button"
          data-tip-ok
          onClick={() => tipSeen(tip.id)}
          className="min-h-11 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.55rem] text-[var(--game-accent-fg)] shadow-[3px_3px_0_0_#000]"
        >
          GOT IT
        </button>
      </Sheet>
    </>,
    host
  );
}

// A small "?" that explains one term in plain words.
export function HelpTip({ term, className = "" }) {
  const [open, setOpen] = useState(false);
  const host = usePortal();
  const entry = GLOSSARY[term];
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!entry) return null;
  return (
    <>
      <button
        type="button"
        data-help={term}
        aria-label={`What is ${entry.term.toLowerCase()}?`}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-current align-middle font-pixel text-[0.5rem] leading-none text-[var(--game-accent)] before:absolute before:-inset-2.5 before:content-[''] ${className}`}
      >
        ?
      </button>
      {open &&
        host &&
        createPortal(
          <Sheet title={entry.term} text={entry.text} dataAttr={{ "data-help-sheet": term }}>
            <span />
            <button
              type="button"
              data-help-close
              onClick={() => setOpen(false)}
              className="min-h-11 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.55rem] text-[var(--game-accent-fg)] shadow-[3px_3px_0_0_#000]"
            >
              OK
            </button>
          </Sheet>,
          host
        )}
    </>
  );
}
