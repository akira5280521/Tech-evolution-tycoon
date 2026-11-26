import { contractSpec, readContract } from "@/lib/contracts";
import { money } from "@/lib/gameConfig";
import { incomePerSecond } from "@/lib/empire";

export default function ContractCard({ contract, state, onAccept, onSkip }) {
  const live = readContract(contract);
  if (!live || live.status !== "offered") return null;
  const spec = contractSpec(live.id);
  if (!spec) return null;
  const cash = spec.reward?.cash ? Math.max(100, incomePerSecond(state, Date.now()) * spec.reward.cash) : 0;
  const pay = [
    spec.reward?.tokens ? `+${spec.reward.tokens} era tokens` : null,
    cash ? `${money(cash)} (cash)` : null,
  ].filter(Boolean).join(", ");
  return (
    <div role="dialog" aria-label={spec.title} data-contract={spec.id} className="fixed inset-0 z-40 flex items-center justify-center overscroll-contain bg-black/75 p-4">
      <div className="game-modal flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden border-4 border-[var(--game-violet-border)] bg-[var(--game-card)] p-4 shadow-[6px_6px_0_0_#000]">
        <div className="hint-sheet-body">
          <p className="font-pixel text-[0.55rem] text-[var(--game-violet)]">HISTORICAL CONTRACT</p>
          <h2 data-contract-title className="mt-2 font-pixel text-sm leading-5 text-[var(--game-fg)]">{spec.title}</h2>
          <p data-contract-text className="mt-3 font-term text-lg leading-6">{spec.text}</p>
          {pay ? <p className="mt-3 font-term text-base text-[var(--game-muted)]">Pay: {pay}</p> : null}
        </div>
        <div className="hint-sheet-actions mt-4">
          <button type="button" data-contract-accept onClick={onAccept} className="min-h-12 w-full border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-3 py-2 font-pixel text-[0.6rem] text-[var(--game-fg)]">
            ACCEPT
          </button>
          <button type="button" data-contract-skip onClick={onSkip} className="mt-2 min-h-12 w-full border-2 border-[var(--game-violet-border)] px-3 py-2 font-pixel text-[0.6rem] text-[var(--game-violet)]">
            SKIP — IT COMES BACK LATER
          </button>
        </div>
      </div>
    </div>
  );
}

export function ContractChip({ contract, now = Date.now() }) {
  const live = readContract(contract);
  if (!live || live.status !== "active") return null;
  const spec = contractSpec(live.id);
  if (!spec) return null;
  const remain = Math.max(0, (live.deadlineAt || 0) - now);
  const secs = Math.ceil(remain / 1000);
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, "0");
  const have = Math.min(spec.need, Math.floor(live.progress || 0));
  return (
    <p data-contract-chip={spec.id} className="mt-2 border-2 border-[var(--game-violet-border)] bg-[var(--game-card)] px-2 py-1 font-term text-base leading-5 text-[var(--game-fg)]">
      <span className="font-pixel text-[0.5rem] text-[var(--game-violet)]">{spec.title}</span>
      {" "}{have}/{spec.need} · {mm}:{ss} left
    </p>
  );
}
