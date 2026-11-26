import { money } from "@/lib/gameConfig";
import { fullMoney } from "@/lib/fullNumber";
import { awayCap, awayLabel, binsLine } from "@/lib/awayReport";

const cap = (s) => `${s[0].toUpperCase()}${s.slice(1)}`;
const rd = (n) => (n >= 100 ? Math.round(n).toLocaleString("en-US") : n.toFixed(1));

// One welcome-back summary (T4 items 36, 47, 42): what you made, business by
// business with room to read it, why it was less, and how long away counts.
export default function WelcomeBack({ report, onDismiss, state }) {
  if (!report) return null;
  const bins = binsLine(report.full);
  const { capMs, capped, next } = awayCap(state, report.rawAwayMs ?? report.awayMs);
  return (
    <div
      role="dialog"
      aria-label="Offline earnings"
      className="fixed inset-0 z-40 flex items-center justify-center overscroll-contain bg-black/70 p-4"
    >
      <div data-welcome-card className="game-modal flex max-h-[90vh] w-full max-w-md flex-col border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-4 shadow-[6px_6px_0_0_#000] sm:p-5">
        <h2 className="title-glow font-pixel text-sm text-[var(--game-accent)]">WELCOME BACK!</h2>
        <p className="mt-3 font-term text-lg leading-6 text-[var(--game-fg)]">
          You were away for {awayLabel(report.rawAwayMs ?? report.awayMs)}. Your managers kept the businesses running at half speed and made
        </p>
        <p data-offline-total data-exact={fullMoney(report.amount)} className="mt-1 font-pixel text-base leading-7 text-[var(--game-success)]">
          {money(report.amount)}
        </p>
        {report.data > 0 && (
          <p data-offline-rd className="font-term text-base leading-5 text-[var(--game-accent)]">+{rd(report.data)} R&amp;D points</p>
        )}
        {report.rows.length > 0 && (
          <ul data-offline-rows className="mt-3 min-h-[7rem] flex-1 space-y-1 overflow-y-auto border-2 border-[var(--game-border)] bg-[var(--game-bg)] p-2 font-term text-base leading-5 text-[var(--game-muted)]">
            {report.rows.map((row) => (
              <li key={row.name} className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate">{row.name}</span>
                <span data-exact={`+${fullMoney(row.amount)}`} className="shrink-0 text-[var(--game-success)]">+{money(row.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        {(report.short?.length > 0 || bins) && (
          // Why the total is less than income x time: a material ran short
          // (its users paid only for what they got) or bins were FULL.
          <ul data-offline-why className="mt-2 shrink-0 space-y-1 font-term text-base leading-5 text-[var(--game-muted)]">
            {(report.short || []).map((s) => (
              <li key={`short-${s.key}`} data-offline-short={s.key} className="text-[var(--game-danger)]">
                {cap(s.key)} ran short for {awayLabel(s.ms)}{s.rows?.length ? `: ${s.rows.join(" and ")} paid less` : ""}.
              </li>
            ))}
            {bins && <li data-offline-bins>{bins}</li>}
          </ul>
        )}
        <p data-offline-cap className="mt-2 shrink-0 font-term text-sm leading-5 text-[var(--game-muted)]">
          {capped ? `Away time pays for up to ${Math.round(capMs / 3600e3)}h, and you hit it.` : `Away time pays for up to ${Math.round(capMs / 3600e3)}h.`}
          {next ? ` ${next.title} (${next.at.toLocaleString("en-US")} investors) raises it.` : ""}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          data-offline-collect
          className="mt-3 min-h-12 w-full shrink-0 select-none border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 py-2 font-pixel text-sm uppercase text-[var(--game-accent-fg)] shadow-[3px_3px_0_0_#000] hover:bg-[var(--game-accent-hover)]"
        >
          Collect
        </button>
      </div>
    </div>
  );
}
