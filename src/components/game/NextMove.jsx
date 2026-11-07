import { Lightbulb } from "lucide-react";
import { nextMove } from "@/lib/gameConfig";

export default function NextMove({ state }) {
  return (
    <section data-next-move className="flex gap-3 border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]">
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--game-accent)]" aria-hidden="true" />
      <p className="min-w-0 font-term text-lg leading-6 text-[var(--game-fg)]">
        <span className="font-pixel text-[0.6rem] text-[var(--game-accent)]">NEXT MOVE: </span>
        {nextMove(state)}
      </p>
    </section>
  );
}
