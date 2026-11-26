import { useEffect, useRef } from "react";
import { QUICK_BUY_MODES } from "@/lib/gameConfig";

const LABEL = { x1: "×1", x10: "×10", x100: "×100", MAX: "MAX" };

export function BuyBar({ buyMode, onPick }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return undefined;
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty("--buybar-h", `${Math.ceil(el.getBoundingClientRect().height)}px`);
    };
    update();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    ro?.observe(el, { box: "border-box" });
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      root.style.setProperty("--buybar-h", "0px");
    };
  }, []);
  return (
    <div ref={ref} data-buy-bar className="buy-bar grid grid-cols-4 gap-1 border-t-2 border-[var(--game-border)] bg-[var(--game-bg)] px-2 py-1" role="group" aria-label="Buy amount">
      {QUICK_BUY_MODES.map((mode) => {
        const on = buyMode === mode;
        return (
          <button
            key={mode}
            type="button"
            data-buy-bar-mode={mode}
            aria-pressed={on}
            onClick={() => onPick?.(mode)}
            className={`min-h-11 border-2 font-pixel text-[0.6rem] shadow-[2px_2px_0_0_#000] ${on ? "border-[var(--game-accent)] bg-[var(--game-accent)] text-black" : "border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-muted)]"}`}
          >
            {LABEL[mode] || mode}
          </button>
        );
      })}
    </div>
  );
}
