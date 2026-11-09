import { useEffect, useRef } from "react";
import { Image } from "@/components/ui/image";
import { money } from "@/lib/gameConfig";

export default function IconTile({ cfg, st, onRun }) {
  const ref = useRef(null);
  const idle = st.owned > 0 && !st.manager && !st.running;
  useEffect(() => {
    const el = ref.current;
    if (!el || !st.shake) return undefined;
    el.classList.remove("tile-shake");
    void el.offsetWidth;
    el.classList.add("tile-shake");
    return undefined;
  }, [st.shake]);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onRun}
      aria-label={cfg.name}
      data-tile={cfg.id}
      title={idle ? `Run ${cfg.name} by hand` : cfg.name}
      className={`relative h-[64px] w-[64px] shrink-0 select-none border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] p-0.5 ${
        idle ? "tile-run cursor-pointer" : "cursor-default"
      }`}
    >
      <Image src={cfg.icon} alt="" fittingType="fit" className="pointer-events-none h-full w-full pixel-art" />
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
          className="gain-pop pointer-events-none absolute left-1/2 top-0 z-10 whitespace-nowrap font-term text-lg font-bold leading-5 text-[var(--game-success)]"
        >
          +{money(st.lastGain.amount)}
        </span>
      )}
    </button>
  );
}