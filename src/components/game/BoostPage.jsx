import { BUSINESSES, money } from "@/lib/gameConfig";
import { isMastered, upgradeOffer, upgradesOf } from "@/lib/empire";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton, Panel } from "./chrome";

export default function BoostPage() {
  const { state, purchaseUpgrade } = useGameState();
  return (
    <ScreenShell title="UPGRADES" subtitle="Named boosts for each era - and mastery perks that never reset.">
      {BUSINESSES.map((cfg, index) => {
        const owned = state.biz[index]?.owned || 0;
        if (index > 0 && owned <= 0 && (state.biz[index - 1]?.owned || 0) <= 0) return null;
        const offer = upgradeOffer(index);
        const up = upgradesOf(state, cfg.id);
        const mastered = isMastered(state, index);
        return (
          <Panel key={cfg.id}>
            <div className="flex items-center gap-3">
              <img src={cfg.icon} alt="" className="h-12 w-12 border-2 border-[var(--game-border-strong)] object-cover" />
              <div>
                <h2 className="font-term text-2xl leading-6">{cfg.name}</h2>
                <p className="font-term text-base text-[var(--game-muted)]">{owned} owned · named upgrades below</p>
              </div>
            </div>
            <UpgradeCard piece={offer.rev} owned={owned} bought={up.rev} cash={state.cash} onBuy={() => purchaseUpgrade(index, "rev")} />
            <UpgradeCard piece={offer.spd} owned={owned} bought={up.spd} cash={state.cash} onBuy={() => purchaseUpgrade(index, "spd")} />
            <p className="mt-3 font-term text-base leading-5 text-[var(--game-muted)]">
              ERA MASTERY: {owned >= 200 ? "✓" : "X"} {Math.min(owned, 200)}/200 owned · {up.rev && up.spd ? "✓" : "X"} both upgrades
              {mastered ? " · permanent +5% all" : " → permanent +5% all"}
            </p>
          </Panel>
        );
      })}
    </ScreenShell>
  );
}

function UpgradeCard({ piece, owned, bought, cash, onBuy }) {
  const locked = owned < piece.need;
  const afford = cash >= piece.cost;
  return (
    <div className="mt-3 border-2 border-[var(--game-border)] p-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-pixel text-[0.6rem] leading-5">{piece.name}</h3>
        <span className="shrink-0 border-2 border-[var(--game-accent)] px-1 font-pixel text-[0.5rem] text-[var(--game-accent)]">{piece.badge}</span>
      </div>
      <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">{piece.blurb}</p>
      {bought ? (
        <p className="mt-2 font-pixel text-[0.55rem] text-[var(--game-success)]">OWNED</p>
      ) : locked ? (
        <p className="mt-2 font-term text-lg text-[var(--game-muted)]">NEEDS {piece.need} OWNED - you have {owned}</p>
      ) : (
        <div className="mt-2">
          <GoldButton disabled={!afford} onClick={onBuy} dataAttr={`upgrade-${piece.kind}`}>
            <span className="block font-pixel text-[0.65rem]">BUY</span>
            <span className="font-term text-xl">{money(piece.cost)}</span>
          </GoldButton>
        </div>
      )}
    </div>
  );
}
