import { empireFactors, forkCost, singularityMult } from "@/lib/empire";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton, Panel } from "./chrome";
import TokenShop from "./TokenShop";

function pct(factor) {
  return `${Math.round((factor - 1) * 100)}%`;
}

export default function BoardPage() {
  const { state, purchaseShop, forkTimeline } = useGameState();
  const factors = empireFactors(state, Date.now());
  const rows = [
    ["INVESTORS", `+${pct(factors.investors)}`],
    ["SINGULARITIES", `X${factors.singularity.toFixed(factors.singularity % 1 ? 1 : 0)}`],
    ["ERA MASTERY", `+${pct(factors.mastery)}`],
    ["CHALLENGE REWARDS", `+${pct(factors.challenges)}`],
    ["MEGA-PROJECTS", `+${pct(factors.projects)}`],
    ["RESEARCH", `X${factors.specialty.toFixed(2)}`],
  ];
  const bill = forkCost(state.singularities || 0);
  const ready = (state.investors || 0) >= bill && singularityMult((state.singularities || 0) + 1) > factors.singularity;
  return (
    <ScreenShell title="INVESTORS" subtitle="Bank investors for +5% each, or spend them on targeted power.">
      <Panel>
        <h2 className="font-pixel text-[0.7rem] text-[var(--game-violet)]">EMPIRE BONUSES</h2>
        <dl className="mt-3 space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-pixel text-[0.55rem]">
              <dt className="min-w-0 break-words text-[var(--game-muted)]">{label}</dt>
              <dd className={`ml-auto min-w-0 break-all text-right ${label === "INVESTORS" ? "text-[var(--game-success)]" : "text-[var(--game-fg)]"}`}>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 font-term text-lg leading-6">
          Total revenue <span className="text-[var(--game-success)]">X{factors.total.toFixed(2)}</span> in every era, multiplied with each other.
          The soft ceiling is X{factors.ceiling.toFixed(1)} and it rises with each fork.
        </p>
        <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">
          Your board: {state.investors || 0} investors. Recruit more with PRESTIGE on the GAME tab.
        </p>
        <div className="mt-3">
          <GoldButton disabled={!ready} onClick={forkTimeline} dataAttr="fork">
            <span className="font-pixel text-[0.6rem]">{ready ? "FORK THE TIMELINE" : `FORK NEEDS ${bill} INVESTORS`}</span>
          </GoldButton>
          <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">
            Spending {bill} investors resets the machines and the cash upgrades, and adds one singularity point, max x4. Each fork costs more than the last, and the income ceiling rises with them. Research and tokens stay. Another specialty slot opens.
          </p>
        </div>
      </Panel>
      <Panel className="border-[var(--game-accent)]">
        <h2 className="font-pixel text-[0.7rem] text-[var(--game-accent)]">ERA TOKENS</h2>
        <div className="mt-3">
          <TokenShop state={state} onBuy={purchaseShop} />
        </div>
      </Panel>
    </ScreenShell>
  );
}
