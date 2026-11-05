export default function LockedRow({ prevName }) {
  return (
    <div className="flex items-center gap-3 border-2 border-dashed border-[var(--game-border)] bg-[var(--game-bg-deep)] p-3 opacity-80">
      <div className="grid h-16 w-16 shrink-0 place-items-center border-2 border-[var(--game-border)] bg-[var(--game-bg)] font-pixel text-lg text-[var(--game-border-strong)]">
        ?
      </div>
      <div>
        <h3 className="font-pixel text-sm text-[var(--game-dim)]">??? — Next Era Locked</h3>
        <p className="font-term text-base leading-5 text-[var(--game-muted)]">
          Buy a {prevName} to reveal what the future holds.
        </p>
      </div>
    </div>
  );
}