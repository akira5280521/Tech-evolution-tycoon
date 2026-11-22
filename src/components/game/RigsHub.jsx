import { Link } from "@tanstack/react-router";
import { HUB_ITEMS, HUB_LABEL } from "@/lib/hub";
import { useGameState } from "./GameState";
import ScreenShell from "./chrome";

// The menu behind the top button beside TECH. Every facility is listed;
// ones not unlocked this run stay visible as locked ? cards with the era
// they need, greyed Coming soon.
export default function RigsHub() {
  const { state } = useGameState();
  return (
    <ScreenShell title={HUB_LABEL} subtitle="Your hardware. Pick a section.">
      <div data-hub-menu className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
        {HUB_ITEMS.map((item) => {
          const open = item.open(state);
          if (!open) {
            return (
              <div
                key={item.id}
                aria-disabled="true"
                aria-label={`${item.label}, locked`}
                data-hub-item={item.id}
                data-locked=""
                className="min-h-20 border-2 border-[var(--game-border)] bg-[var(--game-panel)] p-3 text-[var(--game-dim)] opacity-60 shadow-[3px_3px_0_0_#000]"
              >
                <p className="font-pixel text-[0.6rem] leading-5">??? <span className="text-[var(--game-dim)]">{item.label}</span></p>
                <p data-hub-need className="break-words font-pixel text-[0.5rem] leading-4">{item.need?.(state) || "Unlocks later in the timeline."}</p>
                <p className="mt-1 font-pixel text-[0.5rem] leading-4">COMING SOON</p>
              </div>
            );
          }
          return (
            <Link
              key={item.id}
              to={item.to}
              hash={item.hash}
              data-hub-item={item.id}
              className="block min-h-20 border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-3 shadow-[3px_3px_0_0_#000] hover:border-[var(--game-accent)]"
            >
              <p className="font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">{item.label} &gt;</p>
              <p className="break-words font-term text-base leading-5 text-[var(--game-fg)]">{item.text}</p>
            </Link>
          );
        })}
      </div>
    </ScreenShell>
  );
}
