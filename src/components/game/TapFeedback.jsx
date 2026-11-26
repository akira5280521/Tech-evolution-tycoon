import { useEffect, useState } from "react";
import { readPrefs } from "@/lib/gamePrefs";
import { playTap } from "@/lib/sfx";
import { buzzLight } from "@/lib/haptics";

const HOLD_MS = 450;

// Two global touches (T4 items 33 and 35):
// - Long-press any number marked data-exact to see its full value.
// - With TAP SOUND / TAP VIBRATION on, every button press ticks or buzzes.
// The press animation itself is CSS (index.css, "Tap feedback").
export default function TapFeedback() {
  const [peek, setPeek] = useState(null);
  useEffect(() => {
    let timer = null;
    let start = null;
    let fired = false;
    const clear = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    const down = (e) => {
      const btn = e.target.closest?.("button, [role='button'], a");
      if (btn && !btn.disabled) {
        const prefs = readPrefs();
        if (prefs.tapSound) playTap();
        if (prefs.tapHaptic) buzzLight();
      }
      const el = e.target.closest?.("[data-exact]");
      clear();
      fired = false;
      if (!el) return;
      start = { x: e.clientX, y: e.clientY };
      timer = setTimeout(() => {
        fired = true;
        const r = el.getBoundingClientRect();
        setPeek({ text: el.getAttribute("data-exact"), x: r.left + r.width / 2, y: r.bottom });
      }, HOLD_MS);
    };
    const move = (e) => {
      if (start && Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y) > 12) clear();
    };
    const up = () => clear();
    // A long-press that showed the full value is not also a tap.
    const click = (e) => {
      if (!fired) return;
      fired = false;
      e.preventDefault();
      e.stopPropagation();
    };
    const menu = (e) => {
      if (e.target.closest?.("[data-exact]")) e.preventDefault();
    };
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("pointermove", move, true);
    document.addEventListener("pointerup", up, true);
    document.addEventListener("pointercancel", up, true);
    document.addEventListener("contextmenu", menu, true);
    document.addEventListener("click", click, true);
    return () => {
      clear();
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointerup", up, true);
      document.removeEventListener("pointercancel", up, true);
      document.removeEventListener("contextmenu", menu, true);
      document.removeEventListener("click", click, true);
    };
  }, []);
  useEffect(() => {
    if (!peek) return undefined;
    const t = setTimeout(() => setPeek(null), 3500);
    return () => clearTimeout(t);
  }, [peek]);
  if (!peek) return null;
  const w = typeof window !== "undefined" ? window.innerWidth : 360;
  return (
    <div
      role="status"
      data-exact-peek
      onClick={() => setPeek(null)}
      style={{ top: peek.y + 6, left: Math.max(8, Math.min(w - 8, peek.x)) }}
      className="fixed z-50 max-w-[calc(100vw-16px)] -translate-x-1/2 break-all border-2 border-[var(--game-accent)] bg-[var(--game-card)] px-2 py-1 font-term text-lg leading-5 text-[var(--game-fg)] shadow-[3px_3px_0_0_#000]"
    >
      {peek.text}
    </div>
  );
}
