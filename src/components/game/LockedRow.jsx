import { useNavigate } from "@tanstack/react-router";
import { eraNeeds, money } from "@/lib/gameConfig";
import { ItemHelp } from "./HintSheet";

// The next era, still hidden ("???") until every need is met: owning enough
// of the one before it, and earning enough this run. Each need shows its
// progress.
export default function LockedRow({ index, id, state }) {
  const needs = eraNeeds(state, index);
  const navigate = useNavigate();
  return (
    <div data-locked-era data-help-scope className="flex items-center gap-3 border-2 border-dashed border-[var(--game-border)] bg-[var(--game-bg-deep)] p-3 opacity-80">
      <div className="grid h-16 w-16 shrink-0 place-items-center border-2 border-[var(--game-border)] bg-[var(--game-bg)] font-pixel text-lg text-[var(--game-border-strong)]">
        ?
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-pixel text-sm text-[var(--game-dim)]">??? — NEXT ERA LOCKED</h3>
          {id && <ItemHelp kind="locked-era" id={id} state={state} name="the next era" className="-mr-2 -mt-2.5" />}
        </div>
        {needs.map((n) => {
          const pct = Math.max(0, Math.min(100, (n.have / n.need) * 100));
          const progress = n.kind === "earn" ? money(Math.min(n.have, n.need)) : n.kind === "research" ? (n.met ? "done" : "not done") : `${Math.min(n.have, n.need)}/${n.need}`;
          if (n.kind === "research") {
            return (
              <div key={n.kind} data-era-need={n.kind} data-met={n.met ? "1" : "0"} className="mt-1">
                <p className={`break-words font-term text-base leading-5 ${n.met ? "text-[var(--game-accent)]" : "text-[var(--game-muted)]"}`}>
                  {n.met ? "✓ " : ""}
                  {n.label} ({progress})
                </p>
                {!n.met && (
                  <button
                    type="button"
                    data-era-research={n.research}
                    onClick={() => navigate({ to: "/tech", hash: n.research })}
                    className="mt-1 min-h-11 border-2 border-[var(--game-accent)] px-3 font-pixel text-[0.5rem] text-[var(--game-accent)] shadow-[3px_3px_0_0_#000]"
                  >
                    GO TO TECH
                  </button>
                )}
              </div>
            );
          }
          return (
            <div key={n.kind} data-era-need={n.kind} data-met={n.met ? "1" : "0"} className="mt-1">
              <p className={`break-words font-term text-base leading-5 ${n.met ? "text-[var(--game-accent)]" : "text-[var(--game-muted)]"}`}>
                {n.met ? "✓ " : ""}
                {n.label} ({progress})
              </p>
              <div className="mt-0.5 h-3 border-2 border-[var(--game-border)] bg-[var(--game-bg)]" aria-hidden="true">
                <div className={`h-full ${n.met ? "bg-[var(--game-accent)]" : "bg-[var(--game-dim)]"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
