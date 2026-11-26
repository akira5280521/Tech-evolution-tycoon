import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "@tanstack/react-router";
import { GLOSSARY } from "@/lib/glossary";
import { itemInfo } from "@/lib/itemInfo";
import { currentTip } from "@/lib/tips";
import { notesUnseen } from "@/lib/releaseNotes";
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
      <div className="hint-sheet-body">
        {label && <p className="font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">{label}</p>}
        <h2 className="font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">{title}</h2>
        <p className="mt-1 font-term text-lg leading-6 text-[var(--game-fg)]">{text}</p>
      </div>
      <div className="hint-sheet-actions mt-2 flex flex-wrap items-center justify-between gap-2">{children}</div>
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
  const tab = (hash || "").replace("#", "");
  if (name === "more") return `more#${tab || "settings"}`;
  if (name === "progress") return `progress#${["badges", "museum", "stats"].includes(tab) ? tab : "runs"}`;
  if (name === "boost" && ["now", "bonuses", "prestige"].includes(tab)) return `boost#${tab}`;
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
  const { state, tipSeen, tipShown, setTipsOff } = useGameState();
  const location = useLocation();
  const tip = currentTip(state, pageKey(location.pathname, location.hash));
  const blockedByNotes = notesUnseen();
  const tipId = tip && !blockedByNotes ? tip.id : null;
  // Once on screen, a tip stays until GOT IT (one time per save).
  useEffect(() => {
    if (tipId) tipShown?.(tipId);
  }, [tipId, tipShown]);
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
    let want = rect.top + rect.height > bottomTop && rect.top < window.innerHeight - bar;
    // Never move up over the starter goal card under the cash readout.
    const goal = document.querySelector("[data-starter-goal]")?.getBoundingClientRect();
    if (want && goal && goal.height > 0 && goal.bottom > 0 && goal.top < 12 + h) want = false;
    if (want !== top) setTop(want);
  });
  // One thing at a time: no tip while the What's New card is still up.
  if (!tip || !host || notesUnseen()) return null;
  return createPortal(
    <>
      {rect && (
        <div
          aria-hidden="true"
          className="coach-spot pointer-events-none fixed z-40 border-4 border-[var(--game-accent)]"
          style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
        />
      )}
      <Sheet ref={sheetRef} top={top} label="TIP" title={tip.title} text={tip.text} dataAttr={{ "data-tip": tip.id, "data-tip-target": tip.target || "" }}>
        <button
          type="button"
          data-tips-off
          onClick={() => setTipsOff(true)}
          className="min-h-12 px-1 font-term text-base leading-5 text-[var(--game-muted)] underline"
        >
          No more tips
        </button>
        <button
          type="button"
          data-tip-ok
          onClick={() => tipSeen(tip.id)}
          className="min-h-12 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.55rem] text-[var(--game-accent-fg)] shadow-[3px_3px_0_0_#000]"
        >
          GOT IT
        </button>
      </Sheet>
    </>,
    host
  );
}

// --- "?" buttons ---------------------------------------------------------
//
// One button for every "?" in the game: a glossary term (HelpTip) or an item
// (ItemHelp, text from src/lib/itemInfo.js). The button is a full 44x44 tap
// target around the small ring. The sheet closes on OK, Escape or a tap
// anywhere outside it, sits above the tab bar or just under the money panel,
// whichever keeps the item's own buttons uncovered, and never overlaps the
// money panel or the news ticker.

function union(rects) {
  const list = rects.filter((r) => r && r.width > 0 && r.height > 0);
  if (!list.length) return null;
  return {
    top: Math.min(...list.map((r) => r.top)),
    bottom: Math.max(...list.map((r) => r.bottom)),
  };
}

function overlap(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
}

// What the sheet must not cover: the card's main buttons (marked
// data-help-guard, e.g. BUY and Hire), else every button on the card the "?"
// belongs to, else the card itself.
function protectedRect(anchor) {
  if (!anchor) return null;
  const scope = anchor.closest("[data-help-scope]");
  if (!scope) return null;
  const marked = [...scope.querySelectorAll("[data-help-guard]")];
  const buttons = marked.length ? marked : [...scope.querySelectorAll("button, a")].filter((el) => el !== anchor && !el.hasAttribute("data-help"));
  return union(buttons.map((el) => el.getBoundingClientRect())) || union([scope.getBoundingClientRect()]);
}

