import { count, money } from "@/lib/gameConfig";

// Shown once, after the first prestige: what the player gained, what they
// kept, and what to aim for next.
export default function PrestigeReport({ report, onDismiss }) {
  if (!report) return null;
  return (
    <div role="dialog" aria-label="Your first prestige" className="fixed inset-0 z-40 flex items-center justify-center overscroll-contain bg-black/70 p-4">
      <div data-prestige-report className="game-modal flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto border-4 border-[var(--game-violet)] bg-[var(--game-card)] p-4 shadow-[6px_6px_0_0_#000] sm:p-5">
        <h2 className="title-glow font-pixel text-sm text-[var(--game-violet)]">YOUR FIRST PRESTIGE</h2>
        <p className="mt-3 font-term text-lg leading-6">
          {report.gained} {report.gained === 1 ? "investor" : "investors"} joined your board. Every business now earns
        </p>
        <p className="mt-1 font-pixel text-base leading-7 text-[var(--game-success)]">
          ×{report.incomeBefore.toFixed(2)} → ×{report.incomeAfter.toFixed(2)}
        </p>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          {report.incomeAfter / Math.max(1e-9, report.incomeBefore) >= 2
            ? "so this run will go much faster than the first."
            : "so this run goes a little faster. Each prestige adds more, and waiting longer before the next one brings more investors."}
        </p>

        <h3 className="mt-3 font-pixel text-[0.55rem] text-[var(--game-fg)]">YOU KEPT</h3>
        <p className="font-term text-base leading-5 text-[var(--game-muted)]">
          Investors, research data and picks, era tokens, badges, Museum cards, the Foreman, and challenge and project rewards.
        </p>
        <h3 className="mt-2 font-pixel text-[0.55rem] text-[var(--game-fg)]">STARTED OVER</h3>
        <p className="font-term text-base leading-5 text-[var(--game-muted)]">
          Cash, businesses, managers and upgrades. Rebuy them: they cost the same, but you earn more now.
        </p>

        {report.unlocked.length > 0 && (
          <>
            <h3 className="mt-2 font-pixel text-[0.55rem] text-[var(--game-success)]">UNLOCKED</h3>
            <ul className="space-y-1">
              {report.unlocked.map((u) => (
                <li key={u.title} className="font-term text-base leading-5">
                  <span className="text-[var(--game-success)]">{u.title}:</span> {u.text}
                </li>
              ))}
            </ul>
          </>
        )}
        {report.nextUnlock && (
          <p className="mt-2 font-term text-base leading-5 text-[var(--game-violet)]">
            Next investor milestone at {count(report.nextUnlock.at)} investors (BOARD tab).
          </p>
        )}
        <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">
          Challenges are open now on the RUNS tab. Prestige again when the button glows: that's when it would at least double your investors.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          data-prestige-report-ok
          className="mt-4 min-h-11 w-full shrink-0 select-none border-2 border-[var(--game-violet)] bg-[var(--game-violet-bg)] px-3 py-2 font-pixel text-sm uppercase text-[var(--game-violet)] shadow-[3px_3px_0_0_#000]"
        >
          Let's go
        </button>
      </div>
    </div>
  );
}
