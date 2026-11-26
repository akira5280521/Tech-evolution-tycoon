// A staged timer's bar (T5 items 61 and 62): what is happening now, time
// left, and how far along. Runs while the app is closed; no skip.
import { formatLeft, stageAt } from "@/lib/stages";

export default function StageBar({ job, title, kind, now = Date.now(), className = "" }) {
  const at = stageAt(job, now);
  const pct = Math.round(at.frac * 100);
  return (
    <div data-stage-bar={kind || job?.kind} data-stage={at.stage} className={className} role="progressbar" aria-label={title || at.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      {title && <p className="font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">{title}</p>}
      <p className="flex justify-between gap-2 font-status text-sm leading-5 text-[var(--game-accent)]">
        <span data-stage-label>{at.label}</span>
        <span data-stage-left className="shrink-0 tabular-nums">{formatLeft(at.leftMs)}</span>
      </p>
      <div className="status-track mt-0.5 h-3 overflow-hidden">
        <div className="status-fill h-full bg-[var(--game-accent)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
