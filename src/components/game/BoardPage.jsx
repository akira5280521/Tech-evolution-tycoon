import { empireFactors, forkCost, singularityMult } from "@/lib/empire";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton, Panel } from "./chrome";
import TokenShop from "./TokenShop";
import { HelpTip } from "./HintSheet";

function pct(factor) {
  return `${Math.round((factor - 1) * 100)}%`;
}

export default function BoardPage() {
  const { state, purchaseShop, forkTimeline } = useGameState();
  const factors = empireFactors(state, Date.now());
  const rows = [
    ["INVESTORS", `+${pct(factors.investors)}`, "investors"],
    ["SINGULARITY", `X${factors.singularity.toFixed(factors.singularity % 1 ? 1 : 0)}`, "singularity"],
    ["ERA MASTERY", `+${pct(factors.mastery)}`, "mastery"],
    ["CHALLENGES WON", `+${pct(factors.challenges)}`, "challenge"],
    ["MEGA-PROJECTS", `+${pct(factors.projects)}`, "projects"],
    ["SPECIALTY", `X${factors.specialty.toFixed(2)}`, "specialty"],
  ];
  const bill = forkCost(state.singularities || 0);
  const ready = (state.investors || 0) >= bill && singularityMult((state.singularities || 0) + 1) > factors.singularity;
  return (
    <ScreenShell title="BOARD" subtitle="Everything that boosts your income for good, and the token shop.">
      <Panel>
        <h2 className="font-pixel text-[0.7rem] text-[var(--game-violet)]">YOUR BONUSES</h2>
        <dl className="mt-3 space-y-2">
          {rows.map(([label, value, term]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-pixel text-[0.55rem]">
              <dt className="flex min-w-0 items-center gap-2 break-words text-[var(--game-muted)]">
                {label} <HelpTip term={term} />
              </dt>
              <dd className={`ml-auto min-w-0 break-all text-right ${label === "INVESTORS" ? "text-[var(--game-success)]" : "text-[var(--game-fg)]"}`}>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 font-term text-lg leading-6">
          All together, every machine earns <span className="text-[var(--game-success)]">X{factors.total.toFixed(2)}</span>.
        </p>
        <p className="mt-1 flex items-center gap-2 font-term text-base leading-5 text-[var(--game-muted)]">
          <span>Income limit: X{factors.ceiling.toFixed(0)}. Forking raises it.</span> <HelpTip term="ceiling" />
        </p>
        <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">
          You have {state.investors || 0} investors. Get more with START OVER on the GAME tab.
        </p>
        <div className="mt-3">
          <GoldButton disabled={!ready} onClick={forkTimeline} dataAttr="fork">
            <span className="font-pixel text-[0.6rem]">{ready ? "FORK THE TIMELINE" : `FORK NEEDS ${bill} INVESTORS`}</span>
          </GoldButton>
          <p className="mt-2 flex items-start gap-2 font-term text-base leading-5 text-[var(--game-muted)]">
            <span>
              A bigger reset. Spend {bill} investors to start your run over and get income x{singularityMult((state.singularities || 0) + 1).toFixed(1)} forever (up to x4), a higher income limit and another research slot. Each fork needs more investors.
            </span>
            <HelpTip term="fork" />
          </p>
        </div>
      </Panel>
      <Panel className="border-[var(--game-accent)]">
        <h2 className="flex items-center gap-2 font-pixel text-[0.7rem] text-[var(--game-accent)]">
          ERA TOKENS <HelpTip term="tokens" />
        </h2>
        <div className="mt-3">
          <TokenShop state={state} onBuy={purchaseShop} />
        </div>
      </Panel>
    </ScreenShell>
  );
}