function HelpSheet({ id, info, anchor, onClose }) {
  const ref = useRef(null);
  const okRef = useRef(null);
  const [place, setPlace] = useState(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    okRef.current?.focus({ preventScroll: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useLayoutEffect(() => {
    const measure = (allowScroll = false) => {
      const el = ref.current;
      if (!el) return;
      // Measure where the stylesheet puts it (above the tab bar).
      const prevTop = el.style.top;
      const prevBottom = el.style.bottom;
      const prevMax = el.style.maxHeight;
      el.style.top = "";
      el.style.bottom = "";
      el.style.maxHeight = "";
      const low = el.getBoundingClientRect();
      el.style.top = prevTop;
      el.style.bottom = prevBottom;
      el.style.maxHeight = prevMax;
      const h = low.height;
      const floor = low.bottom; // the lowest the sheet may reach
      const hud = document.querySelector("[data-sticky-hud]")?.getBoundingClientRect();
      const safe = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--safe-area-inset-top")) || 0;
      const ceiling = Math.max(safe + 8, hud && hud.bottom > 0 ? hud.bottom + 8 : 0);
      const room = floor - ceiling;
      const guard = protectedRect(anchor);
      let next = null;
      let scroll = 0;
      if (h > room) {
        // Too tall for the gap: fill it and scroll inside.
        next = { top: ceiling, maxHeight: Math.max(120, room) };
      } else if (guard) {
        // Above the tab bar or under the money panel, whichever leaves the
        // item's buttons uncovered; scroll the page a little if neither does.
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const options = [
          { place: null, box: { top: floor - h, bottom: floor } },
          { place: { top: ceiling }, box: { top: ceiling, bottom: ceiling + h } },
        ].map((opt) => {
          if (overlap(opt.box, guard) <= 0) return { ...opt, d: 0, ok: true };
          const d = opt.place ? guard.top - (opt.box.bottom + 8) : guard.bottom - (opt.box.top - 8);
          const top = guard.top - d;
          const bottom = guard.bottom - d;
          const inPage = window.scrollY + d >= 0 && window.scrollY + d <= maxScroll;
          const clear = opt.place ? bottom <= floor : top >= ceiling;
          return { ...opt, d, ok: inPage && clear };
        });
        const usable = options.filter((opt) => opt.ok).sort((x, y) => Math.abs(x.d) - Math.abs(y.d));
        const pick = usable[0] || options.sort((x, y) => overlap(x.box, guard) - overlap(y.box, guard))[0];
        next = pick.place;
        scroll = usable[0] && allowScroll ? pick.d : 0;
      }
      if (scroll) {
        window.scrollBy({ top: scroll, behavior: "instant" });
        // A money panel that scrolls with the page may have come back into view.
        const after = document.querySelector("[data-sticky-hud]")?.getBoundingClientRect();
        const lowest = after && after.bottom > 0 ? after.bottom + 8 : 0;
        const sheetTop = next ? next.top : floor - h;
        if (sheetTop < lowest) next = { top: lowest, maxHeight: Math.max(120, floor - lowest) };
      }
      setPlace((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure(true);
    // The money panel can grow, shrink or stop sticking while the sheet is
    // open (a goal finishes, big text), so keep checking where it may go.
    const again = () => measure(false);
    const timer = setInterval(again, 400);
    window.addEventListener("resize", again);
    window.addEventListener("orientationchange", again);
    window.addEventListener("scroll", again, { passive: true });
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", again);
      window.removeEventListener("orientationchange", again);
      window.removeEventListener("scroll", again);
    };
  }, [anchor, id]);
  if (!info) return null;
  const style = place ? { top: place.top, bottom: "auto", ...(place.maxHeight ? { maxHeight: place.maxHeight } : {}) } : undefined;
  return (
    <>
      <div aria-hidden="true" data-help-backdrop className="fixed inset-0 z-[39]" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-label={info.title}
        data-help-sheet={id}
        data-help-place={place ? "top" : "bottom"}
        style={style}
        className="hint-sheet fixed z-40 mx-auto max-w-md border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-3 shadow-[6px_6px_0_0_#000]"
      >
        <div className="hint-sheet-body">
        <h2 className="break-words font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)] [overflow-wrap:anywhere]">{info.title}</h2>
        <p className="mt-1 break-words font-term text-lg leading-6 text-[var(--game-fg)]">{info.text}</p>
        {info.rows?.length > 0 && (
          <dl className="mt-2 space-y-1">
            {info.rows.map((row) => (
              <div key={row.label} className="break-words font-term text-base leading-5">
                <dt className="inline font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">{row.label} </dt>
                <dd className="inline text-[var(--game-fg)]">{row.text}</dd>
              </div>
            ))}
          </dl>
        )}
        </div>
        <div className="hint-sheet-actions mt-2 flex justify-end">
          <button
            ref={okRef}
            type="button"
            data-help-close
            onClick={onClose}
            className="min-h-12 min-w-11 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.55rem] text-[var(--game-accent-fg)] shadow-[3px_3px_0_0_#000]"
          >
            OK
          </button>
        </div>
      </div>
    </>
  );
}

// The "?" itself. get() returns { title, text, rows? }; it runs while the
// sheet is open, so the numbers stay current.
export function HelpButton({ id, get, label, className = "" }) {
  const [open, setOpen] = useState(false);
  const host = usePortal();
  const btnRef = useRef(null);
  const close = useCallback(() => {
    setOpen(false);
    btnRef.current?.focus({ preventScroll: true });
  }, []);
  const info = open ? get() : null;
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        data-help={id}
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`help-btn -mx-0.5 -my-3 inline-flex h-12 w-12 shrink-0 items-center justify-center align-middle text-[var(--game-accent)] ${className}`}
      >
        <span aria-hidden="true" className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-current font-pixel text-[0.5rem] leading-none">
          ?
        </span>
      </button>
      {open && info && host && createPortal(<HelpSheet id={id} info={info} anchor={btnRef.current} onClose={close} />, host)}
    </>
  );
}

// A "?" that explains one term in plain words (src/lib/glossary.js).
export function HelpTip({ term, className = "" }) {
  const entry = GLOSSARY[term];
  if (!entry) return null;
  return (
    <HelpButton
      id={term}
      label={`What is ${entry.term.toLowerCase()}?`}
      get={() => ({ title: entry.term, text: entry.text })}
      className={className}
    />
  );
}

// A "?" for one item in the game (src/lib/itemInfo.js).
export function ItemHelp({ kind, id, state, name, className = "" }) {
  const key = `${kind}${id != null && typeof id !== "object" ? `:${id}` : ""}`;
  return (
    <HelpButton
      id={key}
      label={`What is ${name || "this"}?`}
      get={() => itemInfo(kind, id, state)}
      className={className}
    />
  );
}
