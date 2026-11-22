import { Lightbulb } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BUSINESSES, eraOpen, nextMove } from "@/lib/gameConfig";
import { writePrefs } from "@/lib/gamePrefs";
import { focusRowLater, rowNamedLast, sectionOfId } from "@/lib/sections";
import { starterHint } from "@/lib/hub";

export default function NextMove({ state }) {
  // No research machine yet: that comes first (R&D points need one).
  const starter = starterHint(state);
  const text = starter || nextMove(state);
  // The row this move acts on, so GO opens the game screen on its section
  // (TECH or SUPPLY) and scrolls to it.
  const rowId = starter ? null : rowNamedLast(text);
  const index = rowId ? BUSINESSES.findIndex((cfg) => cfg.id === rowId) : -1;
  const shown = index >= 0 && eraOpen(state, index);
  const section = rowId ? sectionOfId(rowId) : null;
  return (
    <section data-next-move className="flex gap-3 border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]">
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--game-accent)]" aria-hidden="true" />
      <p className="min-w-0 flex-1 font-term text-lg leading-6 text-[var(--game-fg)]">
        <span className="font-pixel text-[0.6rem] text-[var(--game-accent)]">NEXT MOVE: </span>
        {text}
      </p>
      {starter && (
        <Link
          to="/facilities"
          data-next-move-go="starter"
          className="self-center border-2 border-[var(--game-accent)] px-2 py-2 font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)] shadow-[2px_2px_0_0_#000]"
        >
          GO
        </Link>
      )}
      {shown && section && (
        <Link
          to="/"
          data-next-move-go={rowId}
          data-next-move-section={section}
          onClick={() => {
            writePrefs({ gameSection: section });
            focusRowLater(rowId);
          }}
          className="self-center border-2 border-[var(--game-accent)] px-2 py-2 font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)] shadow-[2px_2px_0_0_#000]"
        >
          GO
        </Link>
      )}
    </section>
  );
}
