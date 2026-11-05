import { memo } from "react";
import {
  BUSINESSES,
  buyCount,
  costOf,
  milestoneMult,
  money,
  nextMilestone,
  prestigeMult,
} from "@/lib/gameConfig";
import IconTile from "./IconTile";
import ProgressTrack from "./ProgressTrack";

function BusinessRow({ index, state, buyMode, onBuy, onHire, onRun }) {
  const cfg = BUSINESSES[index];
  const st = state.biz[index];
  const count = buyCount(buyMode, cfg, st.owned, state.cash);
  const cost = costOf(cfg, st.owned, count);
  const canBuy = state.cash >= cost;
  const mult = milestoneMult(st.owned);
  const next = nextMilestone(st.owned);
  const cycleSeconds = (cfg.cycleMs / 1000).toFixed(cfg.cycleMs % 1000 ? 1 : 0);
  const canHire = !st.manager && st.owned > 0 && state.cash >= cfg.managerCost;

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-2 border-[var(--game-border)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000] sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <IconTile cfg={cfg} st={st} onRun={() => onRun(index)} />

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="font-pixel text-sm text-[var(--game-fg)]">{cfg.name}</h3>
          <span className="border border-[var(--game-border-strong)] px-1 font-term text-sm leading-5 text-[var(--game-muted)]">
            {cfg.era}
          </span>
          {mult > 1 && (
            <span className="border border-[var(--game-accent)] px-1 font-term text-sm leading-5 text-[var(--game-accent)]">
              ×{mult}
            </span>
          )}
        </div>
        <p className="font-term text-base leading-5 text-[var(--game-muted)]">{cfg.tagline}</p>
        <ProgressTrack cfg={cfg} st={st} />
        <div className="flex flex-wrap justify-between gap-x-3 font-term text-base leading-5 text-[var(--game-muted)]">
          <span>
            {money(cfg.revenue * st.owned * mult * prestigeMult(state.investors))} / {cycleSeconds}s cycle
          </span>
          <span>{next ? `next ×${next.mult} at ${next.owned} owned` : "all milestones earned"}</span>
        </div>
      </div>

      <div className="col-span-2 flex gap-2 sm:col-span-1 sm:w-44 sm:flex-col sm:justify-center">
        <button
          type="button"
          onClick={() => onBuy(index)}
          disabled={!canBuy}
          aria-label={`Buy ${cfg.name}`}
          data-buy={cfg.id}
          className={`min-h-[44px] flex-1 select-none border-2 px-2 py-2 text-center shadow-[3px_3px_0_0_#000] sm:w-full ${
            canBuy
              ? "border-[var(--game-accent)] bg-[var(--game-accent)] text-[var(--game-accent-fg)] hover:bg-[var(--game-accent-hover)]"
              : "cursor-not-allowed border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-dim)]"
          }`}
        >
          <span className="font-pixel text-sm uppercase leading-5">Buy ×{count}</span>
          <span className="mt-1 block font-term text-lg leading-5">{money(cost)}</span>
        </button>

        {st.manager ? (
          <span className="flex-1 border-2 border-[var(--game-success-border)] bg-[var(--game-success-bg)] px-2 py-2 text-center font-term text-base leading-5 text-[var(--game-success)] shadow-[3px_3px_0_0_#000] sm:w-full">
            Auto ✓
            <span className="block text-sm leading-4 text-[var(--game-muted)]">{cfg.managerName}</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onHire(index)}
            disabled={!canHire}
            aria-label={`Hire ${cfg.managerName}`}
            data-hire={cfg.id}
            className={`min-h-[44px] flex-1 select-none border-2 px-2 py-2 text-center font-term text-base leading-5 shadow-[3px_3px_0_0_#000] sm:w-full ${
              canHire
                ? "border-[var(--game-success-border)] bg-[var(--game-success-panel)] text-[var(--game-success)] hover:bg-[var(--game-success-bg-hover)]"
                : "cursor-not-allowed border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-dim)]"
            }`}
          >
            Hire {cfg.managerName}
            <span className="block text-sm leading-4">{money(cfg.managerCost)}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Only re-render when this row's own slice of the game state changes: its
// business record (reference identity), the cash that gates its buy/hire
// buttons, the prestige multiplier, the buy mode, or the action callbacks.
// Idle rows then skip the parent's per-tick re-renders.
function arePropsEqual(prev, next) {
  if (prev.index !== next.index) return false;
  if (prev.buyMode !== next.buyMode) return false;
  if (prev.onBuy !== next.onBuy || prev.onHire !== next.onHire || prev.onRun !== next.onRun) return false;
  if (prev.state.biz[prev.index] !== next.state.biz[next.index]) return false;
  if (prev.state.cash !== next.state.cash) return false;
  if (prev.state.investors !== next.state.investors) return false;
  return true;
}

export default memo(BusinessRow, arePropsEqual);