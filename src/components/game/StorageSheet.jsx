import { useState } from "react";
import { MARKET_LOT, STORAGE_STEP, SWAP_FEE, materialPrice, refineAmount, refiningOpen, storageCost, storageLevel, supplyCap, swapQuote } from "@/lib/empire";
import { REFINED, REFINE_MS, REFINE_RATIO, SUPPLY_KEYS, fmt, money } from "@/lib/gameConfig";

// Whole numbers up to a million read best with commas: "840 / 1,000".
export function amount(n) {
  const v = Math.floor(n || 0);
  return v < 1e6 ? v.toLocaleString("en-US") : fmt(v);
}

// One material's bins: how full they are and the next bigger size.
// The refined grade made from a raw material, if any.
function refinedOf(key) {
  if (REFINED[key]) return key;
  return Object.keys(REFINED).find((k) => REFINED[k].from === key) || null;
}

export default function StorageSheet({ state, materialKey, onUpgrade, onRefine, onSell, onSwap, shown = SUPPLY_KEYS, onClose }) {
  const have = state.supply?.[materialKey] || 0;
  const cap = supplyCap(state, materialKey);
  const full = have >= cap;
  const level = storageLevel(state, materialKey);
  const cost = storageCost(state, materialKey);
  const nextCap = supplyCap(state, materialKey, level + 1);
  const afford = cost != null && state.cash >= cost;
  const pct = Math.min(100, cap > 0 ? (have / cap) * 100 : 0);
  return (
    <div
      role="dialog"
      aria-label={`${materialKey} storage`}
      data-storage-sheet={materialKey}
      className="hint-sheet fixed z-40 mx-auto max-w-md border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-3 shadow-[6px_6px_0_0_#000]"
    >
      <div className="hint-sheet-body">
      <div className="flex items-baseline gap-2">
        <h2 className="font-pixel text-[0.6rem] uppercase text-[var(--game-accent)]">{REFINED[materialKey]?.short || materialKey} storage</h2>
        {full && <span data-full className="border-2 border-[var(--game-danger)] px-1 font-pixel text-[0.45rem] text-[var(--game-danger)]">FULL</span>}
      </div>
      <p data-storage-count className="mt-1 font-term text-xl leading-6 text-[var(--game-fg)]">
        {amount(have)} / {amount(cap)}
      </p>
      <div className="mt-1 h-3 border-2 border-[var(--game-border)] bg-black">
        <div className={`h-full ${full ? "bg-[var(--game-danger)]" : "bg-[var(--game-accent)]"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 break-words font-term text-lg leading-6 text-[var(--game-muted)]">
        {full
          ? "The bins are full: new output is lost until rows use some. What's stored is never thrown away."
          : "New output past the cap is lost. Bigger bins keep more for the rows that need it, and stay through prestige."}
      </p>
      {refiningOpen(state) && refinedOf(materialKey) && <RefinePanel state={state} grade={refinedOf(materialKey)} onRefine={onRefine} />}
      <MarketPanel state={state} materialKey={materialKey} shown={shown} onSell={onSell} onSwap={onSwap} />
      </div>
      <div className="hint-sheet-actions mt-2 flex flex-wrap items-center justify-end gap-2">
        {cost != null ? (
          <button
            type="button"
            data-storage-upgrade
            disabled={!afford}
            onClick={() => onUpgrade(materialKey)}
            className="min-h-12 border-2 border-[var(--game-accent)] px-3 font-pixel text-[0.5rem] text-[var(--game-accent)] shadow-[3px_3px_0_0_#000] disabled:border-[var(--game-border)] disabled:text-[var(--game-dim)]"
          >
            BINS ×{STORAGE_STEP} · {money(cost)}
            <span className="block font-term text-base leading-5">holds {amount(nextCap)}</span>
          </button>
        ) : (
          <span className="font-pixel text-[0.45rem] text-[var(--game-muted)]">LARGEST BINS</span>
        )}
        <button type="button" data-storage-close onClick={onClose} className="min-h-12 border-2 border-[var(--game-border-strong)] px-3 font-pixel text-[0.5rem] text-[var(--game-fg)] shadow-[3px_3px_0_0_#000]">
          CLOSE
        </button>
      </div>
    </div>
  );
}

// The refinery: ten of the raw material make one of the refined grade, a
// batch at a time.
function RefinePanel({ state, grade, onRefine }) {
  const spec = REFINED[grade];
  const job = state.refineJob;
  const can = refineAmount(state, grade);
  const left = job ? Math.max(0, Math.ceil((job.readyAt - Date.now()) / 1000)) : 0;
  return (
    <div data-refine={grade} className="mt-2 border-2 border-[var(--game-border)] p-2">
      <p className="break-words font-term text-lg leading-6 text-[var(--game-fg)]">
        Refinery: {REFINE_RATIO} {spec.from} make 1 {spec.name}. Late research needs it.
      </p>
      {job ? (
        <p data-refine-running className="font-term text-lg leading-6 text-[var(--game-accent)]">
          Refining {job.amount} {REFINED[job.id]?.short || job.id}: {left}s left
        </p>
      ) : (
        <button
          type="button"
          data-refine-start={grade}
          disabled={!(can > 0)}
          onClick={() => onRefine?.(grade)}
          className="mt-1 min-h-12 w-full border-2 border-[var(--game-accent)] px-3 font-pixel text-[0.5rem] text-[var(--game-accent)] shadow-[3px_3px_0_0_#000] disabled:border-[var(--game-border)] disabled:text-[var(--game-dim)]"
        >
          {can > 0 ? `REFINE ${can} · ${Math.round(REFINE_MS / 1000)}s` : `NEED ${REFINE_RATIO} ${spec.from.toUpperCase()} PER UNIT`}
          <span className="block font-term text-base leading-5">uses {(can * REFINE_RATIO).toLocaleString("en-US")} {spec.from}</span>
        </button>
      )}
    </div>
  );
}

// Sell spare stock for a little cash, or swap it for another material.
function MarketPanel({ state, materialKey, shown, onSell, onSwap }) {
  const others = shown.filter((k) => k !== materialKey);
  const [target, setTarget] = useState(others[0] || null);
  const now = Date.now();
  const price = materialPrice(materialKey, now);
  const have = Math.floor(state.supply?.[materialKey] || 0);
  const lot = Math.min(MARKET_LOT, have);
  const quote = target ? swapQuote(state, materialKey, target, MARKET_LOT, now) : { give: 0, get: 0 };
  const name = (k) => REFINED[k]?.short || k;
  return (
    <div data-market={materialKey} className="mt-2 border-2 border-[var(--game-border)] p-2">
      <p className="font-term text-lg leading-6 text-[var(--game-fg)]">
        Market: {money(price)} each today. Prices drift slowly.
      </p>
      <button
        type="button"
        data-sell={materialKey}
        disabled={!(lot > 0)}
        onClick={() => onSell?.(materialKey, MARKET_LOT)}
        className="mt-1 min-h-12 w-full border-2 border-[var(--game-accent)] px-3 font-pixel text-[0.5rem] text-[var(--game-accent)] shadow-[3px_3px_0_0_#000] disabled:border-[var(--game-border)] disabled:text-[var(--game-dim)]"
      >
        SELL {lot} · {money(lot * price)}
      </button>
      {others.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 font-pixel text-[0.45rem] text-[var(--game-muted)]">
            SWAP FOR
            <select
              data-swap-target
              value={target || ""}
              onChange={(e) => setTarget(e.target.value)}
              className="min-h-12 min-w-0 flex-1 border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] px-2 font-term text-lg text-[var(--game-fg)]"
            >
              {others.map((k) => (
                <option key={k} value={k}>
                  {name(k)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            data-swap={materialKey}
            disabled={!(quote.get > 0)}
            onClick={() => onSwap?.(materialKey, target, MARKET_LOT)}
            className="min-h-12 w-full border-2 border-[var(--game-accent)] px-3 font-pixel text-[0.5rem] text-[var(--game-accent)] shadow-[3px_3px_0_0_#000] disabled:border-[var(--game-border)] disabled:text-[var(--game-dim)]"
          >
            {quote.get > 0 ? `SWAP ${quote.give} FOR ${quote.get} ${name(target).toUpperCase()}` : "NOT ENOUGH TO SWAP"}
            <span className="block font-term text-base leading-5">a {Math.round(SWAP_FEE * 100)}% fee</span>
          </button>
        </div>
      )}
    </div>
  );
}
