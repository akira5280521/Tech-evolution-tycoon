// The next era, still hidden ("???") until the player owns enough of the
// one before it.
export default function LockedRow({ prevName, have, need }) {
  const pct = Math.max(0, Math.min(100, (have / need) * 100));
  return (
    <div data-locked-era className="flex items-center gap-3 border-2 border-dashed border-[var(--game-border)] bg-[var(--game-bg-deep)] p-3 opacity-80">
      <div className="grid h-16 w-16 shrink-0 place-items-center border-2 border-[var(--game-border)] bg-[var(--game-bg)] font-pixel text-lg text-[var(--game-border-strong)]">
        ?
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-pixel text-sm text-[var(--game-dim)]">??? — NEXT ERA LOCKED</h3>
        <p className="font-term text-base leading-5 text-[var(--game-muted)]">
          Own {need} {prevName} to open it: {Math.min(have, need)}/{need}.
        </p>
        <div className="mt-1 h-3 border-2 border-[var(--game-border)] bg-[var(--game-bg)]" aria-hidden="true">
          <div className="h-full bg-[var(--game-dim)]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
