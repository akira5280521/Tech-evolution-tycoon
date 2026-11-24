import { useNavigate } from "@tanstack/react-router";
import { eraCanOpen, eraNeeds, money } from "@/lib/gameConfig";
import { HISTORY_PACE_MS, calendarYear } from "@/lib/calendar";
import { ERA_YEAR } from "@/lib/eraYear";
import { ItemHelp } from "./HintSheet";

// The next era, still hidden ("???") until every need is met: owning enough
// of the one before it, and earning enough this run. Each need shows its
// progress.
export default function LockedRow({ index, id, state, onOpen }) {
  const needs = eraNeeds(state, index);
  const navigate = useNavigate();
  // The run calendar against the real year this era arrived.
  const cal = id && HISTORY_PACE_MS[id] != null ? calendarYear(state, Date.now()) : null;
  const real = id ? ERA_YEAR[id] : null;
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
        {cal != null && real != null && (
          <p data-calendar={cal} className={`h-5 truncate whitespace-nowrap font-term text-base leading-5 tabular-nums ${cal <= real ? "text-[var(--game-success)]" : "text-[var(--game-muted)]"}`}>
            Calendar {cal} · history got here in {real}
          </p>
        )}
        {needs.map((n) => {
          const pct = Math.max(0, Math.min(100, (n.have / n.need) * 100));
          if (n.kind === "material") {
            const pct = Math.max(0, Math.min(100, (n.have / n.need) * 100));
            return (
              <div key={n.kind} data-era-need={n.kind} data-met={n.met ? "1" : "0"} className="mt-1">
                <p className={`break-words font-term text-base leading-5 ${n.met ? "text-[var(--game-accent)]" : "text-[var(--game-muted)]"}`}>
                  {n.met ? "✓ " : ""}
                  {n.label}
                  {n.paid ? "" : ` (${Math.floor(Math.min(n.have, n.need)).toLocaleString("en-US")}/${n.need.toLocaleString("en-US")})`}
                </p>
                {!n.paid && (
                  <div className="mt-0.5 h-3 border-2 border-[var(--game-border)] bg-[var(--game-bg)]" aria-hidden="true">
                    <div className={`h-full ${n.met ? "bg-[var(--game-accent)]" : "bg-[var(--game-dim)]"}`} style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            );
          }
          const progress = n.kind === "research" ? (n.met ? "done" : "not done") : `${Math.min(n.have, n.need)}/${n.need}`;
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
          if (n.kind === "earn") {
            // The run's earnings live here now (the CASH box shows only cash
            // and income): one fixed-height line with tabular figures.
            return (
              <div key={n.kind} data-era-need={n.kind} data-met={n.met ? "1" : "0"} className="mt-1">
                <p className={`truncate whitespace-nowrap font-term text-base leading-5 ${n.met ? "text-[var(--game-accent)]" : "text-[var(--game-muted)]"}`}>
                  {n.met ? "✓ " : ""}
                  {n.label}
                </p>
                <p data-era-earned className="h-5 truncate whitespace-nowrap font-term text-base leading-5 tabular-nums text-[var(--game-muted)]">
                  {money(Math.min(n.have, n.need))} of {money(n.need)} earned this run
                </p>
                <div className="mt-0.5 h-3 border-2 border-[var(--game-border)] bg-[var(--game-bg)]" aria-hidden="true">
                  <div className={`h-full ${n.met ? "bg-[var(--game-accent)]" : "bg-[var(--game-dim)]"}`} style={{ width: `${pct}%` }} />
                </div>
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
        {eraCanOpen(state, index) && (
          <button
            type="button"
            data-open-era={id}
            onClick={() => onOpen?.(index)}
            className="mt-2 min-h-11 w-full border-2 border-[var(--game-accent)] bg-[var(--game-accent-bg)] px-3 font-pixel text-[0.55rem] text-[var(--game-accent)] shadow-[3px_3px_0_0_#000]"
          >
            OPEN ERA
          </button>
        )}
      </div>
    </div>
  );
}
