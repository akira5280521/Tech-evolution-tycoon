import { BUSINESSES, UPGRADE_MS, eraOpen, money } from "@/lib/gameConfig";
import { isMastered, masteryNeed, upgradeOffer, upgradesOf } from "@/lib/empire";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton, Panel } from "./chrome";
import { HelpTip } from "./HintSheet";

export default function BoostPage() {
  const { state, purchaseUpgrade } = useGameState();
  return (
    <ScreenShell title="UPGRADES" subtitle="Make machines pay more or run faster. Bought again after each prestige.">
      {BUSINESSES.map((cfg, index) => {
        const owned = state.biz[index]?.owned || 0;
        if (!eraOpen(state, index)) return null;
        const offer = upgradeOffer(index);
        const up = upgradesOf(state, cfg.id);
        const mastered = isMastered(state, index);
        if (owned <= 0) {
          // The next era: show that it exists, keep its upgrades a surprise.
          return (
            <Panel key={cfg.id}>
              <div data-boost-locked={cfg.id} className="flex items-center gap-3 opacity-60">
                <img src={cfg.icon} alt="" className="pixel-art h-[64px] w-[64px] shrink-0 border-2 border-[var(--game-border-strong)] object-contain grayscale" />
                <div className="min-w-0">
                  <h2 className="break-words font-term text-2xl leading-6">{cfg.name}</h2>
                  <p className="font-term text-base leading-5 text-[var(--game-muted)]">Buy your first {cfg.name} to see its upgrades.</p>
                </div>
              </div>
            </Panel>
          );
        }
        return (
          <Panel key={cfg.id}>
            <div className="flex items-center gap-3">
              <img src={cfg.icon} alt="" className="pixel-art h-[64px] w-[64px] shrink-0 border-2 border-[var(--game-border-strong)] object-contain" />
              <div className="min-w-0">
                <h2 className="break-words font-term text-2xl leading-6">{cfg.name}</h2>
                <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">{owned} owned</p>
              </div>
            </div>
            <UpgradeCard piece={offer.rev} owned={owned} bought={up.rev} cash={state.cash} job={state.upgradeJob} index={index} onBuy={() => purchaseUpgrade(index, "rev")} />
            <UpgradeCard piece={offer.spd} owned={owned} bought={up.spd} cash={state.cash} job={state.upgradeJob} index={index} onBuy={() => purchaseUpgrade(index, "spd")} />
            <p className="mt-3 flex items-start gap-2 break-words font-term text-base leading-5 text-[var(--game-muted)]">
              <span>
                ERA MASTERY: {owned >= masteryNeed(index) ? "✓" : "X"} {Math.min(owned, masteryNeed(index))}/{masteryNeed(index)} owned · {up.rev && up.spd ? "✓" : "X"} both upgrades
                {mastered ? " · +5% to all income this run" : " → +5% to all income this run"}
              </span>
              <HelpTip term="mastery" />
            </p>
          </Panel>
        );
      })}
    </ScreenShell>
  );
}

function UpgradeCard({ piece, owned, bought, cash, onBuy, job, index }) {
  const locked = owned < piece.need;
  const afford = cash >= piece.cost;
  const installing = job && job.index === index && job.kind === piece.kind;
  const pct = installing ? Math.max(0, Math.min(100, ((Date.now() - job.startedAt) / UPGRADE_MS) * 100)) : 0;
  const busy = job && !installing;
  if (locked && !bought) {
    // Not unlocked yet: greyed out, name and effect stay hidden.
    return (
      <div data-upgrade-locked={piece.kind} className="mt-3 border-2 border-dashed border-[var(--game-border)] p-3 opacity-60">
        <h3 className="font-pixel text-[0.6rem] leading-5 text-[var(--game-dim)]">???</h3>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          Unlocks at {piece.need} owned · you have {owned}
        </p>
      </div>
    );
  }
  return (
    <div className="mt-3 border-2 border-[var(--game-border)] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 break-words font-pixel text-[0.6rem] leading-5">{piece.name}</h3>
        <span className="shrink-0 border-2 border-[var(--game-accent)] px-1 font-pixel text-[0.5rem] text-[var(--game-accent)]">{piece.badge}</span>
      </div>
      <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">{piece.blurb}</p>
      {bought ? (
        <p className="mt-2 font-pixel text-[0.55rem] text-[var(--game-success)]">OWNED</p>
      ) : installing ? (
        <div className="mt-2">
          <p className="font-pixel text-[0.55rem] text-[var(--game-accent)]">INSTALLING (12 SECONDS)</p>
          <div className="mt-2 h-5 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]">
            <div className="h-full bg-[var(--game-accent)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <GoldButton disabled={!afford || busy} onClick={onBuy} dataAttr={`upgrade-${piece.kind}`}>
            <span className="block font-pixel text-[0.65rem]">BUY</span>
            <span className="font-term text-xl">{money(piece.cost)}</span>
          </GoldButton>
        </div>
      )}
    </div>
  );
}
