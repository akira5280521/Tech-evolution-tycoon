import { SHOP, incomePerSecond, pettyCost, shopQuote } from "@/lib/empire";
import { money } from "@/lib/gameConfig";
import { GoldButton, Panel } from "./chrome";

export default function TokenShop({ state, onBuy }) {
  return (
    <div className="space-y-2" data-token-shop>
      <p className="font-term text-lg leading-6 text-[var(--game-fg)]">
        <span data-tokens className="text-[var(--game-accent)]">{Math.floor(state.tokens || 0)} tokens</span> to spend
        below - earned from milestones, new eras, finished projects, won challenge runs and the daily crate.
      </p>
      {SHOP.map((item) => {
        const quote = shopQuote(state, item.id);
        const cost = item.id === "petty" ? pettyCost(state) : item.cost;
        return (
          <div key={item.id} className="border-2 border-[var(--game-border)] bg-[var(--game-bg-deep)] p-3">
            <p className="font-pixel text-[0.6rem] text-[var(--game-fg)]">{item.name}</p>
            <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">{item.blurb}</p>
            <div className="mt-2">
              <GoldButton disabled={!quote.ok} onClick={() => onBuy(item.id)} dataAttr={item.id}>
                <span className="font-pixel text-[0.6rem]">{quote.ok ? (cost === 0 ? "OPEN" : `BUY · ${cost} TOKENS`) : "LOCKED"}</span>
                {!quote.ok && <span className="mt-1 block font-term text-base">{quote.reason}</span>}
              </GoldButton>
            </div>
          </div>
        );
      })}
      <p className="font-term text-base text-[var(--game-muted)]">
        Petty cash pays {money(Math.max(100, incomePerSecond(state, Date.now()) * 30))} right now.
      </p>
    </div>
  );
}
