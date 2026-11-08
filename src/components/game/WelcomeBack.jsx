import { money } from "@/lib/gameConfig";

function awayLabel(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 1) return `${h}h ${m}m`;
  if (m >= 1) return `${m} min`;
  return "a moment";
}

export default function WelcomeBack({ report, onDismiss }) {
  if (!report) return null;
  return (
    <div
      role="dialog"
      aria-label="Offline earnings"
      className="fixed inset-0 z-40 flex items-center justify-center overscroll-contain bg-black/70 p-4"
    >
      <div className="game-modal w-full max-w-md border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-5 shadow-[6px_6px_0_0_#000]">
        <h2 className="title-glow font-pixel text-sm text-[var(--game-accent)]">WELCOME BACK!</h2>
        <p className="mt-3 font-term text-lg leading-6 text-[var(--game-fg)]">
          You were away for {awayLabel(report.awayMs)}. Your hired crew kept the machines running
          and generated
        </p>
        <p data-offline-total className="mt-1 font-pixel text-base leading-7 text-[var(--game-success)]">
          {money(report.amount)}
        </p>
        {report.rows.length > 0 && (
          <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto border-2 border-[var(--game-border)] bg-[var(--game-bg)] p-2 font-term text-base leading-5 text-[var(--game-muted)]">
            {report.rows.map((row) => (
              <li key={row.name} className="flex items-baseline justify-between gap-2">
                <span>{row.name}</span>
                <span className="text-[var(--game-success)]">+{money(row.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onDismiss}
          data-offline-collect
          className="mt-4 w-full select-none border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 py-2 font-pixel text-sm uppercase text-[var(--game-accent-fg)] shadow-[3px_3px_0_0_#000] hover:bg-[var(--game-accent-hover)]"
        >
          Collect
        </button>
      </div>
    </div>
  );
}